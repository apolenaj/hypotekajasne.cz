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
  ltvScopeLabelCs,
  purposeLabelCs,
  rateTypeLabelCs,
  scenarioLabelCs,
  sourceTypeLabelCs,
} from "@/lib/mortgage-market/public-labels";
import {
  resolveBankRatePaymentDisplay,
  type BankRatePaymentParams,
} from "@/lib/mortgage-market/bank-rate-monthly-payment";
import {
  evaluatePublicRateDisplay,
  PUBLIC_RATE_VERIFYING_MESSAGE,
} from "@/lib/mortgage-market/public-rate-display";
import { cn } from "@/lib/utils";

type BankRateCardProps = {
  group: LenderOfferGroup;
  className?: string;
  /** Loan + splatnost from validated journey — drives orientační splátka. */
  paymentParams?: BankRatePaymentParams | null;
  /** Called when user wants to continue with a scenario (lead funnel). */
  onSelectScenario?: (offer: MortgageOffer) => void;
};

function primaryConditions(offer: MortgageOffer) {
  const required = offer.conditions.filter((c) => c.isRequired);
  return required.length > 0 ? required : offer.conditions.slice(0, 3);
}

function ScenarioRow({
  offer,
  paymentParams,
}: {
  offer: MortgageOffer;
  paymentParams?: BankRatePaymentParams | null;
}) {
  const display = evaluatePublicRateDisplay(offer);
  const payment = resolveBankRatePaymentDisplay(offer, paymentParams);

  return (
    <div className="min-w-0 space-y-1.5">
      <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
        {payment ? (
          <p className="font-heading text-2xl font-bold tabular-nums tracking-tight text-text-dark">
            {payment.rateHeadline}
          </p>
        ) : display.showNumeric ? (
          <p className="font-heading text-2xl font-bold tabular-nums tracking-tight text-text-dark">
            {display.headline}
            <span className="ml-1 text-sm font-semibold text-muted-foreground">
              p.a.
            </span>
          </p>
        ) : (
          <p className="font-heading text-lg font-bold text-deep-teal">
            {PUBLIC_RATE_VERIFYING_MESSAGE}
          </p>
        )}
        <p className="text-sm text-muted-foreground">{scenarioLabelCs(offer)}</p>
      </div>
      {payment ? (
        <>
          <p className="font-heading text-lg font-semibold tabular-nums text-text-dark">
            {payment.monthlyPaymentLine}
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {payment.disclaimer}
          </p>
        </>
      ) : null}
    </div>
  );
}

