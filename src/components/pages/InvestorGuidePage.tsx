"use client";

import { SmartCalculator } from "@/components/calculators/SmartCalculator";
import { BuyVsRentSection } from "@/components/sections/BuyVsRentSection";
import { CalculatorSection } from "@/components/sections/CalculatorSection";
import { CountryDossierView } from "@/components/sections/CountryDossierView";
import { CountryGuide } from "@/components/sections/CountryGuide";
import {
  CountryArticlesSection,
  CountryInvestmentHub,
} from "@/components/sections/CountryInvestmentHub";
import { FutureProjectionsView } from "@/components/sections/FutureProjectionsView";
import { HistoricalTrendsView } from "@/components/sections/HistoricalTrendsView";
import type { CountryId } from "@/lib/calculators";

interface InvestorGuidePageProps {
  countryId: CountryId;
}

export function InvestorGuidePage({ countryId }: InvestorGuidePageProps) {
  return (
    <div className="w-full bg-white">
      <CountryInvestmentHub countryId={countryId} />

      <CountryDossierView countryId={countryId} />

      <div id="hypotecni-kalkulacka" className="scroll-mt-32 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <CalculatorSection
            selectedCountry={countryId}
            onSelectCountry={() => {}}
            embedded
            lockCountry
          />
        </div>
      </div>

      <div id="roi-kalkulacka" className="scroll-mt-32 py-12 bg-emerald-900/5">
        <div className="max-w-7xl mx-auto px-4 space-y-20">
          <div className="rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-emerald-100 p-6 sm:p-8 lg:p-10">
            <SmartCalculator country={countryId} />
          </div>
          <BuyVsRentSection
            countryId={countryId}
            sectionId="roi-kalkulacka-break-even"
            embedded
          />
          <HistoricalTrendsView countryId={countryId} embedded />
          <FutureProjectionsView countryId={countryId} embedded />
        </div>
      </div>

      <CountryGuide country={countryId} />

      <div id="clanky" className="py-16 scroll-mt-32">
        <CountryArticlesSection countryId={countryId} />
      </div>
    </div>
  );
}
