"use client";

import { MortgageCalculator } from "@/components/calculators/MortgageCalculator";
import type { CountryId } from "@/lib/calculators";

interface CalculatorSectionProps {
  selectedCountry: CountryId;
  onSelectCountry: (country: CountryId) => void;
  embedded?: boolean;
  lockCountry?: boolean;
}

export function CalculatorSection({
  selectedCountry,
  onSelectCountry,
  embedded = false,
  lockCountry = false,
}: CalculatorSectionProps) {
  return (
    <section
      id={embedded ? undefined : "kalkulacka"}
      className={embedded ? "relative" : "relative py-20 lg:py-28 overflow-hidden"}
    >
      {!embedded && (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-white via-emerald-50/20 to-white" />
          <div className="absolute top-1/2 left-0 w-72 h-72 bg-deep-teal/5 rounded-full blur-3xl -translate-y-1/2" />
        </>
      )}

      <div className={embedded ? "relative" : "container relative mx-auto px-4 lg:px-8"}>
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl lg:text-4xl font-bold text-text-dark mb-3">
            Kalkulačka hypotéky
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Orientační splátka a nabídky bank podle vašeho profilu a vybrané
            země
          </p>
        </div>

        <MortgageCalculator
          key={selectedCountry}
          country={selectedCountry}
          onCountryChange={onSelectCountry}
          hideCountryPicker={lockCountry}
        />
      </div>
    </section>
  );
}
