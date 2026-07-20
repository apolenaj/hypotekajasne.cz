"use client";

import { useMemo, useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
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
import { getPredictionConfig } from "@/lib/prediction-configs";
import {
  simulateFutureLab,
  type FutureScenarioId,
} from "@/lib/decision-lab";
import { cn } from "@/lib/utils";

const SCENARIOS: { id: FutureScenarioId; label: string }[] = [
  { id: "bear", label: "Bear" },
  { id: "base", label: "Base" },
  { id: "bull", label: "Bull" },
  { id: "custom", label: "Custom" },
];

type Props = { countryId: CountryId };

export function DecisionLabFuture({ countryId }: Props) {
  const config = countryConfigs[countryId];
  const pred = getPredictionConfig(countryId);
  const moderate = pred.scenarios.moderate;

  const [price, setPrice] = useState(config.defaultPrice);
  const [scenario, setScenario] = useState<FutureScenarioId>("base");
  const [propGrowth, setPropGrowth] = useState(moderate.propGrowth * 100);
  const [rentGrowth, setRentGrowth] = useState(moderate.rentGrowth * 100);
  const [inflation, setInflation] = useState(moderate.inflation * 100);
  const [yieldPct, setYieldPct] = useState(pred.yield * 100);
  const [reinvest, setReinvest] = useState(0);
  const [years, setYears] = useState(20);

  const result = useMemo(
    () =>
      simulateFutureLab({
        purchasePrice: price,
        scenario,
        base: {
          propGrowth: propGrowth / 100,
          rentGrowth: rentGrowth / 100,
          inflation: inflation / 100,
          startingYield: yieldPct / 100,
          reinvestmentReturn: reinvest / 100,
          years,
        },
        custom:
          scenario === "custom"
            ? {
                propGrowth: propGrowth / 100,
                rentGrowth: rentGrowth / 100,
                inflation: inflation / 100,
                startingYield: yieldPct / 100,
                reinvestmentReturn: reinvest / 100,
                years,
              }
            : undefined,
      }),
    [
      price,
      scenario,
      propGrowth,
      rentGrowth,
      inflation,
      yieldPct,
      reinvest,
      years,
    ]
  );

  const exportRows = [
    [
      "year",
      "property_nominal",
      "property_real",
      "rent_account_nominal",
      "total_nominal",
      "total_real",
    ],
    ...result.series.map((p) => [
      String(p.year),
      String(p.propertyNominal),
      String(p.propertyReal),
      String(p.rentAccountNominal),
      String(p.totalNominal),
      String(p.totalReal),
    ]),
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-deep-teal">
          Decision Lab · Future simulator
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Bear / Base / Bull / Custom. Assumptions jsou vždy viditelné.
          {result.reinvestmentEnabled
            ? " Nájem se reinvestuje zadanou sazbou."
            : " Nájem se nesúročuje — jen kumulativní součet."}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setScenario(s.id)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-semibold",
              scenario === s.id
                ? "bg-deep-teal text-white"
                : "bg-white ring-1 ring-border text-text-dark"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1">
          <Label className="text-xs">Kupní cena</Label>
          <Input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value) || 0)}
            className="h-10"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Růst ceny % (base/custom)</Label>
          <Input
            type="number"
            step={0.1}
            value={propGrowth}
            onChange={(e) => setPropGrowth(Number(e.target.value) || 0)}
            className="h-10"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Růst nájmu %</Label>
          <Input
            type="number"
            step={0.1}
            value={rentGrowth}
            onChange={(e) => setRentGrowth(Number(e.target.value) || 0)}
            className="h-10"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Inflace %</Label>
          <Input
            type="number"
            step={0.1}
            value={inflation}
            onChange={(e) => setInflation(Number(e.target.value) || 0)}
            className="h-10"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Počáteční hrubý výnos %</Label>
          <Input
            type="number"
            step={0.1}
            value={yieldPct}
            onChange={(e) => setYieldPct(Number(e.target.value) || 0)}
            className="h-10"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">
            Reinvestment return % (0 = bez úročení nájmu)
          </Label>
          <Input
            type="number"
            step={0.1}
            value={reinvest}
            onChange={(e) => setReinvest(Number(e.target.value) || 0)}
            className="h-10"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Horizont (roky)</Label>
          <Input
            type="number"
            value={years}
            onChange={(e) => setYears(Number(e.target.value) || 1)}
            className="h-10"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-[#f7f8f7] p-4 text-sm">
        <p className="font-semibold text-text-dark">Assumptions (aplikované)</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
          {result.assumptionsList.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </div>

      <DecisionLabChartFrame
        meta={result.chartMeta}
        assumptions={result.assumptionsList}
        exportRows={exportRows}
        exportFilename={`future-${countryId}-${scenario}.csv`}
      >
        <div className="h-[340px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={result.series}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis
                tick={{ fontSize: 11 }}
                width={90}
                tickFormatter={(v) =>
                  formatCurrency(Number(v), config.currency).replace(/\s/g, " ")
                }
              />
              <Tooltip
                formatter={(v) => formatCurrency(Number(v), config.currency)}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="rentAccountNominal"
                name={
                  result.reinvestmentEnabled
                    ? "Nájem (reinvestovaný)"
                    : "Nájem (kumulativní, bez úroku)"
                }
                fill="#c5a05933"
                stroke="#c5a059"
              />
              <Line
                type="monotone"
                dataKey="propertyNominal"
                name="Nemovitost nominální"
                stroke="#1b4d3e"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="propertyReal"
                name="Nemovitost reálná"
                stroke="#1b4d3e"
                strokeDasharray="4 4"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="totalReal"
                name="Celkem reálné"
                stroke="#64748b"
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </DecisionLabChartFrame>
    </div>
  );
}
