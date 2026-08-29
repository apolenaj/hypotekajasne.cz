"use client";

import { ArrowRight } from "lucide-react";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";

/** Minimální klientský ostrov — jen CTA tracking v hero. */
export function HeroCtaLinks() {
  return (
    <div className="mt-6 flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:mt-8">
      <TrackedCtaLink
        href="#hero-calculator"
        ctaId="hero_spocitat_splatku"
        className="inline-flex h-11 min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-muted-gold px-5 text-sm font-semibold text-text-dark transition-colors hover:bg-muted-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-deep-teal sm:w-auto"
      >
        Spočítat splátku
        <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
      </TrackedCtaLink>
      <TrackedCtaLink
        href="#home-rates-heading"
        ctaId="hero_porovnat_orientacni_sazby"
        className="inline-flex h-11 min-h-11 w-full items-center justify-center rounded-lg border border-white/30 bg-white/5 px-5 text-sm font-medium text-white transition-colors hover:border-white/50 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-deep-teal sm:w-auto"
      >
        Porovnat orientační sazby
      </TrackedCtaLink>
    </div>
  );
}
