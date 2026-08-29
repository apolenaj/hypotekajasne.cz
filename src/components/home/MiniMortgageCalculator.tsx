"use client";

import { Suspense, useCallback, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormattedMoneyInput } from "@/components/ui/FormattedMoneyInput";
import { Label } from "@/components/ui/label";
import {
  ltvBand,
  mortgageAmountBand,
  propertyValueBand,
} from "@/lib/analytics/bands";
import { trackEvent, trackEventOnce } from "@/lib/analytics/track-event";
import { formatCurrency } from "@/lib/calculators";
import {
  buildSazbyHref,
  computeMiniMortgage,
  formatExactLtvCs,
  formatLtvBandLabel,
  MINI_MORTGAGE_CTA,
  MINI_MORTGAGE_DEFAULTS,
  MINI_MORTGAGE_FIXATION_OPTIONS,
  MINI_MORTGAGE_TERM_OPTIONS,
  miniMortgageLtvPct,
  validateMiniMortgageInput,
  type MiniMortgagePurpose,
  type MiniMortgageResult,
} from "@/lib/mini-mortgage-calculator";
import {
  journeyContextToMiniMortgageInput,
} from "@/lib/mortgage-rates/mortgage-journey-summary";
import {
  parseMortgageJourneyParams,
  type MortgageJourneyParseResult,
} from "@/lib/mortgage-rates/mortgage-journey-context";
import { MiniMortgageCalculatorSkeleton } from "@/components/home/MiniMortgageCalculatorSkeleton";
import { getCalculatorDisclaimer } from "@/components/calculators/CalculatorDisclaimer";
import { CTA_CS } from "@/lib/ux/cta";
import { cn } from "@/lib/utils";

const fieldControlClassName = cn(
  "h-11 min-h-11 w-full min-w-0 rounded-lg border border-border bg-white px-2.5",
  "text-base text-text-dark outline-none transition-colors",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "[color-scheme:light]"
);

