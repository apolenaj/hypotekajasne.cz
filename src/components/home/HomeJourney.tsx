"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { trackCanonical } from "@/lib/analytics/track";
import { routes } from "@/lib/routes";

const STEPS = [
  {
    n: "1",
    title: "Finance",
    question: "Kolik si můžu dovolit?",
    text: "Orientační rozpočet podle příjmu, vlastních zdrojů a sazby.",
    href: routes.mojeMoznosti,
    id: "finance",
  },
  {
    n: "2",
    title: "Trh",
    question: "Kde mám koupit?",
    text: "Porovnání destinací — vlastnictví, financování a rizika.",
    href: routes.pruvodceInvestora,
    id: "market",
  },
  {
    n: "3",
    title: "Nemovitost",
    question: "Je konkrétní nemovitost dobrá?",
    text: "Rentgen nabídky: výnos, cena/m² a rizikové faktory.",
    href: routes.investicniRentgen,
    id: "property",
  },
  {
    n: "4",
    title: "Financování",
    question: "Jak bezpečné je financování?",
    text: "Připravenost, limity a modelový fit — bez slibu schválení.",
    href: routes.navrhNaMiru,
    id: "financing",
  },
  {
    n: "5",
    title: "Realizace",
    question: "Jak transakci realizovat?",
    text: "Přehled kroků transakce a volitelná konzultace.",
    href: routes.dealRoom,
    id: "closing",
  },
] as const;

/**
 * Vizuální 5-step journey — klikací, ne katalog nástrojů.
 */
export function HomeJourney() {
  return (
    <section
      aria-labelledby="home-journey-heading"
      className="border-b border-border bg-white"
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
            Cesta rozhodnutí
          </p>
          <h2
            id="home-journey-heading"
            className="mt-2 font-heading text-2xl font-bold tracking-tight text-text-dark sm:text-3xl"
          >
            Pět otázek. Jedna logická cesta.
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Každý krok odpovídá na jednu praktickou otázku. Nemusíte procházet
            všechny nástroje — začněte tam, kde právě jste.
          </p>
        </div>

        <ol className="mt-7 flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-5 [&::-webkit-scrollbar]:hidden">
          {STEPS.map((step, index) => (
            <li
              key={step.id}
              className="min-w-[14.5rem] shrink-0 sm:min-w-0"
            >
              <Link
                href={step.href}
                onClick={() =>
                  trackCanonical("intent_selected", "homepage_intent_selected", {
                    intent_id: `journey_${step.id}`,
                    path: step.href,
                    experiment_id: "homepage_v10",
                    variant_id: "journey",
                  })
                }
                className="group flex h-full flex-col rounded-xl border border-border bg-[#f7f8f7] p-4 transition-[border-color,background-color] hover:border-deep-teal/40 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal focus-visible:ring-offset-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-heading text-2xl font-bold text-muted-gold">
                    {step.n}
                  </span>
                  {index < STEPS.length - 1 ? (
                    <ChevronRight
                      className="hidden h-4 w-4 text-border lg:block"
                      aria-hidden
                    />
                  ) : null}
                </div>
                <h3 className="mt-2 font-heading text-base font-semibold text-text-dark">
                  {step.title}
                </h3>
                <p className="mt-1 text-sm font-medium text-deep-teal">
                  {step.question}
                </p>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {step.text}
                </p>
                <span className="mt-3 text-sm font-semibold text-deep-teal group-hover:underline">
                  Pokračovat →
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
