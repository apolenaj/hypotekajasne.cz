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
import Link from "next/link";
import { formatCurrency } from "@/lib/calculators";
import { simulateFutureLab } from "@/lib/decision-lab/future-lab";
import { RENT_VS_BUY_DEFAULTS } from "@/lib/decision-lab/rent-vs-buy-cashflow";
import {
  getHistoricalChartData,
  historicalProvenanceNote,
} from "@/lib/historical-data";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

type SeriesKey = "apt70m" | "villa";
type Horizon = "history" | 5 | 10 | 20;

const HORIZONS: { id: Horizon; label: string }[] = [
  { id: "history", label: "Historický vývoj" },
  { id: 5, label: "5 let" },
  { id: 10, label: "10 let" },
  { id: 20, label: "20 let" },
];

function formatPct(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  const text = Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toFixed(1).replace(".", ",");
  return `${text}\u00a0%`;
}

export function HomePriceChart() {
  const [series, setSeries] = useState<SeriesKey>("apt70m");
  const [horizon, setHorizon] = useState<Horizon>(10);
  const history = useMemo(() => getHistoricalChartData("cz"), []);
  const end = history[history.length - 1];
  const tenYearsAgo = history.find((point) => point.year === (end?.year ?? 0) - 10);

  const insight =
    end && tenYearsAgo && tenYearsAgo[series] > 0
      ? (end[series] / tenYearsAgo[series] - 1) * 100
      : null;

  const chart = useMemo(() => {
    if (!end) return [];
    const windowYears = horizon === "history" ? history.length : horizon;
    const fromYear =
      horizon === "history" ? history[0]!.year : end.year - windowYears;
    const historical = history.filter((point) => point.year >= fromYear);

    const rows: {
      year: number;
      historical: number | null;
      base: number | null;
      bull: number | null;
      bear: number | null;
    }[] = historical.map((point) => ({
      year: point.year,
      historical: point[series],
      base: point.year === end.year ? point[series] : null,
      bull: point.year === end.year ? point[series] : null,
      bear: point.year === end.year ? point[series] : null,
    }));

    if (horizon === "history") return rows;

    const baseGrowth = RENT_VS_BUY_DEFAULTS.annualPropertyGrowth;
    const start = end[series];
    const scenarios = (["bear", "base", "bull"] as const).map((id) =>
      simulateFutureLab({
        purchasePrice: start,
        scenario: id,
        base: {
          propGrowth: baseGrowth,
          rentGrowth: RENT_VS_BUY_DEFAULTS.annualRentGrowth,
          inflation: 0,
          startingYield: 0,
          reinvestmentReturn: 0,
          years: horizon,
        },
      })
    );

    for (let i = 0; i < horizon; i++) {
      rows.push({
        year: end.year + i + 1,
        historical: null,
        bear: Math.round(scenarios[0]!.series[i]!.propertyNominal),
        base: Math.round(scenarios[1]!.series[i]!.propertyNominal),
        bull: Math.round(scenarios[2]!.series[i]!.propertyNominal),
      });
    }
    return rows;
  }, [end, history, horizon, series]);

  return (
    <div className="rounded-[18px] border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["apt70m", "Byty"],
            ["villa", "Domy"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setSeries(id)}
            className={cn(
              "h-9 rounded-full px-3 text-sm font-semibold",
              series === id
                ? "bg-deep-teal text-white"
                : "bg-[#f4f6f5] text-gray-700"
            )}
          >
            {label}
          </button>
        ))}
        <span className="inline-flex h-9 items-center rounded-full bg-[#f4f6f5] px-3 text-sm text-gray-500">
          Pozemky v této řadě nejsou
        </span>
        <span className="inline-flex h-9 items-center rounded-full border border-gray-200 px-3 text-sm text-gray-700">
          Česká republika
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {HORIZONS.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => setHorizon(item.id)}
            className={cn(
              "h-9 rounded-lg px-3 text-sm font-medium",
              horizon === item.id
                ? "bg-[#143d32] text-white"
                : "text-gray-600 hover:bg-gray-50"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px]">
        <div className="h-72 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#e7ebe9" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 12, fill: "#66706b" }} />
              <YAxis
                tick={{ fontSize: 11, fill: "#66706b" }}
                width={64}
                tickFormatter={(value: number) =>
                  `${Math.round(value / 1_000_000)}\u00a0mil.`
                }
              />
              <Tooltip
                formatter={(value) =>
                  typeof value === "number" ? formatCurrency(value, "CZK") : "—"
                }
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="historical"
                name="Historická data"
                stroke="#1b4d3e"
                strokeWidth={2.4}
                dot={false}
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="base"
                name="Základní modelový scénář"
                stroke="#2a6b58"
                strokeDasharray="5 4"
                strokeWidth={1.6}
                dot={false}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="bull"
                name="Optimistický modelový scénář"
                stroke="#c5a059"
                strokeDasharray="2 4"
                strokeWidth={1.4}
                dot={false}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="bear"
                name="Pesimistický modelový scénář"
                stroke="#8a8172"
                strokeDasharray="2 4"
                strokeWidth={1.4}
                dot={false}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {insight != null ? (
          <aside className="rounded-xl border border-gray-200 bg-[#f7f6f3] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Vývoj za posledních 10 let
            </p>
            <p className="mt-2 font-heading text-3xl font-bold text-deep-teal">
              {insight > 0 ? "+" : ""}
              {formatPct(insight)}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-gray-600">
              Spočteno z modelové řady {series === "apt70m" ? "bytu" : "domu"},
              ne z oficiální statistiky.
            </p>
          </aside>
        ) : null}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-gray-500">
        {historicalProvenanceNote("cz")} Budoucí úsek je orientační modelový
        scénář (základ {formatPct(RENT_VS_BUY_DEFAULTS.annualPropertyGrowth * 100)}{" "}
        p.a. z modelu koupě vs. nájem, s posunem nahoru a dolů). Není to
        garantovaná predikce.
      </p>
      <Link
        href={routes.kalkulacky.historickyVyvoj}
        className="mt-4 inline-flex text-sm font-semibold text-deep-teal hover:underline"
      >
        Zobrazit detailní analýzu cen →
      </Link>
    </div>
  );
}
