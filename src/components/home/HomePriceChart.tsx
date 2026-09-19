"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
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
  HISTORICAL_END_YEAR,
  historicalDataCZ,
} from "@/lib/historical-data";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

type Asset = "byty" | "domy" | "pozemky" | "komercni";
type LandKind = "stavebni" | "zemedelske";
type CommercialKind = "kancelare" | "obchod" | "prumysl";
type Horizon = 5 | 10 | 20;

const ASSETS: { id: Asset; label: string }[] = [
  { id: "byty", label: "Byty" },
  { id: "domy", label: "Domy" },
  { id: "pozemky", label: "Pozemky" },
  { id: "komercni", label: "Komerční nemovitosti" },
];

const LAND: { id: LandKind; label: string }[] = [
  { id: "stavebni", label: "Stavební" },
  { id: "zemedelske", label: "Zemědělské" },
];

const COMMERCIAL: { id: CommercialKind; label: string }[] = [
  { id: "kancelare", label: "Kanceláře" },
  { id: "obchod", label: "Obchodní prostory" },
  { id: "prumysl", label: "Průmysl a sklady" },
];

const HORIZONS: Horizon[] = [5, 10, 20];

/**
 * Anchors are the platform's own 2026 model points, not a ČSÚ or transaction series.
 * They only start a forward model. They are not plotted as market history.
 */
const MODEL_ANCHOR = {
  byty: historicalDataCZ.find((point) => point.year === HISTORICAL_END_YEAR)!.apt70m,
  domy: historicalDataCZ.find((point) => point.year === HISTORICAL_END_YEAR)!.villa,
} as const;

function formatPct(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  const text = Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toFixed(1).replace(".", ",");
  return `${text}\u00a0%`;
}

