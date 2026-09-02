/**
 * Hierarchie hlavní navigace — jeden zdroj pravdy pro Navbar a patičku.
 * Produktové kategorie: Hypotéky, Nájem vs. hypotéka, Investice,
 * Zahraniční nemovitosti, Kalkulačky, Průvodci.
 */

import { getCountryGuidePath, routes } from "@/lib/routes";
import { getLandingPath } from "@/lib/seo/landings";
import { stripLocalePrefix } from "@/lib/i18n/config";

export type NavLinkItem = {
  href: string;
  label: string;
  description?: string;
  external?: boolean;
};

export type NavColumn = {
  title?: string;
  items: NavLinkItem[];
};

export type NavGroup = {
  id: string;
  label: string;
  items: NavLinkItem[];
  /** Megamenu columns (desktop). Falls back to single column from items. */
  columns?: NavColumn[];
};

/** Hypotéky — meglinks na existující routy. */
export const hypotekyNavItems: NavLinkItem[] = [
  {
    href: routes.akademie,
    label: "Jak hypotéka funguje",
    description: "Základy z Hypoteční akademie",
  },
  {
    href: routes.mojeMoznosti,
    label: "Najít vhodnou hypotéku",
    description: "Diagnostika podle vaší situace",
  },
  {
    href: routes.sazby,
    label: "Aktuální sazby bank",
    description: "Zveřejněné sazby s datem ověření",
  },
  {
    href: `${routes.sazby}?purpose=purchase`,
    label: "Koupě nemovitosti",
    description: "Sazby a výpočet pro koupi",
  },
  {
    href: getLandingPath("refinancovani"),
    label: "Refinancování",
    description: "Když končí fixace",
  },
  {
    href: getLandingPath("hypoteka-osvc"),
    label: "Hypotéka pro OSVČ",
    description: "Příjmy a doklady podnikatelů",
  },
  {
    href: getLandingPath("hypoteka-ze-zahranicniho-prijmu"),
    label: "Příjem ze zahraničí",
    description: "Zahraniční příjem u bank",
  },
  {
    href: getLandingPath("investicni-hypoteka"),
    label: "Investiční hypotéka",
    description: "Financování investiční nemovitosti",
  },
  {
    href: getLandingPath("americka-hypoteka"),
    label: "Americká hypotéka",
    description: "Neúčelový úvěr se zástavou",
  },
  {
    href: `${routes.akademie}/ltv`,
    label: "LTV, RPSN a fixace",
    description: "Klíčové pojmy vysvětlené jasně",
  },
];

export const najemNavItems: NavLinkItem[] = [
  {
    href: routes.kalkulacky.koupeVsNajem,
    label: "Kalkulačka nájem vs. hypotéka",
    description: "Porovnejte měsíční a dlouhodobé náklady",
  },
  {
    href: getLandingPath("koupe-vs-najem"),
    label: "Výhody a nevýhody vlastního bydlení",
    description: "Průvodce rozhodnutím koupě vs. nájem",
  },
  {
    href: getLandingPath("koupe-vs-najem"),
    label: "Kdy se vyplatí hypotéka",
    description: "Na co se dívat před rozhodnutím",
  },
  {
    href: routes.kalkulacky.koupeVsNajem,
    label: "Dlouhodobé náklady nájmu",
    description: "Modelové srovnání v kalkulačce",
  },
  {
    href: routes.kalkulacky.historickyVyvoj,
    label: "Modelové scénáře",
    description: "Historický vývoj majetku",
  },
  {
    href: getLandingPath("koupe-vs-najem"),
    label: "Budování vlastního majetku",
    description: "Jak hypotéka buduje vlastní kapitál",
  },
];

export const investiceNavItems: NavLinkItem[] = [
  {
    href: routes.investicniPas,
    label: "Investování do nemovitostí",
    description: "Orientační párování trhů a záměru",
  },
  {
    href: getLandingPath("investicni-hypoteka"),
    label: "Investiční hypotéka",
    description: "Odděleně od vlastního bydlení",
  },
  {
    href: routes.investicniRentgenModelar,
    label: "Výnos z pronájmu",
    description: "Model výnosu a nákladů",
  },
  {
    href: routes.investicniRentgenModelar,
    label: "Cash-flow nemovitosti",
    description: "Měsíční tok peněz v modelu",
  },
  {
    href: routes.kalkulacky.historickyVyvoj,
    label: "Hypotéka vs. nákup za hotové",
    description: "Srovnání pákového a cash scénáře",
  },
  {
    href: routes.investicniRentgen,
    label: "Investiční rentgen",
    description: "Analýza konkrétní nemovitosti",
  },
  {
    href: routes.financniPas,
    label: "Finanční pas",
    description: "Váš finanční profil na jednom místě",
  },
  {
    href: routes.dueDiligence,
    label: "Rizika a stress test",
    description: "Prověrka a rizika nemovitosti",
  },
];

