"use client";

import { useState } from "react";
import { InvestmentGoals } from "@/components/sections/InvestmentGoals";
import { CalculatorSection } from "@/components/sections/CalculatorSection";
import { CountryGuide } from "@/components/sections/CountryGuide";
import type { CountryId } from "@/lib/calculators";

export function MortgageSections() {
  const [selectedCountry, setSelectedCountry] = useState<CountryId>("cz");
  const [selectedCard, setSelectedCard] = useState<CountryId>("cz");

  const handleSelect = (cardId: CountryId) => {
    setSelectedCard(cardId);
    setSelectedCountry(cardId);
    window.setTimeout(() => {
      document
        .getElementById("country-hub")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  return (
    <>
      <InvestmentGoals
        selectedCard={selectedCard}
        selectedCountry={selectedCountry}
        onSelectCard={handleSelect}
      />
      <CalculatorSection
        selectedCountry={selectedCountry}
        onSelectCountry={(country) => {
          setSelectedCountry(country);
          setSelectedCard(country);
        }}
      />
      <CountryGuide country={selectedCountry} />
    </>
  );
}
