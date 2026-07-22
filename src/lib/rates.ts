"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { readVerifiedRateCache, writeVerifiedRateCache } from "@/lib/rates/cache";
import {
  RATE_FETCH_RETRIES,
  RATE_FETCH_TIMEOUT_MS,
  RATE_RETRY_DELAY_MS,
  recordRateFetchFailure,
  recordRateFetchSuccess,
  sleep,
  withTimeout,
} from "@/lib/rates/pipeline";
import {
  resolveMortgageRate,
  type ResolvedMortgageRate,
} from "@/lib/rates/resolve-engine";

export type CurrentRates = {
  rateWithInsurance: number | null;
  rateWithoutInsurance: number | null;
  rpsnWithInsurance: number | null;
  rpsnWithoutInsurance: number | null;
  /** Bez pojištění je orientační tržní průměr (+0.3), ne bankovní lístek */
  withoutInsuranceOrientational: boolean;
  updatedAt: string | null;
};

/** Prázdný stav — žádné vymyšlené LIVE sazby při výpadku DB. */
export const EMPTY_RATES: CurrentRates = {
  rateWithInsurance: null,
  rateWithoutInsurance: null,
  rpsnWithInsurance: null,
  rpsnWithoutInsurance: null,
  withoutInsuranceOrientational: false,
  updatedAt: null,
};

