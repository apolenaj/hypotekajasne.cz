"use client";

import { useEffect, useState } from "react";
import {
  BANK_NAME_TO_SCRAPER_ID,
  type BankScraperId,
} from "@/lib/scrape/bank-ids";
import { supabase } from "@/lib/supabase";
import {
  RATE_FETCH_RETRIES,
  RATE_FETCH_TIMEOUT_MS,
  RATE_RETRY_DELAY_MS,
  recordRateFetchFailure,
  recordRateFetchSuccess,
  sleep,
  withTimeout,
} from "@/lib/rates/pipeline";
import { bankRateRowToMortgageRateRecord } from "@/lib/rates/normalize";
import type { MortgageRateRecord } from "@/lib/rates/types";
import { isUsableBankOfferStatus } from "@/lib/rates/freshness-policy";

export type BankRateRow = {
  id: BankScraperId | string;
  bankName: string;
  rate: number;
  rpsn: number | null;
  rateWithInsurance: number | null;
  rateWithoutInsurance: number | null;
  rpsnWithInsurance: number | null;
  rpsnWithoutInsurance: number | null;
  americanRateWithInsurance: number | null;
  americanRateWithoutInsurance: number | null;
  americanRpsnWithInsurance: number | null;
  americanRpsnWithoutInsurance: number | null;
  americanSourceUrl: string | null;
  sourceUrl: string | null;
  updatedAt: string | null;
};

function toNumber(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

async function fetchBankRatesOnce(): Promise<BankRateRow[]> {
  const { data, error } = await withTimeout(
    supabase
      .from("bank_rates")
      .select(
        "id, bank_name, rate, rpsn, rate_with_insurance, rate_without_insurance, rpsn_with_insurance, rpsn_without_insurance, american_rate_with_insurance, american_rate_without_insurance, american_rpsn_with_insurance, american_rpsn_without_insurance, american_source_url, source_url, updated_at"
      )
      .order("bank_name")
      .then((r) => r),
    RATE_FETCH_TIMEOUT_MS,
    "bank_rates_list"
  );

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.length) return [];

  return data
    .map((row) => {
      const rate = toNumber(row.rate);
      if (rate == null) return null;

      return {
        id: row.id as string,
        bankName: String(row.bank_name),
        rate,
        rpsn: toNumber(row.rpsn),
        rateWithInsurance: toNumber(row.rate_with_insurance),
        rateWithoutInsurance: toNumber(row.rate_without_insurance),
        rpsnWithInsurance: toNumber(row.rpsn_with_insurance),
        rpsnWithoutInsurance: toNumber(row.rpsn_without_insurance),
        americanRateWithInsurance: toNumber(row.american_rate_with_insurance),
        americanRateWithoutInsurance: toNumber(
          row.american_rate_without_insurance
        ),
        americanRpsnWithInsurance: toNumber(row.american_rpsn_with_insurance),
        americanRpsnWithoutInsurance: toNumber(
          row.american_rpsn_without_insurance
        ),
        americanSourceUrl: row.american_source_url
          ? String(row.american_source_url)
          : null,
        sourceUrl: row.source_url ? String(row.source_url) : null,
        updatedAt: row.updated_at ? String(row.updated_at) : null,
      } satisfies BankRateRow;
    })
    .filter((row): row is BankRateRow => row != null);
}

export async function fetchBankRates(): Promise<BankRateRow[]> {
  let lastError: string | null = null;
  for (let attempt = 0; attempt <= RATE_FETCH_RETRIES; attempt++) {
    try {
      const rows = await fetchBankRatesOnce();
      if (rows.length > 0) {
        recordRateFetchSuccess({
          attempt,
          count: rows.length,
          source: "bank_rates",
        });
      }
      return rows;
    } catch (err) {
      lastError = err instanceof Error ? err.message : "bank_rates_fetch_failed";
      recordRateFetchFailure(lastError, { attempt, source: "bank_rates" });
      if (attempt < RATE_FETCH_RETRIES) {
        await sleep(RATE_RETRY_DELAY_MS * (attempt + 1));
      }
    }
  }
  console.error("Nepodařilo se načíst bank_rates:", lastError);
  return [];
}

export function useBankRates(): {
  bankRates: BankRateRow[];
  loading: boolean;
  error: string | null;
  unavailable: boolean;
} {
  const [bankRates, setBankRates] = useState<BankRateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchBankRates()
      .then((rows) => {
        if (!cancelled) {
          setBankRates(rows);
          setError(rows.length === 0 ? "live_rates_unavailable" : null);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setBankRates([]);
          setError(err instanceof Error ? err.message : "bank_rates_failed");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    bankRates,
    loading,
    error,
    unavailable: !loading && (bankRates.length === 0 || error != null),
  };
}

export function toOfferRecords(
  rows: BankRateRow[],
  hasInsurance: boolean,
  nowMs?: number
): MortgageRateRecord[] {
  return rows
    .map((r) =>
      bankRateRowToMortgageRateRecord(r, { hasInsurance, nowMs })
    )
    .filter((r) => isUsableBankOfferStatus(r.status) && r.rate != null);
}

export function pickBankRate(
  row: BankRateRow,
  hasInsurance: boolean
): { rate: number; rpsn: number | null } | null {
  if (hasInsurance) {
    const rate = row.rateWithInsurance ?? row.rate;
    if (rate == null) return null;
    return {
      rate,
      rpsn: row.rpsnWithInsurance ?? row.rpsn,
    };
  }
  if (row.rateWithoutInsurance == null) return null;
  return {
    rate: row.rateWithoutInsurance,
    rpsn: row.rpsnWithoutInsurance,
  };
}

/** Sazba americké hypotéky; null pokud banka nemá vy-scrapovaná data. */
export function pickAmericanBankRate(
  row: BankRateRow,
  hasInsurance: boolean
): { rate: number; rpsn: number | null } | null {
  if (hasInsurance) {
    const rate = row.americanRateWithInsurance;
    if (rate == null) return null;
    return { rate, rpsn: row.americanRpsnWithInsurance };
  }
  const rate = row.americanRateWithoutInsurance;
  if (rate == null) return null;
  return { rate, rpsn: row.americanRpsnWithoutInsurance };
}

export function findBankRate(
  bankRates: BankRateRow[],
  bankName: string
): BankRateRow | undefined {
  const byName = bankRates.find((r) => r.bankName === bankName);
  if (byName) return byName;

  const scraperId = BANK_NAME_TO_SCRAPER_ID[bankName];
  if (!scraperId) return undefined;
  return bankRates.find((r) => r.id === scraperId);
}