export const zahraniciNavItems: NavLinkItem[] = [
  {
    href: getLandingPath("hypoteka-v-zahranici"),
    label: "Jak investovat v zahraničí",
    description: "Úvod do zahraničního financování",
  },
  {
    href: routes.globalFinancing,
    label: "Financování zahraniční nemovitosti",
    description: "Mapa možností financování",
  },
  {
    href: routes.pruvodceInvestora,
    label: "Porovnání zahraničních trhů",
    description: "Přehled podporovaných zemí",
  },
  {
    href: routes.pruvodceInvestora,
    label: "Výnosy, náklady a rizika",
    description: "Orientační data u jednotlivých trhů",
  },
  { href: getCountryGuidePath("cz"), label: "Česká republika" },
  { href: getCountryGuidePath("dubai"), label: "SAE / Dubaj" },
  { href: getCountryGuidePath("spain"), label: "Španělsko" },
  { href: getCountryGuidePath("italy"), label: "Itálie" },
  { href: getCountryGuidePath("croatia"), label: "Chorvatsko" },
  { href: getCountryGuidePath("bali"), label: "Bali (Indonésie)" },
  { href: getCountryGuidePath("saudi"), label: "Saúdská Arábie" },
  { href: getCountryGuidePath("slovakia"), label: "Slovensko" },
];

export const kalkulackyNavItems: NavLinkItem[] = [
  {
    href: routes.kalkulacky.hypotecniKalkulacka,
    label: "Hypoteční kalkulačka",
    description: "Orientační měsíční splátka",
  },
  {
    href: routes.mojeMoznosti,
    label: "Kolik si mohu půjčit",
    description: "Diagnostika podle situace",
  },
  {
    href: `${routes.kalkulacky.hypotecniKalkulacka}#vysledky`,
    label: "Výpočet měsíční splátky",
    description: "Anuita z modelu",
  },
  {
    href: `${routes.akademie}/ltv`,
    label: "LTV",
    description: "Poměr úvěru k hodnotě nemovitosti",
  },
  {
    href: routes.kalkulacky.koupeVsNajem,
    label: "Nájem vs. hypotéka",
    description: "Porovnání nákladů",
  },
  {
    href: routes.investicniRentgenModelar,
    label: "Investiční výnos",
    description: "Modelář výnosu",
  },
  {
    href: `${routes.akademie}/cash-flow`,
    label: "Cash-flow",
    description: "Lekce a model cash-flow",
  },
  {
    href: routes.sazby,
    label: "Porovnání sazeb",
    description: "Zveřejněné sazby bank",
  },
  {
    href: routes.kalkulacky.root,
    label: "Všechny kalkulačky",
    description: "Přehled Decision Lab",
  },
];

export const pruvodciNavItems: NavLinkItem[] = [
  {
    href: routes.akademie,
    label: "Hypoteční akademie",
    description: "Lekce a vzdělávací cesty",
  },
  {
    href: routes.clanky,
    label: "Články",
    description: "Magazín Hypotéka Jasně",
  },
  {
    href: `${routes.akademie}/ltv`,
    label: "Slovník hypotečních pojmů",
    description: "LTV, RPSN, fixace a další",
  },
  {
    href: routes.faq,
    label: "Časté otázky",
    description: "Odpovědi na nejčastější dotazy",
  },
  {
    href: routes.metodika,
    label: "Metodika",
    description: "Jak pracujeme s daty",
  },
  {
    href: routes.zdroje,
    label: "Zdroje dat",
    description: "Katalog datových domén",
  },
  {
    href: routes.temata,
    label: "Jak vybrat hypotéku",
    description: "Přehled hypotečních témat",
  },
  {
    href: routes.investicniPas,
    label: "Jak investovat do nemovitostí",
    description: "Investiční pas a trhy",
  },
  {
    href: `${routes.akademie}/cesty`,
    label: "Vzdělávací cesty",
    description: "Strukturované učení",
  },
];

/** Sekundární utilitární odkazy (nad hlavní navigací). */
export const utilityNavItems: NavLinkItem[] = [
  { href: routes.oNas, label: "O nás" },
  { href: routes.kontakt, label: "Kontakt" },
  { href: routes.duvera, label: "Centrum důvěry" },
];

