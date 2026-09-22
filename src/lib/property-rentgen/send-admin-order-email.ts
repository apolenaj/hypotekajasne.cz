/**
 * Server-only internal ops notifications for Rentgen orders.
 * Recipient: ADMIN_ORDER_EMAIL (fallback LEAD_OPS_RECIPIENT_EMAIL).
 * NEVER import this module from client components.
 */

import {
  extractEmailAddress,
  readLeadOpsFromEmail,
  readLeadOpsRecipientEmail,
  readResendApiKey,
  readResendEmailDomain,
  senderBelongsToVerifiedDomain,
} from "@/lib/leads-ops-email";
import { checkoutBaseUrl } from "@/lib/property-rentgen/checkout-parse";
import type { InvestmentAnalysisOrderRow } from "@/lib/property-rentgen/orders";
import {
  formatAnalysisPrice,
  formatDigitalRentgenPrice,
} from "@/lib/property-rentgen/pricing";
import {
  normalizeProductCode,
  PRODUCT_CODE,
} from "@/lib/property-rentgen/products";

export type AdminOrderEmailKind = "checkout_pending" | "payment_confirmed";

export type SendAdminOrderEmailResult = {
  attempted: boolean;
  delivered: boolean;
  skipped?: boolean;
  errorCode?: string;
  providerMessageId?: string;
};

/** Server-only recipient — never NEXT_PUBLIC_* / never returned to client. */
export function readAdminOrderEmail(): string | null {
  const dedicated = process.env.ADMIN_ORDER_EMAIL?.trim();
  if (dedicated && dedicated.includes("@")) return dedicated.toLowerCase();
  return readLeadOpsRecipientEmail();
}

function escapeText(value: string): string {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .slice(0, 2000);
}

function snapString(
  snap: Record<string, unknown>,
  keys: string[]
): string | null {
  for (const k of keys) {
    const v = snap[k];
    if (typeof v === "string" && v.trim()) return escapeText(v.trim());
  }
  return null;
}

function snapNumber(
  snap: Record<string, unknown>,
  keys: string[]
): number | null {
  for (const k of keys) {
    const v = snap[k];
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string" && v.trim()) {
      const n = Number(v.replace(/\s/g, "").replace(",", "."));
      if (Number.isFinite(n)) return n;
    }
  }
  return null;
}

function productLabel(order: InvestmentAnalysisOrderRow): {
  name: string;
  priceLabel: string;
  isDigital: boolean;
} {
  const code =
    normalizeProductCode(order.product_code) || PRODUCT_CODE.INVESTMENT_XRAY;
  const isDigital = code === PRODUCT_CODE.INVESTMENT_XRAY;
  return {
    name: isDigital ? "Investiční rentgen" : "Individuální rozbor",
    priceLabel: isDigital
      ? formatDigitalRentgenPrice()
      : formatAnalysisPrice(),
    isDigital,
  };
}

function adminOrderUrl(order: InvestmentAnalysisOrderRow): string | null {
  const base = checkoutBaseUrl();
  if (!order.public_id || !order.access_token) return null;
  return `${base}/investicni-rentgen/objednavka?order=${encodeURIComponent(order.public_id)}&access=${encodeURIComponent(order.access_token)}`;
}

function photoCount(snap: Record<string, unknown>): number {
  const photos = snap.photos;
  return Array.isArray(photos) ? photos.length : 0;
}

export function buildAdminCheckoutPendingSubject(): string {
  return "Nové zadání Rentgenu – čeká na platbu";
}

export function buildAdminPaymentConfirmedSubject(
  order: InvestmentAnalysisOrderRow
): string {
  const { name, priceLabel } = productLabel(order);
  return `ZAPLACENO – ${name} – ${priceLabel}`;
}

