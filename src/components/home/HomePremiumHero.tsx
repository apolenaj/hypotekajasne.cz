import Image from "next/image";
import { Check } from "lucide-react";
import { HeroCalculatorIsland } from "@/components/home/HeroCalculatorIsland";
import type { MortgageJourneyParseResult } from "@/lib/mortgage-rates/mortgage-journey-context";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2200&q=75";

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
      className="relative isolate min-h-[640px] overflow-hidden lg:min-h-[700px]"
    >
      <Image
        src={HERO_IMAGE}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center lg:object-[68%_center]"
      />
      <div
        className="absolute inset-0 hidden lg:block"
        aria-hidden
        style={{
          background:
            "linear-gradient(90deg, #fafaf7 0%, rgba(250,250,247,0.94) 16%, rgba(250,250,247,0.62) 34%, rgba(250,250,247,0.22) 50%, rgba(250,250,247,0.04) 66%, rgba(250,250,247,0) 100%)",
        }}
      />
      <div
        className="absolute inset-0 lg:hidden"
        aria-hidden
        style={{
          background:
            "linear-gradient(180deg, rgba(250,250,247,0.94) 0%, rgba(250,250,247,0.86) 40%, rgba(250,250,247,0.22) 62%, rgba(250,250,247,0) 82%)",
        }}
      />

      <div className="relative mx-auto flex min-h-[640px] w-full max-w-[1440px] items-center px-4 py-8 sm:px-8 lg:min-h-[700px] lg:px-12 xl:px-14">
        <div className="grid w-full items-center gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)] lg:gap-10">
          <div className="min-w-0 max-w-[720px]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
              Hypotéka Jasně
            </p>
            <h1
              id="home-hero-heading"
              className="mt-3 font-heading text-[2.35rem] font-bold leading-[1.02] tracking-[-0.02em] text-text-dark sm:text-5xl lg:text-[4rem] 2xl:text-[4.5rem]"
            >
              Chytřejší rozhodnutí
              <br />
              o hypotéce, bydlení
              <br />
              a investicích
            </h1>
            <p className="mt-4 max-w-[590px] text-base leading-[1.55] text-gray-700 sm:text-[1.2rem]">
              Spočítejte si možnosti, porovnejte financování a udělejte lepší
              rozhodnutí na základě reálných dat.
            </p>
            <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-800">
              {TRUST.map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-deep-teal" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-4 max-w-[590px] text-[11px] leading-relaxed text-gray-500/90">
              Informační platforma — nejsme banka. Konečné podmínky stanovuje banka.
            </p>
          </div>

          <div id="hero-calculator" className="min-w-0 scroll-mt-24 lg:justify-self-end">
            <HeroCalculatorIsland serverJourney={serverJourney} />
          </div>
        </div>
      </div>
    </section>
  );
}
