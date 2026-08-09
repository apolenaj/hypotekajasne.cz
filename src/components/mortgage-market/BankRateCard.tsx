"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { pricingScenarioCategory } from "@/lib/analytics/bands";
import { trackEvent } from "@/lib/analytics/track-event";
import type { LenderOfferGroup } from "@/lib/mortgage-market/group-offers";
import { isInsuranceScenarioPair } from "@/lib/mortgage-market/group-offers";
import type { MortgageOffer } from "@/lib/mortgage-market/offers";
import {
  conditionEffectLabelCs,
  conditionTypeLabelCs,
  fixationLabelCs,
  formatRatePercentCs,
  ltvScopeLabelCs,
  publicFreshnessLabel,
  purposeLabelCs,
  rateTypeLabelCs,
  scenarioLabelCs,
  sourceTypeLabelCs,
} from "@/lib/mortgage-market/public-labels";
import { cn } from "@/lib/utils";

type BankRateCardProps = {
  group: LenderOfferGroup;
  className?: string;
  /** Called when user wants to continue with a scenario (lead funnel). */
  onSelectScenario?: (offer: MortgageOffer) => void;
};

function ScenarioRow({ offer }: { offer: MortgageOffer }) {
  return (
    <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
      <p className="font-heading text-2xl font-bold tabular-nums tracking-tight text-text-dark">
        {formatRatePercentCs(offer.nominalInterestRate)}&nbsp;%
        <span className="ml-1 text-sm font-semibold text-muted-foreground">
          p.a.
        </span>
      </p>
      <p className="text-sm text-muted-foreground">
        {scenarioLabelCs(offer)}
      </p>
    </div>
  );
}

