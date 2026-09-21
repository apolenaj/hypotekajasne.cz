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
import {
  CZ_MARKET_BLOCKED,
  listSeries,
  seriesChange,
  type MarketSeries,
} from "@/lib/market-prices/cz-market-series";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

type Asset = "byty" | "domy" | "pozemky" | "komercni";
type LandKind = "stavebni" | "zemedelske" | "orna" | "ttp";
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
  { id: "zemedelske", label: "Zemědělské (průměr)" },
  { id: "orna", label: "Orná půda" },
  { id: "ttp", label: "TTP" },
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

function formatPp(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  const text = Number.isInteger(rounded)
    ? String(rounded)
    : String(rounded).replace(".", ",");
  return `${value > 0 ? "+" : ""}${text}\u00a0p.\u00a0b.`;
}

function formatSeriesValue(series: MarketSeries, value: number): string {
  if (series.unit === "czk_per_m2") {
    return `${value.toLocaleString("cs-CZ", {
      maximumFractionDigits: 1,
      minimumFractionDigits: value % 1 === 0 ? 0 : 1,
    })}\u00a0Kč/m²`;
  }
  if (series.unit === "eur_per_m2_month") {
    return `${value.toLocaleString("cs-CZ", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    })}\u00a0EUR/m²/měsíc`;
  }
  if (series.unit === "percent") {
    return `${value.toLocaleString("cs-CZ", {
      maximumFractionDigits: 2,
    })}\u00a0%`;
  }
  return String(value);
}

function yAxisFormatter(series: MarketSeries) {
  return (value: number) => {
    if (series.unit === "percent") {
      return `${value}\u00a0%`;
    }
    if (series.unit === "eur_per_m2_month") {
      return `€${value}`;
    }
    return `${value}`;
  };
}

function resolveMarketSeries(
  asset: Asset,
  land: LandKind,
  commercial: CommercialKind,
  metricId: string | null
): MarketSeries | null {
  if (asset === "pozemky") {
    const series = listSeries({ segment: "pozemky", subtype: land });
    return series[0] ?? null;
  }
  if (asset === "komercni") {
    const series = listSeries({ segment: "komercni", subtype: commercial });
    if (series.length === 0) return null;
    if (metricId) {
      return series.find((item) => item.id === metricId) ?? series[0]!;
    }
    return series[0]!;
  }
  return null;
}

function blockedFor(
  asset: Asset,
  land: LandKind,
  commercial: CommercialKind
) {
  if (asset === "pozemky") {
    return CZ_MARKET_BLOCKED.find(
      (item) => item.segment === "pozemky" && item.subtype === land
    );
  }
  if (asset === "komercni") {
    return CZ_MARKET_BLOCKED.find(
      (item) => item.segment === "komercni" && item.subtype === commercial
    );
  }
  return undefined;
}