export function HomePriceChart() {
  const [asset, setAsset] = useState<Asset>("byty");
  const [land, setLand] = useState<LandKind>("stavebni");
  const [commercial, setCommercial] = useState<CommercialKind>("kancelare");
  const [horizon, setHorizon] = useState<Horizon>(10);
  const hasModel = asset === "byty" || asset === "domy";
  const anchor = hasModel ? MODEL_ANCHOR[asset] : null;
  const baseGrowth = RENT_VS_BUY_DEFAULTS.annualPropertyGrowth;

  const chart = useMemo(() => {
    if (anchor == null) return [];
    const scenarios = (["bear", "base", "bull"] as const).map((id) =>
      simulateFutureLab({
        purchasePrice: anchor,
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
    const rows: {
      year: number;
      base: number | null;
      bull: number | null;
      bear: number | null;
    }[] = [
      {
        year: HISTORICAL_END_YEAR,
        base: anchor,
        bull: anchor,
        bear: anchor,
      },
    ];
    for (let i = 0; i < horizon; i++) {
      rows.push({
        year: HISTORICAL_END_YEAR + i + 1,
        bear: Math.round(scenarios[0]!.series[i]!.propertyNominal),
        base: Math.round(scenarios[1]!.series[i]!.propertyNominal),
        bull: Math.round(scenarios[2]!.series[i]!.propertyNominal),
      });
    }
    return rows;
  }, [anchor, baseGrowth, horizon]);

  const modelChange =
    anchor != null && chart.length > 1 && chart[chart.length - 1]!.base
      ? (chart[chart.length - 1]!.base! / anchor - 1) * 100
      : null;

  return (
    <div className="rounded-[18px] border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap gap-2">
        {ASSETS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setAsset(item.id)}
            className={cn(
              "h-9 rounded-full px-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal",
              asset === item.id
                ? "bg-deep-teal text-white"
                : "bg-[#f4f6f5] text-gray-700"
            )}
          >
            {item.label}
          </button>
        ))}
        <span className="inline-flex h-9 items-center rounded-full border border-gray-200 px-3 text-sm text-gray-700">
          Česká republika
        </span>
      </div>

      {asset === "pozemky" ? (
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Typ pozemku">
          {LAND.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setLand(item.id)}
              className={cn(
                "h-8 rounded-full px-3 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal",
                land === item.id
                  ? "bg-[#143d32] text-white"
                  : "bg-[#f7f6f3] text-gray-700"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}

      {asset === "komercni" ? (
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Typ komerční nemovitosti">
          {COMMERCIAL.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setCommercial(item.id)}
              className={cn(
                "h-8 rounded-full px-3 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal",
                commercial === item.id
                  ? "bg-[#143d32] text-white"
                  : "bg-[#f7f6f3] text-gray-700"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}

      {hasModel ? (
        <div className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Horizont modelového scénáře
          </p>
          <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Horizont modelového scénáře">
            {HORIZONS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setHorizon(item)}
                className={cn(
                  "h-9 rounded-lg px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal",
                  horizon === item
                    ? "bg-[#143d32] text-white"
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                {item} let
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_200px]">
        {hasModel ? (
          <div className="h-72 min-w-0 touch-pan-y">
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
                  formatter={(value, name) => [
                    typeof value === "number" ? formatCurrency(value, "CZK") : "—",
                    name,
                  ]}
                  labelFormatter={(label) =>
                    Number(label) === HISTORICAL_END_YEAR
                      ? `${label} · začátek modelu, ne historie trhu`
                      : `${label} · modelový scénář`
                  }
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <ReferenceLine
                  x={HISTORICAL_END_YEAR}
                  stroke="#1b4d3e"
                  strokeDasharray="2 3"
                  label={{ value: "model", fontSize: 11, fill: "#1b4d3e" }}
                />
                <Line
                  type="monotone"
                  dataKey="base"
                  name="Základní modelový scénář"
                  stroke="#2a6b58"
                  strokeDasharray="5 4"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="bull"
                  name="Příznivý modelový scénář"
                  stroke="#c5a059"
                  strokeDasharray="2 4"
                  strokeWidth={1.5}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="bear"
                  name="Nepříznivý modelový scénář"
                  stroke="#8a8172"
                  strokeDasharray="2 4"
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex min-h-56 items-center rounded-xl border border-dashed border-gray-300 bg-[#fafaf7] px-4 py-6">
            <div>
              <p className="font-heading text-xl font-bold text-text-dark">
                Historická data zatím nejsou dostupná
              </p>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-gray-600">
                {asset === "pozemky"
                  ? land === "stavebni"
                    ? "Stavební a zemědělské pozemky neslučujeme. Pro stavební pozemky nemáme ověřenou veřejnou řadu v Kč/m²."
                    : "Zemědělské pozemky jsou jiná veličina než stavební. Ověřenou řadu v této kategorii nemáme."
                  : commercial === "kancelare"
                    ? "Kanceláře nemají v tomto přehledu ověřenou řadu. Nezobrazujeme jednu univerzální cenu komerční nemovitosti."
                    : commercial === "obchod"
                      ? "Obchodní prostory nemají v tomto přehledu ověřenou řadu. Nezobrazujeme je jako byty ani kanceláře."
                      : "Průmyslové a skladové objekty nemají v tomto přehledu ověřenou řadu."}
              </p>
            </div>
          </div>
        )}

        <aside className="rounded-xl border border-gray-200 bg-[#f7f6f3] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {hasModel
              ? `Model za ${horizon} let`
              : "Ověřená historie"}
          </p>
          {hasModel && modelChange != null ? (
            <>
              <p className="mt-2 font-heading text-3xl font-bold text-deep-teal">
                {modelChange > 0 ? "+" : ""}
                {formatPct(modelChange)}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-gray-600">
                Základní scénář od modelové ceny{" "}
                {formatCurrency(anchor ?? 0, "CZK")} při{" "}
                {formatPct(baseGrowth * 100)} p.a. Není to výnos z ověřené historie.
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm font-semibold leading-relaxed text-text-dark">
              Historická data zatím nejsou dostupná
            </p>
          )}
        </aside>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-gray-500">
        Jednotka grafu je Kč za modelový objekt, ne Kč/m² z realizovaných prodejů.
        Zdroj výchozí ceny: interní modelové body platformy k roku {HISTORICAL_END_YEAR},
        ne časová řada ČSÚ. Období scénáře: {HISTORICAL_END_YEAR}–
        {HISTORICAL_END_YEAR + (hasModel ? horizon : 0)}. Datum modelu: není datum
        ověření trhu. Příznivý scénář přidává 2 p. b. k růstu ceny, nepříznivý
        ubírá 2 p. b. Historická data zatím nejsou dostupná — plná čára historie
        se proto nekreslí.
      </p>
      <Link
        href={routes.kalkulacky.historickyVyvoj}
        className="mt-4 inline-flex text-sm font-semibold text-deep-teal hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal"
      >
        Zobrazit detailní analýzu cen →
      </Link>
    </div>
  );
}
