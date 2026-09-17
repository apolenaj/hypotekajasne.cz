"use client";

import { useId, useMemo, useState, type ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Building2,
  Droplets,
  Hammer,
  Loader2,
  Lock,
  Scale,
  Sparkles,
  TrendingUp,
  TriangleAlert,
} from "lucide-react";
import { formatAnalysisPrice } from "@/lib/property-rentgen/pricing";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/* Mock data — replace with live report payload later                         */
/* -------------------------------------------------------------------------- */

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

const INVESTMENT_SCORE = 84;

const EXECUTIVE = {
  address: "Praha 7 · Holešovice · 68 m²",
  verdict:
    "Buy & Hold — lokalita drží likviditu, páka zlepšuje ROCE a čistý výnos po CAPEX zůstává nad konzervativním prahem 4 %.",
  strategy: "Buy & Hold",
  dealPriceCzk: 7_840_000,
  netYieldPct: 4.6,
  rocePct: 11.2,
} as const;

/** Mock property payload sent to Stripe Checkout (matches rentgen math engine). */
export const MOCK_CHECKOUT_PROPERTY = {
  address: EXECUTIVE.address,
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
  label: EXECUTIVE.address,
} as const;

const SCENARIOS: ScenarioBundle[] = [
  {
    id: "conservative",
    label: "Konzervativní",
    subtitle: "Nižší nájem · vyšší rezervy",
    steps: [
      { key: "rent", label: "Hrubý nájem", amountCzk: 28_500, kind: "inflow" },
      { key: "mortgage", label: "Splátka hypotéky", amountCzk: -19_200, kind: "outflow" },
      { key: "opex", label: "Fond oprav / provoz", amountCzk: -4_800, kind: "outflow" },
      { key: "reserve", label: "Rezerva", amountCzk: -3_200, kind: "outflow" },
      { key: "net", label: "Čisté cash-flow", amountCzk: 1_300, kind: "net" },
    ],
  },
  {
    id: "base",
    label: "Střední",
    subtitle: "Základní model trhu",
    steps: [
      { key: "rent", label: "Hrubý nájem", amountCzk: 32_000, kind: "inflow" },
      { key: "mortgage", label: "Splátka hypotéky", amountCzk: -18_400, kind: "outflow" },
      { key: "opex", label: "Fond oprav / provoz", amountCzk: -4_200, kind: "outflow" },
      { key: "reserve", label: "Rezerva", amountCzk: -2_500, kind: "outflow" },
      { key: "net", label: "Čisté cash-flow", amountCzk: 6_900, kind: "net" },
    ],
  },
  {
    id: "optimistic",
    label: "Optimistický",
    subtitle: "Silný nájem · nízká neobsazenost",
    steps: [
      { key: "rent", label: "Hrubý nájem", amountCzk: 36_500, kind: "inflow" },
      { key: "mortgage", label: "Splátka hypotéky", amountCzk: -18_400, kind: "outflow" },
      { key: "opex", label: "Fond oprav / provoz", amountCzk: -3_600, kind: "outflow" },
      { key: "reserve", label: "Rezerva", amountCzk: -1_800, kind: "outflow" },
      { key: "net", label: "Čisté cash-flow", amountCzk: 12_700, kind: "net" },
    ],
  },
];

const RISK_WIDGETS = [
  {
    id: "legal",
    title: "Právní stav (Katastr)",
    icon: Scale,
    headline: "List vlastnictví bez zástav",
    detail: "LV čistý · žádná exekuce · OV 1/1",
    tone: "good" as const,
  },
  {
    id: "liquidity",
    title: "Likvidita lokality",
    icon: Droplets,
    headline: "Prodejnost ~4–6 měsíců",
    detail: "Holešovice: silná poptávka 2+kk",
    tone: "good" as const,
  },
  {
    id: "capex",
    title: "Skrytý CAPEX",
    icon: Hammer,
    headline: "Rekonstrukce odhad 420 tis. Kč",
    detail: "Kuchyně + koupelna · jádro 80. léta",
    tone: "warn" as const,
  },
  {
    id: "stress",
    title: "Stress test sazby",
    icon: TriangleAlert,
    headline: "+2 p.b. → CF −4 100 Kč",
    detail: "Stále kladné ve středním scénáři",
    tone: "warn" as const,
  },
] as const;

