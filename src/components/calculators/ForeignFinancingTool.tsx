"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, BadgeCheck, Landmark } from "lucide-react";
import { CalculatorDisclaimer } from "@/components/calculators/CalculatorDisclaimer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  countryConfigs,
  formatCurrency,
  type CountryId,
} from "@/lib/calculators";
import { formatNumber, parseFormattedNumber } from "@/lib/format";
import { missingDataLabel } from "@/lib/data/display";
import {
  calculateFinancing,
  defaultFinancingOption,
  getFinancingProducts,
  hasLocalMortgageProduct,
  LOCAL_FINANCING_UNVERIFIED_MESSAGE,
  type FinancingOptionId,
} from "@/lib/financing";
import {
  findBankRate,
  pickAmericanBankRate,
  useBankRates,
} from "@/lib/bank-rates";
import { DOMESTIC_BANKS, formatRatesUpdatedAt } from "@/lib/banking";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

type ForeignFinancingToolProps = {
  country: CountryId;
};

function MoneyField({
  id,
  label,
  value,
  onChange,
  suffix,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium text-text-dark">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type="text"
          inputMode="numeric"
          value={formatNumber(value)}
          onChange={(e) => onChange(parseFormattedNumber(e.target.value))}
          className="h-11 pr-14 rounded-lg bg-white border-border tabular-nums"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
          {suffix}
        </span>
      </div>
    </div>
  );
}

export function ForeignFinancingTool({ country }: ForeignFinancingToolProps) {
  // Remount on country change so defaults reset without setState-in-effect.
  return <ForeignFinancingToolInner key={country} country={country} />;
}

