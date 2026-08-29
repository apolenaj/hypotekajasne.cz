/**
 * Hierarchie hlavní navigace — jeden zdroj pravdy pro Navbar.
 * Hypoteční cesta v popředí; investice a AI nástroje pod „Další služby“.
 */

import { getCountryGuidePath, routes } from "@/lib/routes";
import { getLandingPath } from "@/lib/seo/landings";
import { stripLocalePrefix } from "@/lib/i18n/config";

export type NavLinkItem = {
  href: string;
  label: string;
  external?: boolean;
};

export type NavGroup = {
  id: string;
  label: string;
  items: NavLinkItem[];
};

/** Scénáře hypotéky — dropdown „Hypotéky“. */
export const hypotekyNavItems: NavLinkItem[] = [
  {
    href: `${routes.sazby}?purpose=purchase`,
    label: "Koupě nemovitosti",
  },
  { href: getLandingPath("refinancovani"), label: "Refinancování" },
  { href: getLandingPath("hypoteka-osvc"), label: "Hypotéka pro OSVČ" },
  {
    href: getLandingPath("hypoteka-ze-zahranicniho-prijmu"),
    label: "Příjmy ze zahraničí",
  },
  {
    href: getLandingPath("investicni-hypoteka"),
    label: "Investiční hypotéka",
  },
  {
    href: getLandingPath("americka-hypoteka"),
    label: "Americká hypotéka",
  },
  {
    href: getLandingPath("hypoteka-podle-prijmu"),
    label: "Hypotéka podle příjmu",
  },
  {
    href: getLandingPath("hypoteka-do-36-let"),
    label: "Hypotéka do 36 let",
  },
  { href: getLandingPath("koupe-vs-najem"), label: "Koupě vs. nájem" },
  {
    href: getLandingPath("hypoteka-v-zahranici"),
    label: "Hypotéka v zahraničí",
  },
  { href: routes.temata, label: "Všechna témata hypoték" },
];

/** Investice, trhy, nástroje a ostatní produkty — sekundární navigace. */
export const dalsiSluzbyNavItems: NavLinkItem[] = [
  { href: routes.dashboard, label: "Můj přehled" },
  { href: routes.mojeMoznosti, label: "Moje možnosti" },
  { href: routes.navrhNaMiru, label: "Hypoteční připravenost" },
  { href: routes.refinanceRadar, label: "Hlídač refinancování" },
  { href: routes.financniPas, label: "Finanční pas" },
  { href: routes.pruvodceInvestora, label: "Vybrat vhodnou zemi" },
  { href: routes.investicniPas, label: "Investiční pas" },
  { href: routes.investicniRentgen, label: "Analyzovat nemovitost" },
  {
    href: routes.investicniRentgenPorovnani,
    label: "Porovnat nemovitosti",
  },
  { href: routes.portfolio, label: "Moje portfolio" },
  { href: routes.sledovani, label: "Sledované nemovitosti" },
  { href: routes.dueDiligence, label: "Prověrka nemovitosti" },
  {
    href: "https://majetio.cz",
    label: "Majetio.cz",
    external: true,
  },
  { href: routes.pruvodceInvestora, label: "Přehled trhů" },
  { href: getCountryGuidePath("cz"), label: "Česká republika" },
  { href: getCountryGuidePath("dubai"), label: "SAE / Dubaj" },
  { href: getCountryGuidePath("spain"), label: "Španělsko" },
  { href: getCountryGuidePath("italy"), label: "Itálie" },
  { href: getCountryGuidePath("croatia"), label: "Chorvatsko" },
  { href: getCountryGuidePath("bali"), label: "Bali (Indonésie)" },
  { href: getCountryGuidePath("saudi"), label: "Saúdská Arábie" },
  { href: getCountryGuidePath("slovakia"), label: "Slovensko" },
  { href: routes.akademie, label: "Akademie" },
  { href: `${routes.akademie}/cesty`, label: "Vzdělávací cesty" },
  { href: routes.clanky, label: "Magazín" },
  { href: routes.copilot, label: "Finanční AI průvodce" },
  { href: routes.marketPulse, label: "Tržní puls" },
  { href: routes.alertCenter, label: "Centrum upozornění" },
  { href: routes.documentVault, label: "Dokumentový trezor" },
  { href: routes.dealRoom, label: "Transakční místnost" },
  { href: routes.offerStrategy, label: "Strategie nabídky" },
  { href: routes.globalFinancing, label: "Globální financování" },
  { href: routes.reportEngine, label: "Reporty" },
  { href: routes.b2bPortal, label: "Profesionální portál" },
  { href: routes.duvera, label: "Důvěra" },
];

