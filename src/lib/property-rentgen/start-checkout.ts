/**
 * Browser helper — starts Stripe Checkout for Investiční rentgen products.
 */

import type { RentgenCheckoutPropertySnapshot } from "@/lib/property-rentgen/checkout-metadata";
import type { RentgenOrderInputSnapshot } from "@/lib/property-rentgen/order-property";
import type { ProductCode } from "@/lib/property-rentgen/products";

export type StartRentgenCheckoutArgs = {
  productCode: ProductCode | "digital" | "premium" | "999" | "4990";
  property: RentgenCheckoutPropertySnapshot | RentgenOrderInputSnapshot;
  email: string;
  name?: string;
  phone?: string;
  billingType?: "person" | "company";
  billingCompanyName?: string;
  billingIco?: string;
  billingDic?: string;
  billingAddress?: string;
  orderId?: string;
  resumePublicId?: string;
  resumeAccess?: string;
  sourceUrl?: string;
  utm?: Record<string, string | undefined>;
};

export type StartRentgenCheckoutResult = {
  url: string;
  orderId: string;
  publicId: string;
  accessToken: string;
  amountCzk: number;
  productCode: string;
};

export async function startRentgenCheckout(
  args: StartRentgenCheckoutArgs
): Promise<StartRentgenCheckoutResult> {
  const res = await fetch("/api/checkout/rentgen", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(args),
  });
  const json = (await res.json()) as {
    error?: string;
    url?: string;
    orderId?: string;
    publicId?: string;
    accessToken?: string;
    amountCzk?: number;
    productCode?: string;
  };
  if (!res.ok || !json.url) {
    throw new Error(json.error || "Checkout se nepodařilo spustit.");
  }
  return {
    url: json.url,
    orderId: json.orderId || "",
    publicId: json.publicId || "",
    accessToken: json.accessToken || "",
    amountCzk: json.amountCzk || 0,
    productCode: json.productCode || "",
  };
}

/** @deprecated Prefer startRentgenCheckout with productCode */
export async function startRentgenPremiumCheckout(args: {
  property: RentgenCheckoutPropertySnapshot;
  customerEmail?: string;
}): Promise<{ url: string }> {
  const result = await startRentgenCheckout({
    productCode: "INDIVIDUAL_ANALYSIS",
    property: args.property,
    email: args.customerEmail || "",
  });
  return { url: result.url };
}
