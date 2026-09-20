/**
 * GET /api/checkout/rentgen/order
 * Public order status — requires publicId + accessToken (or Stripe session_id lookup).
 * Never marks order paid; only reads durable status after webhook.
 */

import { NextResponse } from "next/server";
import {
  getOrderByAccess,
  getOrderByCheckoutSessionId,
  toPublicOrderView,
} from "@/lib/property-rentgen/orders";
import { getStripe } from "@/lib/stripe/client";
import { checkoutBaseUrl } from "@/lib/property-rentgen/checkout-parse";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id")?.trim();
  const publicId = url.searchParams.get("order")?.trim();
  const access = url.searchParams.get("access")?.trim();

  try {
    if (publicId && access) {
      const order = await getOrderByAccess(publicId, access);
      if (!order) {
        return NextResponse.json({ error: "Objednávka nenalezena." }, { status: 404 });
      }
      return NextResponse.json({
        order: toPublicOrderView(order),
        downloadPath:
          order.storage_path &&
          (order.status === "READY" || order.status === "AWAITING_DOCUMENTS")
            ? `/api/checkout/rentgen/download?order=${encodeURIComponent(order.public_id)}&access=${encodeURIComponent(order.access_token)}`
            : null,
        siteOrigin: checkoutBaseUrl(),
      });
    }

    if (sessionId) {
      const order = await getOrderByCheckoutSessionId(sessionId);
      if (order) {
        return NextResponse.json({
          order: toPublicOrderView(order),
          accessToken: order.access_token,
          downloadPath:
            order.storage_path &&
            (order.status === "READY" || order.status === "AWAITING_DOCUMENTS")
              ? `/api/checkout/rentgen/download?order=${encodeURIComponent(order.public_id)}&access=${encodeURIComponent(order.access_token)}`
              : null,
          siteOrigin: checkoutBaseUrl(),
        });
      }

      // Session exists at Stripe but webhook may not have run yet.
      try {
        const stripe = getStripe();
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        return NextResponse.json({
          order: null,
          stripePaymentStatus: session.payment_status,
          pending: true,
          message:
            session.payment_status === "paid"
              ? "Platbu potvrzujeme — výstup se připravuje."
              : "Platbu ještě potvrzujeme.",
        });
      } catch {
        return NextResponse.json(
          { error: "Session nenalezena." },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: "Chybí session_id nebo order+access." },
      { status: 400 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "error";
    console.error("[checkout/rentgen/order]", message);
    return NextResponse.json(
      { error: "Stav objednávky se nepodařilo načíst." },
      { status: 503 }
    );
  }
}
