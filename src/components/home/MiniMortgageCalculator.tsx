"use client";

import { Suspense, useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
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
  MINI_MORTGAGE_PRICE_SLIDER,
  MINI_MORTGAGE_TERM_OPTIONS,
  miniMortgageLtvPct,
  suggestedAprPercent,
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
import { routes } from "@/lib/routes";
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

/** Podíl už zaokrouhlený na 1 desetinné místo. Celé číslo bez „,0“. */
function formatSharePercent(percentage: number | null): string | null {
  if (percentage == null || !Number.isFinite(percentage)) return null;
  const rounded = Math.round(percentage * 10) / 10;
  const text = Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toFixed(1).replace(".", ",");
  return `${text}\u00a0%`;
}

function MoneyField({
  id,
  label,
  value,
  onChange,
  slider,
  shareLabel,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (next: number) => void;
  slider?: { min: number; max: number; step: number };
  /** Např. „20 %“ — šedě za názvem pole. */
  shareLabel?: string | null;
}) {
  const sliderMax = slider == null ? value : Math.max(slider.min, slider.max);
  const sliderValue =
    slider == null ? value : Math.min(sliderMax, Math.max(slider.min, value));
  const showSlider = slider != null && sliderMax > slider.min;

  return (
    <div className="min-w-0 space-y-1.5">
      <Label htmlFor={id} className="text-xs font-semibold text-text-dark">
        {label}
        {shareLabel ? (
          <span className="font-medium text-gray-500"> ({shareLabel})</span>
        ) : null}
      </Label>
      <FormattedMoneyInput
        id={id}
        value={value}
        onChange={onChange}
        suffix="Kč"
        className="rounded-lg border-border bg-white text-base text-text-dark placeholder:text-gray-400"
      />
      {showSlider && slider ? (
        <input
          type="range"
          min={slider.min}
          max={sliderMax}
          step={Math.min(slider.step, sliderMax)}
          value={sliderValue}
          onChange={(e) => {
            const next = Number(e.target.value);
            onChange(Math.min(sliderMax, Math.max(slider.min, next)));
          }}
          aria-label={`${label}, posuvník`}
          aria-valuemin={slider.min}
          aria-valuemax={sliderMax}
          aria-valuenow={sliderValue}
          aria-valuetext={
            shareLabel
              ? `${formatCurrency(sliderValue, "CZK")}, ${shareLabel} z ceny nemovitosti`
              : formatCurrency(sliderValue, "CZK")
          }
          className="h-2 w-full cursor-pointer accent-muted-gold"
        />
      ) : null}
    </div>
  );
}

function formatPercentDraft(value: number): string {
  return value.toFixed(2).replace(".", ",");
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
  aprPercent: number;
  aprDraft: string;
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
    aprPercent: suggestedAprPercent(MINI_MORTGAGE_DEFAULTS.annualRatePercent),
    aprDraft: formatPercentDraft(
      suggestedAprPercent(MINI_MORTGAGE_DEFAULTS.annualRatePercent)
    ),
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
    aprPercent: suggestedAprPercent(rate),
    aprDraft: formatPercentDraft(suggestedAprPercent(rate)),
    hasCalculated: true,
    committedResult: result,
  };
}

