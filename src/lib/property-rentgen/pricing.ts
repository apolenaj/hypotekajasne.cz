/**
 * Konfigurovatelná cena Premium analýzy.
 * UI nikdy hardcoduje částku mimo tento objekt (+ env override).
 */

export type PropertyAnalysisPricing = {
  productId: string;
  productName: string;
  /** Aktuální prodejní cena v Kč */
  amountCzk: number;
  /** Horní / listová kotace (např. 5 000) — pro zobrazení „4 990/5 000 Kč“ */
  listAmountCzk: number;
  currency: "CZK";
  ctaLabel: string;
  includes: string[];
  excludes: string[];
};

function envAmount(key: string, fallback: number): number {
  if (typeof process === "undefined") return fallback;
  const raw = process.env[key];
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : fallback;
}

/**
 * Default: 4 990 / 5 000 Kč.
 * Override: NEXT_PUBLIC_PROPERTY_ANALYSIS_PRICE_CZK, NEXT_PUBLIC_PROPERTY_ANALYSIS_LIST_CZK
 */
export const PROPERTY_ANALYSIS_PRICING: PropertyAnalysisPricing = {
  productId: "majetio-property-analysis-v1",
  productName: "Kompletní Majetio Property Analysis",
  amountCzk: envAmount("NEXT_PUBLIC_PROPERTY_ANALYSIS_PRICE_CZK", 4990),
  listAmountCzk: envAmount("NEXT_PUBLIC_PROPERTY_ANALYSIS_LIST_CZK", 5000),
  currency: "CZK",
  ctaLabel: "Objednat Premium analýzu",
  includes: [
    "Rozšířené metriky nad free preview",
    "Modelové scénáře cash-flow a citlivosti",
    "Checklist due diligence (otázky — ne právní posudek)",
    "Příprava podkladů pro licencovaného partnera",
  ],
  excludes: [
    "Závazné právní posouzení",
    "Technický průzkum na místě",
    "Schválení hypotečního úvěru bankou",
  ],
};

export function formatAnalysisPrice(
  pricing: PropertyAnalysisPricing = PROPERTY_ANALYSIS_PRICING
): string {
  const fmt = (n: number) =>
    n.toLocaleString("cs-CZ", { maximumFractionDigits: 0 });
  if (pricing.amountCzk === pricing.listAmountCzk) {
    return `${fmt(pricing.amountCzk)} Kč`;
  }
  return `${fmt(pricing.amountCzk)}/${fmt(pricing.listAmountCzk)} Kč`;
}

export function formatAnalysisPriceLabel(
  pricing: PropertyAnalysisPricing = PROPERTY_ANALYSIS_PRICING
): string {
  return `${pricing.productName} – ${formatAnalysisPrice(pricing)}`;
}
