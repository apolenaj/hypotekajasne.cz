/**
 * Centrální pricing + produktové vrstvy Investičního rentgenu / placené analýzy.
 *
 * Obchodní rozhodnutí: 4 990 Kč (nikoli 5 000).
 * Override ceny: NEXT_PUBLIC_PROPERTY_ANALYSIS_PRICE_CZK
 *
 * ADVANCED due diligence není aktivní SKU — jen individuální poptávka.
 */

export type AnalysisProductTierId = "free" | "premium" | "advanced_inquiry";

export type AnalysisProductTier = {
  id: AnalysisProductTierId;
  /** Veřejný název */
  name: string;
  /** Krátký popisek */
  summary: string;
  /** null = zdarma; string = individuální poptávka; number = CZK */
  priceCzk: number | null;
  priceDisplayOverride: string | null;
  /** Lze objednat / požádat self-serve v UI */
  commerciallyActive: boolean;
  includes: string[];
  excludes: string[];
  /** Co produkt NENÍ (vždy zobrazit u placené vrstvy) */
  isNot: string[];
  deliveryExpectation: string[];
};

export type PropertyAnalysisPricing = {
  /** Interní ID (ne zobrazovat ve veřejném UI) */
  productId: string;
  productName: string;
  /** Prodejní cena v Kč — jediný SoT */
  amountCzk: number;
  currency: "CZK";
  /** Primární CTA na premium */
  ctaLabel: string;
  /** Co následuje po CTA */
  ctaNextSteps: string[];
  includes: string[];
  excludes: string[];
  isNot: string[];
};

function envAmount(key: string, fallback: number): number {
  if (typeof process === "undefined") return fallback;
  const raw = process.env[key];
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : fallback;
}

/** Schválená prodejní cena Prémiové analýzy — všude jen tato hodnota. */
export const CANONICAL_PREMIUM_ANALYSIS_PRICE_CZK = 4990;

/** Obchodní rozhodnutí: 4 990 Kč všude. */
export const PROPERTY_ANALYSIS_PRICING: PropertyAnalysisPricing = {
  productId: "majetio-property-analysis-v1",
  productName: "Detailní analýza nemovitosti",
  amountCzk: envAmount(
    "NEXT_PUBLIC_PROPERTY_ANALYSIS_PRICE_CZK",
    CANONICAL_PREMIUM_ANALYSIS_PRICE_CZK
  ),
  currency: "CZK",
  ctaLabel: "Získat detailní analýzu",
  ctaNextSteps: [
    "Zanecháte kontakt (jméno, e-mail, telefon) a souhlas.",
    "Ozveme se s potvrzením rozsahu a postupem dodání.",
    "Po dokončení obdržíte elektronický report — ne schválení banky.",
  ],
  includes: [
    "Detailní model cash flow a scénáře (sazba, neobsazenost)",
    "Orientační výnos (hrubý / čistý model)",
    "Rámec financování a nákladů",
    "Rizika a lokální kontext",
    "Závěry a checklist otázek k due diligence",
    "Elektronický report / export podkladů",
  ],
  excludes: [
    "Závazné právní posouzení (bez právníka)",
    "Technická inspekce na místě (bez partnera)",
    "Schválení hypotečního úvěru bankou",
    "Garantovaný výnos",
  ],
  isNot: [
    "Není investiční doporučení ani znalecký posudek.",
    "Není právní due diligence ani technická prohlídka.",
    "Není nabídka ani schválení banky.",
  ],
};

/**
 * Tři vrstvy — Advanced jen jako individuální poptávka (není self-serve SKU).
 */
