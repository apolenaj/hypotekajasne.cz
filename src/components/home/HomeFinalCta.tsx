"use client";

import Link from "next/link";
import { LeadCaptureForm } from "@/components/forms/LeadCaptureForm";
import { LEAD_FORM_FRICTION_ABOVE } from "@/lib/leads-form-copy";
import { CTA_CS } from "@/lib/ux/cta";
import { routes } from "@/lib/routes";

type HomeFinalCtaProps = {
  journeyMetadata?: Record<string, unknown>;
};

/**
 * Závěrečné CTA — diagnostika situace + volitelný lead formulář.
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
            {CTA_CS.findSituationSolution}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/80 sm:text-base">
            Vyberte svou situaci, spočítejte možnosti a pokud chcete, tým
            Hypotéka Jasně s vámi zdarma a nezávazně projde další krok. Nejde o
            schválení úvěru ani garantovanou sazbu — nejsme banka.
          </p>
          <Link
            href={routes.mojeMoznosti}
            className="mt-6 inline-flex h-11 min-h-11 items-center justify-center rounded-lg bg-muted-gold px-5 text-sm font-semibold text-text-dark transition-colors hover:bg-muted-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-deep-teal"
          >
            {CTA_CS.findIdealSolution}
          </Link>
          <p className="mt-4 text-xs leading-relaxed text-white/60">
            Provozovatel, zdroje dat, metodika a ochrana osobních údajů jsou v{" "}
            <Link
              href={routes.duvera}
              className="underline underline-offset-2 hover:text-white"
            >
              Centru důvěry
            </Link>
            .
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
            title="Chci nezávazně projít své možnosti"
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
