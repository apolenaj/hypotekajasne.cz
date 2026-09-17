/**
 * POST /api/webhooks/stripe
 *
 * Verifies Stripe signature, then fulfills rentgen_premium on
 * checkout.session.completed via Next.js `after()` so the webhook
 * can ACK quickly within Vercel limits while PDF+e-mail continue.
 */

import { after } from "next/server";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { RENTGEN_PREMIUM_PRODUCT_CODE } from "@/lib/property-rentgen/checkout-metadata";
import { fulfillRentgenPremiumCheckout } from "@/lib/property-rentgen/fulfill-premium-order";
import { getStripe, getStripeWebhookSecret } from "@/lib/stripe/client";

export const runtime = "nodejs";
/** Allow headroom if `after()` work shares the invocation on some plans. */
export const maxDuration = 60;

export async function GET() {
  return NextResponse.json({
    status: "ready",
    listensFor: ["checkout.session.completed"],
    products: [RENTGEN_PREMIUM_PRODUCT_CODE],
  });
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header." },
      { status: 400 }
    );
  }

  let webhookSecret: string;
  try {
    webhookSecret = getStripeWebhookSecret();
  } catch {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET není nastavený." },
      { status: 503 }
    );
  }

  const rawBody = await request.text();
  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    console.error("[webhooks/stripe] signature verification failed", message);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const product = session.metadata?.product;

    if (product === RENTGEN_PREMIUM_PRODUCT_CODE) {
      // ACK fast; heavy work continues in after() (Next.js 15+/16 on Vercel).
      after(async () => {
        try {
          const result = await fulfillRentgenPremiumCheckout(session);
          console.info("[webhooks/stripe] rentgen fulfilled", {
            eventId: event.id,
            sessionId: session.id,
            reportId: result.reportId,
            emailDelivered: result.emailDelivered,
            emailErrorCode: result.emailErrorCode,
          });
        } catch (err) {
          console.error("[webhooks/stripe] rentgen fulfill failed", {
            eventId: event.id,
            sessionId: session.id,
            message: err instanceof Error ? err.message : String(err),
          });
        }
      });
    } else {
      console.info("[webhooks/stripe] ignoring non-rentgen session", {
        eventId: event.id,
        product: product ?? null,
      });
    }
  }

  return NextResponse.json({ received: true, type: event.type });
}
