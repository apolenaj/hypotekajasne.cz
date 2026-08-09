/**
 * Normalized mortgage-market offer selection (Phase 2 Step 2.4).
 * Reads catalog rows in-memory; Supabase I/O lives in offers.server.ts.
 * Never mixes DEFAULT_CZ_MODEL_RATE into lender offers.
 * Not wired into production UI.
 */

import {
  isLtvUnspecified,
  variantMatchesLtv,
} from "@/lib/mortgage-market/domain-rules";
import type {
  MortgageMarketRateType,
  RateConditionRole,
  RateConditionType,
  SourceEvidenceType,
} from "@/lib/mortgage-market/types";
import {
  rateFreshnessFromCheckedAt,
  type RateFreshness,
} from "@/lib/rates/mortgage-rate-freshness";

export type CatalogLender = {
  id: string;
  slug: string;
  name: string;
  countryCode: string;
  isActive: boolean;
};

export type CatalogProduct = {
  id: string;
  lenderId: string;
  slug: string;
  name: string;
  productType: string;
  /** natural_person | entrepreneur | … — default natural_person when absent */
  borrowerScope?: string | null;
  maxLtv?: number | null;
  isActive: boolean;
};

export type CatalogRateVariant = {
  id: string;
  productId: string;
  pricingScenarioKey: string;
  pricingScenarioLabel?: string | null;
  financingPurpose?: string | null;
  fixationMonths: number | null;
  ltvMin: number | null;
  ltvMax: number | null;
  ltvMinExclusive: boolean;
  ltvMaxExclusive: boolean;
  nominalInterestRate: number;
  rateType: MortgageMarketRateType;
  validFrom: string;
  validTo?: string | null;
  checkedAt: string;
  isActive: boolean;
  sourceEvidenceId?: string | null;
  notes?: string | null;
};

export type CatalogCondition = {
  id: string;
  rateVariantId: string;
  conditionType: RateConditionType | string;
  conditionRole: RateConditionRole | string;
  insuranceKind?: string | null;
  requirementMode?: string | null;
  rateEffectBp?: number | null;
  description: string;
  isRequired: boolean;
  isOptional: boolean;
  isActive: boolean;
};

export type CatalogFee = {
  id: string;
  productId: string;
  feeType: string;
  amount?: number | null;
  currency: string;
  frequency: string;
  description?: string | null;
  isMandatory: boolean;
  isActive: boolean;
};

export type CatalogEvidence = {
  id: string;
  sourceType: SourceEvidenceType | string;
  sourceName: string;
  sourceUrl?: string | null;
  checkedAt: string;
  reliabilityTier?: string | null;
};

export type CatalogRepresentativeExample = {
  id: string;
  productId: string;
  rateVariantId?: string | null;
  loanAmount: number;
  termYears: number;
  fixationMonths?: number | null;
  nominalRate?: number | null;
  rpsn?: number | null;
  monthlyPayment?: number | null;
  totalAmountPayable?: number | null;
  insuranceIncluded?: boolean | null;
  insuranceCost?: number | null;
  representativeExampleText?: string | null;
  isActive: boolean;
};

export type MortgageMarketCatalog = {
  lenders: CatalogLender[];
  products: CatalogProduct[];
  rates: CatalogRateVariant[];
  conditions: CatalogCondition[];
  fees: CatalogFee[];
  evidence: CatalogEvidence[];
  examples?: CatalogRepresentativeExample[];
};

export type GetMortgageOffersQuery = {
  countryCode?: string;
  purpose?: string;
  fixationMonths?: number;
  /** Personalized LTV — never auto-matches unspecified LTV as "your LTV". */
  ltv?: number;
  lenderSlug?: string;
  productSlug?: string;
  /** Explicit product_type filter (e.g. business_secured). */
  productType?: string;
  /** Explicit borrower_scope filter (e.g. entrepreneur). */
  borrowerScope?: string;
  pricingScenarioKey?: string;
  /**
   * When true with `ltv`, also return unspecified-LTV published rates in
   * `unspecifiedLtvOffers` (never as personalized matches).
   */
  includeLtvUnspecified?: boolean;
  nowMs?: number;
  activeOnly?: boolean;
};

