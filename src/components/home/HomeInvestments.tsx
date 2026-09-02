import Link from "next/link";
import { routes } from "@/lib/routes";
import { CTA_PRIMARY_CLASS } from "@/lib/ux/cta";
import { getLandingPath } from "@/lib/seo/landings";

const INVEST_CARDS = [
  {
    title: "Výnos z pronájmu",
    text: "Modelujte hrubý a čistý výnos z pronájmu.",
    href: routes.investicniRentgenModelar,
  },
  {
    title: "Měsíční cash-flow",
    text: "Spočítejte tok peněz po splátce a nákladech.",
    href: routes.investicniRentgenModelar,
  },
  {
    title: "Investiční hypotéka",
    text: "Financování investiční nemovitosti odděleně od bydlení.",
    href: getLandingPath("investicni-hypoteka"),
  },
  {
    title: "Hypotéka vs. hotovost",
    text: "Porovnejte pákový a cash scénář nákupu.",
    href: routes.kalkulacky.historickyVyvoj,
  },
  {
    title: "Rizika a citlivost",
    text: "Úrok, neobsazenost a stress test scénáře.",
    href: routes.dueDiligence,
  },
  {
    title: "Investiční rentgen",
    text: "Analýza konkrétní nemovitosti na jednom místě.",
    href: routes.investicniRentgen,
  },
] as const;

/** Investiční vstup na homepage — karty, ne celé formuláře. */
export function HomeInvestments() {
  return (
    <section
      aria-labelledby="home-invest-heading"
      className="home-below-fold border-b border-border bg-[#f7f8f7]"
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
              Investice
            </p>
            <h2
              id="home-invest-heading"
              className="mt-2 font-heading text-2xl font-bold tracking-tight text-text-dark sm:text-3xl"
            >
              Vyhodnoťte investici do nemovitosti
            </h2>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Výnos, cash-flow, financování a rizika — bez záměny s vlastním
              bydlením.
            </p>
          </div>
          <Link href={routes.investicniRentgen} className={CTA_PRIMARY_CLASS}>
            Otevřít Investiční rentgen
          </Link>
        </div>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {INVEST_CARDS.map((card) => (
            <li key={card.title}>
              <Link
                href={card.href}
                className="flex h-full flex-col rounded-xl border border-border bg-white p-4 transition-colors hover:border-deep-teal/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal focus-visible:ring-offset-2"
              >
                <span className="font-heading text-base font-semibold text-text-dark">
                  {card.title}
                </span>
                <span className="mt-1 text-sm text-muted-foreground">
                  {card.text}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
