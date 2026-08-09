/**
 * Thin adapters around the central mortgageRateService selection.
 * Prefer `@/lib/rates/mortgageRateService` for new code.
 */

import { selectUniqueActiveMortgageRate } from "@/lib/rates/mortgageRateService";
import { rateFreshnessFromCheckedAt } from "@/lib/rates/mortgage-rate-freshness";
import {
  isMortgagePurpose,
  isMortgageRateKind,
  REFERENCE_RATE_PUBLIC_LABEL_KEY,
  type MortgageRateRecord,
  type MortgageRateRow,
  type ReferenceMortgageRate,
  type ResolveReferenceRateQuery,
} from "@/lib/mortgage-rates/types";

function toNumber(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function mapRowToMortgageRateRecord(
  row: MortgageRateRow
): MortgageRateRecord | null {
  const rate = toNumber(row.rate);
  const fixation = toNumber(row.fixation_years);
  const ltvMin = toNumber(row.ltv_min);
  const ltvMax = toNumber(row.ltv_max);
  if (rate == null || fixation == null || ltvMin == null || ltvMax == null) {
    return null;
  }
  if (!(rate > 0 && rate < 30)) return null;
  if (!(ltvMin >= 0 && ltvMax <= 100 && ltvMin < ltvMax)) return null;
  if (fixation <= 0) return null;
  if (!isMortgagePurpose(row.purpose) || !isMortgageRateKind(row.rate_kind)) {
    return null;
  }

  return {
    id: row.id,
    countryCode: row.country_code.toUpperCase(),
    purpose: row.purpose,
    fixationYears: fixation,
    ltvMin,
    ltvMax,
    ltvMinExclusive: row.ltv_min_exclusive === true,
    ltvMaxExclusive: row.ltv_max_exclusive === true,
    rate,
    rateKind: row.rate_kind,
    providerName: row.provider_name,
    sourceName: row.source_name,
    sourceUrl: row.source_url,
    checkedAt: row.checked_at,
    validFrom: row.valid_from,
    validTo: row.valid_to,
    isActive: row.is_active,
    notes: row.notes,
  };
}

export function mapRowToReferenceRate(
  row: MortgageRateRow,
  nowMs: number = Date.now()
): ReferenceMortgageRate | null {
  const record = mapRowToMortgageRateRecord(row);
  if (!record) return null;
  return {
    ...record,
    ratePercent: record.rate,
    freshness: rateFreshnessFromCheckedAt(row.checked_at, nowMs),
    isModelFallback: false,
    publicLabelKey: REFERENCE_RATE_PUBLIC_LABEL_KEY,
    source: "supabase",
  };
}

/**
 * @deprecated Prefer getMortgageRate() — keeps unique-match fail-safe.
 */
export function selectReferenceMortgageRate(
  rows: MortgageRateRow[],
  query: ResolveReferenceRateQuery = {},
  nowMs: number = query.nowMs ?? Date.now()
): ReferenceMortgageRate | null {
  const selected = selectUniqueActiveMortgageRate(
    rows,
    {
      countryCode: (query.countryCode ?? "CZ").toUpperCase(),
      purpose: query.purpose ?? "purchase",
      fixationYears: query.fixationYears ?? 5,
      ltv: query.ltvPercent ?? 80,
    },
    nowMs
  );

  if (selected.status !== "ok") return null;
  if (query.rateKind && selected.row.rate_kind !== query.rateKind) return null;
  return mapRowToReferenceRate(selected.row, nowMs);
}