function toNumber(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/** KB insider 4.74/4.94; jinak mezera 0.3 = orientační doplnění. */
function detectOrientationalWithout(
  withRate: number | null,
  withoutRate: number | null
): boolean {
  if (withRate == null || withoutRate == null) return false;
  if (
    Math.abs(withRate - 4.74) < 0.001 &&
    Math.abs(withoutRate - 4.94) < 0.001
  ) {
    return false;
  }
  if (
    Math.abs(withRate - 5.09) < 0.001 &&
    Math.abs(withoutRate - 5.39) < 0.001
  ) {
    return false;
  }
  return Math.abs(withoutRate - withRate - 0.3) < 0.021;
}

/** Záloha: nejlevnější klasická sazba s pojištěním z bank_rates. */
async function fetchRatesFromBankRates(): Promise<CurrentRates | null> {
  const { data, error } = await withTimeout(
    supabase
      .from("bank_rates")
      .select(
        "rate_with_insurance, rate_without_insurance, rpsn_with_insurance, rpsn_without_insurance, rate, rpsn, updated_at"
      )
      .order("rate_with_insurance", { ascending: true, nullsFirst: false })
      .then((r) => r),
    RATE_FETCH_TIMEOUT_MS,
    "bank_rates"
  );

  if (error || !data?.length) {
    recordRateFetchFailure(
      error?.message ?? "bank_rates empty",
      { step: "bank_rates_fallback" }
    );
    return null;
  }

  const best =
    data.find((row) => toNumber(row.rate_with_insurance) != null) ?? data[0];

  const rateWithInsurance =
    toNumber(best.rate_with_insurance) ?? toNumber(best.rate);
  const rateWithoutInsurance = toNumber(best.rate_without_insurance);
  const rpsnWithInsurance =
    toNumber(best.rpsn_with_insurance) ?? toNumber(best.rpsn);
  const rpsnWithoutInsurance = toNumber(best.rpsn_without_insurance);

  if (rateWithInsurance == null) return null;

  return {
    rateWithInsurance,
    rateWithoutInsurance,
    rpsnWithInsurance,
    rpsnWithoutInsurance,
    withoutInsuranceOrientational: detectOrientationalWithout(
      rateWithInsurance,
      rateWithoutInsurance
    ),
    updatedAt: best.updated_at ? String(best.updated_at) : null,
  };
}

async function fetchCurrentRatesOnce(): Promise<CurrentRates> {
  try {
    const { data, error } = await withTimeout(
      supabase
        .from("current_rates")
        .select(
          "rate_with_insurance, rate_without_insurance, rpsn_with_insurance, rpsn_without_insurance, updated_at"
        )
        .eq("id", 1)
        .maybeSingle()
        .then((r) => r),
      RATE_FETCH_TIMEOUT_MS,
      "current_rates"
    );

    if (!error && data) {
      const rateWithInsurance = toNumber(data.rate_with_insurance);
      const rateWithoutInsurance = toNumber(data.rate_without_insurance);

      if (rateWithInsurance != null) {
        return {
          rateWithInsurance,
          rateWithoutInsurance,
          rpsnWithInsurance: toNumber(data.rpsn_with_insurance),
          rpsnWithoutInsurance: toNumber(data.rpsn_without_insurance),
          withoutInsuranceOrientational: detectOrientationalWithout(
            rateWithInsurance,
            rateWithoutInsurance
          ),
          updatedAt: data.updated_at ?? null,
        };
      }
    } else if (error) {
      recordRateFetchFailure(error.message, { step: "current_rates" });
    }

    const fromBanks = await fetchRatesFromBankRates();
    if (fromBanks) return fromBanks;

    return EMPTY_RATES;
  } catch (err) {
    recordRateFetchFailure(
      err instanceof Error ? err.message : "rate_fetch_exception",
      { step: "fetchCurrentRatesOnce" }
    );
    try {
      const fromBanks = await fetchRatesFromBankRates();
      return fromBanks ?? EMPTY_RATES;
    } catch (err2) {
      recordRateFetchFailure(
        err2 instanceof Error ? err2.message : "bank_rates_exception",
        { step: "bank_rates_catch" }
      );
      return EMPTY_RATES;
    }
  }
}

export async function fetchCurrentRates(): Promise<CurrentRates> {
  let last: CurrentRates = EMPTY_RATES;
  for (let attempt = 0; attempt <= RATE_FETCH_RETRIES; attempt++) {
    last = await fetchCurrentRatesOnce();
    if (last.rateWithInsurance != null || last.rateWithoutInsurance != null) {
      writeVerifiedRateCache(last);
      recordRateFetchSuccess({
        attempt,
        updatedAt: last.updatedAt,
        source: "current_or_bank_rates",
      });
      return last;
    }
    if (attempt < RATE_FETCH_RETRIES) {
      await sleep(RATE_RETRY_DELAY_MS * (attempt + 1));
    }
  }
  recordRateFetchFailure("all_retries_exhausted", {
    attempts: RATE_FETCH_RETRIES + 1,
  });
  return last;
}

export function useCurrentRates() {
  const [rates, setRates] = useState<CurrentRates>(EMPTY_RATES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchCurrentRates()
      .then((next) => {
        if (!cancelled) {
          setRates(next);
          const empty =
            next.rateWithInsurance == null && next.rateWithoutInsurance == null;
          setError(empty ? "live_rates_unavailable" : null);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setRates(EMPTY_RATES);
          setError(err instanceof Error ? err.message : "rate_fetch_failed");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { rates, loading, error };
}

/**
 * Hook pro hlavní kalkulačku — vždy vrátí spočitatelnou sazbu (LIVE / STALE / MODEL).
 */
export function useMortgageRateEngine(hasInsurance: boolean): {
  rates: CurrentRates;
  loading: boolean;
  error: string | null;
  resolved: ResolvedMortgageRate;
} {
  const { rates, loading, error } = useCurrentRates();
  const [cached, setCached] = useState(() => readVerifiedRateCache());

  useEffect(() => {
    setCached(readVerifiedRateCache());
  }, [rates.updatedAt, rates.rateWithInsurance]);

  const resolved = useMemo(
    () =>
      resolveMortgageRate({
        rateWithInsurance: rates.rateWithInsurance,
        rateWithoutInsurance: rates.rateWithoutInsurance,
        updatedAt: rates.updatedAt,
        hasInsurance,
        cachedVerified: cached,
      }),
    [
      rates.rateWithInsurance,
      rates.rateWithoutInsurance,
      rates.updatedAt,
      hasInsurance,
      cached,
    ]
  );

  return { rates, loading, error, resolved };
}

export function pickRate(
  rates: CurrentRates,
  hasInsurance: boolean
): number | null {
  return hasInsurance ? rates.rateWithInsurance : rates.rateWithoutInsurance;
}

export function pickRpsn(
  rates: CurrentRates,
  hasInsurance: boolean
): number | null {
  return hasInsurance ? rates.rpsnWithInsurance : rates.rpsnWithoutInsurance;
}

export {
  resolveMortgageRate,
  rateUiBadgeClass,
  rateUiBadgeLabel,
  type ResolvedMortgageRate,
  type RateLayer,
  type RateUiKind,
} from "@/lib/rates/resolve-engine";
export {
  MODEL_FALLBACK_RATE_PERCENT,
  MODEL_FALLBACK_EXPLANATION,
} from "@/lib/rates/model-fallback";
export {
  LIVE_RATES_UNAVAILABLE_MESSAGE,
  modelRateDisclaimer,
  type MortgageRateRecord,
  type MortgageRateStatus,
} from "@/lib/rates/types";
