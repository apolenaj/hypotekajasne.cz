"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { RateProvenanceBanner } from "@/components/calculators/RateProvenanceBanner";
import { FormattedMoneyInput } from "@/components/ui/FormattedMoneyInput";
import { estimateAffordability } from "@/lib/affordability";
import { formatCurrency } from "@/lib/calculators";
import { missingDataLabel } from "@/lib/data/display";
import { useMortgageRateEngine } from "@/lib/rates";
import { routes } from "@/lib/routes";

export function AffordabilityWidget() {
  const { resolved, loading } = useMortgageRateEngine(true);
  const [income, setIncome] = useState(60_000);
  const [cash, setCash] = useState(800_000);
  const [liabilities, setLiabilities] = useState(0);

  const result = useMemo(() => {
    return estimateAffordability({
      monthlyIncome: income,
      monthlyLiabilities: liabilities,
      cash,
      ratePercent: resolved.ratePercent,
      termYears: 30,
    });
  }, [income, cash, liabilities, resolved.ratePercent]);

  const rateDisplay = loading
    ? "…"
    : `${resolved.ratePercent.toFixed(2)} %`;

  return (
    <section
      id="zjistit-moje-moznosti"
      aria-labelledby="affordability-heading"
      className="scroll-mt-24 border-b border-border bg-white"
    >
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-12 lg:gap-10 lg:px-8 lg:py-12">
        <div className="lg:col-span-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
            První krok
          </p>
          <h2
            id="affordability-heading"
            className="mt-2 font-heading text-2xl font-bold tracking-tight text-text-dark sm:text-3xl"
          >
            Zjistit moje možnosti
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Orientační strop podle příjmu (DSTI ~45 %), vlastních zdrojů (LTV) a
            sazby s pojištěním. Nejde o závaznou nabídku banky.
          </p>
          <div className="mt-4">
            <RateProvenanceBanner resolved={resolved} />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Použitá sazba ČR:{" "}
            <span className="font-semibold tabular-nums text-text-dark">
              {rateDisplay}
            </span>
            {" p.a."}
          </p>
        </div>

        <div className="lg:col-span-7">
          <form
            className="rounded-xl border border-border bg-[#f7f8f7] p-5 sm:p-6"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block text-sm">
                <span className="font-medium text-text-dark">
                  Čistý příjem / měs.
                </span>
                <FormattedMoneyInput
                  id="afford-income"
                  value={income}
                  onChange={setIncome}
                  suffix="Kč"
                  className="mt-1.5 rounded-lg border-border bg-white"
                  aria-describedby="afford-income-hint"
                />
                <span id="afford-income-hint" className="sr-only">
                  Částka v Kč
                </span>
              </label>
              <label className="block text-sm">
                <span className="font-medium text-text-dark">
                  Vlastní zdroje
                </span>
                <FormattedMoneyInput
                  id="afford-cash"
                  value={cash}
                  onChange={setCash}
                  suffix="Kč"
                  className="mt-1.5 rounded-lg border-border bg-white"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-text-dark">
                  Splátky úvěrů
                </span>
                <FormattedMoneyInput
                  id="afford-liabilities"
                  value={liabilities}
                  onChange={setLiabilities}
                  showZero
                  suffix="Kč"
                  className="mt-1.5 rounded-lg border-border bg-white"
                />
              </label>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="min-w-0 rounded-lg border border-border bg-white p-4">
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  Max. úvěr
                </p>
                <p className="mt-1 break-words font-heading text-xl font-bold tabular-nums text-text-dark sm:text-2xl lg:text-3xl">
                  {result.maxLoan > 0
                    ? formatCurrency(result.maxLoan, "CZK")
                    : missingDataLabel(null)}
                </p>
              </div>
              <div className="min-w-0 rounded-lg border border-border bg-white p-4">
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  Max. cena nemovitosti
                </p>
                <p className="mt-1 break-words font-heading text-xl font-bold tabular-nums text-deep-teal sm:text-2xl lg:text-3xl">
                  {result.maxPropertyPrice > 0
                    ? formatCurrency(result.maxPropertyPrice, "CZK")
                    : missingDataLabel(null)}
                </p>
              </div>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              {result.limitingFactor
                ? `Omezující faktor: ${result.limitingFactor}. `
                : null}
              Model 30 let, sazba s pojištěním. Pro skóre připravenosti
              pokračujte průvodcem.
            </p>

            <Link
              href={routes.mojeMoznosti}
              className="mt-5 inline-flex h-11 min-h-11 items-center justify-center rounded-lg bg-deep-teal px-5 text-sm font-semibold text-white transition-colors hover:bg-deep-teal-light"
            >
              Pokračovat v průvodci
            </Link>
          </form>
        </div>
      </div>
    </section>
  );
}
