"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type CurrentRates = {
  rateWithInsurance: number | null;
  rateWithoutInsurance: number | null;
  rpsnWithInsurance: number | null;
  rpsnWithoutInsurance: number | null;
  updatedAt: string | null;
};

/** Prázdný stav — žádné vymyšlené sazby při výpadku DB. */
export const EMPTY_RATES: CurrentRates = {
  rateWithInsurance: null,
  rateWithoutInsurance: null,
  rpsnWithInsurance: null,
  rpsnWithoutInsurance: null,
  updatedAt: null,
};

function toNumber(value: unknown): number | null {
  if (value == null || value === "") return null;
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
      return EMPTY_RATES;
    }

    return {
      rateWithInsurance: toNumber(data.rate_with_insurance),
      rateWithoutInsurance: toNumber(data.rate_without_insurance),
      rpsnWithInsurance: toNumber(data.rpsn_with_insurance),
      rpsnWithoutInsurance: toNumber(data.rpsn_without_insurance),
      updatedAt: data.updated_at ?? null,
    };
  } catch (err) {
    console.error("Chyba při načítání sazeb:", err);
    return EMPTY_RATES;
  }
}

export function useCurrentRates() {
  const [rates, setRates] = useState<CurrentRates>(EMPTY_RATES);
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
