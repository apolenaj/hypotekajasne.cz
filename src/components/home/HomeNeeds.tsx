"use client";

import Link from "next/link";
import {
  Building2,
  Calculator,
  ScanSearch,
  type LucideIcon,
} from "lucide-react";
import { trackCanonical } from "@/lib/analytics/track";
import { routes } from "@/lib/routes";

type Need = {
  id: string;
  title: string;
  description: string;
  cta: string;
  href: string;
  icon: LucideIcon;
};

const NEEDS: Need[] = [
  {
    id: "afford",
    title: "Kolik si mohu dovolit?",
    description:
      "Orientační strop úvěru a splátky podle příjmu, vlastních zdrojů a sazby.",
    cta: "Spočítat rozpočet",
    href: routes.mojeMoznosti,
    icon: Calculator,
  },
  {
    id: "where",
    title: "Kde dává nákup smysl?",
    description:
      "Porovnejte vlastnictví, financovatelnost a riziko napříč trhy — bez marketingových superlativů.",
    cta: "Porovnat trhy",
    href: "#destinace",
    icon: Building2,
  },
  {
    id: "property",
    title: "Vyplatí se konkrétní nemovitost?",
    description:
      "Investiční rentgen: výnos, cena/m², fit financování a rizikové faktory s označením DATA / MODEL / ODHAD.",
    cta: "Otevřít rentgen",
    href: routes.investicniRentgen,
    icon: ScanSearch,
  },
];

/**
 * Tři hlavní potřeby — konverzní hierarchie hned pod hero.
 */
export function HomeNeeds() {
  return (
    <section
      aria-labelledby="home-needs-heading"
      className="border-b border-border bg-[#f7f8f7]"
    >
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
            Co řešíte
          </p>
          <h2
            id="home-needs-heading"
            className="mt-2 font-heading text-2xl font-bold tracking-tight text-text-dark sm:text-3xl"
          >
            Tři otázky. Jeden jasný start.
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Vyberte potřebu — každá cesta vede do konkrétního nástroje, ne do
            obecného marketingu.
          </p>
        </div>

        <ul className="mt-6 grid gap-3 sm:grid-cols-3 sm:gap-4">
          {NEEDS.map((need) => {
            const Icon = need.icon;
            return (
              <li key={need.id} className="min-w-0">
                <Link
                  href={need.href}
                  onClick={() =>
                    trackCanonical("intent_selected", "homepage_intent_selected", {
                      intent_id: need.id,
                      path: need.href,
                      experiment_id: "hero",
                      variant_id: "needs_v1",
                    })
                  }
                  className="group flex h-full flex-col rounded-xl border border-border bg-white p-5 transition-[border-color,box-shadow] duration-200 hover:border-deep-teal/40 hover:shadow-[0_8px_30px_-12px_rgba(27,77,62,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal focus-visible:ring-offset-2"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-deep-teal/8 text-deep-teal transition-colors group-hover:bg-deep-teal group-hover:text-white">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 font-heading text-lg font-semibold text-text-dark">
                    {need.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {need.description}
                  </p>
                  <span className="mt-4 text-sm font-semibold text-deep-teal">
                    {need.cta} →
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
