"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import {
  Activity,
  AlertTriangle,
  Bell,
  ChevronRight,
  HelpCircle,
  Minus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  ClaimBadge,
  ClaimLegend,
} from "@/components/property-rentgen/ClaimBadge";
import { FeatureStatusBadge } from "@/components/majetio/FeatureStatusBadge";
import { DataStatusBadge } from "@/components/trust/DataStatusBadge";
import { useCurrentRates } from "@/lib/rates";
import { routes } from "@/lib/routes";
import {
  MARKET_PULSE_FEATURE_STATUS,
  PULSE_METRIC_LABELS,
  PULSE_TIMEFRAMES,
  PULSE_TIMEFRAME_LABELS,
  SUPPORTED_PULSE_MARKETS,
  buildMarketPulseDashboard,
  getSelectedMarket,
  loadMarketPulseStore,
  saveMarketPulseStore,
  type OpportunityRadarCriteria,
  type PulseMetricCard,
  type PulseTimeframe,
  type PulseTrend,
} from "@/lib/market-pulse";
import type { CountryId } from "@/lib/calculators";
import { countryConfigs } from "@/lib/calculators";

function subscribeNoop() {
  return () => {};
}
function useIsClient() {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}

function TrendIcon({ dir }: { dir: PulseTrend["direction"] }) {
  if (dir === "up") return <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />;
  if (dir === "down") return <TrendingDown className="h-3.5 w-3.5 text-red-600" />;
  return <Minus className="h-3.5 w-3.5 text-stone-500" />;
}

function TrendCell({ trend }: { trend: PulseTrend }) {
  if (!trend.available) {
    return (
      <span className="text-[10px] text-muted-foreground" title={trend.unavailableReason ?? undefined}>
        —
      </span>
    );
  }
  return (
    <div className="flex flex-col items-center gap-0.5">
      <TrendIcon dir={trend.direction} />
      <span className="text-[10px] font-semibold">
        {trend.changePercent != null
          ? `${trend.changePercent > 0 ? "+" : ""}${trend.changePercent.toFixed(1)} %`
          : "—"}
      </span>
      <ClaimBadge kind={trend.claimKind} />
    </div>
  );
}

