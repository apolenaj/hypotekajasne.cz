import { getCz20260809Catalog } from "@/lib/mortgage-market/catalog-from-manifest";
import {
  getMortgageOffers,
  type GetMortgageOffersResult,
} from "@/lib/mortgage-market/offers";
import {
  buildLtvContext,
  rateFilterLtvFromContext,
  SAZBY_DEFAULT_QUERY,
} from "@/lib/mortgage-rates/ltv-context";
import { unstable_cache } from "next/cache";

const MANIFEST_NOW_MS = Date.parse("2026-09-21T12:00:00.000Z");

async function loadHomeOffersUncached(): Promise<GetMortgageOffersResult | null> {
  const ltvContext = buildLtvContext({
    propertyValueCzk: SAZBY_DEFAULT_QUERY.propertyValueCzk,
    loanAmountCzk: SAZBY_DEFAULT_QUERY.loanAmountCzk,
  });
  const filterLtv = rateFilterLtvFromContext(ltvContext);
  if (filterLtv == null) return null;

  const query = {
    countryCode: "CZ",
    purpose: SAZBY_DEFAULT_QUERY.purpose,
    fixationMonths: SAZBY_DEFAULT_QUERY.fixationMonths,
    ltv: filterLtv,
    includeLtvUnspecified: true,
    nowMs: MANIFEST_NOW_MS,
  } as const;

  // Same SoT as /sazby: audited manifest catalog (not lagging Supabase rows).
  return getMortgageOffers(getCz20260809Catalog(), query);
}

/** Cached homepage offers from the verified manifest catalog. */
export const getCachedHomeOffers = unstable_cache(
  loadHomeOffersUncached,
  ["home-page-offers-v2-manifest"],
  { revalidate: 3600, tags: ["home-offers"] }
);
