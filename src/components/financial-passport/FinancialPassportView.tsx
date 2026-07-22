"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  History,
  Lock,
  SlidersHorizontal,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  applyWhatIfToProfile,
  buildFinancialPassportDocument,
  formatTimelineHeadline,
  isWhatIfActive,
  loadFinancialProfile,
  loadPassportTimeline,
  PASSPORT_CLAIM_NOTE,
  PASSPORT_LOCAL_DATA_NOTE,
  runWhatIf,
  toMajetioHandoff,
  whatIfFromProfile,
  type FinancialPassportDocument,
  type FinancialWhatIfParams,
} from "@/lib/financial-passport";
import { buildAttribution, buildMajetioDiscoveryUrl } from "@/lib/majetio";
import { scoreToBucket, track, trackCanonical } from "@/lib/analytics";
import { useCurrentRates } from "@/lib/rates";
import { routes } from "@/lib/routes";
import { CTA_CS, CTA_SECONDARY_CLASS } from "@/lib/ux/cta";
import { WhatNextPanel } from "@/components/ux/WhatNextPanel";
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
  id,
}: {
  title: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section
      id={id}
      className="rounded-2xl border border-border bg-white p-5 shadow-sm"
    >
      <h2 className="font-heading text-lg font-bold text-text-dark">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function DimensionBar({
  label,
  score,
  weight,
  explanation,
}: {
  label: string;
  score: number;
  weight: number;
  explanation: string;
}) {
  const clamped = Math.min(100, Math.max(0, score));
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="font-medium text-text-dark">{label}</span>
        <span className="tabular-nums font-bold text-deep-teal">
          {score}/100
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            váha {(weight * 100).toFixed(0)} %
          </span>
        </span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-slate-100"
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
      >
        <div
          className="h-full rounded-full bg-deep-teal transition-all duration-500 motion-reduce:transition-none"
          style={{ width: `${clamped}%` }}
        />
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">{explanation}</p>
    </div>
  );
}

function LocalDataBanner() {
  return (
    <div className="flex gap-3 rounded-xl border border-emerald-200/80 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-950">
      <Lock className="mt-0.5 h-4 w-4 shrink-0 text-deep-teal" aria-hidden />
      <p>{PASSPORT_LOCAL_DATA_NOTE}</p>
    </div>
  );
}