export const oNasNavItems: NavLinkItem[] = [
  { href: routes.oNas, label: "O nás" },
  { href: routes.kontakt, label: "Kontakt" },
  { href: routes.faq, label: "Časté otázky" },
];

/** Top-level položky desktop navigace (>= 1280px) */
export const desktopNav = {
  kalkulacka: {
    href: routes.kalkulacky.hypotecniKalkulacka,
    label: "Kalkulačka",
  } satisfies NavLinkItem,

  sazby: {
    href: routes.sazby,
    label: "Sazby",
  } satisfies NavLinkItem,

  hypoteky: {
    id: "hypoteky",
    label: "Hypotéky",
    items: hypotekyNavItems,
  } satisfies NavGroup,

  jakToFunguje: {
    href: routes.metodika,
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
    items: dalsiSluzbyNavItems,
  } satisfies NavGroup,
} as const;

/** Mobilní menu — stejná logická hierarchie jako desktop. */
export const mobileNavGroups: NavGroup[] = [
  {
    id: "hypoteky",
    label: desktopNav.hypoteky.label,
    items: desktopNav.hypoteky.items,
  },
  {
    id: "o-nas",
    label: "O nás / Kontakt",
    items: desktopNav.oNas.items,
  },
  {
    id: "dalsi-sluzby",
    label: desktopNav.dalsiSluzby.label,
    items: desktopNav.dalsiSluzby.items,
  },
];

/** @deprecated Notebook Více — zachováno pro zpětnou kompatibilitu testů. */
export const notebookViceItems: NavLinkItem[] = [
  ...dalsiSluzbyNavItems,
  { href: routes.metodika, label: "Metodika" },
];

/** Jedno primary CTA webu — hypoteční kalkulačka. */
export const navCta = {
  default: {
    href: routes.kalkulacky.hypotecniKalkulacka,
    label: "Spočítat hypotéku",
  },
  returning: { href: routes.dashboard, label: "Pokračovat" },
} as const;

/** @deprecated Prefer `desktopNav.dalsiSluzby.items` */
export function getViceItemsForBreakpoint(width: number): NavLinkItem[] {
  if (width < 1280) return notebookViceItems;
  return [...desktopNav.dalsiSluzby.items];
}

const MORTGAGE_FOCUSED_PREFIXES = [
  routes.sazby,
  routes.kalkulacky.root,
  routes.temata,
  routes.mojeMoznosti,
  routes.navrhNaMiru,
  routes.refinanceRadar,
  routes.financniPas,
  routes.dekujeme,
] as const;

