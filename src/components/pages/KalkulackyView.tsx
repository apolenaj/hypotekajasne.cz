"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalculatorSection } from "@/components/sections/CalculatorSection";
import { LeadGen } from "@/components/sections/LeadGen";
import type { CountryId } from "@/lib/calculators";
import { track } from "@/lib/analytics/track";
import { routes } from "@/lib/routes";

export function KalkulackyView() {
  const [selectedCountry, setSelectedCountry] = useState<CountryId>("cz");

  useEffect(() => {
    track("calculator_started", {
      tool_id: "mortgage_calculator",
      country_id: "cz",
      path: routes.kalkulacky.root,
    });
  }, []);

  return (
    <>
      <div className="border-b border-gray-100 bg-gray-50">
        <div className="container mx-auto px-4 py-6 lg:px-8">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
            Laboratoř rozhodnutí
          </p>
          <div className="flex flex-wrap gap-4 text-sm">
            <Link
              href={routes.kalkulacky.koupeVsNajem}
              className="font-semibold text-emerald-800 hover:underline"
            >
              Koupě × Nájem
            </Link>
            <Link
              href={routes.kalkulacky.historickyVyvoj}
              className="font-semibold text-emerald-800 hover:underline"
            >
              Historický vývoj
            </Link>
            <Link
              href={routes.kalkulacky.potencialniVyvoj}
              className="font-semibold text-emerald-800 hover:underline"
            >
              Potenciální vývoj
            </Link>
          </div>
        </div>
      </div>
      <CalculatorSection
        selectedCountry={selectedCountry}
        onSelectCountry={(id) => {
          setSelectedCountry(id);
          track("financing_option_selected", {
            tool_id: "mortgage_calculator",
            country_id: id,
          });
        }}
      />
      <LeadGen />
    </>
  );
}