export function buildAdminOrderEmailText(args: {
  kind: AdminOrderEmailKind;
  order: InvestmentAnalysisOrderRow;
  stripeSessionId?: string | null;
  paymentIntentId?: string | null;
}): string {
  const { order, kind } = args;
  const snap =
    order.input_snapshot && typeof order.input_snapshot === "object"
      ? (order.input_snapshot as Record<string, unknown>)
      : {};
  const { name, priceLabel } = productLabel(order);
  const adminUrl = adminOrderUrl(order);
  const listingUrl = snapString(snap, ["listingUrl", "listing_url"]);
  const address =
    snapString(snap, ["propertyAddress", "address", "label"]) ||
    order.property_label;
  const purchase = snapNumber(snap, ["purchasePriceCzk", "priceCzk"]);
  const rent = snapNumber(snap, ["monthlyGrossRentCzk", "monthlyRentCzk"]);
  const equity = snapNumber(snap, ["ownFundsCzk", "equityCzk"]);
  const rate = snapNumber(snap, ["annualRatePercent"]);
  const term = snapNumber(snap, ["termYears"]);
  const docs = photoCount(snap);

  const lines: string[] = [
    kind === "checkout_pending"
      ? "Stav: ČEKÁ NA PLATBU"
      : "Stav: PLATBA POTVRZENA",
    `Balíček: ${name}`,
    `Cena: ${priceLabel}`,
    `Order ID: ${order.public_id}`,
    `Interní ID: ${order.id}`,
    "",
    `Jméno: ${escapeText(order.customer_name || "—")}`,
    `E-mail klienta: ${escapeText(order.email || "—")}`,
    `Telefon: ${escapeText(order.phone || "—")}`,
    "",
    `Nemovitost: ${escapeText(address || "—")}`,
    `URL inzerátu: ${listingUrl ? escapeText(listingUrl) : "—"}`,
    `Kupní cena: ${purchase != null ? `${purchase} Kč` : "—"}`,
    `Nájem: ${rent != null ? `${rent} Kč` : "—"}`,
    `Vlastní kapitál: ${equity != null ? `${equity} Kč` : "—"}`,
    `Sazba: ${rate != null ? `${rate} %` : "—"}`,
    `Splatnost: ${term != null ? `${term} let` : "—"}`,
    `Dokumenty / fotografie: ${docs} souborů`,
  ];

  if (kind === "payment_confirmed") {
    lines.push(
      "",
      `Stripe session: ${escapeText(args.stripeSessionId || order.stripe_checkout_session_id || "—")}`,
      `Payment intent: ${escapeText(args.paymentIntentId || order.stripe_payment_intent_id || "—")}`
    );
  }

  if (adminUrl) {
    lines.push("", `Otevřít objednávku: ${adminUrl}`);
  }

  lines.push(
    "",
    "Interní upozornění Hypotéka Jasně. Neposílat marketing bez právního základu."
  );
  return `${lines.join("\n")}\n`;
}

async function sendResendText(args: {
  to: string;
  subject: string;
  text: string;
  idempotencyKey: string;
}): Promise<SendAdminOrderEmailResult> {
  const apiKey = readResendApiKey();
  const from = readLeadOpsFromEmail();
  const domain = readResendEmailDomain();

  if (!apiKey || !from) {
    return {
      attempted: false,
      delivered: false,
      errorCode: "email_provider_not_configured",
    };
  }
  if (domain && !senderBelongsToVerifiedDomain(from, domain)) {
    return {
      attempted: false,
      delivered: false,
      errorCode: "email_from_domain_mismatch",
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8_000);
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
        "Idempotency-Key": args.idempotencyKey.slice(0, 256),
      },
      body: JSON.stringify({
        from,
        to: [args.to],
        subject: args.subject,
        text: args.text,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      return {
        attempted: true,
        delivered: false,
        errorCode: "email_http_error",
      };
    }

    let providerMessageId: string | undefined;
    try {
      const json = (await res.json()) as { id?: unknown };
      if (typeof json.id === "string" && json.id.trim()) {
        providerMessageId = json.id.trim();
      }
    } catch {
      /* ignore */
    }

    return { attempted: true, delivered: true, providerMessageId };
  } catch (err) {
    const aborted =
      err instanceof Error &&
      (err.name === "AbortError" || /aborted/i.test(err.message));
    return {
      attempted: true,
      delivered: false,
      errorCode: aborted ? "email_timeout" : "email_network_error",
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function sendAdminOrderEmail(args: {
  kind: AdminOrderEmailKind;
  order: InvestmentAnalysisOrderRow;
  stripeSessionId?: string | null;
  paymentIntentId?: string | null;
}): Promise<SendAdminOrderEmailResult> {
  const to = readAdminOrderEmail();
  if (!to) {
    return {
      attempted: false,
      delivered: false,
      errorCode: "admin_email_not_configured",
    };
  }

  // Hard guard: never leak recipient into accidental client bundles via serialisation.
  if (extractEmailAddress(to) == null) {
    return {
      attempted: false,
      delivered: false,
      errorCode: "admin_email_invalid",
    };
  }

  const subject =
    args.kind === "checkout_pending"
      ? buildAdminCheckoutPendingSubject()
      : buildAdminPaymentConfirmedSubject(args.order);

  const text = buildAdminOrderEmailText(args);
  const idempotencyKey =
    args.kind === "checkout_pending"
      ? `rentgen-admin-checkout-${args.order.id}`
      : `rentgen-admin-paid-${args.order.id}-${args.stripeSessionId || args.order.stripe_checkout_session_id || "x"}`;

  return sendResendText({ to, subject, text, idempotencyKey });
}
