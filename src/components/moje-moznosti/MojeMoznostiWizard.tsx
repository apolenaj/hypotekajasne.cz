"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  RotateCcw,
  Shield,
} from "lucide-react";
import {
  buildMojeMoznostiResult,
  canComputeFirstResult,
  EMPTY_MATCHING_PREFS,
  type MatchingPreferences,
  type MojeMoznostiResult,
} from "@/lib/moje-moznosti";
import {
  EMPTY_PROFILE,
  clearPassportTimeline,
  loadFinancialProfile,
  saveFinancialProfile,
  type FinancialProfileAnswers,
} from "@/lib/financial-passport";
import { clearReadiness } from "@/lib/mortgage-readiness/storage";
import {
  INTENT_OPTIONS,
  INCOME_TYPE_OPTIONS,
  type MortgageIntent,
} from "@/lib/mortgage-readiness/types";
import { setHomeMode } from "@/lib/dashboard";
import { useMortgageRateEngine } from "@/lib/rates";
import { track } from "@/lib/analytics/track";
import { scoreToBucket } from "@/lib/analytics/events";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { MojeMoznostiResultView } from "@/components/moje-moznosti/MojeMoznostiResultView";

type StepId = "intent" | "finance" | "optional" | "market" | "result";

const STEPS: { id: StepId; label: string }[] = [
  { id: "intent", label: "Cíl" },
  { id: "finance", label: "Finance" },
  { id: "optional", label: "Doplnění" },
  { id: "market", label: "Trh" },
  { id: "result", label: "Výsledek" },
];

