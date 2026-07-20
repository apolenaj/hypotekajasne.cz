"use client";

import { CzMortgageDecisionTool } from "@/components/calculators/CzMortgageDecisionTool";
import { ForeignFinancingTool } from "@/components/calculators/ForeignFinancingTool";
import { countryConfigs, countryOrder, type CountryId } from "@/lib/calculators";
import { cn } from "@/lib/utils";

interface MortgageCalculatorProps {
  country: CountryId;
  onCountryChange: (country: CountryId) => void;
  hideCountryPicker?: boolean;
}

export function MortgageCalculator({
  country,
  onCountryChange,
  hideCountryPicker = false,
}: MortgageCalculatorProps) {
  const isCzechMarket = country === "cz";

  return (
    <div className="max-w-4xl mx-auto">
      {!hideCountryPicker && (
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {countryOrder.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => onCountryChange(id)}
              className={cn(
                "px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300",
                "ring-1 ring-gray-900/5 backdrop-blur-sm",
                country === id
                  ? "bg-deep-teal text-white shadow-lg shadow-deep-teal/25 scale-105"
                  : "bg-white/70 text-muted-foreground hover:text-deep-teal hover:ring-deep-teal/30 hover:shadow-md"
              )}
            >
              {countryConfigs[id].label}
            </button>
          ))}
        </div>
      )}

      {isCzechMarket ? (
        <CzMortgageDecisionTool />
      ) : (
        <ForeignFinancingTool country={country} />
      )}
    </div>
  );
}
