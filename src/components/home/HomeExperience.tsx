"use client";

import { CockpitHero } from "@/components/home/CockpitHero";
import { HomeSituationSelector } from "@/components/home/HomeSituationSelector";
import { HomeHowItWorks } from "@/components/home/HomeHowItWorks";
import { HomeTeamStrip } from "@/components/home/HomeTeamStrip";
import { HomeFinalCta } from "@/components/home/HomeFinalCta";
import { PublishedRatesPanel } from "@/components/mortgage-market/PublishedRatesPanel";
import { RpsnEducationBlock } from "@/components/mortgage-market/RpsnEducationBlock";
import type { GetMortgageOffersResult } from "@/lib/mortgage-market/offers";

const DEFAULT_QUERY = {
  purpose: "purchase" as const,
  fixationMonths: 36,
  ltv: 75,
};

type HomeExperienceProps = {
  initialOffers: GetMortgageOffersResult | null;
};

/**
 * Launch homepage — short conversion journey.
 * Personalizovaný dashboard zůstává na /dashboard.
 */
export function HomeExperience({ initialOffers }: HomeExperienceProps) {
  return (
    <>
      <CockpitHero />
      <HomeSituationSelector />
      <PublishedRatesPanel
        initialResult={initialOffers}
        initialQuery={DEFAULT_QUERY}
        headingId="home-rates-heading"
      />
      <RpsnEducationBlock />
      <HomeHowItWorks />
      <HomeTeamStrip />
      <HomeFinalCta
        journeyMetadata={{
          purpose: DEFAULT_QUERY.purpose,
          fixationMonths: DEFAULT_QUERY.fixationMonths,
          ltv: DEFAULT_QUERY.ltv,
        }}
      />
    </>
  );
}
