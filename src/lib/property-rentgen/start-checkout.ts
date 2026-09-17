/**
 * Browser helper — starts Stripe Checkout for Komplexní Investiční Audit.
 */

import type { RentgenCheckoutPropertySnapshot } from "@/lib/property-rentgen/checkout-metadata";

export type StartRentgenPremiumCheckoutArgs = {
  property: RentgenCheckoutPropertySnapshot;
  customerEmail?: string;
  successUrl?: string;
  cancelUrl?: string;
};

export async function startRentgenPremiumCheckout(
  args: StartRentgenPremiumCheckoutArgs
): Promise<{ url: string }> {
  const res = await fetch("/api/checkout/rentgen-premium", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(args),
  });
  const json = (await res.json()) as {
    error?: string;
    url?: string;
  };
  if (!res.ok || !json.url) {
    throw new Error(json.error || "Checkout se nepodařilo spustit.");
  }
  return { url: json.url };
}
