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
  AlertTriangle,
  Bell,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clock,
  HelpCircle,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  UserCheck,
} from "lucide-react";
import {
  ClaimBadge,
  ClaimLegend,
} from "@/components/property-rentgen/ClaimBadge";
import { useCurrentRates } from "@/lib/rates";
import { routes } from "@/lib/routes";
import { FEATURE_STATUS_LABELS } from "@/lib/majetio/types";
import {
  DEMO_REFINANCE_PROFILE,
  REFINANCE_RADAR_FEATURE_STATUS,
  buildRefinanceRadarDashboard,
  emptyLoanProfile,
  importFromFinancialProfile,
  loadRefinanceRadarStore,
  saveLoanProfile,
  type RefinanceLoanProfile,
  type RefinanceRadarDashboard,
} from "@/lib/refinance-radar";
import { loadFinancialProfile } from "@/lib/financial-passport";

function subscribeNoop() {
  return () => {};
}
function useIsClient() {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
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

/* ---- Inline form ---- */
type FormState = {
  currentLender: string;
  loanBalanceCzk: string;
  ratePercent: string;
  fixationEnd: string;
  monthlyPaymentCzk: string;
  remainingTermYears: string;
  newTermYears: string;
  refinancingFeesCzk: string;
  earlyRepaymentPenaltyCzk: string;
  insuranceMonthlyDeltaCzk: string;
  hasInsuranceBundle: boolean;
};

function profileToForm(p: RefinanceLoanProfile): FormState {
  return {
    currentLender: p.currentLender,
    loanBalanceCzk: p.loanBalanceCzk > 0 ? String(p.loanBalanceCzk) : "",
    ratePercent: p.ratePercent > 0 ? String(p.ratePercent) : "",
    fixationEnd: p.fixationEnd,
    monthlyPaymentCzk: p.monthlyPaymentCzk > 0 ? String(p.monthlyPaymentCzk) : "",
    remainingTermYears: String(p.remainingTermYears),
    newTermYears: String(p.newTermYears),
    refinancingFeesCzk: String(p.refinancingFeesCzk),
    earlyRepaymentPenaltyCzk: p.earlyRepaymentPenaltyCzk != null ? String(p.earlyRepaymentPenaltyCzk) : "",
    insuranceMonthlyDeltaCzk: String(p.insuranceMonthlyDeltaCzk),
    hasInsuranceBundle: p.hasInsuranceBundle,
  };
}

function formToProfile(f: FormState, base: RefinanceLoanProfile): RefinanceLoanProfile {
  return {
    ...base,
    currentLender: f.currentLender,
    loanBalanceCzk: Number(f.loanBalanceCzk) || 0,
    ratePercent: Number(f.ratePercent) || 0,
    fixationEnd: f.fixationEnd,
    monthlyPaymentCzk: Number(f.monthlyPaymentCzk) || 0,
    remainingTermYears: Number(f.remainingTermYears) || 25,
    newTermYears: Number(f.newTermYears) || 25,
    refinancingFeesCzk: Number(f.refinancingFeesCzk) || 25_000,
    earlyRepaymentPenaltyCzk: f.earlyRepaymentPenaltyCzk !== "" ? Number(f.earlyRepaymentPenaltyCzk) : null,
    insuranceMonthlyDeltaCzk: Number(f.insuranceMonthlyDeltaCzk) || 0,
    hasInsuranceBundle: f.hasInsuranceBundle,
    updatedAt: new Date().toISOString(),
  };
}

/* ---- Timeline dot ---- */
function TimelineDot({ status }: { status: "upcoming" | "active" | "passed" }) {
  if (status === "active") return <span className="h-4 w-4 rounded-full bg-muted-gold ring-2 ring-muted-gold/30 block" />;
  if (status === "passed") return <span className="h-4 w-4 rounded-full bg-emerald-500 block" />;
  return <span className="h-4 w-4 rounded-full border-2 border-border bg-white block" />;
}

/* ---- Claim row label ---- */
function Td({ children }: { children: React.ReactNode }) {
  return <td className="py-2 pr-4 text-sm align-top">{children}</td>;
}

/* ============================================================ */
export function RefinanceRadarView() {
  const ready = useIsClient();
  const { rates } = useCurrentRates();

  const [profile, setProfile] = useState<RefinanceLoanProfile | null>(null);
  const [form, setForm] = useState<FormState>(profileToForm(DEMO_REFINANCE_PROFILE));
  const [editing, setEditing] = useState(false);
  const [tick, setTick] = useState(0);
  const [useDemo, setUseDemo] = useState(false);

  // Load stored profile or auto-import from Financial Passport
  useEffect(() => {
    if (!ready) return;
    const store = loadRefinanceRadarStore();
    if (store.profile) {
      setProfile(store.profile);
      setForm(profileToForm(store.profile));
    } else {
      const fp = loadFinancialProfile();
      if (fp) {
        const partial = importFromFinancialProfile(fp);
        const merged = emptyLoanProfile(partial);
        setProfile(merged);
        setForm(profileToForm(merged));
        setEditing(true); // prompt user to fill in missing fields
      } else {
        setUseDemo(true);
      }
    }
  }, [ready]);

  const activeProfile = useMemo(
    () => (useDemo ? DEMO_REFINANCE_PROFILE : (profile ?? DEMO_REFINANCE_PROFILE)),
    [profile, useDemo]
  );

  const model: RefinanceRadarDashboard | null = useMemo(() => {
    void tick;
    if (!ready) return null;
    const store = loadRefinanceRadarStore();
    return buildRefinanceRadarDashboard({
      profile: activeProfile,
      rates: rates ?? null,
      emittedMilestones: store.emittedMilestones,
    });
  }, [ready, activeProfile, rates, tick]);

  const handleSave = useCallback(() => {
    const updated = formToProfile(form, activeProfile);
    saveLoanProfile(updated);
    setProfile(updated);
    setUseDemo(false);
    setEditing(false);
    setTick((t) => t + 1);
  }, [form, activeProfile]);

  if (!ready || !model) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 px-4 py-16">
        <div className="h-8 w-56 animate-pulse rounded bg-slate-200" />
        <div className="h-32 animate-pulse rounded-2xl bg-slate-100" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
        </div>
        <p className="sr-only">Načítám hlídač refinancování</p>
      </div>
    );
  }

  const { comparison, paymentScenarios, timeline, alerts, marketReference, monthsToFixation } = model;
  const isUrgent = monthsToFixation != null && monthsToFixation <= 3;

  return (
    <div className="min-h-screen min-w-0 bg-gradient-to-b from-[#eef3f1] to-white">
      {/* ---- Header ---- */}
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
            Sledujte svou fixaci, porovnejte scénáře a rozhodujte se s jasnou
            hlavou — ne pod tlakem „jen dnes“. Orientační model — ne individuální nabídka banky.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <button
              type="button"
              onClick={() => setEditing((e) => !e)}
              className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 font-semibold hover:bg-white/25"
            >
              <RefreshCw className="h-4 w-4" />
              {editing ? "Skrýt formulář" : "Upravit údaje"}
            </button>
            <Link
              href={routes.navrhNaMiru}
              className="inline-flex items-center gap-2 rounded-full bg-muted-gold/90 px-4 py-2 font-semibold text-deep-teal hover:bg-muted-gold"
            >
              <UserCheck className="h-4 w-4" />
              Nechat možnosti ověřit specialistou
            </Link>
          </div>
          {useDemo && (
            <p className="mt-3 text-xs text-amber-200">
              ⚠ Zobrazena demo data — zadejte svou hypotéku níže.
            </p>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 px-4 py-10">

        {/* ---- Form ---- */}
        {editing && (
          <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-heading text-lg font-bold text-deep-teal">
              Údaje o hypotéce
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { label: "Banka / věřitel", key: "currentLender", type: "text", placeholder: "např. Česká spořitelna" },
                { label: "Zůstatek úvěru (Kč)", key: "loanBalanceCzk", type: "number", placeholder: "3 850 000" },
                { label: "Sazba (%)", key: "ratePercent", type: "number", placeholder: "5,49" },
                { label: "Konec fixace", key: "fixationEnd", type: "date", placeholder: "" },
                { label: "Měsíční splátka (Kč)", key: "monthlyPaymentCzk", type: "number", placeholder: "24 200" },
                { label: "Zbývající doba splácení (roky)", key: "remainingTermYears", type: "number", placeholder: "22" },
                { label: "Nová doba splácení (roky)", key: "newTermYears", type: "number", placeholder: "20" },
                { label: "Odhadované poplatky refinancování (Kč)", key: "refinancingFeesCzk", type: "number", placeholder: "28 000" },
                { label: "Penalizace za předčasné splacení (Kč, neznáme = prázdné)", key: "earlyRepaymentPenaltyCzk", type: "number", placeholder: "45 000" },
                { label: "Δ pojištění při refinancování (Kč/měs.)", key: "insuranceMonthlyDeltaCzk", type: "number", placeholder: "350" },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    {label}
                  </label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={(form as Record<string, string | boolean>)[key] as string}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-deep-teal"
                  />
                </div>
              ))}
              <div className="flex items-center gap-2 pt-4">
                <input
                  id="insurance"
                  type="checkbox"
                  checked={form.hasInsuranceBundle}
                  onChange={(e) => setForm((f) => ({ ...f, hasInsuranceBundle: e.target.checked }))}
                  className="h-4 w-4 accent-deep-teal"
                />
                <label htmlFor="insurance" className="text-sm text-foreground">
                  Pojištění je součástí balíku stávající banky
                </label>
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={handleSave}
                className="rounded-full bg-deep-teal px-6 py-2 text-sm font-semibold text-white hover:bg-deep-teal/90"
              >
                Uložit a spočítat
              </button>
              <button
                type="button"
                onClick={() => { setUseDemo(true); setEditing(false); }}
                className="rounded-full border border-border px-6 py-2 text-sm text-muted-foreground hover:bg-muted/50"
              >
                Zobrazit demo
              </button>
            </div>
          </section>
        )}

        {/* ---- Dashboard KPIs ---- */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: <CalendarClock className="h-5 w-5" />,
              label: "Do konce fixace",
              value: monthsToFixation != null
                ? `${monthsToFixation} měs.`
                : "—",
              sub: activeProfile.fixationEnd
                ? new Date(activeProfile.fixationEnd).toLocaleDateString("cs-CZ")
                : "",
              urgent: isUrgent,
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
              value: marketReference.ratePercent != null
                ? fmtPct(marketReference.ratePercent)
                : "Nedostupná",
              sub: marketReference.claimKind,
              urgent: false,
            },
            {
              icon: <Clock className="h-5 w-5" />,
              label: "Potenciální úspora/měs.",
              value: comparison.potentialMonthlySavingCzk != null
                ? fmtCzk(comparison.potentialMonthlySavingCzk)
                : "—",
              sub: "Orientační model — před poplatky",
              urgent: comparison.potentialMonthlySavingCzk != null && comparison.potentialMonthlySavingCzk > 1000,
            },
          ].map(({ icon, label, value, sub, urgent }) => (
            <div
              key={label}
              className={`rounded-2xl border p-5 ${urgent ? "border-amber-400 bg-amber-50" : "border-border bg-white"}`}
            >
              <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-full ${urgent ? "bg-amber-100 text-amber-700" : "bg-deep-teal/10 text-deep-teal"}`}>
                {icon}
              </div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-1 font-heading text-xl font-bold text-foreground">{value}</p>
              {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
            </div>
          ))}
        </section>

        {/* ---- Payment Scenarios ---- */}
        <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <h2 className="mb-1 font-heading text-xl font-bold text-deep-teal">
            Scénáře splátky
          </h2>
          <p className="mb-4 text-xs text-muted-foreground">
            Orientační model — anuita na zadaném zůstatku, ne vaše individuální bankovní nabídka.
          </p>
          <div className="divide-y divide-border">
            {paymentScenarios.map((sc) => (
              <div key={sc.id} className="flex min-w-0 flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{sc.label}</p>
                  <p className="text-xs text-muted-foreground">{fmtPct(sc.ratePercent)}</p>
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
          {marketReference.ratePercent == null && (
            <p className="mt-3 flex items-center gap-2 text-xs text-amber-700">
              <AlertTriangle className="h-4 w-4" />
              {marketReference.note}
            </p>
          )}
        </section>

        {/* ---- Timeline ---- */}
        <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-heading text-xl font-bold text-deep-teal">
            Časová osa fixace
          </h2>
          <div className="relative pl-6">
            <div className="absolute left-2 top-0 h-full w-px bg-border" />
            {timeline.map((m) => {
              const label = m.monthsBefore === 1 ? "1 měsíc" : `${m.monthsBefore} měsíců`;
              return (
                <div key={m.monthsBefore} className="relative mb-6">
                  <div className="absolute -left-4 top-1">
                    <TimelineDot status={m.status} />
                  </div>
                  <p className={`text-sm font-semibold ${m.status === "active" ? "text-muted-gold" : m.status === "passed" ? "text-emerald-600" : "text-muted-foreground"}`}>
                    {label} před koncem fixace
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(m.dueAt).toLocaleDateString("cs-CZ")}
                    {m.status === "active" && " — právě nyní aktivní okno"}
                    {m.status === "passed" && " — splněno"}
                  </p>
                  {m.monthsBefore === 12 && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Začněte zjišťovat možnosti bez tlaku.
                    </p>
                  )}
                  {m.monthsBefore === 6 && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Ideální čas na nezávaznou konzultaci se specialistou.
                    </p>
                  )}
                  {m.monthsBefore === 3 && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Většina bank vyžaduje žádost nejméně 2–3 měsíce předem (NEOVERENO — ověřte u vaší banky).
                    </p>
                  )}
                  {m.monthsBefore === 1 && (
                    <p className="mt-1 text-xs text-amber-700">
                      ⚠ Kritické okno — rozhodnutí bez plného informačního komfortu.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ---- Personalized Alerts ---- */}
        {alerts.length > 0 && (
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <h2 className="mb-4 flex items-center gap-2 font-heading text-xl font-bold text-amber-800">
              <Bell className="h-5 w-5" />
              Personalizované alerty
            </h2>
            <div className="space-y-4">
              {alerts.map((a) => (
                <div key={a.id} className="rounded-xl border border-amber-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">{a.title}</p>
                    <ClaimBadge kind={a.claimKind} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {new Date(a.createdAt).toLocaleDateString("cs-CZ")}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ---- Stay vs Refinance ---- */}
        <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <h2 className="mb-1 font-heading text-xl font-bold text-deep-teal">
            Zůstat vs. refinancovat
          </h2>
          <p className="mb-4 text-xs text-muted-foreground">
            {comparison.summary}
          </p>

          {/* Summary boxes */}
          <div className="mb-6 grid gap-3 sm:grid-cols-3">
            {[
              {
                label: "Bod zvratu",
                value: comparison.breakEvenMonths != null
                  ? `${comparison.breakEvenMonths} měs.`
                  : "Neurčitelný",
                sub: "Orientační model — po uhrazení poplatků",
                color: "bg-deep-teal/5 border-deep-teal/20",
              },
              {
                label: "Celkové náklady — zůstat",
                value: fmtCzk(comparison.stayTotalCostCzk),
                sub: "MODEL",
                color: "bg-muted/30 border-border",
              },
              {
                label: "Celkové náklady — refinancovat",
                value: fmtCzk(comparison.refinanceTotalCostCzk),
                sub: `vč. poplatků ${fmtCzk(comparison.upfrontRefinanceCostsCzk)}`,
                color: "bg-muted/30 border-border",
              },
            ].map(({ label, value, sub, color }) => (
              <div key={label} className={`rounded-xl border p-4 ${color}`}>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-1 font-heading text-lg font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{sub}</p>
              </div>
            ))}
          </div>

          {/* Detail table */}
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
                    <Td><span className="font-medium">{row.dimension}</span></Td>
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

        {/* ---- Methodology ---- */}
        <section className="rounded-2xl border border-border bg-muted/30 p-5">
          <h3 className="mb-3 flex items-center gap-2 font-heading text-base font-bold text-foreground">
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
            Metodika a omezení modelu
          </h3>
          <ul className="space-y-1">
            {model.methodology.map((m) => (
              <li key={m} className="flex items-start gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
                {m}
              </li>
            ))}
          </ul>
          <ClaimLegend />
        </section>

        {/* ---- CTA ---- */}
        <section className="rounded-2xl bg-deep-teal p-8 text-center text-white">
          <h2 className="font-heading text-2xl font-black">
            Nechat možnosti ověřit specialistou
          </h2>
          <p className="mt-2 text-sm text-emerald-50/90">
            Výše jsou MODEL / ODHAD — ne vaše individuální bankovní nabídka.
            Specialista porovná skutečné podmínky konkrétních bank.
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
              Kontaktovat poradce
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
