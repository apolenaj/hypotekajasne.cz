/**
 * Hierarchie hlavní navigace — jeden zdroj pravdy pro Navbar.
 * Desktop: max. 3–4 priority + dropdowny. Žádné dlouhé whitespace-nowrap řetězce v top baru.
 */

import { getCountryGuidePath, routes } from "@/lib/routes";

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

/** Top-level položky desktop navigace (>= 1024px) */
export const desktopNav = {
  overview: {
    href: routes.dashboard,
    label: "Můj přehled",
  } satisfies NavLinkItem,

  hypoteka: {
    id: "hypoteka",
    label: "Hypotéka",
    items: [
      { href: routes.kalkulacky.root, label: "Kolik si mohu půjčit" },
      { href: routes.navrhNaMiru, label: "Hypoteční připravenost" },
      { href: routes.refinanceRadar, label: "Hlídač refinancování" },
      { href: routes.financniPas, label: "Finanční pas" },
    ],
  } satisfies NavGroup,

  investice: {
    id: "investice",
    label: "Investice",
    items: [
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
    ],
  } satisfies NavGroup,

  trhy: {
    id: "trhy",
    label: "Trhy",
    items: [
      { href: routes.pruvodceInvestora, label: "Přehled trhů" },
      { href: getCountryGuidePath("cz"), label: "Česká republika" },
      { href: getCountryGuidePath("dubai"), label: "SAE / Dubaj" },
      { href: getCountryGuidePath("spain"), label: "Španělsko" },
      { href: getCountryGuidePath("italy"), label: "Itálie" },
      { href: getCountryGuidePath("croatia"), label: "Chorvatsko" },
      { href: getCountryGuidePath("bali"), label: "Bali (Indonésie)" },
      { href: getCountryGuidePath("saudi"), label: "Saúdská Arábie" },
      { href: getCountryGuidePath("slovakia"), label: "Slovensko" },
    ],
  } satisfies NavGroup,

  akademie: {
    href: routes.akademie,
    label: "Akademie",
  } satisfies NavLinkItem,

  vice: {
    id: "vice",
    label: "Více",
    items: [
      { href: routes.metodika, label: "Metodika" },
      { href: routes.duvera, label: "Důvěra" },
      { href: routes.oNas, label: "O nás" },
      { href: routes.clanky, label: "Magazín" },
      { href: routes.marketPulse, label: "Tržní puls" },
      { href: routes.alertCenter, label: "Centrum upozornění" },
      { href: routes.documentVault, label: "Dokumentový trezor" },
      { href: routes.dealRoom, label: "Transakční místnost" },
      { href: routes.offerStrategy, label: "Strategie nabídky" },
      { href: routes.globalFinancing, label: "Globální financování" },
      { href: routes.copilot, label: "Finanční AI průvodce" },
      { href: routes.reportEngine, label: "Reporty" },
      { href: routes.kontakt, label: "Kontakt" },
      { href: routes.faq, label: "Časté otázky" },
    ],
  } satisfies NavGroup,
} as const;

/** Mobilní accordion — stejná hierarchie, Akademie jako skupina */
export const mobileNavGroups: NavGroup[] = [
  {
    id: "hypoteka",
    label: "Hypotéka",
    items: desktopNav.hypoteka.items,
  },
  {
    id: "investice",
    label: "Investice",
    items: desktopNav.investice.items,
  },
  {
    id: "trhy",
    label: "Trhy",
    items: desktopNav.trhy.items,
  },
  {
    id: "akademie",
    label: "Akademie",
    items: [
      { href: routes.akademie, label: "Vzdělávací centrum" },
      { href: `${routes.akademie}/cesty`, label: "Vzdělávací cesty" },
      { href: routes.clanky, label: "Magazín" },
      { href: routes.faq, label: "Časté otázky" },
    ],
  },
  {
    id: "vice",
    label: "Více",
    items: desktopNav.vice.items.filter(
      (i) => i.href !== routes.clanky && i.href !== routes.faq
    ),
  },
];

/** Položky „Více“ na notebooku (1024–1279), kde Akademie není top-level */
export const notebookViceItems: NavLinkItem[] = [
  { href: routes.akademie, label: "Akademie" },
  ...desktopNav.vice.items,
];

/** Jedno primary CTA webu — stejný verb jako homepage hero. */
export const navCta = {
  default: { href: routes.mojeMoznosti, label: "Zjistit moje možnosti" },
  returning: { href: routes.dashboard, label: "Pokračovat" },
} as const;

/** Položky „Více“ podle šířky viewportu (notebook vs desktop). */
export function getViceItemsForBreakpoint(width: number): NavLinkItem[] {
  if (width < 1280) return notebookViceItems;
  return [...desktopNav.vice.items];
}

/**
 * Zpětná kompatibilita se starším mock-data API.
 * @deprecated Prefer `desktopNav` / `mobileNavGroups`
 */
export const primaryNavLinks: NavLinkItem[] = [
  desktopNav.overview,
  desktopNav.hypoteka.items[0],
  desktopNav.investice.items[0],
  desktopNav.investice.items[2],
];

/**
 * @deprecated Prefer `desktopNav` / `mobileNavGroups`
 */
export const secondaryNavGroups: NavGroup[] = [
  {
    id: "nastroje",
    label: "Nástroje",
    items: [
      ...desktopNav.hypoteka.items,
      ...desktopNav.investice.items,
      { href: routes.sledovani, label: "Sledované nemovitosti" },
      { href: routes.b2bPortal, label: "Profesionální portál" },
    ],
  },
  desktopNav.trhy,
  {
    id: "akademie",
    label: "Akademie",
    items: [
      { href: routes.akademie, label: "Hypoteční akademie" },
      { href: routes.clanky, label: "Články" },
      { href: routes.faq, label: "Časté otázky" },
    ],
  },
  {
    id: "o-nas",
    label: "O nás",
    items: [
      { href: routes.oNas, label: "O nás" },
      { href: routes.oMajetio, label: "O Majetio.cz" },
      { href: routes.kontakt, label: "Kontakt" },
    ],
  },
];