function WhatIfPanel({
  whatIf,
  baseRate,
  hasTargetPrice,
  onChange,
  onReset,
}: {
  whatIf: FinancialWhatIfParams;
  baseRate: number;
  hasTargetPrice: boolean;
  onChange: (next: FinancialWhatIfParams) => void;
  onReset: () => void;
}) {
  const set = <K extends keyof FinancialWhatIfParams>(
    key: K,
    value: FinancialWhatIfParams[K]
  ) => onChange({ ...whatIf, [key]: value });

  return (
    <div className="rounded-xl border border-border bg-[#f7f8f7] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-deep-teal" />
          <h3 className="text-sm font-bold text-text-dark">
            Co se stane, když…
          </h3>
        </div>
        {isWhatIfActive(whatIf, baseRate) ? (
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-semibold text-deep-teal underline"
          >
            Resetovat simulaci
          </button>
        ) : null}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Přepočet modelové připravenosti — neukládá se do banky ani na server.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block text-xs">
          <span className="font-semibold text-text-dark">
            Zvýším příjem (+ Kč/měs.)
          </span>
          <input
            type="range"
            min={0}
            max={30_000}
            step={1_000}
            value={whatIf.incomeDeltaCzk}
            onChange={(e) =>
              set("incomeDeltaCzk", Number(e.target.value))
            }
            className="mt-2 w-full accent-deep-teal"
          />
          <span className="tabular-nums text-deep-teal">
            +{fmt(whatIf.incomeDeltaCzk)}
          </span>
        </label>
        <label className="block text-xs">
          <span className="font-semibold text-text-dark">
            Snížím závazky (− Kč/měs.)
          </span>
          <input
            type="range"
            min={0}
            max={20_000}
            step={500}
            value={Math.abs(whatIf.liabilitiesDeltaCzk)}
            onChange={(e) =>
              set("liabilitiesDeltaCzk", -Number(e.target.value))
            }
            className="mt-2 w-full accent-deep-teal"
          />
          <span className="tabular-nums text-deep-teal">
            −{fmt(Math.abs(whatIf.liabilitiesDeltaCzk))}
          </span>
        </label>
        <label className="block text-xs">
          <span className="font-semibold text-text-dark">
            Přidám vlastní kapitál (+ Kč)
          </span>
          <input
            type="range"
            min={0}
            max={1_000_000}
            step={50_000}
            value={whatIf.capitalDeltaCzk}
            onChange={(e) =>
              set("capitalDeltaCzk", Number(e.target.value))
            }
            className="mt-2 w-full accent-deep-teal"
          />
          <span className="tabular-nums text-deep-teal">
            +{fmt(whatIf.capitalDeltaCzk)}
          </span>
        </label>
        <label className="block text-xs">
          <span className="font-semibold text-text-dark">
            Změním cenu nemovitosti (− Kč)
          </span>
          <input
            type="range"
            min={0}
            max={1_500_000}
            step={50_000}
            disabled={!hasTargetPrice}
            value={Math.abs(whatIf.targetPriceDeltaCzk)}
            onChange={(e) =>
              set("targetPriceDeltaCzk", -Number(e.target.value))
            }
            className="mt-2 w-full accent-deep-teal disabled:opacity-40"
          />
          <span className="tabular-nums text-deep-teal">
            {hasTargetPrice
              ? `−${fmt(Math.abs(whatIf.targetPriceDeltaCzk))}`
              : "Doplňte cílovou cenu v profilu"}
          </span>
        </label>
        <label className="block text-xs sm:col-span-2">
          <span className="font-semibold text-text-dark">
            Změní se modelová sazba ({whatIf.modelRatePercent.toFixed(2)} %)
          </span>
          <input
            type="range"
            min={2}
            max={9}
            step={0.25}
            value={whatIf.modelRatePercent}
            onChange={(e) =>
              set("modelRatePercent", Number(e.target.value))
            }
            className="mt-2 w-full accent-deep-teal"
          />
          <span className="text-muted-foreground">
            Základ z trhu: {baseRate.toFixed(2)} % · stress test +2 p.b.
          </span>
        </label>
      </div>
    </div>
  );
}

