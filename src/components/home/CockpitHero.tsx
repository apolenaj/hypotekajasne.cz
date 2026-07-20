"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { routes } from "@/lib/routes";

export function CockpitHero() {
  return (
    <section
      aria-labelledby="home-hero-heading"
      className="relative isolate min-h-[min(92svh,820px)] overflow-hidden bg-deep-teal text-white"
    >
      {/* Full-bleed atmosphere — subtle mesh, not glassmorphism */}
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

      <div className="relative z-10 mx-auto flex min-h-[min(92svh,820px)] max-w-7xl flex-col justify-end px-4 pb-14 pt-28 sm:px-6 sm:pb-16 sm:pt-32 lg:justify-center lg:px-8 lg:pb-20 lg:pt-24">
        <p className="home-reveal mb-4 font-heading text-3xl font-semibold tracking-tight text-muted-gold sm:text-4xl lg:text-5xl xl:text-[3.5rem]">
          HypotékaJasně
        </p>

        <h1
          id="home-hero-heading"
          className="home-reveal home-reveal-delay-1 max-w-4xl font-heading text-[1.65rem] font-bold leading-[1.2] tracking-tight text-white/95 sm:text-3xl lg:text-4xl xl:text-[2.75rem]"
        >
          Zjistěte, co si můžete dovolit.
          <span className="mt-1 block text-white/90">
            Kde koupit. Jak to financovat.
          </span>
        </h1>

        <p className="home-reveal home-reveal-delay-2 mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
          Decision cockpit pro bydlení i investice — živá data z českých bank,
          srovnání trhů a jasný další krok. Bez marketingových superlativů.
        </p>

        <div className="home-reveal home-reveal-delay-3 mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="#kolik-si-mohu-dovolit"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-muted-gold px-6 text-sm font-semibold text-text-dark transition-colors hover:bg-muted-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-deep-teal"
          >
            Spočítat, co si mohu dovolit
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            href={routes.pruvodceInvestora}
            className="inline-flex h-12 items-center justify-center rounded-lg border border-white/25 bg-transparent px-6 text-sm font-medium text-white transition-colors hover:border-white/50 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-deep-teal"
          >
            Prozkoumat destinace
          </Link>
        </div>
      </div>
    </section>
  );
}
