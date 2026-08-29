import { getCz20260809Catalog } from "@/lib/mortgage-market/catalog-from-manifest";
import { getMortgageOffersFromSupabase } from "@/lib/mortgage-market/offers.server";
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

const MANIFEST_NOW_MS = Date.parse("2026-08-09T12:00:00.000Z");

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
  } as const;

  try {
    const live = await getMortgageOffersFromSupabase(query);
    if (live) return live;
  } catch {
    // Manifest mirror for build/dev without service role.
  }

  return getMortgageOffers(getCz20260809Catalog(), {
    ...query,
    nowMs: MANIFEST_NOW_MS,
  });
}

/** Cached homepage offers — avoids Supabase round-trip on every TTFB. */
export const getCachedHomeOffers = unstable_cache(
  loadHomeOffersUncached,
  ["home-page-offers-v1"],
  { revalidate: 3600, tags: ["home-offers"] }
);
