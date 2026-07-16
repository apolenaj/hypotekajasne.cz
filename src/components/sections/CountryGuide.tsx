"use client";

import { CzMortgageGuide } from "@/components/sections/CzMortgageGuide";
import { GlobalInvestmentGuide } from "@/components/sections/GlobalInvestmentGuide";
import type { CountryId } from "@/lib/calculators";

interface CountryGuideProps {
  country: CountryId;
}

export function CountryGuide({ country }: CountryGuideProps) {
  if (country === "cz") {
    return <CzMortgageGuide />;
  }

  return <GlobalInvestmentGuide key={country} countryId={country} />;
}
