/**
 * Curated UI strings. EN only for routes that have human copy.
 * Missing EN key → do not auto-translate; fall back to CS for UI chrome
 * only on /en shell, or omit EN page entirely.
 */

import type { Locale } from "@/lib/i18n/config";

export type MessageTree = {
  site: {
    name: string;
    tagline: string;
    description: string;
  };
  nav: {
    trust: string;
    methodology: string;
    contact: string;
  };
  enHub: {
    title: string;
    lead: string;
    note: string;
    ctaCs: string;
  };
};

export const messages: Record<Locale, MessageTree> = {
  cs: {
    site: {
      name: "HypotékaJasně.cz",
      tagline: "Co si můžete dovolit. Kde koupit. Jak financovat.",
      description:
        "Informační platforma: hypoteční data ČR, srovnání trhů, kalkulačky a handoff na licencovaného partnera — ne banka.",
    },
    nav: {
      trust: "Trust Center",
      methodology: "Metodika",
      contact: "Kontakt",
    },
    enHub: {
      title: "English overview",
      lead: "Hypotéka Jasně is a Czech information and technology platform for mortgages and property decisions.",
      note: "Full English content is published only when human-edited. We do not ship machine translations.",
      ctaCs: "Continue in Czech (full site)",
    },
  },
  en: {
    site: {
      name: "HypotekaJasne.cz",
      tagline: "What you can afford. Where to buy. How to finance.",
      description:
        "Czech information platform: mortgage data, market comparisons and calculators — not a bank. Licensed advice via partners.",
    },
    nav: {
      trust: "Trust Center",
      methodology: "Methodology",
      contact: "Contact",
    },
    enHub: {
      title: "English overview",
      lead: "Hypotéka Jasně is a Czech information and technology platform for mortgages and property decisions.",
      note: "Full English content is published only when human-edited. We do not ship machine translations.",
      ctaCs: "Continue in Czech (full site)",
    },
  },
};

export function t(locale: Locale): MessageTree {
  return messages[locale];
}

/**
 * Routes with a published human EN version (hreflang pair).
 * Expand only when real EN copy exists — never auto-MT.
 */
export const PUBLISHED_EN_PATHS = new Set<string>(["/en"]);
