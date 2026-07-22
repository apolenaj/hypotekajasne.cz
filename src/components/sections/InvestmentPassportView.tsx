"use client";

import {
  evaluateInvestmentPassport,
  FINANCING_OPTIONS,
  HORIZON_OPTIONS,
  initialPassportForm,
  matchMarketsWhatIf,
  PURPOSE_OPTIONS,
  REGION_OPTIONS,
  whatIfFromForm,
  type FinancingChoice,
  type HorizonChoice,
  type MarketMatchResult,
  type PassportFormData,
  type PurposeChoice,
  type RegionChoice,
  type WhatIfParams,
} from "@/lib/investment-passport";
import { WEIGHTS_VERSION } from "@/lib/market-matching";
import { formatNumber, parseNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { submitLead } from "@/lib/leads";
import { routes } from "@/lib/routes";
import {
  FormConsentFields,
  emptyFormConsentState,
  toConsentRecord,
} from "@/components/consent/FormConsentFields";
import { scoreToBucket } from "@/lib/analytics/events";
import { track, trackCanonical } from "@/lib/analytics/track";
import { useFocusTrap } from "@/lib/a11y/focus-trap";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  CheckCircle2,
  Clock,
  GitCompare,
  HelpCircle,
  Loader2,
  MapPin,
  Phone,
  SlidersHorizontal,
  Target,
  User,
  Wallet,
  X,
} from "lucide-react";
import { Mail } from "lucide-react";

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
          ? "border-deep-teal bg-deep-teal/5 shadow-sm"
          : "border-border bg-white hover:border-deep-teal/40"
      )}
    >
      <p
        className={cn(
          "font-bold",
          selected ? "text-deep-teal" : "text-text-dark"
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
                    ? "border-deep-teal bg-deep-teal text-white"
                    : "border-border bg-white text-muted-foreground"
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
                  active || done ? "text-deep-teal" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-deep-teal transition-all duration-500"
          style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
        />
      </div>
    </div>
  );
}

