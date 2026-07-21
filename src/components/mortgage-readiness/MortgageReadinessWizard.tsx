"use client";

import { useEffect, useId, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ExternalLink,
  Loader2,
  Save,
  Trash2,
} from "lucide-react";
import { CalculatorDisclaimer } from "@/components/calculators/CalculatorDisclaimer";
import {
  FormConsentFields,
  emptyFormConsentState,
  toConsentRecord,
} from "@/components/consent/FormConsentFields";
import { formatCurrency } from "@/lib/calculators";
import { submitLead } from "@/lib/leads";
import {
  attributionToLeadMetadata,
  buildAttribution,
  buildFinancialPassport,
  buildMajetioDiscoveryUrl,
} from "@/lib/majetio";
import {
  EMPTY_ANSWERS,
  FOREIGN_COUNTRY_OPTIONS,
  INCOME_TYPE_OPTIONS,
  INTENT_OPTIONS,
  MODEL_DISCLAIMER,
  calculateReadiness,
  clearReadiness,
  loadReadiness,
  type IncomeTypeId,
  type ReadinessAnswers,
} from "@/lib/mortgage-readiness";
import { useMortgageRateEngine } from "@/lib/rates";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics/track";
import { scoreToBucket } from "@/lib/analytics/events";
import {
  fromReadinessAnswers,
  saveFinancialProfile,
} from "@/lib/financial-passport";

type StepId =
  | "intent"
  | "profile"
  | "income"
  | "liabilities"
  | "assets"
  | "result";

const BASE_STEPS: { id: StepId; label: string }[] = [
  { id: "intent", label: "Záměr" },
  { id: "profile", label: "Profil" },
  { id: "income", label: "Příjmy" },
  { id: "liabilities", label: "Závazky" },
  { id: "assets", label: "Zdroje" },
  { id: "result", label: "Výsledek" },
];

function parseNum(raw: string): number {
  const n = Number(String(raw).replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function OptionButton({
  selected,
  onClick,
  children,
  className,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border-2 p-4 text-left font-semibold transition-all",
        selected
          ? "border-deep-teal bg-deep-teal/5 text-deep-teal shadow-sm"
          : "border-border text-text-dark hover:border-deep-teal/40",
        className
      )}
    >
      {children}
    </button>
  );
}

function FieldLabel({
  htmlFor,
  children,
  hint,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="block text-sm">
      <span className="font-medium text-text-dark">{children}</span>
      {hint ? (
        <span className="mt-0.5 block text-xs text-muted-foreground">{hint}</span>
      ) : null}
    </label>
  );
}

function TextInput({
  id,
  value,
  onChange,
  placeholder,
  inputMode = "numeric",
  "aria-label": ariaLabel,
}: {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: "numeric" | "text" | "email" | "tel";
  "aria-label"?: string;
}) {
  return (
    <input
      id={id}
      type="text"
      inputMode={inputMode}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={ariaLabel}
      className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-text-dark outline-none ring-deep-teal/30 focus:ring-2"
    />
  );
}

function FormField({
  label,
  hint,
  value,
  onChange,
  placeholder,
  inputMode = "numeric",
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: "numeric" | "text" | "email" | "tel";
}) {
  const id = useId();
  return (
    <div>
      <FieldLabel htmlFor={id} hint={hint}>
        {label}
      </FieldLabel>
      <TextInput
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        inputMode={inputMode}
      />
    </div>
  );
}

