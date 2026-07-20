"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { ComparePropertyMetrics } from "@/lib/property-compare/types";

const DIM_LABELS: Record<keyof ComparePropertyMetrics["radar"], string> = {
  cashFlow: "Cash flow",
  yield: "Výnos",
  appreciation: "Růst",
  liquidity: "Likvidita",
  location: "Lokalita",
  lowRisk: "Nízké riziko",
  affordability: "Fit profilu",
};

const COLORS = ["#0d4f4f", "#b8956a", "#2d6a6a", "#8b6914", "#4a7c7c"];

type ComparisonRadarChartProps = {
  properties: ComparePropertyMetrics[];
};

export function ComparisonRadarChart({ properties }: ComparisonRadarChartProps) {
  if (properties.length < 2) return null;

  const keys = Object.keys(DIM_LABELS) as (keyof ComparePropertyMetrics["radar"])[];
  const data = keys.map((key) => {
    const row: Record<string, string | number> = {
      dimension: DIM_LABELS[key],
    };
    for (const p of properties) {
      row[p.label] = p.radar[key];
    }
    return row;
  });

  return (
    <div className="rounded-2xl border border-dashed border-border bg-[#f7f8f7] p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
        Sekundární vizualizace — radar (normalizované 0–100)
      </p>
      <p className="mt-1 text-[11px] text-muted-foreground">
        Primární rozhodnutí stavte na číslech v tabulce. Radar slouží jen jako rychlý přehled tvaru profilu.
      </p>
      <div className="mt-4 h-[320px] w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="78%">
            <PolarGrid stroke="#d1d5db" />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fill: "#4b5563", fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                fontSize: 12,
              }}
            />
            {properties.map((p, i) => (
              <Radar
                key={p.id}
                name={p.label}
                dataKey={p.label}
                stroke={COLORS[i % COLORS.length]}
                fill={COLORS[i % COLORS.length]}
                fillOpacity={0.12}
                strokeWidth={2}
              />
            ))}
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-3 flex flex-wrap gap-3 text-xs">
        {properties.map((p, i) => (
          <li key={p.id} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            {p.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
