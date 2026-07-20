"use client";

import { useMemo, useState } from "react";
import { InfoTooltip } from "@/components/calculators/InfoTooltip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  asPercent,
  calculateInvestment,
  INVESTMENT_METHODOLOGY,
  INVESTMENT_METRIC_TOOLTIPS,
  type InvestmentEngineInput,
  type ScenarioId,
} from "@/lib/investment-engine";
import { formatCurrency, type CountryId, countryConfigs } from "@/lib/calculators";
import { cn } from "@/lib/utils";

type InvestmentEnginePanelProps = {
  country: CountryId;
  /** Předvyplnění z trhu / financování */
  defaults?: Partial<InvestmentEngineInput>;
};

const SCENARIOS: { id: ScenarioId; label: string }[] = [
  { id: "bear", label: "Pesimistický" },
  { id: "base", label: "Základní" },
  { id: "bull", label: "Optimistický" },
  { id: "custom", label: "Vlastní" },
];

function Field({
  id,
  label,
  tip,
  children,
}: {
  id: string;
  label: string;
  tip?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Label htmlFor={id} className="text-xs font-medium text-text-dark">
          {label}
        </Label>
        {tip && <InfoTooltip content={tip} />}
      </div>
      {children}
    </div>
  );
}

function MetricCard({
  label,
  tip,
  value,
  accent,
}: {
  label: string;
  tip: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-white p-3">
      <div className="flex items-center gap-1">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <InfoTooltip content={tip} />
      </div>
      <p
        className={cn(
          "mt-1 font-heading text-lg font-bold tabular-nums",
          accent ? "text-deep-teal" : "text-text-dark"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function pct(ratio: number | null): string {
  const p = asPercent(ratio);
  return p == null
    ? "—"
    : `${p.toLocaleString("cs-CZ", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}\u00a0%`;
}

export function InvestmentEnginePanel({
  country,
  defaults,
}: InvestmentEnginePanelProps) {
  const config = countryConfigs[country];
  const currency = config.currency;

  const [scenario, setScenario] = useState<ScenarioId>("base");
  const [customVacancyDelta, setCustomVacancyDelta] = useState(0);
  const [customRentGrowthDelta, setCustomRentGrowthDelta] = useState(0);
  const [customPropGrowthDelta, setCustomPropGrowthDelta] = useState(0);
  const [customFxDelta, setCustomFxDelta] = useState(0);

  const [purchasePrice, setPurchasePrice] = useState(
    defaults?.purchasePrice ?? config.defaultPrice
  );
  const [downPayment, setDownPayment] = useState(
    defaults?.downPayment ?? config.defaultSavings
  );
  const [loan, setLoan] = useState<number>(
    defaults?.loan ??
      Math.max(0, (defaults?.purchasePrice ?? config.defaultPrice) -
        (defaults?.downPayment ?? config.defaultSavings))
  );
  const [rate, setRate] = useState<number>(defaults?.rate ?? 5);
  const [termYears, setTermYears] = useState(
    defaults?.termYears ?? config.defaultTerm
  );
  const [rentMonthly, setRentMonthly] = useState(
    defaults?.rentMonthly ??
      Math.round(config.defaultPrice * config.defaultRentalYield / 12)
  );
  const [vacancyRate, setVacancyRate] = useState(
    (defaults?.vacancyRate ?? 0.05) * 100
  );
  const [managementFeeRate, setManagementFeeRate] = useState(
    (defaults?.managementFeeRate ?? 0.08) * 100
  );
  const [serviceCharges, setServiceCharges] = useState(
    defaults?.serviceChargesAnnual ?? 0
  );
  const [insurance, setInsurance] = useState(defaults?.insuranceAnnual ?? 0);
  const [propertyTax, setPropertyTax] = useState(
    defaults?.propertyTaxAnnual ?? 0
  );
  const [incomeTaxRate, setIncomeTaxRate] = useState(
    (defaults?.incomeTaxRate ?? 0.15) * 100
  );
  const [maintenance, setMaintenance] = useState(
    defaults?.maintenanceAnnual ?? 0
  );
  const [capexReserve, setCapexReserve] = useState(
    defaults?.capexReserveAnnual ?? 0
  );
  const [furnishing, setFurnishing] = useState(defaults?.furnishing ?? 0);
  const [acquisitionCosts, setAcquisitionCosts] = useState(
    defaults?.acquisitionCosts ?? 0
  );
  const [sellingCostRate, setSellingCostRate] = useState(
    (defaults?.sellingCostRate ?? 0.03) * 100
  );
  const [rentGrowth, setRentGrowth] = useState(
    (defaults?.annualRentGrowth ?? 0.02) * 100
  );
  const [propGrowth, setPropGrowth] = useState(
    (defaults?.annualPropertyGrowth ?? 0.02) * 100
  );
  const [fxReturn, setFxReturn] = useState(
    (defaults?.annualFxReturn ?? 0) * 100
  );
  const [holdingPeriod, setHoldingPeriod] = useState(
    defaults?.holdingPeriodYears ?? 10
  );

  const input: InvestmentEngineInput = useMemo(
    () => ({
      purchasePrice,
      downPayment,
      loan,
      rate: rate > 0 ? rate : loan > 0 ? rate : null,
      termYears,
      rentMonthly,
      vacancyRate: vacancyRate / 100,
      managementFeeRate: managementFeeRate / 100,
      serviceChargesAnnual: serviceCharges,
      insuranceAnnual: insurance,
      propertyTaxAnnual: propertyTax,
      incomeTaxRate: incomeTaxRate / 100,
      maintenanceAnnual: maintenance,
      capexReserveAnnual: capexReserve,
      furnishing,
      acquisitionCosts,
      sellingCostRate: sellingCostRate / 100,
      annualRentGrowth: rentGrowth / 100,
      annualPropertyGrowth: propGrowth / 100,
      annualFxReturn: fxReturn / 100,
      holdingPeriodYears: holdingPeriod,
    }),
    [
      purchasePrice,
      downPayment,
      loan,
      rate,
      termYears,
      rentMonthly,
      vacancyRate,
      managementFeeRate,
      serviceCharges,
      insurance,
      propertyTax,
      incomeTaxRate,
      maintenance,
      capexReserve,
      furnishing,
      acquisitionCosts,
      sellingCostRate,
      rentGrowth,
      propGrowth,
      fxReturn,
      holdingPeriod,
    ]
  );

  const result = useMemo(
    () =>
      calculateInvestment(
        input,
        scenario,
        scenario === "custom"
          ? {
              vacancyRateDelta: customVacancyDelta / 100,
              annualRentGrowthDelta: customRentGrowthDelta / 100,
              annualPropertyGrowthDelta: customPropGrowthDelta / 100,
              annualFxReturnDelta: customFxDelta / 100,
            }
          : undefined
      ),
    [
      input,
      scenario,
      customVacancyDelta,
      customRentGrowthDelta,
      customPropGrowthDelta,
      customFxDelta,
    ]
  );

  const money = (n: number | null | undefined) =>
    n == null || !Number.isFinite(n) ? "—" : formatCurrency(n, currency);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setScenario(s.id)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
              scenario === s.id
                ? "bg-deep-teal text-white"
                : "bg-white text-text-dark ring-1 ring-border hover:ring-deep-teal/40"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {scenario === "custom" && (
        <div className="grid grid-cols-1 gap-3 rounded-xl border border-border bg-[#f7f8f7] p-4 sm:grid-cols-2">
          <Field id="c-vac" label="Δ Neobsazenost (p.b.)">
            <Input
              id="c-vac"
              type="number"
              step={0.5}
              value={customVacancyDelta}
              onChange={(e) => setCustomVacancyDelta(Number(e.target.value) || 0)}
              className="h-10"
            />
          </Field>
          <Field id="c-rent" label="Δ Růst nájmu (p.b.)">
            <Input
              id="c-rent"
              type="number"
              step={0.5}
              value={customRentGrowthDelta}
              onChange={(e) =>
                setCustomRentGrowthDelta(Number(e.target.value) || 0)
              }
              className="h-10"
            />
          </Field>
          <Field id="c-prop" label="Δ Růst ceny (p.b.)">
            <Input
              id="c-prop"
              type="number"
              step={0.5}
              value={customPropGrowthDelta}
              onChange={(e) =>
                setCustomPropGrowthDelta(Number(e.target.value) || 0)
              }
              className="h-10"
            />
          </Field>
          <Field id="c-fx" label="Δ FX (p.b.)">
            <Input
              id="c-fx"
              type="number"
              step={0.5}
              value={customFxDelta}
              onChange={(e) => setCustomFxDelta(Number(e.target.value) || 0)}
              className="h-10"
            />
          </Field>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Field id="price" label="Kupní cena" tip="Kupní cena nemovitosti">
          <Input
            id="price"
            type="number"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(Number(e.target.value) || 0)}
            className="h-10"
          />
        </Field>
        <Field id="down" label="Vlastní prostředky">
          <Input
            id="down"
            type="number"
            value={downPayment}
            onChange={(e) => setDownPayment(Number(e.target.value) || 0)}
            className="h-10"
          />
        </Field>
        <Field id="loan" label="Výše úvěru">
          <Input
            id="loan"
            type="number"
            value={loan}
            onChange={(e) => setLoan(Number(e.target.value) || 0)}
            className="h-10"
          />
        </Field>
        <Field id="rate" label="Úroková sazba % p.a." tip="0 u modelu jen z vlastních zdrojů, bez dluhu">
          <Input
            id="rate"
            type="number"
            step={0.1}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value) || 0)}
            className="h-10"
          />
        </Field>
        <Field id="term" label="Doba splatnosti (roky)">
          <Input
            id="term"
            type="number"
            value={termYears}
            onChange={(e) => setTermYears(Number(e.target.value) || 1)}
            className="h-10"
          />
        </Field>
        <Field id="rent" label="Měsíční nájemné (hrubé)">
          <Input
            id="rent"
            type="number"
            value={rentMonthly}
            onChange={(e) => setRentMonthly(Number(e.target.value) || 0)}
            className="h-10"
          />
        </Field>
        <Field id="vac" label="Neobsazenost %" tip={INVESTMENT_METRIC_TOOLTIPS.breakEvenOccupancy}>
          <Input
            id="vac"
            type="number"
            step={0.5}
            value={vacancyRate}
            onChange={(e) => setVacancyRate(Number(e.target.value) || 0)}
            className="h-10"
          />
        </Field>
        <Field id="mgmt" label="Správa nemovitosti % z ef. nájmu">
          <Input
            id="mgmt"
            type="number"
            step={0.5}
            value={managementFeeRate}
            onChange={(e) => setManagementFeeRate(Number(e.target.value) || 0)}
            className="h-10"
          />
        </Field>
        <Field id="svc" label="Provozní poplatky / rok">
          <Input
            id="svc"
            type="number"
            value={serviceCharges}
            onChange={(e) => setServiceCharges(Number(e.target.value) || 0)}
            className="h-10"
          />
        </Field>
        <Field id="ins" label="Pojištění / rok">
          <Input
            id="ins"
            type="number"
            value={insurance}
            onChange={(e) => setInsurance(Number(e.target.value) || 0)}
            className="h-10"
          />
        </Field>
        <Field id="ptax" label="Daň z nemovitosti / rok">
          <Input
            id="ptax"
            type="number"
            value={propertyTax}
            onChange={(e) => setPropertyTax(Number(e.target.value) || 0)}
            className="h-10"
          />
        </Field>
        <Field id="itax" label="Předpoklad daně z příjmu %">
          <Input
            id="itax"
            type="number"
            step={1}
            value={incomeTaxRate}
            onChange={(e) => setIncomeTaxRate(Number(e.target.value) || 0)}
            className="h-10"
          />
        </Field>
        <Field id="maint" label="Údržba a opravy / rok">
          <Input
            id="maint"
            type="number"
            value={maintenance}
            onChange={(e) => setMaintenance(Number(e.target.value) || 0)}
            className="h-10"
          />
        </Field>
        <Field id="capex" label="Rezerva na investice (capex) / rok">
          <Input
            id="capex"
            type="number"
            value={capexReserve}
            onChange={(e) => setCapexReserve(Number(e.target.value) || 0)}
            className="h-10"
          />
        </Field>
        <Field id="furn" label="Vybavení (jednorázově)">
          <Input
            id="furn"
            type="number"
            value={furnishing}
            onChange={(e) => setFurnishing(Number(e.target.value) || 0)}
            className="h-10"
          />
        </Field>
        <Field id="acq" label="Pořizovací náklady">
          <Input
            id="acq"
            type="number"
            value={acquisitionCosts}
            onChange={(e) => setAcquisitionCosts(Number(e.target.value) || 0)}
            className="h-10"
          />
        </Field>
        <Field id="sell" label="Prodejní náklady %">
          <Input
            id="sell"
            type="number"
            step={0.5}
            value={sellingCostRate}
            onChange={(e) => setSellingCostRate(Number(e.target.value) || 0)}
            className="h-10"
          />
        </Field>
        <Field id="rg" label="Růst nájmu % p.a.">
          <Input
            id="rg"
            type="number"
            step={0.5}
            value={rentGrowth}
            onChange={(e) => setRentGrowth(Number(e.target.value) || 0)}
            className="h-10"
          />
        </Field>
        <Field id="pg" label="Roční růst hodnoty % p.a.">
          <Input
            id="pg"
            type="number"
            step={0.5}
            value={propGrowth}
            onChange={(e) => setPropGrowth(Number(e.target.value) || 0)}
            className="h-10"
          />
        </Field>
        <Field id="fx" label="FX scénář % p.a." tip="Roční měnový efekt na exit cenu v domácí měně">
          <Input
            id="fx"
            type="number"
            step={0.5}
            value={fxReturn}
            onChange={(e) => setFxReturn(Number(e.target.value) || 0)}
            className="h-10"
          />
        </Field>
        <Field id="hold" label="Doba držení (roky)">
          <Input
            id="hold"
            type="number"
            value={holdingPeriod}
            onChange={(e) => setHoldingPeriod(Number(e.target.value) || 0)}
            className="h-10"
          />
        </Field>
      </div>

      {/* Primární výsledky */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          label="Měsíční peněžní tok"
          tip={INVESTMENT_METRIC_TOOLTIPS.monthlyCashFlow}
          value={money(result.monthlyCashFlow)}
          accent
        />
        <MetricCard
          label="Roční peněžní tok"
          tip={INVESTMENT_METRIC_TOOLTIPS.annualCashFlow}
          value={money(result.annualCashFlow)}
          accent
        />
        <MetricCard
          label="Hrubý výnos"
          tip={INVESTMENT_METRIC_TOOLTIPS.grossYield}
          value={pct(result.grossYield)}
          accent
        />
        <MetricCard
          label="Čistý výnos"
          tip={INVESTMENT_METRIC_TOOLTIPS.netYield}
          value={pct(result.netYield)}
        />
        <MetricCard
          label="Výnos vloženého vlastního kapitálu"
          tip={INVESTMENT_METRIC_TOOLTIPS.cashOnCashReturn}
          value={pct(result.cashOnCashReturn)}
        />
        <MetricCard
          label="Celkový výnos"
          tip={INVESTMENT_METRIC_TOOLTIPS.totalReturn}
          value={money(result.totalReturn)}
          accent
        />
      </div>

      {/* Waterfall */}
      <section className="rounded-2xl border border-border bg-white p-5">
        <h4 className="font-heading text-lg font-bold text-text-dark">
          Rozklad peněžního toku
        </h4>
        <p className="mt-1 text-xs text-muted-foreground">
          Hrubý nájem → neobsazenost → provoz → správa → daně → dluhová služba →
          čistý peněžní tok
        </p>
        <ul className="mt-4 divide-y divide-border">
          {result.waterfall.map((line) => (
            <li
              key={line.id + line.label}
              className="flex items-baseline justify-between gap-3 py-2.5 text-sm"
            >
              <span
                className={cn(
                  line.id === "net_cash_flow"
                    ? "font-semibold text-deep-teal"
                    : "text-text-dark"
                )}
              >
                {line.label}
              </span>
              <span className="tabular-nums font-medium">
                {line.id === "net_cash_flow" || line.id === "gross_rent"
                  ? money(line.runningTotal)
                  : money(line.amount)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <details className="rounded-xl border border-border bg-white p-4">
        <summary className="cursor-pointer font-semibold text-deep-teal">
          Pokročilé výsledky
        </summary>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            label="NOI"
            tip={INVESTMENT_METRIC_TOOLTIPS.noi}
            value={money(result.noi)}
          />
          <MetricCard
            label="ROE (rok 1)"
            tip={INVESTMENT_METRIC_TOOLTIPS.roe}
            value={pct(result.roeYear1)}
          />
          <MetricCard
            label="DSCR"
            tip={INVESTMENT_METRIC_TOOLTIPS.dscr}
            value={
              result.dscr == null
                ? "—"
                : `${result.dscr.toLocaleString("cs-CZ", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}×`
            }
          />
          <MetricCard
            label="Minimální potřebná obsazenost"
            tip={INVESTMENT_METRIC_TOOLTIPS.breakEvenOccupancy}
            value={pct(result.breakEvenOccupancy)}
          />
          <MetricCard
            label="IRR"
            tip={INVESTMENT_METRIC_TOOLTIPS.irr}
            value={pct(result.irr)}
          />
          <MetricCard
            label="XIRR"
            tip={INVESTMENT_METRIC_TOOLTIPS.xirr}
            value={pct(result.xirr)}
          />
          <MetricCard
            label="Nárůst vlastního kapitálu"
            tip={INVESTMENT_METRIC_TOOLTIPS.equityBuildUp}
            value={money(result.equityBuildUp)}
          />
          <MetricCard
            label="Zůstatek dluhu"
            tip={INVESTMENT_METRIC_TOOLTIPS.remainingDebt}
            value={money(result.remainingDebt)}
          />
          <MetricCard
            label="Výnos z prodeje"
            tip={INVESTMENT_METRIC_TOOLTIPS.exitProceeds}
            value={money(result.exitProceeds)}
          />
        </div>
      </details>

      <details className="rounded-xl border border-border bg-[#f7f8f7] p-4 text-sm">
        <summary className="cursor-pointer font-semibold text-deep-teal">
          {INVESTMENT_METHODOLOGY.title}
        </summary>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
          {INVESTMENT_METHODOLOGY.paragraphs.map((p) => (
            <li key={p}>{p}</li>
          ))}
          {result.methodologyNotes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </details>
    </div>
  );
}
