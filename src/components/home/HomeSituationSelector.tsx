"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics/track-event";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

const SITUATIONS = [
  {
    id: "purchase",
    situation: "purchase",
    label: "Kupuji bydlení",
    href: `${routes.sazby}?purpose=purchase`,
    hint: "Spočítat splátku a porovnat zveřejněné sazby",
  },
  {
    id: "refinance",
    situation: "refinance",
    label: "Refinancuji hypotéku",
    href: `${routes.temata}/refinancovani`,
    hint: "Postup, náklady a zveřejněné sazby pro refinancování",
  },
  {
    id: "investment",
    situation: "investment",
    label: "Investiční nemovitost",
    href: `${routes.temata}/investicni-hypoteka`,
    hint: "Pravidla ČNB, LTV a Investiční rentgen",
  },
  {
    id: "osvc",
    situation: "osvc",
    label: "Jsem OSVČ",
    href: `${routes.temata}/hypoteka-osvc`,
    hint: "Příjmy, doklady a další krok diagnostiky",
  },
  {
    id: "foreign",
    situation: "foreign_income",
    label: "Mám příjem ze zahraničí",
    href: `${routes.temata}/hypoteka-ze-zahranicniho-prijmu`,
    hint: "Dokumentace a posouzení zahraničního příjmu",
  },
  {
    id: "american",
    situation: "american",
    label: "Americká hypotéka",
    href: `${routes.temata}/americka-hypoteka`,
    hint: "Neúčelový úvěr zajištěný nemovitostí",
  },
] as const;

/**
 * High-intent situation router — does not claim automated bank matching for all paths.
 */
export function HomeSituationSelector() {
  return (
    <section
      aria-labelledby="home-situation-heading"
      className="border-b border-border bg-white"
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
            Začněte zde
          </p>
          <h2
            id="home-situation-heading"
            className="mt-2 font-heading text-2xl font-bold tracking-tight text-text-dark sm:text-3xl"
          >
            Co právě řešíte?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Vyberte situaci — navedeme vás na nejbližší užitečný postup. Ne všechny
            cesty mají automatické párování bank.
          </p>
        </div>

        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SITUATIONS.map((s) => (
            <li key={s.id}>
              <Link
                href={s.href}
                onClick={() => {
                  trackEvent("situation_select", {
                    situation: s.situation,
                    funnel_id: "phase4_conversion",
                    path:
                      typeof window !== "undefined"
                        ? window.location.pathname
                        : undefined,
                  });
                }}
                className={cn(
                  "flex h-full min-h-11 flex-col rounded-xl border border-border bg-[#f7f8f7] p-4",
                  "transition-colors hover:border-deep-teal/40 hover:bg-white",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal focus-visible:ring-offset-2"
                )}
              >
                <span className="font-heading text-base font-semibold text-text-dark">
                  {s.label}
                </span>
                <span className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {s.hint}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
