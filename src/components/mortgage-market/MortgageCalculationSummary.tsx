"use client";

import Link from "next/link";
import { formatCurrency } from "@/lib/calculators";
import type { MortgageJourneySummary } from "@/lib/mortgage-rates/mortgage-journey-summary";
import { cn } from "@/lib/utils";

type MortgageCalculationSummaryProps = {
  summary: MortgageJourneySummary;
  className?: string;
};

function SummaryItem({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </dt>
      <dd
        className={cn(
          "mt-0.5 break-words tabular-nums text-text-dark",
          emphasize ? "font-heading text-lg font-bold sm:text-xl" : "text-sm font-semibold"
        )}
      >
        {value}
      </dd>
    </div>
  );
}

export function MortgageCalculationSummary({
  summary,
  className,
}: MortgageCalculationSummaryProps) {
  return (
    <section
      id="vas-vypocet"
      aria-labelledby="vas-vypocet-heading"
      className={cn(
        "border-b border-border bg-white",
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2
              id="vas-vypocet-heading"
              className="font-heading text-xl font-bold tracking-tight text-text-dark sm:text-2xl"
            >
              Váš výpočet
            </h2>
            {summary.status === "ready" ? (
              <p className="mt-1 text-sm text-muted-foreground">
                Parametry z hypoteční kalkulačky — sazby bank filtrujeme podle
                stejného kontextu.
              </p>
            ) : null}
          </div>
          <Link
            href={summary.editHref}
            className="inline-flex shrink-0 items-center justify-center self-start rounded-lg border border-deep-teal/25 bg-white px-3 py-2 text-sm font-semibold text-deep-teal transition-colors hover:bg-deep-teal/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal focus-visible:ring-offset-2"
          >
            Upravit údaje
          </Link>
        </div>

        {summary.status === "incomplete" ? (
          <div
            className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
            role="status"
          >
            <p>{summary.message}</p>
            <p className="mt-2">
              <Link
                href={summary.editHref}
                className="font-semibold text-deep-teal underline-offset-2 hover:underline"
              >
                Přejít do kalkulačky
              </Link>
            </p>
          </div>
        ) : (
          <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            <SummaryItem
              label="Hodnota nemovitosti"
              value={formatCurrency(summary.propertyValueCzk, "CZK")}
            />
            <SummaryItem
              label="Vlastní prostředky"
              value={formatCurrency(summary.ownFundsCzk, "CZK")}
            />
            <SummaryItem
              label="Výše úvěru"
              value={formatCurrency(summary.loanAmountCzk, "CZK")}
            />
            <SummaryItem
              label="Doba splácení"
              value={`${summary.termYears} let`}
            />
            <SummaryItem label="Fixace" value={summary.fixationLabel} />
            <SummaryItem label="Účel" value={summary.purposeLabel} />
            <SummaryItem label="Skutečné LTV" value={summary.exactLtvLabel} />
            <SummaryItem
              label="Bankovní LTV pásmo"
              value={summary.ltvBandLabel ?? "—"}
            />
            <SummaryItem
              label="Orientační splátka"
              value={formatCurrency(summary.modelMonthlyPaymentCzk, "CZK")}
              emphasize
            />
          </dl>
        )}

        {summary.status === "ready" ? (
          <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
            Splátka z modelové sazby{" "}
            {summary.modelRatePercent.toLocaleString("cs-CZ", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
            &nbsp;% p.a. — orientační odhad, ne nabídka banky.
          </p>
        ) : null}
      </div>
    </section>
  );
}
