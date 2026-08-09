"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { FormattedMoneyInput } from "@/components/ui/FormattedMoneyInput";
import { Label } from "@/components/ui/label";
import {
  ltvBand,
  mortgageAmountBand,
  propertyValueBand,
} from "@/lib/analytics/bands";
import { trackEvent } from "@/lib/analytics/track-event";
import { formatCurrency } from "@/lib/calculators";
import {
  buildSazbyHref,
  computeMiniMortgage,
  miniMortgageCtaLabel,
  MINI_MORTGAGE_DEFAULTS,
  MINI_MORTGAGE_FIXATION_OPTIONS,
  MINI_MORTGAGE_TERM_OPTIONS,
  type MiniMortgagePurpose,
} from "@/lib/mini-mortgage-calculator";
import { routes } from "@/lib/routes";
import { CTA_CS } from "@/lib/ux/cta";
import { cn } from "@/lib/utils";

const fieldControlClassName = cn(
  "h-11 min-h-11 w-full min-w-0 rounded-lg border border-border bg-white px-2.5",
  "text-base text-text-dark outline-none transition-colors",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "[color-scheme:light]"
);

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
  return (
    <div className="min-w-0 space-y-1.5">
      <Label htmlFor={id} className="text-xs font-semibold text-text-dark">
        {label}
      </Label>
      <FormattedMoneyInput
        id={id}
        value={value}
        onChange={onChange}
        suffix="Kč"
        className="rounded-lg border-border bg-white text-base text-text-dark placeholder:text-gray-400"
      />
    </div>
  );
}

