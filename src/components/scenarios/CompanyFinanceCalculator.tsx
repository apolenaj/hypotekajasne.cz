"use client";

import { useEffect, useMemo, useState } from "react";
import { formatMoney, formatRate } from "@/lib/money";
import {
  computeCompanyFinance,
  COMPANY_FINANCE_MODEL_VERSION,
  type CompanyFinanceResult,
} from "@/lib/scenarios/company-finance";

const field =
  "mt-1 h-11 w-full rounded-xl border border-border bg-white px-3 text-sm tabular-nums outline-none focus:border-deep-teal focus:ring-2 focus:ring-deep-teal/20";

export type CompanyVariant =
  | "established"
  | "new_spv"
  | "own_use"
  | "rental"
  | "build_to_sell";

const VARIANT_LABELS: Record<CompanyVariant, string> = {
  established: "Zavedená firma",
  new_spv: "Nová firma / SPV",
  own_use: "Nemovitost pro vlastní podnikání",
  rental: "Nemovitost k pronájmu",
  build_to_sell: "Výstavba k následnému prodeji",
};

export function CompanyFinanceCalculator({
  onSummary,
}: {
  onSummary?: (summary: Record<string, unknown>) => void;
} = {}) {
  const [variant, setVariant] = useState<CompanyVariant>("rental");
  const [propertyPrice, setPropertyPrice] = useState(8_000_000);
  const [ancillary, setAncillary] = useState(200_000);
  const [equity, setEquity] = useState(2_500_000);
  const [collateral, setCollateral] = useState<string>("8000000");
  const [rate, setRate] = useState(5.5);
  const [termYears, setTermYears] = useState(20);
  const [ltvLimit, setLtvLimit] = useState(70);
  const [showDscr, setShowDscr] = useState(false);
  const [cashAvailable, setCashAvailable] = useState(900_000);
  const [otherDebt, setOtherDebt] = useState(120_000);
  const [monthlyRent, setMonthlyRent] = useState(45_000);
  const [opex, setOpex] = useState(80_000);

  const collateralValue =
    collateral.trim() === "" ? null : Number(collateral.replace(/\s/g, ""));

  const result = useMemo(
    () =>
      computeCompanyFinance({
        propertyPriceCzk: propertyPrice,
        ancillaryCostsCzk: ancillary,
        equityCzk: equity,
        collateralValueCzk:
          collateralValue != null && Number.isFinite(collateralValue)
            ? collateralValue
            : null,
        annualRatePercent: rate,
        termYears,
        modelLtvLimitPercent: ltvLimit,
        annualCashAvailableForDebtCzk: showDscr ? cashAvailable : null,
        annualOtherDebtServiceCzk: showDscr ? otherDebt : 0,
        monthlyRentCzk: variant === "rental" ? monthlyRent : null,
        annualOperatingCostsCzk: variant === "rental" ? opex : null,
      }),
    [
      propertyPrice,
      ancillary,
      equity,
      collateralValue,
      rate,
      termYears,
      ltvLimit,
      showDscr,
      cashAvailable,
      otherDebt,
      monthlyRent,
      opex,
      variant,
    ]
  );

  useEffect(() => {
    onSummary?.({
      modelVersion: COMPANY_FINANCE_MODEL_VERSION,
      variant,
      loanNeedCzk: result.loanNeedCzk,
      monthlyPaymentCzk: result.monthlyPaymentCzk,
      ltvLabel: result.ltvLabel,
      rate,
      termYears,
    });
  }, [onSummary, result, variant, rate, termYears]);

  return (
    <div className="rounded-2xl border border-border bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-heading text-xl font-semibold text-text-dark">
            Kalkulačka financování firmy
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Model plně amortizovaného anuitního úvěru. Firemní nabídka může mít
            jiný splátkový profil. Sazba je modelová — u firem často platí
            „stanovuje se individuálně“.
          </p>
        </div>
      </div>

      <fieldset className="mt-5">
        <legend className="text-sm font-semibold text-text-dark">
          Vaše situace
        </legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {(Object.keys(VARIANT_LABELS) as CompanyVariant[]).map((key) => (
            <label
              key={key}
              className="flex cursor-pointer items-start gap-2 rounded-xl border border-border px-3 py-2 text-sm"
            >
              <input
                type="radio"
                name="company-variant"
                checked={variant === key}
                onChange={() => setVariant(key)}
                className="mt-1"
              />
              <span>{VARIANT_LABELS[key]}</span>
            </label>
          ))}
        </div>
        {variant === "build_to_sell" ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Výnos z prodeje nepatří do běžné nájemní kalkulačky — potřebujete
            individuální developerský model.
          </p>
        ) : null}
        {variant === "new_spv" ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Nová firma bez historie obvykle vyžaduje individuální posouzení
            projektu, vlastníků a zajištění.
          </p>
        ) : null}
      </fieldset>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          Cena nemovitosti
          <input
            className={field}
            type="number"
            min={0}
            value={propertyPrice}
            onChange={(e) => setPropertyPrice(Number(e.target.value))}
          />
        </label>
        <label className="text-sm">
          Vedlejší pořizovací náklady
          <input
            className={field}
            type="number"
            min={0}
            value={ancillary}
            onChange={(e) => setAncillary(Number(e.target.value))}
          />
        </label>
        <label className="text-sm">
          Vlastní peníze na pořízení
          <input
            className={field}
            type="number"
            min={0}
            value={equity}
            onChange={(e) => setEquity(Number(e.target.value))}
          />
        </label>
        <label className="text-sm">
          Bankou uznatelná hodnota zástavy
          <input
            className={field}
            type="text"
            inputMode="numeric"
            placeholder="Nechte prázdné, pokud nevíte"
            value={collateral}
            onChange={(e) => setCollateral(e.target.value)}
          />
        </label>
        <label className="text-sm">
          Modelová sazba p.a.
          <input
            className={field}
            type="number"
            min={0}
            step={0.1}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
          />
        </label>
        <label className="text-sm">
          Doba splácení (roky)
          <input
            className={field}
            type="number"
            min={1}
            value={termYears}
            onChange={(e) => setTermYears(Number(e.target.value))}
          />
        </label>
        <label className="text-sm">
          Modelový limit LTV (%)
          <input
            className={field}
            type="number"
            min={1}
            max={100}
            value={ltvLimit}
            onChange={(e) => setLtvLimit(Number(e.target.value))}
          />
        </label>
      </div>

      {variant === "rental" ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            Měsíční nájem (model provozu)
            <input
              className={field}
              type="number"
              min={0}
              value={monthlyRent}
              onChange={(e) => setMonthlyRent(Number(e.target.value))}
            />
          </label>
          <label className="text-sm">
            Roční provozní náklady
            <input
              className={field}
              type="number"
              min={0}
              value={opex}
              onChange={(e) => setOpex(Number(e.target.value))}
            />
          </label>
          <p className="sm:col-span-2 text-xs text-muted-foreground">
            Zjednodušený provozní tok z nájmu — není bankovní metodika.
          </p>
        </div>
      ) : null}

      <label className="mt-4 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={showDscr}
          onChange={(e) => setShowDscr(e.target.checked)}
        />
        Zobrazit modul schopnosti splácet (DSCR)
      </label>
      {showDscr ? (
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            Roční peněžní tok dostupný na dluhovou službu
            <input
              className={field}
              type="number"
              value={cashAvailable}
              onChange={(e) => setCashAvailable(Number(e.target.value))}
            />
          </label>
          <label className="text-sm">
            Roční splátky dalších úvěrů (stejný rozsah)
            <input
              className={field}
              type="number"
              value={otherDebt}
              onChange={(e) => setOtherDebt(Number(e.target.value))}
            />
          </label>
          <p className="sm:col-span-2 text-xs text-muted-foreground">
            Porovnávejte tok projektu s dluhy projektu, nebo tok firmy s dluhy
            firmy. Nemíchejte obě úrovně. Jedna hodnota DSCR není společná
            schvalovací hranice všech bank.
          </p>
        </div>
      ) : null}

      <ResultPanel result={result} rate={rate} />
    </div>
  );
}

