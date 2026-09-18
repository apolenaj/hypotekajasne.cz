"use client";

import { formatModelCzk } from "@/lib/property-rentgen/control-model";
import type {
  BeforeAfterPanels,
  CashNeededStacked,
  ChartMeta,
  EquityDebtSeries,
  MarketScatterPoint,
  RefixTimeSeries,
  ReservePathSeries,
  SaleWaterfall,
  SettlementWaterfall,
  TornadoDeltas,
} from "@/lib/property-rentgen/chart-series";
import { cn } from "@/lib/utils";

const CHART = {
  teal: "#1b4d3e",
  gold: "#c5a059",
  red: "#b91c1c",
  green: "#047857",
  ink: "#1a1a1a",
  muted: "#6b7280",
  line: "#d1d5db",
  soft: "#f4f7f6",
} as const;

function signedCzk(value: number): string {
  return `${value > 0 ? "+" : ""}${formatModelCzk(value, 0)}`;
}

function linePoints(
  values: Array<{ x: number; y: number }>
): string {
  return values.map((point) => `${point.x},${point.y}`).join(" ");
}

function WrappedSvgLabel({
  label,
  x,
  y,
  width = 14,
}: {
  label: string;
  x: number;
  y: number;
  width?: number;
}) {
  const words = label.split(/\s+/);
  const lines: string[] = [];
  for (const word of words) {
    const current = lines.at(-1);
    if (!current || current.length + word.length + 1 > width) {
      lines.push(word);
    } else {
      lines[lines.length - 1] = `${current} ${word}`;
    }
  }
  return (
    <text x={x} y={y} textAnchor="middle" fontSize={8} fill={CHART.muted}>
      {lines.slice(0, 3).map((line, index) => (
        <tspan key={`${line}-${index}`} x={x} dy={index === 0 ? 0 : 10}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

function ChartCaption({ meta }: { meta?: ChartMeta }) {
  if (!meta) return null;
  return (
    <div className="mt-2 space-y-1 text-xs text-muted-foreground">
      <p>
        <span className="font-semibold text-text-dark">{meta.questionCs}</span>
        {meta.unitCs ? ` · ${meta.unitCs}` : ""}
        {meta.periodCs ? ` · ${meta.periodCs}` : ""}
      </p>
      <p>{meta.interpretationCs}</p>
      {meta.assumptionsCs.length > 0 ? (
        <p>Předpoklady: {meta.assumptionsCs.join(" · ")}</p>
      ) : null}
    </div>
  );
}

export type WaterfallStep = {
  key: string;
  label: string;
  /** Signed delta for this step (positive increase, negative decrease). */
  deltaCzk: number;
  kind: "start" | "delta" | "total";
};

/** Build connected waterfall from monthly rent through to net cash flow. */
export function buildMonthlyWaterfallSteps(
  steps: Array<{ key: string; label: string; amountCzk: number }>
): WaterfallStep[] {
  const rent = steps.find((s) => s.key === "rent");
  const net = steps.find((s) => s.key === "net");
  const middles = steps.filter((s) => s.key !== "rent" && s.key !== "net");
  const out: WaterfallStep[] = [];
  if (rent) {
    out.push({
      key: rent.key,
      label: rent.label,
      deltaCzk: rent.amountCzk,
      kind: "start",
    });
  }
  for (const m of middles) {
    out.push({
      key: m.key,
      label: m.label,
      deltaCzk: m.amountCzk,
      kind: "delta",
    });
  }
  if (net) {
    out.push({
      key: net.key,
      label: net.label,
      deltaCzk: net.amountCzk,
      kind: "total",
    });
  }
  return out;
}

/**
 * True waterfall: floating bars from running total, final bar from zero.
 * Pure SVG — no Recharts, stable on SSR/CSR.
 */
export function RentgenWaterfallChart({
  steps,
  meta,
  className,
}: {
  steps: WaterfallStep[];
  meta?: ChartMeta;
  className?: string;
}) {
  const width = 640;
  const height = 280;
  const padL = 44;
  const padR = 12;
  const padT = 28;
  const padB = 72;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  let running = 0;
  const bars: Array<{
    key: string;
    label: string;
    y0: number;
    y1: number;
    fill: string;
    value: number;
    kind: WaterfallStep["kind"];
  }> = [];

  for (const step of steps) {
    if (step.kind === "start") {
      running = step.deltaCzk;
      bars.push({
        key: step.key,
        label: step.label,
        y0: 0,
        y1: step.deltaCzk,
        fill: "#1b4d3e",
        value: step.deltaCzk,
        kind: step.kind,
      });
    } else if (step.kind === "total") {
      bars.push({
        key: step.key,
        label: step.label,
        y0: 0,
        y1: step.deltaCzk,
        fill: step.deltaCzk >= 0 ? "#047857" : "#b91c1c",
        value: step.deltaCzk,
        kind: step.kind,
      });
    } else {
      const prev = running;
      running += step.deltaCzk;
      bars.push({
        key: step.key,
        label: step.label,
        y0: prev,
        y1: running,
        fill: step.deltaCzk >= 0 ? "#047857" : "#dc2626",
        value: step.deltaCzk,
        kind: step.kind,
      });
    }
  }

  const allY = bars.flatMap((b) => [b.y0, b.y1]);
  const minY = Math.min(0, ...allY);
  const maxY = Math.max(0, ...allY);
  const span = Math.max(maxY - minY, 1);
  const yScale = (v: number) => padT + ((maxY - v) / span) * plotH;
  const zeroY = yScale(0);
  const gap = 8;
  const barW = Math.min(48, (plotW - gap * (bars.length - 1)) / bars.length);

  return (
    <figure className={cn("w-full overflow-x-auto", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="mx-auto h-auto w-full min-w-[320px] max-w-3xl"
        role="img"
        aria-label="Vodopád měsíčního peněžního toku"
      >
        <line
          x1={padL}
          x2={width - padR}
          y1={zeroY}
          y2={zeroY}
          stroke="#1a1a1a"
          strokeWidth={1.25}
        />
        <text
          x={padL - 6}
          y={zeroY + 3}
          textAnchor="end"
          fontSize={10}
          fill="#6b7280"
        >
          0
        </text>
        {bars.map((b, i) => {
          const x = padL + i * (barW + gap);
          const top = yScale(Math.max(b.y0, b.y1));
          const bot = yScale(Math.min(b.y0, b.y1));
          const h = Math.max(bot - top, 2);
          const labelY = b.value >= 0 ? top - 6 : bot + 12;
          return (
            <g key={b.key}>
              <rect
                x={x}
                y={top}
                width={barW}
                height={h}
                rx={b.kind === "total" ? 4 : 2}
                fill={b.fill}
              />
              <text
                x={x + barW / 2}
                y={labelY}
                textAnchor="middle"
                fontSize={9}
                fontWeight={600}
                fill="#1a1a1a"
              >
                {formatModelCzk(b.value, 0)}
              </text>
              <WrappedSvgLabel
                label={b.label}
                x={x + barW / 2}
                y={height - 35}
                width={11}
              />
            </g>
          );
        })}
      </svg>
      <ChartCaption meta={meta} />
    </figure>
  );
}

export type ScenarioBar = {
  id: string;
  label: string;
  valueCzk: number;
  assumptions: string;
  emphasize?: boolean;
};

/** Horizontal bars with shared zero axis — amounts visible without hover. */
export function RentgenScenarioBars({
  rows,
  meta,
  className,
}: {
  rows: ScenarioBar[];
  meta?: ChartMeta;
  className?: string;
}) {
  const maxAbs = Math.max(...rows.map((r) => Math.abs(r.valueCzk)), 1);

  return (
    <figure className={className}>
      <div className="space-y-3">
        {rows.map((r) => {
        const pct = (Math.abs(r.valueCzk) / maxAbs) * 50;
        const positive = r.valueCzk >= 0;
        return (
          <div
            key={r.id}
            className={cn(
              "rounded-xl border px-3 py-3",
              r.emphasize
                ? "border-deep-teal/40 bg-[#f4f7f6]"
                : "border-border bg-white"
            )}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-text-dark">
                  {r.label}
                  {r.emphasize ? (
                    <span className="ml-2 text-[10px] font-bold uppercase tracking-wide text-deep-teal">
                      Základ
                    </span>
                  ) : null}
                </p>
                <p className="text-[11px] text-muted-foreground">{r.assumptions}</p>
              </div>
              <p
                className={cn(
                  "font-heading text-lg font-bold tabular-nums",
                  positive ? "text-emerald-700" : "text-red-700"
                )}
              >
                {formatModelCzk(r.valueCzk, 0)}
                <span className="ml-1 text-xs font-medium text-muted-foreground">
                  /měs.
                </span>
              </p>
            </div>
            <div className="relative mt-2 h-3 rounded-full bg-[#eef2f0]">
              <div
                className="absolute inset-y-0 left-1/2 w-px bg-[#1a1a1a]"
                aria-hidden
              />
              <div
                className={cn(
                  "absolute top-0 h-3 rounded-full",
                  positive ? "bg-emerald-600" : "bg-red-600",
                  positive ? "left-1/2 rounded-l-none" : "right-1/2 rounded-r-none"
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
        })}
      </div>
      <ChartCaption meta={meta} />
    </figure>
  );
}

type WebChartProps<T> = {
  data: T;
  meta?: ChartMeta;
  className?: string;
};

/** One stacked column separating required cash from optional fit-out. */
export function RentgenStackedCashBar({
  data,
  meta,
  className,
}: WebChartProps<CashNeededStacked>) {
  const width = 640;
  const height = 250;
  const x = 170;
  const barW = 190;
  const top = 20;
  const plotH = 150;
  const segments = [
    { key: "equity", label: "Vlastní kapitál", value: data.equityCzk, fill: CHART.teal },
    { key: "fitout", label: "Nutné úpravy", value: data.fitoutCzk, fill: CHART.gold },
    { key: "closing", label: "Vedlejší náklady", value: data.closingCzk, fill: "#8a7350" },
    { key: "reserve", label: "Držená rezerva", value: data.reserveCzk, fill: CHART.green },
    {
      key: "optional",
      label: "Volitelné vybavení",
      value: data.optionalFitoutCzk,
      fill: "#d1d5db",
    },
  ].filter((segment) => segment.value !== 0);
  const max = Math.max(data.totalWithOptionalFitoutCzk, 1);
  let cursor = top + plotH;

  return (
    <figure className={cn("w-full overflow-x-auto", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full min-w-[360px]"
        role="img"
        aria-label={meta?.questionCs ?? "Skladba potřebné hotovosti"}
      >
        {segments.map((segment, index) => {
          const h = Math.max((segment.value / max) * plotH, 2);
          cursor -= h;
          const y = cursor;
          return (
            <g key={segment.key}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={h}
                fill={segment.fill}
                stroke={segment.key === "optional" ? CHART.muted : "none"}
                strokeDasharray={segment.key === "optional" ? "4 3" : undefined}
              />
              {h >= 18 ? (
                <text
                  x={x + barW / 2}
                  y={y + h / 2 + 3}
                  textAnchor="middle"
                  fontSize={9}
                  fontWeight={700}
                  fill={index === 1 || index === 4 ? CHART.ink : "#fff"}
                >
                  {formatModelCzk(segment.value, 0)}
                </text>
              ) : null}
              <rect x={390} y={28 + index * 27} width={10} height={10} fill={segment.fill} />
              <text x={406} y={37 + index * 27} fontSize={9} fill={CHART.ink}>
                {segment.label}: {formatModelCzk(segment.value, 0)}
              </text>
            </g>
          );
        })}
        <line x1={x} x2={x + barW} y1={top + plotH} y2={top + plotH} stroke={CHART.ink} />
        <text x={x + barW / 2} y={192} textAnchor="middle" fontSize={10} fontWeight={700}>
          Nutné: {formatModelCzk(data.totalRequiredCzk, 0)}
        </text>
        <text x={x + barW / 2} y={208} textAnchor="middle" fontSize={9} fill={CHART.muted}>
          Včetně volitelného: {formatModelCzk(data.totalWithOptionalFitoutCzk, 0)}
        </text>
      </svg>
      <ChartCaption meta={meta} />
    </figure>
  );
}

/** Three independently scaled before/after comparisons. */
export function RentgenBeforeAfterPanels({
  data,
  meta,
  className,
}: WebChartProps<BeforeAfterPanels>) {
  const panels = [data.monthlyCashFlow, data.ownCash, data.ownerCosts];
  return (
    <figure className={cn("w-full", className)}>
      <div className="grid gap-3 md:grid-cols-3">
        {panels.map((panel) => (
          <div key={panel.label} className="rounded-xl border bg-white p-3">
            <p className="mb-3 text-sm font-semibold text-text-dark">{panel.label}</p>
            {(
              [
                ["Před", panel.beforeCzk, CHART.muted],
                ["Po", panel.afterCzk, CHART.teal],
              ] as const
            ).map(([label, value, fill]) => {
              const width = (Math.abs(value) / panel.scaleMaxAbsCzk) * 48;
              return (
                <div key={label} className="mb-3">
                  <div className="mb-1 flex justify-between gap-2 text-xs">
                    <span>{label}</span>
                    <span className="font-semibold tabular-nums">{formatModelCzk(value, 0)}</span>
                  </div>
                  <div className="relative h-3 rounded bg-[#eef2f0]">
                    <span className="absolute inset-y-0 left-1/2 w-px bg-black" />
                    <span
                      className="absolute inset-y-0 rounded"
                      style={{
                        width: `${width}%`,
                        left: value >= 0 ? "50%" : undefined,
                        right: value < 0 ? "50%" : undefined,
                        backgroundColor: value < 0 ? CHART.red : fill,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <ChartCaption meta={meta} />
    </figure>
  );
}

/** Signed horizontal sensitivity bars sorted by absolute impact. */
export function RentgenTornadoChart({
  data,
  meta,
  className,
}: WebChartProps<TornadoDeltas>) {
  const maxAbs = Math.max(1, ...data.map((row) => Math.abs(row.deltaCzk)));
  const height = Math.max(100, data.length * 54 + 28);
  return (
    <figure className={cn("w-full overflow-x-auto", className)}>
      <svg
        viewBox={`0 0 680 ${height}`}
        className="h-auto w-full min-w-[480px]"
        role="img"
        aria-label={meta?.questionCs ?? "Tornádo dopadů"}
      >
        <line x1={330} x2={330} y1={8} y2={height - 12} stroke={CHART.ink} />
        {data.map((row, index) => {
          const y = 16 + index * 54;
          const w = (Math.abs(row.deltaCzk) / maxAbs) * 245;
          const x = row.deltaCzk >= 0 ? 330 : 330 - w;
          return (
            <g key={`${row.label}-${index}`}>
              <text x={8} y={y + 10} fontSize={10} fontWeight={600} fill={CHART.ink}>
                {row.label}
              </text>
              <text x={8} y={y + 25} fontSize={8} fill={CHART.muted}>
                {row.changeNote}
              </text>
              <rect
                x={x}
                y={y}
                width={Math.max(w, 1)}
                height={15}
                rx={2}
                fill={row.deltaCzk >= 0 ? CHART.green : CHART.red}
              />
              <text
                x={row.deltaCzk >= 0 ? x + w + 5 : x - 5}
                y={y + 11}
                textAnchor={row.deltaCzk >= 0 ? "start" : "end"}
                fontSize={9}
                fontWeight={700}
                fill={CHART.ink}
              >
                {signedCzk(row.deltaCzk)}
              </text>
            </g>
          );
        })}
      </svg>
      <ChartCaption meta={meta} />
    </figure>
  );
}

/** Reserve balance with explicit event markers and a dashed no-top-up counterfactual. */
export function RentgenReservePathChart({
  data,
  meta,
  className,
}: WebChartProps<ReservePathSeries>) {
  const width = 680;
  const height = 300;
  const pad = { l: 64, r: 20, t: 28, b: 54 };
  const values = data.months.flatMap((row) => [row.closingCzk, row.hypotheticalClosingCzk]);
  const min = Math.min(0, ...values);
  const max = Math.max(1, ...data.months.map((row) => row.openingCzk), ...values);
  const span = Math.max(max - min, 1);
  const x = (index: number) =>
    pad.l + (index / Math.max(data.months.length - 1, 1)) * (width - pad.l - pad.r);
  const y = (value: number) => pad.t + ((max - value) / span) * (height - pad.t - pad.b);
  const actual = data.months.map((row, index) => ({ x: x(index), y: y(row.closingCzk) }));
  const hypothetical = data.months.map((row, index) => ({
    x: x(index),
    y: y(row.hypotheticalClosingCzk),
  }));

  return (
    <figure className={cn("w-full overflow-x-auto", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full min-w-[440px]"
        role="img"
        aria-label={meta?.questionCs ?? "Vývoj hotovostní rezervy"}
      >
        <line x1={pad.l} x2={width - pad.r} y1={y(0)} y2={y(0)} stroke={CHART.ink} />
        <text x={pad.l - 8} y={y(0) + 3} textAnchor="end" fontSize={9} fill={CHART.muted}>
          0 Kč
        </text>
        <polyline
          points={linePoints(hypothetical)}
          fill="none"
          stroke={CHART.red}
          strokeWidth={2}
          strokeDasharray="7 5"
        />
        <polyline points={linePoints(actual)} fill="none" stroke={CHART.teal} strokeWidth={3} />
        {data.months.map((row, index) => {
          const marker = row.repair ? "Oprava" : row.relet ? "Pronajato" : row.empty ? "Prázdno" : "";
          return (
            <g key={row.month}>
              <circle
                cx={x(index)}
                cy={y(row.closingCzk)}
                r={row.topup || row.repair ? 5 : 3}
                fill={row.topup ? CHART.gold : row.repair ? CHART.red : CHART.teal}
                stroke={CHART.ink}
                strokeWidth={row.topup ? 1 : 0}
              />
              <text x={x(index)} y={height - 33} textAnchor="middle" fontSize={8} fill={CHART.muted}>
                M{row.month}
              </text>
              {marker ? (
                <text x={x(index)} y={height - 18} textAnchor="middle" fontSize={7} fill={CHART.ink}>
                  {marker}
                </text>
              ) : null}
              {row.topup ? (
                <text x={x(index)} y={y(row.closingCzk) - 9} textAnchor="middle" fontSize={8} fontWeight={700}>
                  Doplnění
                </text>
              ) : null}
            </g>
          );
        })}
        <line x1={390} x2={420} y1={14} y2={14} stroke={CHART.teal} strokeWidth={3} />
        <text x={426} y={17} fontSize={8}>Po doplnění</text>
        <line x1={510} x2={540} y1={14} y2={14} stroke={CHART.red} strokeDasharray="6 4" />
        <text x={546} y={17} fontSize={8}>Bez doplnění (hypoteticky)</text>
      </svg>
      <ChartCaption meta={meta} />
    </figure>
  );
}

/** Monthly cash-flow paths with the refix month called out. */
export function RentgenRefixCompareChart({
  data,
  meta,
  className,
}: WebChartProps<RefixTimeSeries>) {
  const width = 680;
  const height = 280;
  const pad = { l: 62, r: 20, t: 28, b: 42 };
  const all = data.months.flatMap((row) => [row.cfNoRefixCzk, row.cfWithRefixCzk]);
  const min = Math.min(0, ...all);
  const max = Math.max(0, ...all);
  const span = Math.max(max - min, 1);
  const monthMin = Math.min(...data.months.map((row) => row.month), 0);
  const monthMax = Math.max(...data.months.map((row) => row.month), data.refixMonth, monthMin + 1);
  const x = (month: number) =>
    pad.l + ((month - monthMin) / (monthMax - monthMin)) * (width - pad.l - pad.r);
  const y = (value: number) => pad.t + ((max - value) / span) * (height - pad.t - pad.b);
  const noRefix = data.months.map((row) => ({ x: x(row.month), y: y(row.cfNoRefixCzk) }));
  const withRefix = data.months.map((row) => ({ x: x(row.month), y: y(row.cfWithRefixCzk) }));

  return (
    <figure className={cn("w-full overflow-x-auto", className)}>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full min-w-[440px]" role="img"
        aria-label={meta?.questionCs ?? "Srovnání cash flow při refixaci"}>
        <line x1={pad.l} x2={width - pad.r} y1={y(0)} y2={y(0)} stroke={CHART.line} />
        <line x1={x(data.refixMonth)} x2={x(data.refixMonth)} y1={pad.t} y2={height - pad.b}
          stroke={CHART.gold} strokeWidth={2} strokeDasharray="5 4" />
        <text x={x(data.refixMonth)} y={18} textAnchor="middle" fontSize={9} fontWeight={700}>
          Refixace M{data.refixMonth}
        </text>
        <polyline points={linePoints(noRefix)} fill="none" stroke={CHART.muted} strokeWidth={2} />
        <polyline points={linePoints(withRefix)} fill="none" stroke={CHART.teal} strokeWidth={3} />
        {data.months.map((row) => (
          <text key={row.month} x={x(row.month)} y={height - 20} textAnchor="middle" fontSize={8} fill={CHART.muted}>
            {row.month}
          </text>
        ))}
        <text x={pad.l} y={height - 6} fontSize={8} fill={CHART.muted}>Měsíc</text>
        <line x1={430} x2={455} y1={15} y2={15} stroke={CHART.teal} strokeWidth={3} />
        <text x={461} y={18} fontSize={8}>S refixací</text>
        <line x1={545} x2={570} y1={15} y2={15} stroke={CHART.muted} strokeWidth={2} />
        <text x={576} y={18} fontSize={8}>Bez refixace</text>
      </svg>
      <ChartCaption meta={meta} />
    </figure>
  );
}

/** Property value split into remaining debt and modelled equity. */
export function RentgenEquityDebtChart({
  data,
  meta,
  className,
}: WebChartProps<EquityDebtSeries>) {
  const width = 680;
  const height = 300;
  const pad = { l: 65, r: 20, t: 28, b: 44 };
  const max = Math.max(1, ...data.flatMap((row) => [row.propertyValueCzk, row.debtCzk, row.equityCzk]));
  const x = (index: number) => pad.l + (index / Math.max(data.length - 1, 1)) * (width - pad.l - pad.r);
  const y = (value: number) => pad.t + (1 - value / max) * (height - pad.t - pad.b);
  const property = data.map((row, index) => ({ x: x(index), y: y(row.propertyValueCzk) }));
  const debt = data.map((row, index) => ({ x: x(index), y: y(row.debtCzk) }));
  const equity = data.map((row, index) => ({ x: x(index), y: y(row.equityCzk) }));
  return (
    <figure className={cn("w-full overflow-x-auto", className)}>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full min-w-[440px]" role="img"
        aria-label={meta?.questionCs ?? "Vývoj hodnoty, dluhu a vlastního kapitálu"}>
        <line x1={pad.l} x2={width - pad.r} y1={height - pad.b} y2={height - pad.b} stroke={CHART.ink} />
        <polyline points={linePoints(property)} fill="none" stroke={CHART.gold} strokeWidth={3} />
        <polyline points={linePoints(debt)} fill="none" stroke={CHART.red} strokeWidth={2.5} />
        <polyline points={linePoints(equity)} fill="none" stroke={CHART.teal} strokeWidth={3} />
        {data.map((row, index) => (
          <g key={row.year}>
            <circle cx={x(index)} cy={y(row.equityCzk)} r={3} fill={CHART.teal} />
            <text x={x(index)} y={height - 25} textAnchor="middle" fontSize={8} fill={CHART.muted}>
              R{row.year}
            </text>
          </g>
        ))}
        {[
          ["Hodnota", CHART.gold],
          ["Dluh", CHART.red],
          ["Vlastní kapitál", CHART.teal],
        ].map(([label, color], index) => (
          <g key={label}>
            <line x1={360 + index * 100} x2={382 + index * 100} y1={15} y2={15} stroke={color} strokeWidth={3} />
            <text x={387 + index * 100} y={18} fontSize={8}>{label}</text>
          </g>
        ))}
      </svg>
      <ChartCaption meta={meta} />
    </figure>
  );
}

function MiniWaterfall({
  title,
  values,
}: {
  title: string;
  values: Array<{ label: string; value: number; total?: boolean }>;
}) {
  const width = 330;
  const height = 240;
  const bars = values.reduce<{
    running: number;
    bars: Array<{
      label: string;
      value: number;
      total?: boolean;
      from: number;
      to: number;
    }>;
  }>(
    (state, item) => {
      const from = item.total ? 0 : state.running;
      const to = item.total ? item.value : from + item.value;
      return {
        running: item.total ? state.running : to,
        bars: [...state.bars, { ...item, from, to }],
      };
    },
    { running: 0, bars: [] }
  ).bars;
  const extent = bars.flatMap((bar) => [bar.from, bar.to]);
  const min = Math.min(0, ...extent);
  const max = Math.max(0, ...extent);
  const span = Math.max(max - min, 1);
  const y = (value: number) => 28 + ((max - value) / span) * 135;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label={title}>
      <text x={10} y={14} fontSize={11} fontWeight={700} fill={CHART.teal}>{title}</text>
      <line x1={18} x2={width - 10} y1={y(0)} y2={y(0)} stroke={CHART.ink} />
      {bars.map((bar, index) => {
        const x = 25 + index * 74;
        const top = y(Math.max(bar.from, bar.to));
        const bottom = y(Math.min(bar.from, bar.to));
        return (
          <g key={bar.label}>
            <rect x={x} y={top} width={52} height={Math.max(bottom - top, 2)} rx={2}
              fill={bar.total ? CHART.teal : bar.value >= 0 ? CHART.green : CHART.red} />
            <text x={x + 26} y={bar.value >= 0 ? top - 5 : bottom + 11} textAnchor="middle"
              fontSize={8} fontWeight={700}>{signedCzk(bar.value)}</text>
            <WrappedSvgLabel label={bar.label} x={x + 26} y={184} width={12} />
          </g>
        );
      })}
    </svg>
  );
}

/** Sale proceeds and whole-investment settlement shown as distinct waterfalls. */
export function RentgenSaleSettlementCharts({
  sale,
  settlement,
  saleMeta,
  settlementMeta,
  className,
}: {
  sale: SaleWaterfall;
  settlement: SettlementWaterfall;
  saleMeta?: ChartMeta;
  settlementMeta?: ChartMeta;
  className?: string;
}) {
  return (
    <figure className={cn("w-full", className)}>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <MiniWaterfall
            title={saleMeta?.questionCs ?? "Inkaso z prodeje"}
            values={[
              { label: "Prodejní cena", value: sale.salePriceCzk },
              { label: "Náklady prodeje", value: -Math.abs(sale.costsCzk) },
              { label: "Splacení dluhu", value: -Math.abs(sale.debtCzk) },
              { label: "Čisté inkaso", value: sale.netProceedsCzk, total: true },
            ]}
          />
          <ChartCaption meta={saleMeta} />
        </div>
        <div>
          <MiniWaterfall
            title={settlementMeta?.questionCs ?? "Celkové vypořádání"}
            values={[
              { label: "Počáteční vklad", value: -Math.abs(settlement.initialOutlayCzk) },
              { label: "Doplnění", value: -Math.abs(settlement.topupsCzk) },
              { label: "Prodej + rezerva", value: settlement.saleAndReserveCzk },
              { label: "Celkem", value: settlement.totalCzk, total: true },
            ]}
          />
          <ChartCaption meta={settlementMeta} />
        </div>
      </div>
    </figure>
  );
}

/** Model and comparable listings on two numerical dimensions. */
export function RentgenMarketScatter({
  data,
  meta,
  className,
}: WebChartProps<MarketScatterPoint[]>) {
  const width = 680;
  const height = 320;
  const pad = { l: 70, r: 28, t: 32, b: 52 };
  const xs = data.map((point) => point.x);
  const ys = data.map((point) => point.y);
  const minX = Math.min(...xs, 0);
  const maxX = Math.max(...xs, minX + 1);
  const minY = Math.min(...ys, 0);
  const maxY = Math.max(...ys, minY + 1);
  const x = (value: number) => pad.l + ((value - minX) / (maxX - minX)) * (width - pad.l - pad.r);
  const y = (value: number) => pad.t + ((maxY - value) / (maxY - minY)) * (height - pad.t - pad.b);
  return (
    <figure className={cn("w-full overflow-x-auto", className)}>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full min-w-[440px]" role="img"
        aria-label={meta?.questionCs ?? "Tržní srovnání"}>
        <line x1={pad.l} x2={width - pad.r} y1={height - pad.b} y2={height - pad.b} stroke={CHART.ink} />
        <line x1={pad.l} x2={pad.l} y1={pad.t} y2={height - pad.b} stroke={CHART.ink} />
        {data.map((point, index) => (
          <g key={`${point.label}-${index}`}>
            <circle cx={x(point.x)} cy={y(point.y)} r={point.isModel ? 7 : 5}
              fill={point.isModel ? CHART.gold : CHART.teal} stroke={CHART.ink} strokeWidth={point.isModel ? 2 : 1} />
            <text x={x(point.x) + 8} y={y(point.y) - 7} fontSize={8}
              fontWeight={point.isModel ? 700 : 400} fill={CHART.ink}>{point.label}</text>
          </g>
        ))}
        <text x={(pad.l + width - pad.r) / 2} y={height - 15} textAnchor="middle" fontSize={9}>
          {meta?.unitCs.includes("m²") ? "Plocha / srovnávací osa" : "Osa X"}
        </text>
        <text x={8} y={20} fontSize={9}>Osa Y · {meta?.unitCs ?? "Kč"}</text>
      </svg>
      <ChartCaption meta={meta} />
    </figure>
  );
}

export type SensitivityHeatmapCell = {
  rowValue: number;
  columnValue: number;
  valueCzk: number;
};

/** Numeric sensitivity matrix; the current model cell is outlined and labelled. */
export function RentgenSensitivityHeatmap({
  rows,
  columns,
  cells,
  currentRow,
  currentColumn,
  rowLabel = "Nájem",
  columnLabel = "Sazba",
  meta,
  className,
}: {
  rows: number[];
  columns: number[];
  cells: SensitivityHeatmapCell[];
  currentRow: number;
  currentColumn: number;
  rowLabel?: string;
  columnLabel?: string;
  meta?: ChartMeta;
  className?: string;
}) {
  const lookup = new Map(cells.map((cell) => [`${cell.rowValue}:${cell.columnValue}`, cell]));
  const maxAbs = Math.max(1, ...cells.map((cell) => Math.abs(cell.valueCzk)));
  return (
    <figure className={cn("w-full overflow-x-auto", className)}>
      <div className="min-w-[480px]">
        <div
          className="grid gap-1"
          style={{ gridTemplateColumns: `minmax(92px, 1.3fr) repeat(${columns.length}, minmax(76px, 1fr))` }}
        >
          <div className="p-2 text-xs font-semibold">{rowLabel} ↓ / {columnLabel} →</div>
          {columns.map((column) => (
            <div key={column} className="p-2 text-center text-xs font-semibold">
              {column.toLocaleString("cs-CZ")} %
            </div>
          ))}
          {rows.map((row) => [
            <div key={`label-${row}`} className="p-2 text-xs font-semibold">
              {formatModelCzk(row, 0)}
            </div>,
            ...columns.map((column) => {
              const cell = lookup.get(`${row}:${column}`);
              const value = cell?.valueCzk ?? 0;
              const intensity = 0.12 + (Math.abs(value) / maxAbs) * 0.58;
              const current = row === currentRow && column === currentColumn;
              return (
                <div
                  key={`${row}-${column}`}
                  className={cn(
                    "rounded border p-2 text-center text-xs font-semibold tabular-nums",
                    current && "ring-2 ring-[#c5a059] ring-offset-1"
                  )}
                  style={{
                    backgroundColor:
                      value >= 0
                        ? `rgba(4,120,87,${intensity})`
                        : `rgba(185,28,28,${intensity})`,
                    color: intensity > 0.47 ? "#fff" : CHART.ink,
                  }}
                  aria-label={`${rowLabel} ${row}, ${columnLabel} ${column}: ${formatModelCzk(value, 0)}${current ? ", aktuální model" : ""}`}
                >
                  {formatModelCzk(value, 0)}
                  {current ? <span className="block text-[9px] uppercase">aktuální</span> : null}
                </div>
              );
            }),
          ])}
        </div>
      </div>
      <ChartCaption meta={meta} />
    </figure>
  );
}
