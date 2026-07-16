"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  CheckCircle2,
  Clock,
  Globe2,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Target,
  User,
  Wallet,
} from "lucide-react";
import {
  evaluateInvestmentPassport,
  FINANCING_OPTIONS,
  HORIZON_OPTIONS,
  initialPassportForm,
  PURPOSE_OPTIONS,
  REGION_OPTIONS,
  type FinancingChoice,
  type HorizonChoice,
  type PassportFormData,
  type PurposeChoice,
  type RegionChoice,
} from "@/lib/investment-passport";
import { routes } from "@/lib/routes";
import { cn, formatNumber, parseNumber } from "@/lib/utils";

const TOTAL_STEPS = 6;

const STEP_META = [
  { label: "Kapitál", icon: Wallet },
  { label: "Financování", icon: Banknote },
  { label: "Účel", icon: Target },
  { label: "Region", icon: MapPin },
  { label: "Horizont", icon: Clock },
  { label: "Kontakt", icon: User },
] as const;

function OptionCard({
  selected,
  onClick,
  title,
  description,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  description?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-2xl border-2 p-5 text-left transition-all",
        selected
          ? "border-emerald-600 bg-emerald-50 shadow-md shadow-emerald-900/10"
          : "border-gray-200 bg-white hover:border-emerald-300"
      )}
    >
      <p
        className={cn(
          "font-bold",
          selected ? "text-emerald-900" : "text-gray-800"
        )}
      >
        {title}
      </p>
      {description ? (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      ) : null}
    </button>
  );
}