function ResultPanel({
  result,
  rate,
}: {
  result: CompanyFinanceResult;
  rate: number;
}) {
  const dscrLabel =
    result.dscr.kind === "ratio"
      ? result.dscr.value.toLocaleString("cs-CZ", {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2,
        })
      : result.dscr.kind === "no_debt_service"
        ? "Bez dluhové služby"
        : "—";

  return (
    <div className="mt-6 rounded-2xl bg-[#f7f8f7] p-4">
      <h4 className="font-heading text-lg font-semibold text-text-dark">
        Orientační výsledek
      </h4>
      <dl className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-xs text-muted-foreground">Potřeba úvěru</dt>
          <dd className="font-semibold tabular-nums">
            {formatMoney(result.loanNeedCzk)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Měsíční splátka</dt>
          <dd className="font-semibold tabular-nums">
            {formatMoney(result.monthlyPaymentCzk)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">LTV</dt>
          <dd className="font-semibold tabular-nums">{result.ltvLabel}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Modelová sazba</dt>
          <dd className="font-semibold tabular-nums">{formatRate(rate)}</dd>
        </div>
        {result.gapToLtvLimitCzk != null && result.gapToLtvLimitCzk > 0 ? (
          <div>
            <dt className="text-xs text-muted-foreground">
              Mezera vůči modelovému limitu LTV
            </dt>
            <dd className="font-semibold tabular-nums text-deep-teal">
              {formatMoney(result.gapToLtvLimitCzk)}
            </dd>
          </div>
        ) : null}
        {result.dscr.kind !== "unavailable" ? (
          <div>
            <dt className="text-xs text-muted-foreground">Modelové DSCR</dt>
            <dd className="font-semibold tabular-nums">{dscrLabel}</dd>
          </div>
        ) : null}
        {result.rentalOperatingSurplusAnnualCzk != null ? (
          <div>
            <dt className="text-xs text-muted-foreground">
              Modelový roční provozní tok z nájmu
            </dt>
            <dd className="font-semibold tabular-nums">
              {formatMoney(result.rentalOperatingSurplusAnnualCzk)}
            </dd>
          </div>
        ) : null}
      </dl>
      {result.principalScheduleSample.length > 0 ? (
        <div className="mt-4 overflow-x-auto">
          <p className="text-xs font-semibold text-text-dark">
            Modelový zůstatek jistiny (prvních let)
          </p>
          <table className="mt-2 w-full min-w-[280px] text-left text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground">
                <th className="py-1 pr-3">Rok</th>
                <th className="py-1">Zůstatek</th>
              </tr>
            </thead>
            <tbody>
              {result.principalScheduleSample.map((row) => (
                <tr key={row.year} className="border-t border-border">
                  <td className="py-1.5 pr-3 tabular-nums">{row.year}</td>
                  <td className="py-1.5 tabular-nums">
                    {formatMoney(row.remainingPrincipalCzk)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      <ul className="mt-4 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
        {result.assumptions.map((a) => (
          <li key={a}>{a}</li>
        ))}
      </ul>
    </div>
  );
}
