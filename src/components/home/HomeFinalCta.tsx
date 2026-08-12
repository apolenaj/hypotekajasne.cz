"use client";

import { LeadCaptureForm } from "@/components/forms/LeadCaptureForm";
import { LEAD_FORM_FRICTION_ABOVE } from "@/lib/leads-form-copy";
import { CTA_CS } from "@/lib/ux/cta";

type HomeFinalCtaProps = {
  journeyMetadata?: Record<string, unknown>;
};

/**
 * Closing conversion — short lead form with funnel context.
 */
export function HomeFinalCta({ journeyMetadata }: HomeFinalCtaProps) {
  return (
    <section
      aria-labelledby="home-final-cta-heading"
      className="bg-deep-teal text-white"
      id="poptavka"
    >
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:px-8 lg:py-14">
        <div className="max-w-xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-gold">
            Další krok
          </p>
          <h2
            id="home-final-cta-heading"
            className="mt-2 font-heading text-2xl font-bold sm:text-3xl"
          >
            {CTA_CS.discoverSituation}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-white/75">
            Necháte kontakt. Ozveme se co nejdříve k nezávazné konzultaci.
            Nejde o schválení úvěru ani o garantovanou sazbu — Hypotéka Jasně
            není banka.
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
            title="Nezávazná poptávka"
            subtitle={LEAD_FORM_FRICTION_ABOVE}
            compact
            className="border-0 bg-transparent p-0 shadow-none"
          />
        </div>
      </div>
    </section>
  );
}
