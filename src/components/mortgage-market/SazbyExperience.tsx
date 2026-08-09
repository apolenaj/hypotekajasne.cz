"use client";

import { useRef, useState } from "react";
import { LeadCaptureForm } from "@/components/forms/LeadCaptureForm";
import { PublishedRatesPanel } from "@/components/mortgage-market/PublishedRatesPanel";
import { RpsnEducationBlock } from "@/components/mortgage-market/RpsnEducationBlock";
import { pricingScenarioCategory } from "@/lib/analytics/bands";
import { trackEvent, trackEventOnce } from "@/lib/analytics/track-event";
import type {
  GetMortgageOffersResult,
  MortgageOffer,
} from "@/lib/mortgage-market/offers";
import { CTA_CS } from "@/lib/ux/cta";

type SazbyExperienceProps = {
  initialOffers: GetMortgageOffersResult | null;
  initialQuery: {
    purpose: "purchase" | "refinance";
    fixationMonths: number;
    ltv: number;
  };
  journeyMetadata?: Record<string, unknown>;
};

export function SazbyExperience({
  initialOffers,
  initialQuery,
  journeyMetadata,
}: SazbyExperienceProps) {
  const [selected, setSelected] = useState<MortgageOffer | null>(null);
  const funnelStartedRef = useRef(false);

  const metadata = {
    ...journeyMetadata,
    selectedLender: selected?.lenderSlug,
    selectedProduct: selected?.productSlug,
    selectedPricingScenario: selected?.pricingScenarioKey,
    selectedNominalRate: selected?.nominalInterestRate,
    selectedRateScenarioCategory: selected
      ? pricingScenarioCategory(selected.pricingScenarioKey)
      : undefined,
  };

  return (
    <>
      <header className="border-b border-border bg-[#f7f8f7]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
            Hypotéka Jasně
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-text-dark sm:text-4xl">
            Porovnejte zveřejněné sazby bank
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Oddělujeme modelový odhad splátky od ověřených sazeb z oficiálních
            zdrojů. Konečná nabídka banky vždy závisí na vaší situaci.
          </p>
        </div>
      </header>

      <PublishedRatesPanel
        initialResult={initialOffers}
        initialQuery={initialQuery}
        onSelectOffer={(offer) => {
          setSelected(offer);
          if (!funnelStartedRef.current) {
            funnelStartedRef.current = true;
            trackEventOnce(
              "decision_funnel_start",
              "decision_funnel_start:sazby",
              {
                purpose: offer.financingPurpose ?? undefined,
                fixation_months: offer.fixationMonths,
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
          const el = document.getElementById("sazby-poptavka");
          el?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
      />

      <RpsnEducationBlock />

      <section
        id="sazby-poptavka"
        aria-labelledby="sazby-lead-heading"
        className="border-b border-border bg-white"
      >
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-12">
          <div>
            <h2
              id="sazby-lead-heading"
              className="font-heading text-2xl font-bold text-text-dark"
            >
              {CTA_CS.discoverSituation}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Vybranou sazbu a parametry pošleme jako kontext poptávky. Nejde o
              závaznou žádost u banky.
            </p>
            {selected ? (
              <p className="mt-3 rounded-lg border border-deep-teal/20 bg-deep-teal/5 px-3 py-2 text-sm text-text-dark">
                Vybráno: {selected.lenderName} ·{" "}
                {selected.nominalInterestRate.toLocaleString("cs-CZ", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                &nbsp;%
              </p>
            ) : null}
          </div>
          <LeadCaptureForm
            source="mortgage_calculator"
            country="CZ"
            metadata={metadata}
            title="Nezávazná poptávka"
            subtitle="Jméno a kontakt stačí — čísla z výpočtu už máme v kontextu."
            compact
          />
        </div>
      </section>
    </>
  );
}
