/**
 * Jednotné CTA názvosloví — progressive disclosure UX.
 * Stejná akce = stejný verb napříč produktem.
 */

import { routes } from "@/lib/routes";

/** Primární verb set — používej konzistentně. */
export const CTA_CS = {
  discoverOptions: "Zjistit moje možnosti",
  calculate: "Spočítat",
  continue: "Pokračovat",
  saveResult: "Uložit výsledek",
  updateResult: "Aktualizovat výsledek",
  editInputs: "Upravit vstupy",
  send: "Odeslat",
  compareMarkets: "Porovnat trhy",
  openPassport: "Otevřít Finanční pas",
  openDashboard: "Otevřít přehled",
  readiness: "Hypoteční připravenost",
  consult: "Nezávazná konzultace",
  analyzeProperty: "Analyzovat nemovitost",
  howCalculated: "Jak jsme to spočítali",
  showAdvanced: "Zobrazit podrobnosti",
  hideAdvanced: "Skrýt podrobnosti",
  whatNext: "Co mám udělat dál?",
  nextStep: "Další krok",
} as const;

export type CtaLabelKey = keyof typeof CTA_CS;

/** Site-wide primary CTA (nav + home). */
export const PRIMARY_PRODUCT_CTA = {
  label: CTA_CS.discoverOptions,
  href: routes.mojeMoznosti,
} as const;

/** Touch-friendly interactive classes (min 44px). */
export const TOUCH_TARGET =
  "min-h-11 min-w-11 inline-flex items-center justify-center";

export const CTA_PRIMARY_CLASS =
  "inline-flex h-11 min-h-11 items-center justify-center gap-2 rounded-lg bg-deep-teal px-5 text-sm font-semibold text-white transition-colors hover:bg-deep-teal-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal focus-visible:ring-offset-2";

export const CTA_PRIMARY_ON_DARK_CLASS =
  "inline-flex h-11 min-h-11 items-center justify-center gap-2 rounded-lg bg-muted-gold px-5 text-sm font-semibold text-text-dark transition-colors hover:bg-muted-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-deep-teal";

export const CTA_SECONDARY_CLASS =
  "inline-flex h-11 min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-white px-5 text-sm font-semibold text-text-dark transition-colors hover:border-deep-teal/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal focus-visible:ring-offset-2";

export const CTA_TERTIARY_CLASS =
  "inline-flex h-11 min-h-11 items-center justify-center gap-2 rounded-lg border border-transparent px-4 text-sm font-medium text-muted-foreground transition-colors hover:text-text-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal focus-visible:ring-offset-2";
