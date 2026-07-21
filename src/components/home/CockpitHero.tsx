"use client";

import { ArrowRight } from "lucide-react";
import { DecisionSnapshot } from "@/components/home/DecisionSnapshot";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { routes } from "@/lib/routes";

/**
 * Prémiový hero — value proposition + CTA hierarchie.
 * Primární CTA: Zjistit moje možnosti → /moje-moznosti
 */
export function CockpitHero() {
  return (
    <section
      aria-labelledby="home-hero-heading"
      className="relative isolate overflow-hidden bg-deep-teal text-white"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        aria-hidden
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 60% at 15% 20%, rgba(197,160,89,0.35), transparent 55%),
            radial-gradient(ellipse 70% 50% at 90% 80%, rgba(42,107,88,0.6), transparent 50%),
            linear-gradient(165deg, #143d32 0%, #1b4d3e 45%, #0f2f28 100%)
          `,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay"
        aria-hidden
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative z-10 mx-auto grid max-w-7xl gap-8 overflow-hidden px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-12 lg:items-center lg:gap-10 lg:px-8 lg:py-14 lg:max-h-[720px]">
        <div className="min-w-0 lg:col-span-6 xl:col-span-7">
          <p className="home-reveal font-heading text-2xl font-semibold tracking-tight text-muted-gold sm:text-3xl lg:text-[2rem]">
            HypotékaJasně
          </p>

          <h1
            id="home-hero-heading"
            className="home-reveal home-reveal-delay-1 mt-3 max-w-xl font-heading text-[1.45rem] font-bold leading-[1.25] tracking-tight text-white/95 sm:text-3xl lg:text-[2.15rem]"
          >
            Zjistěte, co si můžete dovolit.
            <span className="mt-1 block text-white/90">
              Kde koupit. Jak to financovat.
            </span>
          </h1>

          <p className="home-reveal home-reveal-delay-2 mt-4 max-w-lg text-sm leading-relaxed text-white/75 sm:text-base">
            Orientační rozpočet, srovnání trhů a analýza nemovitosti — s jasným
            datovým statusem. Nejsme banka; další krok si volíte vy.
          </p>

          <div className="home-reveal home-reveal-delay-3 mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <TrackedCtaLink
              href={routes.mojeMoznosti}
              ctaId="hero_moje_moznosti"
              toolId="moje_moznosti"
              className="inline-flex h-11 min-h-11 items-center justify-center gap-2 rounded-lg bg-muted-gold px-5 text-sm font-semibold text-text-dark transition-colors hover:bg-muted-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-deep-teal"
            >
              Zjistit moje možnosti
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
            </TrackedCtaLink>
            <TrackedCtaLink
              href={routes.pruvodceInvestora}
              ctaId="hero_porovnat_trhy"
              className="inline-flex h-11 min-h-11 items-center justify-center rounded-lg border border-white/25 bg-transparent px-5 text-sm font-medium text-white transition-colors hover:border-white/50 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-deep-teal"
            >
              Porovnat trhy
            </TrackedCtaLink>
          </div>
        </div>

        <div className="min-w-0 lg:col-span-6 xl:col-span-5">
          <DecisionSnapshot />
        </div>
      </div>
    </section>
  );
}