function StepProgress({ currentStep }: { currentStep: number }) {
  return (
    <div className="mb-10">
      <div className="mb-3 flex items-center justify-between gap-1 sm:gap-2">
        {STEP_META.map((step, index) => {
          const n = index + 1;
          const active = n === currentStep;
          const done = n < currentStep;
          const Icon = step.icon;
          return (
            <div
              key={step.label}
              className="flex flex-1 flex-col items-center gap-1.5"
            >
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all sm:h-10 sm:w-10",
                  done || active
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-gray-200 bg-white text-gray-400"
                )}
              >
                {done ? (
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </div>
              <span
                className={cn(
                  "hidden text-[10px] font-semibold sm:block md:text-xs",
                  active || done ? "text-emerald-800" : "text-gray-400"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-emerald-600 transition-all duration-500"
          style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
        />
      </div>
    </div>
  );
}

function PassportDashboard({
  formData,
  result,
  onRestart,
}: {
  formData: PassportFormData;
  result: ReturnType<typeof evaluateInvestmentPassport>;
  onRestart: () => void;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <section className="border-b border-gray-200 bg-deep-teal text-white">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <p className="text-sm font-bold uppercase tracking-widest text-emerald-200">
            Expertní investiční pas
          </p>
          <h1 className="mt-3 font-heading text-3xl font-black md:text-4xl">
            Gratulujeme, {formData.name}, zde je váš osobní investiční profil
          </h1>
          <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-emerald-50">
            <Sparkles className="h-4 w-4" />
            {result.profileLabel}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-10 space-y-8">
        <div className="overflow-hidden rounded-3xl border border-emerald-200/60 bg-gradient-to-br from-[#0b3d3a] via-[#0f5c56] to-[#1a7a6d] p-1 shadow-2xl shadow-emerald-900/20">
          <div className="rounded-[1.35rem] bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.12),_transparent_55%)] p-6 sm:p-10 text-white">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/15 pb-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-100/80">
                  Mezinárodní investiční pas
                </p>
                <h2 className="mt-2 font-heading text-3xl font-black">
                  {formData.name}
                </h2>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-right backdrop-blur-sm">
                <p className="text-xs uppercase tracking-wide text-emerald-100/70">
                  Horizont
                </p>
                <p className="font-bold">{result.horizonLabel}</p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/15 bg-black/20 p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-100/70">
                  Dostupný kapitál
                </p>
                <p className="mt-2 text-2xl font-black sm:text-3xl">
                  {formatNumber(result.capital)} CZK
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-300/40 bg-emerald-400/15 p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-100">
                  Odhadovaný dosažitelný rozpočet
                </p>
                <p className="mt-2 text-2xl font-black sm:text-3xl">
                  {formatNumber(result.reachableBudget)} CZK
                </p>
                <p className="mt-1 text-xs text-emerald-100/80">
                  {formData.financing === "cash"
                    ? "100% cash — rozpočet = vlastní kapitál"
                    : "Kapitál × 3 (model s úvěrovou pákou)"}
                </p>
              </div>
            </div>

            <p className="mt-6 text-sm text-emerald-50/90">
              Financování: {result.financingLabel}
            </p>
          </div>
        </div>

        <div>
          <h3 className="flex items-center gap-2 text-xl font-black text-gray-900">
            <Globe2 className="h-5 w-5 text-deep-teal" />
            Top 3 doporučené trhy
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Seřazeno podle scoring enginu na míru vašim odpovědím.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
            {result.markets.map((market, index) => (
              <Link
                key={market.name}
                href={
                  market.slug
                    ? `${routes.pruvodceInvestora}/${market.slug}`
                    : routes.pruvodceInvestora
                }
                className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg shadow-gray-900/5 ring-1 ring-gray-900/5 transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-40 overflow-hidden bg-deep-teal">
                  {market.image ? (
                    <img
                      src={market.image}
                      alt={market.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : null}
                  <span className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-black text-deep-teal shadow">
                    #{index + 1}
                  </span>
                </div>
                <div className="p-5">
                  <p className="text-lg font-black text-gray-900">
                    {market.name}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {market.reason}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href={routes.navrhNaMiru}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-emerald-900 px-6 py-4 text-center text-base font-bold text-white shadow-lg transition hover:bg-emerald-800"
          >
            Chci vidět konkrétní nemovitosti a analýzy pro tyto trhy
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href={routes.investicniRentgen}
            className="inline-flex items-center justify-center rounded-full border border-gray-300 px-6 py-4 font-bold text-gray-800 transition hover:bg-gray-50"
          >
            Investiční rentgen
          </Link>
        </div>

        <button
          type="button"
          onClick={onRestart}
          className="text-sm font-semibold text-deep-teal underline-offset-4 hover:underline"
        >
          Spustit průvodce znovu
        </button>
      </div>
    </div>
  );
}

export function InvestmentPassportView() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] =
    useState<PassportFormData>(initialPassportForm);
  const [submitted, setSubmitted] = useState(false);

  const updateForm = <K extends keyof PassportFormData>(
    key: K,
    value: PassportFormData[K]
  ) => setFormData((prev) => ({ ...prev, [key]: value }));

  const result = useMemo(
    () => evaluateInvestmentPassport(formData),
    [formData]
  );

  const canContinue = () => {
    if (currentStep === 1) return Number(formData.capital) > 0;
    if (currentStep === 2) return Boolean(formData.financing);
    if (currentStep === 3) return Boolean(formData.purpose);
    if (currentStep === 4) return Boolean(formData.region);
    if (currentStep === 5) return Boolean(formData.horizon);
    if (currentStep === 6) {
      return (
        formData.name.trim().length > 1 &&
        formData.email.includes("@") &&
        formData.phone.trim().length >= 9
      );
    }
    return false;
  };

  const next = () => {
    if (!canContinue()) return;
    if (currentStep === TOTAL_STEPS) {
      console.log("Investiční pas – lead:", formData);
      setSubmitted(true);
      return;
    }
    setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const back = () => setCurrentStep((s) => Math.max(s - 1, 1));

  if (submitted) {
    return (
      <PassportDashboard
        formData={formData}
        result={result}
        onRestart={() => {
          setSubmitted(false);
          setCurrentStep(1);
          setFormData(initialPassportForm);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <section className="border-b border-gray-200 bg-deep-teal text-white">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <p className="text-sm font-bold uppercase tracking-widest text-emerald-200">
            Expertní lead-generation wizard
          </p>
          <h1 className="mt-3 font-heading text-3xl font-black md:text-5xl">
            Mezinárodní investiční pas
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-emerald-50/90">
            Šest přesných otázek. Scoring engine. Top 3 trhy na míru vašemu
            kapitálu, financování a cíli.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xl shadow-gray-900/5 ring-1 ring-gray-900/5 sm:p-10">
          <StepProgress currentStep={currentStep} />

          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-black text-gray-900">
                Kolik máte k dispozici vlastních prostředků?
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Zadejte hotovost / equity pro první transakci.
              </p>
              <label className="mt-8 block">
                <span className="mb-2 block text-sm font-bold text-gray-700">
                  Vlastní kapitál (CZK)
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatNumber(formData.capital)}
                  onChange={(e) =>
                    updateForm("capital", parseNumber(e.target.value))
                  }
                  placeholder="např. 2 000 000"
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 p-4 text-lg font-bold outline-none focus:border-emerald-500"
                />
              </label>
              {Number(formData.capital) > 0 && (
                <p className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  Orientace s pákou (×3):{" "}
                  <strong>
                    {formatNumber(Math.round(Number(formData.capital) * 3))} CZK
                  </strong>
                </p>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-black text-gray-900">
                Jak plánujete nákup financovat?
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Od páky až po 100% cash — ovlivní dosažiteľný rozpočet i trhy.
              </p>
              <div className="mt-8 space-y-3">
                {FINANCING_OPTIONS.map((opt) => (
                  <OptionCard
                    key={opt.value}
                    title={opt.title}
                    description={opt.description}
                    selected={formData.financing === opt.value}
                    onClick={() =>
                      updateForm("financing", opt.value as FinancingChoice)
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-black text-gray-900">
                Co je vaším hlavním cílem?
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Účel je nejsilnější signál pro scoring trhu.
              </p>
              <div className="mt-8 space-y-3">
                {PURPOSE_OPTIONS.map((opt) => (
                  <OptionCard
                    key={opt.value}
                    title={opt.title}
                    description={opt.description}
                    selected={formData.purpose === opt.value}
                    onClick={() =>
                      updateForm("purpose", opt.value as PurposeChoice)
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <h2 className="text-2xl font-black text-gray-900">
                Jaké prostředí preferujete?
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Regionální filtr silně váží domácí vs. zahraniční trhy.
              </p>
              <div className="mt-8 space-y-3">
                {REGION_OPTIONS.map((opt) => (
                  <OptionCard
                    key={opt.value}
                    title={opt.title}
                    description={opt.description}
                    selected={formData.region === opt.value}
                    onClick={() =>
                      updateForm("region", opt.value as RegionChoice)
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div>
              <h2 className="text-2xl font-black text-gray-900">
                Kdy plánujete nemovitost pořídit?
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Horizont pomáhá prioritizovat rychlost a ready nabídky.
              </p>
              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {HORIZON_OPTIONS.map((opt) => (
                  <OptionCard
                    key={opt.value}
                    title={opt.title}
                    selected={formData.horizon === opt.value}
                    onClick={() =>
                      updateForm("horizon", opt.value as HorizonChoice)
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div>
              <h2 className="text-2xl font-black text-gray-900">
                Kam vám máme expertní pas a detailní nabídky zaslat?
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Po odeslání ihned uvidíte Top 3 trhy a odhad rozpočtu.
              </p>
              <div className="mt-8 space-y-4">
                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-700">
                    <User className="h-4 w-4" /> Jméno a příjmení
                  </span>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateForm("name", e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-gray-50 p-4 font-semibold outline-none focus:border-emerald-500"
                    placeholder="Jan Novák"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-700">
                    <Mail className="h-4 w-4" /> E-mail
                  </span>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateForm("email", e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-gray-50 p-4 font-semibold outline-none focus:border-emerald-500"
                    placeholder="jan@email.cz"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-700">
                    <Phone className="h-4 w-4" /> Telefon
                  </span>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateForm("phone", e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-gray-50 p-4 font-semibold outline-none focus:border-emerald-500"
                    placeholder="+420 777 123 456"
                  />
                </label>
              </div>
            </div>
          )}

          <div className="mt-10 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={back}
              disabled={currentStep === 1}
              className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-gray-600 transition hover:bg-gray-100 disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" />
              Zpět
            </button>
            <button
              type="button"
              onClick={next}
              disabled={!canContinue()}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-900 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {currentStep === TOTAL_STEPS
                ? "Zobrazit expertní pas"
                : "Pokračovat"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
