import Link from "next/link";
import {
  PRACTICE_GUIDES,
  practiceAnswerPath,
  practiceHubPath,
} from "@/lib/academy/practice";

const TEASERS = [
  {
    q: "Co řešit první: banku, nebo nemovitost?",
    href: practiceAnswerPath("prvni-hypoteka", "banka-nebo-nemovitost"),
  },
  {
    q: "Kolik potřebuji vlastních prostředků?",
    href: practiceAnswerPath("vlastni-penize-odhad", "kolik-vlastnich"),
  },
  {
    q: "Jak se liší refixace a refinancování?",
    href: practiceAnswerPath(
      "mimoradne-splatky-refinancovani",
      "refixace-vs-refinancovani"
    ),
  },
  {
    q: "Co jsou BRKI, NRKI a SOLUS?",
    href: practiceAnswerPath("registry-zamitnuti", "brki-nrki-solus"),
  },
] as const;

export function HomePracticeTeaser() {
  return (
    <section
      className="border-b border-border bg-white"
      aria-labelledby="home-practice-heading"
    >
      <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-8 lg:px-12 lg:py-12 xl:px-14">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
              Hypotéky v praxi
            </p>
            <h2
              id="home-practice-heading"
              className="mt-2 font-heading text-2xl font-bold tracking-tight text-text-dark sm:text-3xl"
            >
              Konkrétní situace, jasné odpovědi
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {PRACTICE_GUIDES.length} průvodců k první hypotéce, příjmům,
              odhadu, refinancování i rodinným změnám — bez nutnosti registrace.
            </p>
          </div>
          <Link
            href={practiceHubPath()}
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-lg bg-deep-teal px-5 text-sm font-semibold text-white hover:bg-deep-teal-light"
          >
            Otevřít celou sekci
          </Link>
        </div>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {TEASERS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block h-full rounded-xl border border-border bg-[#f7f8f7] px-4 py-3 text-sm font-medium text-text-dark transition hover:border-deep-teal/40 hover:bg-white"
              >
                {item.q}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
