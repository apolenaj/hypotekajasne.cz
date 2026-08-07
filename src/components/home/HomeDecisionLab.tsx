"use client";

import { useState } from "react";
import { BuyVsRentSection } from "@/components/sections/BuyVsRentSection";
import { FutureProjectionsView } from "@/components/sections/FutureProjectionsView";
import { HistoricalTrendsView } from "@/components/sections/HistoricalTrendsView";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "buy_vs_rent", label: "Koupě × Nájem" },
  { id: "historical", label: "Historický vývoj" },
  { id: "future", label: "Potenciální vývoj" },
] as const;

type TabId = (typeof TABS)[number]["id"];

/**
 * Laboratoř rozhodnutí — submenu pod hero (3 modelové nástroje).
 * Hero kalkulačka zůstává beze změny.
 */
export function HomeDecisionLab() {
  const [activeTab, setActiveTab] = useState<TabId>("buy_vs_rent");

  return (
    <section
      aria-labelledby="home-decision-lab-heading"
      className="border-b border-border bg-white"
    >
      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8 lg:pt-12">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
            Laboratoř rozhodnutí
          </p>
          <h2
            id="home-decision-lab-heading"
            className="mt-2 font-heading text-2xl font-bold tracking-tight text-text-dark sm:text-3xl"
          >
            Porovnejte scénáře dřív, než se rozhodnete
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Tři modelové nástroje pro rychlé srovnání. Výstupy jsou ilustrativní —
            ne nabídka konkrétní banky.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Nástroje laboratoře rozhodnutí"
          className="mt-8 flex gap-1 overflow-x-auto border-b border-border [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`home-lab-tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`home-lab-panel-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative shrink-0 px-4 py-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal focus-visible:ring-offset-2 sm:px-5",
                  isActive
                    ? "font-semibold text-deep-teal"
                    : "font-medium text-muted-foreground hover:text-text-dark"
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    "absolute inset-x-4 bottom-0 h-0.5 rounded-full transition-colors sm:inset-x-5",
                    isActive ? "bg-deep-teal" : "bg-transparent"
                  )}
                  aria-hidden
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div
          role="tabpanel"
          id={`home-lab-panel-${activeTab}`}
          aria-labelledby={`home-lab-tab-${activeTab}`}
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
        </div>
      </div>
    </section>
  );
}
