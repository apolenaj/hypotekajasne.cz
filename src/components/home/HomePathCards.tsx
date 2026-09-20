"use client";

import Image from "next/image";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics/track-event";
import { isPaidAnalysisCommerciallyAvailable } from "@/lib/legal/operator";
import {
  formatDigitalRentgenPrice,
} from "@/lib/property-rentgen/pricing";
import { routes } from "@/lib/routes";
import { getLandingPath } from "@/lib/seo/landings";

/**
 * Photographs:
 * - Prague rooftops, Kelsey Curtis, Unsplash License, photo-1571778200037-250828fe3eee (Czechia).
 * - Interior photo-1600210492486 is Unsplash License but not verified as a Czech apartment.
 */

const CARDS = [
  {
    title: "Kupuji nemovitost",
    text: "Zjistěte orientační splátku a kolik vlastních peněz budete potřebovat.",
    points: [
      "Přehled financování",
      "Splátka podle vašich parametrů",
      "Možnost navazující konzultace",
    ],
    cta: "Spočítat financování",
    mode: "purchase" as const,
    href: null,
    image:
      "https://images.unsplash.com/photo-1571778200037-250828fe3eee?auto=format&fit=crop&w=1200&q=75",
    imageAlt: "Obytné domy v Praze",
  },
  {
    title: "Už hypotéku mám",
    text: "Končí vám fixace? Porovnejte současnou hypotéku s novou variantou.",
    points: [
      "Porovnání měsíčních splátek",
      "Zohlednění nákladů na změnu",
      "Možnost navazující konzultace",
    ],
    cta: "Porovnat refinancování",
    mode: "refinance" as const,
    href: getLandingPath("refinancovani"),
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=75",
    imageAlt: "Světlý obytný interiér",
  },
  {
    title: "Kupuji investiční nemovitost",
    text: "Prověřte výnos, cash flow a rizika dříve, než se rozhodnete koupit.",
    points: [
      "Výnos po započtení nákladů",
      "Scénáře financování a pronájmu",
      "Podrobný investiční rentgen",
    ],
    cta: "Prověřit investici",
    mode: "invest" as const,
    href: routes.investicniRentgen,
    image:
      "https://images.unsplash.com/photo-1571778200037-250828fe3eee?auto=format&fit=crop&w=1200&q=75",
    imageAlt: "Bytové domy v Praze",
  },
] as const;

function openCalculator(mode: "purchase" | "refinance" | "invest") {
  trackEvent("situation_select", { situation: mode, cta_id: "home_path_card" });
  window.dispatchEvent(new CustomEvent("hj-hero-calc", { detail: { mode } }));
  document.getElementById("hero-calculator")?.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
}

export function HomePathCards() {
  const rentgenLive = isPaidAnalysisCommerciallyAvailable();
  const rentgenPrice = formatDigitalRentgenPrice();

  return (
    <section
      id="situace-cesty"
      aria-labelledby="home-paths-heading"
      className="relative z-10 -mt-8 scroll-mt-24 bg-transparent pb-2 lg:-mt-12"
    >
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12 xl:px-14">
        <h2 id="home-paths-heading" className="sr-only">
          Tři cesty: koupě, refinancování a investice
        </h2>
        <div className="grid items-stretch gap-4 lg:grid-cols-3 lg:gap-5">
          {CARDS.map((card) => (
            <article
              key={card.title}
              className="flex h-full min-w-0 flex-col overflow-hidden rounded-[20px] border border-gray-200/80 bg-white shadow-[0_18px_50px_-28px_rgba(15,60,45,0.35)]"
            >
              <div className="relative h-44 shrink-0">
                <Image
                  src={card.image}
                  alt={card.imageAlt}
                  fill
                  sizes="(min-width: 1024px) 30vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <h3 className="font-heading text-[1.55rem] font-bold leading-tight tracking-tight text-text-dark">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{card.text}</p>
                <ul className="mt-3 space-y-1.5 text-sm text-gray-800">
                  {card.points.map((point) => (
                    <li key={point} className="flex gap-2">
                      <span className="text-deep-teal" aria-hidden>
                        ✓
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
                {card.mode === "invest" ? (
                  <p className="mt-3 text-xs leading-relaxed text-gray-500">
                    {rentgenLive
                      ? `Náhled na stránce je zdarma. Placený model stojí ${rentgenPrice}.`
                      : `Náhled na stránce je zdarma. Placený výstup (${rentgenPrice}) se nyní poptává, nejde o okamžitý nákup.`}
                  </p>
                ) : (
                  <p className="mt-3 text-xs leading-relaxed text-gray-500">
                    Základní výpočet je zdarma a bez odeslání kontaktu.
                  </p>
                )}
                {card.mode === "invest" && card.href ? (
                  <Link
                    href={card.href}
                    onClick={() =>
                      trackEvent("cta_click", {
                        cta_id: "home_path_invest",
                        price_band: "premium",
                        cta_destination: "rentgen",
                      })
                    }
                    className="mt-auto inline-flex h-11 items-center justify-center rounded-lg bg-deep-teal px-4 text-sm font-semibold text-white hover:bg-deep-teal-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal focus-visible:ring-offset-2"
                  >
                    {card.cta}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => openCalculator(card.mode)}
                    className="mt-auto inline-flex h-11 items-center justify-center rounded-lg bg-deep-teal px-4 text-sm font-semibold text-white hover:bg-deep-teal-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal focus-visible:ring-offset-2"
                  >
                    {card.cta}
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
