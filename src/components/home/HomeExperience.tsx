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
import { RpsnEducationBlock } from "@/components/mortgage-market/RpsnEducationBlock";
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
      <section className="border-b border-gray-200 bg-[#fafaf7]">
        <div className="mx-auto grid max-w-[1440px] items-start gap-5 px-4 py-12 sm:px-8 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)] lg:px-12 lg:py-14 xl:px-14">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
              Data
            </p>
            <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight text-text-dark sm:text-4xl">
              Vývoj cen nemovitostí v ČR
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600 sm:text-base">
              Zemědělská půda a vybrané ukazatele komerčního trhu mají ověřenou historii.
              U bytů a domů zůstává oddělený modelový scénář; stavební pozemky a obchodní
              prostory zatím bez otevřené řady.
            </p>
            <div className="mt-5">
              <HomePriceDeferred />
            </div>
          </div>
          <HomeRatesDeferred
            initialOffers={initialOffers}
            initialQuery={DEFAULT_QUERY}
            initialLtvContext={DEFAULT_LTV_CONTEXT}
            layout="aside"
          />
        </div>
      </section>
      <RpsnEducationBlock />
      <HomeToolsGrid />
      <HomeRentgenBand />
      <HomeEditorial />
      <HomeTrustStrip />
      <HomeFaq />
      <HomeBottomCta />
    </>
  );
}