const COLORS = {
  teal: "#1b4d3e",
  tealSoft: "#2a6b58",
  gold: "#c5a059",
  inflow: "#059669",
  outflow: "#dc2626",
  netPos: "#047857",
  netNeg: "#b91c1c",
  property: "#1b4d3e",
  etf: "#c5a059",
  muted: "#9ca3af",
  grid: "#e5e7eb",
} as const;

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatCzk(value: number): string {
  return `${Math.round(value).toLocaleString("cs-CZ")}\u00a0Kč`;
}

function formatPct(value: number, digits = 1): string {
  return `${value.toLocaleString("cs-CZ", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}\u00a0%`;
}

function scoreTone(score: number): {
  label: string;
  ring: string;
  text: string;
  fill: string;
} {
  if (score >= 80) {
    return {
      label: "Silný deal",
      ring: "stroke-emerald-600",
      text: "text-emerald-800",
      fill: COLORS.inflow,
    };
  }
  if (score >= 60) {
    return {
      label: "Vyvážený",
      ring: "stroke-amber-500",
      text: "text-amber-800",
      fill: COLORS.gold,
    };
  }
  return {
    label: "Opatrně",
    ring: "stroke-red-500",
    text: "text-red-800",
    fill: COLORS.outflow,
  };
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

type CapitalPoint = {
  year: number;
  label: string;
  propertyEquity: number;
  sp500: number;
};

/** Past 5Y → future 10Y equity vs S&P 500 at 8 % p.a. (mock). */
function buildCapitalSeries(): CapitalPoint[] {
  const equity0 = 1_560_000;
  const points: CapitalPoint[] = [];
  for (let y = -5; y <= 10; y += 1) {
    const propertyGrowth = Math.pow(1.055, y);
    const leverageBoost = y >= 0 ? 1 + y * 0.035 : 1 + y * 0.02;
    const propertyEquity = Math.round(equity0 * propertyGrowth * leverageBoost);
    const sp500 = Math.round(equity0 * Math.pow(1.08, y));
    points.push({
      year: y,
      label: y === 0 ? "Teď" : y > 0 ? `+${y}r` : `${y}r`,
      propertyEquity,
      sp500,
    });
  }
  return points;
}

/* -------------------------------------------------------------------------- */
/* Shell primitives                                                           */
/* -------------------------------------------------------------------------- */

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
        "rounded-2xl border border-white/60 bg-white/80 shadow-md backdrop-blur-md",
        className
      )}
    >
      {children}
    </div>
  );
}

function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
      {children}
    </p>
  );
}

