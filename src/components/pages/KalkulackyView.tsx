"use client";

import { useEffect } from "react";
import Link from "next/link";
import { DecisionLabWorkspace } from "@/components/decision-lab/DecisionLabWorkspace";
import { track } from "@/lib/analytics/track";
import { routes } from "@/lib/routes";

const EXTRA_CALCS = [
  {
    href: routes.kalkulacky.hypotecniKalkulacka,
    title: "Hypoteční kalkulačka",
    text: "Orientační měsíční splátka",
  },
  {
    href: routes.kalkulacky.rodinnyRozpocet,
    title: "Rodinný rozpočet",
    text: "Zvládneme hypotéku i s rodinou?",
  },
  {
    href: routes.kalkulacky.odhadVersusKupniCena,
    title: "Odhad versus kupní cena",
    text: "Vlastní peníze při nižším odhadu",
  },
  {
    href: routes.investicniRentgen,
    title: "Investiční rentgen",
    text: "Cash flow investiční nemovitosti",
  },
] as const;

export function KalkulackyView() {
  useEffect(() => {
    track("calculator_started", {
      tool_id: "decision_lab",
      country_id: "cz",
      path: routes.kalkulacky.koupeVsNajem,
    });
  }, []);

  return (
    <div>
      <div className="border-b border-border bg-[#f7f8f7]">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <h2 className="font-heading text-lg font-semibold text-text-dark">
            Související nástroje
          </h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {EXTRA_CALCS.map((c) => (
              <li key={c.href}>
                <Link
                  href={c.href}
                  className="block rounded-xl border border-border bg-white px-4 py-3 text-sm hover:border-deep-teal/40"
                >
                  <span className="font-semibold text-text-dark">{c.title}</span>
                  <span className="mt-1 block text-muted-foreground">{c.text}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <DecisionLabWorkspace />
    </div>
  );
}
