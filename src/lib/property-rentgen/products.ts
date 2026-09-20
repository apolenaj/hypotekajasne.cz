/**
 * Server-authoritative product catalog for Investiční rentgen checkout.
 * Frontend may send productCode only — never amount.
 */

import {
  CANONICAL_DIGITAL_RENTGEN_PRICE_CZK,
  CANONICAL_PREMIUM_ANALYSIS_PRICE_CZK,
  DIGITAL_RENTGEN_PRICING,
  PROPERTY_ANALYSIS_PRICING,
} from "@/lib/property-rentgen/pricing";

export const PRODUCT_CODE = {
  INVESTMENT_XRAY: "INVESTMENT_XRAY",
  INDIVIDUAL_ANALYSIS: "INDIVIDUAL_ANALYSIS",
  /** Legacy Stripe metadata product from earlier premium checkout */
  RENTGEN_PREMIUM_LEGACY: "rentgen_premium",
} as const;

export type ProductCode =
  | typeof PRODUCT_CODE.INVESTMENT_XRAY
  | typeof PRODUCT_CODE.INDIVIDUAL_ANALYSIS;

export type RentgenProductDefinition = {
  code: ProductCode;
  /** Values accepted in API / Stripe metadata */
  aliases: string[];
  name: string;
  description: string;
  amountCzk: number;
  currency: "CZK";
  fulfillment: "digital_auto" | "individual_manual";
  priceEnvKey: "STRIPE_PRICE_INVESTMENT_XRAY" | "STRIPE_PRICE_INDIVIDUAL_ANALYSIS";
};

export const RENTGEN_PRODUCTS: Record<ProductCode, RentgenProductDefinition> = {
  INVESTMENT_XRAY: {
    code: PRODUCT_CODE.INVESTMENT_XRAY,
    aliases: [PRODUCT_CODE.INVESTMENT_XRAY, "digital", "999"],
    name: DIGITAL_RENTGEN_PRICING.productName,
    description: DIGITAL_RENTGEN_PRICING.summary,
    amountCzk: CANONICAL_DIGITAL_RENTGEN_PRICE_CZK,
    currency: "CZK",
    fulfillment: "digital_auto",
    priceEnvKey: "STRIPE_PRICE_INVESTMENT_XRAY",
  },
  INDIVIDUAL_ANALYSIS: {
    code: PRODUCT_CODE.INDIVIDUAL_ANALYSIS,
    aliases: [
      PRODUCT_CODE.INDIVIDUAL_ANALYSIS,
      PRODUCT_CODE.RENTGEN_PREMIUM_LEGACY,
      "premium",
      "4990",
    ],
    name: PROPERTY_ANALYSIS_PRICING.productName,
    description:
      "Individuální rozbor s modelem, dohledáním nabídek a komentářem k podkladům.",
    amountCzk: CANONICAL_PREMIUM_ANALYSIS_PRICE_CZK,
    currency: "CZK",
    fulfillment: "individual_manual",
    priceEnvKey: "STRIPE_PRICE_INDIVIDUAL_ANALYSIS",
  },
};

export function normalizeProductCode(
  raw: string | null | undefined
): ProductCode | null {
  if (!raw) return null;
  const key = raw.trim();
  for (const product of Object.values(RENTGEN_PRODUCTS)) {
    if (product.aliases.includes(key)) return product.code;
  }
  return null;
}

export function getProductOrThrow(raw: string): RentgenProductDefinition {
  const code = normalizeProductCode(raw);
  if (!code) {
    throw new Error(`Neplatný productCode: ${raw}`);
  }
  return RENTGEN_PRODUCTS[code];
}

export function getConfiguredStripePriceId(
  product: RentgenProductDefinition
): string | null {
  const value = process.env[product.priceEnvKey]?.trim();
  return value && value.startsWith("price_") ? value : null;
}

export type StripeLineItemConfig =
  | { kind: "price"; priceId: string; amountCzk: number }
  | {
      kind: "price_data";
      amountCzk: number;
      unitAmountHalere: number;
      name: string;
      description: string;
    };

/** Server-only line item — amount never taken from the client. */
export function buildServerStripeLineItem(
  product: RentgenProductDefinition
): StripeLineItemConfig {
  const priceId = getConfiguredStripePriceId(product);
  if (priceId) {
    return { kind: "price", priceId, amountCzk: product.amountCzk };
  }
  return {
    kind: "price_data",
    amountCzk: product.amountCzk,
    unitAmountHalere: Math.round(product.amountCzk * 100),
    name: product.name,
    description: product.description,
  };
}

export function expectedAmountHalere(product: RentgenProductDefinition): number {
  return Math.round(product.amountCzk * 100);
}

export function publicIdFromParts(seq?: string): string {
  const suffix =
    seq?.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toUpperCase() ||
    Math.random().toString(36).slice(2, 8).toUpperCase();
  return `HJ-${suffix}`;
}
