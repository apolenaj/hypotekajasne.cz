"use client";

import { formatModelCzk } from "@/lib/property-rentgen/control-model";
import { cn } from "@/lib/utils";

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
  className,
}: {
  steps: WaterfallStep[];
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
    <div className={cn("w-full overflow-x-auto", className)}>
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
              <text
                x={x + barW / 2}
                y={height - 28}
                textAnchor="middle"
                fontSize={8}
                fill="#6b7280"
              >
                {b.label.length > 12 ? `${b.label.slice(0, 11)}…` : b.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
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
  className,
}: {
  rows: ScenarioBar[];
  className?: string;
}) {
  const maxAbs = Math.max(...rows.map((r) => Math.abs(r.valueCzk)), 1);

  return (
    <div className={cn("space-y-3", className)}>
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
  );
}
