"use client";

import { useId, useMemo, useState, type ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Loader2, Lock } from "lucide-react";
import {
  formatAnalysisPrice,
  formatDigitalRentgenPrice,
} from "@/lib/property-rentgen/pricing";
import { getRentgenPremiumConfig } from "@/lib/property-rentgen/product-config";
import { cn } from "@/lib/utils";

type ScenarioId = "conservative" | "base" | "optimistic";

type CashFlowStep = {
  key: string;
  label: string;
  amountCzk: number;
  kind: "inflow" | "outflow" | "net";
};

type ScenarioBundle = {
  id: ScenarioId;
  label: string;
  subtitle: string;
  steps: CashFlowStep[];
};

/** Demo KPI — modelová ukázka, ne verdikt investice. */
const DEMO_KPI = {
  address: "Praha 7 · Holešovice · 68 m²",
  netYieldPct: 4.6,
  monthlyCashFlowCzk: 6_900,
  rocePct: 11.2,
  pricePerM2Czk: 105_882,
  ltvPct: 75,
  totalInvestmentCzk: 7_840_000,
  stressPlus2bpDeltaCzk: -4_100,
} as const;

export const MOCK_CHECKOUT_PROPERTY = {
  address: DEMO_KPI.address,
  city: "Praha 7",
  areaM2: 68,
  purchasePriceCzk: 7_200_000,
  monthlyGrossRentCzk: 32_000,
  ownFundsCzk: 1_800_000,
  annualRatePercent: 4.89,
  capexCzk: 420_000,
  closingCostsCzk: 120_000,
  monthlyOperatingCostsCzk: 4_200,
  monthlyReserveCzk: 2_500,
  vacancyRate: 0.05,
  termYears: 30,
  fixationYears: 5,
  label: DEMO_KPI.address,
} as const;

const SCENARIOS: ScenarioBundle[] = [
  {
    id: "conservative",
    label: "Konzervativní",
    subtitle: "Nižší nájem · vyšší rezervy",
    steps: [
      { key: "rent", label: "Hrubý nájem", amountCzk: 28_500, kind: "inflow" },
      { key: "mortgage", label: "Splátka", amountCzk: -19_200, kind: "outflow" },
      { key: "opex", label: "Provoz", amountCzk: -4_800, kind: "outflow" },
      { key: "reserve", label: "Rezerva", amountCzk: -3_200, kind: "outflow" },
      { key: "net", label: "Cash flow", amountCzk: 1_300, kind: "net" },
    ],
  },
  {
    id: "base",
    label: "Základní",
    subtitle: "Střední scénář",
    steps: [
      { key: "rent", label: "Hrubý nájem", amountCzk: 32_000, kind: "inflow" },
      { key: "mortgage", label: "Splátka", amountCzk: -18_400, kind: "outflow" },
      { key: "opex", label: "Provoz", amountCzk: -4_200, kind: "outflow" },
      { key: "reserve", label: "Rezerva", amountCzk: -2_500, kind: "outflow" },
      { key: "net", label: "Cash flow", amountCzk: 6_900, kind: "net" },
    ],
  },
  {
    id: "optimistic",
    label: "Optimistický",
    subtitle: "Silnější nájem",
    steps: [
      { key: "rent", label: "Hrubý nájem", amountCzk: 36_500, kind: "inflow" },
      { key: "mortgage", label: "Splátka", amountCzk: -18_400, kind: "outflow" },
      { key: "opex", label: "Provoz", amountCzk: -3_600, kind: "outflow" },
      { key: "reserve", label: "Rezerva", amountCzk: -1_800, kind: "outflow" },
      { key: "net", label: "Cash flow", amountCzk: 12_700, kind: "net" },
    ],
  },
];

const COLORS = {
  inflow: "#059669",
  outflow: "#dc2626",
  netPos: "#047857",
  netNeg: "#b91c1c",
  grid: "#e5e7eb",
} as const;

function formatCzk(value: number): string {
  return `${Math.round(value).toLocaleString("cs-CZ")}\u00a0Kč`;
}

function formatPct(value: number, digits = 1): string {
  return `${value.toLocaleString("cs-CZ", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}\u00a0%`;
}

type WaterfallBar = {
  name: string;
  base: number;
  rise: number;
  fill: string;
  labelValue: number;
};

