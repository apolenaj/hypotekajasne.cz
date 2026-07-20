"use client";

import { SmartCalculator } from "@/components/calculators/SmartCalculator";
import { BuyVsRentSection } from "@/components/sections/BuyVsRentSection";
import { CalculatorSection } from "@/components/sections/CalculatorSection";
import { CountryDossierView } from "@/components/sections/CountryDossierView";
import { FutureProjectionsView } from "@/components/sections/FutureProjectionsView";
import { HistoricalTrendsView } from "@/components/sections/HistoricalTrendsView";
import type { CountryId } from "@/lib/calculators";

interface InvestorGuidePageProps {
  countryId: CountryId;
}

/**
 * Jedna generace country page:
 * Hero + Dossier (sekce 1–10, 12–13) → Decision Lab / kalkulačky (11).
 * Legacy Hub + Guide se nenačítají.
 */
export function InvestorGuidePage({ countryId }: InvestorGuidePageProps) {
  return (
    <div className="w-full min-w-0 bg-white">
      <CountryDossierView countryId={countryId} />

      <section
        id="decision-lab"
        className="scroll-mt-28 border-t border-border bg-white py-12 sm:py-16"
      >
        <div className="mx-auto max-w-6xl space-y-12 px-4">
          <header>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
              Decision Lab
            </p>
            <h2 className="mt-1 font-heading text-2xl font-bold text-text-dark sm:text-3xl">
              Kalkulačky pro {countryId === "cz" ? "ČR" : "tento trh"}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Modelové nástroje — ne nabídka banky. Měny produktů se nemíchají
              bez konverze.
            </p>
          </header>

          <div id="hypotecni-kalkulacka" className="scroll-mt-28">
            <CalculatorSection
              selectedCountry={countryId}
              onSelectCountry={() => {}}
              embedded
              lockCountry
            />
          </div>

          <div id="roi-kalkulacka" className="scroll-mt-28 space-y-12">
            <SmartCalculator country={countryId} />
            <BuyVsRentSection
              countryId={countryId}
              sectionId="roi-kalkulacka-break-even"
              embedded
            />
            <HistoricalTrendsView countryId={countryId} embedded />
            <FutureProjectionsView countryId={countryId} embedded />
          </div>
        </div>
      </section>
    </div>
  );
}
