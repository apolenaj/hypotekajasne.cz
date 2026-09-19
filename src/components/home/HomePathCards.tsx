import Image from "next/image";
import Link from "next/link";
import { routes } from "@/lib/routes";
import { getLandingPath } from "@/lib/seo/landings";

const CARDS = [
  {
    title: "Kupuji nemovitost",
    text: "Spočítejte si hypotéku a zjistěte své možnosti financování.",
    points: ["Hypoteční kalkulačka", "Kolik si mohu půjčit?", "Orientační měsíční splátka"],
    cta: "Spočítat hypotéku →",
    href: routes.kalkulacky.hypotecniKalkulacka,
    image:
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=75",
    imageAlt: "Rodinný dům se zahradou",
  },
  {
    title: "Už hypotéku mám",
    text: "Prověřte refinancování a zjistěte, kolik můžete ušetřit.",
    points: ["Konec fixace", "Potenciální úspora", "Porovnání možností"],
    cta: "Prověřit refinancování →",
    href: getLandingPath("refinancovani"),
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=75",
    imageAlt: "Moderní interiér bytu",
  },
  {
    title: "Kupuji investici",
    text: "Prověřte výnos, cash flow a rizika konkrétní nemovitosti.",
    points: ["Výnos a cash flow", "Scénáře a rizika", "Investiční rentgen"],
    cta: "Analyzovat investici →",
    href: routes.investicniRentgen,
    image:
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=75",
    imageAlt: "Moderní bytový dům",
  },
] as const;

export function HomePathCards() {
  return (
    <section
      id="situace"
      aria-labelledby="home-paths-heading"
      className="relative z-10 -mt-8 scroll-mt-24 bg-transparent pb-2 lg:-mt-12"
    >
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12 xl:px-14">
        <h2 id="home-paths-heading" className="sr-only">
          Tři cesty: koupě, refinancování a investice
        </h2>
        <div className="grid gap-4 lg:grid-cols-3 lg:gap-5">
          {CARDS.map((card) => (
            <article
              key={card.title}
              className="flex min-w-0 flex-col overflow-hidden rounded-[20px] border border-gray-200/80 bg-white shadow-[0_18px_50px_-28px_rgba(15,60,45,0.35)]"
            >
              <div className="relative h-40 sm:h-44">
                <Image
                  src={card.image}
                  alt={card.imageAlt}
                  fill
                  sizes="(min-width: 1024px) 30vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <h3 className="font-heading text-[1.65rem] font-bold leading-tight tracking-tight text-text-dark">
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
                <Link
                  href={card.href}
                  className="mt-5 inline-flex h-11 items-center justify-center rounded-lg bg-deep-teal px-4 text-sm font-semibold text-white hover:bg-deep-teal-light"
                >
                  {card.cta}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