export type MortgageOfferCondition = {
  conditionType: string;
  conditionRole: string;
  insuranceKind?: string | null;
  requirementMode?: string | null;
  /** NULL unless lender published a numeric effect — never assumed. */
  rateEffectBp: number | null;
  description: string;
  isRequired: boolean;
  isOptional: boolean;
};

export type MortgageOffer = {
  lenderSlug: string;
  lenderName: string;
  productSlug: string;
  productName: string;
  productType: string;
  borrowerScope: string;
  rateVariantId: string;
  nominalInterestRate: number;
  rateType: MortgageMarketRateType;
  pricingScenarioKey: string;
  pricingScenarioLabel?: string | null;
  financingPurpose?: string | null;
  fixationMonths: number | null;
  ltvScope: "explicit" | "unspecified";
  ltvMin: number | null;
  ltvMax: number | null;
  ltvMinExclusive: boolean;
  ltvMaxExclusive: boolean;
  /** True only when an explicit LTV band matched the query LTV. */
  claimsPersonalizedLtvMatch: boolean;
  conditions: MortgageOfferCondition[];
  fees: Array<{
    feeType: string;
    amount: number | null;
    currency: string;
    frequency: string;
    description: string | null;
  }>;
  evidence: {
    id: string;
    sourceType: string;
    sourceName: string;
    sourceUrl: string | null;
    checkedAt: string;
    reliabilityTier: string | null;
  } | null;
  checkedAt: string;
  validFrom: string;
  freshness: Exclude<RateFreshness, "fallback">;
};

export type LenderAvailability = {
  lenderSlug: string;
  lenderName: string;
  productSlug: string;
  productName: string;
  rateStatus: "available" | "verification_pending" | "no_matching_rate";
  message: string;
};

export type GetMortgageOffersResult = {
  /** Explicit LTV matches and/or non-LTV-filtered scenario rows. */
  offers: MortgageOffer[];
  /**
   * Published rates with unspecified LTV — never claim they match a numeric LTV.
   * Populated only when query.ltv is set and includeLtvUnspecified is true.
   */
  unspecifiedLtvOffers: MortgageOffer[];
  lenderAvailability: LenderAvailability[];
  /** Always false for this service — model fallback must not mix in. */
  usedModelFallback: false;
};

function purposeMatches(
  financingPurpose: string | null | undefined,
  queryPurpose: string | undefined
): boolean {
  if (!queryPurpose) return true;
  if (financingPurpose == null || financingPurpose === "") return true;
  return financingPurpose === queryPurpose;
}

const BUSINESS_PRODUCT_TYPES = new Set(["business_secured"]);
const ENTREPRENEUR_BORROWER_SCOPES = new Set([
  "entrepreneur",
  "legal_entity",
  "company",
]);

/** Trade / entrepreneur / business-secured products — not ordinary residential. */
export function isBusinessOrientedProduct(product: CatalogProduct): boolean {
  const type = (product.productType || "").toLowerCase();
  const scope = (product.borrowerScope || "natural_person").toLowerCase();
  return (
    BUSINESS_PRODUCT_TYPES.has(type) || ENTREPRENEUR_BORROWER_SCOPES.has(scope)
  );
}

/**
 * Ordinary purchase/refinance journeys exclude business/entrepreneur products
 * unless the caller explicitly asks via productSlug, productType, or borrowerScope.
 * financing_purpose overlap alone must not surface trade mortgages.
 */
export function productMatchesQuery(
  product: CatalogProduct,
  query: GetMortgageOffersQuery
): boolean {
  if (query.productSlug && product.slug !== query.productSlug) return false;
  if (query.productType && product.productType !== query.productType) {
    return false;
  }
  if (query.borrowerScope) {
    const scope = product.borrowerScope || "natural_person";
    if (scope !== query.borrowerScope) return false;
  }

  const explicitProductAudience =
    Boolean(query.productSlug) ||
    Boolean(query.productType) ||
    Boolean(query.borrowerScope);

  if (!explicitProductAudience && isBusinessOrientedProduct(product)) {
    return false;
  }
  return true;
}

