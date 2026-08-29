/**
 * Domain types + history helpers for Phase 2 mortgage rates.
 * Runtime resolution: `@/lib/rates/mortgageRateService` (ONE central service).
 */

export {
  DEFAULT_CZ_MODEL_RATE,
  getMortgageRate,
  buildFallbackMortgageRate,
  selectUniqueActiveMortgageRate,
  type GetMortgageRateInput,
  type MortgageRateResult,
  type RateFreshness,
} from "@/lib/rates/mortgageRateService";

export {
  MODEL_FALLBACK_RATE_PERCENT,
  MODEL_FALLBACK_SOURCE_ID,
} from "@/lib/rates/model-fallback";

export { buildModelReferenceRate } from "@/lib/mortgage-rates/fallback";
export {
  RATE_AGING_MAX_AGE_MS,
  RATE_FRESH_MAX_AGE_MS,
  ageMsFromIso,
  isUsableReferenceFreshness,
  rateFreshnessFromCheckedAt,
  referenceRateFreshnessFromCheckedAt,
} from "@/lib/mortgage-rates/freshness";
export {
  MORTGAGE_RATE_ADMIN_RULES,
  MORTGAGE_RATE_WEEKLY_UPDATE_WORKFLOW,
} from "@/lib/mortgage-rates/admin-workflow";
export {
  CZ_LTV_BANDS,
  CZ_MORTGAGE_RATE_SLOTS,
  CZ_MORTGAGE_RATE_SLOTS_MVP,
  findCzRateSlot,
  type CzLtvBand,
  type CzLtvBandId,
  type CzRateSlot,
} from "@/lib/mortgage-rates/cz-rate-structure";
export {
  matchesLtvBand,
  type LtvBandMatchOptions,
} from "@/lib/mortgage-rates/ltv-band";
export {
  buildLeadMetadataFromJourney,
  buildMortgageJourneyHref,
  journeyCoreEqual,
  mergeMarketingFromSearch,
  MORTGAGE_JOURNEY_FIXATION_OPTIONS,
  MORTGAGE_JOURNEY_TERM_OPTIONS,
  parseMortgageJourneyParams,
  serializeMortgageJourneyParams,
  type MarketingAttributionParams,
  type MortgageJourneyContext,
  type MortgageJourneyCore,
  type MortgageJourneyParseResult,
  type MortgageJourneyPurpose,
} from "@/lib/mortgage-rates/mortgage-journey-context";
export {
  buildLtvContext,
  computeExactLtv,
  CZ_SUPPORTED_LTV_BAND_UPPER_LIMITS,
  formatExactLtvCs,
  formatLtvBandLabel,
  parseSazbySearchParams,
  rateFilterLtvFromContext,
  resolveLtvBandUpperLimit,
  serializeSazbySearchParams,
  type LtvContext,
  type SazbyRatesQuery,
  SAZBY_DEFAULT_QUERY,
} from "@/lib/mortgage-rates/ltv-context";
export {
  planMortgageRateSupersede,
  type SupersedeMortgageRateInput,
  type SupersedeMortgageRatePlan,
} from "@/lib/mortgage-rates/history";
export {
  mapRowToMortgageRateRecord,
  mapRowToReferenceRate,
  selectReferenceMortgageRate,
} from "@/lib/mortgage-rates/select";
export {
  createSupabaseMortgageRatesReader,
  fetchActiveMortgageRateRows,
  resolveReferenceMortgageRate,
  type MortgageRatesQueryResult,
  type MortgageRatesReader,
} from "@/lib/mortgage-rates/service";
export {
  MORTGAGE_PURPOSES,
  MORTGAGE_RATE_KINDS,
  MORTGAGE_RATE_PURPOSES,
  REFERENCE_RATE_PUBLIC_LABEL_KEY,
  isMortgagePurpose,
  isMortgageRateKind,
  type MortgagePurpose,
  type MortgageRateKind,
  type MortgageRatePurpose,
  type MortgageRateRecord,
  type MortgageRateRow,
  type ReferenceMortgageRate,
  type ReferenceRateFreshness,
  type ResolveReferenceRateQuery,
} from "@/lib/mortgage-rates/types";
