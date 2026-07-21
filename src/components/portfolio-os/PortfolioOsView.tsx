"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  AlertTriangle,
  BarChart3,
  Download,
  Layers,
  PieChart,
  Shield,
  Sparkles,
} from "lucide-react";
import {
  ClaimBadge,
  ClaimLegend,
} from "@/components/property-rentgen/ClaimBadge";
import {
  buildPortfolioOs,
  downloadAdvisorExport,
  DEMO_PORTFOLIO_TWINS,
} from "@/lib/portfolio-os";
import {
  loadDigitalTwinStore,
  seedDigitalTwinStore,
} from "@/lib/digital-twin/storage";
import { loadFinancialProfile } from "@/lib/financial-passport";
import { useCurrentRates } from "@/lib/rates";
import { routes } from "@/lib/routes";

function subscribeNoop() {
  return () => {};
}

function useIsClient() {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}

function fmtCzk(n: number | string | null | undefined) {
  if (n == null || n === "") return "—";
  const v = typeof n === "string" ? Number(n) : n;
  if (!Number.isFinite(v)) return "—";
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    maximumFractionDigits: 0,
  }).format(v);
}

function fmtPct(n: number | null | undefined) {
  if (n == null) return "—";
  return `${(n * 100).toFixed(1).replace(".", ",")} %`;
}

