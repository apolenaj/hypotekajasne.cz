"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  AlertTriangle,
  Bell,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clock,
  HelpCircle,
  RefreshCw,
  Save,
  TrendingDown,
  TrendingUp,
  UserCheck,
  WifiOff,
} from "lucide-react";
import {
  ClaimBadge,
  ClaimLegend,
} from "@/components/property-rentgen/ClaimBadge";
import { RateProvenanceBanner } from "@/components/calculators/RateProvenanceBanner";
import { WhatNextPanel } from "@/components/ux/WhatNextPanel";
import { CTA_CS } from "@/lib/ux/cta";
import { track } from "@/lib/analytics/track";
import { useMortgageRateEngine } from "@/lib/rates";
import { routes } from "@/lib/routes";
import { FEATURE_STATUS_LABELS } from "@/lib/majetio/types";
import {
  DEMO_REFINANCE_PROFILE,
  REFINANCE_RADAR_FEATURE_STATUS,
  buildRefinanceRadarDashboard,
  clearRefinanceRadarProfile,
  emptyLoanProfile,
  generateRefinanceAlerts,
  importFromFinancialProfile,
  loadRefinanceRadarStore,
  persistRefinanceAlerts,
  saveLoanProfile,
  saveRefinanceWatch,
  type RefinanceLoanProfile,
  type RefinanceRadarDashboard,
} from "@/lib/refinance-radar";
import { loadFinancialProfile } from "@/lib/financial-passport";
import { LIVE_RATES_UNAVAILABLE_MESSAGE } from "@/lib/rates/types";

function subscribeNoop() {
  return () => {};
}
function useIsClient() {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}

function useOnline() {
  return useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined") return () => {};
      window.addEventListener("online", onStoreChange);
      window.addEventListener("offline", onStoreChange);
      return () => {
        window.removeEventListener("online", onStoreChange);
        window.removeEventListener("offline", onStoreChange);
      };
    },
    () => (typeof navigator !== "undefined" ? navigator.onLine : true),
    () => true
  );
}

