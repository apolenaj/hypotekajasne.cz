import { getPublishedCatalogOffers } from "@/lib/mortgage-market/published-catalog-offers";
import type { GetMortgageOffersResult } from "@/lib/mortgage-market/offers";
import {
  buildLtvContext,
  rateFilterLtvFromContext,
  SAZBY_DEFAULT_QUERY,
} from "@/lib/mortgage-rates/ltv-context";
import { unstable_cache } from "next/cache";

async function loadHomeOffersUncached(): Promise<GetMortgageOffersResult | null> {
  const ltvContext = buildLtvContext({
    propertyValueCzk: SAZBY_DEFAULT_QUERY.propertyValueCzk,
    loanAmountCzk: SAZBY_DEFAULT_QUERY.loanAmountCzk,
  });
  const filterLtv = rateFilterLtvFromContext(ltvContext);
  if (filterLtv == null) return null;

  // Same SoT as /sazby + /api/mortgage-market/offers.
  return getPublishedCatalogOffers({
    purpose: SAZBY_DEFAULT_QUERY.purpose,
    fixationMonths: SAZBY_DEFAULT_QUERY.fixationMonths,
    ltv: filterLtv,
    includeLtvUnspecified: true,
  });
}

/** Cached homepage offers from the verified manifest catalog. */
export const getCachedHomeOffers = unstable_cache(
  loadHomeOffersUncached,
  ["home-page-offers-v2-manifest"],
  { revalidate: 3600, tags: ["home-offers"] }
);
