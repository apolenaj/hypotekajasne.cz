import Link from "next/link";
import {
  Building2,
  Globe2,
  Home,
  Scale,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { routes } from "@/lib/routes";
import { getLandingPath } from "@/lib/seo/landings";

const PILLARS: {
  icon: LucideIcon;
  title: string;
  text: string;
  href: string;
  cta: string;
}[] = [
  {
    icon: Building2,
    title: "Hypotéky",
    text: "Pochopte parametry, porovnejte zveřejněné sazby a nastavte výši úvěru, LTV a fixaci.",
    href: routes.sazby,
    cta: "Prozkoumat hypotéky",
  },
  {
    icon: Scale,
    title: "Nájem vs. vlastní bydlení",
    text: "Porovnejte náklady nájmu a hypotéky bez absolutních tvrzení — podle vašich čísel.",
    href: routes.kalkulacky.koupeVsNajem,
    cta: "Porovnat nájem a hypotéku",
  },
  {
    icon: Home,
    title: "Investice do nemovitostí",
    text: "Modelujte výnos, cash-flow a rizika — odděleně od vlastního bydlení.",
    href: routes.investicniRentgen,
    cta: "Otevřít investiční nástroje",
  },
  {
    icon: Globe2,
    title: "Zahraniční nemovitosti",
    text: "Porovnejte podporované trhy, orientační výnosy a možnosti financování.",
    href: routes.pruvodceInvestora,
    cta: "Prozkoumat zahraniční trhy",
  },
];

/** Čtyři produktové pilíře platformy. */
export function HomePillars() {
  return (
    <section
      aria-labelledby="home-pillars-heading"
      className="home-below-fold border-b border-border bg-[#f7f8f7]"
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
            Platforma
          </p>
          <h2
            id="home-pillars-heading"
            className="mt-2 font-heading text-2xl font-bold tracking-tight text-text-dark sm:text-3xl"
          >
            Čtyři oblasti, jedna platforma
          </h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Hypotéka Jasně není jen kalkulačka — pomáhá rozhodovat o bydlení i
            investicích.
          </p>
        </div>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map(({ icon: Icon, title, text, href, cta }) => (
            <li key={title}>
              <Link
                href={href}
                className="flex h-full flex-col rounded-xl border border-border bg-white p-5 transition-colors hover:border-deep-teal/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal focus-visible:ring-offset-2"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-deep-teal/10 text-deep-teal">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-4 font-heading text-lg font-semibold text-text-dark">
                  {title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {text}
                </p>
                <span className="mt-4 text-sm font-semibold text-deep-teal">
                  {cta} →
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Keep Wave 1 path references reachable from homepage IA graph */}
        <p className="sr-only">
          Související témata:{" "}
          <Link href={getLandingPath("americka-hypoteka")}>Americká hypotéka</Link>
          ,{" "}
          <Link href={getLandingPath("hypoteka-ze-zahranicniho-prijmu")}>
            Příjem ze zahraničí
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
