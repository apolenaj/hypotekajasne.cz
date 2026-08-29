"use client";

import { PublishedRatesPanel } from "@/components/mortgage-market/PublishedRatesPanel";
import { RpsnEducationBlock } from "@/components/mortgage-market/RpsnEducationBlock";
import type { GetMortgageOffersResult } from "@/lib/mortgage-market/offers";
import type { LtvContext, MortgageJourneyCore } from "@/lib/mortgage-rates/ltv-context";

export function HomeRatesBlock({
  initialOffers,
  initialQuery,
  initialLtvContext,
}: {
  initialOffers: GetMortgageOffersResult | null;
  initialQuery: MortgageJourneyCore;
  initialLtvContext: LtvContext;
}) {
  return (
    <>
      <PublishedRatesPanel
        initialResult={initialOffers}
        initialQuery={initialQuery}
        initialLtvContext={initialLtvContext}
        headingId="home-rates-heading"
        variant="home"
      />
      <RpsnEducationBlock />
    </>
  );
}
