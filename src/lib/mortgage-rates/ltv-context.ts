/**
 * Central LTV model for UI, URL state and mortgage-rate filtering.
 *
 * exactLtv — loan / property × 100 (one decimal in UI)
 * ltvBand  — lowest supported upper limit from CZ_LTV_BANDS that contains exactLtv
 */

import { ltvPercent } from "@/lib/finance-math/core";
import { CZ_LTV_BANDS } from "@/lib/mortgage-rates/cz-rate-structure";
import { matchesLtvBand } from "@/lib/mortgage-rates/ltv-band";

/** Upper limits evidenced in CZ rate structure (0–80 and >80–90). */
export const CZ_SUPPORTED_LTV_BAND_UPPER_LIMITS = [80, 90] as const;

export type LtvValidationCode =
  | "invalid_property"
  | "negative_loan"
  | "loan_exceeds_property"
  | "exceeds_supported_max";

export type LtvContext = {
  exactLtv: number | null;
  /** Bank band upper limit used for rate filtering labels (e.g. 90). */
  ltvBand: number | null;
  validationError: string | null;
  validationCode: LtvValidationCode | null;
  exceedsSupportedMax: boolean;
};

export type PropertyLoanInput = {
  propertyValueCzk: number;
  loanAmountCzk: number;
};

const MAX_SUPPORTED_LTV = CZ_SUPPORTED_LTV_BAND_UPPER_LIMITS[
  CZ_SUPPORTED_LTV_BAND_UPPER_LIMITS.length - 1
]!;

export function roundExactLtv(value: number): number {
  return Math.round(value * 10) / 10;
}

/** LTV = loan / property × 100 */
export function computeExactLtv(
  loanAmountCzk: number,
  propertyValueCzk: number
): number | null {
  if (!Number.isFinite(propertyValueCzk) || propertyValueCzk <= 0) return null;
  if (!Number.isFinite(loanAmountCzk) || loanAmountCzk < 0) return null;
  if (loanAmountCzk > propertyValueCzk) return null;
  return roundExactLtv(ltvPercent(loanAmountCzk, propertyValueCzk));
}

/**
 * Smallest supported band upper limit that contains exactLtv
 * (85,7 % → 90, not 85; 80,0 % → 80; 80,1 % → 90).
 */
export function resolveLtvBandUpperLimit(exactLtv: number): number | null {
  if (!Number.isFinite(exactLtv) || exactLtv < 0) return null;

  const matching = Object.values(CZ_LTV_BANDS).filter((band) =>
    matchesLtvBand(band.ltvMin, band.ltvMax, exactLtv, {
      ltvMinExclusive: band.ltvMinExclusive,
    })
  );
  if (matching.length === 0) return null;
  return Math.min(...matching.map((band) => band.ltvMax));
}

export function formatExactLtvCs(exactLtv: number): string {
  return exactLtv.toLocaleString("cs-CZ", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

export function formatLtvBandLabel(ltvBandUpper: number): string {
  const label =
    Number.isInteger(ltvBandUpper) && ltvBandUpper % 1 === 0
      ? String(ltvBandUpper)
      : formatExactLtvCs(ltvBandUpper);
  return `do ${label} %`;
}

function validationMessage(code: LtvValidationCode): string {
  switch (code) {
    case "invalid_property":
      return "Zadejte kladnou hodnotu nemovitosti.";
    case "negative_loan":
      return "Výše úvěru nemůže být záporná.";
    case "loan_exceeds_property":
      return "Úvěr nesmí být vyšší než hodnota nemovitosti.";
    case "exceeds_supported_max":
      return `LTV přesahuje nejvyšší podporované pásmo sazebníku (do ${MAX_SUPPORTED_LTV} %). Zveřejněné sazby pro vyšší LTV nezobrazujeme.`;
  }
}

/** Full LTV context from property value and loan amount. */
export function buildLtvContext(input: PropertyLoanInput): LtvContext {
  const propertyValueCzk = input.propertyValueCzk;
  const loanAmountCzk = input.loanAmountCzk;

  if (!Number.isFinite(propertyValueCzk) || propertyValueCzk <= 0) {
    return {
      exactLtv: null,
      ltvBand: null,
      validationError: validationMessage("invalid_property"),
      validationCode: "invalid_property",
      exceedsSupportedMax: false,
    };
  }

  if (!Number.isFinite(loanAmountCzk) || loanAmountCzk < 0) {
    return {
      exactLtv: null,
      ltvBand: null,
      validationError: validationMessage("negative_loan"),
      validationCode: "negative_loan",
      exceedsSupportedMax: false,
    };
  }

  if (loanAmountCzk > propertyValueCzk) {
    return {
      exactLtv: null,
      ltvBand: null,
      validationError: validationMessage("loan_exceeds_property"),
      validationCode: "loan_exceeds_property",
      exceedsSupportedMax: false,
    };
  }

  const exactLtv = computeExactLtv(loanAmountCzk, propertyValueCzk)!;
  const ltvBand = resolveLtvBandUpperLimit(exactLtv);
  const exceedsSupportedMax = exactLtv > MAX_SUPPORTED_LTV || ltvBand == null;

  return {
    exactLtv,
    ltvBand: exceedsSupportedMax ? null : ltvBand,
    validationError: exceedsSupportedMax
      ? validationMessage("exceeds_supported_max")
      : null,
    validationCode: exceedsSupportedMax ? "exceeds_supported_max" : null,
    exceedsSupportedMax,
  };
}

/** Rate API filter uses exact LTV, not the band upper limit. */
export function rateFilterLtvFromContext(context: LtvContext): number | null {
  if (context.validationError || context.exactLtv == null) return null;
  return context.exactLtv;
}

export type {
  MarketingAttributionParams,
  MortgageJourneyContext,
  MortgageJourneyCore,
  MortgageJourneyParseResult,
  MortgageJourneyPurpose,
  SazbyRatesQuery,
} from "@/lib/mortgage-rates/mortgage-journey-context";

export {
  buildCalculatorHref,
  buildLeadMetadataFromJourney,
  buildMortgageJourneyHref,
  journeyCoreEqual,
  mergeMarketingFromSearch,
  MORTGAGE_JOURNEY_FIXATION_OPTIONS,
  MORTGAGE_JOURNEY_TERM_OPTIONS,
  parseMortgageJourneyParams,
  parseSazbySearchParams,
  SAZBY_DEFAULT_QUERY,
  serializeMortgageJourneyParams,
  serializeSazbySearchParams,
} from "@/lib/mortgage-rates/mortgage-journey-context";
export {
  formatFixationMonthsCs,
  hasExplicitMortgageJourney,
  journeyContextToMiniMortgageInput,
  MORTGAGE_JOURNEY_PURPOSE_LABELS,
  resolveMortgageJourneySummary,
  type MortgageJourneySummary,
  type MortgageJourneySummaryIncomplete,
  type MortgageJourneySummaryReady,
} from "@/lib/mortgage-rates/mortgage-journey-summary";
