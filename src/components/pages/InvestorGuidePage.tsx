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
 * Progressive disclosure country page:
 * Snapshot → Fit → témata → Decision Lab → Deep research → CTA.
 */
export function InvestorGuidePage({ countryId }: InvestorGuidePageProps) {
  return (
    <div className="w-full min-w-0 overflow-x-hidden bg-white">
      <CountryDossierView
        countryId={countryId}
        calculatorSlot={
          <section
            id="decision-lab"
            className="scroll-mt-28 overflow-hidden rounded-2xl border border-border bg-white"
          >
            <div className="border-b border-border px-4 py-5 sm:px-7 sm:py-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
                Scénáře
              </p>
              <h2 className="mt-1 font-heading text-xl font-bold text-text-dark sm:text-2xl">
                Kalkulačky pro tento trh
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Modelové nástroje v kontextu země — ne nabídka banky. Měny
                produktů se nemíchají bez konverze.
              </p>
            </div>
            <div className="space-y-10 px-4 py-6 sm:px-7 sm:py-8">
              <div id="hypotecni-kalkulacka" className="scroll-mt-28 min-w-0">
                <CalculatorSection
                  selectedCountry={countryId}
                  onSelectCountry={() => {}}
                  embedded
                  lockCountry
                />
              </div>

              <div
                id="roi-kalkulacka"
                className="scroll-mt-28 min-w-0 space-y-10"
              >
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
        }
      />
    </div>
  );
}
