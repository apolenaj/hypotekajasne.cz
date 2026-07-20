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
import { PRODUCT_NAMES_CS } from "@/lib/i18n/ui-cs";
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

function EmptyState({
  message,
  ctaHref,
  ctaLabel,
}: {
  message: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-[#f7f8f7] p-4">
      <p className="text-sm text-muted-foreground">{message}</p>
      <Link
        href={ctaHref}
        className="mt-3 inline-flex h-10 items-center justify-center rounded-lg bg-deep-teal px-4 text-sm font-semibold text-white hover:bg-deep-teal-light"
      >
        {ctaLabel}
      </Link>
    </div>
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

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e8f0ed] via-white to-[#f7f5ef]">
      <div className="border-b border-border bg-deep-teal">
        <div className="mx-auto max-w-5xl space-y-3 px-4 py-8">
          <div className="h-3 w-40 animate-pulse rounded bg-white/20" />
          <div className="h-8 w-64 max-w-full animate-pulse rounded bg-white/25" />
          <div className="h-4 w-full max-w-md animate-pulse rounded bg-white/15" />
        </div>
      </div>
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 px-4 py-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-white p-5 shadow-sm"
          >
            <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
            <div className="mt-4 space-y-2">
              <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
              <div className="h-3 w-5/6 animate-pulse rounded bg-slate-100" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
      <p className="sr-only">Načítám váš přehled</p>
    </div>
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
              <Link
                href={routes.navrhNaMiru}
                className="font-semibold text-deep-teal underline"
              >
                Hypoteční připravenost
              </Link>{" "}
              — uloží lokální profil
            </li>
            <li>
              <Link
                href={routes.financniPas}
                className="font-semibold text-deep-teal underline"
              >
                {PRODUCT_NAMES_CS.financialPassport}
              </Link>{" "}
              — dimenze a simulace
            </li>
            <li>Vraťte se sem — přehled se přizpůsobí</li>
          </ol>
        </Card>
      );

    case "financial_readiness":
      if (!model.readiness) {
        return (
          <Card title="Moje připravenost">
            <EmptyState
              message="Zatím nemáte vytvořený finanční profil."
              ctaHref={routes.financniPas}
              ctaLabel="Vytvořit finanční profil"
            />
          </Card>
        );
      }
      return (
        <Card title="Moje připravenost">
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
            Otevřít {PRODUCT_NAMES_CS.financialPassport}
          </Link>
        </Card>
      );

    case "safe_buying_power":
      if (!model.buyingPower) {
        return (
          <Card title="Můj bezpečný rozpočet">
            <EmptyState
              message="Bezpečný rozpočet spočítáme z vašeho finančního profilu."
              ctaHref={routes.navrhNaMiru}
              ctaLabel="Spustit hypoteční připravenost"
            />
          </Card>
        );
      }
      return (
        <Card title="Můj bezpečný rozpočet">
          <div className="grid grid-cols-1 gap-2 text-center sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[10px] font-bold uppercase text-muted-foreground">
                Maximum
              </p>
              <p className="mt-1 text-sm font-bold tabular-nums">
                {fmt(model.buyingPower.max)}
              </p>
            </div>
            <div className="rounded-xl bg-deep-teal/10 p-3">
              <p className="text-[10px] font-bold uppercase text-deep-teal">
                Doporučeno
              </p>
              <p className="mt-1 text-sm font-bold tabular-nums">
                {fmt(model.buyingPower.recommended)}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[10px] font-bold uppercase text-muted-foreground">
                Bezpečné
              </p>
              <p className="mt-1 text-sm font-bold tabular-nums">
                {fmt(model.buyingPower.safe)}
              </p>
            </div>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            {model.buyingPower.claimNote}
          </p>
        </Card>
      );

    case "mortgage_market":
      if (model.marketRates.length === 0) return null;
      return (
        <Card title="Hypoteční trh (váš profil)">
          <ul className="space-y-3">
            {model.marketRates.map((r) => (
              <li
                key={r.id}
                className="border-b border-border/60 pb-2 last:border-0"
              >
                <div className="flex justify-between gap-2 text-sm">
                  <span className="font-medium">{r.label}</span>
                  <span className="tabular-nums font-bold">
                    {r.ratePercent != null
                      ? `${r.ratePercent.toLocaleString("cs-CZ", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })} %`
                      : "Data ověřujeme"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{r.relevanceNote}</p>
              </li>
            ))}
          </ul>
        </Card>
      );

    case "saved_properties":
      return (
        <Card title="Uložené nemovitosti">
          {model.properties.length === 0 ? (
            <EmptyState
              message="Zatím nemáte uložené ani sledované nemovitosti."
              ctaHref={routes.sledovani}
              ctaLabel={`Přidat do ${PRODUCT_NAMES_CS.propertyWatchlist.toLowerCase()}`}
            />
          ) : (
            <ul className="space-y-3">
              {model.properties.slice(0, 4).map((p) => (
                <li key={p.item.id} className="text-sm">
                  <div className="flex justify-between gap-2 font-semibold">
                    <span>{p.item.label}</span>
                    <span className="tabular-nums">
                      {fmt(p.currentValue)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Fit: {p.statusLabel}
                    {p.investmentScore != null
                      ? ` · invest. skóre ${p.investmentScore}/100 (model)`
                      : ""}
                    {p.priceChangePct != null
                      ? ` · změna ${p.priceChangePct > 0 ? "+" : ""}${p.priceChangePct} %`
                      : ""}
                  </p>
                </li>
              ))}
              <li>
                <Link
                  href={routes.sledovani}
                  className="text-sm font-semibold text-deep-teal underline"
                >
                  Otevřít {PRODUCT_NAMES_CS.propertyWatchlist}
                </Link>
              </li>
            </ul>
          )}
        </Card>
      );

    case "watchlist_alerts":
      return (
        <Card title="Upozornění">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-muted-gold">
              <Bell className="h-4 w-4" />
              <span className="text-xs font-bold uppercase">Aktivní</span>
            </div>
            <Link
              href={routes.sledovani}
              className="text-xs font-semibold text-deep-teal underline"
            >
              {PRODUCT_NAMES_CS.propertyWatchlist}
            </Link>
          </div>
          {model.alerts.length === 0 ? (
            <EmptyState
              message="Žádná aktivní upozornění. Přidejte sledování a přepočítejte alerty."
              ctaHref={routes.sledovani}
              ctaLabel="Nastavit sledování"
            />
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
        <Card title="Přehled portfolia">
          <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
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
            Model — sledované nemovitosti, ne potvrzené vlastnictví.
          </p>
          <Link
            href={routes.portfolio}
            className="mt-3 inline-block text-sm font-semibold text-deep-teal underline"
          >
            Otevřít {PRODUCT_NAMES_CS.portfolioOs}
          </Link>
        </Card>
      );

    case "majetio_matches":
      if (!model.majetio) return null;
      return (
        <Card title="Nabídky Majetio">
          <p className="text-sm text-muted-foreground">{model.majetio.summary}</p>
          <a
            href={model.majetio.discoveryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 rounded-full border-2 border-deep-teal px-4 py-2 text-sm font-bold text-deep-teal"
          >
            Prohlédnout nabídky
            <Wallet className="h-4 w-4" />
          </a>
        </Card>
      );

    case "document_status":
      return (
        <Card title="Dokumenty">
          <ul className="space-y-2 text-sm">
            {model.documents.map((d) => (
              <li key={d.id} className="flex items-center gap-2">
                <FileText
                  className={cn(
                    "h-4 w-4",
                    d.done ? "text-emerald-600" : "text-muted-foreground"
                  )}
                />
                <span
                  className={d.done ? "text-muted-foreground line-through" : ""}
                >
                  {d.label}
                </span>
              </li>
            ))}
          </ul>
          <Link
            href={routes.documentVault}
            className="mt-3 inline-block text-xs font-semibold text-deep-teal underline"
          >
            Otevřít dokumentový trezor →
          </Link>
        </Card>
      );

    case "education":
      return (
        <Card title="Další kroky ve vzdělávání">
          <div className="mb-2 flex items-center gap-2 text-deep-teal">
            <BookOpen className="h-4 w-4" />
            <span className="text-xs font-bold uppercase">Doporučené lekce</span>
          </div>
          <ul className="space-y-3">
            {model.education.map((e) => (
              <li key={e.slug}>
                <Link
                  href={e.href}
                  className="font-semibold text-deep-teal underline"
                >
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
    return <DashboardSkeleton />;
  }

  const personaLabel =
    model.persona === "onboarding"
      ? "Začínáte"
      : model.persona === "investor"
        ? "Investor"
        : model.persona === "refinance"
          ? "Refinancování"
          : "Kupující";

  return (
    <div className="min-h-screen min-w-0 bg-gradient-to-b from-[#e8f0ed] via-white to-[#f7f5ef]">
      <header className="border-b border-border bg-deep-teal text-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-8 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-muted-gold">
              <LayoutDashboard className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-widest">
                {PRODUCT_NAMES_CS.myDashboard} · {personaLabel}
              </span>
            </div>
            <h1 className="mt-2 font-heading text-3xl font-black md:text-4xl">
              Vaše situace na jednom místě
            </h1>
            <p className="mt-2 max-w-xl text-sm text-emerald-50/90">
              Jeden systém — připravenost, rozpočet, sledování a další kroky.
              Zobrazujeme jen relevantní bloky ({model.visibleWidgets.length}).
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={routes.sledovani}
              className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-2 text-xs font-semibold"
            >
              <Bell className="h-3.5 w-3.5" />
              {PRODUCT_NAMES_CS.propertyWatchlist}
            </Link>
            <Link
              href={routes.portfolio}
              className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-2 text-xs font-semibold"
            >
              <BarChart3 className="h-3.5 w-3.5" />
              {PRODUCT_NAMES_CS.portfolioOs}
            </Link>
            <Link
              href={routes.copilot}
              className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-2 text-xs font-semibold"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {PRODUCT_NAMES_CS.aiCopilot}
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

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 px-4 py-8 md:grid-cols-2">
        {model.visibleWidgets.map((w) => (
          <div
            key={w.id}
            className={cn(
              w.id === "next_best_action" ||
                w.id === "financial_readiness" ||
                w.id === "safe_buying_power"
                ? "md:col-span-2"
                : ""
            )}
          >
            <WidgetSlot
              id={w.id}
              model={model}
              onNbaFeedback={() => setTick((t) => t + 1)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
