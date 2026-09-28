"use client";

import { useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LeadCaptureForm } from "@/components/forms/LeadCaptureForm";
import { MortgageCalculationSummary } from "@/components/mortgage-market/MortgageCalculationSummary";
import { PublishedRatesPanel } from "@/components/mortgage-market/PublishedRatesPanel";
import { RpsnEducationBlock } from "@/components/mortgage-market/RpsnEducationBlock";
import { pricingScenarioCategory } from "@/lib/analytics/bands";
import { trackEvent, trackEventOnce } from "@/lib/analytics/track-event";
import type {
  GetMortgageOffersResult,
  MortgageOffer,
} from "@/lib/mortgage-market/offers";
import {
  getPartnerOfferBank,
  normalizePartnerLenderSlug,
  PARTNER_OFFER_INQUIRY_MESSAGE,
  PARTNER_OFFER_PUBLIC_FLOOR,
  PUBLIC_RATE_PERSONAL_OFFER_ON_INQUIRY_CS,
  type PartnerOfferBankId,
} from "@/lib/mortgage-market/partner-offer-banks";
import { parseMortgageJourneyParams } from "@/lib/mortgage-rates/mortgage-journey-context";
import type { LtvContext, MortgageJourneyCore } from "@/lib/mortgage-rates/ltv-context";
import {
  resolveMortgageJourneySummary,
  type MortgageJourneySummary,
} from "@/lib/mortgage-rates/mortgage-journey-summary";
import { LEAD_FORM_FRICTION_ABOVE } from "@/lib/leads-form-copy";
import { CTA_CS } from "@/lib/ux/cta";

type SazbyExperienceProps = {
  initialOffers: GetMortgageOffersResult | null;
  initialQuery: MortgageJourneyCore;
  ltvContext: LtvContext;
  initialParamErrors?: string[];
  journeySummary: MortgageJourneySummary;
  journeyMetadata?: Record<string, unknown>;
};

type SelectedBankContext =
  | { kind: "rate"; offer: MortgageOffer }
  | { kind: "inquiry"; lenderSlug: PartnerOfferBankId; lenderName: string };

function inquirySelectionFromSlug(
  raw: string | null
): SelectedBankContext | null {
  const slug = normalizePartnerLenderSlug(raw);
  if (!slug) return null;
  const bank = getPartnerOfferBank(slug);
  if (!bank) return null;
  return {
    kind: "inquiry",
    lenderSlug: slug,
    lenderName: bank.name,
  };
}