function MetricRow({
  card,
  timeframe,
}: {
  card: PulseMetricCard;
  timeframe: PulseTimeframe;
}) {
  const [open, setOpen] = useState(false);
  const tfTrend = card.trends.find((t) => t.timeframe === timeframe);

  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <button
        type="button"
        className="flex w-full items-start justify-between gap-2 text-left"
        onClick={() => setOpen(!open)}
      >
        <div>
          <p className="text-xs font-bold uppercase text-muted-foreground">
            {PULSE_METRIC_LABELS[card.kind]}
          </p>
          <p className="font-semibold">{card.currentLabel ?? "Data nejsou k dispozici"}</p>
          {card.reliabilityNote && (
            <p className="mt-1 text-[10px] text-muted-foreground">{card.reliabilityNote}</p>
          )}
        </div>
        <div className="shrink-0 text-right">
          {tfTrend && <TrendCell trend={tfTrend} />}
        </div>
      </button>
      {open && (
        <div className="mt-3 space-y-2 border-t pt-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PULSE_TIMEFRAMES.map((tf) => {
              const t = card.trends.find((x) => x.timeframe === tf);
              return (
                <div key={tf} className="rounded border p-2 text-center">
                  <p className="text-[9px] font-bold uppercase">{tf}</p>
                  {t ? <TrendCell trend={t} /> : "—"}
                </div>
              );
            })}
          </div>
          {card.insights.map((ins) => (
            <p key={ins.id} className="text-xs text-foreground">
              <ClaimBadge kind={ins.claimKind} /> {ins.text}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export function MarketPulseView() {
  const ready = useIsClient();
  const { rates } = useCurrentRates();
  const [store, setStore] = useState<ReturnType<typeof loadMarketPulseStore> | null>(
    null
  );
  const [timeframe, setTimeframe] = useState<PulseTimeframe>("1Y");

  useEffect(() => {
    if (ready) setStore(loadMarketPulseStore());
  }, [ready]);

  const dashboard = useMemo(() => {
    if (!ready || !store) return null;
    return buildMarketPulseDashboard({
      selectedMarket: store.selectedMarket,
      rates,
      opportunityCriteria: store.opportunityCriteria,
    });
  }, [ready, store, rates]);

  const market = dashboard ? getSelectedMarket(dashboard) : null;

  const setMarket = useCallback((id: CountryId) => {
    setStore((prev) => {
      if (!prev) return prev;
      const next = { ...prev, selectedMarket: id };
      saveMarketPulseStore(next);
      return next;
    });
  }, []);

  const setCriteria = useCallback(
    (patch: Partial<OpportunityRadarCriteria>) => {
      setStore((prev) => {
        if (!prev) return prev;
        const next = {
          ...prev,
          opportunityCriteria: { ...prev.opportunityCriteria, ...patch },
        };
        saveMarketPulseStore(next);
        return next;
      });
    },
    []
  );

  if (!ready || !dashboard || !market || !store) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-sm text-muted-foreground">
        Načítám Tržní puls…
      </div>
    );
  }

  const c = store.opportunityCriteria;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eef3f1] to-white">
      <header className="border-b border-border bg-deep-teal text-white">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <FeatureStatusBadge status={MARKET_PULSE_FEATURE_STATUS} />
          <h1 className="mt-2 font-heading text-3xl font-black">Tržní puls</h1>
          <p className="mt-2 max-w-2xl text-sm text-emerald-50/90">
            Aktuální vývoj trhů ze skutečných a modelových dat — bez clickbaitu a
            bez „nejlepšího času koupit“.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-10">
        {/* Market selector */}
        <section className="flex flex-wrap gap-2">
          {SUPPORTED_PULSE_MARKETS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setMarket(id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                store.selectedMarket === id
                  ? "bg-deep-teal text-white"
                  : "border border-border bg-white"
              }`}
            >
              {countryConfigs[id].label}
            </button>
          ))}
        </section>

        <div className="flex items-center gap-2">
          <DataStatusBadge status={market.dataStatus} />
          <span className="text-xs text-muted-foreground">
            Vygenerováno {new Date(dashboard.generatedAt).toLocaleString("cs-CZ")}
          </span>
        </div>

        {/* Timeframe */}
        <section className="flex flex-wrap gap-2">
          {PULSE_TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                timeframe === tf ? "bg-deep-teal text-white" : "border"
              }`}
            >
              {PULSE_TIMEFRAME_LABELS[tf]}
            </button>
          ))}
        </section>

        {/* Top insights */}
        <section className="rounded-2xl border border-border bg-white p-5">
          <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
            <Activity className="h-5 w-5" />
            Klíčové insighty ({PULSE_TIMEFRAME_LABELS[timeframe]})
          </h2>
          <ul className="mt-3 space-y-2">
            {market.topInsights.length === 0 ? (
              <li className="text-sm text-muted-foreground">
                Pro tento trh zatím nemáme dostupné insighty — nevyvozujeme závěry z absence dat.
              </li>
            ) : (
              market.topInsights.map((ins) => (
                <li key={ins.id} className="text-sm">
                  <ClaimBadge kind={ins.claimKind} /> {ins.text}
                </li>
              ))
            )}
          </ul>
        </section>

        {/* Metrics grid */}
        <section className="grid gap-3 md:grid-cols-2">
          {market.metrics.map((card) => (
            <MetricRow key={card.kind} card={card} timeframe={timeframe} />
          ))}
        </section>

        {/* Radar příležitostí */}
        <section className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6">
          <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
            <Bell className="h-5 w-5 text-amber-700" />
            Radar příležitostí
          </h2>
          <p className="mt-1 text-xs text-amber-900/80">
            {dashboard.opportunityRadar.disclaimer}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-xs">
              Min. yield (%)
              <input
                type="number"
                step="0.1"
                value={c.minYieldPercent}
                onChange={(e) =>
                  setCriteria({ minYieldPercent: Number(e.target.value) || 0 })
                }
                className="mt-1 w-full rounded border px-2 py-1"
              />
            </label>
            <label className="text-xs">
              Min. pokles ceny (% — 0 = vypnuto)
              <input
                type="number"
                step="0.1"
                value={c.minPriceDropPercent}
                onChange={(e) =>
                  setCriteria({ minPriceDropPercent: Number(e.target.value) || 0 })
                }
                className="mt-1 w-full rounded border px-2 py-1"
              />
            </label>
            <label className="text-xs">
              Max. riziko trhu (0–100)
              <input
                type="number"
                value={c.maxMarketRiskScore}
                onChange={(e) =>
                  setCriteria({ maxMarketRiskScore: Number(e.target.value) || 100 })
                }
                className="mt-1 w-full rounded border px-2 py-1"
              />
            </label>
            <label className="text-xs">
              Max. hotovost (Kč)
              <input
                type="number"
                step="100000"
                value={c.maxCashRequiredCzk}
                onChange={(e) =>
                  setCriteria({ maxCashRequiredCzk: Number(e.target.value) || 0 })
                }
                className="mt-1 w-full rounded border px-2 py-1"
              />
            </label>
          </div>
          <div className="mt-4 space-y-2">
            {dashboard.opportunityRadar.alerts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Žádný trh nesplňuje všechna aktivní kritéria — to není signál „nic nekupovat“, jen absence shody s filtrem.
              </p>
            ) : (
              dashboard.opportunityRadar.alerts.map((a) => (
                <div
                  key={a.id}
                  className="rounded-xl border border-amber-300 bg-white p-4 text-sm"
                >
                  <p className="font-bold">{a.headline}</p>
                  <p className="mt-1">{a.body}</p>
                  <ul className="mt-2 list-inside list-disc text-xs text-muted-foreground">
                    {a.matchedCriteria.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                  <ClaimBadge kind={a.claimKind} />
                </div>
              ))
            )}
          </div>
        </section>

        {/* Regulatory changelog */}
        <section className="rounded-2xl border border-border bg-white p-6">
          <h2 className="font-heading text-lg font-bold">Regulační přehled změn</h2>
          <div className="mt-4 space-y-3">
            {dashboard.regulatoryChangelog.map((entry) => (
              <article
                key={entry.id}
                className="border-l-2 border-deep-teal pl-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground">
                    {entry.effectiveDate}
                  </span>
                  <DataStatusBadge status={entry.status} />
                  <ClaimBadge kind={entry.claimKind} />
                </div>
                <h3 className="font-semibold">{entry.title}</h3>
                <p className="text-sm text-muted-foreground">{entry.summary}</p>
                <p className="text-xs text-muted-foreground">Zdroj: {entry.source}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-muted/30 p-5">
          <h3 className="mb-2 flex items-center gap-2 font-heading font-bold">
            <HelpCircle className="h-4 w-4" />
            Metodika
          </h3>
          <ul className="space-y-1">
            {dashboard.methodology.map((m) => (
              <li key={m} className="text-xs text-muted-foreground">
                · {m}
              </li>
            ))}
          </ul>
          <ClaimLegend />
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href={routes.dueDiligence} className="text-sm text-deep-teal underline">
              Due Diligence →
            </Link>
            <Link href={routes.metodika} className="text-sm text-deep-teal underline">
              Metodika →
            </Link>
          </div>
        </section>

        <section className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-900">
          <AlertTriangle className="mb-1 inline h-4 w-4" />
          Nepoužíváme formulace typu „Teď je nejlepší čas koupit“. Každý insight odkazuje na
          zdroj a typ tvrzení (Data / Modelový výpočet / Neověřeno).
        </section>
      </main>
    </div>
  );
}
