"use client";

import { ArrowRight } from "lucide-react";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { routes } from "@/lib/routes";

/**
 * Závěrečné CTA — stejná primární akce jako hero.
 */
export function HomeFinalCta() {
  return (
    <section
      aria-labelledby="home-final-cta-heading"
      className="bg-deep-teal text-white"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-12 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-14">
        <div className="max-w-xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-gold">
            Další krok
          </p>
          <h2
            id="home-final-cta-heading"
            className="mt-2 font-heading text-2xl font-bold sm:text-3xl"
          >
            Zjistěte, co si můžete dovolit
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-white/75">
            Orientační výpočet za minutu. Nezávazné — nejsme banka a neschvalujeme
            úvěry.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <TrackedCtaLink
            href={routes.mojeMoznosti}
            ctaId="final_moje_moznosti"
            toolId="moje_moznosti"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-muted-gold px-5 text-sm font-semibold text-text-dark hover:bg-muted-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Zjistit moje možnosti
            <ArrowRight className="h-4 w-4" aria-hidden />
          </TrackedCtaLink>
          <TrackedCtaLink
            href={routes.navrhNaMiru}
            ctaId="final_pripravenost"
            event="specialist_cta_clicked"
            toolId="mortgage_readiness"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-white/25 px-5 text-sm font-medium text-white hover:bg-white/5"
          >
            Hypoteční připravenost
          </TrackedCtaLink>
        </div>
      </div>
    </section>
  );
}
