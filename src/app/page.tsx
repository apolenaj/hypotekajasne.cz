import type { Metadata } from "next";
import { HomeExperience } from "@/components/home/HomeExperience";
import { getMortgageOffersFromSupabase } from "@/lib/mortgage-market/offers.server";
import { getCz20260809Catalog } from "@/lib/mortgage-market/catalog-from-manifest";
import { getMortgageOffers } from "@/lib/mortgage-market/offers";
import { rootMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = rootMetadata;

export const dynamic = "force-dynamic";

async function loadHomeOffers() {
  const query = {
    countryCode: "CZ",
    purpose: "purchase",
    fixationMonths: 36,
    ltv: 75,
    includeLtvUnspecified: true,
  } as const;

  try {
    const live = await getMortgageOffersFromSupabase(query);
    if (live) return live;
  } catch {
    // Fall through to manifest mirror for build/dev without service role.
  }

  return getMortgageOffers(getCz20260809Catalog(), {
    ...query,
    nowMs: Date.parse("2026-08-09T12:00:00.000Z"),
  });
}

export default async function Home() {
  const initialOffers = await loadHomeOffers();
  return <HomeExperience initialOffers={initialOffers} />;
}