export function SazbyExperience({
  initialOffers,
  initialQuery,
  ltvContext,
  initialParamErrors = [],
  journeySummary: initialSummary,
  journeyMetadata: initialJourneyMetadata,
}: SazbyExperienceProps) {
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState<SelectedBankContext | null>(() =>
    inquirySelectionFromSlug(searchParams.get("lender"))
  );
  const funnelStartedRef = useRef(false);

  const journeySummary = useMemo(() => {
    const raw = Object.fromEntries(searchParams.entries());
    if (Object.keys(raw).length === 0) return initialSummary;
    return resolveMortgageJourneySummary(parseMortgageJourneyParams(raw));
  }, [searchParams, initialSummary]);

  const journeyMetadata = useMemo(() => {
    const base = { ...initialJourneyMetadata };
    if (journeySummary.status === "ready") {
      base.modelMonthlyPayment = journeySummary.modelMonthlyPaymentCzk;
    }
    return base;
  }, [initialJourneyMetadata, journeySummary]);

  const selectedLenderSlug =
    selected?.kind === "rate"
      ? normalizePartnerLenderSlug(selected.offer.lenderSlug)
      : selected?.kind === "inquiry"
        ? selected.lenderSlug
        : null;

  const metadata = {
    ...journeyMetadata,
    selectedLender: selectedLenderSlug ?? undefined,
    lenderSlug: selectedLenderSlug ?? undefined,
    selectedProduct:
      selected?.kind === "rate" ? selected.offer.productSlug : undefined,
    selectedPricingScenario:
      selected?.kind === "rate"
        ? selected.offer.pricingScenarioKey
        : selected?.kind === "inquiry"
          ? "partner_offer_inquiry"
          : undefined,
    selectedNominalRate:
      selected?.kind === "rate"
        ? selected.offer.nominalInterestRate
        : undefined,
    selectedRateScenarioCategory:
      selected?.kind === "rate"
        ? pricingScenarioCategory(selected.offer.pricingScenarioKey)
        : undefined,
    rateAvailability:
      selected?.kind === "inquiry"
        ? "inquiry_only"
        : selected
          ? "published"
          : undefined,
  };

  const scrollToLead = () => {
    const el = document.getElementById("sazby-poptavka");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <header className="border-b border-border bg-[#f7f8f7]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
            Hypotéka Jasně
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-text-dark sm:text-4xl">
            Banky v nabídce našeho hypotečního partnera
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Zobrazujeme ověřené sazby z oficiálních sazebníků sedmi bank, u
            kterých náš hypoteční partner sjednává hypotéky. Část bank uvádí
            pásmo LTV a podmínky (účet, pojištění) — shoda LTV sama o sobě
            neznamená nárok na úvěr. Oddělujeme modelový odhad splátky od
            zveřejněné sazby; konečná nabídka a RPSN vždy závisí na vaší situaci.
          </p>
        </div>
      </header>

      <MortgageCalculationSummary summary={journeySummary} />

      <PublishedRatesPanel
        initialResult={initialOffers}
        initialQuery={initialQuery}
        initialLtvContext={ltvContext}
        initialParamErrors={initialParamErrors}
        onSelectOffer={(offer) => {
          setSelected({ kind: "rate", offer });
          if (!funnelStartedRef.current) {
            funnelStartedRef.current = true;
            trackEventOnce(
              "decision_funnel_start",
              "decision_funnel_start:sazby",
              {
                purpose: offer.financingPurpose ?? undefined,
                fixation_months: offer.fixationMonths ?? undefined,
                selected_lender: offer.lenderSlug,
                selected_rate_scenario_category: pricingScenarioCategory(
                  offer.pricingScenarioKey
                ),
                calculator_type: "mortgage",
                funnel_id: "phase4_conversion",
                source_page: "/sazby",
              }
            );
          } else {
            trackEvent("cta_click", {
              cta_id: "sazby_select_offer",
              selected_lender: offer.lenderSlug,
              funnel_id: "phase4_conversion",
              source_page: "/sazby",
            });
          }
          scrollToLead();
        }}
        onSelectInquiryBank={(bank) => {
          const slug = normalizePartnerLenderSlug(bank.slug);
          if (!slug) return;
          setSelected({
            kind: "inquiry",
            lenderSlug: slug,
            lenderName: bank.name,
          });
          trackEvent("cta_click", {
            cta_id: "sazby_select_inquiry_bank",
            selected_lender: slug,
            funnel_id: "phase4_conversion",
            source_page: "/sazby",
          });
          scrollToLead();
        }}
      />

      <RpsnEducationBlock />

      <section
        id="sazby-poptavka"
        aria-labelledby="sazby-lead-heading"
        className="border-b border-border bg-white"
      >
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:px-8 lg:py-12">
          <div>
            <h2
              id="sazby-lead-heading"
              className="font-heading text-2xl font-bold text-text-dark"
            >
              {CTA_CS.discoverSituation}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Vybranou banku a případnou sazbu pošleme jako kontext poptávky.
              Nejde o závaznou žádost u banky.
            </p>
            {selected?.kind === "rate" ? (
              <p className="mt-3 rounded-lg border border-deep-teal/20 bg-deep-teal/5 px-3 py-2 text-sm text-text-dark">
                Vybráno: {selected.offer.lenderName} ·{" "}
                {selected.offer.nominalInterestRate.toLocaleString("cs-CZ", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                &nbsp;%
              </p>
            ) : null}
            {selected?.kind === "inquiry" ? (
              <p className="mt-3 rounded-lg border border-deep-teal/20 bg-deep-teal/5 px-3 py-2 text-sm text-text-dark">
                Vybráno: {selected.lenderName} ·{" "}
                {PARTNER_OFFER_PUBLIC_FLOOR[selected.lenderSlug]
                  ? `${PARTNER_OFFER_PUBLIC_FLOOR[selected.lenderSlug]!.headline} — ${PUBLIC_RATE_PERSONAL_OFFER_ON_INQUIRY_CS}`
                  : PARTNER_OFFER_INQUIRY_MESSAGE[selected.lenderSlug]}
              </p>
            ) : null}
          </div>
          <LeadCaptureForm
            source="mortgage_calculator"
            country="CZ"
            metadata={metadata}
            title="Nezávazná poptávka"
            subtitle={LEAD_FORM_FRICTION_ABOVE}
            compact
          />
        </div>
      </section>
    </>
  );
}
