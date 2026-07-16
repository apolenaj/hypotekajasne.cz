"use client";

import { useEffect, useState } from "react";
import { SmartCalculator } from "@/components/calculators/SmartCalculator";
import { BuyVsRentSection } from "@/components/sections/BuyVsRentSection";
import { CalculatorSection } from "@/components/sections/CalculatorSection";
import { CountryDetailView } from "@/components/sections/CountryDetailView";
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
  const [selectedCountry, setSelectedCountry] = useState<CountryId>(countryId);

  useEffect(() => {
    setSelectedCountry(countryId);
  }, [countryId]);

  return (
    <div className="w-full bg-white">
      <CountryInvestmentHub countryId={selectedCountry} />

      <CountryDetailView country={selectedCountry} variant="overview" />

      <div id="swot-analyza" className="scroll-mt-32 py-12">
        <CountryDetailView
          country={selectedCountry}
          variant="section"
          section="risks"
        />
      </div>

      <div id="proces-koupe" className="scroll-mt-32 py-12 bg-gray-50">
        <CountryDetailView
          country={selectedCountry}
          variant="section"
          section="process"
        />
      </div>

      <div id="hypotecni-kalkulacka" className="scroll-mt-32 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <CalculatorSection
            selectedCountry={selectedCountry}
            onSelectCountry={setSelectedCountry}
            embedded
            lockCountry
          />
        </div>
      </div>

      <div id="roi-kalkulacka" className="scroll-mt-32 py-12 bg-emerald-900/5">
        <div className="max-w-7xl mx-auto px-4 space-y-20">
          <div className="rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-emerald-100 p-6 sm:p-8 lg:p-10">
            <SmartCalculator country={selectedCountry} />
          </div>
          <BuyVsRentSection
            countryId={selectedCountry}
            sectionId="roi-kalkulacka-break-even"
            embedded
          />
          <HistoricalTrendsView countryId={selectedCountry} embedded />
          <FutureProjectionsView countryId={selectedCountry} embedded />
        </div>
      </div>

      <CountryGuide country={selectedCountry} />

      <div id="clanky" className="py-16 scroll-mt-32">
        <CountryArticlesSection countryId={selectedCountry} />
      </div>
    </div>
  );
}
