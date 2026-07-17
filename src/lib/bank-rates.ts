"use client";

import { useEffect, useState } from "react";
import {
  BANK_NAME_TO_SCRAPER_ID,
  type BankScraperId,
} from "@/lib/scrape/bank-ids";
import { supabase } from "@/lib/supabase";

export type BankRateRow = {
  id: BankScraperId | string;
  bankName: string;
  rate: number;
  rpsn: number;
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

export async function fetchBankRates(): Promise<BankRateRow[]> {
  const { data, error } = await supabase
    .from("bank_rates")
    .select(
      "id, bank_name, rate, rpsn, rate_with_insurance, rate_without_insurance, rpsn_with_insurance, rpsn_without_insurance, american_rate_with_insurance, american_rate_without_insurance, american_rpsn_with_insurance, american_rpsn_without_insurance, american_source_url, source_url, updated_at"
    )
    .order("bank_name");

  if (error) {
    console.error("Nepodařilo se načíst bank_rates:", error.message);
    return [];
  }

  if (!data?.length) return [];

  return data
    .map((row) => {
      const rate = toNumber(row.rate);
      const rpsn = toNumber(row.rpsn);
      if (rate == null || rpsn == null) return null;

      return {
        id: row.id as string,
        bankName: String(row.bank_name),
        rate,
        rpsn,
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

export function useBankRates() {
  const [bankRates, setBankRates] = useState<BankRateRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetchBankRates().then((rows) => {
      if (!cancelled) {
        setBankRates(rows);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return { bankRates, loading };
}

export function pickBankRate(
  row: BankRateRow,
  hasInsurance: boolean
): { rate: number; rpsn: number } {
  if (hasInsurance) {
    return {
      rate: row.rateWithInsurance ?? row.rate,
      rpsn: row.rpsnWithInsurance ?? row.rpsn,
    };
  }
  return {
    rate: row.rateWithoutInsurance ?? row.rate,
    rpsn: row.rpsnWithoutInsurance ?? row.rpsn,
  };
}

/** Sazba americké hypotéky; null pokud banka nemá vy-scrapovaná data. */
export function pickAmericanBankRate(
  row: BankRateRow,
  hasInsurance: boolean
): { rate: number; rpsn: number } | null {
  if (hasInsurance) {
    const rate = row.americanRateWithInsurance;
    const rpsn = row.americanRpsnWithInsurance;
    if (rate == null || rpsn == null) return null;
    return { rate, rpsn };
  }
  const rate = row.americanRateWithoutInsurance;
  const rpsn = row.americanRpsnWithoutInsurance;
  if (rate == null || rpsn == null) return null;
  return { rate, rpsn };
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
