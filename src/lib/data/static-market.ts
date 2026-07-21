/**
 * Tržní defaulty kalkulačky jako DataRecord.
 * Numerické hodnoty zůstávají v countryConfigs (calculators.ts) — tento modul
 * je obaluje metadaty Source of Truth (status MODEL).
 */

import { countryConfigs, type CountryId } from "@/lib/calculators";
import { makeDataRecord } from "@/lib/data/records";
import type { DataRecord, DataUnit } from "@/lib/data/types";

function currencyUnit(
  currency: string
): DataUnit {
  switch (currency) {
    case "CZK":
      return "czk";
    case "EUR":
      return "eur";
    case "USD":
      return "usd";
    case "AED":
      return "aed";
    case "SAR":
      return "sar";
    default:
      return "other";
  }
}

export function getDefaultRateRecord(
  country: CountryId
): DataRecord<number | null> {
  const c = countryConfigs[country];
  const hasRate = c.defaultRate != null;
  return makeDataRecord({
    id: `rate.foreign.default.${country}`,
    value: c.defaultRate,
    unit: "percent_pa",
    country,
    source: hasRate
      ? "Ověřená sazba v countryConfigs"
      : "Lokální sazba není v datech",
    sourceUrl: null,
    sourceType: "model",
    status: hasRate ? "MODEL" : "STALE",
    confidence: hasRate ? 0.4 : 0,
    notes: hasRate
      ? "Není live sazba banky."
      : "Hardcoded foreign rate odstraněna — individuálně ověřujeme.",
  });
}

export function getDefaultPriceRecord(
  country: CountryId
): DataRecord<number> {
  const c = countryConfigs[country];
  return makeDataRecord({
    id: `price.default.${country}`,
    value: c.defaultPrice,
    unit: currencyUnit(c.currency),
    country,
    source: "UI default kalkulačky",
    sourceUrl: null,
    sourceType: "model",
    status: "MODEL",
    confidence: 0.35,
    notes: "Orientační výchozí cena pro UX, ne tržní kotace.",
  });
}

export function getDefaultYieldRecord(
  country: CountryId
): DataRecord<number> {
  const c = countryConfigs[country];
  return makeDataRecord({
    id: `yield.default.${country}`,
    value: c.defaultRentalYield * 100,
    unit: "percent",
    country,
    source: "UI default hrubého výnosu",
    sourceUrl: null,
    sourceType: "model",
    status: "MODEL",
    confidence: 0.35,
    notes: "Uloženo jako % (defaultRentalYield * 100).",
  });
}

export const MARKET_DEFAULT_COUNTRIES = Object.keys(
  countryConfigs
) as CountryId[];