export const oNasNavItems: NavLinkItem[] = [
  { href: routes.oNas, label: "O nás" },
  { href: routes.kontakt, label: "Kontakt" },
  { href: routes.faq, label: "Časté otázky" },
  { href: routes.duvera, label: "Centrum důvěry" },
];

/**
 * Doplňkové nástroje — zůstávají dostupné (mobil / patička / audit coverage),
 * aby žádná dřívější URL nezmizela z navigačního grafu.
 */
export const toolsExtraNavItems: NavLinkItem[] = [
  { href: routes.dashboard, label: "Můj přehled" },
  { href: routes.navrhNaMiru, label: "Hypoteční připravenost" },
  { href: routes.refinanceRadar, label: "Hlídač refinancování" },
  { href: routes.investicniRentgenPorovnani, label: "Porovnat nemovitosti" },
  { href: routes.portfolio, label: "Moje portfolio" },
  { href: routes.sledovani, label: "Sledované nemovitosti" },
  {
    href: "https://majetio.cz",
    label: "Majetio.cz",
    external: true,
  },
  { href: routes.copilot, label: "Finanční AI průvodce" },
  { href: routes.marketPulse, label: "Tržní puls" },
  { href: routes.alertCenter, label: "Centrum upozornění" },
  { href: routes.documentVault, label: "Dokumentový trezor" },
  { href: routes.dealRoom, label: "Transakční místnost" },
  { href: routes.offerStrategy, label: "Strategie nabídky" },
  { href: routes.reportEngine, label: "Reporty" },
  { href: routes.b2bPortal, label: "Profesionální portál" },
];

/** @deprecated Prefer product mega groups — kept for audit aliases. */
export const dalsiSluzbyNavItems: NavLinkItem[] = [
  ...investiceNavItems,
  ...zahraniciNavItems,
  ...toolsExtraNavItems,
];

function columnsFromItems(
  items: NavLinkItem[],
  titles: [string, string] | [string, string, string]
): NavColumn[] {
  const size = Math.ceil(items.length / titles.length);
  return titles.map((title, i) => ({
    title,
    items: items.slice(i * size, (i + 1) * size),
  }));
}

/** Top-level položky desktop navigace (>= 1280px) */
export const desktopNav = {
  hypoteky: {
    id: "hypoteky",
    label: "Hypotéky",
    items: hypotekyNavItems,
    columns: columnsFromItems(hypotekyNavItems, [
      "Orientace",
      "Scénáře",
      "Parametry",
    ]),
  } satisfies NavGroup,

  najem: {
    id: "najem",
    label: "Nájem vs. hypotéka",
    items: najemNavItems,
    columns: columnsFromItems(najemNavItems, ["Porovnání", "Rozhodnutí"]),
  } satisfies NavGroup,

  investice: {
    id: "investice",
    label: "Investice",
    items: investiceNavItems,
    columns: columnsFromItems(investiceNavItems, [
      "Investiční bydlení",
      "Nástroje",
    ]),
  } satisfies NavGroup,

  zahranici: {
    id: "zahranici",
    label: "Zahraniční nemovitosti",
    items: zahraniciNavItems,
    columns: [
      {
        title: "Jak na to",
        items: zahraniciNavItems.slice(0, 4),
      },
      {
        title: "Trhy",
        items: zahraniciNavItems.slice(4),
      },
    ],
  } satisfies NavGroup,

  kalkulacky: {
    id: "kalkulacky",
    label: "Kalkulačky",
    items: kalkulackyNavItems,
    columns: columnsFromItems(kalkulackyNavItems, ["Hypotéky", "Investice"]),
  } satisfies NavGroup,

  pruvodci: {
    id: "pruvodci",
    label: "Průvodci",
    items: pruvodciNavItems,
    columns: columnsFromItems(pruvodciNavItems, ["Vzdělání", "Důvěra a data"]),
  } satisfies NavGroup,

  /** @deprecated Compatibility aliases for older tests/components */
  kalkulacka: {
    href: routes.kalkulacky.hypotecniKalkulacka,
    label: "Kalkulačka",
  } satisfies NavLinkItem,

  sazby: {
    href: routes.sazby,
    label: "Sazby",
  } satisfies NavLinkItem,

  jakToFunguje: {
    href: "/#jak-to-funguje",
    label: "Jak to funguje",
  } satisfies NavLinkItem,

  oNas: {
    id: "o-nas",
    label: "O nás",
    items: oNasNavItems,
  } satisfies NavGroup,

  dalsiSluzby: {
    id: "dalsi-sluzby",
    label: "Další služby",
    items: toolsExtraNavItems,
  } satisfies NavGroup,
} as const;