function fmtCzk(n: number | null | undefined) {
  if (n == null) return "—";
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtPct(n: number | null | undefined) {
  if (n == null) return "—";
  return `${n.toFixed(2).replace(".", ",")} %`;
}

function fmtDate(iso: string | null | undefined) {
  if (!iso) return "—";
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "—";
  return new Date(t).toLocaleDateString("cs-CZ");
}

function rateStatusLabel(status: string | null | undefined): string {
  if (status === "LIVE") return "LIVE data";
  if (status === "STALE") return "Neaktuální údaj";
  if (status === "MODEL") return "Model — ne nabídka banky";
  return "Nedostupné";
}

type FormState = {
  loanBalanceCzk: string;
  ratePercent: string;
  fixationEnd: string;
  monthlyPaymentCzk: string;
  propertyValueCzk: string;
  currentLender: string;
  remainingTermYears: string;
  newTermYears: string;
  refinancingFeesCzk: string;
  earlyRepaymentPenaltyCzk: string;
  insuranceMonthlyDeltaCzk: string;
  hasInsuranceBundle: boolean;
  wantConsultation: boolean;
};

function emptyForm(): FormState {
  return {
    loanBalanceCzk: "",
    ratePercent: "",
    fixationEnd: "",
    monthlyPaymentCzk: "",
    propertyValueCzk: "",
    currentLender: "",
    remainingTermYears: "25",
    newTermYears: "25",
    refinancingFeesCzk: "25000",
    earlyRepaymentPenaltyCzk: "",
    insuranceMonthlyDeltaCzk: "0",
    hasInsuranceBundle: true,
    wantConsultation: false,
  };
}

function profileToForm(p: RefinanceLoanProfile): FormState {
  return {
    loanBalanceCzk: p.loanBalanceCzk > 0 ? String(p.loanBalanceCzk) : "",
    ratePercent: p.ratePercent > 0 ? String(p.ratePercent) : "",
    fixationEnd: p.fixationEnd,
    monthlyPaymentCzk: p.monthlyPaymentCzk > 0 ? String(p.monthlyPaymentCzk) : "",
    propertyValueCzk:
      p.propertyValueCzk != null && p.propertyValueCzk > 0
        ? String(p.propertyValueCzk)
        : "",
    currentLender: p.currentLender,
    remainingTermYears: String(p.remainingTermYears),
    newTermYears: String(p.newTermYears),
    refinancingFeesCzk: String(p.refinancingFeesCzk),
    earlyRepaymentPenaltyCzk:
      p.earlyRepaymentPenaltyCzk != null
        ? String(p.earlyRepaymentPenaltyCzk)
        : "",
    insuranceMonthlyDeltaCzk: String(p.insuranceMonthlyDeltaCzk),
    hasInsuranceBundle: p.hasInsuranceBundle,
    wantConsultation: false,
  };
}

function formToProfile(
  f: FormState,
  base?: RefinanceLoanProfile | null
): RefinanceLoanProfile {
  return emptyLoanProfile({
    ...(base ?? {}),
    currentLender: f.currentLender,
    loanBalanceCzk: Number(f.loanBalanceCzk) || 0,
    ratePercent: Number(f.ratePercent.replace(",", ".")) || 0,
    fixationEnd: f.fixationEnd,
    monthlyPaymentCzk: Number(f.monthlyPaymentCzk) || 0,
    propertyValueCzk:
      f.propertyValueCzk.trim() !== ""
        ? Number(f.propertyValueCzk) || null
        : null,
    remainingTermYears: Number(f.remainingTermYears) || 25,
    newTermYears: Number(f.newTermYears) || 25,
    refinancingFeesCzk: Number(f.refinancingFeesCzk) || 25_000,
    earlyRepaymentPenaltyCzk:
      f.earlyRepaymentPenaltyCzk !== ""
        ? Number(f.earlyRepaymentPenaltyCzk)
        : null,
    insuranceMonthlyDeltaCzk: Number(f.insuranceMonthlyDeltaCzk) || 0,
    hasInsuranceBundle: f.hasInsuranceBundle,
  });
}

function isFormCompleteEnough(f: FormState): boolean {
  return (
    Number(f.loanBalanceCzk) > 0 &&
    Number(f.ratePercent.replace(",", ".")) > 0 &&
    Boolean(f.fixationEnd) &&
    Number.isFinite(Date.parse(f.fixationEnd)) &&
    Number(f.monthlyPaymentCzk) > 0
  );
}

function TimelineDot({ status }: { status: "upcoming" | "active" | "passed" }) {
  if (status === "active")
    return (
      <span className="block h-4 w-4 rounded-full bg-muted-gold ring-2 ring-muted-gold/30" />
    );
  if (status === "passed")
    return <span className="block h-4 w-4 rounded-full bg-emerald-500" />;
  return (
    <span className="block h-4 w-4 rounded-full border-2 border-border bg-white" />
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="py-2 pr-4 align-top text-sm">{children}</td>;
}

type Phase = "boot" | "empty" | "results";

export function RefinanceRadarView() {
  const ready = useIsClient();
  const online = useOnline();
  const { rates, resolved, loading: ratesLoading, error: ratesError } =
    useMortgageRateEngine(true);

  const [phase, setPhase] = useState<Phase>("boot");
  const [profile, setProfile] = useState<RefinanceLoanProfile | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [useDemo, setUseDemo] = useState(false);
  const [watchEnabled, setWatchEnabled] = useState(false);
  const [watchMessage, setWatchMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const radarStarted = useRef(false);

  const markRadarStarted = useCallback(() => {
    if (radarStarted.current) return;
    radarStarted.current = true;
    track("refinance_radar_started", { tool_id: "refinance_radar" });
  }, []);

  useEffect(() => {
    if (!ready) return;
    const store = loadRefinanceRadarStore();
    setWatchEnabled(store.preferences.watchEnabled);

    if (store.profile && store.profile.loanBalanceCzk > 0) {
      setProfile(store.profile);
      setForm(profileToForm(store.profile));
      setPhase("results");
      markRadarStarted();
      return;
    }

    const fp = loadFinancialProfile();
    if (fp) {
      const partial = importFromFinancialProfile(fp);
      const merged = emptyLoanProfile(partial);
      setForm(profileToForm(merged));
      setPhase("empty");
      return;
    }

    setPhase("empty");
  }, [ready, markRadarStarted]);

  // Hydration fallback — never stay on boot forever
  useEffect(() => {
    if (!ready) return;
    if (phase !== "boot") return;
    const t = window.setTimeout(() => setPhase("empty"), 80);
    return () => window.clearTimeout(t);
  }, [ready, phase]);

  const activeProfile = useMemo(() => {
    if (useDemo) return DEMO_REFINANCE_PROFILE;
    return profile;
  }, [profile, useDemo]);

  const model: RefinanceRadarDashboard | null = useMemo(() => {
    void tick;
    if (!ready || !activeProfile) return null;
    const store = loadRefinanceRadarStore();
    return buildRefinanceRadarDashboard({
      profile: activeProfile,
      rates,
      resolvedRate: resolved,
      emittedMilestones: store.emittedMilestones,
    });
  }, [ready, activeProfile, rates, resolved, tick]);

  const handleCalculate = useCallback(() => {
    if (!isFormCompleteEnough(form)) {
      setFormError(
        "Vyplňte zůstatek, sazbu, konec fixace a současnou měsíční splátku."
      );
      return;
    }
    setFormError(null);
    const updated = formToProfile(form, profile);
    saveLoanProfile(updated);
    setProfile(updated);
    setUseDemo(false);
    setPhase("results");
    setTick((t) => t + 1);
    markRadarStarted();

    const store = loadRefinanceRadarStore();
    const market = buildRefinanceRadarDashboard({
      profile: updated,
      rates,
      resolvedRate: resolved,
      emittedMilestones: store.emittedMilestones,
    }).marketReference;
    const { alerts, emittedMilestones } = generateRefinanceAlerts({
      profile: updated,
      marketRatePercent: market.ratePercent,
      emittedMilestones: store.emittedMilestones,
    });
    if (alerts.length > 0) {
      persistRefinanceAlerts({ alerts, emittedMilestones });
    }
  }, [form, profile, rates, resolved, markRadarStarted]);

  const handleSaveWatch = useCallback(() => {
    if (!profile && !useDemo) {
      setWatchMessage("Nejdřív spočítejte svou hypotéku a uložte údaje.");
      return;
    }
    if (useDemo && !profile) {
      const updated = DEMO_REFINANCE_PROFILE;
      saveLoanProfile(updated);
      setProfile(updated);
      setUseDemo(false);
    }
    const next = !watchEnabled;
    saveRefinanceWatch(next);
    setWatchEnabled(next);
    setWatchMessage(
      next
        ? "Hlídání uloženo v tomto prohlížeči. Upozornění uvidíte při další návštěvě a v Centru upozornění. E-mailové notifikace zatím nejsou dostupné."
        : "Hlídání vypnuto."
    );
  }, [profile, useDemo, watchEnabled]);

  const handleLoadDemo = useCallback(() => {
    setUseDemo(true);
    setForm(profileToForm(DEMO_REFINANCE_PROFILE));
    setFormError(null);
    setPhase("results");
    setTick((t) => t + 1);
    markRadarStarted();
  }, [markRadarStarted]);

  const handleReset = useCallback(() => {
    clearRefinanceRadarProfile();
    setProfile(null);
    setForm(emptyForm());
    setUseDemo(false);
    setWatchEnabled(false);
    setWatchMessage(null);
    setFormError(null);
    setPhase("empty");
  }, []);

  if (!ready || phase === "boot") {
    return (
      <div className="mx-auto max-w-5xl space-y-4 px-4 py-16">
        <div className="h-8 w-56 animate-pulse rounded bg-slate-200" />
        <div className="h-32 animate-pulse rounded-2xl bg-slate-100" />
        <p className="text-sm text-muted-foreground">
          Připravuji hlídač refinancování…
        </p>
      </div>
    );
  }

  const comparison = model?.comparison;
  const paymentScenarios = model?.paymentScenarios ?? [];
  const timeline = model?.timeline ?? [];
  const alerts = model?.alerts ?? [];
  const marketReference = model?.marketReference;
  const monthsToFixation = model?.monthsToFixation ?? null;
  const isUrgent = monthsToFixation != null && monthsToFixation <= 3;
  const showResults = phase === "results" && model != null && activeProfile != null;

  return (
    <div className="min-h-screen min-w-0 bg-gradient-to-b from-[#eef3f1] to-white">
      <header className="border-b border-border bg-deep-teal text-white">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-gold">
            Hlídač refinancování ·{" "}
            {FEATURE_STATUS_LABELS[REFINANCE_RADAR_FEATURE_STATUS]}
          </p>
          <h1 className="mt-2 font-heading text-3xl font-black md:text-4xl">
            Hlídač refinancování
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-emerald-50/90">
            Spočítejte čas do konce fixace, porovnejte modelové scénáře a uložte
            si hlídání v prohlížeči. Orientační model — ne individuální nabídka
            banky.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            {showResults ? (
              <button
                type="button"
                onClick={() => setPhase("empty")}
                className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 font-semibold hover:bg-white/25"
              >
                <RefreshCw className="h-4 w-4" />
                Upravit údaje
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleLoadDemo}
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 font-semibold hover:bg-white/10"
            >
              Načíst demo
            </button>
          </div>
          {useDemo ? (
            <p className="mt-3 text-xs text-amber-200">
              Zobrazena demo data — zadejte svou hypotéku pro osobní výsledek.
            </p>
          ) : null}
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 px-4 py-10">
        {!online ? (
          <div
            className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950"
            role="status"
          >
            <WifiOff className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Jste offline. Výpočet z vašich údajů funguje lokálně; živé sazby a
              synchronizace nemusí být aktuální.
            </p>
          </div>
        ) : null}

        {!ratesLoading &&
        (ratesError ||
          resolved.liveUnavailable ||
          resolved.isModelFallback) ? (
          <div
            className="rounded-xl border border-slate-200 bg-white px-4 py-3"
            role="status"
          >
            <p className="text-sm font-medium text-text-dark">
              {LIVE_RATES_UNAVAILABLE_MESSAGE}
            </p>
            <div className="mt-2">
              <RateProvenanceBanner resolved={resolved} />
            </div>
          </div>
        ) : (
          <RateProvenanceBanner resolved={resolved} />
        )}

        {/* ---- MVP form ---- */}
        {(phase === "empty" || !showResults) && (
          <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <h2 className="font-heading text-lg font-bold text-deep-teal">
              Zadejte údaje o hypotéce
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Povinné: zůstatek, sazba, konec fixace, splátka. Kontaktní údaje
              až pokud chcete konzultaci — ne pro falešné „automatické e-maily“.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {(
                [
                  {
                    label: "Kolik zbývá doplatit? (Kč)",
                    key: "loanBalanceCzk" as const,
                    type: "number",
                    placeholder: "3 850 000",
                  },
                  {
                    label: "Aktuální sazba (%)",
                    key: "ratePercent" as const,
                    type: "text",
                    placeholder: "5,49",
                  },
                  {
                    label: "Konec fixace",
                    key: "fixationEnd" as const,
                    type: "date",
                    placeholder: "",
                  },
                  {
                    label: "Současná měsíční splátka (Kč)",
                    key: "monthlyPaymentCzk" as const,
                    type: "number",
                    placeholder: "24 200",
                  },
                  {
                    label: "Orientační hodnota nemovitosti (Kč, volitelné)",
                    key: "propertyValueCzk" as const,
                    type: "number",
                    placeholder: "5 200 000",
                  },
                ] as const
              ).map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    {label}
                  </label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, [key]: e.target.value }))
                    }
                    className="min-h-11 w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-deep-teal"
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setAdvancedOpen((v) => !v)}
              className="mt-4 text-sm font-semibold text-deep-teal"
            >
              {advancedOpen ? "Skrýt pokročilé" : "Pokročilé (banka, poplatky, doba)"}
            </button>

            {advancedOpen ? (
              <div className="mt-4 grid gap-4 border-t border-border pt-4 sm:grid-cols-2 lg:grid-cols-3">
                {(
                  [
                    {
                      label: "Banka / věřitel",
                      key: "currentLender" as const,
                      type: "text",
                    },
                    {
                      label: "Zbývající doba splácení (roky)",
                      key: "remainingTermYears" as const,
                      type: "number",
                    },
                    {
                      label: "Nová doba splácení (roky)",
                      key: "newTermYears" as const,
                      type: "number",
                    },
                    {
                      label: "Poplatky refinancování (Kč)",
                      key: "refinancingFeesCzk" as const,
                      type: "number",
                    },
                    {
                      label: "Penalizace předčasného splacení (Kč)",
                      key: "earlyRepaymentPenaltyCzk" as const,
                      type: "number",
                    },
                    {
                      label: "Δ pojištění (Kč/měs.)",
                      key: "insuranceMonthlyDeltaCzk" as const,
                      type: "number",
                    },
                  ] as const
                ).map(({ label, key, type }) => (
                  <div key={key}>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                      {label}
                    </label>
                    <input
                      type={type}
                      value={form[key]}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, [key]: e.target.value }))
                      }
                      className="min-h-11 w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-deep-teal"
                    />
                  </div>
                ))}
                <label className="flex items-center gap-2 pt-6 text-sm">
                  <input
                    type="checkbox"
                    checked={form.hasInsuranceBundle}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        hasInsuranceBundle: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 accent-deep-teal"
                  />
                  Pojištění je v balíku stávající banky
                </label>
              </div>
            ) : null}

            <label className="mt-5 flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.wantConsultation}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    wantConsultation: e.target.checked,
                  }))
                }
                className="mt-0.5 h-4 w-4 accent-deep-teal"
              />
              <span>
                Chci po výpočtu možnost konzultace se specialistou (kontaktní
                formulář — ne automatický e-mail o sazbách).
              </span>
            </label>

            {formError ? (
              <p className="mt-3 text-sm text-amber-800" role="alert">
                {formError}
              </p>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleCalculate}
                className="min-h-11 rounded-lg bg-deep-teal px-6 py-2.5 text-sm font-semibold text-white hover:bg-deep-teal/90"
              >
                {CTA_CS.calculate}
              </button>
              <button
                type="button"
                onClick={handleLoadDemo}
                className="min-h-11 rounded-lg border border-border px-6 py-2.5 text-sm text-muted-foreground hover:bg-muted/50"
              >
                Zobrazit demo
              </button>
              {profile ? (
                <button
                  type="button"
                  onClick={handleReset}
                  className="min-h-11 rounded-lg border border-border px-6 py-2.5 text-sm text-muted-foreground hover:bg-muted/50"
                >
                  Vymazat uložené
                </button>
              ) : null}
            </div>
          </section>
        )}

        {phase === "empty" && !profile && !useDemo ? (
          <section className="rounded-2xl border border-dashed border-border bg-white/70 p-8 text-center">
            <h2 className="font-heading text-xl font-bold text-text-dark">
              Zatím žádný výsledek
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
              Vyplňte údaje výše, nebo načtěte demo. Bez vašich čísel
              nevymýšlíme živé sazby ani falešná upozornění.
            </p>
          </section>
        ) : null}

        {showResults && activeProfile && model ? (
          <>
            {/* KPIs */}
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: <CalendarClock className="h-5 w-5" />,
                  label: "Do konce fixace",
                  value:
                    monthsToFixation != null
                      ? `${monthsToFixation} měs.`
                      : "—",
                  sub: fmtDate(activeProfile.fixationEnd),
                  urgent: isUrgent,
                },
                {
                  icon: <Clock className="h-5 w-5" />,
                  label: "Doporučený začátek řešení",
                  value: fmtDate(model.recommendedStartDate),
                  sub: `${model.recommendedStartMonthsBefore} měs. před koncem fixace`,
                  urgent: false,
                },
                {
                  icon: <TrendingDown className="h-5 w-5" />,
                  label: "Vaše sazba",
                  value: fmtPct(model.currentRate.value),
                  sub: "DATA z vašeho zadání",
                  urgent: false,
                },
                {
                  icon: <TrendingUp className="h-5 w-5" />,
                  label: "Tržní reference",
                  value:
                    marketReference?.ratePercent != null
                      ? fmtPct(marketReference.ratePercent)
                      : "Nedostupná",
                  sub: rateStatusLabel(marketReference?.rateStatus),
                  urgent: false,
                },
              ].map(({ icon, label, value, sub, urgent }) => (
                <div
                  key={label}
                  className={`rounded-2xl border p-5 ${
                    urgent
                      ? "border-amber-400 bg-amber-50"
                      : "border-border bg-white"
                  }`}
                >
                  <div
                    className={`mb-2 flex h-9 w-9 items-center justify-center rounded-full ${
                      urgent
                        ? "bg-amber-100 text-amber-700"
                        : "bg-deep-teal/10 text-deep-teal"
                    }`}
                  >
                    {icon}
                  </div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="mt-1 font-heading text-xl font-bold text-foreground">
                    {value}
                  </p>
                  {sub ? (
                    <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
                  ) : null}
                </div>
              ))}
            </section>

            {activeProfile.propertyValueCzk != null &&
            activeProfile.propertyValueCzk > 0 ? (
              <p className="text-sm text-muted-foreground">
                Orientační LTV kontext: zůstatek{" "}
                {fmtCzk(activeProfile.loanBalanceCzk)} / hodnota{" "}
                {fmtCzk(activeProfile.propertyValueCzk)} ≈{" "}
                {(
                  (activeProfile.loanBalanceCzk /
                    activeProfile.propertyValueCzk) *
                  100
                ).toFixed(0)}{" "}
                % (MODEL — ne ocenění banky).
              </p>
            ) : null}

            {/* Payment delta */}
            <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <h2 className="font-heading text-xl font-bold text-deep-teal">
                Orientační rozdíl splátek
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Současná splátka {fmtCzk(activeProfile.monthlyPaymentCzk)} vs.
                model při referenční sazbě{" "}
                {fmtPct(marketReference?.ratePercent)} (
                {rateStatusLabel(marketReference?.rateStatus)}).
              </p>
              <p className="mt-3 font-heading text-2xl font-bold tabular-nums text-deep-teal">
                {comparison?.potentialMonthlySavingCzk != null
                  ? `− ${fmtCzk(comparison.potentialMonthlySavingCzk)} / měs.`
                  : "Bez modelové úspory při této referenci"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Před poplatky a individuálním schválením banky.
              </p>
            </section>

            {/* Scenarios */}
            <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <h2 className="mb-1 font-heading text-xl font-bold text-deep-teal">
                Modelové scénáře sazeb
              </h2>
              <p className="mb-4 text-xs text-muted-foreground">
                Anuita na zadaném zůstatku — ne vaše individuální bankovní
                nabídka.
              </p>
              {paymentScenarios.length === 0 ? (
                <p className="flex items-center gap-2 text-sm text-amber-800">
                  <AlertTriangle className="h-4 w-4" />
                  Scénáře nelze spočítat — zkontrolujte zůstatek a sazbu.
                </p>
              ) : (
                <div className="divide-y divide-border">
                  {paymentScenarios.map((sc) => (
                    <div
                      key={sc.id}
                      className="flex min-w-0 flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{sc.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {fmtPct(sc.ratePercent)}
                        </p>
                      </div>
                      <div className="flex min-w-0 flex-wrap items-center gap-2 sm:justify-end">
                        <span className="font-heading text-lg font-bold tabular-nums text-deep-teal">
                          {fmtCzk(sc.monthlyPaymentCzk)}
                        </span>
                        <ClaimBadge kind={sc.claimKind} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Timeline 12/9/6/3/1 */}
            <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <h2 className="mb-4 font-heading text-xl font-bold text-deep-teal">
                Časová osa (12 · 9 · 6 · 3 · 1 měsíc)
              </h2>
              {timeline.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Zadejte platný konec fixace pro timeline.
                </p>
              ) : (
                <div className="relative pl-6">
                  <div className="absolute left-2 top-0 h-full w-px bg-border" />
                  {timeline.map((m) => {
                    const label =
                      m.monthsBefore === 1
                        ? "1 měsíc"
                        : `${m.monthsBefore} měsíců`;
                    return (
                      <div key={m.monthsBefore} className="relative mb-6">
                        <div className="absolute -left-4 top-1">
                          <TimelineDot status={m.status} />
                        </div>
                        <p
                          className={`text-sm font-semibold ${
                            m.status === "active"
                              ? "text-muted-gold"
                              : m.status === "passed"
                                ? "text-emerald-600"
                                : "text-muted-foreground"
                          }`}
                        >
                          {label} před koncem fixace
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {fmtDate(m.dueAt)}
                          {m.status === "active"
                            ? " — právě nyní aktivní okno"
                            : ""}
                          {m.status === "passed" ? " — splněno" : ""}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Watch — honest local only */}
            <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <h2 className="flex items-center gap-2 font-heading text-xl font-bold text-deep-teal">
                <Bell className="h-5 w-5" />
                Uložit hlídání
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Dostupné: uložení v tomto prohlížeči a zobrazení v{" "}
                <Link
                  href={routes.alertCenter}
                  className="font-semibold text-deep-teal underline-offset-2 hover:underline"
                >
                  Centru upozornění
                </Link>
                . E-mailové / push notifikace zatím nejsou spuštěné — neslibujeme
                automatický kontakt.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleSaveWatch}
                  className="inline-flex items-center gap-2 rounded-full bg-deep-teal px-5 py-2.5 text-sm font-semibold text-white hover:bg-deep-teal/90"
                >
                  <Save className="h-4 w-4" />
                  {watchEnabled ? "Vypnout hlídání" : "Uložit hlídání"}
                </button>
                {watchEnabled ? (
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                    Aktivní (local)
                  </span>
                ) : null}
              </div>
              {watchMessage ? (
                <p className="mt-3 text-sm text-muted-foreground" role="status">
                  {watchMessage}
                </p>
              ) : null}
            </section>

            {alerts.length > 0 ? (
              <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
                <h2 className="mb-4 flex items-center gap-2 font-heading text-xl font-bold text-amber-800">
                  <Bell className="h-5 w-5" />
                  Personalizované alerty (in-app)
                </h2>
                <div className="space-y-4">
                  {alerts.map((a) => (
                    <div
                      key={a.id}
                      className="rounded-xl border border-amber-200 bg-white p-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground">
                          {a.title}
                        </p>
                        <ClaimBadge kind={a.claimKind} />
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {a.body}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {/* Stay vs refinance */}
            {comparison ? (
              <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                <h2 className="mb-1 font-heading text-xl font-bold text-deep-teal">
                  Zůstat vs. refinancovat
                </h2>
                <p className="mb-4 text-xs text-muted-foreground">
                  {comparison.summary}
                </p>
                <div className="mb-6 grid gap-3 sm:grid-cols-3">
                  {[
                    {
                      label: "Bod zvratu",
                      value:
                        comparison.breakEvenMonths != null
                          ? `${comparison.breakEvenMonths} měs.`
                          : "Neurčitelný",
                      sub: "MODEL — po uhrazení poplatků",
                    },
                    {
                      label: "Celkové náklady — zůstat",
                      value: fmtCzk(comparison.stayTotalCostCzk),
                      sub: "MODEL",
                    },
                    {
                      label: "Celkové náklady — refinancovat",
                      value: fmtCzk(comparison.refinanceTotalCostCzk),
                      sub: `vč. poplatků ${fmtCzk(comparison.upfrontRefinanceCostsCzk)}`,
                    },
                  ].map(({ label, value, sub }) => (
                    <div
                      key={label}
                      className="rounded-xl border border-border bg-muted/30 p-4"
                    >
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="mt-1 font-heading text-lg font-bold">
                        {value}
                      </p>
                      <p className="text-xs text-muted-foreground">{sub}</p>
                    </div>
                  ))}
                </div>
                <div className="max-w-full min-w-0 overflow-x-auto rounded-lg border border-border">
                  <table className="w-full min-w-[36rem] text-left">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="py-2 pr-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Dimenze
                        </th>
                        <th className="py-2 pr-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Zůstat
                        </th>
                        <th className="py-2 pr-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Refinancovat
                        </th>
                        <th className="py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {comparison.rows.map((row) => (
                        <tr key={row.dimension}>
                          <Td>
                            <span className="font-medium">{row.dimension}</span>
                          </Td>
                          <Td>{row.stay}</Td>
                          <Td>{row.refinance}</Td>
                          <td className="py-2 align-top">
                            <ClaimBadge kind={row.claimKind} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ) : null}

            <WhatNextPanel
              className="mt-2"
              actions={[
                {
                  id: "alerts",
                  label: "Nastavit hlídání sazeb",
                  description:
                    "Lokální připomínky v prohlížeči — bez falešných e-mailů.",
                  href: routes.alertCenter,
                  primary: true,
                },
                {
                  id: "readiness",
                  label: CTA_CS.readiness,
                  description: "Připravenost před jednáním s bankou.",
                  href: routes.navrhNaMiru,
                },
                {
                  id: "moznosti",
                  label: CTA_CS.discoverOptions,
                  description: "Celková diagnostika rozpočtu.",
                  href: routes.mojeMoznosti,
                },
              ]}
            />

            <section className="rounded-2xl border border-border bg-muted/30 p-5">
              <h3 className="mb-3 flex items-center gap-2 font-heading text-base font-bold text-foreground">
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                Metodika a omezení modelu
              </h3>
              <ul className="space-y-1">
                {model.methodology.map((m) => (
                  <li
                    key={m}
                    className="flex items-start gap-2 text-xs text-muted-foreground"
                  >
                    <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
                    {m}
                  </li>
                ))}
              </ul>
              <ClaimLegend />
            </section>

            {form.wantConsultation ? (
              <section className="rounded-2xl bg-deep-teal p-8 text-center text-white">
                <h2 className="font-heading text-2xl font-black">
                  Konzultace se specialistou
                </h2>
                <p className="mt-2 text-sm text-emerald-50/90">
                  Požádali jste o možnost konzultace. Kontakt probíhá přes
                  formulář — neautomaticky. Výše jsou MODEL / LIVE reference, ne
                  závazná nabídka.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  <Link
                    href={routes.navrhNaMiru}
                    className="inline-flex items-center gap-2 rounded-full bg-muted-gold px-6 py-3 font-semibold text-deep-teal hover:bg-muted-gold/90"
                  >
                    <UserCheck className="h-4 w-4" />
                    Návrh na míru
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href={routes.kontakt}
                    className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold hover:bg-white/10"
                  >
                    Kontaktní formulář
                  </Link>
                </div>
              </section>
            ) : (
              <section className="rounded-2xl border border-border bg-white p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Chcete ověřit možnosti u člověka? Zaškrtněte konzultaci ve
                  formuláři, nebo přejděte na{" "}
                  <Link
                    href={routes.kontakt}
                    className="font-semibold text-deep-teal underline-offset-2 hover:underline"
                  >
                    kontakt
                  </Link>
                  .
                </p>
              </section>
            )}
          </>
        ) : null}
      </main>
    </div>
  );
}