function toOffer(
  catalog: MortgageMarketCatalog,
  lender: CatalogLender,
  product: CatalogProduct,
  rate: CatalogRateVariant,
  claimsPersonalizedLtvMatch: boolean,
  nowMs: number
): MortgageOffer {
  const unspecified = isLtvUnspecified(rate);
  const conditions = catalog.conditions
    .filter((c) => c.rateVariantId === rate.id && c.isActive)
    .map((c) => ({
      conditionType: c.conditionType,
      conditionRole: c.conditionRole,
      insuranceKind: c.insuranceKind ?? null,
      requirementMode: c.requirementMode ?? null,
      rateEffectBp: c.rateEffectBp ?? null,
      description: c.description,
      isRequired: c.isRequired,
      isOptional: c.isOptional,
    }));

  const fees = catalog.fees
    .filter((f) => f.productId === product.id && f.isActive)
    .map((f) => ({
      feeType: f.feeType,
      amount: f.amount ?? null,
      currency: f.currency,
      frequency: f.frequency,
      description: f.description ?? null,
    }));

  const evidence =
    catalog.evidence.find((e) => e.id === rate.sourceEvidenceId) ?? null;

  return {
    lenderSlug: lender.slug,
    lenderName: lender.name,
    productSlug: product.slug,
    productName: product.name,
    productType: product.productType,
    borrowerScope: product.borrowerScope || "natural_person",
    rateVariantId: rate.id,
    nominalInterestRate: rate.nominalInterestRate,
    rateType: rate.rateType,
    pricingScenarioKey: rate.pricingScenarioKey,
    pricingScenarioLabel: rate.pricingScenarioLabel ?? null,
    financingPurpose: rate.financingPurpose ?? null,
    fixationMonths: rate.fixationMonths,
    ltvScope: unspecified ? "unspecified" : "explicit",
    ltvMin: rate.ltvMin,
    ltvMax: rate.ltvMax,
    ltvMinExclusive: rate.ltvMinExclusive,
    ltvMaxExclusive: rate.ltvMaxExclusive,
    claimsPersonalizedLtvMatch,
    conditions,
    fees,
    evidence: evidence
      ? {
          id: evidence.id,
          sourceType: evidence.sourceType,
          sourceName: evidence.sourceName,
          sourceUrl: evidence.sourceUrl ?? null,
          checkedAt: evidence.checkedAt,
          reliabilityTier: evidence.reliabilityTier ?? null,
        }
      : null,
    checkedAt: rate.checkedAt,
    validFrom: rate.validFrom,
    freshness: rateFreshnessFromCheckedAt(rate.checkedAt, nowMs),
  };
}

/**
 * Select lender offers from a normalized catalog snapshot.
 * Multiple pricing scenarios are returned together (never randomly collapsed).
 */
