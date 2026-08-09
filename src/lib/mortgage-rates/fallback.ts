/**
 * Compatibility wrapper — canonical fallback is buildFallbackMortgageRate().
 */

import {
  buildFallbackMortgageRate,
  type MortgageRateResult,
} from "@/lib/rates/mortgageRateService";
import {
  REFERENCE_RATE_PUBLIC_LABEL_KEY,
  type ReferenceMortgageRate,
  type ResolveReferenceRateQuery,
} from "@/lib/mortgage-rates/types";

function toReference(result: MortgageRateResult): ReferenceMortgageRate {
  return {
    id: result.sourceName ?? "platform-model-fallback-v1",
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
    notes:
      "Modelová / orientační záloha — není bankovní nabídka ani ověřená referenční sazba.",
    freshness: result.freshness,
    isModelFallback: true,
    publicLabelKey: REFERENCE_RATE_PUBLIC_LABEL_KEY,
    source: "fallback",
  };
}

/** @deprecated Prefer buildFallbackMortgageRate / getMortgageRate */
export function buildModelReferenceRate(
  query: ResolveReferenceRateQuery = {}
): ReferenceMortgageRate {
  return toReference(
    buildFallbackMortgageRate({
      countryCode: query.countryCode,
      purpose: query.purpose,
      fixationYears: query.fixationYears,
      ltv: query.ltvPercent,
    })
  );
}
