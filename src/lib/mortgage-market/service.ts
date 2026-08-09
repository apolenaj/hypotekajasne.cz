/**
 * Future service boundaries for the normalized mortgage market model.
 * Not wired into production UI. No invented pricing.
 */

import type {
  MortgageCatalogProduct,
  MortgageEligibilityRule,
  MortgageMarketBenchmark,
  MortgageProductType,
  MortgageRateVariant,
  MortgageRepresentativeExample,
} from "@/lib/mortgage-market/types";
import {
  isLtvUnspecified,
  variantMatchesLtv,
} from "@/lib/mortgage-market/domain-rules";

export type GetMortgageProductsQuery = {
  countryCode?: string;
  lenderId?: string;
  productType?: MortgageProductType;
  activeOnly?: boolean;
};

export type GetRateVariantsQuery = {
  productId: string;
  fixationMonths?: number;
  /** Personalized LTV — never auto-matches LTV-unspecified rates. */
  ltv?: number;
  /**
   * Opt-in only: also return LTV-unspecified rates when filtering by `ltv`.
   * Default false (launch-safe: unknown LTV ≠ universal match).
   */
  includeLtvUnspecified?: boolean;
  /**
   * Catalog filter when not personalizing by numeric LTV.
   * Default "any".
   */
  ltvScope?: "any" | "explicit" | "unspecified";
  activeOnly?: boolean;
};

export type GetEligibleProductsQuery = {
  productType?: MortgageProductType;
  ltv?: number;
  /** Caller-supplied eligibility context — matching is future work. */
  applicantType?: string;
  purpose?: string;
};

/**
 * Filter catalog products in-memory (future: Supabase reader).
 */
export function getMortgageProducts(
  products: MortgageCatalogProduct[],
  query: GetMortgageProductsQuery = {}
): MortgageCatalogProduct[] {
  const activeOnly = query.activeOnly !== false;
  return products.filter((p) => {
    if (activeOnly && !p.isActive) return false;
    if (query.lenderId && p.lenderId !== query.lenderId) return false;
    if (query.productType && p.productType !== query.productType) return false;
    return true;
  });
}

/**
 * Eligibility screening stub — returns products that are not hard-blocked
 * by active rules. Does NOT invent pricing changes.
 */
export function getEligibleMortgageProducts(
  products: MortgageCatalogProduct[],
  rules: MortgageEligibilityRule[],
  query: GetEligibleProductsQuery = {}
): MortgageCatalogProduct[] {
  const activeProducts = getMortgageProducts(products, {
    productType: query.productType,
    activeOnly: true,
  });

  return activeProducts.filter((product) => {
    const productRules = rules.filter(
      (r) => r.productId === product.id && r.isActive
    );
    if (query.ltv != null && product.maxLtv != null && query.ltv > product.maxLtv) {
      return false;
    }
    // Hard blocks by purpose code when caller provides purpose
    if (query.purpose) {
      const blocked = productRules.some(
        (r) =>
          (r.effect === "not_eligible" || r.effect === "block") &&
          r.ruleCategory === "purpose" &&
          r.ruleCode === query.purpose
      );
      if (blocked) return false;
    }
    if (query.applicantType) {
      const blocked = productRules.some(
        (r) =>
          (r.effect === "not_eligible" || r.effect === "block") &&
          r.ruleCategory === "applicant" &&
          r.ruleCode === query.applicantType
      );
      if (blocked) return false;
    }
    return true;
  });
}

export function getRateVariants(
  variants: MortgageRateVariant[],
  query: GetRateVariantsQuery
): MortgageRateVariant[] {
  const activeOnly = query.activeOnly !== false;
  const ltvScope = query.ltvScope ?? "any";
  return variants.filter((v) => {
    if (v.productId !== query.productId) return false;
    if (activeOnly && !v.isActive) return false;
    if (
      query.fixationMonths != null &&
      v.fixationMonths !== query.fixationMonths
    ) {
      return false;
    }

    const unspecified = isLtvUnspecified(v);

    if (query.ltv != null) {
      if (unspecified) {
        // Conservative: unknown LTV never masquerades as an LTV match.
        return query.includeLtvUnspecified === true;
      }
      return variantMatchesLtv(v, query.ltv);
    }

    if (ltvScope === "explicit" && unspecified) return false;
    if (ltvScope === "unspecified" && !unspecified) return false;
    return true;
  });
}

export function getRepresentativeExamples(
  examples: MortgageRepresentativeExample[],
  productId: string,
  activeOnly = true
): MortgageRepresentativeExample[] {
  return examples.filter(
    (e) => e.productId === productId && (!activeOnly || e.isActive)
  );
}

export function getMarketBenchmark(
  benchmarks: MortgageMarketBenchmark[],
  input: { provider?: string; countryCode?: string; activeOnly?: boolean } = {}
): MortgageMarketBenchmark[] {
  const activeOnly = input.activeOnly !== false;
  return benchmarks.filter((b) => {
    if (b.entityKind !== "market_benchmark") return false;
    if (activeOnly && !b.isActive) return false;
    if (input.provider && b.provider !== input.provider) return false;
    if (input.countryCode && b.countryCode !== input.countryCode) return false;
    return true;
  });
}
