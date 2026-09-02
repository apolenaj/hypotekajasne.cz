"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics/track-event";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

const SITUATIONS = [
  {
    id: "purchase",
    situation: "purchase",
    label: "Kupuji vlastní bydlení",
    href: `${routes.sazby}?purpose=purchase`,
    hint: "Spočítat splátku a porovnat zveřejněné sazby pro koupi.",
  },
  {
    id: "rent_vs_buy",
    situation: "rent_vs_buy",
    label: "Rozhoduji se mezi nájmem a hypotékou",
    href: routes.kalkulacky.koupeVsNajem,
    hint: "Porovnejte dlouhodobé náklady nájmu a vlastního bydlení.",
  },
  {
    id: "refinance",
    situation: "refinance",
    label: "Chci refinancovat",
    href: `${routes.temata}/refinancovani`,
    hint: "Postup, náklady a sazby při konci fixace.",
  },
  {
    id: "investment",
    situation: "investment",
    label: "Kupuji investiční nemovitost",
    href: `${routes.temata}/investicni-hypoteka`,
    hint: "Financování investice odděleně od vlastního bydlení.",
  },
  {
    id: "foreign",
    situation: "foreign_markets",
    label: "Chci investovat v zahraničí",
    href: routes.pruvodceInvestora,
    hint: "Porovnejte podporované trhy, výnosy a financování.",
  },
  {
    id: "osvc_foreign",
    situation: "osvc",
    label: "Jsem OSVČ nebo mám příjem ze zahraničí",
    href: `${routes.temata}/hypoteka-osvc`,
    hint: "Doklady, posouzení příjmů a další krok diagnostiky.",
  },
] as const;

/**
 * High-intent situation router — does not claim automated bank matching.
 */
export function HomeSituationSelector() {
  return (
    <section
      id="situace"
      aria-labelledby="home-situation-heading"
      className="scroll-mt-24 border-b border-border bg-white lg:scroll-mt-28"
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
            Situace
          </p>
          <h2
            id="home-situation-heading"
            className="mt-2 font-heading text-2xl font-bold tracking-tight text-text-dark sm:text-3xl"
          >
            S čím potřebujete pomoci?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Vyberte situaci — navedeme vás na relevantní výpočet, sazby nebo
            průvodce.
          </p>
        </div>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                  "transition-colors hover:border-deep-teal/40 hover:bg-white active:bg-deep-teal/5",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal focus-visible:ring-offset-2"
                )}
              >
                <span className="font-heading text-base font-semibold text-text-dark">
                  {s.label}
                </span>
                <span className="mt-1 text-sm leading-relaxed text-muted-foreground">
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
