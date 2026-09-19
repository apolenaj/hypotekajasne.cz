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
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=70",
    imageAlt: "Klíče od nemovitosti",
    shell: "bg-white",
    ctaClass: "bg-deep-teal text-white hover:bg-deep-teal-light",
    accent: "bg-deep-teal",
  },
  {
    title: "Už hypotéku mám",
    text: "Prověřte, zda se vám vyplatí refinancování a kolik můžete ušetřit.",
    points: ["Konec fixace", "Potenciální úspora", "Porovnání možností"],
    cta: "Prověřit refinancování →",
    href: getLandingPath("refinancovani"),
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=70",
    imageAlt: "Interiér bytu",
    shell: "bg-[#143d32] text-white",
    ctaClass: "bg-white text-[#143d32] hover:bg-white/90",
    accent: "bg-white/80",
  },
  {
    title: "Kupuji investici",
    text: "Prověřte konkrétní nemovitost, její výnos, cash flow a rizika.",
    points: ["Výnos a cash flow", "Scénáře a rizika", "Investiční rentgen"],
    cta: "Analyzovat investici →",
    href: routes.investicniRentgen,
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=70",
    imageAlt: "Městská zástavba",
    shell: "bg-white",
    ctaClass: "bg-deep-teal text-white hover:bg-deep-teal-light",
    accent: "bg-muted-gold",
  },
] as const;

export function HomePathCards() {
  return (
    <section
      id="situace"
      aria-labelledby="home-paths-heading"
      className="scroll-mt-24 border-b border-gray-200 bg-white"
    >
      <div className="mx-auto max-w-[90rem] px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <h2 id="home-paths-heading" className="sr-only">
          Tři cesty: koupě, refinancování a investice
        </h2>
        <div className="grid gap-5 lg:grid-cols-3">
          {CARDS.map((card) => (
            <article
              key={card.title}
              className={`flex min-w-0 flex-col overflow-hidden rounded-[18px] border border-gray-200 shadow-[0_10px_30px_-24px_rgba(16,40,32,0.45)] ${card.shell}`}
            >
              <div className="relative h-36">
                <Image
                  src={card.image}
                  alt={card.imageAlt}
                  fill
                  sizes="(min-width: 1024px) 30vw, 100vw"
                  className="object-cover"
                />
                <span className={`absolute bottom-0 left-0 h-1 w-16 ${card.accent}`} />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-heading text-2xl font-bold tracking-tight">
                  {card.title}
                </h3>
                <p
                  className={`mt-2 text-sm leading-relaxed ${
                    card.shell.includes("text-white") ? "text-white/80" : "text-gray-600"
                  }`}
                >
                  {card.text}
                </p>
                <ul className="mt-4 space-y-2 text-sm">
                  {card.points.map((point) => (
                    <li key={point} className="flex gap-2">
                      <span aria-hidden>✓</span>
                      {point}
                    </li>
                  ))}
                </ul>
                <Link
                  href={card.href}
                  className={`mt-6 inline-flex h-11 items-center justify-center rounded-lg px-4 text-sm font-semibold ${card.ctaClass}`}
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