function PassportContent({
  baselineDoc,
  profile,
  baseRate,
}: {
  baselineDoc: FinancialPassportDocument;
  profile: NonNullable<ReturnType<typeof loadFinancialProfile>>;
  baseRate: number;
}) {
  const timeline = useMemo(() => loadPassportTimeline(), []);
  const [whatIf, setWhatIf] = useState<FinancialWhatIfParams>(() =>
    whatIfFromProfile(profile, baseRate)
  );

  useEffect(() => {
    setWhatIf((prev) => ({ ...prev, modelRatePercent: baseRate }));
  }, [baseRate]);

  const live = useMemo(
    () => runWhatIf(profile, whatIf, baseRate),
    [profile, whatIf, baseRate]
  );

  const doc = live.simulated;
  const whatIfActive = isWhatIfActive(whatIf, baseRate);

  const majetioUrl = useMemo(() => {
    const passport = toMajetioHandoff(doc);
    const attr = buildAttribution({
      campaign: "financial_passport",
      medium: "referral",
      content: "passport_dashboard",
      conversionEvent: "cta_majetio_budget_listings",
      product: "financial_passport",
    });
    return buildMajetioDiscoveryUrl({ passport, attribution: attr });
  }, [doc]);

  return (
    <div className="space-y-6">
      <LocalDataBanner />

      <Section title="Modelová připravenost 0–100">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Celkové skóre finanční připravenosti
            </p>
            <p className="mt-1 font-heading text-5xl font-black text-deep-teal tabular-nums">
              {doc.readiness.overall}
              <span className="text-2xl font-bold text-muted-foreground">/100</span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {doc.readiness.bandLabel} · {doc.readiness.financingStatusLabel}
            </p>
            {whatIfActive ? (
              <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">
                Simulace: {live.baseline.readiness.overall} → {doc.readiness.overall}{" "}
                ({live.scoreDelta >= 0 ? "+" : ""}
                {live.scoreDelta} b.) · modelová připravenost, ne schválení banky
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {doc.readiness.dimensions.map((d) => (
            <DimensionBar
              key={d.id}
              label={d.label}
              score={d.score}
              weight={d.weight}
              explanation={d.explanation}
            />
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">{PASSPORT_CLAIM_NOTE}</p>
      </Section>

      <Section title="Co mám udělat dál?" id="next-actions">
        {doc.readiness.nextActions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Model nevidí rychlý krok — zkuste what-if simulaci nebo doplňte profil.
          </p>
        ) : (
          <ul className="space-y-3">
            {doc.readiness.nextActions.map((a) => (
              <li
                key={a.id}
                className="rounded-xl border border-border bg-[#f7f8f7] px-4 py-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="font-semibold text-text-dark">{a.title}</p>
                  {a.estimatedGain != null && a.estimatedGain > 0 ? (
                    <span className="rounded-full bg-deep-teal/10 px-3 py-1 text-xs font-bold text-deep-teal">
                      +{a.estimatedGain} b. v modelu
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{a.detail}</p>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="What-if simulátor">
        <WhatIfPanel
          whatIf={whatIf}
          baseRate={baseRate}
          hasTargetPrice={
            profile.targetPrice != null && profile.targetPrice > 0
          }
          onChange={setWhatIf}
          onReset={() => setWhatIf(whatIfFromProfile(profile, baseRate))}
        />
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Identita profilu">
          <dl className="grid gap-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Domácnost</dt>
              <dd className="font-medium">{baselineDoc.identity.householdType}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Věk</dt>
              <dd className="font-medium">
                {baselineDoc.identity.ageRange}
                {baselineDoc.identity.age ? ` (${baselineDoc.identity.age})` : ""}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Rezidence</dt>
              <dd className="font-medium">{baselineDoc.identity.residency}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Země / trh</dt>
              <dd className="font-medium">{baselineDoc.identity.country ?? "—"}</dd>
            </div>
          </dl>
          {baselineDoc.identity.goals.length > 0 ? (
            <ul className="mt-3 list-disc pl-5 text-sm text-text-dark">
              {baselineDoc.identity.goals.map((g) => (
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
            <li>Typ: {baselineDoc.income.primaryType ?? "—"}</li>
            <li>Čistý příjem: {fmt(baselineDoc.income.netIncome)}</li>
            <li>Vedlejší: {fmt(baselineDoc.income.secondaryIncome)}</li>
            <li>Celkem: {fmt(baselineDoc.income.totalNetIncome)}</li>
            <li>Stabilita: {baselineDoc.income.stabilityLabel}</li>
          </ul>
        </Section>
        <Section title="Závazky (měsíčně)">
          <ul className="space-y-2 text-sm">
            <li>Hypotéka: {fmt(baselineDoc.liabilities.mortgagePayment)}</li>
            <li>Spotřebitelské: {fmt(baselineDoc.liabilities.consumerLoans)}</li>
            <li>Kreditní limity: {fmt(baselineDoc.liabilities.creditCardLimits)}</li>
            <li>Leasing: {fmt(baselineDoc.liabilities.leases)}</li>
            <li>Ostatní: {fmt(baselineDoc.liabilities.other)}</li>
            <li className="border-t border-border pt-2 font-semibold">
              Celkem: {fmt(baselineDoc.liabilities.totalMonthly)}
            </li>
          </ul>
        </Section>
        <Section title="Aktiva">
          <ul className="space-y-2 text-sm">
            <li>Hotovost: {fmt(baselineDoc.assets.cash)}</li>
            <li>Investice: {fmt(baselineDoc.assets.investments)}</li>
            <li>
              Vlastní kapitál v nemovitostech:{" "}
              {fmt(baselineDoc.assets.existingPropertyEquity)}
            </li>
            <li>Zajištění (CZ): {fmt(baselineDoc.assets.availableCollateral)}</li>
            <li className="border-t border-border pt-2 font-semibold">
              Model vlastních zdrojů: {fmt(baselineDoc.assets.totalOwnFundsModel)}
            </li>
          </ul>
        </Section>
      </div>

      <Section title="Financování (model)">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-3 text-sm">
            <p className="text-muted-foreground">Odhad max. úvěru</p>
            <p className="text-lg font-bold">{fmt(doc.financing.estimatedMaximum)}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-sm">
            <p className="text-muted-foreground">Doporučené max.</p>
            <p className="text-lg font-bold">{fmt(doc.financing.recommendedMaximum)}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-sm">
            <p className="text-muted-foreground">Konzervativní max.</p>
            <p className="text-lg font-bold">{fmt(doc.financing.conservativeMaximum)}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-sm">
            <p className="text-muted-foreground">Bezpečná splátka</p>
            <p className="text-lg font-bold">{fmt(doc.financing.safeMonthlyPayment)}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-sm">
            <p className="text-muted-foreground">Potřeba vlastních zdrojů</p>
            <p className="text-lg font-bold">{fmt(doc.financing.ownFundsRequirement)}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-sm">
            <p className="text-muted-foreground">Modelová sazba</p>
            <p className="text-lg font-bold">
              {doc.financing.modelRatePercent.toFixed(2)} %
            </p>
          </div>
        </div>
      </Section>

      <Section title="Riziko (model)">
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

      {baselineDoc.readiness.topLevers.length > 0 ? (
        <Section title="Rychlé páky skóre">
          <ul className="space-y-3">
            {baselineDoc.readiness.topLevers.map((l) => (
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
        </Section>
      ) : null}

      {timeline.length > 0 ? (
        <Section title="Historie modelové připravenosti">
          <div className="flex items-center gap-2 text-muted-gold">
            <History className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wide">
              Historie modelové připravenosti
            </span>
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

      <WhatNextPanel
        actions={[
          {
            id: "edit",
            label: CTA_CS.editInputs,
            description: "Upravte profil v Hypoteční připravenosti.",
            href: routes.navrhNaMiru,
            primary: true,
          },
          {
            id: "moznosti",
            label: CTA_CS.discoverOptions,
            description: "Rozpočet a trhy v jednom přehledu.",
            href: routes.mojeMoznosti,
          },
          {
            id: "copilot",
            label: "Zeptat se průvodce",
            description: "Finanční AI průvodce s citacemi.",
            href: routes.copilot,
          },
        ]}
      />

      <div className="mt-4 flex flex-wrap gap-3">
        <a
          href={majetioUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={CTA_SECONDARY_CLASS}
          onClick={() =>
            track("passport_shared_intent", {
              tool_id: "financial_passport",
              cta_id: "majetio_budget_listings",
            })
          }
        >
          Nemovitosti v rozpočtu
          <Wallet className="h-4 w-4" />
        </a>
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

  useEffect(() => {
    track("passport_started", { tool_id: "financial_passport" });
    if (doc) {
      trackCanonical("financial_passport_created", "passport_completed", {
        tool_id: "financial_passport",
        score_bucket: scoreToBucket(doc.readiness.overall),
      });
    }
  }, [doc]);

  if (!profile || !doc) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <TrendingUp className="mx-auto h-12 w-12 text-deep-teal" />
        <h1 className="mt-4 font-heading text-2xl font-bold">Finanční pas</h1>
        <p className="mt-3 text-muted-foreground">
          Zatím nemáte uložený profil. Vyplňte{" "}
          <Link href={routes.navrhNaMiru} className="font-semibold text-deep-teal underline">
            Hypoteční připravenost
          </Link>{" "}
          — data zůstanou pouze v tomto prohlížeči a zde uvidíte modelovou
          připravenost, rozpad skóre a what-if simulace.
        </p>
        <p className="mt-3 text-xs text-muted-foreground">{PASSPORT_LOCAL_DATA_NOTE}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eef3f1] to-white">
      <div className="border-b border-border bg-deep-teal text-white">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-gold">
            Finanční pas 2.0
          </p>
          <h1 className="mt-2 font-heading text-3xl font-black md:text-4xl">
            Akční dashboard modelové připravenosti
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-emerald-50/90">
            Skóre 0–100 z vašich vstupů — bez kreditních dat z banky. Co udělat
            dál a co se stane při změně příjmu, závazků nebo sazby.
          </p>
          <p className="mt-2 text-xs text-emerald-100/80">
            Aktualizováno: {new Date(doc.updatedAt).toLocaleString("cs-CZ")} · data
            jen v prohlížeči
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-5xl px-4 py-8">
        <PassportContent
          baselineDoc={doc}
          profile={profile}
          baseRate={modelRate}
        />
      </div>
    </div>
  );
}
