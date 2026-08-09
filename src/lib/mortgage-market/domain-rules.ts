/**
 * Pure domain rules for the normalized mortgage market model.
 * Synthetic-testable — no DB I/O.
 */

import { matchesLtvBand } from "@/lib/mortgage-rates/ltv-band";
import type {
  ActiveRateVariantIdentity,
  MortgageEligibilityRule,
  MortgageMarketBenchmark,
  MortgageMarketRateType,
  MortgageRateCondition,
  MortgageRateVariant,
  MortgageRepresentativeExample,
} from "@/lib/mortgage-market/types";
import {
  FORBIDDEN_RATE_TYPE_LABELS,
  MORTGAGE_RATE_TYPES,
} from "@/lib/mortgage-market/types";

export function isForbiddenRateTypeLabel(value: string): boolean {
  return (FORBIDDEN_RATE_TYPE_LABELS as readonly string[]).includes(value);
}

/**
 * Sentinel matching SQL coalesce(ltv_*, -1) / coalesce(amount, -1).
 * -1 is outside valid LTV 0–100 and is not a real published bound.
 */
export const LTV_UNSPECIFIED_IDENTITY_SENTINEL = -1;

function nullableIdentityToken(value: number | null | undefined): string {
  return value == null ? String(LTV_UNSPECIFIED_IDENTITY_SENTINEL) : String(value);
}

/** True when both LTV bounds are null (source did not publish a pricing segment). */
export function isLtvUnspecified(
  variant: Pick<MortgageRateVariant, "ltvMin" | "ltvMax">
): boolean {
  return variant.ltvMin == null && variant.ltvMax == null;
}

/**
 * LTV bounds must be both null (unspecified) or both set with valid range.
 * One-sided bounds are invalid.
 */
export function assertValidLtvBounds(
  ltvMin: number | null | undefined,
  ltvMax: number | null | undefined
): boolean {
  const minNull = ltvMin == null;
  const maxNull = ltvMax == null;
  if (minNull && maxNull) return true;
  if (minNull || maxNull) return false;
  return (
    Number.isFinite(ltvMin) &&
    Number.isFinite(ltvMax) &&
    ltvMin >= 0 &&
    ltvMax <= 100 &&
    ltvMin < ltvMax
  );
}

/**
 * Product max LTV is eligibility — never invent rate LTV from it.
 * Returns false only when the importer admits the rate band was derived
 * from product.max_ltv rather than an explicit rate-source statement.
 */
export function productMaxLtvMustNotBecomeRateLtv(input: {
  productMaxLtv?: number | null;
  rateLtvMin: number | null;
  rateLtvMax: number | null;
  /** How the rate LTV was obtained. */
  ltvProvenance:
    | "explicit_in_rate_source"
    | "unspecified_in_rate_source"
    | "inferred_from_product_max";
}): boolean {
  if (input.ltvProvenance === "inferred_from_product_max") return false;
  if (input.ltvProvenance === "unspecified_in_rate_source") {
    return input.rateLtvMin == null && input.rateLtvMax == null;
  }
  return assertValidLtvBounds(input.rateLtvMin, input.rateLtvMax);
}

export function activeRateVariantIdentityKey(
  identity: ActiveRateVariantIdentity
): string {
  return [
    identity.productId,
    nullableIdentityToken(identity.fixationMonths),
    nullableIdentityToken(identity.ltvMin),
    nullableIdentityToken(identity.ltvMax),
    identity.ltvMinExclusive ? "minEx" : "minIn",
    identity.ltvMaxExclusive ? "maxEx" : "maxIn",
    identity.pricingScenarioKey,
    identity.rateType,
    identity.financingPurpose ?? "",
    nullableIdentityToken(identity.minLoanAmount),
    nullableIdentityToken(identity.maxLoanAmount),
  ].join("|");
}

/**
 * Detect duplicate ACTIVE identical variants (mirrors partial unique index).
 * Inactive historical rows may share the same identity.
 * Distinct pricing_scenario_key values may coexist.
 */