function parseInterestRate(raw: string): number | null {
  const normalized = raw.trim().replace(/\s/g, "").replace(",", ".");
  if (!normalized) return null;
  const value = Number(normalized);
  if (!Number.isFinite(value)) return null;
  return Math.min(25, Math.max(0, value));
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
  const [purpose, setPurpose] = useState<MiniMortgagePurpose>(
    MINI_MORTGAGE_DEFAULTS.purpose
  );
  const [fixationMonths, setFixationMonths] = useState<number>(
    MINI_MORTGAGE_DEFAULTS.fixationMonths
  );
  const [interestRate, setInterestRate] = useState<number>(
    MINI_MORTGAGE_DEFAULTS.annualRatePercent
  );
  const [rateDraft, setRateDraft] = useState(
    () => String(MINI_MORTGAGE_DEFAULTS.annualRatePercent).replace(".", ",")
  );
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const startedRef = useRef(false);
  const lastCompleteKeyRef = useRef<string | null>(null);

  const result = useMemo(
    () =>
      computeMiniMortgage({
        propertyPriceCzk: propertyPrice,
        ownFundsCzk: ownFunds,
        termYears,
        annualRatePercent: interestRate,
        purpose,
        fixationMonths,
      }),
    [propertyPrice, ownFunds, termYears, interestRate, purpose, fixationMonths]
  );

  const markInteracted = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    trackEvent("calculator_start", {
      calculator_type: "mortgage",
      purpose,
      fixation_months: fixationMonths,
      term_years: termYears,
      funnel_id: "phase4_conversion",
    });
  };

  useEffect(() => {
    if (!startedRef.current) return;
    if (!Number.isFinite(result.monthlyPaymentCzk) || result.loanAmountCzk <= 0) {
      return;
    }
    const payload = {
      calculator_type: "mortgage",
      purpose,
      fixation_months: fixationMonths,
      term_years: termYears,
      ltv_band: ltvBand(result.ltvPct),
      mortgage_amount_band: mortgageAmountBand(result.loanAmountCzk),
      property_value_band: propertyValueBand(propertyPrice),
      funnel_id: "phase4_conversion",
    };
    const key = [
      payload.purpose,
      payload.fixation_months,
      payload.term_years,
      payload.ltv_band,
      payload.mortgage_amount_band,
      payload.property_value_band,
    ].join("|");
    if (lastCompleteKeyRef.current === key) return;
    lastCompleteKeyRef.current = key;
    trackEvent("calculator_complete", payload);
  }, [
    result.loanAmountCzk,
    result.ltvPct,
    result.monthlyPaymentCzk,
    purpose,
    fixationMonths,
    termYears,
    propertyPrice,
  ]);

  const sazbyHref = buildSazbyHref(result);
  const rateDisplay = interestRate.toFixed(2).replace(".", ",");
  const ltvHigh = result.ltvPct > 80;

  return (
    <article
      className={cn(
        "box-border w-full min-w-0 max-w-full rounded-2xl border border-white/20 bg-white p-4 text-text-dark shadow-[0_20px_50px_-20px_rgba(0,0,0,0.45)]",
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
        <div className="grid min-w-0 grid-cols-2 gap-3">
          <div className="min-w-0 space-y-1.5">
            <Label
              htmlFor="mini-mortgage-purpose"
              className="text-xs font-semibold text-text-dark"
            >
              Účel
            </Label>
            <select
              id="mini-mortgage-purpose"
              value={purpose}
              onChange={(e) => {
                markInteracted();
                setPurpose(e.target.value as MiniMortgagePurpose);
              }}
              className={fieldControlClassName}
            >
              <option value="purchase">Koupě</option>
              <option value="refinance">Refinancování</option>
            </select>
          </div>
          <div className="min-w-0 space-y-1.5">
            <Label
              htmlFor="mini-mortgage-fixation"
              className="text-xs font-semibold text-text-dark"
            >
              Fixace
            </Label>
            <select
              id="mini-mortgage-fixation"
              value={fixationMonths}
              onChange={(e) => {
                markInteracted();
                setFixationMonths(Number(e.target.value));
              }}
              className={fieldControlClassName}
            >
              {MINI_MORTGAGE_FIXATION_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {m / 12} {m / 12 === 1 ? "rok" : m / 12 < 5 ? "roky" : "let"}
                </option>
              ))}
            </select>
          </div>
        </div>

        <MoneyField
          id="mini-mortgage-price"
          label="Cena nemovitosti"
          value={propertyPrice}
          onChange={(next) => {
            markInteracted();
            setPropertyPrice(next);
          }}
        />
        <MoneyField
          id="mini-mortgage-equity"
          label="Vlastní prostředky"
          value={ownFunds}
          onChange={(next) => {
            markInteracted();
            setOwnFunds(next);
          }}
        />

        <div className="min-w-0 space-y-1.5">
          <Label
            htmlFor="mini-mortgage-term"
            className="text-xs font-semibold text-text-dark"
          >
            Doba splácení
          </Label>
          <select
            id="mini-mortgage-term"
            value={termYears}
            onChange={(e) => {
              markInteracted();
              setTermYears(Number(e.target.value));
            }}
            className={fieldControlClassName}
          >
            {MINI_MORTGAGE_TERM_OPTIONS.map((y) => (
              <option key={y} value={y}>
                {y} let
              </option>
            ))}
          </select>
        </div>

        <div>
          <button
            type="button"
            className="text-xs font-semibold text-deep-teal underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal"
            aria-expanded={advancedOpen}
            onClick={() => {
              markInteracted();
              setAdvancedOpen((v) => !v);
            }}
          >
            {advancedOpen ? "Skrýt upřesnění" : CTA_CS.refineCalculation}
          </button>
          {advancedOpen ? (
            <div className="mt-3 min-w-0 space-y-1.5">
              <Label
                htmlFor="mini-mortgage-rate"
                className="text-xs font-semibold text-text-dark"
              >
                Modelová sazba pro splátku
              </Label>
              <div className="relative min-w-0">
                <input
                  id="mini-mortgage-rate"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={rateDraft}
                  onChange={(e) => {
                    markInteracted();
                    const next = e.target.value;
                    setRateDraft(next);
                    const parsed = parseInterestRate(next);
                    if (parsed != null) setInterestRate(parsed);
                  }}
                  onBlur={() => {
                    const parsed = parseInterestRate(rateDraft);
                    const next =
                      parsed ?? MINI_MORTGAGE_DEFAULTS.annualRatePercent;
                    setInterestRate(next);
                    setRateDraft(next.toFixed(2).replace(".", ","));
                  }}
                  aria-describedby="mini-mortgage-rate-hint"
                  className={cn(fieldControlClassName, "pr-12 tabular-nums")}
                  title="Modelová sazba — nejde o aktuální nabídku banky"
                />
                <span
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground"
                  aria-hidden
                >
                  %
                </span>
              </div>
              <p
                id="mini-mortgage-rate-hint"
                className="text-[11px] text-muted-foreground"
              >
                Jen pro odhad splátky. Bankovní sazby jsou zvlášť níže / na stránce
                sazeb.
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <hr className="my-5 border-border/80" />

      <div className="space-y-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-muted-foreground">
            Orientační měsíční splátka
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
            {result.ltvPct}&nbsp;%
          </span>
        </p>

        <p
          className={cn(
            "text-xs leading-relaxed",
            ltvHigh ? "text-amber-800" : "text-muted-foreground"
          )}
        >
          {ltvHigh
            ? "Vyšší podíl úvěru — podmínky bank mohou být přísnější."
            : "Orientační podíl úvěru k ceně nemovitosti."}
        </p>
      </div>

      <TrackedCtaLink
        href={sazbyHref}
        ctaId="hero_mini_calc_spocitat"
        toolId="mortgage_calculator"
        className="mt-6 flex h-11 min-h-11 w-full items-center justify-center rounded-lg bg-muted-gold px-3 text-center text-sm font-semibold text-text-dark transition-colors hover:bg-muted-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal focus-visible:ring-offset-2"
      >
        {miniMortgageCtaLabel()}
      </TrackedCtaLink>

      <TrackedCtaLink
        href={routes.sazby}
        ctaId="hero_mini_calc_porovnat_sazby"
        className="mt-2 flex h-11 min-h-11 w-full items-center justify-center rounded-lg border border-border bg-white px-3 text-center text-sm font-semibold text-text-dark transition-colors hover:border-deep-teal/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal"
      >
        {CTA_CS.compareRates}
      </TrackedCtaLink>

      <p className="mt-3 text-center text-[10px] leading-snug text-muted-foreground">
        Splátka z modelové sazby {rateDisplay}&nbsp;% — nejde o nabídku banky.
        Zveřejněné sazby bank zobrazíme samostatně.
      </p>
    </article>
  );
}
