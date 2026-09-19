import Image from "next/image";
import { Check } from "lucide-react";
import { HeroCalculatorIsland } from "@/components/home/HeroCalculatorIsland";
import type { MortgageJourneyParseResult } from "@/lib/mortgage-rates/mortgage-journey-context";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1571778200037-250828fe3eee?auto=format&fit=crop&w=2200&q=75";

const TRUST = [
  "Srozumitelné výpočty",
  "Přehledné předpoklady",
  "Základní kalkulace bez registrace",
] as const;

export function HomePremiumHero({
  serverJourney,
}: {
  serverJourney: MortgageJourneyParseResult;
}) {
  return (
    <section
      aria-labelledby="home-hero-heading"
      className="relative isolate overflow-hidden"
    >
      <Image
        src={HERO_IMAGE}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[70%_40%] lg:object-[78%_center]"
      />
      <div
        className="absolute inset-0 hidden lg:block"
        aria-hidden
        style={{
          background:
            "linear-gradient(90deg, #fafaf7 0%, #fafaf7 28%, rgba(250,250,247,0.94) 42%, rgba(250,250,247,0.55) 58%, rgba(250,250,247,0.08) 74%, rgba(250,250,247,0) 100%)",
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

      <div className="relative mx-auto flex w-full max-w-[1440px] items-center px-4 py-8 sm:px-8 lg:px-12 lg:py-10 xl:px-14">
        <div className="grid w-full items-center gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)] lg:gap-10">
          <div className="min-w-0 max-w-[720px]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
              Hypotéka Jasně
            </p>
            <h1
              id="home-hero-heading"
              className="mt-3 max-w-[16ch] font-heading text-[2.15rem] font-bold leading-[1.05] tracking-[-0.02em] text-text-dark sm:text-[2.7rem] lg:text-[3.15rem] xl:text-[3.55rem]"
            >
              Jasněji v hypotéce.
              <br />
              Jistěji při koupi.
            </h1>
            <p className="mt-4 max-w-[34rem] text-base leading-[1.55] text-gray-800 sm:text-[1.15rem] lg:text-[1.25rem]">
              Spočítejte si financování, porovnejte refinancování nebo prověřte
              výnos a rizika investiční nemovitosti.
            </p>
            <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-800">
              {TRUST.map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-deep-teal" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div id="hero-calculator" className="min-w-0 scroll-mt-24 lg:justify-self-end">
            <HeroCalculatorIsland serverJourney={serverJourney} />
          </div>
        </div>
      </div>
    </section>
  );
}