export function findDuplicateActiveVariantIdentities(
  variants: MortgageRateVariant[]
): string[] {
  const seen = new Map<string, number>();
  for (const v of variants) {
    if (!v.isActive) continue;
    const key = activeRateVariantIdentityKey({
      productId: v.productId,
      fixationMonths: v.fixationMonths,
      ltvMin: v.ltvMin,
      ltvMax: v.ltvMax,
      ltvMinExclusive: v.ltvMinExclusive,
      ltvMaxExclusive: v.ltvMaxExclusive,
      pricingScenarioKey: v.pricingScenarioKey,
      rateType: v.rateType,
      financingPurpose: v.financingPurpose,
      minLoanAmount: v.minLoanAmount,
      maxLoanAmount: v.maxLoanAmount,
    });
    seen.set(key, (seen.get(key) ?? 0) + 1);
  }
  return [...seen.entries()].filter(([, n]) => n > 1).map(([k]) => k);
}

export function historyCanCoexist(
  inactive: Pick<MortgageRateVariant, "isActive" | "validTo">,
  active: Pick<MortgageRateVariant, "isActive" | "validTo">
): boolean {
  return inactive.isActive === false && active.isActive === true;
}

/**
 * Apply published conditions to a rate ONLY when rateEffectBp is present.
 * Conditions never invent discounts.
 */
export function applyPublishedRateEffects(
  nominalRate: number,
  conditions: MortgageRateCondition[]
): { rate: number; appliedEffectsBp: number } {
  let applied = 0;
  for (const c of conditions) {
    if (!c.isActive) continue;
    if (c.rateEffectBp == null || !Number.isFinite(c.rateEffectBp)) continue;
    applied += c.rateEffectBp;
  }
  // bp → percentage points
  return { rate: nominalRate + applied / 100, appliedEffectsBp: applied };
}

/**
 * Eligibility never modifies rate unless changesPricing + published bp.
 */
export function eligibilityAffectsRate(
  rule: MortgageEligibilityRule
): boolean {
  return (
    rule.changesPricing === true &&
    rule.pricingEffectBp != null &&
    Number.isFinite(rule.pricingEffectBp)
  );
}

export function representativeExampleDiffersFromNominal(
  example: MortgageRepresentativeExample,
  variant: MortgageRateVariant
): boolean {
  if (example.rpsn == null || example.nominalRate == null) return false;
  if (example.nominalRate !== variant.nominalInterestRate) return true;
  return example.rpsn !== example.nominalRate;
}

export function isMarketBenchmarkNotLenderRate(
  entity: MortgageMarketBenchmark | { entityKind?: string }
): boolean {
  return entity.entityKind === "market_benchmark";
}

/**
 * Personalized LTV match. LTV-unspecified rates never match a numeric LTV —
 * they are not "universal" bands.
 */
export function variantMatchesLtv(
  variant: Pick<
    MortgageRateVariant,
    "ltvMin" | "ltvMax" | "ltvMinExclusive" | "ltvMaxExclusive"
  >,
  ltv: number
): boolean {
  if (isLtvUnspecified(variant)) return false;
  if (variant.ltvMin == null || variant.ltvMax == null) return false;
  return matchesLtvBand(variant.ltvMin, variant.ltvMax, ltv, {
    ltvMinExclusive: variant.ltvMinExclusive,
    ltvMaxExclusive: variant.ltvMaxExclusive,
  });
}

export function assertValidRateType(
  rateType: string
): rateType is MortgageMarketRateType {
  if (isForbiddenRateTypeLabel(rateType)) return false;
  return (MORTGAGE_RATE_TYPES as readonly string[]).includes(rateType);
}

/** Documented RLS stance for tests — no anon write verbs. */
export const MORTGAGE_MARKET_RLS_POLICY = {
  anonInsert: false,
  anonUpdate: false,
  anonDelete: false,
  anonSelect: false,
  serverServiceRoleReads: true,
  browserServiceRoleForbidden: true,
} as const;

/** Exact SQL identity columns documented for launch gate reports. */
export const RATE_VARIANT_ACTIVE_IDENTITY_FIELDS = [
  "product_id",
  "fixation_months",
  "coalesce(ltv_min, (-1)::numeric)",
  "coalesce(ltv_max, (-1)::numeric)",
  "ltv_min_exclusive",
  "ltv_max_exclusive",
  "pricing_scenario_key",
  "rate_type",
  "coalesce(financing_purpose, '')",
  "coalesce(min_loan_amount, (-1)::numeric)",
  "coalesce(max_loan_amount, (-1)::numeric)",
] as const;
