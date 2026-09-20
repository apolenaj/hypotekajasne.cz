/**
 * Centrální pricing Investičního rentgenu — jediná konfigurace cen a rozsahu.
 * Režim poptávky vs. skutečný prodej řídí isPaidAnalysisCommerciallyAvailable().
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

export const CANONICAL_DIGITAL_RENTGEN_PRICE_CZK = 999;
export const CANONICAL_PREMIUM_ANALYSIS_PRICE_CZK = 4990;

export const PROPERTY_ANALYSIS_PRICING: PropertyAnalysisPricing = {
  productId: "majetio-property-analysis-v1",
  productName: "Individuální rozbor",
  amountCzk: envAmount(
    "NEXT_PUBLIC_PROPERTY_ANALYSIS_PRICE_CZK",
    CANONICAL_PREMIUM_ANALYSIS_PRICE_CZK
  ),
  currency: "CZK",
  ctaLabel: "Poptat rozbor",
  ctaNextSteps: [
    "Zanecháte kontakt a souhlas.",
    "Upřesníme rozsah podle podkladů.",
    "Elektronický výstup — ne schválení banky ani investiční doporučení.",
  ],
  includes: [
    "Vše z modelu za 999 Kč",
    "Dohledání a porovnání dostupných místních nabídek (s odkazy a datem; přiznáme nedostatek dat)",
    "Rozbor dodaných dokumentů a nejasností — jen ve skutečně zajištěném rozsahu",
    "Individuální komentovaný závěr a priority před koupí s doloženými podklady",
    "Tabulka podkladů: původ, datum, stav ověření, dopad",
  ],
  excludes: [
    "Závazné právní posouzení bez právníka",
    "Technická prohlídka bez partnera",
    "Schválení úvěru bankou",
    "Garantovaný výnos nebo jistá budoucnost nemovitosti",
  ],
  isNot: [
    "Není investiční doporučení ani znalecký posudek.",
    "Není ověření katastru / technického stavu bez podkladů.",
    "Není nabídka banky.",
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
  ctaLabel: "Poptat Rentgen",
  summary:
    "Rozpočet koupě, cash flow, tři scénáře, citlivost a bod zvratu — ze zadaných údajů.",
  includes: [
    "Cena za m² a hrubý výnos",
    "Rozpočet koupě a vlastní hotovosti",
    "Cash flow včetně provozu, úvěru a rezerv",
    "Tři scénáře, citlivost a bod zvratu",
    "Interaktivní výstup a souhrnné PDF",
  ],
};

export const ANALYSIS_PRODUCT_TIERS: AnalysisProductTier[] = [
  {
    id: "free",
    name: "Náhled zdarma",
    summary: "Cena za m² a hrubý výnos z vašich čísel — ihned v prohlížeči.",
    priceCzk: 0,
    priceDisplayOverride: "Zdarma",
    commerciallyActive: true,
    includes: ["Cena za m²", "Hrubý výnos"],
    excludes: [
      "Rozpočet vlastní hotovosti",
      "Plný cash flow a scénáře",
      "PDF rozbor",
    ],
    isNot: ["Není investiční doporučení.", "Není schválení banky."],
    deliveryExpectation: ["Ihned po vyplnění vstupů."],
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
      "Dohledání místních nabídek",
      "Rozbor dokumentů",
      "Individuální lidský závěr",
    ],
    isNot: [
      "Není investiční doporučení.",
      "Neslibujeme lidskou kontrolu.",
    ],
    deliveryExpectation: [
      "Po úhradě a kompletních vstupech — až bude platební plnění aktivní.",
    ],
  },
  {
    id: "premium",
    name: PROPERTY_ANALYSIS_PRICING.productName,
    summary:
      "Individuální rozbor s doloženými podklady. Termín dodání potvrdíme po kontrole rozsahu a podkladů.",
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
        name: DIGITAL_RENTGEN_PRICING.productName,
        deliveryExpectation: live
          ? ["Po úhradě a kompletních vstupech."]
          : ["Online nákup zatím není spuštěný — můžete zanechat poptávku."],
      };
    }
    if (tier.id === "premium") {
      const slaReady = premiumCfg.deliverySla.configured && live;
      return {
        ...tier,
        commerciallyActive: premiumCfg.commerciallyActive,
        includes: premiumCfg.deliverables.slice(0, 7),
        deliveryExpectation: slaReady
          ? [
              premiumCfg.deliverySla.label!,
              ...PROPERTY_ANALYSIS_PRICING.ctaNextSteps,
            ]
          : [
              live
                ? premiumCfg.deliverySla.note
                : "Poptávka — termín a rozsah potvrdíme po kontrole podkladů.",
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

export function getListAmountCzk(
  pricing: PropertyAnalysisPricing = PROPERTY_ANALYSIS_PRICING
): number {
  return pricing.amountCzk;
}

export function formatAnalysisPrice(
  pricing: PropertyAnalysisPricing = PROPERTY_ANALYSIS_PRICING
): string {
  return `${pricing.amountCzk.toLocaleString("cs-CZ", {
    maximumFractionDigits: 0,
  })}\u00a0Kč`;
}

export function formatDigitalRentgenPrice(): string {
  return `${DIGITAL_RENTGEN_PRICING.amountCzk.toLocaleString("cs-CZ", {
    maximumFractionDigits: 0,
  })}\u00a0Kč`;
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

/** CTA copy — never look “sold” when checkout is not live. */
export function rentgenPrimaryCtaLabel(tier: AnalysisProductTierId): string {
  const live = isPaidAnalysisCommerciallyAvailable();
  if (tier === "free") return "Spočítat náhled zdarma";
  if (!live) {
    return tier === "digital" ? "Poptat Rentgen" : "Poptat rozbor";
  }
  return tier === "digital"
    ? `Získat celý Rentgen – ${formatDigitalRentgenPrice()}`
    : `Objednat individuální rozbor – ${formatAnalysisPrice()}`;
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