function PublicRateMeta({ offer }: { offer: MortgageOffer }) {
  const display = evaluatePublicRateDisplay(offer);
  const conditions = primaryConditions(offer);
  if (display.visibility === "hidden") return null;

  return (
    <div className="mt-3 space-y-2 text-xs text-muted-foreground">
      <dl className="grid gap-2 sm:grid-cols-2">
        <div>
          <dt className="font-semibold uppercase tracking-wide text-muted-foreground/80">
            Typ produktu
          </dt>
          <dd className="mt-0.5 text-text-dark">
            {purposeLabelCs(offer.financingPurpose)}
          </dd>
        </div>
        {display.verifiedAtLabel ? (
          <div>
            <dt className="font-semibold uppercase tracking-wide text-muted-foreground/80">
              Poslední ověření
            </dt>
            <dd className="mt-0.5 text-text-dark">{display.verifiedAtLabel}</dd>
          </div>
        ) : null}
      </dl>

      {conditions.length > 0 ? (
        <div>
          <p className="font-semibold uppercase tracking-wide text-muted-foreground/80">
            Hlavní podmínky sazby
          </p>
          <ul className="mt-1 space-y-1">
            {conditions.map((c, i) => {
              const effect = conditionEffectLabelCs(c.rateEffectBp);
              return (
                <li key={`${c.conditionType}-${i}`} className="text-text-dark">
                  <span className="font-medium">
                    {conditionTypeLabelCs(c.conditionType)}
                  </span>
                  {effect ? (
                    <span className="text-muted-foreground"> · {effect}</span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {display.sourceUrl ? (
        <p>
          Oficiální zdroj banky:{" "}
          <a
            href={display.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-deep-teal underline underline-offset-2"
          >
            Otevřít sazebník
          </a>
        </p>
      ) : null}
    </div>
  );
}

function OfferDetails({ offer }: { offer: MortgageOffer }) {
  const ltv = ltvScopeLabelCs(offer);
  const display = evaluatePublicRateDisplay(offer);
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
              const publicNote =
                c.description &&
                !/[A-Za-z]{4,}/.test(
                  c.description.replace(/[áčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]/g, "")
                )
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
        <p className="text-text-dark">{display.badge}</p>
        {offer.evidence ? (
          <p className="mt-1">
            Zdroj: {sourceTypeLabelCs(offer.evidence.sourceType)}
            {display.sourceUrl ? (
              <>
                {" · "}
                <a
                  href={display.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-deep-teal underline underline-offset-2"
                >
                  Otevřít oficiální zdroj
                </a>
              </>
            ) : null}
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

function AlternateScenarioLine({
  offer,
  paymentParams,
}: {
  offer: MortgageOffer;
  paymentParams?: BankRatePaymentParams | null;
}) {
  const display = evaluatePublicRateDisplay(offer);
  const payment = resolveBankRatePaymentDisplay(offer, paymentParams);
  if (!display.showNumeric) {
    return (
      <p className="text-sm text-muted-foreground">
        Alternativa: {PUBLIC_RATE_VERIFYING_MESSAGE} · {scenarioLabelCs(offer)}
      </p>
    );
  }
  return (
    <div className="text-sm text-muted-foreground">
      <p>
        Alternativa:{" "}
        <span className="font-semibold tabular-nums text-text-dark">
          {payment?.rateHeadline ?? display.headline}
        </span>{" "}
        {scenarioLabelCs(offer)}
      </p>
      {payment ? (
        <p className="mt-0.5 tabular-nums text-text-dark">
          {payment.monthlyPaymentLine}
        </p>
      ) : null}
    </div>
  );
}

export function BankRateCard({
  group,
  className,
  paymentParams,
  onSelectScenario,
}: BankRateCardProps) {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const primary = group.scenarios[0]!;
  const display = evaluatePublicRateDisplay(primary);
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
          {display.badge}
        </p>
      </header>

      <div className="mt-3 space-y-3">
        <ScenarioRow offer={primary} paymentParams={paymentParams} />
        {secondary && secondary.rateVariantId !== primary.rateVariantId ? (
          <AlternateScenarioLine offer={secondary} paymentParams={paymentParams} />
        ) : null}
        {!pair && group.scenarios.length > 2
          ? group.scenarios.slice(1).map((s) => (
              <AlternateScenarioLine
                key={s.rateVariantId}
                offer={s}
                paymentParams={paymentParams}
              />
            ))
          : null}
      </div>

      <p className="mt-3 text-xs text-muted-foreground">{ltv.headline}</p>
      {primary.ltvScope === "unspecified" ? (
        <p className="mt-1 text-xs text-amber-900/90">
          Banka v tomto sazebníku neuvádí samostatné cenové pásmo LTV.
        </p>
      ) : null}

      <PublicRateMeta offer={primary} />

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
        <div id={panelId} className="mt-4 border-t border-border/80 pt-4">
          {group.scenarios.map((offer) => {
            const scenarioDisplay = evaluatePublicRateDisplay(offer);
            return (
              <div
                key={offer.rateVariantId}
                className="mb-4 last:mb-0 border-b border-border/50 pb-4 last:border-0 last:pb-0"
              >
                {group.scenarios.length > 1 ? (
                  <p className="mb-2 text-sm font-semibold text-text-dark">
                    {scenarioLabelCs(offer)}
                    {scenarioDisplay.showNumeric
                      ? ` · ${scenarioDisplay.headline}`
                      : ` · ${PUBLIC_RATE_VERIFYING_MESSAGE}`}
                  </p>
                ) : null}
                <OfferDetails offer={offer} />
              </div>
            );
          })}
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
        {message ?? PUBLIC_RATE_VERIFYING_MESSAGE}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Zatím nezveřejňujeme ověřenou maloobchodní sazbu. Nejde o modelový odhad.
      </p>
    </article>
  );
}
