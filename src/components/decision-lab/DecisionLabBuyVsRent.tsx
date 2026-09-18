"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DecisionLabChartFrame } from "@/components/decision-lab/DecisionLabChartFrame";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  countryConfigs,
  formatCurrency,
  type CountryId,
} from "@/lib/calculators";
import { simulateBuyVsRent } from "@/lib/decision-lab";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

type Props = { countryId: CountryId };

type ScenarioId = "custom" | "conservative" | "optimistic";

function Field({
  id,
  label,
  value,
  onChange,
  step = 1,
  hint,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (n: number) => void;
  step?: number;
  hint?: string;
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-xs text-text-dark">
        {label}
      </Label>
      <Input
        id={id}
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="h-10"
      />
      {hint ? (
        <p className="text-[11px] leading-snug text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function Metric({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div>
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-0.5 tabular-nums",
          emphasize
            ? "font-heading text-xl font-bold text-deep-teal sm:text-2xl"
            : "text-base font-semibold text-text-dark"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function Details({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      open={defaultOpen}
      className="rounded-2xl border border-border bg-white open:shadow-sm"
    >
      <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-deep-teal marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="flex items-center justify-between gap-2">
          {title}
          <span className="text-xs font-medium text-muted-foreground">
            rozbalit
          </span>
        </span>
      </summary>
      <div className="border-t border-border px-4 py-4">{children}</div>
    </details>
  );
}

export function DecisionLabBuyVsRent({ countryId }: Props) {
  const config = countryConfigs[countryId];
  const money = (n: number) => formatCurrency(n, config.currency);

  const [scenario, setScenario] = useState<ScenarioId>("custom");
  const [price, setPrice] = useState(config.defaultPrice);
  const [down, setDown] = useState(config.defaultSavings);
  const [rent, setRent] = useState(
    Math.round((config.defaultPrice * config.defaultRentalYield) / 12)
  );
  const [rate, setRate] = useState(4.5);
  const [term, setTerm] = useState(config.defaultTerm);
  const [horizon, setHorizon] = useState(15);
  const [maintenance, setMaintenance] = useState(1.5);
  const [tx, setTx] = useState(4.5);
  const [propGrowth, setPropGrowth] = useState(2);
  const [rentGrowth, setRentGrowth] = useState(2);
  const [altReturn, setAltReturn] = useState(4);

  const loan = Math.max(0, price - Math.min(down, price));
  const ltv = price > 0 ? (loan / price) * 100 : 0;

  const applyScenario = (id: ScenarioId) => {
    setScenario(id);
    if (id === "conservative") {
      setPropGrowth(1);
      setRentGrowth(3);
      setAltReturn(5);
      setRate(5.5);
    } else if (id === "optimistic") {
      setPropGrowth(3.5);
      setRentGrowth(1.5);
      setAltReturn(3);
      setRate(3.9);
    }
  };

  const result = useMemo(
    () =>
      simulateBuyVsRent({
        purchasePrice: price,
        monthlyRent: rent,
        mortgageRate: rate > 0 ? rate : 0,
        downPayment: down,
        maintenanceRate: maintenance / 100,
        transactionCostRate: tx / 100,
        annualPropertyGrowth: propGrowth / 100,
        annualRentGrowth: rentGrowth / 100,
        alternativeEquityReturn: altReturn / 100,
        horizonYears: horizon,
        termYears: term,
      }),
    [
      price,
      rent,
      rate,
      down,
      maintenance,
      tx,
      propGrowth,
      rentGrowth,
      altReturn,
      horizon,
      term,
    ]
  );

  const last = result.series[result.series.length - 1];
  const winnerLabel =
    result.finalLeader === "buy"
      ? "koupě (vlastní bydlení)"
      : result.finalLeader === "rent"
        ? "bydlení v nájmu"
        : "obě varianty stejně";

  const exportRows = [
    [
      "rok",
      "najem_mesic",
      "splatka_hypoteky_rok",
      "zbyvajici_hypoteka",
      "hodnota_nemovitosti",
      "equity",
      "kumulativni_najem",
      "portfolio_najemnik",
      "nevracne_naklady_koupe",
      "penezni_odtok_koupe",
    ],
    ...result.series.map((p) => [
      String(p.year),
      String(p.monthlyRentInYear),
      String(p.interestPaidThisYear + p.principalPaidThisYear),
      String(p.debtRemaining),
      String(p.propertyValue),
      String(p.buyNetWorth),
      String(p.rentCumulativeCashOut),
      String(p.rentNetWorth),
      String(p.buyCumulativeEconomicCost),
      String(p.buyCumulativeCashOut),
    ]),
  ];

  return (
    <div className="space-y-8">
      {/* Hero copy */}
      <header className="space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
          Kalkulačka vlastního bydlení
        </p>
        <h2 className="font-heading text-2xl font-bold text-text-dark sm:text-3xl">
          Koupě vs. nájem
        </h2>
        <p className="max-w-3xl text-base font-medium leading-relaxed text-text-dark sm:text-lg">
          Co se vám finančně vyplatí více — koupit vlastní bydlení, nebo platit
          nájem?
        </p>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Porovnáváme dvě situace: koupíte si nemovitost pro vlastní bydlení,
          nebo budete bydlet v nájmu a vlastní prostředky případně investujete.
          Nájem zde není příjmem z investiční nemovitosti.
        </p>
      </header>

      {/* Scenario cards */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-deep-teal/25 bg-deep-teal/5 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-deep-teal">
            Varianta A — koupím
          </p>
          <p className="mt-1 font-semibold text-text-dark">
            Bydlím ve vlastní nemovitosti
          </p>
          <ul className="mt-2 space-y-1 text-xs leading-relaxed text-muted-foreground sm:text-[13px]">
            <li>· zaplatím vlastní prostředky a čerpám hypotéku</li>
            <li>· každý měsíc splácím hypotéku a platím údržbu</li>
            <li>· postupně splácím jistinu a vytvářím vlastní kapitál</li>
            <li>· hodnota nemovitosti se může měnit</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-muted-gold/40 bg-[#fbf8f1] p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#8a6d2f]">
            Varianta B — bydlím v nájmu
          </p>
          <p className="mt-1 font-semibold text-text-dark">
            Nemovitost nevlastním
          </p>
          <ul className="mt-2 space-y-1 text-xs leading-relaxed text-muted-foreground sm:text-[13px]">
            <li>· každý měsíc platím nájem majiteli</li>
            <li>· nájemné může časem růst</li>
            <li>· nemám vlastní kapitál v nemovitosti</li>
            <li>
              · prostředky na koupi i rozdíl nákladů mohu alternativně investovat
            </li>
          </ul>
        </div>
      </div>

      {/* Inputs */}
      <div className="rounded-2xl border border-border bg-white p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap gap-2">
          {(
            [
              ["custom", "Vlastní předpoklady"],
              ["conservative", "Konzervativní"],
              ["optimistic", "Optimističtější růst"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => applyScenario(id)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                scenario === id
                  ? "bg-deep-teal text-white"
                  : "bg-[#f4f7f6] text-muted-foreground hover:bg-deep-teal/10"
              )}
            >
              {label}
            </button>
          ))}
        </div>
        {scenario !== "custom" ? (
          <p className="mb-4 text-xs text-muted-foreground">
            Modelový scénář — všechny hodnoty můžete kdykoli upravit.
          </p>
        ) : null}

        <div className="space-y-6">
          <section>
            <h3 className="mb-3 text-sm font-bold text-text-dark">
              A. Nemovitost
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Field
                id="bvr-price"
                label="Kupní cena"
                value={price}
                onChange={(n) => {
                  setScenario("custom");
                  setPrice(n);
                }}
              />
              <Field
                id="bvr-down"
                label="Vlastní prostředky"
                value={down}
                onChange={(n) => {
                  setScenario("custom");
                  setDown(n);
                }}
              />
              <div className="rounded-xl border border-border bg-[#f7f9f8] px-3 py-2">
                <p className="text-[11px] text-muted-foreground">Hypotéka</p>
                <p className="font-semibold tabular-nums text-text-dark">
                  {money(loan)}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-[#f7f9f8] px-3 py-2">
                <p className="text-[11px] text-muted-foreground">LTV</p>
                <p className="font-semibold tabular-nums text-text-dark">
                  {ltv.toLocaleString("cs-CZ", { maximumFractionDigits: 1 })} %
                </p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-bold text-text-dark">
              B. Hypotéka
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Field
                id="bvr-rate"
                label="Úroková sazba % p.a."
                value={rate}
                step={0.1}
                onChange={(n) => {
                  setScenario("custom");
                  setRate(n);
                }}
              />
              <Field
                id="bvr-term"
                label="Doba splatnosti (roky)"
                value={term}
                onChange={(n) => {
                  setScenario("custom");
                  setTerm(n);
                }}
              />
              <div className="rounded-xl border border-deep-teal/30 bg-deep-teal/5 px-3 py-2 sm:col-span-2 lg:col-span-1">
                <p className="text-[11px] font-medium text-deep-teal">
                  Měsíční splátka hypotéky
                </p>
                <p className="font-heading text-xl font-bold tabular-nums text-deep-teal">
                  {money(result.today.monthlyMortgage)}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Část splátky je jistina a buduje vlastní kapitál.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="mb-1 text-sm font-bold text-text-dark">
              C. Alternativa — bydlení v nájmu
            </h3>
            <p className="mb-3 text-xs text-muted-foreground">
              Kolik by stálo měsíční nájemné srovnatelné nemovitosti, pokud byste
              ji nekoupili.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                id="bvr-rent"
                label="Měsíční nájem, který bych platil"
                value={rent}
                hint="Nejde o příjem z investiční nemovitosti."
                onChange={(n) => {
                  setScenario("custom");
                  setRent(n);
                }}
              />
              <Field
                id="bvr-rg"
                label="Očekávaný roční růst nájemného %"
                value={rentGrowth}
                step={0.1}
                onChange={(n) => {
                  setScenario("custom");
                  setRentGrowth(n);
                }}
              />
            </div>
          </section>

          <Details title="Pokročilé předpoklady">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Field
                id="bvr-h"
                label="Horizont porovnání (roky)"
                value={horizon}
                onChange={(n) => {
                  setScenario("custom");
                  setHorizon(n);
                }}
              />
              <Field
                id="bvr-pg"
                label="Roční růst hodnoty nemovitosti %"
                value={propGrowth}
                step={0.1}
                onChange={(n) => {
                  setScenario("custom");
                  setPropGrowth(n);
                }}
              />
              <Field
                id="bvr-maint"
                label="Údržba a opravy % z ceny / rok"
                value={maintenance}
                step={0.1}
                onChange={(n) => {
                  setScenario("custom");
                  setMaintenance(n);
                }}
              />
              <Field
                id="bvr-tx"
                label="Transakční náklady %"
                value={tx}
                step={0.1}
                onChange={(n) => {
                  setScenario("custom");
                  setTx(n);
                }}
              />
              <Field
                id="bvr-alt"
                label="Alternativní výnos kapitálu %"
                value={altReturn}
                step={0.1}
                onChange={(n) => {
                  setScenario("custom");
                  setAltReturn(n);
                }}
              />
            </div>
          </Details>
        </div>
      </div>

      {/* Summary */}
      {last ? (
        <section className="space-y-4 rounded-2xl border border-deep-teal/20 bg-gradient-to-br from-[#f4f7f6] to-white p-4 sm:p-6">
          <h3 className="font-heading text-2xl font-bold text-text-dark sm:text-3xl">
            Za {horizon} {horizon === 1 ? "rok" : horizon < 5 ? "roky" : "let"}
          </h3>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-deep-teal/20 bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-deep-teal">
                Koupě
              </p>
              <div className="mt-3 space-y-3">
                <Metric
                  label="Odhadovaná hodnota nemovitosti"
                  value={money(last.propertyValue)}
                />
                <Metric
                  label="Zbývající hypotéka"
                  value={money(last.debtRemaining)}
                />
                <Metric
                  label="Vlastní kapitál v nemovitosti"
                  value={money(last.buyNetWorth)}
                  emphasize
                />
              </div>
            </div>
            <div className="rounded-2xl border border-muted-gold/40 bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-[#8a6d2f]">
                Nájem
              </p>
              <div className="mt-3 space-y-3">
                <Metric
                  label="Celkem zaplacené nájemné"
                  value={money(last.rentCumulativeCashOut)}
                />
                <Metric
                  label="Hodnota investovaného kapitálu"
                  value={money(last.rentNetWorth)}
                  emphasize
                />
                <Metric label="Vlastněná nemovitost" value={money(0)} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Rozdíl čistého majetku po {horizon}{" "}
              {horizon === 1 ? "roku" : "letech"}
            </p>
            <p className="mt-1 font-heading text-xl font-bold text-text-dark sm:text-2xl">
              {result.finalLeader === "tie"
                ? "Přibližně shodné"
                : `${result.finalGap > 0 ? "+" : "−"}${money(Math.abs(result.finalGap))} ve prospěch varianty ${winnerLabel}`}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-text-dark">
              {result.verdictSentence}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Výsledek se může výrazně změnit podle ceny nemovitosti, úrokové
              sazby, vývoje nájemného, ceny nemovitostí a alternativního výnosu
              kapitálu.
            </p>
          </div>
        </section>
      ) : null}

      {/* Monthly burden */}
      <section className="rounded-2xl border border-border bg-white p-4 sm:p-5">
        <h3 className="font-heading text-xl font-bold text-text-dark">
          Co budu platit dnes?
        </h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 rounded-xl bg-[#f7f9f8] p-3">
            <p className="text-xs font-bold uppercase text-deep-teal">Koupě</p>
            <div className="flex justify-between text-sm">
              <span>Splátka hypotéky</span>
              <span className="font-semibold tabular-nums">
                {money(result.today.monthlyMortgage)} / měsíc
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Odhad údržby</span>
              <span className="font-semibold tabular-nums">
                {money(result.today.monthlyMaintenance)} / měsíc
              </span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-sm font-bold">
              <span>Celkové pravidelné zatížení</span>
              <span className="tabular-nums">
                {money(result.today.monthlyBuyTotal)} / měsíc
              </span>
            </div>
          </div>
          <div className="space-y-2 rounded-xl bg-[#fbf8f1] p-3">
            <p className="text-xs font-bold uppercase text-[#8a6d2f]">Nájem</p>
            <div className="flex justify-between text-sm">
              <span>Nájemné</span>
              <span className="font-semibold tabular-nums">
                {money(result.today.monthlyRent)} / měsíc
              </span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-sm font-bold">
              <span>Rozdíl oproti koupi</span>
              <span className="tabular-nums">
                {result.today.monthlyDifference >= 0 ? "+" : "−"}
                {money(Math.abs(result.today.monthlyDifference))} / měsíc
              </span>
            </div>
          </div>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Část hypoteční splátky je jistina a buduje vlastní kapitál — proto se
          liší „kolik pošlete z účtu“ a „kolik skutečně ekonomicky spotřebujete“.
        </p>
      </section>

      {/* Chart 1 — economic housing costs */}
      <DecisionLabChartFrame
        meta={result.costChartMeta}
        assumptions={result.assumptions}
        exportRows={exportRows}
        exportFilename={`koupe-vs-najem-naklady-${countryId}.csv`}
      >
        <p className="mb-1 px-1 text-sm font-medium text-muted-foreground">
          Kumulativní náklady na bydlení v čase
        </p>
        <div className="h-[300px] w-full min-h-0 sm:h-[340px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <LineChart data={result.series}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis
                tick={{ fontSize: 11 }}
                width={88}
                tickFormatter={(v) =>
                  formatCurrency(Number(v), config.currency).replace(/\s/g, " ")
                }
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const row = result.series.find((s) => s.label === label);
                  if (!row) return null;
                  return (
                    <div className="rounded-lg border border-border bg-white px-3 py-2 text-xs shadow-md">
                      <p className="font-semibold">{label}</p>
                      <p className="mt-1 text-deep-teal">
                        Koupě — nevratné: {money(row.buyCumulativeEconomicCost)}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        úroky {money(row.cumulativeInterest)} · údržba{" "}
                        {money(row.cumulativeMaintenance)} · tx v nákladech
                      </p>
                      <p className="mt-1 text-[#8a6d2f]">
                        Nájem — zaplaceno: {money(row.rentCumulativeCashOut)}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        nájem v roce: {money(row.rentPaidThisYear)}
                      </p>
                    </div>
                  );
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="buyCumulativeEconomicCost"
                name="Koupě — nevratné náklady"
                stroke="#1b4d3e"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="rentCumulativeCashOut"
                name="Nájem — zaplacené nájemné"
                stroke="#c5a059"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 px-1 text-xs text-muted-foreground">
          Splácená jistina hypotéky není považována za ztracený náklad — zvyšuje
          váš vlastní kapitál v nemovitosti.
        </p>
        <p className="mt-2 px-1 text-sm text-text-dark">
          {result.costBreakEvenSentence}
        </p>
      </DecisionLabChartFrame>

      {/* Chart 2 — net worth */}
      <DecisionLabChartFrame
        meta={result.chartMeta}
        assumptions={result.assumptions}
        exportRows={exportRows}
        exportFilename={`koupe-vs-najem-majetek-${countryId}.csv`}
      >
        <p className="mb-1 px-1 text-sm font-medium text-muted-foreground">
          Vývoj čistého majetku u obou variant
        </p>
        <div className="h-[300px] w-full min-h-0 sm:h-[340px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <LineChart data={result.series}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis
                tick={{ fontSize: 11 }}
                width={88}
                tickFormatter={(v) =>
                  formatCurrency(Number(v), config.currency).replace(/\s/g, " ")
                }
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const row = result.series.find((s) => s.label === label);
                  if (!row) return null;
                  const gap = row.buyNetWorth - row.rentNetWorth;
                  return (
                    <div className="max-w-[260px] rounded-lg border border-border bg-white px-3 py-2 text-xs shadow-md">
                      <p className="font-semibold">{label}</p>
                      <p className="mt-2 font-medium text-deep-teal">Koupě</p>
                      <p>Hodnota: {money(row.propertyValue)}</p>
                      <p>Zbývající hypotéka: {money(row.debtRemaining)}</p>
                      <p className="font-semibold">
                        Vlastní kapitál: {money(row.buyNetWorth)}
                      </p>
                      <p className="mt-2 font-medium text-[#8a6d2f]">Nájem</p>
                      <p>Investiční portfolio: {money(row.rentNetWorth)}</p>
                      <p>Nemovitost: {money(0)}</p>
                      <p className="mt-2 font-semibold">
                        Rozdíl: {gap >= 0 ? "+" : "−"}
                        {money(Math.abs(gap))}
                      </p>
                    </div>
                  );
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="buyNetWorth"
                name="Vlastní bydlení — čistý kapitál"
                stroke="#1b4d3e"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="rentNetWorth"
                name="Nájem + investování"
                stroke="#c5a059"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 px-1 text-sm text-text-dark">
          {result.netWorthBreakEvenSentence}
        </p>
      </DecisionLabChartFrame>

      {/* Breakdown */}
      <Details title="Kam moje peníze skutečně jdou?">
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h4 className="font-semibold text-deep-teal">
              U koupě po {horizon} letech
            </h4>
            <ul className="mt-2 space-y-1.5 text-sm text-text-dark">
              <li className="flex justify-between gap-3">
                <span>Vlastní prostředky na začátku</span>
                <span className="tabular-nums font-medium">
                  {money(result.breakdown.initialDownPayment)}
                </span>
              </li>
              <li className="flex justify-between gap-3">
                <span>Celkem splátky hypotéky</span>
                <span className="tabular-nums font-medium">
                  {money(result.breakdown.totalMortgagePayments)}
                </span>
              </li>
              <li className="flex justify-between gap-3 pl-3 text-muted-foreground">
                <span>z toho úroky</span>
                <span className="tabular-nums">
                  {money(result.breakdown.totalInterest)}
                </span>
              </li>
              <li className="flex justify-between gap-3 pl-3 text-muted-foreground">
                <span>z toho splacená jistina</span>
                <span className="tabular-nums">
                  {money(result.breakdown.totalPrincipalPaid)}
                </span>
              </li>
              <li className="flex justify-between gap-3">
                <span>Údržba a opravy</span>
                <span className="tabular-nums font-medium">
                  {money(result.breakdown.totalMaintenance)}
                </span>
              </li>
              <li className="flex justify-between gap-3">
                <span>Transakční náklady</span>
                <span className="tabular-nums font-medium">
                  {money(result.breakdown.transactionCosts)}
                </span>
              </li>
              <li className="flex justify-between gap-3">
                <span>Zbývající hypotéka</span>
                <span className="tabular-nums font-medium">
                  {money(result.breakdown.debtRemaining)}
                </span>
              </li>
              <li className="flex justify-between gap-3">
                <span>Hodnota nemovitosti</span>
                <span className="tabular-nums font-medium">
                  {money(result.breakdown.propertyValue)}
                </span>
              </li>
              <li className="flex justify-between gap-3 border-t border-border pt-2 font-bold">
                <span>Výsledný vlastní kapitál</span>
                <span className="tabular-nums">
                  {money(result.breakdown.buyEquity)}
                </span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-[#8a6d2f]">
              U nájmu po {horizon} letech
            </h4>
            <ul className="mt-2 space-y-1.5 text-sm text-text-dark">
              <li className="flex justify-between gap-3">
                <span>Zaplacené nájemné</span>
                <span className="tabular-nums font-medium">
                  {money(result.breakdown.totalRentPaid)}
                </span>
              </li>
              <li className="flex justify-between gap-3">
                <span>Průměrný měsíční nájem</span>
                <span className="tabular-nums font-medium">
                  {money(result.breakdown.averageMonthlyRent)}
                </span>
              </li>
              <li className="flex justify-between gap-3">
                <span>Nájem na konci horizontu / měs.</span>
                <span className="tabular-nums font-medium">
                  {money(result.breakdown.rentAtHorizonMonthly)}
                </span>
              </li>
              <li className="flex justify-between gap-3">
                <span>Počáteční investovaný kapitál</span>
                <span className="tabular-nums font-medium">
                  {money(result.breakdown.initialInvestedCapital)}
                </span>
              </li>
              <li className="flex justify-between gap-3">
                <span>Investiční výnos (model)</span>
                <span className="tabular-nums font-medium">
                  {money(result.breakdown.portfolioGain)}
                </span>
              </li>
              <li className="flex justify-between gap-3 border-t border-border pt-2 font-bold">
                <span>Konečná hodnota portfolia</span>
                <span className="tabular-nums">
                  {money(result.breakdown.portfolioValue)}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </Details>

      {/* Year table */}
      <Details title="Zobrazit vývoj po jednotlivých letech">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="py-2 pr-2">Rok</th>
                <th className="py-2 pr-2">Nájem / měs.</th>
                <th className="py-2 pr-2">Splátky hyp. / rok</th>
                <th className="py-2 pr-2">Zbývající hyp.</th>
                <th className="py-2 pr-2">Hodnota</th>
                <th className="py-2 pr-2">Equity</th>
                <th className="py-2 pr-2">Kumul. nájem</th>
                <th className="py-2">Portfolio</th>
              </tr>
            </thead>
            <tbody>
              {result.series.map((p) => (
                <tr key={p.year} className="border-b border-border/70">
                  <td className="py-1.5 pr-2 font-medium">{p.year}</td>
                  <td className="py-1.5 pr-2 tabular-nums">
                    {money(p.monthlyRentInYear)}
                  </td>
                  <td className="py-1.5 pr-2 tabular-nums">
                    {money(p.interestPaidThisYear + p.principalPaidThisYear)}
                  </td>
                  <td className="py-1.5 pr-2 tabular-nums">
                    {money(p.debtRemaining)}
                  </td>
                  <td className="py-1.5 pr-2 tabular-nums">
                    {money(p.propertyValue)}
                  </td>
                  <td className="py-1.5 pr-2 tabular-nums font-medium">
                    {money(p.buyNetWorth)}
                  </td>
                  <td className="py-1.5 pr-2 tabular-nums">
                    {money(p.rentCumulativeCashOut)}
                  </td>
                  <td className="py-1.5 tabular-nums font-medium">
                    {money(p.rentNetWorth)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Details>

      {/* Sensitivity */}
      <Details title="Co může výsledek změnit?">
        <p className="mb-3 text-xs text-muted-foreground">
          Změna rozdílu čistého majetku (koupě − nájem) na konci horizontu oproti
          aktuálním předpokladům. Pořadí závisí na velikosti testovaných změn.
        </p>
        <ul className="space-y-2">
          {result.sensitivity.map((s) => (
            <li
              key={s.id}
              className="flex flex-wrap items-baseline justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm"
            >
              <span>{s.label}</span>
              <span
                className={cn(
                  "font-semibold tabular-nums",
                  s.deltaNetWorthGap >= 0 ? "text-deep-teal" : "text-red-700"
                )}
              >
                {s.deltaNetWorthGap >= 0 ? "+" : "−"}
                {money(Math.abs(s.deltaNetWorthGap))}
              </span>
            </li>
          ))}
        </ul>
      </Details>

      {/* Methodology */}
      <Details title="Jak kalkulačka počítá?">
        <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            <strong className="text-text-dark">Koupě — čisté jmění:</strong>{" "}
            modelová hodnota nemovitosti − nesplacená hypotéka.
          </p>
          <p>
            <strong className="text-text-dark">Nájem — čisté jmění:</strong>{" "}
            alternativně investovaný kapitál (vlastní prostředky + transakční
            náklady, které by šly do koupě) + investované rozdíly cash-flow.
          </p>
          <p>
            <strong className="text-text-dark">Náklady koupě:</strong> nezahrnují
            jistinu jako nenávratný náklad. Zahrnují úroky, údržbu a transakční
            náklady.
          </p>
          <p>
            <strong className="text-text-dark">Náklady nájmu:</strong> skutečně
            zaplacené nájemné majiteli.
          </p>
          <p>
            Budoucí hodnoty jsou modelové a nejsou garancí budoucího vývoje. Jde
            o orientační scénář pro podporu rozhodování, nikoli o individuální
            investiční doporučení.
          </p>
        </div>
      </Details>

      {/* CTA */}
      <section className="rounded-2xl border border-deep-teal/20 bg-deep-teal/5 p-5 text-center sm:text-left">
        <h3 className="font-heading text-xl font-bold text-text-dark">
          Vychází vám koupě zajímavě?
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Spočítejte orientační splátku nebo si nechte projít možnosti
          financování.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Link
            href={routes.kalkulacky.hypotecniKalkulacka}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-deep-teal px-5 text-sm font-semibold text-white transition-colors hover:bg-deep-teal/90"
          >
            Spočítat konkrétní hypotéku
          </Link>
          <Link
            href={routes.mojeMoznosti}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-deep-teal/30 bg-white px-5 text-sm font-semibold text-deep-teal transition-colors hover:bg-deep-teal/5"
          >
            Probrat možnosti financování
          </Link>
        </div>
      </section>
    </div>
  );
}
