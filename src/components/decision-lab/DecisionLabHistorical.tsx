"use client";

import { useMemo, useState } from "react";
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
import {
  getDefaultTimeMachineCash,
  getPurchasableYears,
} from "@/lib/historical-data";
import {
  HISTORICAL_ASSET_LABELS,
  simulateHistoricalLab,
  type HistoricalAssetId,
} from "@/lib/decision-lab";
import { cn } from "@/lib/utils";

const ALL_ASSETS: HistoricalAssetId[] = [
  "cash",
  "savings",
  "term_deposit",
  "equity_benchmark",
  "property_cash",
  "property_leveraged",
];

const COLORS: Record<HistoricalAssetId, string> = {
  cash: "#94a3b8",
  savings: "#0ea5e9",
  term_deposit: "#6366f1",
  equity_benchmark: "#c5a059",
  property_cash: "#1b4d3e",
  property_leveraged: "#166534",
};

type Props = { countryId: CountryId };

export function DecisionLabHistorical({ countryId }: Props) {
  const config = countryConfigs[countryId];
  const years = getPurchasableYears(countryId);
  const [startYear, setStartYear] = useState(years[0] ?? 2006);
  const [cash, setCash] = useState(getDefaultTimeMachineCash(countryId));
  const [ltv, setLtv] = useState(70);
  const [mode, setMode] = useState<"nominal" | "real">("nominal");
  const [enabled, setEnabled] = useState<HistoricalAssetId[]>([
    "cash",
    "savings",
    "equity_benchmark",
    "property_cash",
    "property_leveraged",
  ]);

  const result = useMemo(
    () =>
      simulateHistoricalLab({
        countryId,
        startYear,
        initialCash: cash,
        leverageLtv: ltv / 100,
        enabledAssets: enabled,
      }),
    [countryId, startYear, cash, ltv, enabled]
  );

  const chartData = useMemo(() => {
    if (!result) return [];
    return result.series.map((p) => {
      const row: Record<string, number | string> = { year: p.year };
      const src = mode === "nominal" ? p.nominal : p.real;
      for (const id of enabled) {
        row[id] = src[id] ?? 0;
      }
      return row;
    });
  }, [result, mode, enabled]);

  const exportRows = result
    ? [
        ["year", "mode", ...enabled],
        ...result.series.map((p) => {
          const src = mode === "nominal" ? p.nominal : p.real;
          return [
            String(p.year),
            mode,
            ...enabled.map((id) => String(src[id] ?? "")),
          ];
        }),
      ]
    : [];

  const toggle = (id: HistoricalAssetId) => {
    setEnabled((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-deep-teal">
          Decision Lab · Historický stroj času
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Volitelná aktiva, jasné oddělení nominálních a reálných (CPI) výsledků.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1">
          <Label className="text-xs">Start rok</Label>
          <select
            className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm"
            value={startYear}
            onChange={(e) => setStartYear(Number(e.target.value))}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Počáteční kapitál</Label>
          <Input
            type="number"
            value={cash}
            onChange={(e) => setCash(Number(e.target.value) || 0)}
            className="h-10"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">LTV páky %</Label>
          <Input
            type="number"
            value={ltv}
            onChange={(e) => setLtv(Number(e.target.value) || 0)}
            className="h-10"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {ALL_ASSETS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => toggle(id)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold ring-1",
              enabled.includes(id)
                ? "bg-deep-teal text-white ring-deep-teal"
                : "bg-white text-muted-foreground ring-border"
            )}
          >
            {HISTORICAL_ASSET_LABELS[id]}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        {(["nominal", "real"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-semibold",
              mode === m
                ? "bg-deep-teal text-white"
                : "bg-white ring-1 ring-border text-text-dark"
            )}
          >
            {m === "nominal" ? "Nominální" : "Reálné (CPI)"}
          </button>
        ))}
      </div>

      {result && (
        <DecisionLabChartFrame
          meta={result.chartMeta}
          assumptions={result.assumptions}
          exportRows={exportRows}
          exportFilename={`historical-${countryId}-${mode}.csv`}
        >
          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
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
                {enabled.map((id) => (
                  <Line
                    key={id}
                    type="monotone"
                    dataKey={id}
                    name={HISTORICAL_ASSET_LABELS[id]}
                    stroke={COLORS[id]}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </DecisionLabChartFrame>
      )}
    </div>
  );
}
