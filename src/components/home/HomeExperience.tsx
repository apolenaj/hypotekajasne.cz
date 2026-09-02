import { HomeFaq } from "@/components/home/HomeFaq";
import { HomeBottomDeferred } from "@/components/home/HomeBottomDeferred";
import { HomeForeignMarkets } from "@/components/home/HomeForeignMarkets";
import { HomeHowItWorks } from "@/components/home/HomeHowItWorks";
import { HomeInvestments } from "@/components/home/HomeInvestments";
import { HomePillars } from "@/components/home/HomePillars";
import { HomeRentVsMortgage } from "@/components/home/HomeRentVsMortgage";
import { HomeSituationSelector } from "@/components/home/HomeSituationSelector";
import { CockpitHeroShell } from "@/components/home/CockpitHeroShell";
import { HomeRatesDeferred } from "@/components/home/HomeRatesDeferred";
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

/**
 * Server homepage — hero + produktové sekce; těžké interaktivní části až v dohledu.
 */
export function HomeExperience({
  initialOffers,
  serverJourney,
}: HomeExperienceProps) {
  return (
    <>
      <CockpitHeroShell serverJourney={serverJourney} />
      <HomeSituationSelector />
      <HomePillars />
      <HomeRentVsMortgage />
      <HomeInvestments />
      <HomeForeignMarkets />
      <HomeRatesDeferred
        initialOffers={initialOffers}
        initialQuery={DEFAULT_QUERY}
        initialLtvContext={DEFAULT_LTV_CONTEXT}
      />
      <HomeHowItWorks />
      <HomeFaq />
      <HomeBottomDeferred
        journeyMetadata={{
          purpose: DEFAULT_QUERY.purpose,
          fixationMonths: DEFAULT_QUERY.fixationMonths,
          exactLtv: DEFAULT_LTV_CONTEXT.exactLtv,
          ltvBand: DEFAULT_LTV_CONTEXT.ltvBand,
          propertyValue: DEFAULT_QUERY.propertyValueCzk,
          mortgageAmount: DEFAULT_QUERY.loanAmountCzk,
        }}
      />
    </>
  );
}