export const ANALYSIS_PRODUCT_TIERS: AnalysisProductTier[] = [
  {
    id: "free",
    name: "Bezplatný náhled",
    summary:
      "Rychlý snapshot: klíčové metriky, varovné signály a základní fit financování.",
    priceCzk: 0,
    priceDisplayOverride: "0 Kč",
    commerciallyActive: true,
    includes: [
      "Základní snapshot nemovitosti",
      "Orientační hrubý výnos a cena / m²",
      "Základní rizikové faktory (red flags)",
      "Základní vhodnost financování (odhad)",
    ],
    excludes: [
      "Detailní cash flow a citlivostní scénáře",
      "Kompletní report k exportu",
    ],
    isNot: [
      "Není kompletní analýza ani investiční doporučení.",
      "Není schválení banky.",
    ],
    deliveryExpectation: [
      "Výsledek ihned v prohlížeči po vyplnění údajů.",
    ],
  },
  {
    id: "premium",
    name: PROPERTY_ANALYSIS_PRICING.productName,
    summary:
      "Hloubková modelová analýza s reportem — za jednotnou cenu z centrálního ceníku.",
    priceCzk: PROPERTY_ANALYSIS_PRICING.amountCzk,
    priceDisplayOverride: null,
    commerciallyActive: true,
    includes: [...PROPERTY_ANALYSIS_PRICING.includes],
    excludes: [...PROPERTY_ANALYSIS_PRICING.excludes],
    isNot: [...PROPERTY_ANALYSIS_PRICING.isNot],
    deliveryExpectation: [...PROPERTY_ANALYSIS_PRICING.ctaNextSteps],
  },
  {
    id: "advanced_inquiry",
    name: "Pokročilá due diligence",
    summary:
      "Manuální služba s partnerem (právo / technika) — není samoobslužný produkt.",
    priceCzk: null,
    priceDisplayOverride: "Na individuální poptávku",
    commerciallyActive: false,
    includes: [
      "Individuální rozsah dle poptávky",
      "Koordinace s licencovaným partnerem / specialistou",
    ],
    excludes: [
      "Automatický online nákup",
      "Okamžitý digitální report bez konzultace",
    ],
    isNot: [
      "Není aktivní e-shop produkt.",
      "Není náhradou za vlastního právníka nebo stavebního znalce.",
    ],
    deliveryExpectation: [
      "Po poptávce upřesníme rozsah, cenu a termín individuálně.",
    ],
  },
];

export function getAnalysisTier(): AnalysisProductTier[] {
  return ANALYSIS_PRODUCT_TIERS;
}

export function getPremiumTier(): AnalysisProductTier {
  return ANALYSIS_PRODUCT_TIERS.find((t) => t.id === "premium")!;
}

export function getFreeTier(): AnalysisProductTier {
  return ANALYSIS_PRODUCT_TIERS.find((t) => t.id === "free")!;
}

/** @deprecated — listová cena zrušena; alias pro zpětnou kompatibilitu */
export function getListAmountCzk(
  pricing: PropertyAnalysisPricing = PROPERTY_ANALYSIS_PRICING
): number {
  return pricing.amountCzk;
}

export function formatAnalysisPrice(
  pricing: PropertyAnalysisPricing = PROPERTY_ANALYSIS_PRICING
): string {
  const fmt = pricing.amountCzk.toLocaleString("cs-CZ", {
    maximumFractionDigits: 0,
  });
  return `${fmt}\u00a0Kč`;
}

export function formatAnalysisPriceLabel(
  pricing: PropertyAnalysisPricing = PROPERTY_ANALYSIS_PRICING
): string {
  return `${pricing.productName} – ${formatAnalysisPrice(pricing)}`;
}

export function formatTierPrice(tier: AnalysisProductTier): string {
  if (tier.priceDisplayOverride) return tier.priceDisplayOverride;
  if (tier.priceCzk == null) return "Na individuální poptávku";
  if (tier.priceCzk === 0) return "0 Kč";
  return `${tier.priceCzk.toLocaleString("cs-CZ", {
    maximumFractionDigits: 0,
  })}\u00a0Kč`;
}

/** FAQ / copy: nahraď {{PRICE}} jednotným formátem. */
export function withAnalysisPrice(text: string): string {
  return text
    .replaceAll("{{PRICE}}", formatAnalysisPrice())
    .replaceAll("4 990 Kč", formatAnalysisPrice())
    .replaceAll("4\u00a0990 Kč", formatAnalysisPrice())
    .replaceAll("4990 Kč", formatAnalysisPrice())
    .replaceAll("5 000 Kč", formatAnalysisPrice())
    .replaceAll("5000 Kč", formatAnalysisPrice());
}