function OfferDetails({ offer }: { offer: MortgageOffer }) {
  const ltv = ltvScopeLabelCs(offer);
  const fresh = publicFreshnessLabel(offer.freshness, offer.checkedAt);
  return (
    <div className="space-y-3 text-sm text-muted-foreground">
      <dl className="grid gap-2 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
            Varianta
          </dt>
          <dd className="mt-0.5 text-text-dark">{scenarioLabelCs(offer)}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
            Typ sazby
          </dt>
          <dd className="mt-0.5 text-text-dark">
            {rateTypeLabelCs(offer.rateType)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
            LTV
          </dt>
          <dd className="mt-0.5 text-text-dark">{ltv.headline}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
            Účel
          </dt>
          <dd className="mt-0.5 text-text-dark">
            {purposeLabelCs(offer.financingPurpose)}
          </dd>
        </div>
      </dl>

      {offer.conditions.length > 0 ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
            Podmínky sazby
          </p>
          <ul className="mt-1.5 space-y-1.5">
            {offer.conditions.map((c, i) => {
              const effect = conditionEffectLabelCs(c.rateEffectBp);
              // Prefer Czech labels — skip English audit notes for public UI.
              const publicNote =
                c.description &&
                !/[A-Za-z]{4,}/.test(c.description.replace(/[áčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]/g, ""))
                  ? c.description
                  : null;
              return (
                <li key={`${c.conditionType}-${i}`} className="text-text-dark">
                  <span className="font-medium">
                    {conditionTypeLabelCs(c.conditionType)}
                  </span>
                  {effect ? (
                    <span className="text-muted-foreground"> · {effect}</span>
                  ) : null}
                  {publicNote ? (
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {publicNote}
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {offer.fees.length > 0 ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
            Související náklady (jak je banka uvádí)
          </p>
          <ul className="mt-1.5 space-y-1">
            {offer.fees.map((f, i) => {
              const feeLabel =
                f.feeType === "insurance_repayment"
                  ? "Náklady pojištění schopnosti splácet (jak je banka uvádí)"
                  : "Poplatek související s produktem";
              return (
                <li key={`${f.feeType}-${i}`} className="text-xs text-text-dark">
                  {feeLabel}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      <div className="border-t border-border/70 pt-3 text-xs">
        <p className="text-text-dark">{fresh.detail}</p>
        {offer.evidence ? (
          <p className="mt-1">
            Zdroj: {sourceTypeLabelCs(offer.evidence.sourceType)}
          </p>
        ) : null}
        <p className="mt-2 text-muted-foreground">
          Zveřejněná sazba banky. Konečná nabídka závisí na vaší situaci a
          posouzení banky.
        </p>
      </div>
    </div>
  );
}

export function BankRateCard({
  group,
  className,
  onSelectScenario,
}: BankRateCardProps) {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const primary = group.scenarios[0]!;
  const fresh = publicFreshnessLabel(primary.freshness, primary.checkedAt);
  const ltv = ltvScopeLabelCs(primary);
  const pair = isInsuranceScenarioPair(group);
  const secondary = pair
    ? group.scenarios.find(
        (s) => s.pricingScenarioKey === "without_repayment_insurance"
      )
    : group.scenarios[1];

  return (
    <article
      className={cn(
        "rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-5",
        className
      )}
    >
      <header className="flex min-w-0 flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-heading text-lg font-bold text-text-dark">
            {group.lenderName}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {fixationLabelCs(group.fixationMonths)}
            {group.financingPurpose
              ? ` · ${purposeLabelCs(group.financingPurpose)}`
              : null}
          </p>
        </div>
        <p className="shrink-0 rounded-md bg-deep-teal/10 px-2 py-1 text-[11px] font-semibold text-deep-teal">
          {fresh.short}
        </p>
      </header>

      <div className="mt-3 space-y-2">
        <ScenarioRow offer={primary} />
        {secondary && secondary.rateVariantId !== primary.rateVariantId ? (
          <p className="text-sm text-muted-foreground">
            Alternativa:{" "}
            <span className="font-semibold tabular-nums text-text-dark">
              {formatRatePercentCs(secondary.nominalInterestRate)}&nbsp;%
            </span>{" "}
            {scenarioLabelCs(secondary)}
          </p>
        ) : null}
        {!pair && group.scenarios.length > 2
          ? group.scenarios.slice(1).map((s) => (
              <p
                key={s.rateVariantId}
                className="text-sm text-muted-foreground"
              >
                <span className="font-semibold tabular-nums text-text-dark">
                  {formatRatePercentCs(s.nominalInterestRate)}&nbsp;%
                </span>{" "}
                {scenarioLabelCs(s)}
              </p>
            ))
          : null}
      </div>

      <p className="mt-3 text-xs text-muted-foreground">{ltv.headline}</p>
      {primary.ltvScope === "unspecified" ? (
        <p className="mt-1 text-xs text-amber-900/90">
          Banka v tomto sazebníku neuvádí samostatné cenové pásmo LTV.
        </p>
      ) : null}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          className="inline-flex h-11 min-h-11 items-center justify-center gap-1.5 rounded-lg border border-border bg-white px-4 text-sm font-semibold text-text-dark transition-colors hover:border-deep-teal/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => {
            const next = !open;
            setOpen(next);
            if (next) {
              trackEvent("rate_detail_open", {
                lender_slug: group.lenderSlug,
                product_slug: group.productSlug,
                pricing_scenario_category: pricingScenarioCategory(
                  primary.pricingScenarioKey
                ),
                fixation_months: group.fixationMonths ?? undefined,
                ltv_scope: primary.ltvScope,
                rate_type: primary.rateType,
                funnel_id: "phase4_conversion",
              });
            }
          }}
        >
          Podmínky sazby
          <ChevronDown
            className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
            aria-hidden
          />
        </button>
        {onSelectScenario ? (
          <button
            type="button"
            className="inline-flex h-11 min-h-11 items-center justify-center rounded-lg bg-deep-teal px-4 text-sm font-semibold text-white transition-colors hover:bg-deep-teal-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal focus-visible:ring-offset-2"
            onClick={() => onSelectScenario(primary)}
          >
            Zjistit možnosti pro moji situaci
          </button>
        ) : null}
      </div>

      {open ? (
        <div
          id={panelId}
          className="mt-4 border-t border-border/80 pt-4"
        >
          {group.scenarios.map((offer) => (
            <div
              key={offer.rateVariantId}
              className="mb-4 last:mb-0 border-b border-border/50 pb-4 last:border-0 last:pb-0"
            >
              {group.scenarios.length > 1 ? (
                <p className="mb-2 text-sm font-semibold text-text-dark">
                  {scenarioLabelCs(offer)} ·{" "}
                  {formatRatePercentCs(offer.nominalInterestRate)}&nbsp;%
                </p>
              ) : null}
              <OfferDetails offer={offer} />
            </div>
          ))}
        </div>
      ) : null}
    </article>
  );
}

export function LenderPendingCard({
  lenderName,
  message,
}: {
  lenderName: string;
  message?: string;
}) {
  return (
    <article className="rounded-2xl border border-dashed border-border bg-[#f7f8f7] p-4 sm:p-5">
      <h3 className="font-heading text-lg font-bold text-text-dark">
        {lenderName}
      </h3>
      <p className="mt-2 text-sm font-medium text-deep-teal">
        {message ?? "Sazbu právě ověřujeme"}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Zatím nezveřejňujeme ověřenou maloobchodní sazbu. Nejde o modelový odhad.
      </p>
    </article>
  );
}
