/**
 * Live sazby ze Supabase → DataRecord (Source of Truth vrstva).
 */

import type { CurrentRates } from "@/lib/rates";
import type { BankRateRow } from "@/lib/bank-rates";
import { makeDataRecord, missingDataRecord } from "@/lib/data/records";
import type { DataRecord, DataStatus } from "@/lib/data/types";
import {
  KB_INSIDER_RATES,
  ORIENTATIONAL_WITHOUT_SURCHARGE,
} from "@/lib/scrape/rate-policy";

function rateStatus(opts: {
  estimated?: boolean;
  bankId?: string;
}): DataStatus {
  if (opts.estimated) return "MODELLED";
  if (opts.bankId === "komercni-banka") return "PARTNER_QUOTE";
  return "LIVE";
}

export function marketAggregateToRecords(
  rates: CurrentRates
): {
  withInsurance: DataRecord<number | null>;
  withoutInsurance: DataRecord<number | null>;
  rpsnWith: DataRecord<number | null>;
  rpsnWithout: DataRecord<number | null>;
} {
  const fetched = rates.updatedAt;
  return {
    withInsurance: makeDataRecord({
      id: "rate.cz.market.with_insurance",
      value: rates.rateWithInsurance,
      unit: "percent_pa",
      country: "cz",
      source: "Supabase current_rates / bank_rates",
      sourceUrl: null,
      sourceType: "supabase",
      status: rates.rateWithInsurance == null ? "STALE" : "LIVE",
      confidence: rates.rateWithInsurance == null ? 0 : 0.85,
      lastFetchedAt: fetched,
      notes: null,
    }),
    withoutInsurance: makeDataRecord({
      id: "rate.cz.market.without_insurance",
      value: rates.rateWithoutInsurance,
      unit: "percent_pa",
      country: "cz",
      source: rates.withoutInsuranceOrientational
        ? `Model +${ORIENTATIONAL_WITHOUT_SURCHARGE} p.b.`
        : "Supabase current_rates",
      sourceUrl: null,
      sourceType: rates.withoutInsuranceOrientational ? "model" : "supabase",
      status:
        rates.rateWithoutInsurance == null
          ? "STALE"
          : rates.withoutInsuranceOrientational
            ? "MODELLED"
            : "LIVE",
      confidence: rates.withoutInsuranceOrientational ? 0.45 : 0.85,
      lastFetchedAt: fetched,
      notes: rates.withoutInsuranceOrientational
        ? "Orientační tržní přirážka — v UI označit *orientačně."
        : null,
    }),
    rpsnWith: makeDataRecord({
      id: "rpsn.cz.market.with_insurance",
      value: rates.rpsnWithInsurance,
      unit: "percent_pa",
      country: "cz",
      source: "Supabase current_rates",
      sourceUrl: null,
      sourceType: "supabase",
      status: rates.rpsnWithInsurance == null ? "STALE" : "LIVE",
      confidence: rates.rpsnWithInsurance == null ? 0 : 0.8,
      lastFetchedAt: fetched,
      notes: null,
    }),
    rpsnWithout: makeDataRecord({
      id: "rpsn.cz.market.without_insurance",
      value: rates.rpsnWithoutInsurance,
      unit: "percent_pa",
      country: "cz",
      source: "Supabase current_rates",
      sourceUrl: null,
      sourceType: "supabase",
      status: rates.rpsnWithoutInsurance == null ? "STALE" : "LIVE",
      confidence: rates.rpsnWithoutInsurance == null ? 0 : 0.75,
      lastFetchedAt: fetched,
      notes: null,
    }),
  };
}

export function bankRateRowToRecords(row: BankRateRow): {
  withInsurance: DataRecord<number | null>;
  withoutInsurance: DataRecord<number | null>;
  americanWith: DataRecord<number | null>;
  americanWithout: DataRecord<number | null>;
} {
  const bankId = String(row.id);
  const isKb = bankId === "komercni-banka";
  const isUni = bankId === "unicredit-bank";
  const withoutEstimated = !isKb && !isUni;

  return {
    withInsurance: makeDataRecord({
      id: `rate.cz.bank.${bankId}.with_insurance`,
      value: row.rateWithInsurance ?? row.rate,
      unit: "percent_pa",
      country: "cz",
      source: isKb
        ? `KB insider ${KB_INSIDER_RATES.rateWithInsurance} %`
        : row.sourceUrl ?? "bank_rates",
      sourceUrl: row.sourceUrl,
      sourceType: isKb ? "insider" : "official_bank",
      status: rateStatus({ bankId }),
      confidence: isKb ? 0.9 : 0.85,
      lastFetchedAt: row.updatedAt,
      notes: null,
    }),
    withoutInsurance: makeDataRecord({
      id: `rate.cz.bank.${bankId}.without_insurance`,
      value: row.rateWithoutInsurance,
      unit: "percent_pa",
      country: "cz",
      source: withoutEstimated
        ? `Model +${ORIENTATIONAL_WITHOUT_SURCHARGE} p.b.`
        : isKb
          ? "KB insider"
          : row.sourceUrl ?? "bank_rates",
      sourceUrl: row.sourceUrl,
      sourceType: withoutEstimated ? "model" : isKb ? "insider" : "official_bank",
      status:
        row.rateWithoutInsurance == null
          ? "STALE"
          : rateStatus({ estimated: withoutEstimated, bankId }),
      confidence: withoutEstimated ? 0.45 : 0.9,
      lastFetchedAt: row.updatedAt,
      notes: withoutEstimated
        ? "Doplněno orientačně — UI *orientačně."
        : null,
    }),
    americanWith:
      row.americanRateWithInsurance == null
        ? missingDataRecord(`rate.cz.american.${bankId}.with_insurance`, {
            unit: "percent_pa",
            country: "cz",
            source: "bank_rates.american_*",
            notes: "Americká sazba s pojištěním chybí.",
          })
        : makeDataRecord({
            id: `rate.cz.american.${bankId}.with_insurance`,
            value: row.americanRateWithInsurance,
            unit: "percent_pa",
            country: "cz",
            source: row.americanSourceUrl ?? "bank_rates",
            sourceUrl: row.americanSourceUrl,
            sourceType: "aggregator",
            status: "LIVE",
            confidence: 0.75,
            lastFetchedAt: row.updatedAt,
            notes: null,
          }),
    americanWithout:
      row.americanRateWithoutInsurance == null
        ? missingDataRecord(`rate.cz.american.${bankId}.without_insurance`, {
            unit: "percent_pa",
            country: "cz",
            source: "bank_rates.american_*",
          })
        : makeDataRecord({
            id: `rate.cz.american.${bankId}.without_insurance`,
            value: row.americanRateWithoutInsurance,
            unit: "percent_pa",
            country: "cz",
            source: `Model +${ORIENTATIONAL_WITHOUT_SURCHARGE} p.b.`,
            sourceUrl: row.americanSourceUrl,
            sourceType: "model",
            status: "MODELLED",
            confidence: 0.4,
            lastFetchedAt: row.updatedAt,
            notes: "Americká bez pojištění typicky orientační.",
          }),
  };
}
