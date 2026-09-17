/**
 * Stripe SDK singleton (server-only).
 */

import Stripe from "stripe";

let stripeSingleton: Stripe | null = null;

export function getStripeSecretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error("Chybí STRIPE_SECRET_KEY.");
  }
  return key;
}

export function getStripeWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) {
    throw new Error("Chybí STRIPE_WEBHOOK_SECRET.");
  }
  return secret;
}

/** Uses account/SDK default API version pinned by the installed `stripe` package. */
export function getStripe(): Stripe {
  if (stripeSingleton) return stripeSingleton;
  stripeSingleton = new Stripe(getStripeSecretKey(), {
    typescript: true,
  });
  return stripeSingleton;
}
