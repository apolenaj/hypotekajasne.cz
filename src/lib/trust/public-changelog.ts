/**
 * Veřejný changelog Centra důvěry — jen reálné změny.
 * Žádná fake historie. Nové položky přidávej chronologicky (nejnovější nahoře).
 * Customer-facing Czech only — žádné názvy komponent ani interní jargon.
 */

import { routes } from "@/lib/routes";

export type PublicChangelogEntry = {
  /** ISO datum YYYY-MM-DD */
  date: string;
  area: string;
  summary: string;
  href?: string;
};

/**
 * Soft of truth pro „Co jsme aktualizovali“.
 * Začíná od skutečných veřejných změn (ne vymyšlená historie).
 */
export const PUBLIC_CHANGELOG: PublicChangelogEntry[] = [
  {
    date: "2026-08-12",
    area: "Sazby a důkazy",
    summary:
      "Doplnili jsme oficiální odkazy ke zveřejněným sazbám Air Bank, UniCredit a MONETA. Sazba bez dohledatelného primárního zdroje se veřejně neoznačuje jako ověřená.",
    href: routes.sazby,
  },
  {
    date: "2026-08-11",
    area: "Komerční průvodci",
    summary:
      "Upravili jsme konverzní CTA na pěti tématických stránkách (refinancování, OSVČ, zahraniční příjem, investiční a americká hypotéka) a sjednotili jsme formulářové copy s povinnými poli.",
    href: routes.temata,
  },
  {
    date: "2026-08-09",
    area: "Sazby bank",
    summary:
      "Aktualizace KB (matice 5,24 % / 5,64 % podle LTV; podmíněná sazba 5,19 % odděleně) a České spořitelny (matice 4,94 %; 5,09 % zůstává na HOLD).",
    href: routes.sazby,
  },
  {
    date: "2026-07-21",
    area: "Zdroje údajů",
    summary:
      "Doplnili jsme dohledatelné zdroje a datum kontroly k důležitým údajům v jednotlivých zemích. U zahraničních sazeb bez ověřeného odkazu uvádíme, že údaj potřebuje aktualizaci — odkazy nevymýšlíme.",
    href: routes.zdroje,
  },
  {
    date: "2026-07-21",
    area: "Zjednodušení práce s výsledky",
    summary:
      "Jednotný panel „Co mám udělat dál?“, vysvětlení „Jak jsme to spočítali“ a sjednocené tlačítko „Zjistit moje možnosti“.",
    href: routes.mojeMoznosti,
  },
  {
    date: "2026-07-21",
    area: "Homepage",
    summary:
      "Nové pozicionování: pět kroků rozhodování, čtyři hlavní situace a srozumitelné stavy údajů Data / Model / Odhad.",
    href: routes.home,
  },
  {
    date: "2026-07-21",
    area: "Značka",
    summary:
      "Veřejná značka Hypotéka Jasně (HypotekaJasne.cz) napříč navigací, SEO a wordmarkem.",
    href: routes.home,
  },
  {
    date: "2026-07-21",
    area: "Sazby",
    summary:
      "Aktuální sazby přecházejí na stav „potřebuje aktualizaci“, pokud data zestárnou; modelový výpočet se nevydává za nabídku banky.",
    href: routes.metodika,
  },
  {
    date: "2026-07-19",
    area: "Centrum důvěry",
    summary:
      "Spouštění stránek Centra důvěry; odstranění nepodložených formulací ze stránky O nás.",
    href: routes.duvera,
  },
  {
    date: "2026-07-19",
    area: "Magazín",
    summary:
      "Odborné články: autor, odborná kontrola a zdroje; odstraněn nepodložený slogan o s.r.o.",
    href: routes.clanky,
  },
  {
    date: "2026-07-19",
    area: "Metodika",
    summary: "Váhy přiřazení trhů a pravidlo sponzoringu publikovány.",
    href: routes.metodika,
  },
];

export function listPublicChangelog(): PublicChangelogEntry[] {
  return [...PUBLIC_CHANGELOG].sort((a, b) => b.date.localeCompare(a.date));
}
