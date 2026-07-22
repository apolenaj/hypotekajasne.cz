"use client";

import { ArrowRight } from "lucide-react";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { routes } from "@/lib/routes";

/**
 * Hero — brand first, jedna hodnota, dvě CTA.
 * Bez dashboardu v prvním viewportu.
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

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="max-w-2xl">
          <p className="home-reveal font-heading text-2xl font-semibold tracking-tight text-muted-gold sm:text-3xl lg:text-[2rem]">
            Hypotéka Jasně
            <span className="ml-2 align-baseline text-[0.55em] font-semibold tracking-tight text-muted-gold/60">
              HypotekaJasne.cz
            </span>
          </p>

          <h1
            id="home-hero-heading"
            className="home-reveal home-reveal-delay-1 mt-4 font-heading text-[1.55rem] font-bold leading-[1.25] tracking-tight text-white sm:text-3xl lg:text-[2.25rem]"
          >
            Zjistěte, co si můžete dovolit. Kde koupit. Jak to financovat.
          </h1>

          <p className="home-reveal home-reveal-delay-2 mt-4 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
            Provedeme vás rozhodnutím krok za krokem: rozpočet, trh, nemovitost,
            financování a realizace. U každého čísla uvidíte, jestli jde o data,
            model nebo odhad. Nejsme banka — schválení úvěru vždy dělá banka.
          </p>

          <div className="home-reveal home-reveal-delay-3 mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <TrackedCtaLink
              href={routes.mojeMoznosti}
              ctaId="hero_moje_moznosti"
              toolId="moje_moznosti"
              className="inline-flex h-12 min-h-12 items-center justify-center gap-2 rounded-lg bg-muted-gold px-5 text-sm font-semibold text-text-dark transition-colors hover:bg-muted-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-deep-teal"
            >
              Zjistit moje možnosti
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
            </TrackedCtaLink>
            <TrackedCtaLink
              href={routes.pruvodceInvestora}
              ctaId="hero_porovnat_trhy"
              className="inline-flex h-12 min-h-12 items-center justify-center rounded-lg border border-white/25 bg-transparent px-5 text-sm font-medium text-white transition-colors hover:border-white/50 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-deep-teal"
            >
              Porovnat trhy
            </TrackedCtaLink>
          </div>
        </div>
      </div>
    </section>
  );
}
