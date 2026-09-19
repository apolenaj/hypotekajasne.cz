import { HomeBottomCta } from "@/components/home/HomeBottomCta";
import { HomeEditorial } from "@/components/home/HomeEditorial";
import { HomeFaq } from "@/components/home/HomeFaq";
import { HomePathCards } from "@/components/home/HomePathCards";
import { HomePremiumHero } from "@/components/home/HomePremiumHero";
import { HomePriceDeferred } from "@/components/home/HomePriceDeferred";
import { HomeRatesDeferred } from "@/components/home/HomeRatesDeferred";
import { HomeRentgenBand } from "@/components/home/HomeRentgenBand";
import { HomeToolsGrid } from "@/components/home/HomeToolsGrid";
import { HomeTrustStrip } from "@/components/home/HomeTrustStrip";
import type { GetMortgageOffersResult } from "@/lib/mortgage-market/offers";
import type { MortgageJourneyParseResult } from "@/lib/mortgage-rates/mortgage-journey-context";
import {
  buildLtvContext,
  SAZBY_DEFAULT_QUERY,
} from "@/lib/mortgage-rates/ltv-context";

const DEFAULT_QUERY = SAZBY_DEFAULT_QUERY;
const DEFAULT_LTV_CONTEXT = buildLtvContext({
  propertyValueCzk: DEFAULT_QUERY.propertyValueCzk,
  loanAmountCzk: DEFAULT_QUERY.loanAmountCzk,
});

type HomeExperienceProps = {
  initialOffers: GetMortgageOffersResult | null;
  serverJourney: MortgageJourneyParseResult;
};

export function HomeExperience({
  initialOffers,
  serverJourney,
}: HomeExperienceProps) {
  return (
    <>
      <HomePremiumHero serverJourney={serverJourney} />
      <HomePathCards />
      <section className="border-b border-gray-200 bg-[#f7f6f3]">
        <div className="mx-auto max-w-[90rem] px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
            Data
          </p>
          <h2 className="mt-2 max-w-2xl font-heading text-2xl font-bold tracking-tight text-text-dark sm:text-3xl">
            Vývoj cen nemovitostí v ČR
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
            Historický vývoj, současný trend a možné scénáře dalšího vývoje.
          </p>
          <div className="mt-6">
            <HomePriceDeferred />
          </div>
        </div>
      </section>
      <HomeRatesDeferred
        initialOffers={initialOffers}
        initialQuery={DEFAULT_QUERY}
        initialLtvContext={DEFAULT_LTV_CONTEXT}
      />
      <HomeToolsGrid />
      <HomeRentgenBand />
      <HomeEditorial />
      <HomeTrustStrip />
      <HomeFaq />
      <HomeBottomCta />
    </>
  );
}
