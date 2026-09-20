/**
 * POST /api/webhooks/stripe
 *
 * Verifies Stripe signature. Idempotent via stripe_webhook_events.
 * Fulfills Investiční rentgen orders after paid Checkout sessions.
 */

import { after } from "next/server";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { RENTGEN_PREMIUM_PRODUCT_CODE } from "@/lib/property-rentgen/checkout-metadata";
import { fulfillRentgenOrderFromSession } from "@/lib/property-rentgen/fulfill-order";
import {
  claimStripeEvent,
  getOrderByCheckoutSessionId,
  updateOrder,
} from "@/lib/property-rentgen/orders";
import {
  normalizeProductCode,
  PRODUCT_CODE,
} from "@/lib/property-rentgen/products";
import { getStripe, getStripeWebhookSecret } from "@/lib/stripe/client";

export const runtime = "nodejs";
export const maxDuration = 60;

const HANDLED_PRODUCTS = new Set([
  PRODUCT_CODE.INVESTMENT_XRAY,
  PRODUCT_CODE.INDIVIDUAL_ANALYSIS,
  RENTGEN_PREMIUM_PRODUCT_CODE,
]);

function isRentgenSession(session: Stripe.Checkout.Session): boolean {
  const code =
    normalizeProductCode(session.metadata?.productCode) ||
    normalizeProductCode(session.metadata?.product) ||
    (session.metadata?.product === RENTGEN_PREMIUM_PRODUCT_CODE
      ? PRODUCT_CODE.INDIVIDUAL_ANALYSIS
      : null);
  if (code) return true;
  if (session.metadata?.orderId) return true;
  if (session.client_reference_id) return true;
  return HANDLED_PRODUCTS.has(session.metadata?.product as never);
}

async function handlePaidSession(
  event: Stripe.Event,
  session: Stripe.Checkout.Session
) {
  if (!isRentgenSession(session)) {
    console.info("[webhooks/stripe] ignoring non-rentgen session", {
      eventId: event.id,
      product: session.metadata?.product ?? null,
    });
    return;
  }

  let claimed = true;
  try {
    claimed = await claimStripeEvent(event.id, event.type, session.metadata?.orderId);
  } catch (err) {
    // Table may not exist yet — continue but log.
    console.warn("[webhooks/stripe] claimStripeEvent failed", {
      message: err instanceof Error ? err.message : String(err),
    });
  }
  if (!claimed) {
    console.info("[webhooks/stripe] duplicate event skipped", {
      eventId: event.id,
    });
    return;
  }

  after(async () => {
    try {
      const result = await fulfillRentgenOrderFromSession(session, {
        eventId: event.id,
      });
      console.info("[webhooks/stripe] rentgen fulfilled", {
        eventId: event.id,
        sessionId: session.id,
        orderId: result.orderId,
        publicId: result.publicId,
        status: result.status,
        skipped: result.skipped,
        emailDelivered: result.emailDelivered,
      });
    } catch (err) {
      console.error("[webhooks/stripe] rentgen fulfill failed", {
        eventId: event.id,
        sessionId: session.id,
        message: err instanceof Error ? err.message : String(err),
      });
      try {
        const order = await getOrderByCheckoutSessionId(session.id);
        if (order && order.status !== "READY" && order.status !== "AWAITING_DOCUMENTS") {
          await updateOrder(order.id, {
            status: "FAILED",
            fulfillment_error:
              err instanceof Error ? err.message.slice(0, 500) : "fulfill_failed",
          });
        }
      } catch {
        /* ignore secondary failure */
      }
    }
  });
}

export async function GET() {
  return NextResponse.json({
    status: "ready",
    listensFor: [
      "checkout.session.completed",
      "checkout.session.async_payment_succeeded",
      "checkout.session.async_payment_failed",
      "checkout.session.expired",
      "charge.refunded",
    ],
    products: [
      PRODUCT_CODE.INVESTMENT_XRAY,
      PRODUCT_CODE.INDIVIDUAL_ANALYSIS,
      RENTGEN_PREMIUM_PRODUCT_CODE,
    ],
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

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const session = event.data.object as Stripe.Checkout.Session;
    await handlePaidSession(event, session);
  } else if (event.type === "checkout.session.async_payment_failed") {
    const session = event.data.object as Stripe.Checkout.Session;
    try {
      const claimed = await claimStripeEvent(event.id, event.type);
      if (claimed) {
        const order = await getOrderByCheckoutSessionId(session.id);
        if (order && order.status !== "PAID" && order.status !== "READY") {
          await updateOrder(order.id, { status: "FAILED" });
        }
      }
    } catch (err) {
      console.error("[webhooks/stripe] async_payment_failed", err);
    }
  } else if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    try {
      const claimed = await claimStripeEvent(event.id, event.type);
      if (claimed) {
        const order = await getOrderByCheckoutSessionId(session.id);
        if (
          order &&
          (order.status === "DRAFT" || order.status === "CHECKOUT_CREATED")
        ) {
          await updateOrder(order.id, { status: "EXPIRED" });
        }
      }
    } catch (err) {
      console.error("[webhooks/stripe] expired", err);
    }
  } else if (event.type === "charge.refunded") {
    try {
      const claimed = await claimStripeEvent(event.id, event.type);
      if (claimed) {
        const charge = event.data.object as Stripe.Charge;
        const pi =
          typeof charge.payment_intent === "string"
            ? charge.payment_intent
            : charge.payment_intent?.id;
        if (pi) {
          // Best-effort: find by payment intent via session lookup is heavier;
          // metadata on charge may not include order — log for ops.
          console.info("[webhooks/stripe] charge.refunded", {
            eventId: event.id,
            paymentIntent: pi,
          });
        }
      }
    } catch (err) {
      console.error("[webhooks/stripe] refund", err);
    }
  }

  return NextResponse.json({ received: true, type: event.type });
}
