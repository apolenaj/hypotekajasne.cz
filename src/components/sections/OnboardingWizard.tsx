"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { CalculatorDisclaimer } from "@/components/calculators/CalculatorDisclaimer";
import { InsuranceRateCards } from "@/components/calculators/InsuranceRateCards";
import { formatCurrency } from "@/lib/calculators";
import { formatRateOrOnRequest } from "@/lib/format-rate";
import { submitLead } from "@/lib/leads";
import { pickRate, useCurrentRates } from "@/lib/rates";
import { cn } from "@/lib/utils";

const TOTAL_STEPS = 6;

const STEP_LABELS = [
  "Záměr",
  "Osoba",
  "Příjmy",
  "Výdaje",
  "Zajištění",
  "Výsledek",
] as const;

const TARGET_COUNTRIES = [
  "Česká republika",
  "Slovensko",
  "SAE (Dubaj)",
  "Saúdská Arábie",
  "Španělsko",
  "Itálie",
  "Chorvatsko",
  "Bali (Indonésie)",
] as const;

const PURPOSE_OPTIONS = [
  "Vlastní bydlení (Trvalé)",
  "Druhý domov (Rekreace a občasný nájem)",
  "Čistá investice (Dlouhodobý pronájem)",
  "Krátkodobý pronájem (Airbnb)",
  "Flipping (Nákup Off-plan a rychlý přeprodej)",
] as const;

const INCOME_TYPES = [
  "Zaměstnanec (HPP)",
  "OSVČ (Paušál)",
  "OSVČ (Daň. evidence)",
  "Majitel S.R.O.",
  "Příjmy z nájmu",
  "Jiné",
] as const;

const CZ_PROPERTY_OPTIONS = [
  "Ano, čistou",
  "Ano, s hypotékou",
  "Ne, nevlastním",
] as const;

interface OnboardingFormData {
  targetCountry: string;
  purpose: string;
  age: string;
  coApplicant: string;
  dependents: string;
  incomeType: string;
  netIncome: string;
  currentLoans: string;
  creditCards: string;
  ownCash: string;
  czPropertyOwned: string;
  czPropertyValue: string;
  czPropertyMortgage: string;
  name: string;
  email: string;
  phone: string;
}

const initialFormData: OnboardingFormData = {
  targetCountry: "",
  purpose: "",
  age: "",
  coApplicant: "Ne",
  dependents: "0",
  incomeType: "",
  netIncome: "",
  currentLoans: "0",
  creditCards: "0",
  ownCash: "",
  czPropertyOwned: "",
  czPropertyValue: "0",
  czPropertyMortgage: "0",
  name: "",
  email: "",
  phone: "",
};

interface PreApprovalResult {
  maxLoan: number;
  maxPropertyPrice: number;
  rate: number | null;
  approved: boolean;
  limitingFactor: "LTV" | "DSTI";
  maxPossibleByIncome: number;
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
        "p-4 rounded-xl border-2 font-bold transition-all",
        selected
          ? "border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm"
          : "border-gray-200 text-gray-600 hover:border-emerald-300",
        className
      )}
    >
      {children}
    </button>
  );
}

