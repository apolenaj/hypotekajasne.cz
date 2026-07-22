"use client";

import {
  Pencil,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import type { FinancialProfileAnswers } from "@/lib/financial-passport";
import type { MojeMoznostiResult } from "@/lib/moje-moznosti";
import { purposeLabel } from "@/lib/financial-passport";
import {
  CTA_CS,
  CTA_SECONDARY_CLASS,
  CTA_TERTIARY_CLASS,
} from "@/lib/ux/cta";
import { ExplainDisclosure } from "@/components/ux/ExplainDisclosure";
import { SimpleResultHero } from "@/components/ux/SimpleResultHero";
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

function ClaimBadge({
  kind,
}: {
  kind: "DATA" | "MODEL" | "ODHAD" | "NEOVERENO" | "LIVE" | "OVĚŘENO";
}) {
  const label =
    kind === "LIVE"
      ? "Aktuální data"
      : kind === "OVĚŘENO"
        ? "Ověřeno"
        : kind === "MODEL"
          ? "Model"
          : kind === "ODHAD"
            ? "Odhad"
            : kind === "DATA"
              ? "Data"
              : "Neověřeno";
  return (
    <span className="inline-flex rounded-md bg-deep-teal/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-deep-teal">
      {label}
    </span>
  );
}

export function MojeMoznostiResultView({
  result,
  profile,
  onEdit,
  onReset,
}: {
  result: MojeMoznostiResult;
  profile: FinancialProfileAnswers;
  onEdit: () => void;
  onReset: () => void;
}) {
  const headlineBudget =
    result.finance.recommendedBudget ??
    result.finance.saferBudget ??
    result.finance.modelMaxBudget;

  const whatNextActions = result.nextActions.map((a, i) => ({
    id: a.id,
    label: a.label,
    description: a.description,
    href: a.href,
    primary: i === 0,
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
            Vaše možnosti
          </p>
          <h1 className="mt-2 font-heading text-2xl font-bold text-text-dark sm:text-3xl">
            Orientační diagnostika
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Cíl: {purposeLabel(profile.intent)}. Sazba{" "}
            {result.ratePercentUsed.toFixed(2)} % ({result.rateUiKind}). Nejde o
            schválení banky.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onEdit}
            className={cn(CTA_SECONDARY_CLASS, "px-3")}
          >
            <Pencil className="h-4 w-4" aria-hidden />
            {CTA_CS.editInputs}
          </button>
          <button
            type="button"
            onClick={onReset}
            className={CTA_TERTIARY_CLASS}
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            Resetovat
          </button>
        </div>
      </div>

      {/* Simple */}
      <div className="mt-8">
        <SimpleResultHero
          eyebrow="Finance"
          label="Doporučený rozpočet"
          value={fmt(headlineBudget)}
          hint="Orientační model podle příjmu, vlastních zdrojů a sazby. Nejde o nabídku banky."
          badge={<ClaimBadge kind={result.finance.claimKind} />}
        />
      </div>

      {/* Explain */}
      <div className="mt-4">
        <ExplainDisclosure
          summary={CTA_CS.howCalculated}
          advanced={
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                Maximální úvěr (model): {fmt(result.finance.maxLoanModel)}.
                Vlastní prostředky: {fmt(result.finance.ownFundsHave)}.
                {result.finance.ownFundsNeeded != null
                  ? ` Orientační potřeba vlastních zdrojů až ${fmt(result.finance.ownFundsNeeded)}.`
                  : ""}
              </p>
              <p className="text-xs">{result.finance.claimNote}</p>
            </div>
          }
        >
          <ul className="grid gap-3 sm:grid-cols-3">
            <li className="rounded-xl bg-[#f7f8f7] p-4">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Modelové maximum
              </p>
              <p className="mt-1 font-heading text-xl font-bold tabular-nums text-deep-teal">
                {fmt(result.finance.modelMaxBudget)}
              </p>
            </li>
            <li className="rounded-xl bg-[#f7f8f7] p-4">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Bezpečnější rozpočet
              </p>
              <p className="mt-1 font-heading text-xl font-bold tabular-nums text-text-dark">
                {fmt(result.finance.saferBudget)}
              </p>
            </li>
            <li className="rounded-xl bg-[#f7f8f7] p-4">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Vlastní prostředky
              </p>
              <p className="mt-1 font-heading text-xl font-bold tabular-nums text-text-dark">
                {fmt(result.finance.ownFundsHave)}
              </p>
            </li>
          </ul>
        </ExplainDisclosure>
      </div>

      {/* Readiness — simple score, details in disclosure */}
      <section
        aria-labelledby="moznosti-readiness"
        className="mt-4 rounded-2xl border border-border bg-white p-5 sm:p-6"
      >
        <div className="flex flex-wrap items-center gap-2">
          <h2
            id="moznosti-readiness"
            className="font-heading text-xl font-bold text-text-dark"
          >
            Připravenost na financování
          </h2>
          <ClaimBadge kind={result.readiness.claimKind} />
        </div>
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <p className="font-heading text-4xl font-bold tabular-nums text-deep-teal">
            {result.readiness.score}
            <span className="text-lg font-semibold text-muted-foreground">
              /100
            </span>
          </p>
          <p className="text-sm font-medium text-text-dark">
            {result.readiness.band}
          </p>
        </div>

        <div className="mt-4">
          <ExplainDisclosure summary="Proč toto skóre">
            {result.readiness.obstacles.length > 0 ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Hlavní překážky
                </p>
                <ul className="mt-2 space-y-1.5">
                  {result.readiness.obstacles.map((o) => (
                    <li
                      key={o}
                      className="flex gap-2 text-sm text-amber-950"
                    >
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                      {o}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Bez kritických překážek v modelu.
              </p>
            )}
            {result.readiness.nextStep ? (
              <p className="mt-3 text-sm text-muted-foreground">
                <span className="font-semibold text-text-dark">
                  {CTA_CS.nextStep}:{" "}
                </span>
                {result.readiness.nextStep}
              </p>
            ) : null}
            <p className="mt-3 text-xs text-muted-foreground">
              {result.readiness.disclaimer}
            </p>
          </ExplainDisclosure>
        </div>
      </section>

      {/* Markets */}
      <section
        aria-labelledby="moznosti-markets"
        className="mt-4 rounded-2xl border border-border bg-white p-5 sm:p-6"
      >
        <div className="flex flex-wrap items-center gap-2">
          <h2
            id="moznosti-markets"
            className="font-heading text-xl font-bold text-text-dark"
          >
            Kde dává smysl hledat
          </h2>
          <ClaimBadge kind={result.markets.claimKind} />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {result.markets.profileLabel}
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          {result.markets.markets.map((m) => (
            <li
              key={m.id}
              className="rounded-xl border border-border bg-[#f7f8f7] p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-text-dark">{m.name}</p>
                <span className="tabular-nums text-sm font-bold text-deep-teal">
                  {m.overallMatch}
                </span>
              </div>
              <p className="mt-1 text-[10px] font-bold uppercase text-muted-foreground">
                {m.dataStatus}
              </p>
              {m.whyMatch[0] ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  Proč: {m.whyMatch[0]}
                </p>
              ) : null}
              {m.topRisks[0] ? (
                <p className="mt-1 text-xs text-amber-900">
                  Riziko: {m.topRisks[0]}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">
          {result.markets.note}
        </p>
      </section>

      <div className="mt-6">
        <WhatNextPanel actions={whatNextActions} />
      </div>
    </div>
  );
}