export const primaryDesktopGroups: NavGroup[] = [
  desktopNav.hypoteky,
  desktopNav.najem,
  desktopNav.investice,
  desktopNav.zahranici,
  desktopNav.kalkulacky,
  desktopNav.pruvodci,
];

/** Mobilní accordion — produktové kategorie + utilita + nástroje. */
export const mobileNavGroups: NavGroup[] = [
  ...primaryDesktopGroups,
  {
    id: "o-nas",
    label: "O nás / Kontakt",
    items: oNasNavItems,
  },
  {
    id: "nastroje",
    label: "Další nástroje",
    items: toolsExtraNavItems,
  },
];

/** @deprecated Notebook Více — zachováno pro zpětnou kompatibilitu testů. */
export const notebookViceItems: NavLinkItem[] = [
  ...toolsExtraNavItems,
  { href: routes.metodika, label: "Metodika" },
];

/** Primary CTA — diagnostika situace (ne jen kalkulačka). */
export const navCta = {
  default: {
    href: routes.mojeMoznosti,
    label: "Najít ideální řešení",
  },
  returning: { href: routes.dashboard, label: "Pokračovat" },
} as const;

/** @deprecated Prefer `primaryDesktopGroups` */
export function getViceItemsForBreakpoint(width: number): NavLinkItem[] {
  if (width < 1280) return notebookViceItems;
  return [...toolsExtraNavItems];
}

/** @deprecated Mortgage-focused hide is no longer used — product pillars stay visible. */
export function isMortgageFocusedPath(pathname: string): boolean {
  void pathname;
  return false;
}

function normalizePath(pathname: string): string {
  return stripLocalePrefix(pathname.split("?")[0] ?? pathname).path;
}

/** Aktivní stav položky navigace (včetně query u /sazby?purpose=…). */
export function isNavItemActive(
  href: string,
  pathname: string,
  search: string = ""
): boolean {
  const [itemPath, itemQuery] = href.split("?");
  const currentPath = normalizePath(pathname);

  if (itemPath?.includes("#")) {
    const bare = itemPath.split("#")[0] || "/";
    const normalizedBare = normalizePath(bare);
    if (normalizedBare === "/") return currentPath === "/";
    return (
      currentPath === normalizedBare ||
      currentPath.startsWith(`${normalizedBare}/`)
    );
  }

  if (itemQuery) {
    const normalizedItemPath = normalizePath(itemPath);
    if (currentPath !== normalizedItemPath) return false;
    const expected = new URLSearchParams(itemQuery);
    const actual = new URLSearchParams(
      search.startsWith("?") ? search.slice(1) : search
    );
    for (const [key, value] of expected.entries()) {
      if (actual.get(key) !== value) return false;
    }
    return true;
  }

  const normalizedItemPath = normalizePath(itemPath);
  if (normalizedItemPath === "/") return currentPath === "/";
  return (
    currentPath === normalizedItemPath ||
    currentPath.startsWith(`${normalizedItemPath}/`)
  );
}

export function isNavGroupActive(
  group: NavGroup,
  pathname: string,
  search: string = ""
): boolean {
  return group.items.some((item) => isNavItemActive(item.href, pathname, search));
}

/** Sběr všech interních href z navigace (audit — žádná stránka nesmí zmizet). */
export function collectPrimaryNavigationHrefs(): string[] {
  const hrefs = new Set<string>();
  const add = (item: NavLinkItem) => {
    if (!item.external && item.href.startsWith("/")) {
      hrefs.add(item.href.split("?")[0]!.split("#")[0]!);
    }
  };

  for (const group of primaryDesktopGroups) {
    for (const item of group.items) add(item);
  }
  for (const item of utilityNavItems) add(item);
  for (const item of oNasNavItems) add(item);
  for (const item of toolsExtraNavItems) add(item);
  add(navCta.default);
  add(navCta.returning);
  add(desktopNav.kalkulacka);
  add(desktopNav.sazby);
  add({ href: routes.metodika, label: "Metodika" });
  add({ href: routes.temata, label: "Témata" });
  add({
    href: getLandingPath("hypoteka-podle-prijmu"),
    label: "Podle příjmu",
  });
  add({
    href: getLandingPath("hypoteka-do-36-let"),
    label: "Do 36 let",
  });

  return [...hrefs].sort();
}

/**
 * Mapování původních položek hlavní navigace.
 * Slouží pro audit a testy — URL zůstávají beze změny.
 */