function ChartTooltipShell({
  active,
  payload,
  label,
  valueFormatter,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string }>;
  label?: string;
  valueFormatter: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-white/95 px-3 py-2 text-xs shadow-md backdrop-blur">
      {label ? (
        <p className="mb-1 font-semibold text-text-dark">{label}</p>
      ) : null}
      <ul className="space-y-0.5">
        {payload.map((item) => (
          <li
            key={String(item.name)}
            className="flex items-center gap-2 tabular-nums text-muted-foreground"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: item.color ?? COLORS.teal }}
            />
            <span>{item.name}</span>
            <span className="ml-auto font-semibold text-text-dark">
              {typeof item.value === "number"
                ? valueFormatter(item.value)
                : "—"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 1) Executive Summary                                                       */
/* -------------------------------------------------------------------------- */

function ScoreGauge({ score }: { score: number }) {
  const tone = scoreTone(score);
  const clamped = Math.max(0, Math.min(100, score));
  const data = [
    { name: "score", value: clamped },
    { name: "rest", value: 100 - clamped },
  ];

  return (
    <div className="relative mx-auto h-44 w-44">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            startAngle={210}
            endAngle={-30}
            innerRadius={58}
            outerRadius={78}
            stroke="none"
            paddingAngle={0}
            isAnimationActive
          >
            <Cell fill={tone.fill} />
            <Cell fill="#e8ece9" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Investiční skóre
        </p>
        <p className="font-heading text-3xl font-bold tabular-nums text-text-dark">
          {score}
          <span className="text-base font-semibold text-muted-foreground">
            /100
          </span>
        </p>
        <p className={cn("mt-0.5 text-xs font-semibold", tone.text)}>
          {tone.label}
        </p>
      </div>
    </div>
  );
}

function QuickFactCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-xl border border-border/80 bg-gradient-to-br from-white to-[#f7f9f8] px-4 py-3 shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-heading text-xl font-bold tabular-nums tracking-tight text-text-dark">
        {value}
      </p>
      <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{hint}</p>
    </div>
  );
}

function ExecutiveSummary() {
  return (
    <Panel className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 bg-deep-teal px-5 py-3.5 text-white">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-gold">
            Investiční rentgen · Executive terminal
          </p>
          <p className="mt-0.5 font-heading text-lg font-semibold tracking-tight">
            {EXECUTIVE.address}
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90 ring-1 ring-white/15">
          <Sparkles className="h-3.5 w-3.5 text-muted-gold" aria-hidden />
          DEMO model · ne nabídka banky
        </div>
      </div>

      <div className="grid gap-5 p-5 lg:grid-cols-[220px_minmax(0,1.2fr)_minmax(0,1fr)] lg:items-center">
        <ScoreGauge score={INVESTMENT_SCORE} />

        <div className="min-w-0 rounded-2xl border border-deep-teal/10 bg-deep-teal/[0.04] p-4">
          <SectionEyebrow>AI strategický verdikt</SectionEyebrow>
          <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-muted-gold/20 px-2.5 py-0.5 text-xs font-bold text-deep-teal">
            <TrendingUp className="h-3.5 w-3.5" aria-hidden />
            {EXECUTIVE.strategy}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-text-dark">
            {EXECUTIVE.verdict}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          <QuickFactCard
            label="Skutečná cena dealu"
            value={formatCzk(EXECUTIVE.dealPriceCzk)}
            hint="Kupní cena + CAPEX + vedlejší náklady"
          />
          <QuickFactCard
            label="Čistý výnos (Net Yield)"
            value={formatPct(EXECUTIVE.netYieldPct)}
            hint="Po provozu, rezervě a modelu daně"
          />
          <QuickFactCard
            label="ROCE"
            value={formatPct(EXECUTIVE.rocePct)}
            hint="Návratnost vlastního kapitálu s pákou"
          />
        </div>
      </div>
    </Panel>
  );
}

/* -------------------------------------------------------------------------- */
/* 2) Cash-flow waterfall                                                     */
/* -------------------------------------------------------------------------- */

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
          <SectionEyebrow>Dynamický model cash-flow</SectionEyebrow>
          <h3 className="mt-1 font-heading text-xl font-bold text-text-dark">
            Měsíční vodopád
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{scenario.subtitle}</p>
        </div>
        <p
          className={cn(
            "rounded-xl px-3 py-1.5 text-sm font-bold tabular-nums",
            net >= 0
              ? "bg-emerald-50 text-emerald-800"
              : "bg-red-50 text-red-800"
          )}
        >
          Čisté CF {net >= 0 ? "+" : ""}
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
        className="mt-5 h-[300px] w-full min-h-0"
      >
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <BarChart
            data={waterfall}
            margin={{ top: 12, right: 8, left: 0, bottom: 8 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={COLORS.grid}
            />
            <XAxis
              dataKey="name"
              tick={{ fill: "#6b7280", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval={0}
              height={48}
              tickFormatter={(v: string) =>
                v.length > 14 ? `${v.slice(0, 12)}…` : v
              }
            />
            <YAxis
              tick={{ fill: "#9ca3af", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) =>
                `${Math.round(v / 1000).toLocaleString("cs-CZ")}k`
              }
              width={42}
            />
            <Tooltip
              cursor={{ fill: "rgba(27,77,62,0.04)" }}
              content={({ active, payload, label }) => (
                <ChartTooltipShell
                  active={active}
                  label={String(label ?? "")}
                  payload={
                    payload?.map((p) => ({
                      name: "Částka",
                      value: (p.payload as WaterfallBar | undefined)?.labelValue,
                      color: (p.payload as WaterfallBar | undefined)?.fill,
                    })) ?? []
                  }
                  valueFormatter={(v) =>
                    `${v >= 0 ? "+" : ""}${formatCzk(v)}`
                  }
                />
              )}
            />
            <Bar dataKey="base" stackId="wf" fill="transparent" legendType="none" />
            <Bar
              dataKey="rise"
              stackId="wf"
              radius={[6, 6, 0, 0]}
              isAnimationActive
              animationDuration={450}
            >
              {waterfall.map((bar) => (
                <Cell key={bar.name} fill={bar.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <ul className="mt-2 flex flex-wrap gap-4 text-[11px] text-muted-foreground">
        <li className="inline-flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-sm"
            style={{ background: COLORS.inflow }}
          />
          Příjem
        </li>
        <li className="inline-flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-sm"
            style={{ background: COLORS.outflow }}
          />
          Náklad
        </li>
        <li className="inline-flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-sm"
            style={{ background: COLORS.netPos }}
          />
          Výsledek
        </li>
      </ul>
    </Panel>
  );
}

/* -------------------------------------------------------------------------- */
/* 3) Capital path vs S&P 500                                                 */
/* -------------------------------------------------------------------------- */

function CapitalOpportunityChart() {
  const series = useMemo(() => buildCapitalSeries(), []);

  return (
    <Panel className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <SectionEyebrow>Budoucnost vs. historie</SectionEyebrow>
          <h3 className="mt-1 font-heading text-xl font-bold text-text-dark">
            Kapitál s pákou vs. S&amp;P 500 ETF
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Minulých 5 let a horizont 10 let. ETF křivka = konstantních 8&nbsp;%
            p.a. na stejný vlastní kapitál — ilustrativní alternativa nákladů
            kapitálu, ne predikce trhu.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-deep-teal/10 px-2.5 py-1 font-semibold text-deep-teal">
            <Building2 className="h-3.5 w-3.5" aria-hidden />
            Nemovitost + páka
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted-gold/20 px-2.5 py-1 font-semibold text-[#8a6d2f]">
            S&amp;P 500 · 8 % p.a.
          </span>
        </div>
      </div>

      <div className="mt-5 h-[320px] w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <AreaChart
            data={series}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="xrayPropertyFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.property} stopOpacity={0.35} />
                <stop offset="100%" stopColor={COLORS.property} stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="xrayEtfFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.etf} stopOpacity={0.35} />
                <stop offset="100%" stopColor={COLORS.etf} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
            <XAxis
              dataKey="label"
              tick={{ fill: "#6b7280", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fill: "#9ca3af", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) =>
                `${Math.round(v / 1_000_000).toLocaleString("cs-CZ")}M`
              }
              width={40}
            />
            <Tooltip
              content={({ active, payload, label }) => (
                <ChartTooltipShell
                  active={active}
                  label={String(label ?? "")}
                  payload={
                    payload?.map((p) => ({
                      name:
                        p.dataKey === "propertyEquity"
                          ? "Nemovitost (equity)"
                          : "S&P 500 ETF",
                      value: typeof p.value === "number" ? p.value : undefined,
                      color: String(p.color ?? COLORS.teal),
                    })) ?? []
                  }
                  valueFormatter={formatCzk}
                />
              )}
            />
            <Area
              type="monotone"
              dataKey="sp500"
              name="S&P 500 ETF"
              stroke={COLORS.etf}
              fill="url(#xrayEtfFill)"
              strokeWidth={2}
              isAnimationActive
            />
            <Area
              type="monotone"
              dataKey="propertyEquity"
              name="Nemovitost (equity)"
              stroke={COLORS.property}
              fill="url(#xrayPropertyFill)"
              strokeWidth={2.25}
              isAnimationActive
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}

/* -------------------------------------------------------------------------- */
/* 4) Risk radar + paywall                                                    */
/* -------------------------------------------------------------------------- */

function RiskPaywallSection() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout/rentgen-premium", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          property: MOCK_CHECKOUT_PROPERTY,
        }),
      });

      const data = (await res.json()) as { url?: string; error?: string };

      if (!res.ok || !data.url) {
        throw new Error(
          data.error || "Checkout se nepodařilo spustit. Zkuste to prosím znovu."
        );
      }

      window.location.href = data.url;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Nepodařilo se připojit k platební bráně.";
      setError(message);
      setIsLoading(false);
    }
  }

  return (
    <Panel className="relative overflow-hidden p-5">
      <div className="mb-4">
        <SectionEyebrow>Risk radar &amp; due diligence</SectionEyebrow>
        <h3 className="mt-1 font-heading text-xl font-bold text-text-dark">
          Kompletní rizika pod zámkem
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Čtyři kritické vrstvy analýzy — náhled rozmazán do odemčení prémiového
          reportu.
        </p>
      </div>

      <div className="relative min-h-[280px]">
        <div
          className="grid gap-3 blur-sm sm:grid-cols-2 lg:grid-cols-4"
          aria-hidden
        >
          {RISK_WIDGETS.map((w) => {
            const Icon = w.icon;
            return (
              <div
                key={w.id}
                className="rounded-xl border border-border bg-[#f7f9f8] p-4 shadow-sm"
              >
                <div className="flex items-center gap-2 text-deep-teal">
                  <Icon className="h-4 w-4" />
                  <p className="text-[11px] font-semibold uppercase tracking-wide">
                    {w.title}
                  </p>
                </div>
                <p className="mt-3 text-sm font-bold text-text-dark">
                  {w.headline}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{w.detail}</p>
                <p
                  className={cn(
                    "mt-3 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                    w.tone === "good"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-900"
                  )}
                >
                  {w.tone === "good" ? "OK" : "Sledovat"}
                </p>
              </div>
            );
          })}
        </div>

        <div className="absolute inset-0 flex items-center justify-center bg-white/55 backdrop-blur-md">
          <div className="mx-4 max-w-lg rounded-2xl border border-deep-teal/15 bg-white/90 p-6 text-center shadow-lg backdrop-blur-md">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-deep-teal text-muted-gold shadow-md">
              <Lock className="h-5 w-5" aria-hidden />
            </div>
            <p className="mt-4 font-heading text-lg font-bold text-text-dark sm:text-xl">
              Odemknout detailní analýzu za {formatAnalysisPrice()}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Získáte plný risk radar, CAPEX scénáře, stress test sazby a
              checklist due diligence v elektronickém reportu.
            </p>
            <button
              type="button"
              onClick={() => void handleCheckout()}
              disabled={isLoading}
              aria-busy={isLoading}
              className={cn(
                "mt-5 inline-flex w-full max-w-md items-center justify-center gap-2 rounded-xl bg-muted-gold px-5 py-3 text-sm font-bold text-text-dark shadow-md transition hover:bg-muted-gold-light sm:w-auto",
                isLoading && "cursor-wait opacity-80"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Přesměrovávám na platební bránu…
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" aria-hidden />
                  Odemknout detailní analýzu za {formatAnalysisPrice()}
                </>
              )}
            </button>
            {error ? (
              <p
                className="mt-3 text-sm text-red-700"
                role="alert"
              >
                {error}
              </p>
            ) : null}
            <p className="mt-3 text-[11px] text-muted-foreground">
              Modelový výstup Hypotéka Jasně — ne právní posudek ani schválení
              banky.
            </p>
          </div>
        </div>
      </div>
    </Panel>
  );
}

/* -------------------------------------------------------------------------- */
/* Public dashboard                                                           */
/* -------------------------------------------------------------------------- */

export function InvestmentXrayDashboard({
  className,
}: {
  className?: string;
} = {}) {
  return (
    <section
      aria-labelledby="investment-xray-dashboard-title"
      className={cn(
        "relative overflow-hidden rounded-[1.75rem] border border-deep-teal/10 bg-[radial-gradient(1200px_600px_at_10%_-10%,rgba(197,160,89,0.14),transparent_55%),radial-gradient(900px_500px_at_90%_0%,rgba(27,77,62,0.12),transparent_50%),linear-gradient(180deg,#f4f7f6_0%,#eef2f0_100%)] p-4 sm:p-6 lg:p-8",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-muted-gold/60 to-transparent" />

      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-gold">
            Analytic terminal
          </p>
          <h2
            id="investment-xray-dashboard-title"
            className="mt-1 font-heading text-2xl font-bold tracking-tight text-text-dark sm:text-3xl"
          >
            Investiční rentgen — dashboard
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Prémiový náhled reportu na mock datech. Skóre, cash-flow scénáře,
            alternativní náklady kapitálu a risk vrstva s paywallem.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <ExecutiveSummary />
        <div className="grid gap-5 xl:grid-cols-2">
          <CashFlowModel />
          <CapitalOpportunityChart />
        </div>
        <RiskPaywallSection />
      </div>
    </section>
  );
}
