/**
 * Canonical public offers for /sazby + /api/mortgage-market/offers.
 * Single SoT: audited CZ manifest catalog (not lagging Supabase rows).
 */
import { getCz20260809Catalog } from "@/lib/mortgage-market/catalog-from-manifest";
import { CZ_MANIFEST_CHECKED_AT } from "@/lib/mortgage-market/import/data/cz-2026-08-09";
import {
  getMortgageOffers,
  type GetMortgageOffersQuery,
  type GetMortgageOffersResult,
} from "@/lib/mortgage-market/offers";

const MANIFEST_NOW_MS =
  Date.parse(CZ_MANIFEST_CHECKED_AT) + 12 * 60 * 60 * 1000;

export function getPublishedCatalogOffers(
  query: Omit<GetMortgageOffersQuery, "nowMs" | "countryCode"> & {
    countryCode?: string;
  }
): GetMortgageOffersResult {
  return getMortgageOffers(getCz20260809Catalog(), {
    countryCode: query.countryCode ?? "CZ",
    purpose: query.purpose,
    fixationMonths: query.fixationMonths,
    ltv: query.ltv,
    lenderSlug: query.lenderSlug,
    productSlug: query.productSlug,
    productType: query.productType,
    borrowerScope: query.borrowerScope,
    pricingScenarioKey: query.pricingScenarioKey,
    includeLtvUnspecified: query.includeLtvUnspecified,
    activeOnly: query.activeOnly,
    nowMs: MANIFEST_NOW_MS,
  });
}