function buildWaterfall(steps: CashFlowStep[]): WaterfallBar[] {
  let running = 0;
  const bars: WaterfallBar[] = [];
  for (const step of steps) {
    if (step.kind === "net") {
      bars.push({
        name: step.label,
        base: 0,
        rise: Math.abs(step.amountCzk),
        fill: step.amountCzk >= 0 ? COLORS.netPos : COLORS.netNeg,
        labelValue: step.amountCzk,
      });
      continue;
    }
    if (step.amountCzk >= 0) {
      bars.push({
        name: step.label,
        base: running,
        rise: step.amountCzk,
        fill: COLORS.inflow,
        labelValue: step.amountCzk,
      });
      running += step.amountCzk;
    } else {
      const abs = Math.abs(step.amountCzk);
      running -= abs;
      bars.push({
        name: step.label,
        base: running,
        rise: abs,
        fill: COLORS.outflow,
        labelValue: step.amountCzk,
      });
    }
  }
  return bars;
}

function Panel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/80 bg-white/90 shadow-sm backdrop-blur-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

function KpiCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-[#f7f9f8] px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-heading text-xl font-bold tabular-nums tracking-tight text-text-dark sm:text-2xl">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function ExecutiveKpis() {
  return (
    <Panel className="overflow-hidden">
      <div className="border-b border-border bg-deep-teal px-5 py-3.5 text-white">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-gold">
          Modelová ukázka · DEMO
        </p>
        <p className="mt-0.5 font-heading text-lg font-semibold">
          {DEMO_KPI.address}
        </p>
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard
          label="Čistý výnos"
          value={formatPct(DEMO_KPI.netYieldPct)}
          hint="Model · po provozu a rezervě"
        />
        <KpiCard
          label="Cash flow"
          value={`+${formatCzk(DEMO_KPI.monthlyCashFlowCzk)} / měs.`}
          hint="Základní scénář"
        />
        <KpiCard
          label="ROCE"
          value={formatPct(DEMO_KPI.rocePct)}
          hint="Návratnost vlastního kapitálu (model)"
        />
        <KpiCard
          label="Cena / m²"
          value={formatCzk(DEMO_KPI.pricePerM2Czk)}
          hint="Z kupní ceny a plochy"
        />
        <KpiCard
          label="LTV"
          value={formatPct(DEMO_KPI.ltvPct, 0)}
          hint="Úvěr / kupní cena"
        />
        <KpiCard
          label="Celková investice"
          value={formatCzk(DEMO_KPI.totalInvestmentCzk)}
          hint="Cena + CAPEX + vedlejší"
        />
      </div>
      <p className="border-t border-border px-5 py-3 text-xs text-muted-foreground">
        Stress test sazby +2&nbsp;p.&nbsp;b.:{" "}
        <span className="font-semibold tabular-nums text-text-dark">
          {formatCzk(DEMO_KPI.stressPlus2bpDeltaCzk)} / měs.
        </span>{" "}
        oproti základní splátce — model, ne nabídka banky.
      </p>
    </Panel>
  );
}

