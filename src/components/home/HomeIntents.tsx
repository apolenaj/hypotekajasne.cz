"use client";

import Link from "next/link";
import {
  Building2,
  Globe2,
  Home,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";
import { trackCanonical } from "@/lib/analytics/track";
import { routes } from "@/lib/routes";

type Intent = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

const INTENTS: Intent[] = [
  {
    id: "owner_occupied",
    title: "Chci koupit vlastní bydlení",
    description:
      "Začněte rozpočtem a připraveností — pak teprve prohlídkami.",
    href: routes.mojeMoznosti,
    icon: Home,
  },
  {
    id: "investment",
    title: "Chci investovat",
    description:
      "Nejdřív trh a model výnosu, potom konkrétní nemovitost.",
    href: routes.investicniRentgen,
    icon: Building2,
  },
  {
    id: "refinance",
    title: "Chci refinancovat",
    description:
      "Spočítejte čas do konce fixace a modelové scénáře splátek.",
    href: routes.refinanceRadar,
    icon: RefreshCw,
  },
  {
    id: "foreign",
    title: "Chci koupit v zahraničí",
    description:
      "Porovnejte trhy a pravidla vlastnictví před výběrem nabídky.",
    href: routes.pruvodceInvestora,
    icon: Globe2,
  },
];

/**
 * Čtyři vstupní záměry — ne seznam 15 nástrojů.
 */
export function HomeIntents() {
  return (
    <section
      aria-labelledby="home-intents-heading"
      className="border-b border-border bg-[#f7f8f7]"
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
            Váš záměr
          </p>
          <h2
            id="home-intents-heading"
            className="mt-2 font-heading text-2xl font-bold tracking-tight text-text-dark sm:text-3xl"
          >
            Kde chcete začít?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Vyberte situaci. Dostanete relevantní start — ne kompletní katalog
            funkcí.
          </p>
        </div>

        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {INTENTS.map((intent) => {
            const Icon = intent.icon;
            return (
              <li key={intent.id}>
                <Link
                  href={intent.href}
                  onClick={() =>
                    trackCanonical("intent_selected", "homepage_intent_selected", {
                      intent_id: intent.id,
                      path: intent.href,
                      experiment_id: "homepage_v10",
                      variant_id: "intents",
                    })
                  }
                  className="group flex h-full items-start gap-4 rounded-xl border border-border bg-white p-5 transition-[border-color,box-shadow] hover:border-deep-teal/40 hover:shadow-[0_8px_30px_-14px_rgba(27,77,62,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal focus-visible:ring-offset-2"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-deep-teal/8 text-deep-teal transition-colors group-hover:bg-deep-teal group-hover:text-white">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-heading text-lg font-semibold text-text-dark">
                      {intent.title}
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                      {intent.description}
                    </span>
                    <span className="mt-3 inline-block text-sm font-semibold text-deep-teal">
                      Začít →
                    </span>
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
