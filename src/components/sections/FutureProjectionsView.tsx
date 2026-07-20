"use client";

import { useState } from "react";
import { DecisionLabFuture } from "@/components/decision-lab/DecisionLabFuture";
import {
  countryConfigs,
  countryOrder,
  type CountryId,
} from "@/lib/calculators";
import { cn } from "@/lib/utils";

type FutureProjectionsViewProps = {
  countryId?: CountryId;
  embedded?: boolean;
};

export function FutureProjectionsView({
  countryId: lockedCountry,
  embedded = false,
}: FutureProjectionsViewProps) {
  const [countryId, setCountryId] = useState<CountryId>(
    lockedCountry ?? "cz"
  );
  const active = lockedCountry ?? countryId;

  return (
    <section
      id="potencialni-vyvoj"
      className={cn(!embedded && "py-12", embedded && "scroll-mt-32")}
    >
      <div className={cn(!embedded && "mx-auto max-w-5xl px-4")}>
        {!embedded && (
          <header className="mb-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
              Laboratoř rozhodnutí
            </p>
            <h2 className="mt-1 font-heading text-3xl font-bold text-text-dark">
              Potenciální vývoj
            </h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Simulátor budoucnosti se scénáři Pesimistický / Základní /
              Optimistický / Vlastní. Pokud není zadán výnos z reinvestice,
              nájem se nesúročuje.
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

        <DecisionLabFuture key={active} countryId={active} />
      </div>
    </section>
  );
}
