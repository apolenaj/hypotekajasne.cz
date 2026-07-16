"use client";

import Link from "next/link";
import { useState } from "react";
import { CalculatorSection } from "@/components/sections/CalculatorSection";
import type { CountryId } from "@/lib/calculators";
import { routes } from "@/lib/routes";

export function KalkulackyView() {
  const [selectedCountry, setSelectedCountry] = useState<CountryId>("cz");

  return (
    <>
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="container mx-auto px-4 lg:px-8 py-6 flex flex-wrap gap-4 text-sm">
          <Link
            href={routes.kalkulacky.koupeVsNajem}
            className="text-emerald-800 font-semibold hover:underline"
          >
            Koupě × Nájem
          </Link>
          <Link
            href={routes.kalkulacky.historickyVyvoj}
            className="text-emerald-800 font-semibold hover:underline"
          >
            Historický vývoj
          </Link>
          <Link
            href={routes.kalkulacky.potencialniVyvoj}
            className="text-emerald-800 font-semibold hover:underline"
          >
            Potenciální vývoj
          </Link>
        </div>
      </div>
      <CalculatorSection
        selectedCountry={selectedCountry}
        onSelectCountry={setSelectedCountry}
      />
    </>
  );
}
