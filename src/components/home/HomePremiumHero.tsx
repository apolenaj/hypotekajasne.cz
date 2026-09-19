import Image from "next/image";
import { HeroCalculatorIsland } from "@/components/home/HeroCalculatorIsland";
import type { MortgageJourneyParseResult } from "@/lib/mortgage-rates/mortgage-journey-context";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=75";

const TRUST = [
  "Nezávislé informace",
  "Reálná data a výpočty",
  "Online a nezávazně",
] as const;

export function HomePremiumHero({
  serverJourney,
}: {
  serverJourney: MortgageJourneyParseResult;
}) {
  return (
    <section
      aria-labelledby="home-hero-heading"
      className="border-b border-gray-200 bg-[#f7f6f3]"
    >
      <div className="mx-auto grid max-w-[90rem] items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14 lg:px-8 lg:py-16">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-deep-teal">
            Hypotéka Jasně
          </p>
          <h1
            id="home-hero-heading"
            className="mt-3 max-w-xl font-heading text-[2rem] font-bold leading-[1.12] tracking-tight text-text-dark sm:text-5xl"
          >
            Chytřejší rozhodnutí
            <br />
            o hypotéce, bydlení
            <br />
            a investicích
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-gray-600">
            Spočítejte si možnosti, porovnejte financování a udělejte lepší
            rozhodnutí na základě reálných dat.
          </p>
          <ul className="mt-6 flex flex-col gap-2 text-sm text-gray-800 sm:flex-row sm:flex-wrap sm:gap-x-5">
            {TRUST.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="text-deep-teal" aria-hidden>
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-6 max-w-lg text-xs leading-relaxed text-gray-500">
            Informační platforma — nejsme banka. Konečné podmínky stanovuje banka.
          </p>
        </div>

        <div className="relative min-w-0">
          <div className="absolute -inset-x-2 -top-6 bottom-10 hidden overflow-hidden rounded-[18px] lg:block">
            <Image
              src={HERO_IMAGE}
              alt="Moderní bydlení"
              fill
              priority
              sizes="(min-width: 1024px) 46vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#f7f6f3] via-[#f7f6f3]/20 to-transparent" />
          </div>
          <div id="hero-calculator" className="relative z-10 scroll-mt-24 lg:mt-8">
            <HeroCalculatorIsland serverJourney={serverJourney} />
          </div>
        </div>
      </div>
    </section>
  );
}
