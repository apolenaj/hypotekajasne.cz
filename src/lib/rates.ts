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

/** Záloha: nejlevnější klasická sazba s pojištěním z bank_rates. */
async function fetchRatesFromBankRates(): Promise<CurrentRates | null> {
  const { data, error } = await supabase
    .from("bank_rates")
    .select(
      "rate_with_insurance, rate_without_insurance, rpsn_with_insurance, rpsn_without_insurance, rate, rpsn, updated_at"
    )
    .order("rate_with_insurance", { ascending: true, nullsFirst: false });

  if (error || !data?.length) {
    console.error(
      "Záloha bank_rates selhala:",
      error?.message ?? "prázdná tabulka"
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

export async function fetchCurrentRates(): Promise<CurrentRates> {
  try {
    const { data, error } = await supabase
      .from("current_rates")
      .select(
        "rate_with_insurance, rate_without_insurance, rpsn_with_insurance, rpsn_without_insurance, updated_at"
      )
      .eq("id", 1)
      .maybeSingle();

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
      console.error("Nepodařilo se načíst current_rates:", error.message);
    }

    const fromBanks = await fetchRatesFromBankRates();
    if (fromBanks) return fromBanks;

    return EMPTY_RATES;
  } catch (err) {
    console.error("Chyba při načítání sazeb:", err);
    const fromBanks = await fetchRatesFromBankRates();
    return fromBanks ?? EMPTY_RATES;
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
