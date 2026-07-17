"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type CurrentRates = {
  rateWithInsurance: number;
  rateWithoutInsurance: number | null;
  rpsnWithInsurance: number | null;
  rpsnWithoutInsurance: number | null;
  updatedAt: string | null;
};

/**
 * Fallback jen když Supabase není dostupná (dev / výpadek).
 * Bez pojištění záměrně null — neinventujeme +0.2 %.
 */
export const FALLBACK_RATES: CurrentRates = {
  rateWithInsurance: 4.29,
  rateWithoutInsurance: null,
  rpsnWithInsurance: 4.75,
  rpsnWithoutInsurance: null,
  updatedAt: null,
};

function toNumber(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export async function fetchCurrentRates(): Promise<CurrentRates> {
  try {
    const { data, error } = await supabase
      .from("current_rates")
      .select(
        "rate_with_insurance, rate_without_insurance, rpsn_with_insurance, rpsn_without_insurance, updated_at"
      )
      .eq("id", 1)
      .single();

    if (error || !data) {
      console.error("Nepodařilo se načíst sazby ze Supabase:", error?.message);
      return FALLBACK_RATES;
    }

    const withInsurance = toNumber(data.rate_with_insurance);
    if (withInsurance == null) {
      console.error("Neplatné sazby v current_rates:", data);
      return FALLBACK_RATES;
    }

    return {
      rateWithInsurance: withInsurance,
      rateWithoutInsurance: toNumber(data.rate_without_insurance),
      rpsnWithInsurance: toNumber(data.rpsn_with_insurance),
      rpsnWithoutInsurance: toNumber(data.rpsn_without_insurance),
      updatedAt: data.updated_at ?? null,
    };
  } catch (err) {
    console.error("Chyba při načítání sazeb:", err);
    return FALLBACK_RATES;
  }
}

export function useCurrentRates() {
  const [rates, setRates] = useState<CurrentRates>(FALLBACK_RATES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetchCurrentRates().then((next) => {
      if (!cancelled) {
        setRates(next);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return { rates, loading };
}

export function pickRate(
  rates: CurrentRates,
  hasInsurance: boolean
): number | null {
  return hasInsurance
    ? rates.rateWithInsurance
    : rates.rateWithoutInsurance;
}

export function pickRpsn(
  rates: CurrentRates,
  hasInsurance: boolean
): number | null {
  return hasInsurance
    ? rates.rpsnWithInsurance
    : rates.rpsnWithoutInsurance;
}

/** UI label pro chybějící / individuální sazbu. */
export function formatRateLabel(rate: number | null | undefined): string {
  if (rate == null || !Number.isFinite(rate)) return "Na vyžádání";
  return `${rate.toFixed(2)} %`;
}