function MatchExplainDialog({
  market,
  onClose,
}: {
  market: MarketMatchResult;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useFocusTrap(true, panelRef, {
    onEscape: onClose,
    initialFocusRef: closeRef,
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="match-explain-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2
              id="match-explain-title"
              className="font-heading text-lg font-bold text-text-dark"
            >
              Proč tento trh získal {market.overallMatch}/100?
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Organické skóre · {WEIGHTS_VERSION}. Placené partnerství skóre
              nemění.
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal"
            aria-label="Zavřít"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          Σ (weight × score). Score = 100 − |atribut trhu − váš ideál| (Capital
          fit = shoda s rozpočtem). Deterministické organické skóre.
        </p>

        <ul className="mt-4 space-y-3">
          {market.breakdown
            .slice()
            .sort((a, b) => b.weightedContribution - a.weightedContribution)
            .map((b) => (
              <li
                key={b.dimension}
                className="rounded-xl border border-border px-3 py-2.5"
              >
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="font-semibold text-text-dark">{b.label}</span>
                  <span className="tabular-nums text-deep-teal">
                    score {b.score} · +{b.weightedContribution.toFixed(1)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  weight {(b.weight * 100).toFixed(0)} % · trh {b.marketValue} ·
                  ideál {b.userIdeal}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{b.explanation}</p>
              </li>
            ))}
        </ul>

        <section className="mt-6 rounded-xl border border-amber-200/80 bg-amber-50/50 p-4">
          <h3 className="text-sm font-bold text-text-dark">
            Co by změnilo skóre?
          </h3>
          <ul className="mt-2 space-y-2">
            {market.whatWouldChangeScore.map((h) => (
              <li key={h.id} className="text-xs text-muted-foreground">
                <span className="font-semibold text-text-dark">{h.label}</span>
                <span className="mt-0.5 block">{h.detail}</span>
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-4 text-xs text-muted-foreground">
          Váhy jsou veřejné na{" "}
          <Link href={routes.metodika} className="text-deep-teal underline">
            /metodika
          </Link>
          . Affiliate / partner revenue skóre nemění.
        </p>
      </div>
    </div>
  );
}

function ComparePanel({
  markets,
  selectedIds,
  onToggle,
}: {
  markets: MarketMatchResult[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}) {
  const selected = markets.filter((m) => selectedIds.includes(m.marketId));
  if (selected.length < 2) {
    return (
      <p className="text-sm text-muted-foreground">
        Vyberte 2–3 trhy výše (checkbox) pro srovnání vedle sebe.
      </p>
    );
  }

  const rows: { label: string; get: (m: MarketMatchResult) => string }[] = [
    {
      label: "Celková shoda",
      get: (m) => `${m.overallMatch}/100`,
    },
    ...mDimensionsRows(),
    {
      label: "Typický vstup",
      get: (m) => `${formatNumber(m.capitalRequired.typicalEntryCzk)} Kč`,
    },
    {
      label: "Min. kapitál",
      get: (m) => `${formatNumber(m.capitalRequired.typicalMinCzk)} Kč`,
    },
    {
      label: "Rozpočet vs vstup",
      get: (m) =>
        m.capitalRequired.reachableVsEntry === "above"
          ? "nad vstupem"
          : m.capitalRequired.reachableVsEntry === "below"
            ? "pod vstupem"
            : "blízko vstupu",
    },
    {
      label: "Financování",
      get: (m) => m.financingOptions.slice(0, 2).join("; "),
    },
    {
      label: "Top riziko",
      get: (m) => m.topRisks[0] ?? "—",
    },
    {
      label: "Data",
      get: (m) => m.dataFreshness.label,
    },
  ];

  function mDimensionsRows(): {
    label: string;
    get: (m: MarketMatchResult) => string;
  }[] {
    const dims = selected[0]?.breakdown.map((b) => b.dimension) ?? [];
    return dims.map((dim) => ({
      label: selected[0]!.breakdown.find((b) => b.dimension === dim)!.label,
      get: (m: MarketMatchResult) => {
        const b = m.breakdown.find((x) => x.dimension === dim);
        return b ? `${b.score}` : "—";
      },
    }));
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[520px] text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-[#f7f8f7]">
            <th className="px-3 py-2 font-semibold text-text-dark">Dimenze</th>
            {selected.map((m) => (
              <th key={m.marketId} className="px-3 py-2 font-semibold text-deep-teal">
                {m.name}
                <button
                  type="button"
                  onClick={() => onToggle(m.marketId)}
                  className="ml-2 text-xs font-normal text-muted-foreground underline"
                >
                  odebrat
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-border/70">
              <td className="px-3 py-2 font-medium text-text-dark">{row.label}</td>
              {selected.map((m) => (
                <td key={m.marketId} className="px-3 py-2 text-muted-foreground">
                  {row.get(m)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MarketCard({
  market,
  rank,
  compareSelected,
  onToggleCompare,
  onExplain,
}: {
  market: MarketMatchResult;
  rank: number;
  compareSelected: boolean;
  onToggleCompare: () => void;
  onExplain: () => void;
}) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <div className="relative h-36 overflow-hidden bg-deep-teal">
        {market.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={market.image}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : null}
        <span className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-deep-teal">
          #{rank}
        </span>
        <label className="absolute right-3 top-3 flex cursor-pointer items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-text-dark">
          <input
            type="checkbox"
            checked={compareSelected}
            onChange={onToggleCompare}
            className="accent-deep-teal"
          />
          Porovnat
        </label>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-heading text-lg font-bold text-text-dark">
          {market.name}
        </h3>
        <p className="mt-1 text-2xl font-bold tabular-nums text-deep-teal">
          Celková shoda {market.overallMatch}/100
        </p>
        <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">
          Organické skóre · bez sponzoringu
        </p>

        <section className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-deep-teal">
            Proč sedí
          </p>
          <ul className="mt-1.5 space-y-1">
            {market.whyMatches.slice(0, 3).map((t) => (
              <li key={t} className="text-xs leading-relaxed text-muted-foreground">
                {t}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
            Proč nemusí sedět
          </p>
          <ul className="mt-1.5 space-y-1">
            {market.whyNotMatches.slice(0, 3).map((t) => (
              <li key={t} className="text-xs leading-relaxed text-muted-foreground">
                {t}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-3 space-y-1 text-xs text-muted-foreground">
          <p>
            <span className="font-semibold text-text-dark">Kapitál: </span>
            typicky {formatNumber(market.capitalRequired.typicalEntryCzk)} Kč
            (min. {formatNumber(market.capitalRequired.typicalMinCzk)} Kč)
          </p>
          <p>
            <span className="font-semibold text-text-dark">Financování: </span>
            {market.financingOptions.join(" · ")}
          </p>
          <p>
            <span className="font-semibold text-text-dark">Rizika: </span>
            {market.topRisks.join(" · ")}
          </p>
          <p>
            <span className="font-semibold text-text-dark">Data: </span>
            {market.dataFreshness.label}
          </p>
        </section>

        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={onExplain}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-deep-teal/30 bg-deep-teal/5 px-3 py-2 text-sm font-semibold text-deep-teal"
          >
            <HelpCircle className="h-4 w-4" />
            Proč tento trh získal {market.overallMatch}/100?
          </button>
          {market.slug ? (
            <Link
              href={`${routes.pruvodceInvestora}/${market.slug}`}
              className="text-center text-sm font-semibold text-deep-teal underline-offset-2 hover:underline"
            >
              Otevřít dossier země →
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function WhatIfPanel({
  formData,
  whatIf,
  onChange,
}: {
  formData: PassportFormData;
  whatIf: WhatIfParams;
  onChange: (next: WhatIfParams) => void;
}) {
  const set = <K extends keyof WhatIfParams>(key: K, value: WhatIfParams[K]) =>
    onChange({ ...whatIf, [key]: value });

  return (
    <section className="rounded-2xl border border-border bg-white p-5 sm:p-6">
      <h3 className="flex items-center gap-2 font-heading text-lg font-bold text-text-dark">
        <SlidersHorizontal className="h-5 w-5 text-deep-teal" />
        What-if režim
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Upravte kapitál, horizont, výnos, riziko a užívání — skóre se přepočítá
        organicky (bez partner boostu).
      </p>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-semibold text-text-dark">Vlastní kapitál (Kč)</span>
          <input
            type="number"
            min={0}
            step={50_000}
            value={whatIf.capitalCzk || ""}
            onChange={(e) => set("capitalCzk", Number(e.target.value) || 0)}
            className="mt-1.5 h-11 w-full rounded-lg border border-border px-3"
          />
        </label>

        <label className="block text-sm">
          <span className="font-semibold text-text-dark">Horizont</span>
          <select
            value={whatIf.horizon}
            onChange={(e) => set("horizon", e.target.value as HorizonChoice)}
            className="mt-1.5 h-11 w-full rounded-lg border border-border px-3"
          >
            {HORIZON_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.title}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm sm:col-span-2">
          <span className="flex justify-between font-semibold text-text-dark">
            Požadovaný výnos
            <span className="tabular-nums text-deep-teal">{whatIf.yieldAppetite}</span>
          </span>
          <input
            type="range"
            min={0}
            max={100}
            value={whatIf.yieldAppetite}
            onChange={(e) => set("yieldAppetite", Number(e.target.value))}
            className="mt-2 w-full accent-deep-teal"
          />
        </label>

        <label className="block text-sm sm:col-span-2">
          <span className="flex justify-between font-semibold text-text-dark">
            Tolerance rizika
            <span className="tabular-nums text-deep-teal">{whatIf.riskTolerance}</span>
          </span>
          <input
            type="range"
            min={0}
            max={100}
            value={whatIf.riskTolerance}
            onChange={(e) => set("riskTolerance", Number(e.target.value))}
            className="mt-2 w-full accent-deep-teal"
          />
        </label>

        <fieldset className="sm:col-span-2">
          <legend className="text-sm font-semibold text-text-dark">
            Vlastní užívání vs investice
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {(
              [
                ["investment", "Čistá investice"],
                ["mixed", "Mix"],
                ["own_use", "Vlastní užívání + pronájem"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => set("useMode", value)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-semibold",
                  whatIf.useMode === value
                    ? "border-deep-teal bg-deep-teal text-white"
                    : "border-border text-muted-foreground hover:border-deep-teal/40"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <p className="mt-4 text-[11px] text-muted-foreground">
        Základní profil: {formData.purpose || "—"} / {formData.region || "—"} /
        financování {formData.financing || "—"}. What-if nemění uložený lead —
        jen přepočet shody.
      </p>
    </section>
  );
}

function PassportDashboard({
  formData,
  result: baselineResult,
  onRestart,
}: {
  formData: PassportFormData;
  result: ReturnType<typeof evaluateInvestmentPassport>;
  onRestart: () => void;
}) {
  const [explainMarket, setExplainMarket] = useState<MarketMatchResult | null>(
    null
  );
  const [whatIf, setWhatIf] = useState<WhatIfParams>(() =>
    whatIfFromForm(formData)
  );
  const liveResult = useMemo(() => {
    const matched = matchMarketsWhatIf(formData, whatIf);
    return {
      ...matched,
      markets: matched.topMarkets,
      financingLabel: baselineResult.financingLabel,
      horizonLabel:
        HORIZON_OPTIONS.find((o) => o.value === whatIf.horizon)?.title ??
        baselineResult.horizonLabel,
    };
  }, [formData, whatIf, baselineResult.financingLabel, baselineResult.horizonLabel]);

  const result = liveResult;
  const completionTracked = useRef(false);

  useEffect(() => {
    if (completionTracked.current) return;
    completionTracked.current = true;
    trackCanonical("investment_passport_completed", "investment_pass_completed", {
      tool_id: "investment_passport",
      score_bucket: scoreToBucket(result.markets[0]?.overallMatch ?? 0),
    });
  }, [result.markets]);

  const [compareIds, setCompareIds] = useState<string[]>(() =>
    result.markets.slice(0, 2).map((m) => m.marketId)
  );

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      let next: string[];
      if (prev.includes(id)) next = prev.filter((x) => x !== id);
      else if (prev.length >= 3) next = [...prev.slice(1), id];
      else next = [...prev, id];
      if (next.length >= 2) {
        trackCanonical("market_compare_started", "market_compared", {
          tool_id: "investment_passport",
          market_ids: next.slice(0, 3).join(","),
        });
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#f4f6f5]">
      <section className="border-b border-border bg-gradient-to-br from-[#0b3d3a] via-[#0f4c48] to-[#1a5c4a] text-white">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <p className="text-sm font-bold uppercase tracking-widest text-muted-gold">
            Osobní investiční průvodce
          </p>
          <h1 className="mt-3 font-heading text-3xl font-bold md:text-4xl">
            {formData.name}, vaše shoda trhů
          </h1>
          <p className="mt-2 text-sm text-white/80">
            {result.profileLabel} · váhy {result.weightsVersion} · organické
            skóre (bez affiliate)
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl space-y-8 px-4 py-10">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Vlastní kapitál (what-if)
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-text-dark">
              {formatNumber(result.capital)} Kč
            </p>
          </div>
          <div className="rounded-2xl border border-deep-teal/20 bg-deep-teal/5 p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-deep-teal">
              Orientační dosažitelný rozpočet
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-deep-teal">
              {formatNumber(result.reachableBudget)} Kč
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {formData.financing === "cash"
                ? "100% cash = kapitál"
                : "Model páky ×3 — ne příslib úvěru"}
            </p>
          </div>
        </div>

        <WhatIfPanel formData={formData} whatIf={whatIf} onChange={setWhatIf} />

        <div>
          <h2 className="font-heading text-xl font-bold text-text-dark">
            Top 3 trhy
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Seřazeno podle organické celkové shody. Partnerství skóre
            neovlivňuje — viz{" "}
            <Link href={routes.metodika} className="text-deep-teal underline">
              metodika
            </Link>
            .
          </p>

          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
            {result.markets.map((market, index) => (
              <MarketCard
                key={market.marketId}
                market={market}
                rank={index + 1}
                compareSelected={compareIds.includes(market.marketId)}
                onToggleCompare={() => toggleCompare(market.marketId)}
                onExplain={() => setExplainMarket(market)}
              />
            ))}
          </div>
        </div>

        <section className="rounded-2xl border border-border bg-white p-5 sm:p-6">
          <h3 className="flex items-center gap-2 font-heading text-lg font-bold text-text-dark">
            <GitCompare className="h-5 w-5 text-deep-teal" />
            Srovnání vedle sebe (2–3 země)
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Můžete přidat i další trhy z organického žebříčku.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {result.allMarkets.map((m) => (
              <button
                key={m.marketId}
                type="button"
                onClick={() => toggleCompare(m.marketId)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-semibold",
                  compareIds.includes(m.marketId)
                    ? "border-deep-teal bg-deep-teal text-white"
                    : "border-border text-muted-foreground hover:border-deep-teal/40"
                )}
              >
                {m.name} ({m.overallMatch})
              </button>
            ))}
          </div>
          <div className="mt-4">
            <ComparePanel
              markets={result.allMarkets}
              selectedIds={compareIds}
              onToggle={toggleCompare}
            />
          </div>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href={routes.navrhNaMiru}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-deep-teal px-6 py-3.5 text-center text-sm font-bold text-white transition hover:bg-deep-teal/90"
          >
            Hypoteční připravenost
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={routes.metodika}
            className="inline-flex items-center justify-center rounded-lg border border-border px-6 py-3.5 text-sm font-bold text-text-dark hover:bg-muted"
          >
            Váhy scoringu v metodice
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

      {explainMarket ? (
        <MatchExplainDialog
          market={explainMarket}
          onClose={() => setExplainMarket(null)}
        />
      ) : null}
    </div>
  );
}

export function InvestmentPassportView() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] =
    useState<PassportFormData>(initialPassportForm);
  const [submitted, setSubmitted] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [consent, setConsent] = useState(() =>
    emptyFormConsentState("mortgage_specialist")
  );
  const [startedTracked, setStartedTracked] = useState(false);

  const updateForm = <K extends keyof PassportFormData>(
    key: K,
    value: PassportFormData[K]
  ) => {
    if (!startedTracked) {
      track("investment_pass_started", { tool_id: "investment_passport" });
      setStartedTracked(true);
    }
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

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
        formData.phone.trim().length >= 9 &&
        consent.privacyAccepted &&
        consent.partnerTransferAccepted
      );
    }
    return false;
  };

  const next = async () => {
    if (!canContinue()) return;
    if (currentStep === TOTAL_STEPS) {
      setSubmitError(null);
      setSubmitLoading(true);

      const leadResult = await submitLead({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        source: "investment_passport",
        notes: [
          `Kapitál: ${formData.capital} Kč`,
          `Financování: ${formData.financing || "—"}`,
          `Účel: ${formData.purpose || "—"}`,
          `Region: ${formData.region || "—"}`,
          `Horizont: ${formData.horizon || "—"}`,
          `Top trhy: ${result.markets
            .map((m) => `${m.name} ${m.overallMatch}`)
            .join(", ")}`,
        ].join(" | "),
        metadata: {
          product: "market_matching",
          capital: formData.capital,
          financing: formData.financing,
          purpose: formData.purpose,
          region: formData.region,
          horizon: formData.horizon,
          top_markets: result.markets.map((m) => ({
            name: m.name,
            overallMatch: m.overallMatch,
            isSponsored: m.isSponsored,
          })),
          weights_version: result.weightsVersion,
          profile: result.profileLabel,
          reachable_budget: result.reachableBudget,
        },
        country: result.markets[0]?.name,
        consent: toConsentRecord(consent),
      });

      setSubmitLoading(false);
      if (!leadResult.ok) {
        setSubmitError(leadResult.error);
        return;
      }

      trackCanonical("lead_form_submitted", "lead_submitted", {
        lead_source: "investment_passport",
        partner_scope: "mortgage_specialist",
        lead_qualified: true,
      });
      trackCanonical("partner_handoff_requested", "partner_handoff", {
        lead_source: "investment_passport",
        partner_scope: "mortgage_specialist",
      });

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
    <div className="min-h-screen bg-[#f4f6f5]">
      <section className="border-b border-border bg-gradient-to-br from-[#0b3d3a] via-[#0f4c48] to-[#1a5c4a] text-white">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <p className="text-sm font-bold uppercase tracking-widest text-muted-gold">
            Osobní investiční průvodce
          </p>
          <h1 className="mt-3 font-heading text-3xl font-bold md:text-5xl">
            Přiřazení trhů na míru
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/85 md:text-lg">
            Transparentní vážené skóre napříč 10 dimenzemi. Top 3 trhy s
            vysvětlením — ne black box.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-3xl border border-border bg-white p-6 shadow-sm sm:p-10">
          <StepProgress currentStep={currentStep} />

          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-text-dark">
                Kolik máte k dispozici vlastních prostředků?
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Vstup do dimenze požadovaného kapitálu.
              </p>
              <label className="mt-8 block">
                <span className="mb-2 block text-sm font-bold text-text-dark">
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
                  className="w-full rounded-xl border border-border bg-[#f7f8f7] p-4 text-lg font-bold outline-none ring-deep-teal/30 focus:ring-2"
                />
              </label>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-text-dark">
                Jak plánujete nákup financovat?
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Ovlivní financing availability a rozpočet.
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
              <h2 className="text-2xl font-bold text-text-dark">
                Co je vaším hlavním cílem?
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Nastaví ideály yield, risk a intended use.
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
              <h2 className="text-2xl font-bold text-text-dark">
                Jaké prostředí preferujete?
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Váží currency risk, regulation a ownership.
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
              <h2 className="text-2xl font-bold text-text-dark">
                Kdy plánujete nemovitost pořídit?
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Dimenze investment horizon a liquidity.
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
              <h2 className="text-2xl font-bold text-text-dark">
                Kam zaslat výsledek přiřazení trhů?
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Po odeslání uvidíte Top 3 s rozkladem skóre. Kontakt je
                volitelný pro konzultaci — skóre se počítá z odpovědí, ne z
                partnerství.
              </p>
              <div className="mt-8 space-y-4">
                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm font-bold text-text-dark">
                    <User className="h-4 w-4" /> Jméno a příjmení
                  </span>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateForm("name", e.target.value)}
                    className="w-full rounded-xl border border-border bg-[#f7f8f7] p-4 font-semibold outline-none ring-deep-teal/30 focus:ring-2"
                    placeholder="Jan Novák"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm font-bold text-text-dark">
                    <Mail className="h-4 w-4" /> E-mail
                  </span>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateForm("email", e.target.value)}
                    className="w-full rounded-xl border border-border bg-[#f7f8f7] p-4 font-semibold outline-none ring-deep-teal/30 focus:ring-2"
                    placeholder="jan@email.cz"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm font-bold text-text-dark">
                    <Phone className="h-4 w-4" /> Telefon
                  </span>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateForm("phone", e.target.value)}
                    className="w-full rounded-xl border border-border bg-[#f7f8f7] p-4 font-semibold outline-none ring-deep-teal/30 focus:ring-2"
                    placeholder="+420 777 123 456"
                  />
                </label>
                <FormConsentFields
                  state={consent}
                  onChange={setConsent}
                  showPartnerTransfer
                />
              </div>
            </div>
          )}

          <div className="mt-10 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={back}
              disabled={currentStep === 1}
              className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-muted-foreground transition hover:bg-muted disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" />
              Zpět
            </button>
            <button
              type="button"
              onClick={next}
              disabled={!canContinue() || submitLoading}
              className="inline-flex items-center gap-2 rounded-full bg-deep-teal px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-deep-teal/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Odesílám…
                </>
              ) : currentStep === TOTAL_STEPS ? (
                <>
                  Zobrazit shodu trhů
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  Pokračovat
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
          {submitError && currentStep === TOTAL_STEPS && (
            <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
              {submitError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
