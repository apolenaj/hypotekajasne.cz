/**
 * Phase 2 central reference-rate domain types.
 * Runtime resolution lives in `@/lib/rates/mortgageRateService` (one service).
 */

export const MORTGAGE_PURPOSES = [
  "purchase",
  "refinance",
  "investment",
] as const;

export type MortgagePurpose = (typeof MORTGAGE_PURPOSES)[number];

/** @deprecated Prefer MortgagePurpose */
export type MortgageRatePurpose = MortgagePurpose;

export const MORTGAGE_RATE_KINDS = [
  "illustrative",
  "model",
  "market_reference",
] as const;

export type MortgageRateKind = (typeof MORTGAGE_RATE_KINDS)[number];

/** @deprecated Prefer MORTGAGE_PURPOSES */
export const MORTGAGE_RATE_PURPOSES = MORTGAGE_PURPOSES;

/** @deprecated Prefer RateFreshness from mortgageRateService */
export type ReferenceRateFreshness =
  | "fresh"
  | "aging"
  | "stale"
  | "fallback";

export const REFERENCE_RATE_PUBLIC_LABEL_KEY = "orientacni_sazba" as const;

export type MortgageRateRecord = {
  id: string;
  countryCode: string;
  purpose: MortgagePurpose;
  fixationYears: number;
  ltvMin: number;
  ltvMax: number;
  /** When true: match requires ltv > ltvMin (e.g. >80–90 band). */
  ltvMinExclusive: boolean;
  /** When true: match requires ltv < ltvMax. Default false → ltv <= ltvMax. */
  ltvMaxExclusive: boolean;
  rate: number;
  rateKind: MortgageRateKind;
  providerName?: string | null;
  sourceName?: string | null;
  sourceUrl?: string | null;
  checkedAt: string;
  validFrom: string;
  validTo?: string | null;
  isActive: boolean;
  notes?: string | null;
};

export type MortgageRateRow = {
  id: string;
  country_code: string;
  purpose: string;
  fixation_years: number;
  ltv_min: number;
  ltv_max: number;
  ltv_min_exclusive: boolean;
  ltv_max_exclusive: boolean;
  rate: number;
  rate_kind: string;
  provider_name: string | null;
  source_name: string | null;
  source_url: string | null;
  checked_at: string;
  valid_from: string;
  valid_to: string | null;
  is_active: boolean;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
};

export type ResolveReferenceRateQuery = {
  countryCode?: string;
  purpose?: MortgagePurpose;
  fixationYears?: number;
  ltvPercent?: number;
  rateKind?: MortgageRateKind;
  nowMs?: number;
};

/** @deprecated Prefer MortgageRateResult from mortgageRateService */
export type ReferenceMortgageRate = MortgageRateRecord & {
  ratePercent: number;
  freshness: ReferenceRateFreshness;
  isModelFallback: boolean;
  publicLabelKey: typeof REFERENCE_RATE_PUBLIC_LABEL_KEY;
  source?: "supabase" | "fallback";
};

export function isMortgagePurpose(value: string): value is MortgagePurpose {
  return (MORTGAGE_PURPOSES as readonly string[]).includes(value);
}

export function isMortgageRateKind(value: string): value is MortgageRateKind {
  return (MORTGAGE_RATE_KINDS as readonly string[]).includes(value);
}