export function OnboardingWizard() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState<OnboardingFormData>(initialFormData);
  const [hasInsurance, setHasInsurance] = useState(true);
  const { rates, loading: ratesLoading } = useCurrentRates();

  const updateForm = <K extends keyof OnboardingFormData>(
    field: K,
    value: OnboardingFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const preApproval = useMemo((): PreApprovalResult => {
    const income = Number(formData.netIncome) || 0;
    const loans = Number(formData.currentLoans) || 0;
    const cash = Number(formData.ownCash) || 0;
    const age = Number(formData.age) || 35;

    const maxMonthlyPayment = income * 0.45 - loans;
    const maxMaturityYears = Math.min(30, Math.max(5, 65 - age));

    const estimatedRate = pickRate(rates, hasInsurance);

    const monthlyRate =
      estimatedRate != null ? estimatedRate / 100 / 12 : 0;
    const totalMonths = maxMaturityYears * 12;

    let maxLoanDSTI = 0;
    if (estimatedRate != null && maxMonthlyPayment > 0 && monthlyRate > 0) {
      maxLoanDSTI =
        maxMonthlyPayment *
        ((Math.pow(1 + monthlyRate, totalMonths) - 1) /
          (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)));
    }

    let maxLoanLTV = cash * 4;

    if (formData.czPropertyOwned.includes("Ano")) {
      const propValue = Number(formData.czPropertyValue) || 0;
      const propMortgage = Number(formData.czPropertyMortgage) || 0;
      const equity = propValue * 0.7 - propMortgage;
      if (equity > 0) {
        maxLoanLTV += equity * 4;
      } else {
        maxLoanLTV = maxLoanDSTI;
      }
    }

    const finalMaxLoan = Math.min(maxLoanDSTI, maxLoanLTV);
    const limitingFactor = maxLoanDSTI > maxLoanLTV ? "LTV" : "DSTI";

    return {
      maxLoan: Math.max(0, finalMaxLoan),
      maxPropertyPrice: Math.max(0, finalMaxLoan + cash),
      rate: estimatedRate,
      approved: maxMonthlyPayment > 0 && finalMaxLoan > 500_000,
      limitingFactor,
      maxPossibleByIncome: maxLoanDSTI,
    };
  }, [formData, rates, hasInsurance]);

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      return;
    }

    setSubmitError(null);
    setSubmitLoading(true);

    const selectedRate = pickRate(rates, hasInsurance);
    const result = await submitLead({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      source: "navrh_na_miru",
      country: formData.targetCountry || undefined,
      notes: [
        `Účel: ${formData.purpose || "—"}`,
        `Příjem: ${formData.netIncome || "—"} Kč (${formData.incomeType || "—"})`,
        `Vlastní hotovost: ${formData.ownCash || "—"} Kč`,
        `Pojištění: ${hasInsurance ? "ano" : "ne"}`,
        `Sazba: ${formatRateOrOnRequest(selectedRate)}`,
        preApproval
          ? `Odhad max. úvěru: ${Math.round(preApproval.maxLoan).toLocaleString("cs-CZ")} Kč`
          : null,
      ]
        .filter(Boolean)
        .join(" | "),
      metadata: {
        ...formData,
        has_insurance: hasInsurance,
        selected_rate: selectedRate,
        pre_approval: preApproval,
      },
    });

    setSubmitLoading(false);
    if (!result.ok) {
      setSubmitError(result.error);
      return;
    }

    setSubmitted(true);
  };

  const progressWidth = ((step - 1) / (TOTAL_STEPS - 1)) * 100;

  if (submitted) {
    return (
      <div className="min-h-[calc(100vh-8rem)] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-10 text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-gray-900 mb-3">
            Profil byl odeslán analytikovi
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Děkujeme, {formData.name}. Detailní rozpad financování pro{" "}
            {formData.targetCountry || "váš záměr"} vám zašleme na{" "}
            {formData.email} do 24 hodin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-emerald-900 p-8 md:p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-emerald-800 opacity-50 blur-2xl" />
          <h1 className="font-heading text-3xl font-bold relative z-10">
            Bankovní prescoring klienta
          </h1>
          <p className="text-emerald-100 mt-2 relative z-10">
            Přesně definujte svůj profil a získejte okamžitý odhad limitů od
            našich analytiků.
          </p>

          <div className="mt-10 relative z-10">
            <div className="absolute top-4 left-[8%] right-[8%] h-0.5 bg-emerald-800">
              <div
                className="h-full bg-white transition-all duration-500"
                style={{ width: `${progressWidth}%` }}
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              {STEP_LABELS.map((label, idx) => {
                const num = idx + 1;
                return (
                  <div key={label} className="flex flex-col items-center flex-1">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors duration-300 relative z-10",
                        step >= num
                          ? "bg-white text-emerald-900"
                          : "bg-emerald-800 text-emerald-300"
                      )}
                    >
                      {num}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider mt-2 font-bold text-emerald-200 hidden md:block text-center">
                      {label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-8 md:p-12 min-h-[400px]">
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <h2 className="font-heading text-2xl font-bold text-gray-900 mb-6">
                Kde plánujete investovat?
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {TARGET_COUNTRIES.map((loc) => (
                  <OptionButton
                    key={loc}
                    selected={formData.targetCountry === loc}
                    onClick={() => updateForm("targetCountry", loc)}
                    className="text-center text-sm"
                  >
                    {loc}
                  </OptionButton>
                ))}
              </div>
              <div>
                <label
                  htmlFor="purpose"
                  className="block text-sm font-bold text-gray-700 mb-3"
                >
                  Účel pořízení
                </label>
                <select
                  id="purpose"
                  value={formData.purpose}
                  onChange={(e) => updateForm("purpose", e.target.value)}
                  className="w-full p-4 rounded-xl border border-gray-300 bg-gray-50 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="">Vyberte možnost...</option>
                  {PURPOSE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <h2 className="font-heading text-2xl font-bold text-gray-900 mb-6">
                Základní parametry žadatele
              </h2>
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="age"
                    className="block text-sm font-bold text-gray-700 mb-2"
                  >
                    Věk hlavního žadatele (omezuje max. splatnost úvěru)
                  </label>
                  <input
                    id="age"
                    type="number"
                    min={18}
                    max={80}
                    value={formData.age}
                    onChange={(e) => updateForm("age", e.target.value)}
                    className="w-full md:w-1/2 p-4 rounded-xl border border-gray-300 bg-gray-50 text-lg font-bold"
                    placeholder="Např. 35"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Budete žádat s partnerem/spolužadatelem?
                    </label>
                    <div className="flex gap-4">
                      {(["Ano", "Ne"] as const).map((opt) => (
                        <OptionButton
                          key={opt}
                          selected={formData.coApplicant === opt}
                          onClick={() => updateForm("coApplicant", opt)}
                          className="flex-1 text-center"
                        >
                          {opt}
                        </OptionButton>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="dependents"
                      className="block text-sm font-bold text-gray-700 mb-2"
                    >
                      Počet vyživovaných dětí
                    </label>
                    <input
                      id="dependents"
                      type="number"
                      min={0}
                      value={formData.dependents}
                      onChange={(e) => updateForm("dependents", e.target.value)}
                      className="w-full p-4 rounded-xl border border-gray-300 bg-gray-50 font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <h2 className="font-heading text-2xl font-bold text-gray-900 mb-6">
                Struktura vašich příjmů
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Hlavní zdroj příjmu
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {INCOME_TYPES.map((opt) => (
                      <OptionButton
                        key={opt}
                        selected={formData.incomeType === opt}
                        onClick={() => updateForm("incomeType", opt)}
                        className="text-center text-sm"
                      >
                        {opt}
                      </OptionButton>
                    ))}
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="netIncome"
                    className="block text-sm font-bold text-gray-700 mb-2"
                  >
                    Průměrný čistý měsíční příjem (včetně spolužadatele)
                  </label>
                  <div className="relative">
                    <input
                      id="netIncome"
                      type="number"
                      min={0}
                      value={formData.netIncome}
                      onChange={(e) => updateForm("netIncome", e.target.value)}
                      className="w-full p-4 rounded-xl border border-gray-300 bg-gray-50 pr-12 text-lg font-bold"
                      placeholder="Např. 90000"
                    />
                    <span className="absolute right-4 top-4 text-gray-400 font-bold">
                      CZK
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <h2 className="font-heading text-2xl font-bold text-gray-900 mb-6">
                Stávající závazky (bonita / DSTI banky)
              </h2>
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="currentLoans"
                    className="block text-sm font-bold text-gray-700 mb-2"
                  >
                    Součet aktuálních měsíčních splátek (hypotéky, leasingy,
                    spotř. úvěry)
                  </label>
                  <div className="relative">
                    <input
                      id="currentLoans"
                      type="number"
                      min={0}
                      value={formData.currentLoans}
                      onChange={(e) =>
                        updateForm("currentLoans", e.target.value)
                      }
                      className="w-full p-4 rounded-xl border border-gray-300 bg-gray-50 pr-12 text-lg font-bold"
                    />
                    <span className="absolute right-4 top-4 text-gray-400 font-bold">
                      CZK
                    </span>
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="creditCards"
                    className="block text-sm font-bold text-gray-700 mb-2"
                  >
                    Celkové limity na kreditních kartách a kontokorentech
                  </label>
                  <div className="relative md:w-1/2">
                    <input
                      id="creditCards"
                      type="number"
                      min={0}
                      value={formData.creditCards}
                      onChange={(e) =>
                        updateForm("creditCards", e.target.value)
                      }
                      className="w-full p-4 rounded-xl border border-gray-300 bg-gray-50 pr-12 text-lg font-bold"
                    />
                    <span className="absolute right-4 top-4 text-gray-400 font-bold">
                      CZK
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Banka do vašich výdajů počítá cca 5 % ze schváleného limitu,
                    i když kartu nevyužíváte.
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <h2 className="font-heading text-2xl font-bold text-gray-900 mb-6">
                Kapitál a zajištění
              </h2>
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="ownCash"
                    className="block text-sm font-bold text-gray-700 mb-2"
                  >
                    Vlastní hotovost připravená k investici (akontace / LTV)
                  </label>
                  <div className="relative">
                    <input
                      id="ownCash"
                      type="number"
                      min={0}
                      value={formData.ownCash}
                      onChange={(e) => updateForm("ownCash", e.target.value)}
                      className="w-full p-4 rounded-xl border border-gray-300 bg-gray-50 pr-12 text-lg font-bold"
                      placeholder="Např. 2000000"
                    />
                    <span className="absolute right-4 top-4 text-gray-400 font-bold">
                      CZK
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Vlastníte v ČR nemovitost vhodnou k dozajištění (americká
                    hypotéka)?
                  </label>
                  <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    {CZ_PROPERTY_OPTIONS.map((opt) => (
                      <OptionButton
                        key={opt}
                        selected={formData.czPropertyOwned === opt}
                        onClick={() => updateForm("czPropertyOwned", opt)}
                        className="flex-1 text-sm text-center"
                      >
                        {opt}
                      </OptionButton>
                    ))}
                  </div>
                  {formData.czPropertyOwned.includes("Ano") && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div>
                        <label
                          htmlFor="czPropertyValue"
                          className="block text-xs font-bold text-gray-700 mb-1"
                        >
                          Odhadní cena nemovitosti
                        </label>
                        <input
                          id="czPropertyValue"
                          type="number"
                          min={0}
                          value={formData.czPropertyValue}
                          onChange={(e) =>
                            updateForm("czPropertyValue", e.target.value)
                          }
                          placeholder="CZK"
                          className="w-full p-2 border border-gray-300 rounded font-bold"
                        />
                      </div>
                      {formData.czPropertyOwned === "Ano, s hypotékou" && (
                        <div>
                          <label
                            htmlFor="czPropertyMortgage"
                            className="block text-xs font-bold text-gray-700 mb-1"
                          >
                            Zůstatek hypotéky
                          </label>
                          <input
                            id="czPropertyMortgage"
                            type="number"
                            min={0}
                            value={formData.czPropertyMortgage}
                            onChange={(e) =>
                              updateForm("czPropertyMortgage", e.target.value)
                            }
                            placeholder="CZK"
                            className="w-full p-2 border border-gray-300 rounded font-bold"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <InsuranceRateCards
                className="mb-8"
                hasInsurance={hasInsurance}
                onSelect={setHasInsurance}
                rateWithInsurance={rates.rateWithInsurance}
                rateWithoutInsurance={rates.rateWithoutInsurance}
                rpsnWithInsurance={rates.rpsnWithInsurance}
                rpsnWithoutInsurance={rates.rpsnWithoutInsurance}
                loading={ratesLoading}
              />

              <div
                className={cn(
                  "p-8 rounded-3xl mb-8 border-2",
                  preApproval.approved
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-orange-50 border-orange-200"
                )}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={cn(
                      "w-3 h-3 rounded-full animate-pulse",
                      preApproval.approved ? "bg-emerald-500" : "bg-orange-500"
                    )}
                  />
                  <h3 className="font-bold text-gray-900 uppercase tracking-wider text-sm">
                    Předběžná datová analýza
                  </h3>
                </div>

                {preApproval.approved ? (
                  <div>
                    <p className="text-gray-700 mb-6 font-medium">
                      Na základě zadaných parametrů algoritmus předpokládá{" "}
                      <strong>vysokou šanci</strong> na schválení financování.
                      Zde je váš indikativní rámec:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white p-4 rounded-2xl shadow-sm">
                        <p className="text-xs text-gray-500 font-bold uppercase mb-1">
                          Max. výše úvěru
                        </p>
                        <p className="text-2xl font-black text-emerald-900">
                          {formatCurrency(preApproval.maxLoan, "CZK")}
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-2xl shadow-sm">
                        <p className="text-xs text-gray-500 font-bold uppercase mb-1">
                          Kupní síla vč. hotovosti
                        </p>
                        <p className="text-2xl font-black text-gray-900">
                          {formatCurrency(preApproval.maxPropertyPrice, "CZK")}
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-2xl shadow-sm">
                        <p className="text-xs text-gray-500 font-bold uppercase mb-1">
                          Odhadovaná sazba
                        </p>
                        <p className="text-2xl font-black text-emerald-600">
                          {preApproval.rate != null
                            ? `od ${preApproval.rate.toFixed(2)} % p.a.`
                            : "Na vyžádání"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {hasInsurance ? "S pojištěním" : "Bez pojištění"}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          Zdroj: aktuální česká sazba (Supabase)
                        </p>
                      </div>
                    </div>

                    <CalculatorDisclaimer className="mt-4" />

                    <div className="mt-6 bg-white p-5 rounded-2xl border border-emerald-100 text-sm shadow-sm">
                      <h5 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-emerald-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Analýza vašeho potenciálu
                      </h5>

                      {preApproval.limitingFactor === "LTV" ? (
                        <p className="text-gray-700 leading-relaxed">
                          Vaše příjmy by teoreticky umožnily dosáhnout
                          na hypotéku až{" "}
                          <strong>
                            {Math.round(
                              preApproval.maxPossibleByIncome
                            ).toLocaleString("cs-CZ")}{" "}
                            CZK
                          </strong>
                          . Aktuální kalkulace je však zastropována{" "}
                          <strong>výší vašich vlastních zdrojů (LTV)</strong>.
                          <br />
                          <br />
                          <span className="font-bold text-emerald-800">
                            Co zvážit:
                          </span>{" "}
                          Dozajištění jinou nemovitostí nebo doplnění kapitálu.
                          Finální limity vždy stanoví konkrétní banka.
                        </p>
                      ) : (
                        <p className="text-gray-700 leading-relaxed">
                          Máte připravený silný kapitál, ale aktuální maximální
                          limit úvěru je dán{" "}
                          <strong>
                            ukazatelem DSTI (poměr splátek k čistému příjmu)
                          </strong>
                          . DTI a DSTI ČNB aktuálně plošně neaktivuje — banky je
                          však běžně sledují interně.
                          <br />
                          <br />
                          <span className="font-bold text-emerald-800">
                            Jak limit navýšit:
                          </span>{" "}
                          Pro dosažení vyšší částky doporučujeme přizvat k úvěru
                          spolužadatele (čímž se vaše příjmy sečtou), nebo před
                          žádostí konsolidovat stávající menší dluhy, čímž se
                          vám uvolní měsíční cash-flow.
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-orange-900 font-bold mb-2">
                      Tento profil vyžaduje individuální strukturování.
                    </p>
                    <p className="text-gray-700 text-sm">
                      Standardní bankovní algoritmus u vás narazil na limity
                      DSTI nebo LTV. Nezoufejte — jako experti dokážeme
                      financování postavit přes S.R.O. nebo optimalizovat
                      neúčelové úvěry.
                    </p>
                  </div>
                )}
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Získejte nezávaznou nabídku a expertní audit
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                Tento výpočet je orientační. Zanechte nám kontakt, náš senior
                analytik data prověří, zašle vám e-mailem detailní rozpad
                možností a následně vám zavolá pro probrání strategie na míru.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-xs font-bold text-gray-700 uppercase mb-1"
                  >
                    Jméno a příjmení
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => updateForm("name", e.target.value)}
                    className="w-full p-4 rounded-xl border border-gray-300 bg-gray-50 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-bold text-gray-700 uppercase mb-1"
                  >
                    E-mail (pro zaslání PDF)
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => updateForm("email", e.target.value)}
                    className="w-full p-4 rounded-xl border border-gray-300 bg-gray-50 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-xs font-bold text-gray-700 uppercase mb-1"
                  >
                    Telefon (pro krátkou konzultaci)
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateForm("phone", e.target.value)}
                    className="w-full p-4 rounded-xl border border-gray-300 bg-gray-50 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
              {submitError && (
                <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
                  {submitError}
                </p>
              )}
            </div>
          )}

          <div className="mt-12 flex items-center justify-between border-t border-gray-100 pt-6">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="text-gray-500 font-bold hover:text-gray-900 px-4 py-2"
              >
                ← Zpět
              </button>
            ) : (
              <div />
            )}

            {step < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={nextStep}
                className="bg-emerald-900 text-white font-bold py-3 px-8 rounded-full hover:bg-emerald-800 transition-colors shadow-md"
              >
                Pokračovat
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={
                  submitLoading ||
                  !formData.name.trim() ||
                  !formData.email.trim() ||
                  !formData.phone.trim()
                }
                className="inline-flex items-center gap-2 bg-emerald-600 text-white font-bold py-4 px-10 rounded-full hover:bg-emerald-500 transition-all shadow-xl hover:shadow-emerald-500/30 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {submitLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                {submitLoading ? "Odesílám…" : "Odeslat profil analytikovi"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