/** Na hypotečních stránkách skrýváme „Další služby“ v top baru (zůstávají v mobilu a patičce). */
export function isMortgageFocusedPath(pathname: string): boolean {
  const { path } = stripLocalePrefix(pathname.split("?")[0] ?? pathname);
  return MORTGAGE_FOCUSED_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`)
  );
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

  if (itemQuery) {
    const normalizedItemPath = normalizePath(itemPath);
    if (currentPath !== normalizedItemPath) return false;
    const expected = new URLSearchParams(itemQuery);
    const actual = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
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

/** Sběr všech interních href z navigace (audit — žádná stránka nesmí zmizet). */
export function collectPrimaryNavigationHrefs(): string[] {
  const hrefs = new Set<string>();
  const add = (item: NavLinkItem) => {
    if (!item.external && item.href.startsWith("/")) {
      hrefs.add(item.href.split("?")[0]!);
    }
  };

  add(desktopNav.kalkulacka);
  add(desktopNav.sazby);
  add(desktopNav.jakToFunguje);
  for (const item of hypotekyNavItems) add(item);
  for (const item of oNasNavItems) add(item);
  for (const item of dalsiSluzbyNavItems) add(item);
  add(navCta.default);
  add(navCta.returning);

  return [...hrefs].sort();
}

/**
 * Mapování původních položek hlavní navigace (před zjednodušením).
 * Slouží pro audit a testy — URL zůstávají beze změny.
 */
export const LEGACY_NAV_RELOCATION: ReadonlyArray<{
  legacyLabel: string;
  legacyLocation: string;
  newLocation: string;
  href: string;
}> = [
  { legacyLabel: "Můj přehled", legacyLocation: "top-level", newLocation: "Další služby", href: routes.dashboard },
  { legacyLabel: "Hypotéka", legacyLocation: "dropdown", newLocation: "Hypotéky + top (Kalkulačka, Sazby)", href: routes.sazby },
  { legacyLabel: "Porovnat sazby", legacyLocation: "Hypotéka ▾", newLocation: "Sazby (top-level)", href: routes.sazby },
  { legacyLabel: "Spočítat hypotéku", legacyLocation: "Hypotéka ▾", newLocation: "Kalkulačka (top-level) + CTA", href: routes.kalkulacky.hypotecniKalkulacka },
  { legacyLabel: "Moje možnosti", legacyLocation: "Hypotéka ▾", newLocation: "Další služby", href: routes.mojeMoznosti },
  { legacyLabel: "Hypoteční připravenost", legacyLocation: "Hypotéka ▾", newLocation: "Další služby", href: routes.navrhNaMiru },
  { legacyLabel: "Hlídač refinancování", legacyLocation: "Hypotéka ▾", newLocation: "Další služby", href: routes.refinanceRadar },
  { legacyLabel: "Finanční pas", legacyLocation: "Hypotéka ▾", newLocation: "Další služby", href: routes.financniPas },
  { legacyLabel: "Investice", legacyLocation: "top dropdown", newLocation: "Další služby", href: routes.pruvodceInvestora },
  { legacyLabel: "Trhy", legacyLocation: "top dropdown", newLocation: "Další služby", href: routes.pruvodceInvestora },
  { legacyLabel: "Akademie", legacyLocation: "top-level", newLocation: "Další služby", href: routes.akademie },
  { legacyLabel: "Více", legacyLocation: "top dropdown", newLocation: "O nás / Další služby / Jak to funguje", href: routes.metodika },
  { legacyLabel: "Metodika", legacyLocation: "Více ▾", newLocation: "Jak to funguje (top-level)", href: routes.metodika },
  { legacyLabel: "Důvěra", legacyLocation: "Více ▾", newLocation: "Další služby", href: routes.duvera },
  { legacyLabel: "O nás", legacyLocation: "Více ▾", newLocation: "O nás ▾", href: routes.oNas },
  { legacyLabel: "Kontakt", legacyLocation: "Více ▾", newLocation: "O nás ▾", href: routes.kontakt },
  { legacyLabel: "Magazín", legacyLocation: "Více ▾ / mobilní Akademie", newLocation: "Další služby", href: routes.clanky },
  { legacyLabel: "Časté otázky", legacyLocation: "Více ▾ / mobilní Akademie", newLocation: "O nás ▾", href: routes.faq },
  { legacyLabel: "Finanční AI průvodce", legacyLocation: "Více ▾", newLocation: "Další služby", href: routes.copilot },
  { legacyLabel: "Porovnat sazby (CTA)", legacyLocation: "header CTA", newLocation: "Spočítat hypotéku (CTA)", href: routes.kalkulacky.hypotecniKalkulacka },
];

/**
 * @deprecated Prefer `desktopNav` / `mobileNavGroups`
 */
export const primaryNavLinks: NavLinkItem[] = [
  { href: routes.dashboard, label: "Můj přehled" },
  desktopNav.sazby,
  dalsiSluzbyNavItems[5]!,
  dalsiSluzbyNavItems[7]!,
];

/**
 * @deprecated Prefer `desktopNav` / `mobileNavGroups`
 */
export const secondaryNavGroups: NavGroup[] = [
  desktopNav.hypoteky,
  {
    id: "dalsi-sluzby",
    label: "Další služby",
    items: dalsiSluzbyNavItems,
  },
  desktopNav.oNas,
];