function ResultList({
  title,
  items,
  tone = "neutral",
}: {
  title: string;
  items: string[];
  tone?: "good" | "warn" | "neutral";
}) {
  const bullet =
    tone === "good"
      ? "bg-emerald-500"
      : tone === "warn"
        ? "bg-amber-500"
        : "bg-deep-teal";
  return (
    <section className="rounded-xl border border-border bg-white p-5">
      <h3 className="font-heading text-base font-bold text-text-dark">{title}</h3>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
            <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", bullet)} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function initialReadinessState(): {
  answers: ReadinessAnswers;
  savedAt: string | null;
  stepIndex: number;
} {
  const stored = loadReadiness();
  if (!stored) {
    return { answers: EMPTY_ANSWERS, savedAt: null, stepIndex: 0 };
  }
  const a = stored.answers as ReadinessAnswers;
  if (!a || typeof a !== "object") {
    return { answers: EMPTY_ANSWERS, savedAt: null, stepIndex: 0 };
  }
  return {
    answers: { ...EMPTY_ANSWERS, ...a },
    savedAt: stored.updatedAt,
    stepIndex: a.intent ? BASE_STEPS.length - 1 : 0,
  };
}

export function MortgageReadinessWizard() {
  const [boot] = useState(initialReadinessState);
  const [stepIndex, setStepIndex] = useState(boot.stepIndex);
  const [answers, setAnswers] = useState<ReadinessAnswers>(boot.answers);
  const [savedAt, setSavedAt] = useState<string | null>(boot.savedAt);
  const [saveFlash, setSaveFlash] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [consent, setConsent] = useState(() =>
    emptyFormConsentState("mortgage_specialist")
  );
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<string | null>(null);
  const { resolved } = useMortgageRateEngine(true);

  const patch = <K extends keyof ReadinessAnswers>(
    key: K,
    value: ReadinessAnswers[K]
  ) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const modelRate = resolved.ratePercent;
  const result = useMemo(
    () => calculateReadiness(answers, modelRate),
    [answers, modelRate]
  );

  const step = BASE_STEPS[stepIndex]!;
  const isResult = step.id === "result";

  const canNext = (): boolean => {
    switch (step.id) {
      case "intent":
        return answers.intent != null;
      case "profile":
        return answers.age != null && answers.age >= 18 && answers.age <= 75;
      case "income":
        return answers.incomeType != null && answers.netIncome > 0;
      case "liabilities":
        return answers.noRecentDefaults != null;
      case "assets":
        if (answers.intent === "foreign_purchase") {
          return Boolean(answers.targetCountry);
        }
        if (answers.intent === "refinance") {
          return (answers.currentBalance ?? 0) > 0;
        }
        return answers.ownFunds >= 0;
      default:
        return true;
    }
  };

  const goNext = () => {
    if (stepIndex < BASE_STEPS.length - 1) setStepIndex((i) => i + 1);
  };
  const goBack = () => {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  };

  const handleSave = () => {
    saveFinancialProfile(fromReadinessAnswers(answers), modelRate);
    setSavedAt(new Date().toISOString());
    setSaveFlash(true);
    window.setTimeout(() => setSaveFlash(false), 2000);
  };

  const handleClear = () => {
    clearReadiness();
    setAnswers(EMPTY_ANSWERS);
    setSavedAt(null);
    setStepIndex(0);
    setSubmitMsg(null);
  };

  const passport = useMemo(
    () => buildFinancialPassport(answers, result, modelRate),
    [answers, result, modelRate]
  );

  const lastAttr = useMemo(() => {
    if (!isResult) return null;
    return buildAttribution({
      campaign: "readiness",
      medium: "referral",
      content: "financial_passport",
      conversionEvent: "cta_majetio_budget_listings",
      product: "mortgage_readiness",
    });
  }, [isResult]);

  const majetioUrl = useMemo(() => {
    if (!lastAttr) return "https://majetio.cz/";
    return buildMajetioDiscoveryUrl({
      passport,
      attribution: lastAttr,
    });
  }, [lastAttr, passport]);

  useEffect(() => {
    if (!isResult) return;
    track("prescore_completed", {
      tool_id: "mortgage_readiness",
      intent_id: answers.intent ?? undefined,
      score_bucket: scoreToBucket(result.score),
    });
  }, [isResult, answers.intent, result.score]);

  useEffect(() => {
    if (answers.intent && stepIndex === 0) {
      track("prescore_started", {
        tool_id: "mortgage_readiness",
        intent_id: answers.intent,
      });
    }
  }, [answers.intent, stepIndex]);

  const handleConsult = async () => {
    if (!contactName.trim() || !contactEmail.trim() || contactPhone.trim().length < 6)
      return;
    setSubmitLoading(true);
    setSubmitMsg(null);
    const attr =
      lastAttr ??
      buildAttribution({
        campaign: "readiness",
        medium: "form",
        content: "consult",
        conversionEvent: "lead_consult",
        product: "mortgage_readiness",
      });
    const res = await submitLead({
      name: contactName.trim(),
      email: contactEmail.trim(),
      phone: contactPhone.trim(),
      source: "navrh_na_miru",
      country:
        answers.intent === "foreign_purchase"
          ? answers.targetCountry ?? undefined
          : "Česká republika",
      notes: `Hypoteční připravenost ${result.score}/100 · intent=${answers.intent}`,
      metadata: {
        product: "mortgage_readiness",
        score: result.score,
        intent: answers.intent,
        financingHigh: result.financingRange?.high ?? null,
        financial_passport: passport,
        ...attributionToLeadMetadata(attr),
      },
      consent: toConsentRecord(consent),
    });
    setSubmitLoading(false);
    setSubmitMsg(
      res.ok
        ? "Odesláno. Specialista vás kontaktuje — bez příslibu schválení."
        : res.error
    );
    if (res.ok) {
      track("lead_submitted", {
        lead_source: "navrh_na_miru",
        tool_id: "mortgage_readiness",
        partner_scope: "mortgage_specialist",
        score_bucket: scoreToBucket(result.score),
      });
      track("partner_handoff", {
        lead_source: "navrh_na_miru",
        partner_scope: "mortgage_specialist",
      });
    }
  };

  return (
    <div className="min-h-[70vh] bg-[#f4f6f5]">
      <div className="border-b border-border bg-gradient-to-br from-[#0b3d3a] via-[#0f4c48] to-[#1a5c4a] text-white">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-gold">
            HypotékaJasně.cz
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Hypoteční připravenost
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
            Orientační skóre a personalizovaný plán podle vašeho záměru — ne
            marketingový „schválený limit“.
          </p>
          {savedAt ? (
            <p className="mt-4 text-xs text-white/60">
              Uloženo{" "}
              {new Date(savedAt).toLocaleString("cs-CZ", {
                dateStyle: "short",
                timeStyle: "short",
              })}{" "}
              — můžete kdykoli aktualizovat.
            </p>
          ) : null}
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <nav aria-label="Postup" className="mb-8">
          <ol className="flex flex-wrap gap-2">
            {BASE_STEPS.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  disabled={i > stepIndex && !answers.intent}
                  onClick={() => {
                    if (i <= stepIndex || answers.intent) setStepIndex(i);
                  }}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                    i === stepIndex
                      ? "bg-deep-teal text-white"
                      : i < stepIndex
                        ? "bg-deep-teal/15 text-deep-teal"
                        : "bg-white text-muted-foreground border border-border"
                  )}
                >
                  {i + 1}. {s.label}
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-8">
          {step.id === "intent" && (
            <div>
              <h2 className="font-heading text-xl font-bold text-text-dark">
                Co je váš záměr?
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                První otázka určuje celý další postup — ne země investice.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {INTENT_OPTIONS.map((opt) => (
                  <OptionButton
                    key={opt.id}
                    selected={answers.intent === opt.id}
                    onClick={() => patch("intent", opt.id)}
                  >
                    <span className="block text-base">{opt.label}</span>
                    <span className="mt-1 block text-xs font-normal text-muted-foreground">
                      {opt.description}
                    </span>
                  </OptionButton>
                ))}
              </div>
            </div>
          )}

          {step.id === "profile" && (
            <div className="space-y-5">
              <h2 className="font-heading text-xl font-bold text-text-dark">
                Základní profil
              </h2>
              <FormField
                label="Věk"
                value={answers.age?.toString() ?? ""}
                onChange={(v) =>
                  patch("age", v === "" ? null : Math.round(parseNum(v)))
                }
                placeholder="např. 35"
              />
              <div>
                <FieldLabel>Spolužadatel</FieldLabel>
                <div className="mt-2 flex gap-2">
                  {(
                    [
                      [false, "Ne"],
                      [true, "Ano"],
                    ] as const
                  ).map(([val, label]) => (
                    <OptionButton
                      key={label}
                      selected={answers.coApplicant === val}
                      onClick={() => patch("coApplicant", val)}
                      className="flex-1 text-center"
                    >
                      {label}
                    </OptionButton>
                  ))}
                </div>
              </div>
              <FormField
                label="Počet vyživovaných osob"
                hint="Včetně dětí ve společné domácnosti"
                value={String(answers.dependents)}
                onChange={(v) => patch("dependents", Math.round(parseNum(v)))}
                placeholder="0"
              />
            </div>
          )}

          {step.id === "income" && (
            <div className="space-y-5">
              <h2 className="font-heading text-xl font-bold text-text-dark">
                Příjmy
              </h2>
              <div>
                <FieldLabel>Typ příjmu</FieldLabel>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {INCOME_TYPE_OPTIONS.map((opt) => (
                    <OptionButton
                      key={opt.id}
                      selected={answers.incomeType === opt.id}
                      onClick={() => patch("incomeType", opt.id as IncomeTypeId)}
                      className="py-3 text-sm"
                    >
                      {opt.label}
                    </OptionButton>
                  ))}
                </div>
              </div>
              <FormField
                label="Čistý měsíční příjem (Kč)"
                value={answers.netIncome ? String(answers.netIncome) : ""}
                onChange={(v) => patch("netIncome", parseNum(v))}
                placeholder="např. 65000"
              />
              <FormField
                label="Měsíce kontinuity příjmu"
                hint="Vámi uvedené — pro stabilitu modelu"
                value={
                  answers.employmentMonths != null
                    ? String(answers.employmentMonths)
                    : ""
                }
                onChange={(v) =>
                  patch(
                    "employmentMonths",
                    v === "" ? null : Math.round(parseNum(v))
                  )
                }
                placeholder="např. 24"
              />
            </div>
          )}

          {step.id === "liabilities" && (
            <div className="space-y-5">
              <h2 className="font-heading text-xl font-bold text-text-dark">
                Závazky a historie
              </h2>
              <FormField
                label="Měsíční splátky úvěrů (Kč)"
                value={
                  answers.otherLiabilities
                    ? String(answers.otherLiabilities)
                    : ""
                }
                onChange={(v) => patch("otherLiabilities", parseNum(v))}
                placeholder="0"
              />
              <FormField
                label="Splátky / limity karet (Kč / měs.)"
                hint="Orientační měsíční zátěž z limitů"
                value={
                  answers.creditLimitPayments
                    ? String(answers.creditLimitPayments)
                    : ""
                }
                onChange={(v) => patch("creditLimitPayments", parseNum(v))}
                placeholder="0"
              />
              <div>
                <FieldLabel>
                  Máte v posledních letech problémy se splácením?
                </FieldLabel>
                <div className="mt-2 flex gap-2">
                  <OptionButton
                    selected={answers.noRecentDefaults === true}
                    onClick={() => patch("noRecentDefaults", true)}
                    className="flex-1 text-center"
                  >
                    Ne
                  </OptionButton>
                  <OptionButton
                    selected={answers.noRecentDefaults === false}
                    onClick={() => patch("noRecentDefaults", false)}
                    className="flex-1 text-center"
                  >
                    Ano
                  </OptionButton>
                </div>
              </div>
            </div>
          )}

          {step.id === "assets" && (
            <div className="space-y-5">
              <h2 className="font-heading text-xl font-bold text-text-dark">
                {answers.intent === "refinance"
                  ? "Stávající hypotéka a zdroje"
                  : answers.intent === "foreign_purchase"
                    ? "Zahraniční koupě a zajištění"
                    : "Vlastní zdroje a cíl"}
              </h2>

              {answers.intent === "foreign_purchase" && (
                <div>
                  <FieldLabel>Cílová země</FieldLabel>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {FOREIGN_COUNTRY_OPTIONS.map((c) => (
                      <OptionButton
                        key={c}
                        selected={answers.targetCountry === c}
                        onClick={() => patch("targetCountry", c)}
                        className="py-3 text-sm"
                      >
                        {c}
                      </OptionButton>
                    ))}
                  </div>
                </div>
              )}

              {answers.intent === "refinance" && (
                <>
                  <FormField
                    label="Zůstatek úvěru (Kč)"
                    value={
                      answers.currentBalance != null
                        ? String(answers.currentBalance)
                        : ""
                    }
                    onChange={(v) =>
                      patch("currentBalance", v === "" ? null : parseNum(v))
                    }
                    placeholder="např. 2800000"
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      label="Současná sazba (% p.a.)"
                      value={
                        answers.currentRate != null
                          ? String(answers.currentRate)
                          : ""
                      }
                      onChange={(v) =>
                        patch("currentRate", v === "" ? null : parseNum(v))
                      }
                      placeholder="např. 5.9"
                    />
                    <FormField
                      label="Zbývající splatnost (roky)"
                      value={
                        answers.yearsLeft != null
                          ? String(answers.yearsLeft)
                          : ""
                      }
                      onChange={(v) =>
                        patch(
                          "yearsLeft",
                          v === "" ? null : Math.round(parseNum(v))
                        )
                      }
                      placeholder="např. 20"
                    />
                  </div>
                </>
              )}

              <FormField
                label="Vlastní hotovost / akontace (Kč)"
                value={answers.ownFunds ? String(answers.ownFunds) : ""}
                onChange={(v) => patch("ownFunds", parseNum(v))}
                placeholder="např. 800000"
              />

              {(answers.intent === "owner_occupied" ||
                answers.intent === "investment" ||
                answers.intent === "foreign_purchase") && (
                <FormField
                  label="Orientační cílová cena (Kč)"
                  hint="Volitelné — pomáhá modelu LTV"
                  value={
                    answers.targetPrice != null
                      ? String(answers.targetPrice)
                      : ""
                  }
                  onChange={(v) =>
                    patch("targetPrice", v === "" ? null : parseNum(v))
                  }
                  placeholder="např. 5500000"
                />
              )}

              {(answers.intent === "foreign_purchase" ||
                answers.intent === "investment") && (
                <>
                  <div>
                    <FieldLabel>
                      Vlastníte nemovitost v ČR (možné zajištění)?
                    </FieldLabel>
                    <div className="mt-2 flex gap-2">
                      <OptionButton
                        selected={!answers.hasCzCollateral}
                        onClick={() => patch("hasCzCollateral", false)}
                        className="flex-1 text-center"
                      >
                        Ne
                      </OptionButton>
                      <OptionButton
                        selected={answers.hasCzCollateral}
                        onClick={() => patch("hasCzCollateral", true)}
                        className="flex-1 text-center"
                      >
                        Ano
                      </OptionButton>
                    </div>
                  </div>
                  {answers.hasCzCollateral && (
                    <FormField
                      label="Orientační equity v ČR (Kč)"
                      hint="Odhad vlastního kapitálu (equity) = hodnota − zbývající úvěr"
                      value={
                        answers.czCollateralEquity
                          ? String(answers.czCollateralEquity)
                          : ""
                      }
                      onChange={(v) =>
                        patch("czCollateralEquity", parseNum(v))
                      }
                      placeholder="např. 1500000"
                    />
                  )}
                </>
              )}
            </div>
          )}

          {isResult && (
            <div className="space-y-6">
              <div className="rounded-xl bg-gradient-to-br from-[#0b3d3a] to-[#1a5c4a] p-6 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-gold">
                  Výsledek modelu
                </p>
                <p className="mt-2 font-heading text-2xl font-bold sm:text-3xl">
                  Hypoteční připravenost:{" "}
                  <span className="tabular-nums">{result.score}/100</span>
                </p>
                <p className="mt-3 text-xs leading-relaxed text-white/75">
                  {MODEL_DISCLAIMER}
                </p>
                <a
                  href={routes.financniPas}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/25"
                >
                  Otevřít Finanční pas (7 dimenzí + simulace)
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <ResultList
                  title="Silné stránky"
                  items={result.strengths}
                  tone="good"
                />
                <ResultList
                  title="Potenciální překážky"
                  items={result.obstacles}
                  tone="warn"
                />
                <ResultList
                  title="Co může výsledek zlepšit"
                  items={result.improvements}
                />
                <ResultList
                  title="Rizikové faktory"
                  items={result.riskFactors}
                  tone="warn"
                />
              </div>

              <section className="rounded-xl border border-border bg-[#f7f8f7] p-5">
                <h3 className="font-heading text-base font-bold text-text-dark">
                  Orientační rozsah financování
                </h3>
                {result.financingRange ? (
                  <p className="mt-2 text-lg font-semibold tabular-nums text-deep-teal">
                    {formatCurrency(result.financingRange.low, "CZK")} –{" "}
                    {formatCurrency(result.financingRange.high, "CZK")}
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Doplňte příjem a zdroje pro odhad rozsahu.
                  </p>
                )}
                <p className="mt-2 text-xs text-muted-foreground">
                  Modelový interval podle DSTI/LTV rámce a sazby{" "}
                  {modelRate != null ? `${modelRate.toFixed(2)} %` : "orientačně 5 %"}{" "}
                  — nejde o nabídku ani příslib banky.
                </p>
              </section>

              <section className="rounded-xl border border-border bg-white p-5">
                <h3 className="font-heading text-base font-bold text-text-dark">
                  Vlastní zdroje
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {result.ownFundsNote}
                </p>
              </section>

              <ResultList
                title="Doporučené další kroky"
                items={result.nextSteps}
              />

              <section className="rounded-xl border border-deep-teal/20 bg-deep-teal/5 p-5">
                <h3 className="font-heading text-base font-bold text-text-dark">
                  Personalizovaný Action Plan
                </h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  {(
                    [
                      ["30 dní", result.actionPlan.days30],
                      ["3 měsíce", result.actionPlan.months3],
                      ["6–12 měsíců", result.actionPlan.months6to12],
                    ] as const
                  ).map(([label, items]) => (
                    <div key={label}>
                      <p className="text-xs font-semibold uppercase tracking-wide text-deep-teal">
                        {label}
                      </p>
                      <ul className="mt-2 space-y-2">
                        {items.map((item) => (
                          <li
                            key={item}
                            className="text-xs leading-relaxed text-muted-foreground"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-deep-teal px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-deep-teal/90"
                >
                  {saveFlash ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {saveFlash
                    ? "Uloženo"
                    : savedAt
                      ? "Aktualizovat uložený výsledek"
                      : "Uložit výsledek"}
                </button>
                <a
                  href={majetioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    track("majetio_clicked", {
                      tool_id: "mortgage_readiness",
                      experiment_id: "majetio_cross_sell",
                      path: "/navrh-na-miru",
                    })
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-muted-gold bg-white px-4 py-2.5 text-sm font-semibold text-deep-teal transition hover:bg-muted-gold/10"
                >
                  Zobrazit nemovitosti, které odpovídají mému rozpočtu
                  <ExternalLink className="h-4 w-4" />
                </a>
                {savedAt ? (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted"
                  >
                    <Trash2 className="h-4 w-4" />
                    Smazat uložené
                  </button>
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground">
                Finanční pas předá jen rozpočet, vlastní kapitál, účel, zemi a
                anonymní označení zdroje návštěvy — žádné osobní údaje.
                Předání partnerovi je v beta režimu.
              </p>

              <section className="rounded-xl border border-border p-5">
                <h3 className="font-heading text-base font-bold text-text-dark">
                  Konzultace s licencovaným partnerem
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Volitelné — pomůžeme s doložením, ne s příslibem schválení.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <FormField
                    label="Jméno"
                    value={contactName}
                    onChange={setContactName}
                    placeholder="Jan Novák"
                    inputMode="text"
                  />
                  <FormField
                    label="E-mail"
                    value={contactEmail}
                    onChange={setContactEmail}
                    placeholder="jan@email.cz"
                    inputMode="email"
                  />
                  <FormField
                    label="Telefon"
                    value={contactPhone}
                    onChange={setContactPhone}
                    placeholder="+420 …"
                    inputMode="tel"
                  />
                </div>
                <FormConsentFields
                  state={consent}
                  onChange={setConsent}
                  showPartnerTransfer
                  className="mt-3 space-y-3 rounded-xl border border-border bg-slate-50 px-3 py-3 text-left text-xs leading-relaxed text-muted-foreground"
                />
                <button
                  type="button"
                  disabled={
                    submitLoading ||
                    !contactName.trim() ||
                    !contactEmail.trim() ||
                    contactPhone.trim().length < 6
                  }
                  onClick={handleConsult}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-text-dark px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {submitLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  Odeslat nezávaznou poptávku
                </button>
                {submitMsg ? (
                  <p className="mt-2 text-sm text-muted-foreground">{submitMsg}</p>
                ) : null}
              </section>

              <CalculatorDisclaimer />
            </div>
          )}

          {!isResult && (
            <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-5">
              <button
                type="button"
                onClick={goBack}
                disabled={stepIndex === 0}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground disabled:opacity-40"
              >
                <ArrowLeft className="h-4 w-4" />
                Zpět
              </button>
              <button
                type="button"
                onClick={goNext}
                disabled={!canNext()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-deep-teal px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
              >
                {stepIndex === BASE_STEPS.length - 2
                  ? "Zobrazit připravenost"
                  : "Pokračovat"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {isResult && (
            <div className="mt-6 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setStepIndex(0)}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-deep-teal hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Upravit odpovědi a přepočítat
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