function parseMoney(raw: string): number {
  const n = Number(raw.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function formatMoneyInput(n: number): string {
  if (!n) return "";
  return new Intl.NumberFormat("cs-CZ").format(n);
}

/**
 * Sjednocený onboarding „Zjistit moje možnosti“.
 * Persistuje FinancialProfileAnswers (stejný SoT jako Finanční pas).
 */
export function MojeMoznostiWizard() {
  const { resolved } = useMortgageRateEngine(true);
  const [profile, setProfile] = useState<FinancialProfileAnswers>(() => {
    return loadFinancialProfile() ?? { ...EMPTY_PROFILE };
  });
  const [prefs, setPrefs] = useState<MatchingPreferences>({
    ...EMPTY_MATCHING_PREFS,
  });
  const [incomeStr, setIncomeStr] = useState(() =>
    profile.netIncome ? formatMoneyInput(profile.netIncome) : ""
  );
  const [fundsStr, setFundsStr] = useState(() =>
    profile.ownFunds ? formatMoneyInput(profile.ownFunds) : ""
  );
  const [liabStr, setLiabStr] = useState(() =>
    profile.otherLiabilities
      ? formatMoneyInput(profile.otherLiabilities)
      : ""
  );
  const [result, setResult] = useState<MojeMoznostiResult | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Continue later: obnovit výsledek z lokálního profilu
  useEffect(() => {
    if (hydrated) return;
    setHydrated(true);
    const existing = loadFinancialProfile();
    if (existing && canComputeFirstResult(existing)) {
      setProfile(existing);
      setIncomeStr(
        existing.netIncome ? formatMoneyInput(existing.netIncome) : ""
      );
      setFundsStr(
        existing.ownFunds ? formatMoneyInput(existing.ownFunds) : ""
      );
      setLiabStr(
        existing.otherLiabilities
          ? formatMoneyInput(existing.otherLiabilities)
          : ""
      );
      setResult(
        buildMojeMoznostiResult(
          existing,
          resolved.ratePercent,
          resolved.uiKind,
          prefs
        )
      );
      setStepIndex(STEPS.length - 1);
    }
  }, [hydrated, prefs, resolved.ratePercent, resolved.uiKind]);

  const step = STEPS[stepIndex]!.id;

  const abandonRef = useRef({
    started: false,
    stepIndex: 0,
    stepId: "intent" as StepId,
    completed: false,
  });
  useEffect(() => {
    abandonRef.current = {
      started,
      stepIndex,
      stepId: step,
      completed: step === "result" || result != null,
    };
  }, [started, step, stepIndex, result]);

  useEffect(() => {
    return () => {
      const s = abandonRef.current;
      if (s.started && !s.completed) {
        track("onboarding_abandoned", {
          tool_id: "moje_moznosti",
          step: s.stepIndex + 1,
          step_id: s.stepId,
          funnel_id: "moje_moznosti_north_star",
        });
      }
    };
  }, []);

  const patch = (partial: Partial<FinancialProfileAnswers>) => {
    setProfile((p) => ({ ...p, ...partial }));
  };

  const syncMoneyFields = () => {
    patch({
      netIncome: parseMoney(incomeStr),
      ownFunds: parseMoney(fundsStr),
      otherLiabilities: parseMoney(liabStr),
    });
  };

  const persistAndShow = (nextProfile: FinancialProfileAnswers) => {
    saveFinancialProfile(nextProfile, resolved.ratePercent);
    setHomeMode("dashboard");
    const built = buildMojeMoznostiResult(
      nextProfile,
      resolved.ratePercent,
      resolved.uiKind,
      prefs
    );
    setResult(built);
    track("moznosti_completed", {
      tool_id: "moje_moznosti",
      intent_id: nextProfile.intent ?? undefined,
      score_bucket: scoreToBucket(built.readiness.score),
    });
    track("onboarding_completed", {
      tool_id: "moje_moznosti",
      intent_id: nextProfile.intent ?? undefined,
      score_bucket: scoreToBucket(built.readiness.score),
      funnel_id: "moje_moznosti_north_star",
    });
    track("result_viewed", {
      tool_id: "moje_moznosti",
      score_bucket: scoreToBucket(built.readiness.score),
    });
  };

  const goNext = () => {
    if (!started) {
      setStarted(true);
      track("moznosti_started", { tool_id: "moje_moznosti" });
      track("onboarding_started", {
        tool_id: "moje_moznosti",
        funnel_id: "moje_moznosti_north_star",
      });
    }

    if (step === "intent") {
      if (!profile.intent) return;
      track("moznosti_step", { tool_id: "moje_moznosti", step: 1 });
      track("onboarding_step_completed", {
        tool_id: "moje_moznosti",
        step: 1,
        step_id: "intent",
      });
      setStepIndex(1);
      return;
    }

    if (step === "finance") {
      syncMoneyFields();
      const next = {
        ...profile,
        netIncome: parseMoney(incomeStr),
        ownFunds: parseMoney(fundsStr),
        otherLiabilities: parseMoney(liabStr),
      };
      setProfile(next);
      if (!canComputeFirstResult(next)) return;
      track("moznosti_step", { tool_id: "moje_moznosti", step: 2 });
      track("onboarding_step_completed", {
        tool_id: "moje_moznosti",
        step: 2,
        step_id: "finance",
      });
      setStepIndex(2);
      return;
    }

    if (step === "optional") {
      track("moznosti_step", { tool_id: "moje_moznosti", step: 3 });
      track("onboarding_step_completed", {
        tool_id: "moje_moznosti",
        step: 3,
        step_id: "optional",
      });
      setStepIndex(3);
      return;
    }

    if (step === "market") {
      syncMoneyFields();
      const next = {
        ...profile,
        netIncome: parseMoney(incomeStr),
        ownFunds: parseMoney(fundsStr),
        otherLiabilities: parseMoney(liabStr),
      };
      setProfile(next);
      track("moznosti_step", { tool_id: "moje_moznosti", step: 4 });
      track("onboarding_step_completed", {
        tool_id: "moje_moznosti",
        step: 4,
        step_id: "market",
      });
      persistAndShow(next);
      setStepIndex(4);
    }
  };

  const skipOptional = () => {
    track("moznosti_step", {
      tool_id: "moje_moznosti",
      step: step === "optional" ? 3 : 4,
    });
    if (step === "optional") {
      setStepIndex(3);
      return;
    }
    // skip market → compute
    syncMoneyFields();
    const next = {
      ...profile,
      netIncome: parseMoney(incomeStr),
      ownFunds: parseMoney(fundsStr),
      otherLiabilities: parseMoney(liabStr),
    };
    setProfile(next);
    persistAndShow(next);
    setStepIndex(4);
  };

  const goBack = () => {
    if (stepIndex > 0 && step !== "result") setStepIndex((i) => i - 1);
  };

  const resetAll = () => {
    clearReadiness();
    clearPassportTimeline();
    setHomeMode("marketing");
    setProfile({ ...EMPTY_PROFILE });
    setPrefs({ ...EMPTY_MATCHING_PREFS });
    setIncomeStr("");
    setFundsStr("");
    setLiabStr("");
    setResult(null);
    setStepIndex(0);
    track("moznosti_reset", { tool_id: "moje_moznosti" });
  };

  const editInputs = () => {
    setResult(null);
    setStepIndex(0);
  };

  const canProceed = useMemo(() => {
    if (step === "intent") return profile.intent != null;
    if (step === "finance") {
      return parseMoney(incomeStr) > 0 && parseMoney(fundsStr) >= 0;
    }
    return true;
  }, [step, profile.intent, incomeStr, fundsStr]);

  if (step === "result" && result) {
    return (
      <MojeMoznostiResultView
        result={result}
        profile={profile}
        onEdit={editInputs}
        onReset={resetAll}
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:py-12">
      <div className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
          Zjistit moje možnosti
        </p>
        <h1 className="mt-2 font-heading text-2xl font-bold text-text-dark sm:text-3xl">
          Základní diagnostika
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Několik otázek → personalizovaný přehled. Údaje zůstávají{" "}
          <strong className="font-medium text-text-dark">
            jen ve vašem prohlížeči
          </strong>
          . Nejde o schválení banky.
        </p>
      </div>

      {/* Progress */}
      <ol className="mb-8 flex flex-wrap gap-2" aria-label="Postup">
        {STEPS.filter((s) => s.id !== "result").map((s, i) => (
          <li
            key={s.id}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold",
              i === stepIndex
                ? "bg-deep-teal text-white"
                : i < stepIndex
                  ? "bg-deep-teal/15 text-deep-teal"
                  : "bg-slate-100 text-muted-foreground"
            )}
          >
            {i + 1}. {s.label}
          </li>
        ))}
      </ol>

      <div className="rounded-2xl border border-border bg-white p-5 sm:p-6">
        {step === "intent" && (
          <fieldset>
            <legend className="font-heading text-lg font-bold text-text-dark">
              Jaký je váš cíl?
            </legend>
            <p className="mt-1 text-sm text-muted-foreground">
              Určuje, které nástroje a trhy vám nabídneme jako další krok.
            </p>
            <ul className="mt-4 grid gap-2">
              {INTENT_OPTIONS.map((opt) => (
                <li key={opt.id}>
                  <button
                    type="button"
                    onClick={() => patch({ intent: opt.id as MortgageIntent })}
                    className={cn(
                      "w-full rounded-xl border px-4 py-3 text-left transition-colors",
                      profile.intent === opt.id
                        ? "border-deep-teal bg-deep-teal/5 ring-1 ring-deep-teal/30"
                        : "border-border hover:border-deep-teal/40"
                    )}
                  >
                    <span className="font-semibold text-text-dark">
                      {opt.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {opt.description}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </fieldset>
        )}

        {step === "finance" && (
          <fieldset className="space-y-4">
            <legend className="font-heading text-lg font-bold text-text-dark">
              Základní finance
            </legend>
            <p className="text-sm text-muted-foreground">
              Stačí tři čísla pro orientační rozpočet a připravenost. Proč:
              příjem a závazky ovlivní splátkovou kapacitu, vlastní zdroje LTV.
            </p>
            <label className="block text-sm">
              <span className="font-medium text-text-dark">
                Čistý příjem domácnosti / měs.
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={incomeStr}
                onChange={(e) => setIncomeStr(e.target.value)}
                className="mt-1.5 h-11 w-full rounded-lg border border-border px-3 tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-deep-teal"
                placeholder="např. 60 000"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-text-dark">
                Vlastní prostředky (hotovost / spoření)
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={fundsStr}
                onChange={(e) => setFundsStr(e.target.value)}
                className="mt-1.5 h-11 w-full rounded-lg border border-border px-3 tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-deep-teal"
                placeholder="např. 800 000"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-text-dark">
                Pravidelné splátky úvěrů / měs. (volitelné)
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={liabStr}
                onChange={(e) => setLiabStr(e.target.value)}
                className="mt-1.5 h-11 w-full rounded-lg border border-border px-3 tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-deep-teal"
                placeholder="0"
              />
            </label>
          </fieldset>
        )}

        {step === "optional" && (
          <fieldset className="space-y-4">
            <legend className="font-heading text-lg font-bold text-text-dark">
              Doplnění (můžete přeskočit)
            </legend>
            <p className="text-sm text-muted-foreground">
              Zpřesní skóre připravenosti — není nutné pro první výsledek.
            </p>
            <label className="block text-sm">
              <span className="font-medium text-text-dark">Věk</span>
              <input
                type="number"
                min={18}
                max={75}
                value={profile.age ?? ""}
                onChange={(e) =>
                  patch({
                    age: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className="mt-1.5 h-11 w-full rounded-lg border border-border px-3 outline-none focus-visible:ring-2 focus-visible:ring-deep-teal"
                placeholder="např. 35"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-text-dark">Typ příjmu</span>
              <select
                value={profile.incomeType ?? ""}
                onChange={(e) =>
                  patch({
                    incomeType: (e.target.value ||
                      null) as FinancialProfileAnswers["incomeType"],
                  })
                }
                className="mt-1.5 h-11 w-full rounded-lg border border-border bg-white px-3 outline-none focus-visible:ring-2 focus-visible:ring-deep-teal"
              >
                <option value="">Nechci uvádět</option>
                {INCOME_TYPE_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={profile.coApplicant}
                onChange={(e) => patch({ coApplicant: e.target.checked })}
              />
              <span>Mám spolužadatele</span>
            </label>
            {(profile.intent === "refinance" ||
              profile.intent === "investment") && (
              <label className="block text-sm">
                <span className="font-medium text-text-dark">
                  Existující nemovitost — odhad equity (Kč)
                </span>
                <input
                  type="number"
                  min={0}
                  value={profile.existingPropertyEquity || ""}
                  onChange={(e) =>
                    patch({
                      existingPropertyEquity: Number(e.target.value) || 0,
                    })
                  }
                  className="mt-1.5 h-11 w-full rounded-lg border border-border px-3 outline-none focus-visible:ring-2 focus-visible:ring-deep-teal"
                />
              </label>
            )}
          </fieldset>
        )}

        {step === "market" && (
          <fieldset className="space-y-4">
            <legend className="font-heading text-lg font-bold text-text-dark">
              Preferovaný trh (volitelné)
            </legend>
            <p className="text-sm text-muted-foreground">
              Ovlivní Market Match. „Nevím“ = použijeme bezpečné výchozí
              preference podle cíle.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {(
                [
                  ["", "Nevím / neutrální"],
                  ["czech_slovak", "Česko / Slovensko"],
                  ["eu_stability", "EU stabilita"],
                  ["exotic_high_yield", "Exotika / vyšší výnos"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() =>
                    setPrefs((p) => ({
                      ...p,
                      region: value as MatchingPreferences["region"],
                    }))
                  }
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-left text-sm font-medium",
                    prefs.region === value
                      ? "border-deep-teal bg-deep-teal/5"
                      : "border-border hover:border-deep-teal/40"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            {(profile.intent === "investment" ||
              profile.intent === "foreign_purchase") && (
              <>
                <p className="pt-2 text-sm font-medium text-text-dark">
                  Investiční styl
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {(
                    [
                      ["", "Nevím"],
                      ["conservative", "Konzervativní"],
                      ["yield_max", "Max. výnos"],
                      ["partial_use", "Mix užívání + pronájem"],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() =>
                        setPrefs((p) => ({
                          ...p,
                          purpose: value as MatchingPreferences["purpose"],
                        }))
                      }
                      className={cn(
                        "rounded-xl border px-3 py-2.5 text-left text-sm font-medium",
                        prefs.purpose === value
                          ? "border-deep-teal bg-deep-teal/5"
                          : "border-border hover:border-deep-teal/40"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </fieldset>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <button
            type="button"
            onClick={goBack}
            disabled={stepIndex === 0}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-muted-foreground disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Zpět
          </button>
          <div className="flex flex-wrap gap-2">
            {(step === "optional" || step === "market") && (
              <button
                type="button"
                onClick={skipOptional}
                className="inline-flex h-10 items-center rounded-lg border border-border px-4 text-sm font-semibold text-text-dark hover:border-deep-teal/40"
              >
                {step === "market" ? "Přeskočit a zobrazit výsledek" : "Přeskočit"}
              </button>
            )}
            {step !== "market" ? (
              <button
                type="button"
                onClick={goNext}
                disabled={!canProceed}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-deep-teal px-4 text-sm font-semibold text-white hover:bg-deep-teal-light disabled:opacity-40"
              >
                Pokračovat
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            ) : (
              <button
                type="button"
                onClick={goNext}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-muted-gold px-4 text-sm font-semibold text-text-dark hover:bg-muted-gold-light"
              >
                Zobrazit mé možnosti
                <CheckCircle2 className="h-4 w-4" aria-hidden />
              </button>
            )}
          </div>
        </div>
      </div>

      <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
        <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        Privacy-first: profil se neodesílá na server ani do LLM. Můžete{" "}
        <button
          type="button"
          onClick={resetAll}
          className="inline-flex items-center gap-1 font-semibold text-deep-teal underline"
        >
          <RotateCcw className="h-3 w-3" aria-hidden />
          resetovat
        </button>{" "}
        kdykoli. Plný průvodce:{" "}
        <Link href={routes.navrhNaMiru} className="underline">
          Hypoteční připravenost
        </Link>
        .
      </p>
    </div>
  );
}