export function getMortgageOffers(
  catalog: MortgageMarketCatalog,
  query: GetMortgageOffersQuery = {}
): GetMortgageOffersResult {
  const country = (query.countryCode ?? "CZ").toUpperCase();
  const activeOnly = query.activeOnly !== false;
  const nowMs = query.nowMs ?? Date.now();

  const lenders = catalog.lenders.filter(
    (l) =>
      l.countryCode.toUpperCase() === country &&
      (!activeOnly || l.isActive) &&
      (!query.lenderSlug || l.slug === query.lenderSlug)
  );

  const offers: MortgageOffer[] = [];
  const unspecifiedLtvOffers: MortgageOffer[] = [];
  const lenderAvailability: LenderAvailability[] = [];

  for (const lender of lenders) {
    const products = catalog.products.filter(
      (p) =>
        p.lenderId === lender.id &&
        (!activeOnly || p.isActive) &&
        productMatchesQuery(p, query)
    );

    if (products.length === 0) {
      lenderAvailability.push({
        lenderSlug: lender.slug,
        lenderName: lender.name,
        productSlug: query.productSlug ?? "*",
        productName: query.productSlug ?? "*",
        rateStatus: "verification_pending",
        message: "No catalog product for this lender/filter.",
      });
      continue;
    }

    for (const product of products) {
      const rates = catalog.rates.filter((r) => {
        if (r.productId !== product.id) return false;
        if (activeOnly && !r.isActive) return false;
        if (
          query.fixationMonths != null &&
          r.fixationMonths != null &&
          r.fixationMonths !== query.fixationMonths
        ) {
          return false;
        }
        if (!purposeMatches(r.financingPurpose, query.purpose)) return false;
        if (
          query.pricingScenarioKey &&
          r.pricingScenarioKey !== query.pricingScenarioKey
        ) {
          return false;
        }
        return true;
      });

      if (rates.length === 0) {
        lenderAvailability.push({
          lenderSlug: lender.slug,
          lenderName: lender.name,
          productSlug: product.slug,
          productName: product.name,
          rateStatus: "verification_pending",
          message:
            "Product available / verified bank rate unavailable for this filter (no active matching rate variant).",
        });
        continue;
      }

      let matchedAny = false;
      for (const rate of rates) {
        const unspecified = isLtvUnspecified(rate);
        const fixationUnpublished = rate.fixationMonths == null;

        // Fixation filter: unpublished fixation never matches a selected fixation
        // as a personalized/matrix row — surface only in the non-LTV-match bucket.
        if (
          query.fixationMonths != null &&
          rate.fixationMonths != null &&
          rate.fixationMonths !== query.fixationMonths
        ) {
          continue;
        }

        if (query.ltv != null) {
          if (unspecified || fixationUnpublished) {
            if (query.includeLtvUnspecified) {
              unspecifiedLtvOffers.push(
                toOffer(catalog, lender, product, rate, false, nowMs)
              );
            }
            continue;
          }
          if (!variantMatchesLtv(rate, query.ltv)) continue;
          offers.push(toOffer(catalog, lender, product, rate, true, nowMs));
          matchedAny = true;
          continue;
        }

        if (fixationUnpublished && query.fixationMonths != null) {
          // No LTV filter but fixation selected — keep conditional "od" visible
          // without claiming it is the selected fixation.
          unspecifiedLtvOffers.push(
            toOffer(catalog, lender, product, rate, false, nowMs)
          );
          continue;
        }

        // No personalized LTV filter — return published scenarios as-is.
        offers.push(
          toOffer(catalog, lender, product, rate, false, nowMs)
        );
        matchedAny = true;
      }

      if (!matchedAny && query.ltv != null) {
        const hasUnspecified = rates.some((r) => isLtvUnspecified(r));
        lenderAvailability.push({
          lenderSlug: lender.slug,
          lenderName: lender.name,
          productSlug: product.slug,
          productName: product.name,
          rateStatus: hasUnspecified
            ? "no_matching_rate"
            : "no_matching_rate",
          message: hasUnspecified
            ? "Published rates exist with unspecified LTV scope; they do not claim a personalized LTV match."
            : "No explicit LTV band matches the requested LTV.",
        });
      }
    }
  }

  // Stable order: lender, product, scenario, rate
  const sortOffers = (list: MortgageOffer[]) =>
    list.sort((a, b) => {
      const k = [
        a.lenderSlug.localeCompare(b.lenderSlug),
        a.productSlug.localeCompare(b.productSlug),
        a.pricingScenarioKey.localeCompare(b.pricingScenarioKey),
        a.nominalInterestRate - b.nominalInterestRate,
      ];
      return k.find((n) => n !== 0) ?? 0;
    });

  return {
    offers: sortOffers(offers),
    unspecifiedLtvOffers: sortOffers(unspecifiedLtvOffers),
    lenderAvailability,
    usedModelFallback: false,
  };
}

/** Separate RPSN examples — never used to invent a “cheaper” ranking. */
export function getCatalogRepresentativeExamples(
  catalog: MortgageMarketCatalog,
  filter: { productSlug?: string; lenderSlug?: string } = {}
): CatalogRepresentativeExample[] {
  const productIds = new Set(
    catalog.products
      .filter((p) => {
        if (filter.productSlug && p.slug !== filter.productSlug) return false;
        if (filter.lenderSlug) {
          const lender = catalog.lenders.find((l) => l.id === p.lenderId);
          if (!lender || lender.slug !== filter.lenderSlug) return false;
        }
        return true;
      })
      .map((p) => p.id)
  );
  return (catalog.examples ?? []).filter(
    (e) => e.isActive && productIds.has(e.productId)
  );
}