export function PortfolioOsView() {
  const ready = useIsClient();
  const { rates } = useCurrentRates();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!ready) return;
    seedDigitalTwinStore(DEMO_PORTFOLIO_TWINS);
  }, [ready]);

  const model = useMemo(() => {
    void tick;
    if (!ready) return null;
    const twins = loadDigitalTwinStore().twins;
    const profile = loadFinancialProfile();
    const liquidity = profile?.ownFunds ?? null;
    const rate =
      rates?.rateWithInsurance ?? rates?.rateWithoutInsurance ?? null;
    return buildPortfolioOs({
      twins,
      currentMarketRatePercent: rate,
      liquidityReserveCzk: liquidity,
    });
  }, [ready, rates, tick]);

  if (!ready || !model) {
    return (
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-16">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="h-28 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-28 animate-pulse rounded-2xl bg-slate-100" />
        </div>
        <p className="sr-only">Načítám moje portfolio</p>
      </div>
    );
  }

  const s = model.summary;

  return (
    <div className="min-h-screen min-w-0 bg-gradient-to-b from-[#eef3f1] to-white">
      <header className="border-b border-border bg-deep-teal text-white">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-gold">
            Součást Mého dashboardu · digitální karty nemovitostí
          </p>
          <h1 className="mt-2 font-heading text-3xl font-black md:text-4xl">
            Moje portfolio
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-emerald-50/90">
            Souhrn více nemovitostí, koncentrace rizik, zátěžové testy a srozumitelné
            scénáře — bez pokynů k prodeji.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => downloadAdvisorExport(model)}
              className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold"
            >
              <Download className="h-4 w-4" />
              Export pro účetního / poradce
            </button>
            <Link
              href={routes.financniPas}
              className="rounded-full border border-white/30 px-4 py-2 text-sm font-semibold"
            >
              Finanční pas
            </Link>
            <Link
              href={routes.sledovani}
              className="rounded-full border border-white/30 px-4 py-2 text-sm font-semibold"
            >
              Digitální karta nemovitosti / sledování
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
        {/* Summary grid */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 font-heading text-lg font-bold">
            <BarChart3 className="h-5 w-5 text-deep-teal" />
            Souhrn portfolia
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(
              [
                s.totalPropertyValue,
                s.totalEquity,
                s.totalDebt,
                s.portfolioLtv,
                s.monthlyGrossRent,
                s.monthlyNetCashFlow,
                s.weightedYield,
                s.debtService,
                s.liquidityReserve,
              ] as const
            ).map((m) => (
              <div
                key={m.label}
                className="rounded-xl border border-border bg-white p-4 shadow-sm"
              >
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  {m.label}
                </p>
                <p className="mt-1 text-xl font-bold tabular-nums">
                  {m.label.includes("LTV") ||
                  m.label.toLowerCase().includes("výnos")
                    ? m.value != null
                      ? fmtPct(Number(m.value))
                      : "—"
                    : fmtCzk(m.value as number | null)}
                </p>
                <ClaimBadge kind={m.claimKind} className="mt-2" />
                {m.blockers.length > 0 ? (
                  <p className="mt-1 text-[10px] text-amber-800">{m.blockers[0]}</p>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        {/* Exposure */}
        <section className="grid gap-4 md:grid-cols-3">
          {(
            [
              ["Měnová expozice", s.currencyExposure, PieChart],
              ["Expozice podle země", s.countryExposure, Layers],
              ["Expozice podle typu nemovitosti", s.propertyTypeExposure, BarChart3],
            ] as const
          ).map(([title, slices, Icon]) => (
            <div
              key={title}
              className="rounded-xl border border-border bg-white p-4"
            >
              <h3 className="flex items-center gap-2 text-sm font-bold">
                <Icon className="h-4 w-4 text-deep-teal" />
                {title}
              </h3>
              <ul className="mt-3 space-y-2 text-sm">
                {slices.map((sl) => (
                  <li key={sl.key} className="flex justify-between gap-2">
                    <span>{sl.label}</span>
                    <span className="font-semibold tabular-nums">
                      {sl.sharePct} %
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {/* Concentration */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 font-heading text-lg font-bold">
            <AlertTriangle className="h-5 w-5 text-muted-gold" />
            Koncentrace rizik
          </h2>
          <div className="space-y-3">
            {model.concentrationAlerts.map((a) => (
              <div
                key={a.id}
                className="rounded-xl border border-border bg-white p-4"
              >
                <p className="font-semibold text-text-dark">{a.headline}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {a.explanation}
                </p>
                <p className="mt-2 text-[10px] uppercase text-deep-teal">
                  {a.severity} · {a.dimension}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Stress tests */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 font-heading text-lg font-bold">
            <Shield className="h-5 w-5 text-deep-teal" />
            Scénářové zátěžové testy
          </h2>
          <div className="overflow-x-auto rounded-xl border border-border bg-white">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b bg-[#f7f8f7]">
                  <th className="px-3 py-2 text-left">Scénář</th>
                  <th className="px-3 py-2">Vlastní kapitál (základ → zátěž)</th>
                  <th className="px-3 py-2">LTV</th>
                  <th className="px-3 py-2">Tok/měs.</th>
                  <th className="px-3 py-2 text-left">Rozdíl</th>
                </tr>
              </thead>
              <tbody>
                {model.stressTests.map((st) => (
                  <tr key={st.id} className="border-b border-border/70">
                    <td className="px-3 py-2">
                      <p className="font-semibold">{st.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {st.description}
                      </p>
                    </td>
                    <td className="px-3 py-2 text-center tabular-nums text-xs">
                      {fmtCzk(st.baseline.equityCzk)} →{" "}
                      {fmtCzk(st.stressed.equityCzk)}
                    </td>
                    <td className="px-3 py-2 text-center tabular-nums text-xs">
                      {st.baseline.portfolioLtv != null
                        ? fmtPct(st.baseline.portfolioLtv)
                        : "—"}{" "}
                      →{" "}
                      {st.stressed.portfolioLtv != null
                        ? fmtPct(st.stressed.portfolioLtv)
                        : "—"}
                    </td>
                    <td className="px-3 py-2 text-center tabular-nums text-xs">
                      {fmtCzk(st.baseline.monthlyNetCashFlowCzk)} →{" "}
                      {fmtCzk(st.stressed.monthlyNetCashFlowCzk)}
                    </td>
                    <td className="px-3 py-2 text-xs">{st.deltaSummary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Recommendations */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 font-heading text-lg font-bold">
            <Sparkles className="h-5 w-5 text-muted-gold" />
            Doporučení k portfoliu
          </h2>
          <div className="space-y-4">
            {model.recommendations.map((rec) => (
              <article
                key={rec.id}
                className="rounded-xl border-2 border-muted-gold/30 bg-white p-5"
              >
                <h3 className="font-heading text-lg font-bold text-deep-teal">
                  {rec.headline}
                </h3>
                <p className="mt-2 text-sm">{rec.explanation}</p>
                <ul className="mt-3 space-y-2">
                  {rec.scenarios.map((sc) => (
                    <li key={sc.id} className="rounded-lg bg-[#f7f8f7] p-3 text-sm">
                      <p className="font-semibold">{sc.label}</p>
                      <p className="text-muted-foreground">{sc.description}</p>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-amber-900">{rec.disclaimer}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Properties table */}
        <section>
          <h2 className="mb-3 font-heading text-lg font-bold">Jednotlivé nemovitosti</h2>
          <div className="overflow-x-auto rounded-xl border border-border bg-white">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b bg-[#f7f8f7]">
                  <th className="px-3 py-2 text-left">Nemovitost</th>
                  <th className="px-3 py-2">Hodnota</th>
                  <th className="px-3 py-2">Vlastní kapitál</th>
                  <th className="px-3 py-2">Dluh</th>
                  <th className="px-3 py-2">Nájem</th>
                  <th className="px-3 py-2">Tok</th>
                  <th className="px-3 py-2">Riziko</th>
                </tr>
              </thead>
              <tbody>
                {model.properties.map((p) => (
                  <tr key={p.twinId} className="border-b border-border/70">
                    <td className="px-3 py-2 font-medium">{p.label}</td>
                    <td className="px-3 py-2 tabular-nums">{fmtCzk(p.valueCzk)}</td>
                    <td className="px-3 py-2 tabular-nums">{fmtCzk(p.equityCzk)}</td>
                    <td className="px-3 py-2 tabular-nums">{fmtCzk(p.debtCzk)}</td>
                    <td className="px-3 py-2 tabular-nums">
                      {fmtCzk(p.monthlyGrossRentCzk)}
                    </td>
                    <td className="px-3 py-2 tabular-nums">
                      {fmtCzk(p.monthlyNetCashFlowCzk)}
                    </td>
                    <td className="px-3 py-2 text-center">{p.riskScore ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <ClaimLegend />
      </div>
    </div>
  );
}
