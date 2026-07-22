/**
 * Veřejný changelog Centra důvěry — jen reálné změny.
 * Žádná fake historie. Nové položky přidávej chronologicky (nejnovější nahoře).
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
    date: "2026-07-21",
    area: "Zdrojování claimů",
    summary:
      "Claim-level evidence pro všechny podporované země; SourceEvidenceDrawer (tvrzení, hodnota, jurisdikce, URL, datum, platnost, status, poznámka). Zahraniční sazby bez deep-linku = NEEDS UPDATE / UNVERIFIED — URL nevymýšlíme.",
    href: routes.zdroje,
  },
  {
    date: "2026-07-21",
    area: "UX / progressive disclosure",
    summary:
      "Jednotný panel „Co mám udělat dál?“, disclosure „Jak jsme to spočítali“ a sjednocené CTA „Zjistit moje možnosti“.",
    href: routes.mojeMoznosti,
  },
  {
    date: "2026-07-21",
    area: "Homepage",
    summary:
      "Nové pozicionování: 5-step journey, čtyní intenty, trust statusy Data/Model/Odhad.",
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
    area: "Sazby / pipeline",
    summary:
      "Rate engine LIVE → STALE (NEEDS UPDATE) → MODEL; model se nevydává za nabídku banky.",
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
      "YMYL články: autor, reviewer, sources; odstraněn claim „s.r.o. je záchrana“.",
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
