"use client";

import { useEffect, useMemo, useState } from "react";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/calculators";
import { formatNumber, parseFormattedNumber } from "@/lib/format";
import {
  computeMiniMortgage,
  MINI_MORTGAGE_DEFAULTS,
  MINI_MORTGAGE_TERM_OPTIONS,
} from "@/lib/mini-mortgage-calculator";
import { MODEL_FALLBACK_RATE_PERCENT } from "@/lib/rates/model-fallback";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

function MoneyField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (next: number) => void;
}) {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState(() => formatNumber(value));

  useEffect(() => {
    if (!focused) {
      setDraft(formatNumber(value));
    }
  }, [value, focused]);

  return (
    <div className="min-w-0 space-y-1.5">
      <Label htmlFor={id} className="text-xs font-semibold text-text-dark">
        {label}
      </Label>
      <div className="relative min-w-0">
        <Input
          id={id}
          type="text"
          inputMode="numeric"
          value={focused ? draft : formatNumber(value)}
          onFocus={() => {
            setFocused(true);
            setDraft(formatNumber(value) || "");
          }}
          onChange={(e) => {
            const nextText = e.target.value;
            setDraft(nextText);
            onChange(parseFormattedNumber(nextText));
          }}
          onBlur={() => {
            setFocused(false);
            const parsed = parseFormattedNumber(draft);
            onChange(parsed);
            setDraft(formatNumber(parsed));
          }}
          className="h-11 min-h-11 w-full min-w-0 rounded-lg border-border bg-white pr-14 text-base tabular-nums text-text-dark"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-muted-foreground">
          Kč
        </span>
      </div>
    </div>
  );
}

export function MiniMortgageCalculator() {
  const [propertyPrice, setPropertyPrice] = useState<number>(
    MINI_MORTGAGE_DEFAULTS.propertyPriceCzk
  );
  const [ownFunds, setOwnFunds] = useState<number>(
    MINI_MORTGAGE_DEFAULTS.ownFundsCzk
  );
  const [termYears, setTermYears] = useState<number>(
    MINI_MORTGAGE_DEFAULTS.termYears
  );

  const modelRate = MODEL_FALLBACK_RATE_PERCENT;

  const result = useMemo(
    () =>
      computeMiniMortgage({
        propertyPriceCzk: propertyPrice,
        ownFundsCzk: ownFunds,
        termYears,
        annualRatePercent: modelRate,
      }),
    [propertyPrice, ownFunds, termYears, modelRate]
  );

  const rateLabel = `${modelRate.toFixed(2).replace(".", ",")} % MODEL`;
  const ltvHigh = result.ltvPct > 80;

  return (
    <article
      className={cn(
        "box-border w-full min-w-0 max-w-full rounded-2xl border border-white/20 bg-white p-4 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.45)]",
        "ring-1 ring-black/5 sm:p-6 md:max-w-md"
      )}
      aria-labelledby="mini-mortgage-heading"
    >
      <p
        id="mini-mortgage-heading"
        className="text-[11px] font-bold uppercase tracking-[0.16em] text-deep-teal"
      >
        Hypoteční kalkulačka
      </p>

      <div className="mt-4 space-y-4">
        <MoneyField
          id="mini-mortgage-price"
          label="Cena nemovitosti"
          value={propertyPrice}
          onChange={setPropertyPrice}
        />
        <MoneyField
          id="mini-mortgage-equity"
          label="Vlastní prostředky"
          value={ownFunds}
          onChange={setOwnFunds}
        />

        <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-lg border border-border/80 bg-[#f7f9f8] px-3 py-2.5">
          <div className="min-w-0 flex-1 sm:flex-none">
            <Label htmlFor="mini-mortgage-term" className="sr-only">
              Doba splácení
            </Label>
            <select
              id="mini-mortgage-term"
              value={termYears}
              onChange={(e) => setTermYears(Number(e.target.value))}
              className="h-11 min-h-11 w-full min-w-0 rounded-md border border-border bg-white px-2.5 text-base font-semibold text-text-dark outline-none focus:border-deep-teal focus:ring-2 focus:ring-deep-teal/20 sm:w-auto"
            >
              {MINI_MORTGAGE_TERM_OPTIONS.map((y) => (
                <option key={y} value={y}>
                  {y} let
                </option>
              ))}
            </select>
          </div>
          <p
            className="shrink-0 text-sm font-semibold tabular-nums text-deep-teal"
            title="Modelová sazba — nejde o aktuální nabídku banky"
          >
            {rateLabel}
          </p>
        </div>
      </div>

      <hr className="my-5 border-border/80" />

      <div className="space-y-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-muted-foreground">
            Měsíční splátka
          </p>
          <p className="mt-1 break-words font-heading text-2xl font-bold tabular-nums tracking-tight text-text-dark sm:text-3xl">
            {formatCurrency(result.monthlyPaymentCzk, "CZK")}
          </p>
        </div>

        <p className="break-words text-sm text-muted-foreground">
          Hypotéka{" "}
          <span className="font-semibold tabular-nums text-text-dark">
            {formatCurrency(result.loanAmountCzk, "CZK")}
          </span>
          <span aria-hidden> • </span>
          LTV{" "}
          <span className="font-semibold tabular-nums text-text-dark">
            {result.ltvPct} %
          </span>
        </p>

        <p
          className={cn(
            "text-xs leading-relaxed",
            ltvHigh ? "text-amber-800" : "text-muted-foreground"
          )}
        >
          {ltvHigh
            ? "Vyšší LTV — financování může mít přísnější podmínky."
            : "Standardní úroveň LTV"}
        </p>
      </div>

      <TrackedCtaLink
        href={routes.mojeMoznosti}
        ctaId="hero_mini_calc_moje_moznosti"
        toolId="moje_moznosti"
        className="mt-6 flex h-11 min-h-11 w-full items-center justify-center rounded-lg bg-muted-gold text-sm font-semibold text-text-dark transition-colors hover:bg-muted-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal focus-visible:ring-offset-2"
      >
        Zjistit moje možnosti
      </TrackedCtaLink>

      <p className="mt-3 text-center text-[10px] leading-snug text-muted-foreground">
        Orientační model — sazba {rateLabel.toLowerCase()}, ne bankovní nabídka.
      </p>
    </article>
  );
}
