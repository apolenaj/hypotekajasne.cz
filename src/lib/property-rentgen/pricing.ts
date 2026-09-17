/**
 * Centrální pricing + produktové vrstvy Investičního rentgenu.
 *
 * Tři zákaznické vrstvy:
 * 1) Zdarma — náhled
 * 2) Investiční rentgen — 999 Kč (digitální dashboard)
 * 3) Kompletní analýza — 4 990 Kč (hloubkový report)
 *
 * Checkout / SLA jen když je produkt komerčně aktivní (env).
 */

import { getRentgenPremiumConfig } from "@/lib/property-rentgen/product-config";
import { isPaidAnalysisCommerciallyAvailable } from "@/lib/legal/operator";

export type AnalysisProductTierId = "free" | "digital" | "premium";

export type AnalysisProductTier = {
  id: AnalysisProductTierId;
  name: string;
  summary: string;
  priceCzk: number | null;
  priceDisplayOverride: string | null;
  commerciallyActive: boolean;
  includes: string[];
  excludes: string[];
  isNot: string[];
  deliveryExpectation: string[];
};

export type PropertyAnalysisPricing = {
  productId: string;
  productName: string;
  amountCzk: number;
  currency: "CZK";
  ctaLabel: string;
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

/** Digitální Investiční rentgen (dashboard). */
export const CANONICAL_DIGITAL_RENTGEN_PRICE_CZK = 999;

/** Kompletní hloubková analýza / report. */
export const CANONICAL_PREMIUM_ANALYSIS_PRICE_CZK = 4990;

/** SoT pro kompletní analýzu (4 990 Kč). */
export const PROPERTY_ANALYSIS_PRICING: PropertyAnalysisPricing = {
  productId: "majetio-property-analysis-v1",
  productName: "Kompletní analýza nemovitosti",
  amountCzk: envAmount(
    "NEXT_PUBLIC_PROPERTY_ANALYSIS_PRICE_CZK",
    CANONICAL_PREMIUM_ANALYSIS_PRICE_CZK
  ),
  currency: "CZK",
  ctaLabel: "Objednat kompletní analýzu",
  ctaNextSteps: [
    "Zanecháte kontakt (jméno, e-mail, telefon) a souhlas.",
    "Ozveme se s potvrzením rozsahu a postupem dodání.",
    "Po dokončení obdržíte elektronický report — ne schválení banky.",
  ],
  includes: [
    "Hloubkový elektronický report konkrétní investice",
    "Ekonomika transakce, výnosy a cash flow",
    "Financování, vedlejší a provozní náklady, CAPEX",
    "Scénáře a stress test",
    "Lokalita, likvidita a rizikové oblasti (kde máme podklady)",
    "Checklist dokumentů k ověření",
    "Shrnutí pozitivních a rizikových faktorů — bez verdiktu kupte/nekupte",
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

export const DIGITAL_RENTGEN_PRICING = {
  productId: "hypotekajasne-rentgen-digital-v1",
  productName: "Investiční rentgen",
  amountCzk: envAmount(
    "NEXT_PUBLIC_DIGITAL_RENTGEN_PRICE_CZK",
    CANONICAL_DIGITAL_RENTGEN_PRICE_CZK
  ),
  currency: "CZK" as const,
  ctaLabel: "Spustit Rentgen",
  summary: "Kompletní modelová analýza během několika minut.",
  includes: [
    "Rozšířený dashboard: čistý výnos, cash flow, ROCE, LTV",
    "Celkové pořizovací a provozní náklady",
    "Model CAPEX a neobsazenost",
    "Stress test sazby a nájmu",
    "Cash-flow a financing scénáře",
    "Rizikové signály a použité předpoklady",
  ],
};

export const ANALYSIS_PRODUCT_TIERS: AnalysisProductTier[] = [
  {
    id: "free",
    name: "Bezplatný náhled",
    summary:
      "Rychlý snapshot konkrétní nemovitosti — základ pro rozhodnutí, zda jít do hloubky.",
    priceCzk: 0,
    priceDisplayOverride: "Zdarma",
    commerciallyActive: true,
    includes: [
      "Cena za m²",
      "Orientační hrubý výnos",
      "Orientační LTV",
      "Základní cash flow / risk signal",
    ],
    excludes: [
      "Plný dashboard Rentgenu",
      "Hloubkový elektronický report",
    ],
    isNot: [
      "Není kompletní analýza ani investiční doporučení.",
      "Není schválení banky.",
    ],
    deliveryExpectation: ["Výsledek ihned v prohlížeči."],
  },
  {
    id: "digital",
    name: DIGITAL_RENTGEN_PRICING.productName,
    summary: DIGITAL_RENTGEN_PRICING.summary,
    priceCzk: DIGITAL_RENTGEN_PRICING.amountCzk,
    priceDisplayOverride: null,
    commerciallyActive: false,
    includes: [...DIGITAL_RENTGEN_PRICING.includes],
    excludes: [
      "Hloubkový multi-page report s individuálním rozborem",
      "Lidská verifikace podkladů",
    ],
    isNot: [
      "Není investiční doporučení.",
      "Není právní ani technická due diligence.",
    ],
    deliveryExpectation: [
      "Digitální dashboard po zaplacení — bez falešného slibu okamžitého reportu, dokud není checkout aktivní.",
    ],
  },
  {
    id: "premium",
    name: PROPERTY_ANALYSIS_PRICING.productName,
    summary: "Hloubkový elektronický report konkrétní investice.",
    priceCzk: PROPERTY_ANALYSIS_PRICING.amountCzk,
    priceDisplayOverride: null,
    commerciallyActive: false,
    includes: [...PROPERTY_ANALYSIS_PRICING.includes],
    excludes: [...PROPERTY_ANALYSIS_PRICING.excludes],
    isNot: [...PROPERTY_ANALYSIS_PRICING.isNot],
    deliveryExpectation: [],
  },
];

export function getAnalysisTier(): AnalysisProductTier[] {
  const premiumCfg = getRentgenPremiumConfig();
  const live = isPaidAnalysisCommerciallyAvailable();

  return ANALYSIS_PRODUCT_TIERS.map((tier) => {
    if (tier.id === "digital") {
      return {
        ...tier,
        commerciallyActive: live,
        deliveryExpectation: live
          ? ["Digitální dashboard po dokončení platby."]
          : [
              "Připravujeme — můžete zanechat zájem. Nejde o online platbu.",
            ],
      };
    }
    if (tier.id === "premium") {
      return {
        ...tier,
        commerciallyActive: premiumCfg.commerciallyActive,
        includes: premiumCfg.deliverables.slice(0, 7),
        deliveryExpectation: premiumCfg.deliverySla.configured
          ? [
              premiumCfg.deliverySla.label!,
              premiumCfg.deliverySla.note,
              ...PROPERTY_ANALYSIS_PRICING.ctaNextSteps,
            ]
          : [
              premiumCfg.deliverySla.note,
              ...PROPERTY_ANALYSIS_PRICING.ctaNextSteps,
            ],
      };
    }
    return tier;
  });
}

export function getPremiumTier(): AnalysisProductTier {
  return getAnalysisTier().find((t) => t.id === "premium")!;
}

export function getDigitalTier(): AnalysisProductTier {
  return getAnalysisTier().find((t) => t.id === "digital")!;
}

export function getFreeTier(): AnalysisProductTier {
  return ANALYSIS_PRODUCT_TIERS.find((t) => t.id === "free")!;
}

/** @deprecated — listová cena zrušena */
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

export function formatDigitalRentgenPrice(): string {
  const fmt = DIGITAL_RENTGEN_PRICING.amountCzk.toLocaleString("cs-CZ", {
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
  if (tier.priceCzk === 0) return "Zdarma";
  return `${tier.priceCzk.toLocaleString("cs-CZ", {
    maximumFractionDigits: 0,
  })}\u00a0Kč`;
}

export function withAnalysisPrice(text: string): string {
  return text
    .replaceAll("{{PRICE}}", formatAnalysisPrice())
    .replaceAll("{{DIGITAL_PRICE}}", formatDigitalRentgenPrice())
    .replaceAll("4 990 Kč", formatAnalysisPrice())
    .replaceAll("4\u00a0990 Kč", formatAnalysisPrice())
    .replaceAll("4990 Kč", formatAnalysisPrice())
    .replaceAll("5 000 Kč", formatAnalysisPrice())
    .replaceAll("5000 Kč", formatAnalysisPrice())
    .replaceAll("999 Kč", formatDigitalRentgenPrice())
    .replaceAll("999\u00a0Kč", formatDigitalRentgenPrice());
}
