import Link from "next/link";
import {
  ArrowRight,
  Calculator,
  Home,
  Percent,
  Wallet,
} from "lucide-react";
import { routes } from "@/lib/routes";

const TOOLS = [
  {
    title: "Hypoteční kalkulačka",
    text: "Orientační měsíční splátka.",
    href: routes.kalkulacky.hypotecniKalkulacka,
    icon: Calculator,
  },
  {
    title: "Rodinný rozpočet",
    text: "Zvládneme hypotéku i s rodinou?",
    href: routes.kalkulacky.rodinnyRozpocet,
    icon: Wallet,
  },
  {
    title: "Odhad vs. cena",
    text: "Vlastní peníze při nižším odhadu.",
    href: routes.kalkulacky.odhadVersusKupniCena,
    icon: Percent,
  },
  {
    title: "Financování firmy",
    text: "Anuita a LTV pro firemní úvěr.",
    href: routes.kalkulacky.hypotekaNaFirmu,
    icon: Wallet,
  },
  {
    title: "Budoucí nájem",
    text: "Uznání nájmu a tok po splátce.",
    href: routes.kalkulacky.budouciPrijemZNajmu,
    icon: Percent,
  },
  {
    title: "Výstavba",
    text: "Rozpočet, čerpání a úroky.",
    href: routes.kalkulacky.vystavba,
    icon: Home,
  },
] as const;

export function HomeToolsGrid() {
  return (
    <section
      id="jak-to-funguje"
      aria-labelledby="home-tools-heading"
      className="scroll-mt-24 border-b border-gray-200 bg-white"
    >
      <div className="mx-auto max-w-[90rem] px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2
            id="home-tools-heading"
            className="font-heading text-2xl font-bold tracking-tight text-text-dark sm:text-3xl"
          >
            Užitečné nástroje pro vaše rozhodování
          </h2>
          <Link
            href={routes.kalkulacky.root}
            className="shrink-0 text-sm font-semibold text-deep-teal hover:underline"
          >
            Zobrazit všechny kalkulačky →
          </Link>
        </div>
        <ul className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <li key={tool.title}>
                <Link
                  href={tool.href}
                  className="flex h-full items-center gap-3 rounded-[16px] border border-gray-200 bg-[#fafaf7] px-3 py-3 transition-colors hover:border-deep-teal/30"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f4f6f5] text-deep-teal">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-text-dark">{tool.title}</span>
                      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-gray-400" aria-hidden />
                    </span>
                    <span className="mt-1 block text-sm leading-snug text-gray-600">
                      {tool.text}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
