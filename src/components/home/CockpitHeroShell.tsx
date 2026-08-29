import { HeroCalculatorIsland } from "@/components/home/HeroCalculatorIsland";
import { HeroCtaLinksServer } from "@/components/home/HeroCtaLinksServer";
import type { MortgageJourneyParseResult } from "@/lib/mortgage-rates/mortgage-journey-context";

const heroCopy = (
  <>
    <p className="max-w-xl text-sm leading-relaxed text-white/85 sm:text-base lg:max-w-lg">
      Za dvě minuty uvidíte orientační splátku a veřejně dostupné sazby bank.
      Pokud chcete, hypoteční specialista s vámi zdarma a nezávazně projde
      reálné možnosti.
    </p>
    <HeroCtaLinksServer />
    <p className="mt-5 max-w-xl text-xs leading-relaxed text-white/70 sm:text-[13px]">
      Bez registrace pro výpočet · Kontakt zanecháte jen pokud sami chcete ·
      Zdroj a datum ověření u každé sazby
    </p>
  </>
);

/**
 * Server hero — LCP h1 v HTML bez čekání na klientský bundle.
 * Mobil: h1 nad kalkulačkou (LCP), copy pod ní.
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
          <div className="order-1 min-w-0 lg:col-start-1 lg:row-start-1 lg:pt-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-gold">
              Hypotéka Jasně
            </p>
            <h1
              id="home-hero-heading"
              className="mt-3 max-w-xl font-sans text-[1.75rem] font-bold leading-[1.18] tracking-tight text-white sm:text-3xl lg:font-heading lg:text-[2.35rem] lg:leading-[1.15]"
            >
              Spočítejte si hypotéku a zjistěte, jaké máte možnosti.
            </h1>
          </div>

          <div
            id="hero-calculator"
            className="order-2 min-w-0 scroll-mt-24 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:scroll-mt-28"
          >
            <HeroCalculatorIsland serverJourney={serverJourney} />
          </div>

          <div className="order-3 min-w-0 lg:col-start-1 lg:row-start-2">
            <div className="space-y-6 lg:mt-0">{heroCopy}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
