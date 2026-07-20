"use client";

import { useState } from "react";
import { DecisionLabBuyVsRent } from "@/components/decision-lab/DecisionLabBuyVsRent";
import {
  countryConfigs,
  countryOrder,
  type CountryId,
} from "@/lib/calculators";
import { cn } from "@/lib/utils";

type BuyVsRentSectionProps = {
  countryId?: CountryId;
  sectionId?: string;
  embedded?: boolean;
};

export function BuyVsRentSection({
  countryId: lockedCountry,
  sectionId = "koupe-vs-najem",
  embedded = false,
}: BuyVsRentSectionProps) {
  const [countryId, setCountryId] = useState<CountryId>(
    lockedCountry ?? "cz"
  );
  const active = lockedCountry ?? countryId;

  return (
    <section id={sectionId} className={cn(!embedded && "py-12")}>
      <div className={cn(!embedded && "mx-auto max-w-5xl px-4")}>
        {!embedded && (
          <header className="mb-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
              Laboratoř rozhodnutí
            </p>
            <h2 className="mt-1 font-heading text-3xl font-bold text-text-dark">
              Koupě vs. nájem
            </h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Interaktivní srovnání čistého jmění. Verdikt vždy závisí na
              předpokladech — nikdy pevný univerzální vítěz.
            </p>
          </header>
        )}

        {!lockedCountry && (
          <div className="mb-6 flex flex-wrap gap-2">
            {countryOrder.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setCountryId(id)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold",
                  active === id
                    ? "bg-deep-teal text-white"
                    : "bg-white ring-1 ring-border text-muted-foreground"
                )}
              >
                {countryConfigs[id].label}
              </button>
            ))}
          </div>
        )}

        <DecisionLabBuyVsRent key={active} countryId={active} />
      </div>
    </section>
  );
}
