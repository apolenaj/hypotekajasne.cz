"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  History,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  buildFinancialPassportDocument,
  formatTimelineHeadline,
  loadFinancialProfile,
  loadPassportTimeline,
  PASSPORT_CLAIM_NOTE,
  runSimulation,
  SIMULATIONS,
  toMajetioHandoff,
  type FinancialPassportDocument,
  type SimulationId,
} from "@/lib/financial-passport";
import { buildAttribution, buildMajetioDiscoveryUrl } from "@/lib/majetio";
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

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <h2 className="font-heading text-lg font-bold text-text-dark">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function DimensionBar({
  label,
  score,
  explanation,
}: {
  label: string;
  score: number;
  explanation: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-text-dark">{label}</span>
        <span className="tabular-nums font-bold text-deep-teal">{score}/100</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-deep-teal transition-all duration-500"
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">{explanation}</p>
    </div>
  );
}

function PassportContent({ doc }: { doc: FinancialPassportDocument }) {
  const [activeSim, setActiveSim] = useState<SimulationId | null>(null);
  const profile = useMemo(() => loadFinancialProfile(), []);
  const timeline = useMemo(() => loadPassportTimeline(), []);

  const simResult =
    activeSim && profile
      ? runSimulation(profile, activeSim, SIMULATIONS.find((s) => s.id === activeSim)?.defaultAmount ?? 0, doc.financing.modelRatePercent)
      : null;

  const displayDoc = simResult?.simulated ?? doc;

  const majetioUrl = useMemo(() => {
    const passport = toMajetioHandoff(displayDoc);
    const attr = buildAttribution({
      campaign: "financial_passport",
      medium: "referral",
      content: "passport_dashboard",
      conversionEvent: "cta_majetio_budget_listings",
      product: "financial_passport",
    });
    return buildMajetioDiscoveryUrl({ passport, attribution: attr });
  }, [displayDoc]);

  return (
    <div className="space-y-6">
      {/* Readiness — dimensional, not single black number */}
      <Section title="Připravenost (readiness)">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Celkové modelové skóre
            </p>
            <p className="mt-1 font-heading text-5xl font-black text-deep-teal tabular-nums">
              {displayDoc.readiness.overall}
              <span className="text-2xl font-bold text-muted-foreground">/100</span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Pásmo: <strong>{displayDoc.readiness.band}</strong> ·{" "}
              {displayDoc.readiness.financingStatus.replace(/_/g, " ")}
            </p>
          </div>
          {simResult ? (
            <p className="rounded-xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-900">
              Simulace: {simResult.scoreDelta >= 0 ? "+" : ""}
              {simResult.scoreDelta} bodů → {simResult.simulated.readiness.overall}/100
            </p>
          ) : null}
        </div>
        <div className="mt-6 space-y-4">
          {displayDoc.readiness.dimensions.map((d) => (
            <DimensionBar
              key={d.id}
              label={d.label}
              score={d.score}
              explanation={d.explanation}
            />
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">{PASSPORT_CLAIM_NOTE}</p>
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Identita profilu">
          <dl className="grid gap-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Domácnost</dt>
              <dd className="font-medium">{doc.identity.householdType}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Věk</dt>
              <dd className="font-medium">
                {doc.identity.ageRange}
                {doc.identity.age ? ` (${doc.identity.age})` : ""}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Rezidence</dt>
              <dd className="font-medium">{doc.identity.residency}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Země / trh</dt>
              <dd className="font-medium">{doc.identity.country ?? "—"}</dd>
            </div>
          </dl>
          {doc.identity.goals.length > 0 ? (
            <ul className="mt-3 list-disc pl-5 text-sm text-text-dark">
              {doc.identity.goals.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          ) : null}
        </Section>

        <Section title="Cíle nemovitosti">
          <p className="text-sm">
            <strong>{doc.propertyGoals.purposeLabel}</strong>
          </p>
          {doc.propertyGoals.targetPrice ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Cílová cena: {fmt(doc.propertyGoals.targetPrice)}
            </p>
          ) : null}
          {doc.propertyGoals.targetCountry ? (
            <p className="text-sm text-muted-foreground">
              Země: {doc.propertyGoals.targetCountry}
            </p>
          ) : null}
        </Section>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Section title="Příjmy">
          <ul className="space-y-2 text-sm">
            <li>Typ: {doc.income.primaryType ?? "—"}</li>
            <li>Čistý příjem: {fmt(doc.income.netIncome)}</li>
            <li>Vedlejší: {fmt(doc.income.secondaryIncome)}</li>
            <li>Celkem: {fmt(doc.income.totalNetIncome)}</li>
            <li>Stabilita: {doc.income.stabilityLabel}</li>
          </ul>
        </Section>
        <Section title="Závazky (měsíčně)">
          <ul className="space-y-2 text-sm">
            <li>Hypotéka: {fmt(doc.liabilities.mortgagePayment)}</li>
            <li>Spotřebitelské: {fmt(doc.liabilities.consumerLoans)}</li>
            <li>Kreditní limity: {fmt(doc.liabilities.creditCardLimits)}</li>
            <li>Leasing: {fmt(doc.liabilities.leases)}</li>
            <li>Ostatní: {fmt(doc.liabilities.other)}</li>
            <li className="border-t border-border pt-2 font-semibold">
              Celkem: {fmt(doc.liabilities.totalMonthly)}
            </li>
          </ul>
        </Section>
        <Section title="Aktiva">
          <ul className="space-y-2 text-sm">
            <li>Hotovost: {fmt(doc.assets.cash)}</li>
            <li>Investice: {fmt(doc.assets.investments)}</li>
            <li>Equity v nemovitostech: {fmt(doc.assets.existingPropertyEquity)}</li>
            <li>Zajištění (CZ): {fmt(doc.assets.availableCollateral)}</li>
            <li className="border-t border-border pt-2 font-semibold">
              Model vlastních zdrojů: {fmt(doc.assets.totalOwnFundsModel)}
            </li>
          </ul>
        </Section>
      </div>

      <Section title="Financování (model)">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-3 text-sm">
            <p className="text-muted-foreground">Odhad max. úvěru</p>
            <p className="text-lg font-bold">{fmt(displayDoc.financing.estimatedMaximum)}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-sm">
            <p className="text-muted-foreground">Doporučené max.</p>
            <p className="text-lg font-bold">{fmt(displayDoc.financing.recommendedMaximum)}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-sm">
            <p className="text-muted-foreground">Konzervativní max.</p>
            <p className="text-lg font-bold">{fmt(displayDoc.financing.conservativeMaximum)}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-sm">
            <p className="text-muted-foreground">Bezpečná splátka</p>
            <p className="text-lg font-bold">{fmt(displayDoc.financing.safeMonthlyPayment)}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-sm">
            <p className="text-muted-foreground">Potřeba vlastních zdrojů</p>
            <p className="text-lg font-bold">{fmt(displayDoc.financing.ownFundsRequirement)}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-sm">
            <p className="text-muted-foreground">Modelová sazba</p>
            <p className="text-lg font-bold">{displayDoc.financing.modelRatePercent.toFixed(2)} %</p>
          </div>
        </div>
      </Section>

      <Section title="Riziko">
        <ul className="space-y-2 text-sm">
          <li>
            Likvidní rezerva:{" "}
            {doc.risk.liquidityReserveMonths != null
              ? `${doc.risk.liquidityReserveMonths} měs. (model)`
              : "—"}
          </li>
          <li>
            Dluhová zátěž:{" "}
            {doc.risk.debtBurdenRatio != null
              ? `${(doc.risk.debtBurdenRatio * 100).toFixed(0)} % příjmu`
              : "—"}
          </li>
          <li>
            Citlivost na sazbu (+2 p.b.):{" "}
            {doc.risk.rateSensitivityDelta != null
              ? `+${fmt(doc.risk.rateSensitivityDelta)}/měs.`
              : "—"}
          </li>
          <li>Koncentrace příjmu: {doc.risk.incomeConcentration}</li>
          <li>Měnové riziko: {doc.risk.currencyRisk}</li>
        </ul>
        {doc.risk.flags.length > 0 ? (
          <ul className="mt-3 list-disc pl-5 text-sm text-amber-900">
            {doc.risk.flags.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        ) : null}
      </Section>

      <Section title="Co zvýší moje skóre nejrychleji?">
        {doc.readiness.topLevers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Model nevidí rychlou páku — zkuste simulace níže nebo doplňte profil.
          </p>
        ) : (
          <ul className="space-y-3">
            {doc.readiness.topLevers.map((l) => (
              <li
                key={l.id}
                className="flex flex-wrap items-start justify-between gap-2 rounded-xl border border-border bg-[#f7f8f7] px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-text-dark">{l.title}</p>
                  <p className="text-sm text-muted-foreground">{l.rationale}</p>
                </div>
                <span className="rounded-full bg-deep-teal/10 px-3 py-1 text-xs font-bold text-deep-teal">
                  +{l.estimatedGain} b.
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Simulace — co kdyby…">
        <p className="mb-3 text-sm text-muted-foreground">
          Kliknutím přepočítáte model (neukládá se do banky).
        </p>
        <div className="flex flex-wrap gap-2">
          {SIMULATIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() =>
                setActiveSim(activeSim === s.id ? null : s.id)
              }
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                activeSim === s.id
                  ? "border-deep-teal bg-deep-teal text-white"
                  : "border-border bg-white hover:border-deep-teal/40"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
        {activeSim && simResult ? (
          <div className="mt-4 space-y-2 text-sm">
            {simResult.dimensionDeltas
              .filter((d) => d.delta !== 0)
              .map((d) => (
                <p key={d.id}>
                  {d.label}: {d.delta > 0 ? "+" : ""}
                  {d.delta}
                </p>
              ))}
          </div>
        ) : null}
      </Section>

      {timeline.length > 0 ? (
        <Section title="Historie připravenosti">
          <div className="flex items-center gap-2 text-muted-gold">
            <History className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wide">Timeline</span>
          </div>
          <ul className="mt-4 space-y-4">
            {timeline.slice(0, 8).map((e) => (
              <li key={e.id} className="border-l-2 border-deep-teal/30 pl-4">
                <p className="font-semibold text-text-dark">
                  {formatTimelineHeadline(e)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(e.at).toLocaleString("cs-CZ")}
                </p>
                <ul className="mt-2 list-disc pl-4 text-sm text-muted-foreground">
                  {e.reasons.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Link
          href={routes.navrhNaMiru}
          className="inline-flex items-center gap-2 rounded-full bg-deep-teal px-5 py-3 text-sm font-bold text-white"
        >
          Upravit profil
          <ArrowRight className="h-4 w-4" />
        </Link>
        <a
          href={majetioUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border-2 border-deep-teal px-5 py-3 text-sm font-bold text-deep-teal"
        >
          Nemovitosti v rozpočtu (Majetio)
          <Wallet className="h-4 w-4" />
        </a>
        <Link
          href={routes.copilot}
          className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-semibold"
        >
          Zeptat se Copilota
          <Sparkles className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export function FinancialPassportView() {
  const { rates } = useCurrentRates();
  const modelRate =
    rates?.rateWithInsurance ?? rates?.rateWithoutInsurance ?? 5;

  const profile = useMemo(() => loadFinancialProfile(), []);
  const doc = useMemo(() => {
    if (!profile) return null;
    return buildFinancialPassportDocument(profile, modelRate);
  }, [profile, modelRate]);

  if (!profile || !doc) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <TrendingUp className="mx-auto h-12 w-12 text-deep-teal" />
        <h1 className="mt-4 font-heading text-2xl font-bold">Financial Passport</h1>
        <p className="mt-3 text-muted-foreground">
          Zatím nemáte uložený profil. Vyplňte{" "}
          <Link href={routes.navrhNaMiru} className="font-semibold text-deep-teal underline">
            Hypoteční připravenost
          </Link>{" "}
          — data zůstanou v prohlížeči a zde uvidíte dimenzionální skóre, rizika a
          simulace.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eef3f1] to-white">
      <div className="border-b border-border bg-deep-teal text-white">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-gold">
            Financial Passport
          </p>
          <h1 className="mt-2 font-heading text-3xl font-black md:text-4xl">
            Váš finančně-realitní profil
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-emerald-50/90">
            Jedno místo pro dostupnost, rizika a připravenost — sdílené s Majetio
            jen jako ne-PII rozpočet.
          </p>
          <p className="mt-2 text-xs text-emerald-100/80">
            Aktualizováno: {new Date(doc.updatedAt).toLocaleString("cs-CZ")}
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-5xl px-4 py-8">
        <PassportContent doc={doc} />
      </div>
    </div>
  );
}
