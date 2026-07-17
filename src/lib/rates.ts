"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type CurrentRates = {
  rateWithInsurance: number;
  rateWithoutInsurance: number;
  rpsnWithInsurance: number;
  rpsnWithoutInsurance: number;
  updatedAt: string | null;
};

/** Fallback jen když Supabase není dostupná (dev / výpadek). */
export const FALLBACK_RATES: CurrentRates = {
  rateWithInsurance: 4.29,
  rateWithoutInsurance: 4.59,
  rpsnWithInsurance: 4.75,
  rpsnWithoutInsurance: 5.15,
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
    const withoutInsurance = toNumber(data.rate_without_insurance);
    const rpsnWith =
      toNumber(data.rpsn_with_insurance) ?? FALLBACK_RATES.rpsnWithInsurance;
    const rpsnWithout =
      toNumber(data.rpsn_without_insurance) ??
      FALLBACK_RATES.rpsnWithoutInsurance;

    if (withInsurance == null || withoutInsurance == null) {
      console.error("Neplatné sazby v current_rates:", data);
      return FALLBACK_RATES;
    }

    return {
      rateWithInsurance: withInsurance,
      rateWithoutInsurance: withoutInsurance,
      rpsnWithInsurance: rpsnWith,
      rpsnWithoutInsurance: rpsnWithout,
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

export function pickRate(rates: CurrentRates, hasInsurance: boolean): number {
  return hasInsurance
    ? rates.rateWithInsurance
    : rates.rateWithoutInsurance;
}

export function pickRpsn(rates: CurrentRates, hasInsurance: boolean): number {
  return hasInsurance
    ? rates.rpsnWithInsurance
    : rates.rpsnWithoutInsurance;
}
