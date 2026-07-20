"use client";

import Link from "next/link";
import {
  Building2,
  Globe2,
  Home,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";
import { getExperimentVariant } from "@/lib/analytics/experiments";
import { track } from "@/lib/analytics/track";
import { routes } from "@/lib/routes";

type IntentPath = {
  id: string;
  title: string;
  description: string;
  nextStep: string;
  href: string;
  icon: LucideIcon;
};

const PATHS: IntentPath[] = [
  {
    id: "home",
    title: "Chci vlastní bydlení",
    description: "Orientační limit úvěru, LTV a splátka podle živých sazeb ČR.",
    nextStep: "Otevřít kalkulačku bydlení",
    href: routes.kalkulacky.root,
    icon: Home,
  },
  {
    id: "invest",
    title: "Chci investovat",
    description: "Profil rizika, kapitál a doporučené trhy bez marketingových frází.",
    nextStep: "Spustit osobní průvodce",
    href: routes.investicniPas,
    icon: Building2,
  },
  {
    id: "refinance",
    title: "Chci refinancovat",
    description: "Porovnejte současnou splátku s aktuálními nabídkami sledovaných bank.",
    nextStep: "Otevřít radar refinancování",
    href: routes.refinanceRadar,
    icon: RefreshCw,
  },
  {
    id: "abroad",
    title: "Chci koupit v zahraničí",
    description: "Vlastnictví, financovatelnost a rizika po destinacích — nejdřív data.",
    nextStep: "Vybrat destinaci",
    href: routes.pruvodceInvestora,
    icon: Globe2,
  },
];

export function IntentPaths() {
  return (
    <section
      aria-labelledby="intent-paths-heading"
      className="border-b border-border bg-[#f7f8f7]"
    >
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
            Pro koho to je
          </p>
          <h2
            id="intent-paths-heading"
            className="mt-2 font-heading text-2xl font-bold tracking-tight text-text-dark sm:text-3xl"
          >
            Čtyři jasné cesty
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Vyberte záměr — každá cesta má jeden další krok.
          </p>
        </div>

        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {PATHS.map((path) => {
            const Icon = path.icon;
            return (
              <li key={path.id}>
                <Link
                  href={path.href}
                  onClick={() =>
                    track("homepage_intent_selected", {
                      intent_id: path.id,
                      path: path.href,
                      experiment_id: "hero",
                      variant_id: getExperimentVariant("hero"),
                    })
                  }
                  className="group flex h-full flex-col rounded-xl border border-border bg-white p-5 transition-[border-color,box-shadow] duration-200 hover:border-deep-teal/40 hover:shadow-[0_8px_30px_-12px_rgba(27,77,62,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal focus-visible:ring-offset-2"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-deep-teal/8 text-deep-teal transition-colors group-hover:bg-deep-teal group-hover:text-white">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 font-heading text-lg font-semibold text-text-dark">
                    {path.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {path.description}
                  </p>
                  <span className="mt-4 text-sm font-semibold text-deep-teal">
                    {path.nextStep} →
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
