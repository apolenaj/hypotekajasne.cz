"use client";

import { PublishedRatesPanel } from "@/components/mortgage-market/PublishedRatesPanel";
import { RpsnEducationBlock } from "@/components/mortgage-market/RpsnEducationBlock";
import type { GetMortgageOffersResult } from "@/lib/mortgage-market/offers";
import type { LtvContext, MortgageJourneyCore } from "@/lib/mortgage-rates/ltv-context";

export function HomeRatesBlock({
  initialOffers,
  initialQuery,
  initialLtvContext,
  layout = "page",
}: {
  initialOffers: GetMortgageOffersResult | null;
  initialQuery: MortgageJourneyCore;
  initialLtvContext: LtvContext;
  layout?: "page" | "aside";
}) {
  return (
    <>
      <PublishedRatesPanel
        initialResult={initialOffers}
        initialQuery={initialQuery}
        initialLtvContext={initialLtvContext}
        headingId="home-rates-heading"
        variant="home"
        layout={layout}
      />
      {layout === "aside" ? null : <RpsnEducationBlock />}
    </>
  );
}
