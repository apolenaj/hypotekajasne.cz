/**
 * Cena Prémiové analýzy nemovitosti — jedna hodnota pro celé UI.
 * Override: NEXT_PUBLIC_PROPERTY_ANALYSIS_PRICE_CZK
 */

export type PropertyAnalysisPricing = {
  /** Interní ID (ne zobrazovat ve veřejném UI) */
  productId: string;
  productName: string;
  /** Prodejní cena v Kč */
  amountCzk: number;
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

/** Obchodní rozhodnutí: 4 990 Kč všude. */
export const PROPERTY_ANALYSIS_PRICING: PropertyAnalysisPricing = {
  productId: "majetio-property-analysis-v1",
  productName: "Kompletní analýza nemovitosti",
  amountCzk: envAmount("NEXT_PUBLIC_PROPERTY_ANALYSIS_PRICE_CZK", 4990),
  currency: "CZK",
  ctaLabel: "Objednat Prémiovou analýzu",
  includes: [
    "Rozšířené metriky nad bezplatný náhled",
    "Modelové scénáře peněžního toku a citlivosti",
    "Checklist due diligence (otázky — ne právní posudek)",
    "Příprava podkladů pro licencovaného partnera",
  ],
  excludes: [
    "Závazné právní posouzení",
    "Technický průzkum na místě",
    "Schválení hypotečního úvěru bankou",
  ],
};

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