export function HomePriceChart() {
  const [asset, setAsset] = useState<Asset>("byty");
  const [land, setLand] = useState<LandKind>("zemedelske");
  const [commercial, setCommercial] = useState<CommercialKind>("kancelare");
  const [metricId, setMetricId] = useState<string | null>(null);
  const [horizon, setHorizon] = useState<Horizon>(10);
  const hasModel = asset === "byty" || asset === "domy";
  const anchor = hasModel ? MODEL_ANCHOR[asset] : null;
  const baseGrowth = RENT_VS_BUY_DEFAULTS.annualPropertyGrowth;

  const availableMetrics = useMemo(() => {
    if (asset !== "komercni") return [];
    return listSeries({ segment: "komercni", subtype: commercial });
  }, [asset, commercial]);

  const activeMetricId =
    metricId && availableMetrics.some((item) => item.id === metricId)
      ? metricId
      : availableMetrics[0]?.id ?? null;

  const marketSeries = useMemo(
    () => resolveMarketSeries(asset, land, commercial, activeMetricId),
    [asset, land, commercial, activeMetricId]
  );

  const blocked = useMemo(
    () => blockedFor(asset, land, commercial),
    [asset, land, commercial]
  );

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

  const marketChart = useMemo(() => {
    if (!marketSeries) return [];
    return marketSeries.points.map((point) => ({
      year: point.year,
      value: point.value,
    }));
  }, [marketSeries]);

  const modelChange =
    anchor != null && chart.length > 1 && chart[chart.length - 1]!.base
      ? (chart[chart.length - 1]!.base! / anchor - 1) * 100
      : null;

  const marketSummary = useMemo(() => {
    if (!marketSeries || marketSeries.points.length === 0) return null;
    const first = marketSeries.points[0]!;
    const last = marketSeries.points[marketSeries.points.length - 1]!;
    if (marketSeries.points.length === 1) {
      return {
        kind: "latest" as const,
        label: "Poslední známá hodnota",
        text: formatSeriesValue(marketSeries, last.value),
        period: String(last.year),
      };
    }
    const change = seriesChange(marketSeries, first.year, last.year);
    if (!change) return null;
    return {
      kind: change.kind,
      label:
        change.kind === "pp"
          ? `Změna ${first.year}–${last.year}`
          : `Změna ${first.year}–${last.year}`,
      text:
        change.kind === "pp"
          ? formatPp(change.value)
          : `${change.value > 0 ? "+" : ""}${formatPct(change.value)}`,
      period: `${first.year}–${last.year}`,
    };
  }, [marketSeries]);

  const locationChip =
    marketSeries?.locationCs ??
    (hasModel ? "Česká republika · model" : "Česká republika");

  const sectionTitle =
    asset === "komercni" && marketSeries
      ? "Vývoj komerčního trhu"
      : asset === "pozemky" && marketSeries
        ? marketSeries.labelCs
        : hasModel
          ? "Modelový scénář ceny"
          : blocked?.labelCs ?? "Historická data";

  return (
    <div className="rounded-[18px] border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap gap-2">
        {ASSETS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setAsset(item.id);
              setMetricId(null);
            }}
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
          {locationChip}
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
              onClick={() => {
                setCommercial(item.id);
                setMetricId(null);
              }}
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

      {availableMetrics.length > 1 ? (
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Ukazatel komerčního trhu">
          {availableMetrics.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setMetricId(item.id)}
              className={cn(
                "h-8 rounded-full px-3 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal",
                activeMetricId === item.id
                  ? "bg-deep-teal text-white"
                  : "bg-[#f4f6f5] text-gray-700"
              )}
            >
              {item.metricLabelCs}
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

      <p className="mt-4 font-heading text-lg font-bold text-text-dark sm:text-xl">
        {sectionTitle}
      </p>
      {marketSeries ? (
        <p className="mt-1 text-sm text-gray-600">
          {marketSeries.metricLabelCs} · {marketSeries.unitLabelCs} ·{" "}
          {marketSeries.points[0]!.year}–{marketSeries.points.at(-1)!.year}
        </p>
      ) : null}

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_200px]">
        {hasModel ? (
          <div className="h-72 min-w-0 w-full touch-pan-y">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
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
        ) : marketSeries ? (
          <div className="h-72 min-w-0 w-full touch-pan-y">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <LineChart
                data={marketChart}
                margin={{ top: 8, right: 8, left: 4, bottom: 0 }}
              >
                <CartesianGrid stroke="#e7ebe9" vertical={false} />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 12, fill: "#66706b" }}
                  allowDecimals={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#66706b" }}
                  width={72}
                  tickFormatter={yAxisFormatter(marketSeries)}
                  domain={["auto", "auto"]}
                />
                <Tooltip
                  formatter={(value) => [
                    typeof value === "number"
                      ? formatSeriesValue(marketSeries, value)
                      : "—",
                    marketSeries.metricLabelCs,
                  ]}
                  labelFormatter={(label) =>
                    `${label} · ${marketSeries.locationCs}`
                  }
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  name={marketSeries.metricLabelCs}
                  stroke="#1b4d3e"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#1b4d3e" }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex min-h-56 items-center rounded-xl border border-dashed border-gray-300 bg-[#fafaf7] px-4 py-6">
            <div>
              <p className="font-heading text-xl font-bold text-text-dark">
                {blocked?.labelCs ?? "Data zatím nejsou v tomto přehledu"}
              </p>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-gray-600">
                {blocked?.clientMessageCs ??
                  "Pro vybranou kombinaci nemáme ověřenou veřejnou časovou řadu."}
              </p>
            </div>
          </div>
        )}

        <aside className="rounded-xl border border-gray-200 bg-[#f7f6f3] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {hasModel
              ? `Model za ${horizon} let`
              : marketSummary
                ? marketSummary.label
                : "Stav dat"}
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
          ) : marketSummary ? (
            <>
              <p className="mt-2 font-heading text-3xl font-bold text-deep-teal">
                {marketSummary.text}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-gray-600">
                {marketSeries!.points.length === 1
                  ? "Jeden ověřený bod — nezobrazujeme fiktivní růst."
                  : marketSummary.kind === "pp"
                    ? "Změna v procentních bodech (neobsazenost / výnosová míra)."
                    : `Procentní změna ${marketSeries!.unitLabelCs} za dostupné období.`}
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm font-semibold leading-relaxed text-text-dark">
              Ověřená řada pro tuto volbu chybí
            </p>
          )}
        </aside>
      </div>

      {hasModel ? (
        <p className="mt-4 text-xs leading-relaxed text-gray-500">
          Jednotka grafu je Kč za modelový objekt, ne Kč/m² z realizovaných prodejů.
          Zdroj výchozí ceny: interní modelové body platformy k roku {HISTORICAL_END_YEAR},
          ne časová řada ČSÚ. Období scénáře: {HISTORICAL_END_YEAR}–
          {HISTORICAL_END_YEAR + horizon}. Příznivý scénář přidává 2 p. b. k růstu ceny,
          nepříznivý ubírá 2 p. b. Tento model není náhradou historických tržních dat.
        </p>
      ) : marketSeries ? (
        <details className="mt-4 text-xs leading-relaxed text-gray-500">
          <summary className="cursor-pointer font-semibold text-deep-teal">
            Metodika a zdroje
          </summary>
          <p className="mt-2">
            {marketSeries.methodologyCs} Zdroj:{" "}
            <a
              href={marketSeries.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-deep-teal underline-offset-2 hover:underline"
            >
              {marketSeries.sourceName}
            </a>
            {marketSeries.tableOrPage ? ` (${marketSeries.tableOrPage})` : null}.
            Publikace: {marketSeries.publishedAt ?? "—"}. Ověřeno:{" "}
            {marketSeries.verifiedAt}. Období dat: {marketSeries.points[0]!.year}–
            {marketSeries.points.at(-1)!.year} ({marketSeries.points.length} bodů).
          </p>
        </details>
      ) : blocked ? (
        <details className="mt-4 text-xs leading-relaxed text-gray-500">
          <summary className="cursor-pointer font-semibold text-deep-teal">
            Metodika a zdroje
          </summary>
          <p className="mt-2">
            Pro tuto volbu nemáme otevřenou srovnatelnou řadu. Nejde o výpadek zobrazení.
          </p>
        </details>
      ) : null}

      <Link
        href={routes.kalkulacky.historickyVyvoj}
        className="mt-4 inline-flex text-sm font-semibold text-deep-teal hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal"
      >
        Zobrazit detailní analýzu cen →
      </Link>
    </div>
  );
}