export const LEGACY_NAV_RELOCATION: ReadonlyArray<{
  legacyLabel: string;
  legacyLocation: string;
  newLocation: string;
  href: string;
}> = [
  {
    legacyLabel: "Můj přehled",
    legacyLocation: "top-level",
    newLocation: "Další nástroje (mobil) / patička",
    href: routes.dashboard,
  },
  {
    legacyLabel: "Hypotéka",
    legacyLocation: "dropdown",
    newLocation: "Hypotéky megamenu",
    href: routes.sazby,
  },
  {
    legacyLabel: "Porovnat sazby",
    legacyLocation: "Hypotéka ▾",
    newLocation: "Hypotéky / Kalkulačky",
    href: routes.sazby,
  },
  {
    legacyLabel: "Spočítat hypotéku",
    legacyLocation: "Hypotéka ▾",
    newLocation: "Kalkulačky megamenu",
    href: routes.kalkulacky.hypotecniKalkulacka,
  },
  {
    legacyLabel: "Moje možnosti",
    legacyLocation: "Hypotéka ▾",
    newLocation: "CTA Najít ideální řešení",
    href: routes.mojeMoznosti,
  },
  {
    legacyLabel: "Hypoteční připravenost",
    legacyLocation: "Hypotéka ▾",
    newLocation: "Další nástroje",
    href: routes.navrhNaMiru,
  },
  {
    legacyLabel: "Hlídač refinancování",
    legacyLocation: "Hypotéka ▾",
    newLocation: "Další nástroje",
    href: routes.refinanceRadar,
  },
  {
    legacyLabel: "Finanční pas",
    legacyLocation: "Hypotéka ▾",
    newLocation: "Investice",
    href: routes.financniPas,
  },
  {
    legacyLabel: "Investice",
    legacyLocation: "top dropdown",
    newLocation: "Investice megamenu",
    href: routes.pruvodceInvestora,
  },
  {
    legacyLabel: "Trhy",
    legacyLocation: "top dropdown",
    newLocation: "Zahraniční nemovitosti",
    href: routes.pruvodceInvestora,
  },
  {
    legacyLabel: "Akademie",
    legacyLocation: "top-level",
    newLocation: "Průvodci",
    href: routes.akademie,
  },
  {
    legacyLabel: "Více",
    legacyLocation: "top dropdown",
    newLocation: "Průvodci / utilita",
    href: routes.metodika,
  },
  {
    legacyLabel: "Metodika",
    legacyLocation: "Více ▾",
    newLocation: "Průvodci",
    href: routes.metodika,
  },
  {
    legacyLabel: "Důvěra",
    legacyLocation: "Více ▾",
    newLocation: "Utility bar Centrum důvěry",
    href: routes.duvera,
  },
  {
    legacyLabel: "O nás",
    legacyLocation: "Více ▾",
    newLocation: "Utility bar",
    href: routes.oNas,
  },
  {
    legacyLabel: "Kontakt",
    legacyLocation: "Více ▾",
    newLocation: "Utility bar",
    href: routes.kontakt,
  },
  {
    legacyLabel: "Magazín",
    legacyLocation: "Více ▾ / mobilní Akademie",
    newLocation: "Průvodci",
    href: routes.clanky,
  },
  {
    legacyLabel: "Časté otázky",
    legacyLocation: "Více ▾ / mobilní Akademie",
    newLocation: "Průvodci / O nás",
    href: routes.faq,
  },
  {
    legacyLabel: "Finanční AI průvodce",
    legacyLocation: "Více ▾",
    newLocation: "Další nástroje",
    href: routes.copilot,
  },
  {
    legacyLabel: "Porovnat sazby (CTA)",
    legacyLocation: "header CTA",
    newLocation: "Najít ideální řešení (CTA)",
    href: routes.mojeMoznosti,
  },
  {
    legacyLabel: "Další služby",
    legacyLocation: "top dropdown",
    newLocation: "Produktové megamenu + Další nástroje",
    href: routes.investicniRentgen,
  },
];

/**
 * @deprecated Prefer `primaryDesktopGroups`
 */
export const primaryNavLinks: NavLinkItem[] = [
  { href: routes.dashboard, label: "Můj přehled" },
  desktopNav.sazby,
  { href: routes.pruvodceInvestora, label: "Trhy" },
  { href: routes.investicniRentgen, label: "Rentgen" },
];

/**
 * @deprecated Prefer `primaryDesktopGroups`
 */
export const secondaryNavGroups: NavGroup[] = [
  desktopNav.hypoteky,
  desktopNav.investice,
  desktopNav.oNas,
];
