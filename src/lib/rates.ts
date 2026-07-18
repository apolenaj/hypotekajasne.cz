"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type CurrentRates = {
  rateWithInsurance: number | null;
  rateWithoutInsurance: number | null;
  rpsnWithInsurance: number | null;
  rpsnWithoutInsurance: number | null;
  /** Bez pojištění je orientační tržní průměr (+0.3), ne bankovní lístek */
  withoutInsuranceOrientational: boolean;
  updatedAt: string | null;
};

/** Prázdný stav — žádné vymyšlené sazby při výpadku DB. */
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
  // UniCredit reálné PCE
  if (
    Math.abs(withRate - 5.09) < 0.001 &&
    Math.abs(withoutRate - 5.39) < 0.001
  ) {
    return false;
  }
  return Math.abs(withoutRate - withRate - 0.3) < 0.021;
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

    const rateWithInsurance = toNumber(data.rate_with_insurance);
    const rateWithoutInsurance = toNumber(data.rate_without_insurance);

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
