"use client";

import Link from "next/link";
import { useMemo } from "react";
import { estimateAffordability } from "@/lib/affordability";
import { formatCurrency } from "@/lib/calculators";
import { rateUiBadgeLabel, useMortgageRateEngine } from "@/lib/rates";
import { routes } from "@/lib/routes";

/**
 * Ukázka osobního finančního snapshotu — model z reálného rate engine,
 * pevné demovstupy (označené). Žádné falešné „vaše“ výsledky.
 */
export function HomePersonalSnapshot() {
  const { resolved, loading } = useMortgageRateEngine(true);

  const demo = useMemo(
    () =>
      estimateAffordability({
        monthlyIncome: 60_000,
        monthlyLiabilities: 0,
        cash: 800_000,
        ratePercent: resolved.ratePercent,
        termYears: 30,
      }),
    [resolved.ratePercent]
  );

  const saferBudget = Math.round(demo.maxPropertyPrice * 0.85);
  const financingFit =
    demo.limitingFactor === "DSTI"
      ? "Omezuje splátková kapacita (DSTI)"
      : demo.limitingFactor === "LTV"
        ? "Omezují vlastní zdroje (LTV)"
        : "Doplňte vstupy ve widgetu níže";

  const cells = [
    {
      label: "Dostupný rozpočet (model)",
      value:
        demo.maxPropertyPrice > 0
          ? formatCurrency(demo.maxPropertyPrice, "CZK")
          : "—",
      hint: "Max. cena nemovitosti · DSTI + LTV",
    },
    {
      label: "Vlastní zdroje (vstup)",
      value: formatCurrency(800_000, "CZK"),
      hint: "Demo vstup — upravíte níže",
    },
    {
      label: "Bezpečnější budget",
      value: saferBudget > 0 ? formatCurrency(saferBudget, "CZK") : "—",
      hint: "Orientačně ~85 % modelového stropu",
    },
    {
      label: "Financing fit",
      value: financingFit,
      hint: `Sazba ${loading ? "…" : `${resolved.ratePercent.toFixed(2)} %`} · ${rateUiBadgeLabel(resolved.uiKind)}`,
    },
  ];

  return (
    <section
      aria-labelledby="home-snapshot-heading"
      className="border-b border-border bg-white"
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
            Osobní finanční snapshot
          </p>
          <h2
            id="home-snapshot-heading"
            className="mt-2 font-heading text-2xl font-bold tracking-tight text-text-dark sm:text-3xl"
          >
            Co uvidíte po zadání svých čísel
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Níže je{" "}
            <strong className="font-semibold text-text-dark">
              modelová ukázka
            </strong>{" "}
            (příjem 60&nbsp;000 Kč, vlastní zdroje 800&nbsp;000 Kč, 30 let) — ne
            vaše data ani nabídka banky. Interaktivní výpočet je hned pod tím.
          </p>
        </div>

        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {cells.map((c) => (
            <li
              key={c.label}
              className="min-w-0 rounded-xl border border-border bg-[#f7f8f7] p-4"
            >
              <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
                {c.label}
              </p>
              <p className="mt-2 break-words font-heading text-lg font-bold tabular-nums text-text-dark sm:text-xl">
                {c.value}
              </p>
              <p className="mt-1 text-xs leading-snug text-muted-foreground">
                {c.hint}
              </p>
            </li>
          ))}
        </ul>

        <p className="mt-4 text-sm">
          <Link
            href={routes.mojeMoznosti}
            className="font-semibold text-deep-teal underline-offset-4 hover:underline"
          >
            Spustit diagnostiku se svými čísly →
          </Link>
        </p>
      </div>
    </section>
  );
}
