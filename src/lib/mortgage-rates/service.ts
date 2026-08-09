/**
 * Compatibility layer — prefer `@/lib/rates/mortgageRateService`.
 */

import {
  createSupabaseMortgageRateReader,
  getMortgageRate,
  type MortgageRateRowsReader,
} from "@/lib/rates/mortgageRateService";
import { buildModelReferenceRate } from "@/lib/mortgage-rates/fallback";
import type {
  MortgageRateRow,
  ReferenceMortgageRate,
  ResolveReferenceRateQuery,
} from "@/lib/mortgage-rates/types";
import { REFERENCE_RATE_PUBLIC_LABEL_KEY } from "@/lib/mortgage-rates/types";

export type MortgageRatesQueryResult = {
  data: MortgageRateRow[] | null;
  error: { message: string } | null;
};

export type MortgageRatesReader = MortgageRateRowsReader;

export { createSupabaseMortgageRateReader as createSupabaseMortgageRatesReader };

export async function fetchActiveMortgageRateRows(
  reader: MortgageRatesReader | null,
  countryCode: string = "CZ"
): Promise<{ rows: MortgageRateRow[]; errorMessage: string | null }> {
  if (!reader) {
    return { rows: [], errorMessage: "missing_mortgage_rates_reader" };
  }
  try {
    const { data, error } = await reader.listActiveByCountry(
      countryCode.toUpperCase()
    );
    if (error) return { rows: [], errorMessage: error.message };
    return { rows: Array.isArray(data) ? data : [], errorMessage: null };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "mortgage_rates_fetch_failed";
    return { rows: [], errorMessage: message };
  }
}

/** @deprecated Prefer getMortgageRate() */
export async function resolveReferenceMortgageRate(
  reader: MortgageRatesReader | null,
  query: ResolveReferenceRateQuery = {}
): Promise<ReferenceMortgageRate> {
  const result = await getMortgageRate(reader, {
    countryCode: query.countryCode,
    purpose: query.purpose,
    fixationYears: query.fixationYears,
    ltv: query.ltvPercent,
    nowMs: query.nowMs,
  });

  if (result.source === "fallback") {
    return buildModelReferenceRate(query);
  }

  return {
    id: "supabase-rate",
    countryCode: result.countryCode,
    purpose: result.purpose,
    fixationYears: result.fixationYears,
    ltvMin: result.ltvMin,
    ltvMax: result.ltvMax,
    ltvMinExclusive: false,
    ltvMaxExclusive: false,
    rate: result.rate,
    ratePercent: result.rate,
    rateKind: result.rateKind,
    providerName: null,
    sourceName: result.sourceName,
    sourceUrl: result.sourceUrl,
    checkedAt: result.checkedAt ?? new Date(0).toISOString(),
    validFrom: result.checkedAt ?? new Date(0).toISOString(),
    validTo: null,
    isActive: true,
    notes: null,
    freshness: result.freshness,
    isModelFallback: false,
    publicLabelKey: REFERENCE_RATE_PUBLIC_LABEL_KEY,
    source: "supabase",
  };
}
