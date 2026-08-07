"use client";

import { useState } from "react";
import { MiniMortgageCalculator } from "@/components/home/MiniMortgageCalculator";
import { BuyVsRentSection } from "@/components/sections/BuyVsRentSection";
import { FutureProjectionsView } from "@/components/sections/FutureProjectionsView";
import { HistoricalTrendsView } from "@/components/sections/HistoricalTrendsView";
import { LeadGen } from "@/components/sections/LeadGen";
import type { DecisionLabToolId } from "@/lib/decision-lab/types";
import { cn } from "@/lib/utils";

export const DECISION_LAB_TABS: {
  id: DecisionLabToolId;
  label: string;
}[] = [
  { id: "buy_vs_rent", label: "Koupě × Nájem" },
  { id: "historical", label: "Historický vývoj" },
  { id: "future", label: "Potenciální vývoj" },
  { id: "mortgage_calc", label: "Hypoteční kalkulačka" },
];

type DecisionLabWorkspaceProps = {
  /** Výchozí aktivní záložka (např. z dedicated URL). */
  initialTab?: DecisionLabToolId;
  showLeadGen?: boolean;
};

/**
 * Laboratoř rozhodnutí — tabbed hub pro 4 modelové nástroje.
 */
export function DecisionLabWorkspace({
  initialTab = "buy_vs_rent",
  showLeadGen = true,
}: DecisionLabWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<DecisionLabToolId>(initialTab);

  return (
    <>
      <div className="border-b border-gray-100 bg-gray-50">
        <div className="container mx-auto px-4 py-6 lg:px-8">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
            Laboratoř rozhodnutí
          </p>
          <div
            role="tablist"
            aria-label="Nástroje laboratoře rozhodnutí"
            className="flex flex-wrap gap-1 sm:gap-2"
          >
            {DECISION_LAB_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  id={`decision-lab-tab-${tab.id}`}
                  aria-selected={isActive}
                  aria-controls={`decision-lab-panel-${tab.id}`}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "relative min-h-11 rounded-lg px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal focus-visible:ring-offset-2 sm:px-4",
                    isActive
                      ? "bg-white font-bold text-deep-teal shadow-sm ring-1 ring-deep-teal/25"
                      : "font-medium text-muted-foreground hover:bg-white/70 hover:text-text-dark"
                  )}
                >
                  {tab.label}
                  {isActive ? (
                    <span
                      className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-deep-teal sm:inset-x-4"
                      aria-hidden
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 lg:px-8 lg:py-10">
        <div
          role="tabpanel"
          id={`decision-lab-panel-${activeTab}`}
          aria-labelledby={`decision-lab-tab-${activeTab}`}
          className="min-w-0"
        >
          {activeTab === "buy_vs_rent" ? (
            <BuyVsRentSection embedded />
          ) : null}
          {activeTab === "historical" ? (
            <HistoricalTrendsView embedded />
          ) : null}
          {activeTab === "future" ? (
            <FutureProjectionsView embedded />
          ) : null}
          {activeTab === "mortgage_calc" ? (
            <div className="mx-auto max-w-md">
              <header className="mb-6 text-center sm:text-left">
                <h2 className="font-heading text-2xl font-bold text-text-dark sm:text-3xl">
                  Hypoteční kalkulačka
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Orientační splátka podle ceny, vlastních prostředků, splatnosti
                  a modelové sazby — ne nabídka banky.
                </p>
              </header>
              <MiniMortgageCalculator />
            </div>
          ) : null}
        </div>
      </div>

      {showLeadGen ? <LeadGen /> : null}
    </>
  );
}