function ForeignFinancingToolInner({ country }: ForeignFinancingToolProps) {
  const config = countryConfigs[country];
  const products = useMemo(() => getFinancingProducts(country), [country]);

  const [option, setOption] = useState<FinancingOptionId>(() =>
    defaultFinancingOption(country)
  );
  const [price, setPrice] = useState(config.defaultPrice);
  const [savings, setSavings] = useState(config.defaultSavings);
  const [termYears, setTermYears] = useState(config.defaultTerm);

  const { bankRates, loading: bankRatesLoading } = useBankRates();

  const czechEquityRate = useMemo(() => {
    const rates = DOMESTIC_BANKS.map((bank) => {
      const row = findBankRate(bankRates, bank.name);
      if (!row) return null;
      return pickAmericanBankRate(row, true)?.rate ?? null;
    }).filter((r): r is number => r != null);
    if (rates.length === 0) return null;
    return Math.min(...rates);
  }, [bankRates]);

  const result = useMemo(
    () =>
      calculateFinancing({
        country,
        option,
        propertyPrice: price,
        ownFunds: savings,
        termYears,
        czechEquityRatePercentPa:
          option === "CZECH_EQUITY_LOAN" ? czechEquityRate : null,
      }),
    [country, option, price, savings, termYears, czechEquityRate]
  );

  const fmt = (n: number | null | undefined, currency = result.currency) =>
    n == null || !Number.isFinite(n)
      ? missingDataLabel(null)
      : formatCurrency(n, currency);

  const showLocalUnverified =
    !hasLocalMortgageProduct(country) ||
    (option === "LOCAL_MORTGAGE" && !result.calculable);

  return (
    <div className="space-y-8">
      <header className="rounded-2xl border border-border bg-white p-5 sm:p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
          Financing · {config.label}
        </p>
        <h2 className="mt-1 font-heading text-2xl font-bold text-text-dark sm:text-3xl">
          Kalkulačka financování
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Oddělujeme bankovní hypotéku, developer payment plan, české zajištění
          a hotovost. Bez ověřených dat produkt nevymýšlíme.
        </p>
      </header>

      <section className="space-y-3">
        <h3 className="font-semibold text-text-dark">Typ financování</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {products.map((p) => (
            <button
              key={p.option}
              type="button"
              onClick={() => setOption(p.option)}
              className={cn(
                "rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal",
                option === p.option
                  ? "border-deep-teal bg-deep-teal/5 ring-1 ring-deep-teal/30"
                  : "border-border bg-white hover:border-deep-teal/40"
              )}
            >
              <p className="font-semibold text-text-dark">{p.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {p.description}
              </p>
              {p.maxLtvPercent != null && p.maxLtvPercent > 0 && (
                <p className="mt-2 text-xs font-medium text-deep-teal">
                  Max LTV v modelu: {p.maxLtvPercent} %
                </p>
              )}
            </button>
          ))}
        </div>
      </section>

      {showLocalUnverified && option !== "CZECH_EQUITY_LOAN" && option !== "CASH" && option !== "DEVELOPER_PAYMENT_PLAN" && (
        <div
          role="status"
          className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-950"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{LOCAL_FINANCING_UNVERIFIED_MESSAGE}</p>
        </div>
      )}

      {!hasLocalMortgageProduct(country) && (
        <p className="text-sm text-muted-foreground">
          Pro {config.label} nemáme v datech ověřený lokální bankovní produkt
          pro daný profil. {LOCAL_FINANCING_UNVERIFIED_MESSAGE}
        </p>
      )}

      <section className="rounded-2xl border border-border bg-[#f7f8f7] p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MoneyField
            id="fx-price"
            label="Cena nemovitosti"
            value={price}
            onChange={setPrice}
            suffix={config.currency}
          />
          <MoneyField
            id="fx-savings"
            label="Vlastní zdroje"
            value={savings}
            onChange={setSavings}
            suffix={config.currency}
          />
          {(option === "CZECH_EQUITY_LOAN" ||
            (option === "LOCAL_MORTGAGE" && result.calculable)) && (
            <div className="space-y-1.5">
              <Label htmlFor="fx-term">Splatnost (roky)</Label>
              <Input
                id="fx-term"
                type="number"
                min={5}
                max={40}
                value={termYears}
                onChange={(e) =>
                  setTermYears(
                    Math.min(40, Math.max(5, Number(e.target.value) || 20))
                  )
                }
                className="h-11 bg-white"
              />
            </div>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="font-heading text-xl font-bold text-text-dark">
          Výsledek — {result.label}
        </h3>

        {result.message && (
          <p className="text-sm text-muted-foreground">{result.message}</p>
        )}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-border bg-white p-4">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Financovaná částka
            </p>
            <p className="mt-1 font-heading text-xl font-bold tabular-nums text-deep-teal">
              {fmt(result.financedAmount)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-white p-4">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              LTV
            </p>
            <p className="mt-1 font-heading text-xl font-bold tabular-nums">
              {result.ltv != null ? `${result.ltv} %` : missingDataLabel(null)}
            </p>
            {result.maxLtvPercent != null && result.maxLtvPercent > 0 && (
              <p className="mt-1 text-xs text-muted-foreground">
                Strop v modelu: {result.maxLtvPercent} %
              </p>
            )}
          </div>
          <div className="rounded-lg border border-border bg-white p-4">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              {option === "DEVELOPER_PAYMENT_PLAN"
                ? "Špičková měsíční platba"
                : "Měsíční splátka"}
            </p>
            <p className="mt-1 font-heading text-xl font-bold tabular-nums">
              {result.calculable
                ? fmt(
                    option === "DEVELOPER_PAYMENT_PLAN"
                      ? result.peakMonthlyPayment
                      : result.monthlyPayment
                  )
                : missingDataLabel(null)}
            </p>
          </div>
          {option === "CZECH_EQUITY_LOAN" && (
            <div className="rounded-lg border border-border bg-white p-4">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Sazba (americká, min. z bank)
              </p>
              <p className="mt-1 font-heading text-xl font-bold tabular-nums">
                {result.ratePercentPa != null
                  ? `${result.ratePercentPa.toFixed(2)} %`
                  : missingDataLabel(null)}
              </p>
              {bankRatesLoading && (
                <p className="mt-1 text-xs text-muted-foreground">Načítám…</p>
              )}
            </div>
          )}
          {result.calculable && result.totalPaid != null && (
            <div className="rounded-lg border border-border bg-white p-4">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Celkem zaplaceno
              </p>
              <p className="mt-1 font-heading text-xl font-bold tabular-nums">
                {fmt(result.totalPaid)}
              </p>
            </div>
          )}
          {result.calculable &&
            result.totalInterest != null &&
            option !== "DEVELOPER_PAYMENT_PLAN" &&
            option !== "CASH" && (
              <div className="rounded-lg border border-border bg-white p-4">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Celkové úroky
                </p>
                <p className="mt-1 font-heading text-xl font-bold tabular-nums">
                  {fmt(result.totalInterest)}
                </p>
              </div>
            )}
        </div>

        {result.ltvExceedsMax && (
          <div
            role="status"
            className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-950"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Požadované LTV {result.ltv} % přesahuje strop produktu (
              {result.maxLtvPercent} %). Nejde o příslib ani zamítnutí — jen
              orientační kontrola.
            </p>
          </div>
        )}

        {result.developerPhases && (
          <div className="rounded-xl border border-border bg-white p-4 sm:p-5">
            <h4 className="inline-flex items-center gap-2 font-semibold text-text-dark">
              <Landmark className="h-4 w-4 text-deep-teal" />
              Harmonogram plateb (schedule)
            </h4>
            <p className="mt-1 text-xs text-muted-foreground">
              Booking → výstavba → handover → post-handover. Bez anuitní sazby.
            </p>
            <ul className="mt-3 divide-y divide-border">
              {result.developerPhases.map((phase) => (
                <li
                  key={phase.id}
                  className="flex flex-wrap items-baseline justify-between gap-2 py-2.5 text-sm"
                >
                  <div>
                    <p className="font-medium text-text-dark">{phase.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {phase.percentOfPrice} % · {phase.durationMonths} měs.
                    </p>
                  </div>
                  <div className="text-right tabular-nums">
                    <p className="font-semibold">{fmt(phase.amount)}</p>
                    {phase.monthlyPayment != null &&
                      phase.durationMonths > 1 && (
                        <p className="text-xs text-muted-foreground">
                          {fmt(phase.monthlyPayment)}/měs.
                        </p>
                      )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-xs text-muted-foreground">{result.disclaimer}</p>
      </section>

      <section className="rounded-2xl border border-deep-teal/20 bg-deep-teal px-5 py-6 text-white sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-muted-gold">
              <BadgeCheck className="h-4 w-4" />
              Další krok
            </p>
            <h3 className="mt-1 font-heading text-xl font-bold sm:text-2xl">
              Nechat výsledek ověřit licencovaným specialistou
            </h3>
            <p className="mt-2 text-sm text-white/80">
              Lokální dostupnost a podmínky vždy závisí na bance / developerovi —
              tato kalkulačka nic neschvaluje.
            </p>
          </div>
          <Link
            href={routes.navrhNaMiru}
            className="inline-flex h-12 shrink-0 items-center justify-center rounded-lg bg-muted-gold px-6 text-sm font-semibold text-text-dark transition-colors hover:bg-muted-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Ověřit výsledek →
          </Link>
        </div>
      </section>

      <CalculatorDisclaimer />
      <p className="text-xs text-muted-foreground">
        {formatRatesUpdatedAt(
          bankRates.find((r) => r.updatedAt)?.updatedAt ?? null
        )}
      </p>
    </div>
  );
}