function CashFlowModel() {
  const [scenarioId, setScenarioId] = useState<ScenarioId>("base");
  const scenario = SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[1]!;
  const waterfall = useMemo(
    () => buildWaterfall(scenario.steps),
    [scenario.steps]
  );
  const net = scenario.steps.find((s) => s.kind === "net")?.amountCzk ?? 0;
  const tabId = useId();

  return (
    <Panel className="p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-deep-teal">
            Měsíční cash flow
          </p>
          <h3 className="mt-1 font-heading text-lg font-bold text-text-dark">
            Nájem → splátka → provoz → rezerva
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{scenario.subtitle}</p>
        </div>
        <p
          className={cn(
            "rounded-xl px-3 py-1.5 text-sm font-bold tabular-nums",
            net >= 0 ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"
          )}
        >
          {net >= 0 ? "+" : ""}
          {formatCzk(net)}
        </p>
      </div>

      <div
        role="tablist"
        aria-label="Scénáře cash-flow"
        className="mt-4 grid grid-cols-3 gap-1 rounded-xl bg-[#eef2f0] p-1"
      >
        {SCENARIOS.map((s) => {
          const active = s.id === scenarioId;
          return (
            <button
              key={s.id}
              type="button"
              role="tab"
              id={`${tabId}-${s.id}`}
              aria-selected={active}
              className={cn(
                "rounded-lg px-2 py-2.5 text-center text-xs font-semibold transition sm:text-sm",
                active
                  ? "bg-white text-deep-teal shadow-sm"
                  : "text-muted-foreground hover:text-text-dark"
              )}
              onClick={() => setScenarioId(s.id)}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        aria-labelledby={`${tabId}-${scenarioId}`}
        className="mt-5 h-[260px] w-full min-h-0 sm:h-[280px]"
      >
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <BarChart
            data={waterfall}
            margin={{ top: 8, right: 4, left: 0, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} />
            <XAxis
              dataKey="name"
              tick={{ fill: "#6b7280", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval={0}
            />
            <YAxis
              tick={{ fill: "#9ca3af", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) =>
                `${Math.round(v / 1000).toLocaleString("cs-CZ")}k`
              }
              width={36}
            />
            <Tooltip
              cursor={{ fill: "rgba(27,77,62,0.04)" }}
              formatter={(value) => {
                const n = typeof value === "number" ? value : Number(value);
                return Number.isFinite(n) ? formatCzk(n) : "—";
              }}
            />
            <Bar dataKey="base" stackId="wf" fill="transparent" />
            <Bar
              dataKey="rise"
              stackId="wf"
              radius={[6, 6, 0, 0]}
              isAnimationActive
              animationDuration={400}
            >
              {waterfall.map((bar) => (
                <Cell key={bar.name} fill={bar.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}

function PreviewPaywall() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const premiumCfg = useMemo(() => getRentgenPremiumConfig(), []);
  const live = premiumCfg.commerciallyActive;

  async function handleCheckout() {
    if (isLoading) return;
    if (!live) {
      window.location.hash = "premium-objednavka";
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout/rentgen-premium", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ property: MOCK_CHECKOUT_PROPERTY }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Checkout se nepodařilo spustit.");
      }
      window.location.href = data.url;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Nepodařilo se připojit k platební bráně."
      );
      setIsLoading(false);
    }
  }

  return (
    <Panel className="relative overflow-hidden p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-deep-teal">
        Hlubší vrstvy
      </p>
      <h3 className="mt-1 font-heading text-lg font-bold text-text-dark">
        Od náhledu k Rentgenu a kompletní analýze
      </h3>
      <div className="relative mt-4 min-h-[160px]">
        <div
          className="grid gap-3 blur-[2px] sm:grid-cols-2"
          aria-hidden
        >
          {["CAPEX model", "Stress nájmu", "Scénáře 10Y", "Checklist DD"].map(
            (t) => (
              <div
                key={t}
                className="rounded-xl border border-border bg-[#f7f9f8] px-4 py-3 text-sm font-semibold text-text-dark"
              >
                {t}
              </div>
            )
          )}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-md">
          <div className="mx-3 max-w-md rounded-2xl border border-border bg-white/95 p-5 text-center shadow-md">
            <Lock className="mx-auto h-5 w-5 text-deep-teal" aria-hidden />
            <p className="mt-3 text-sm font-semibold text-text-dark">
              {live
                ? `Rentgen ${formatDigitalRentgenPrice()} · kompletní analýza ${formatAnalysisPrice()}`
                : "Placené vrstvy připravujeme"}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Bez investičního verdiktu. Dostanete modelová čísla a předpoklady —
              rozhodnutí je vaše.
            </p>
            <button
              type="button"
              onClick={() => void handleCheckout()}
              disabled={isLoading}
              aria-busy={isLoading}
              className={cn(
                "mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-muted-gold px-5 py-3 text-sm font-bold text-text-dark shadow-sm transition hover:bg-muted-gold-light",
                isLoading && "cursor-wait opacity-80"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Přesměrovávám na platební bránu…
                </>
              ) : (
                `Koupit individuální rozbor – ${formatAnalysisPrice()}`
              )}
            </button>
            {error ? (
              <p className="mt-2 text-sm text-red-700" role="alert">
                {error}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </Panel>
  );
}

export function InvestmentXrayDashboard({
  className,
}: {
  className?: string;
} = {}) {
  return (
    <section
      aria-label="Ukázkový modelový dashboard"
      className={cn(
        "overflow-hidden rounded-[1.5rem] border border-deep-teal/10 bg-[linear-gradient(180deg,#f7f9f8_0%,#eef2f0_100%)] p-3 sm:p-5",
        className
      )}
    >
      <div className="space-y-4">
        <ExecutiveKpis />
        <div className="grid gap-4 xl:grid-cols-2">
          <CashFlowModel />
          <PreviewPaywall />
        </div>
      </div>
    </section>
  );
}
