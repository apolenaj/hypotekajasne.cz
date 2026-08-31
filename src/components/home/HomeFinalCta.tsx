"use client";

import { LeadCaptureForm } from "@/components/forms/LeadCaptureForm";
import { LEAD_FORM_FRICTION_ABOVE } from "@/lib/leads-form-copy";

type HomeFinalCtaProps = {
  journeyMetadata?: Record<string, unknown>;
};

/**
 * Závěrečné CTA — krátký lead formulář s jasným názvem bez falešné urgency.
 */
export function HomeFinalCta({ journeyMetadata }: HomeFinalCtaProps) {
  return (
    <section
      aria-labelledby="home-final-cta-heading"
      className="bg-deep-teal text-white"
      id="poptavka"
    >
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:px-8 lg:py-16">
        <div className="max-w-xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-gold">
            Další krok
          </p>
          <h2
            id="home-final-cta-heading"
            className="mt-2 font-heading text-2xl font-bold leading-tight sm:text-3xl"
          >
            Máte orientační čísla — chcete projít možnosti s člověkem?
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/80 sm:text-base">
            Tým Hypotéka Jasně s vámi zdarma a nezávazně projde reálné
            možnosti podle vaší situace. Nejde o schválení úvěru ani garantovanou
            sazbu — Hypotéka Jasně není banka.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-4 text-text-dark shadow-lg sm:p-6">
          <LeadCaptureForm
            source="mortgage_calculator"
            country="CZ"
            metadata={{
              sourcePage: "/",
              ...journeyMetadata,
            }}
            title="Chci zdarma prověřit své možnosti"
            subtitle={LEAD_FORM_FRICTION_ABOVE}
            submitLabel="Chci nezávazné porovnání"
            compact
            className="border-0 bg-transparent p-0 shadow-none"
          />
        </div>
      </div>
    </section>
  );
}