function MiniMortgageCalculatorCore({
  bootstrap,
  variant = "page",
}: {
  bootstrap: CalculatorBootstrap;
  variant?: "page" | "hero";
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
  const [aprPercent, setAprPercent] = useState<number>(bootstrap.aprPercent);
  const [aprDraft, setAprDraft] = useState(bootstrap.aprDraft);
  const aprTouchedRef = useRef(false);
  const [hasCalculated, setHasCalculated] = useState(bootstrap.hasCalculated);
  const [committedResult, setCommittedResult] = useState<MiniMortgageResult | null>(
    bootstrap.committedResult
  );
  const [isCalculating, setIsCalculating] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const startedRef = useRef(false);
  const ratesClickGuardRef = useRef(false);
  const hero = variant === "hero";
  const [heroMode, setHeroMode] = useState<"purchase" | "refinance" | "invest">(
    bootstrap.purpose === "refinance" ? "refinance" : "purchase"
  );

  const input = useMemo(
    () => ({
      propertyPriceCzk: propertyPrice,
      ownFundsCzk: ownFunds,
      termYears,
      annualRatePercent: interestRate,
      aprPercent,
      purpose,
      fixationMonths,
    }),
    [propertyPrice, ownFunds, termYears, interestRate, aprPercent, purpose, fixationMonths]
  );

  const preview = useMemo(() => computeMiniMortgage(input), [input]);
  const validation = useMemo(() => validateMiniMortgageInput(input), [input]);
  const ownFundsPercentage =
    Number.isFinite(propertyPrice) && propertyPrice > 0 && Number.isFinite(ownFunds)
      ? (Math.max(0, ownFunds) / propertyPrice) * 100
      : null;
  const ownFundsShareLabel = formatSharePercent(ownFundsPercentage);
  const display = hasCalculated && committedResult ? committedResult : preview;
  const exactLtv = display.exactLtv;
  const ltvHigh = exactLtv != null && exactLtv > 80;

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
        "box-border w-full min-w-0 max-w-full text-text-dark",
        hero
          ? "rounded-[18px] border border-gray-200 bg-white p-5 shadow-[0_16px_40px_-28px_rgba(16,40,32,0.45)] sm:p-6"
          : "rounded-2xl border border-white/20 bg-white p-4 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.45)] ring-1 ring-black/5 sm:p-6 md:max-w-md"
      )}
      aria-labelledby="mini-mortgage-heading"
    >
      {hero ? (
        <div
          className="grid grid-cols-3 gap-1 rounded-xl bg-[#f4f6f5] p-1"
          role="tablist"
          aria-label="Typ výpočtu"
        >
          {(
            [
              ["purchase", "Hypotéka"],
              ["refinance", "Refinancování"],
              ["invest", "Investice"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={heroMode === id}
              className={cn(
                "h-9 rounded-lg px-1 text-xs font-semibold sm:text-[13px]",
                heroMode === id
                  ? "bg-white text-deep-teal shadow-sm"
                  : "text-gray-600 hover:text-deep-teal"
              )}
              onClick={() => {
                setHeroMode(id);
                if (id !== "invest") {
                  onInputChange(setPurpose, id);
                }
              }}
            >
              {label}
            </button>
          ))}
        </div>
      ) : (
        <p
          id="mini-mortgage-heading"
          className="text-[11px] font-bold uppercase tracking-[0.16em] text-deep-teal"
        >
          Hypoteční kalkulačka
        </p>
      )}
      {hero ? (
        <h2 id="mini-mortgage-heading" className="sr-only">
          Orientační kalkulačka
        </h2>
      ) : null}

      {hero && heroMode === "invest" ? (
        <div className="mt-5 space-y-4">
          <p className="text-sm leading-relaxed text-gray-600">
            Prověřte cash flow, financování a citlivost konkrétní nemovitosti.
            Výnos se nepočítá z hypoteční splátky.
          </p>
          <ul className="space-y-2 text-sm text-gray-700">
            {["Cash flow", "Scénáře", "Rizika"].map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-deep-teal" aria-hidden>
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
          <Link
            href={routes.investicniRentgen}
            className="flex h-11 items-center justify-center rounded-lg bg-deep-teal text-sm font-semibold text-white hover:bg-deep-teal-light"
          >
            Analyzovat investici →
          </Link>
          <p className="text-center text-[11px] leading-snug text-gray-500">
            Nezávazně a bez odeslání osobních údajů.
          </p>
        </div>
      ) : (
        <>
      <div className="mt-4 space-y-4">
        {hero ? null : (
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
        )}

        <MoneyField
          id="mini-mortgage-price"
          label="Cena nemovitosti"
          value={propertyPrice}
          onChange={(next) => onInputChange(setPropertyPrice, next)}
          slider={
            hero
              ? undefined
              : {
                  min: MINI_MORTGAGE_PRICE_SLIDER.min,
                  max: MINI_MORTGAGE_PRICE_SLIDER.max,
                  step: MINI_MORTGAGE_PRICE_SLIDER.step,
                }
          }
        />
        <MoneyField
          id="mini-mortgage-equity"
          label="Vlastní prostředky"
          value={ownFunds}
          shareLabel={ownFundsShareLabel}
          onChange={(next) => onInputChange(setOwnFunds, next)}
          slider={
            hero
              ? undefined
              : {
                  min: 0,
                  max: propertyPrice > 0 ? propertyPrice : 0,
                  step: 50_000,
                }
          }
        />

        <div className="min-w-0 space-y-1.5">
          <Label
            htmlFor="mini-mortgage-term"
            className="text-xs font-semibold text-text-dark"
          >
            {hero ? "Doba splatnosti" : "Doba splácení"}
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

        <div className={cn("grid min-w-0 gap-3", hero ? "grid-cols-1" : "grid-cols-2")}>
          <div className="min-w-0 space-y-1.5">
            <Label
              htmlFor="mini-mortgage-rate"
              className="text-xs font-semibold text-text-dark"
            >
              {hero ? "Úroková sazba" : "Modelová sazba pro splátku"}
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
                  if (parsed == null) return;
                  setInterestRate(parsed);
                  if (!aprTouchedRef.current) {
                    const apr = suggestedAprPercent(parsed);
                    setAprPercent(apr);
                    setAprDraft(formatPercentDraft(apr));
                  }
                }}
                onBlur={() => {
                  const parsed = parseInterestRate(rateDraft);
                  const next =
                    parsed ?? MINI_MORTGAGE_DEFAULTS.annualRatePercent;
                  setInterestRate(next);
                  setRateDraft(formatPercentDraft(next));
                  if (!aprTouchedRef.current) {
                    const apr = suggestedAprPercent(next);
                    setAprPercent(apr);
                    setAprDraft(formatPercentDraft(apr));
                  }
                }}
                aria-describedby={
                  hero ? "mini-mortgage-rate-hint" : "mini-mortgage-rate-hint mini-mortgage-market-hint"
                }
                className={cn(fieldControlClassName, "pr-8 tabular-nums")}
                title="Modelová sazba — nejde o aktuální nabídku banky"
              />
              <span
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground"
                aria-hidden
              >
                %
              </span>
            </div>
          </div>
          {hero ? null : (
          <div className="min-w-0 space-y-1.5">
            <Label
              htmlFor="mini-mortgage-apr"
              className="text-xs font-semibold text-text-dark"
            >
              Očekávané RPSN
            </Label>
            <div className="relative min-w-0">
              <input
                id="mini-mortgage-apr"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={aprDraft}
                onChange={(e) => {
                  markInteracted();
                  resetCalculation();
                  aprTouchedRef.current = true;
                  const next = e.target.value;
                  setAprDraft(next);
                  const parsed = parseInterestRate(next);
                  if (parsed != null) setAprPercent(parsed);
                }}
                onBlur={() => {
                  const parsed = parseInterestRate(aprDraft);
                  const next = parsed ?? suggestedAprPercent(interestRate);
                  setAprPercent(next);
                  setAprDraft(formatPercentDraft(next));
                }}
                aria-describedby="mini-mortgage-market-hint"
                className={cn(fieldControlClassName, "pr-8 tabular-nums")}
                title="Očekávané RPSN — odhad celkových nákladů úvěru, ne nabídka banky"
              />
              <span
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground"
                aria-hidden
              >
                %
              </span>
            </div>
          </div>
          )}
        </div>
        {hero ? null : (
        <p id="mini-mortgage-market-hint" className="text-sm text-gray-500">
          Pro srovnání: Aktuální průměrná sazba na trhu se pohybuje kolem 5,3&nbsp;%.
        </p>
        )}
        <p
          id="mini-mortgage-rate-hint"
          className="text-[11px] text-muted-foreground"
        >
          {hero
            ? "Modelová sazba pro orientační splátku. Není to nabídka banky."
            : "Splátka se počítá z modelové sazby. RPSN slouží jen k odhadu celkové zaplacené částky a můžete ho upravit."}
        </p>
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
        {hasCalculated && committedResult ? (
          <>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-muted-foreground">
                Výše hypotéky
              </p>
              <p className="mt-1 break-words font-heading text-xl font-bold tabular-nums tracking-tight text-text-dark sm:text-2xl">
                {formatCurrency(committedResult.loanAmountCzk, "CZK")}
              </p>
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold text-muted-foreground">LTV</p>
              <p className="mt-1 text-sm">
                <span className="font-semibold tabular-nums text-text-dark">
                  {exactLtv != null ? `${formatExactLtvCs(exactLtv)}\u00a0%` : "—"}
                </span>
                {committedResult.ltvBand != null ? (
                  <span className="text-muted-foreground">
                    {" "}
                    · pásmo {formatLtvBandLabel(committedResult.ltvBand)}
                  </span>
                ) : null}
              </p>
              <p
                className={cn(
                  "mt-1 text-xs leading-relaxed",
                  ltvHigh ? "text-amber-800" : "text-muted-foreground"
                )}
              >
                {ltvHigh
                  ? "Vyšší podíl úvěru — podmínky bank mohou být přísnější."
                  : "Orientační podíl úvěru k ceně nemovitosti."}
              </p>
            </div>

            <div className="min-w-0 rounded-xl bg-muted-gold/15 px-3 py-3 ring-1 ring-muted-gold/30">
              <p className="text-xs font-semibold text-muted-foreground">
                Orientační měsíční splátka
              </p>
              <p className="mt-1 break-words font-heading text-2xl font-bold tabular-nums tracking-tight text-text-dark sm:text-3xl">
                {formatCurrency(committedResult.monthlyPaymentCzk, "CZK")}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                při modelové sazbě{" "}
                <span className="font-semibold tabular-nums text-text-dark">
                  {committedResult.annualRatePercent
                    .toFixed(2)
                    .replace(".", ",")}
                  &nbsp;% p.a.
                </span>
              </p>
            </div>

            {hero ? null : (
            <div className="min-w-0">
              <p className="text-xs font-semibold text-muted-foreground">
                Celková zaplacená částka
              </p>
              <p className="mt-1 break-words font-heading text-xl font-bold tabular-nums tracking-tight text-text-dark">
                {formatCurrency(committedResult.totalPaidCzk, "CZK")}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                model podle RPSN{" "}
                <span className="font-semibold tabular-nums text-text-dark">
                  {committedResult.aprPercent.toFixed(2).replace(".", ",")}
                  &nbsp;%
                </span>{" "}
                za {committedResult.termYears} let. Není nabídka banky.
              </p>
            </div>
            )}
          </>
        ) : (
          <div className="min-w-0 rounded-xl bg-muted-gold/15 px-3 py-3 ring-1 ring-muted-gold/30">
            <p className="text-xs font-semibold text-muted-foreground">
              Orientační měsíční splátka
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Zadejte údaje a klikněte na „{MINI_MORTGAGE_CTA.calculate}“.
            </p>
          </div>
        )}
      </div>

      {!hasCalculated ? (
        <button
          type="button"
          className={cn(
            primaryButtonClassName,
            hero
              ? "bg-deep-teal text-white hover:bg-deep-teal-light"
              : "bg-muted-gold text-text-dark hover:bg-muted-gold-light"
          )}
          disabled={primaryDisabled}
          aria-busy={isCalculating}
          aria-describedby={
            !validation.valid ? "mini-mortgage-validation" : undefined
          }
          onClick={() => void handleCalculate()}
        >
          {isCalculating
            ? "Počítám…"
            : hero
              ? heroMode === "refinance"
                ? "Prověřit refinancování →"
                : "Spočítat hypotéku →"
              : MINI_MORTGAGE_CTA.calculate}
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
            hero
              ? "bg-deep-teal text-white hover:bg-deep-teal-light"
              : "bg-muted-gold text-text-dark hover:bg-muted-gold-light"
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
        {hero ? "Nezávazně a bez odeslání osobních údajů. " : null}
        {getCalculatorDisclaimer("cs")}
        {hasCalculated
          ? " Sazby bank otevřete tlačítkem výše."
          : " Po výpočtu zobrazíte sazby pro stejné parametry."}
      </p>
        </>
      )}
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
  variant?: "page" | "hero";
};

export function MiniMortgageCalculator(props: MiniMortgageCalculatorProps = {}) {
  const { serverJourney, variant = "page" } = props;
  if (serverJourney !== undefined) {
    return (
      <MiniMortgageCalculatorCore
        bootstrap={bootstrapFromJourney(serverJourney)}
        variant={variant}
      />
    );
  }
  return (
    <Suspense fallback={<MiniMortgageCalculatorSkeleton />}>
      <MiniMortgageCalculatorUrlLoader />
    </Suspense>
  );
}