const primaryButtonClassName = cn(
  "mt-6 flex h-11 min-h-11 w-full items-center justify-center rounded-lg px-3 text-center text-sm font-semibold",
  "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal focus-visible:ring-offset-2",
  "disabled:cursor-not-allowed disabled:opacity-55"
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

function calculationDedupeKey(result: MiniMortgageResult): string {
  return [
    result.purpose,
    result.fixationMonths,
    result.termYears,
    result.propertyPriceCzk,
    result.loanAmountCzk,
    result.annualRatePercent,
  ].join("|");
}

function mortgageCalculationAnalyticsPayload(result: MiniMortgageResult) {
  return {
    calculator_type: "mortgage",
    tool_id: "mortgage_calculator",
    purpose: result.purpose,
    fixation_months: result.fixationMonths,
    term_years: result.termYears,
    ltv_band: ltvBand(miniMortgageLtvPct(result)),
    mortgage_amount_band: mortgageAmountBand(result.loanAmountCzk),
    property_value_band: propertyValueBand(result.propertyPriceCzk),
    funnel_id: "phase4_conversion",
  };
}

type CalculatorBootstrap = {
  propertyPrice: number;
  ownFunds: number;
  termYears: number;
  purpose: MiniMortgagePurpose;
  fixationMonths: number;
  interestRate: number;
  rateDraft: string;
  hasCalculated: boolean;
  committedResult: MiniMortgageResult | null;
};

function bootstrapFromJourney(
  journey: MortgageJourneyParseResult | null | undefined
): CalculatorBootstrap {
  const defaults: CalculatorBootstrap = {
    propertyPrice: MINI_MORTGAGE_DEFAULTS.propertyPriceCzk,
    ownFunds: MINI_MORTGAGE_DEFAULTS.ownFundsCzk,
    termYears: MINI_MORTGAGE_DEFAULTS.termYears,
    purpose: MINI_MORTGAGE_DEFAULTS.purpose,
    fixationMonths: MINI_MORTGAGE_DEFAULTS.fixationMonths,
    interestRate: MINI_MORTGAGE_DEFAULTS.annualRatePercent,
    rateDraft: String(MINI_MORTGAGE_DEFAULTS.annualRatePercent).replace(".", ","),
    hasCalculated: false,
    committedResult: null,
  };
  if (!journey || journey.fromDefaults || journey.paramErrors.length > 0) {
    return defaults;
  }
  const input = journeyContextToMiniMortgageInput(journey.context);
  const result = computeMiniMortgage(input);
  const rate = input.annualRatePercent ?? MINI_MORTGAGE_DEFAULTS.annualRatePercent;
  return {
    propertyPrice: input.propertyPriceCzk,
    ownFunds: input.ownFundsCzk,
    termYears: input.termYears,
    purpose: input.purpose ?? MINI_MORTGAGE_DEFAULTS.purpose,
    fixationMonths: input.fixationMonths ?? MINI_MORTGAGE_DEFAULTS.fixationMonths,
    interestRate: rate,
    rateDraft: rate.toFixed(2).replace(".", ","),
    hasCalculated: true,
    committedResult: result,
  };
}

function MiniMortgageCalculatorCore({
  bootstrap,
}: {
  bootstrap: CalculatorBootstrap;
}) {
  const router = useRouter();
  const [propertyPrice, setPropertyPrice] = useState<number>(bootstrap.propertyPrice);
  const [ownFunds, setOwnFunds] = useState<number>(bootstrap.ownFunds);
  const [termYears, setTermYears] = useState<number>(bootstrap.termYears);
  const [purpose, setPurpose] = useState<MiniMortgagePurpose>(bootstrap.purpose);
  const [fixationMonths, setFixationMonths] = useState<number>(
    bootstrap.fixationMonths
  );
  const [interestRate, setInterestRate] = useState<number>(bootstrap.interestRate);
  const [rateDraft, setRateDraft] = useState(bootstrap.rateDraft);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [hasCalculated, setHasCalculated] = useState(bootstrap.hasCalculated);
  const [committedResult, setCommittedResult] = useState<MiniMortgageResult | null>(
    bootstrap.committedResult
  );
  const [isCalculating, setIsCalculating] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const startedRef = useRef(false);
  const ratesClickGuardRef = useRef(false);

  const input = useMemo(
    () => ({
      propertyPriceCzk: propertyPrice,
      ownFundsCzk: ownFunds,
      termYears,
      annualRatePercent: interestRate,
      purpose,
      fixationMonths,
    }),
    [propertyPrice, ownFunds, termYears, interestRate, purpose, fixationMonths]
  );

  const preview = useMemo(() => computeMiniMortgage(input), [input]);
  const validation = useMemo(() => validateMiniMortgageInput(input), [input]);
  const display = hasCalculated && committedResult ? committedResult : preview;
  const exactLtv = display.exactLtv;
  const ltvHigh = exactLtv != null && exactLtv > 80;
  const rateDisplay = display.annualRatePercent.toFixed(2).replace(".", ",");

  const resetCalculation = useCallback(() => {
    setHasCalculated(false);
    setCommittedResult(null);
  }, []);

  const markInteracted = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    trackEvent("calculator_start", {
      calculator_type: "mortgage",
      tool_id: "mortgage_calculator",
      purpose,
      fixation_months: fixationMonths,
      term_years: termYears,
      funnel_id: "phase4_conversion",
    });
  };

  const onInputChange = <T,>(setter: (value: T) => void, value: T) => {
    markInteracted();
    resetCalculation();
    setter(value);
  };

  const handleCalculate = async () => {
    if (!validation.valid || isCalculating || isNavigating) return;
    setIsCalculating(true);
    try {
      const result = computeMiniMortgage(input);
      setCommittedResult(result);
      setHasCalculated(true);

      const payload = mortgageCalculationAnalyticsPayload(result);
      trackEventOnce(
        "mortgage_calculation_completed",
        `mortgage_calculation_completed:${calculationDedupeKey(result)}`,
        payload
      );
      trackEventOnce(
        "calculator_complete",
        `calculator_complete:${calculationDedupeKey(result)}`,
        payload
      );
    } finally {
      setIsCalculating(false);
    }
  };

  const handleViewRates = () => {
    if (!hasCalculated || !committedResult || isNavigating || ratesClickGuardRef.current) {
      return;
    }
    ratesClickGuardRef.current = true;
    setIsNavigating(true);

    const payload = mortgageCalculationAnalyticsPayload(committedResult);
    trackEventOnce(
      "mortgage_rates_cta_clicked",
      `mortgage_rates_cta_clicked:${calculationDedupeKey(committedResult)}`,
      {
        ...payload,
        cta_id: "mini_mortgage_view_rates",
        cta_destination: "sazby",
      }
    );
    trackEvent("cta_click", {
      cta_id: "mini_mortgage_view_rates",
      path: typeof window !== "undefined" ? window.location.pathname : undefined,
      ...payload,
    });

    router.push(buildSazbyHref(committedResult));
  };

  const primaryDisabled =
    !validation.valid || isCalculating || isNavigating;
  const ratesDisabled =
    !hasCalculated || !committedResult || isNavigating || isCalculating;

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
              onChange={(e) =>
                onInputChange(setPurpose, e.target.value as MiniMortgagePurpose)
              }
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
              onChange={(e) =>
                onInputChange(setFixationMonths, Number(e.target.value))
              }
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
          onChange={(next) => onInputChange(setPropertyPrice, next)}
        />
        <MoneyField
          id="mini-mortgage-equity"
          label="Vlastní prostředky"
          value={ownFunds}
          onChange={(next) => onInputChange(setOwnFunds, next)}
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
            onChange={(e) => onInputChange(setTermYears, Number(e.target.value))}
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
                    resetCalculation();
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
                Jen pro odhad splátky. Bankovní sazby zobrazíte po výpočtu.
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {!validation.valid && validation.reason ? (
        <p id="mini-mortgage-validation" className="mt-4 text-xs text-amber-900" role="alert">
          {validation.reason}
        </p>
      ) : null}

      <hr className="my-5 border-border/80" />

      <div
        className="space-y-3"
        aria-live="polite"
        aria-atomic="true"
        aria-busy={isCalculating}
      >
        <div className="min-w-0">
          <p className="text-xs font-semibold text-muted-foreground">
            Orientační měsíční splátka
          </p>
          {hasCalculated && committedResult ? (
            <p className="mt-1 break-words font-heading text-2xl font-bold tabular-nums tracking-tight text-text-dark sm:text-3xl">
              {formatCurrency(committedResult.monthlyPaymentCzk, "CZK")}
            </p>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">
              Zadejte údaje a klikněte na „{MINI_MORTGAGE_CTA.calculate}“.
            </p>
          )}
        </div>

        {hasCalculated && committedResult ? (
          <>
            <p className="break-words text-sm text-muted-foreground">
              Hypotéka{" "}
              <span className="font-semibold tabular-nums text-text-dark">
                {formatCurrency(committedResult.loanAmountCzk, "CZK")}
              </span>
              <span aria-hidden> • </span>
              LTV{" "}
              <span className="font-semibold tabular-nums text-text-dark">
                {exactLtv != null ? `${formatExactLtvCs(exactLtv)}\u00a0%` : "—"}
              </span>
              {committedResult.ltvBand != null ? (
                <>
                  <span aria-hidden> · </span>
                  <span className="text-muted-foreground">
                    pásmo {formatLtvBandLabel(committedResult.ltvBand)}
                  </span>
                </>
              ) : null}
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
          </>
        ) : null}
      </div>

      {!hasCalculated ? (
        <button
          type="button"
          className={cn(
            primaryButtonClassName,
            "bg-muted-gold text-text-dark hover:bg-muted-gold-light"
          )}
          disabled={primaryDisabled}
          aria-busy={isCalculating}
          aria-describedby={
            !validation.valid ? "mini-mortgage-validation" : undefined
          }
          onClick={() => void handleCalculate()}
        >
          {isCalculating ? "Počítám…" : MINI_MORTGAGE_CTA.calculate}
          <span className="sr-only">
            {isCalculating
              ? "Probíhá výpočet orientační splátky."
              : "Spočítá orientační měsíční splátku z modelové sazby."}
          </span>
        </button>
      ) : (
        <button
          type="button"
          className={cn(
            primaryButtonClassName,
            "bg-muted-gold text-text-dark hover:bg-muted-gold-light"
          )}
          disabled={ratesDisabled}
          aria-busy={isNavigating}
          onClick={handleViewRates}
        >
          {isNavigating ? "Otevírám sazby…" : MINI_MORTGAGE_CTA.viewRates}
          <span className="sr-only">
            {isNavigating
              ? "Načítám stránku se sazbami pro váš výpočet."
              : "Otevře stránku sazeb se zachovanými parametry výpočtu."}
          </span>
        </button>
      )}

      <p className="mt-3 text-center text-[10px] leading-snug text-muted-foreground">
        {getCalculatorDisclaimer("cs")}
        {hasCalculated
          ? " Sazby bank otevřete tlačítkem výše."
          : " Po výpočtu zobrazíte sazby pro stejné parametry."}
      </p>
    </article>
  );
}

function MiniMortgageCalculatorUrlLoader() {
  const searchParams = useSearchParams();
  const bootstrap = useMemo(() => {
    const raw = Object.fromEntries(searchParams.entries());
    return bootstrapFromJourney(parseMortgageJourneyParams(raw));
  }, [searchParams]);
  return <MiniMortgageCalculatorCore bootstrap={bootstrap} />;
}

export type MiniMortgageCalculatorProps = {
  /** Server-parsed journey removes Suspense/useSearchParams from the hero critical path. */
  serverJourney?: MortgageJourneyParseResult | null;
};

export function MiniMortgageCalculator(props: MiniMortgageCalculatorProps = {}) {
  const { serverJourney } = props;
  if (serverJourney !== undefined) {
    return (
      <MiniMortgageCalculatorCore bootstrap={bootstrapFromJourney(serverJourney)} />
    );
  }
  return (
    <Suspense fallback={<MiniMortgageCalculatorSkeleton />}>
      <MiniMortgageCalculatorUrlLoader />
    </Suspense>
  );
}
