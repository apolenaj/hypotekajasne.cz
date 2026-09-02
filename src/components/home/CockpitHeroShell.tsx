import Link from "next/link";
import { CTA_CS, CTA_PRIMARY_ON_DARK_CLASS, CTA_SECONDARY_CLASS } from "@/lib/ux/cta";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { HeroCalculatorIsland } from "@/components/home/HeroCalculatorIsland";
import type { MortgageJourneyParseResult } from "@/lib/mortgage-rates/mortgage-journey-context";

const HERO_BENEFITS = [
  "Najít a nastavit hypotéku",
  "Porovnat hypotéku s nájmem",
  "Vyhodnotit investici",
  "Prozkoumat zahraniční trhy",
] as const;

/**
 * Server hero — LCP h1 v HTML bez čekání na klientský bundle.
 * Primární CTA = diagnostika situace; sekundární = kalkulačka.
 */
export function CockpitHeroShell({
  serverJourney,
}: {
  serverJourney: MortgageJourneyParseResult;
}) {
  return (
    <section
      aria-labelledby="home-hero-heading"
      className="relative isolate overflow-x-hidden overflow-y-visible bg-deep-teal text-white"
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

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <div className="grid min-w-0 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:gap-10 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,440px)] xl:gap-12">
          <div className="order-1 min-w-0 space-y-5 lg:col-start-1 lg:row-start-1 lg:pt-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-gold">
              Hypotéka Jasně
            </p>
            <h1
              id="home-hero-heading"
              className="max-w-xl font-sans text-[1.75rem] font-bold leading-[1.18] tracking-tight text-white sm:text-3xl lg:font-heading lg:text-[2.35rem] lg:leading-[1.15]"
            >
              Chytřejší rozhodnutí o hypotéce, bydlení a investicích
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-white/85 sm:text-base lg:max-w-lg">
              Porovnejte hypotéku s nájmem, najděte vhodné financování a
              vyhodnoťte investice v Česku i zahraničí. Výpočty, sazby, data a
              pomoc na jednom místě.
            </p>

            <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Link
                href={`${routes.home}#situace`}
                data-cta-id="hero_najit_idealni_reseni"
                className={cn(CTA_PRIMARY_ON_DARK_CLASS, "w-full sm:w-auto")}
              >
                {CTA_CS.findIdealSolution}
              </Link>
              <Link
                href="#hero-calculator"
                data-cta-id="hero_spocitat_hypoteku"
                className={cn(
                  CTA_SECONDARY_CLASS,
                  "w-full border-white/30 bg-white/5 text-white hover:border-white/50 hover:bg-white/10 sm:w-auto"
                )}
              >
                {CTA_CS.calculateMortgage}
              </Link>
            </div>

            <ul className="grid max-w-lg gap-2 sm:grid-cols-2">
              {HERO_BENEFITS.map((item) => (
                <li
                  key={item}
                  className="rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-xs font-medium leading-snug text-white/90 sm:text-[13px]"
                >
                  {item}
                </li>
              ))}
            </ul>

            <p className="max-w-xl text-xs leading-relaxed text-white/65 sm:text-[13px]">
              Informační a kontaktní platforma — nejsme banka. Konečné podmínky
              stanovuje banka.
            </p>
          </div>

          <div
            id="hero-calculator"
            className="order-2 min-w-0 scroll-mt-24 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:scroll-mt-28"
          >
            <HeroCalculatorIsland serverJourney={serverJourney} />
          </div>
        </div>
      </div>
    </section>
  );
}
