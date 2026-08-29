"use client";

import { useState, type ComponentType } from "react";
import { DeferClientMount } from "@/components/perf/DeferClientMount";
import type { GetMortgageOffersResult } from "@/lib/mortgage-market/offers";
import type { LtvContext, MortgageJourneyCore } from "@/lib/mortgage-rates/ltv-context";

type HomeRatesDeferredProps = {
  initialOffers: GetMortgageOffersResult | null;
  initialQuery: MortgageJourneyCore;
  initialLtvContext: LtvContext;
};

function RatesPlaceholder() {
  return (
    <section
      aria-labelledby="home-rates-heading"
      className="home-below-fold border-b border-border bg-white"
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
          Orientační sazby
        </p>
        <h2
          id="home-rates-heading"
          className="mt-2 font-heading text-2xl font-bold tracking-tight text-text-dark sm:text-3xl"
        >
          Přehled sazeb s datem a zdrojem ověření
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Sazby přebíráme z veřejných sazebníků bank. U každé karty uvádíme datum
          posledního ověření a odkaz na oficiální zdroj.
        </p>
        <p className="mt-6 text-sm text-muted-foreground" aria-live="polite">
          Načítám sazby…
        </p>
      </div>
    </section>
  );
}

/** Rates + RPSN — JS chunk až v dohledu viewportu. */
export function HomeRatesDeferred(props: HomeRatesDeferredProps) {
  const [RatesBlock, setRatesBlock] = useState<ComponentType<
    HomeRatesDeferredProps
  > | null>(null);

  return (
    <DeferClientMount
      placeholder={<RatesPlaceholder />}
      rootMargin="280px 0px"
      onMount={() => {
        if (RatesBlock) return;
        void import("@/components/home/HomeRatesBlock").then((m) => {
          setRatesBlock(() => m.HomeRatesBlock);
        });
      }}
    >
      {RatesBlock ? <RatesBlock {...props} /> : <RatesPlaceholder />}
    </DeferClientMount>
  );
}
