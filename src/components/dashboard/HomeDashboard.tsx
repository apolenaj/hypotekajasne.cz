"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  BarChart3,
  Bell,
  BookOpen,
  FileText,
  LayoutDashboard,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Minus,
  Wallet,
} from "lucide-react";
import {
  buildDashboardModel,
  loadWatchlist,
  setHomeMode,
  type DashboardModel,
  type DashboardWidgetId,
} from "@/lib/dashboard";
import { NextBestActionPanel } from "@/components/dashboard/NextBestActionPanel";
import {
  buildFinancialPassportDocument,
  loadFinancialProfile,
  loadPassportTimeline,
} from "@/lib/financial-passport";
import {
  listWatchAlerts,
  runWatchlistEvaluation,
} from "@/lib/watchlist";
import { useCurrentRates } from "@/lib/rates";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

function fmt(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    maximumFractionDigits: 0,
  }).format(n);
}

function subscribeNoop() {
  return () => {};
}

function useIsClient() {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );
}

function Card({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-white p-5 shadow-sm",
        className
      )}
    >
      <h2 className="font-heading text-base font-bold text-text-dark">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function WidgetSlot({
  id,
  model,
  onNbaFeedback,
}: {
  id: DashboardWidgetId;
  model: DashboardModel;
  onNbaFeedback?: () => void;
}) {
  switch (id) {
    case "next_best_action":
      return (
        <NextBestActionPanel
          recommendations={model.recommendations}
          onUserFeedback={onNbaFeedback}
        />
      );

    case "onboarding_progress":
      return (
        <Card title="Jak začít">
          <ol className="list-decimal space-y-2 pl-5 text-sm">
            <li>
              <Link href={routes.navrhNaMiru} className="font-semibold text-deep-teal underline">
                Hypoteční připravenost
              </Link>{" "}
              — uloží lokální profil
            </li>
            <li>
              <Link href={routes.financniPas} className="font-semibold text-deep-teal underline">
                Financial Passport
              </Link>{" "}
              — dimenze a simulace
            </li>
            <li>Vraťte se sem — dashboard se přizpůsobí</li>
          </ol>
        </Card>
      );

    case "financial_readiness":
      if (!model.readiness) return null;
      return (
        <Card title="Financial readiness">
          <div className="flex flex-wrap items-end gap-4">
            <p className="font-heading text-4xl font-black tabular-nums text-deep-teal">
              {model.readiness.score}
              <span className="text-lg text-muted-foreground">/100</span>
            </p>
            <div className="flex items-center gap-1 text-sm font-semibold">
              {model.readiness.trend === "up" ? (
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              ) : model.readiness.trend === "down" ? (
                <TrendingDown className="h-4 w-4 text-amber-700" />
              ) : (
                <Minus className="h-4 w-4 text-muted-foreground" />
              )}
              {model.readiness.previousScore != null ? (
                <span>
                  {model.readiness.previousScore} → {model.readiness.score}
                </span>
              ) : (
                <span className="text-muted-foreground">nový profil</span>
              )}
            </div>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Hlavní změna: {model.readiness.mainChange}
          </p>
          <Link
            href={model.readiness.href}
            className="mt-3 inline-block text-sm font-semibold text-deep-teal underline"
          >
            Otevřít Financial Passport
          </Link>
        </Card>
      );

    case "safe_buying_power":
      if (!model.buyingPower) return null;
      return (
        <Card title="Safe buying power">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Max</p>
              <p className="mt-1 text-sm font-bold tabular-nums">{fmt(model.buyingPower.max)}</p>
            </div>
            <div className="rounded-xl bg-deep-teal/10 p-3">
              <p className="text-[10px] font-bold uppercase text-deep-teal">Recommended</p>
              <p className="mt-1 text-sm font-bold tabular-nums">{fmt(model.buyingPower.recommended)}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Safe</p>
              <p className="mt-1 text-sm font-bold tabular-nums">{fmt(model.buyingPower.safe)}</p>
            </div>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">{model.buyingPower.claimNote}</p>
        </Card>
      );

    case "mortgage_market":
      if (model.marketRates.length === 0) return null;
      return (
        <Card title="Hypoteční trh (váš profil)">
          <ul className="space-y-3">
            {model.marketRates.map((r) => (
              <li key={r.id} className="border-b border-border/60 pb-2 last:border-0">
                <div className="flex justify-between gap-2 text-sm">
                  <span className="font-medium">{r.label}</span>
                  <span className="tabular-nums font-bold">
                    {r.ratePercent != null ? `${r.ratePercent.toFixed(2)} %` : "Na vyžádání"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{r.relevanceNote}</p>
                <span className="text-[10px] font-bold uppercase text-deep-teal">
                  {r.claimKind}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      );

    case "saved_properties":
      return (
        <Card title="Uložené nemovitosti">
          {model.properties.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Zatím žádné. Přidejte je v{" "}
              <Link href={routes.copilot} className="underline">
                Copilotu
              </Link>
              .
            </p>
          ) : (
            <ul className="space-y-3">
              {model.properties.slice(0, 4).map((p) => (
                <li key={p.item.id} className="text-sm">
                  <div className="flex justify-between gap-2 font-semibold">
                    <span>{p.item.label}</span>
                    <span className="tabular-nums">{fmt(p.currentValue)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Fit: {p.statusLabel}
                    {p.investmentScore != null
                      ? ` · invest. skóre ${p.investmentScore}/100 (MODEL)`
                      : ""}
                    {p.priceChangePct != null
                      ? ` · změna ${p.priceChangePct > 0 ? "+" : ""}${p.priceChangePct} %`
                      : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      );

    case "watchlist_alerts":
      return (
        <Card title="Watchlist alerts">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-muted-gold">
              <Bell className="h-4 w-4" />
              <span className="text-xs font-bold uppercase">Upozornění</span>
            </div>
            <Link
              href={routes.sledovani}
              className="text-xs font-semibold text-deep-teal underline"
            >
              Smart Watchlist
            </Link>
          </div>
          {model.alerts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Žádná aktivní upozornění.{" "}
              <Link href={routes.sledovani} className="underline">
                Přidejte sledování
              </Link>
              .
            </p>
          ) : (
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {model.alerts.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          )}
        </Card>
      );

    case "portfolio_snapshot":
      if (!model.portfolio) return null;
      return (
        <Card title="Portfolio snapshot">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Nemovitosti</p>
              <p className="text-lg font-bold">{model.portfolio.propertyCount}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Sledovaná hodnota</p>
              <p className="text-lg font-bold tabular-nums">
                {fmt(model.portfolio.totalWatchValue)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">V rozpočtu</p>
              <p className="font-bold">{model.portfolio.inBudgetCount}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Nad stropem</p>
              <p className="font-bold">{model.portfolio.overBudgetCount}</p>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            MODEL — watchlist, ne portfolio vlastnictví.
          </p>
        </Card>
      );

    case "majetio_matches":
      if (!model.majetio) return null;
      return (
        <Card title="Majetio matches">
          <p className="text-sm text-muted-foreground">{model.majetio.summary}</p>
          <a
            href={model.majetio.discoveryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 rounded-full border-2 border-deep-teal px-4 py-2 text-sm font-bold text-deep-teal"
          >
            Otevřít discovery
            <Wallet className="h-4 w-4" />
          </a>
        </Card>
      );

    case "document_status":
      return (
        <Card title="Document status">
          <ul className="space-y-2 text-sm">
            {model.documents.map((d) => (
              <li key={d.id} className="flex items-center gap-2">
                <FileText
                  className={cn(
                    "h-4 w-4",
                    d.done ? "text-emerald-600" : "text-muted-foreground"
                  )}
                />
                <span className={d.done ? "text-muted-foreground line-through" : ""}>
                  {d.label}
                </span>
              </li>
            ))}
          </ul>
          <Link
            href={routes.documentVault}
            className="mt-3 inline-block text-xs font-semibold text-deep-teal underline"
          >
            Otevřít Document Vault →
          </Link>
        </Card>
      );

    case "education":
      return (
        <Card title="Education">
          <div className="mb-2 flex items-center gap-2 text-deep-teal">
            <BookOpen className="h-4 w-4" />
            <span className="text-xs font-bold uppercase">Doporučené lekce</span>
          </div>
          <ul className="space-y-3">
            {model.education.map((e) => (
              <li key={e.slug}>
                <Link href={e.href} className="font-semibold text-deep-teal underline">
                  {e.title}
                </Link>
                <p className="text-xs text-muted-foreground">{e.reason}</p>
              </li>
            ))}
          </ul>
        </Card>
      );

    default:
      return null;
  }
}

export function HomeDashboard({
  onShowMarketing,
}: {
  onShowMarketing?: () => void;
}) {
  const ready = useIsClient();
  const { rates } = useCurrentRates();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!ready) return;
    const profile = loadFinancialProfile();
    const rate =
      rates?.rateWithInsurance ?? rates?.rateWithoutInsurance ?? null;
    const doc = profile
      ? buildFinancialPassportDocument(profile, rate ?? 5)
      : null;
    const result = runWatchlistEvaluation({
      currentRatePercent: rate,
      doc,
    });
    if (result.accepted.length > 0) setTick((t) => t + 1);
  }, [ready, rates]);

  const model = useMemo(() => {
    if (!ready) return null;
    void tick;
    const profile = loadFinancialProfile();
    const doc = profile
      ? buildFinancialPassportDocument(
          profile,
          rates?.rateWithInsurance ?? rates?.rateWithoutInsurance ?? 5
        )
      : null;
    return buildDashboardModel({
      doc,
      profile,
      timeline: loadPassportTimeline(),
      watchlist: loadWatchlist(),
      rates: rates ?? null,
      smartAlertTitles: listWatchAlerts().map((a) => a.title),
    });
  }, [ready, rates, tick]);

  if (!ready || !model) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-sm text-muted-foreground">
        Načítám váš dashboard…
      </div>
    );
  }

  const personaLabel =
    model.persona === "onboarding"
      ? "Onboarding"
      : model.persona === "investor"
        ? "Investor"
        : model.persona === "refinance"
          ? "Refinancování"
          : "Kupující";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e8f0ed] via-white to-[#f7f5ef]">
      <header className="border-b border-border bg-deep-teal text-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-end justify-between gap-4 px-4 py-8">
          <div>
            <div className="flex items-center gap-2 text-muted-gold">
              <LayoutDashboard className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-widest">
                Můj dashboard · {personaLabel}
              </span>
            </div>
            <h1 className="mt-2 font-heading text-3xl font-black md:text-4xl">
              Vaše finančně-realitní situace
            </h1>
            <p className="mt-2 max-w-xl text-sm text-emerald-50/90">
              Progressive personalization — zobrazujeme jen relevantní bloky (
              {model.visibleWidgets.length}), ne 30 widgetů.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={routes.sledovani}
              className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-2 text-xs font-semibold"
            >
              <Bell className="h-3.5 w-3.5" />
              Watchlist
            </Link>
            <Link
              href={routes.portfolio}
              className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-2 text-xs font-semibold"
            >
              <BarChart3 className="h-3.5 w-3.5" />
              Portfolio OS
            </Link>
            <Link
              href={routes.copilot}
              className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-2 text-xs font-semibold"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Copilot
            </Link>
            <button
              type="button"
              onClick={() => {
                setHomeMode("marketing");
                onShowMarketing?.();
                setTick((t) => t + 1);
              }}
              className="rounded-full border border-white/30 px-3 py-2 text-xs font-semibold"
            >
              Marketingová homepage
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-4 px-4 py-8 md:grid-cols-2">
        {model.visibleWidgets.map((w) => (
          <div
            key={w.id}
            className={cn(
              w.id === "next_best_action" || w.id === "financial_readiness"
                ? "md:col-span-2"
                : ""
            )}
          >
            <WidgetSlot
              id={w.id}
              model={model}
              onNbaFeedback={() => setTick((t) => t + 1)}
            />
            <p className="mt-1 px-1 text-[10px] text-muted-foreground">
              Relevance {w.relevance} · {w.reason}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
