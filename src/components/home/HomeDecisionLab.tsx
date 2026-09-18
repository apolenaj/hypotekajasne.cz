"use client";

import Link from "next/link";
import { History, TrendingUp } from "lucide-react";
import { BuyVsRentSection } from "@/components/sections/BuyVsRentSection";
import { routes } from "@/lib/routes";

/**
 * Na homepage zůstává jen srovnání koupě vs. nájem.
 * Historie a potenciál mají vlastní stránky.
 */
export function HomeDecisionLab() {
  return (
    <section
      aria-labelledby="home-decision-lab-heading"
      className="border-b border-border bg-white"
    >
      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8 lg:pt-12">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
            Koupě vs. nájem
          </p>
          <h2
            id="home-decision-lab-heading"
            className="mt-2 font-heading text-2xl font-bold tracking-tight text-text-dark sm:text-3xl"
          >
            Koupit vlastní bydlení, nebo dál platit nájem?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Modelové srovnání dvou situací. Výstup je ilustrativní — ne nabídka
            konkrétní banky.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <BuyVsRentSection embedded />
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link
            href={routes.kalkulacky.historickyVyvoj}
            className="flex min-h-11 items-start gap-3 rounded-2xl border border-border bg-[#f7f8f7] px-4 py-4 transition-colors hover:border-deep-teal/40"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-deep-teal ring-1 ring-border">
              <History className="h-4 w-4" aria-hidden />
            </span>
            <span>
              <span className="block text-sm font-semibold text-text-dark">
                Historický vývoj
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                Jak by se majetek vyvíjel zpětně v čase
              </span>
            </span>
          </Link>
          <Link
            href={routes.kalkulacky.potencialniVyvoj}
            className="flex min-h-11 items-start gap-3 rounded-2xl border border-border bg-[#f7f8f7] px-4 py-4 transition-colors hover:border-deep-teal/40"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-deep-teal ring-1 ring-border">
              <TrendingUp className="h-4 w-4" aria-hidden />
            </span>
            <span>
              <span className="block text-sm font-semibold text-text-dark">
                Potenciální vývoj
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                Scénáře růstu hodnoty nemovitosti
              </span>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
