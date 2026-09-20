/**
 * Fulfill paid Investiční rentgen orders (999 digital + 4990 individual).
 * Idempotent: READY / AWAITING_DOCUMENTS short-circuits.
 */

import type Stripe from "stripe";
import {
  parseRentgenCheckoutMetadata,
  snapshotToAuditInput,
  type RentgenCheckoutPropertySnapshot,
} from "@/lib/property-rentgen/checkout-metadata";
import { renderCustomerModelPdfBuffer } from "@/lib/property-rentgen/control-model-sample-pdf";
import { runCustomerDigitalModelFromManual } from "@/lib/property-rentgen/customer-digital-model";
import {
  getOrderByCheckoutSessionId,
  getOrderById,
  updateOrder,
  type InvestmentAnalysisOrderRow,
} from "@/lib/property-rentgen/orders";
import { uploadPremiumRentgenPdf } from "@/lib/property-rentgen/premium-audit-storage";
import { renderPremiumRentgenPdfBuffer } from "@/lib/property-rentgen/premium-audit-pdf";
import {
  formatAnalysisPrice,
  formatDigitalRentgenPrice,
} from "@/lib/property-rentgen/pricing";
import {
  normalizeProductCode,
  PRODUCT_CODE,
  type ProductCode,
} from "@/lib/property-rentgen/products";
import { runPremiumRentgenAudit } from "@/lib/property-rentgen/rentgen-math-engine";
import { sendPremiumAuditReadyEmail } from "@/lib/property-rentgen/send-premium-audit-email";
import type { ManualPropertyInput } from "@/lib/property-rentgen/types";

export const PREMIUM_RENTGEN_EMAIL_SIGNED_URL_SECONDS = 60 * 60 * 24 * 7;

export type FulfillOrderResult = {
  orderId: string;
  publicId: string;
  status: string;
  reportId: string | null;
  emailDelivered: boolean;
  skipped: boolean;
};

function resolveCustomerEmail(
  session: Stripe.Checkout.Session,
  order: InvestmentAnalysisOrderRow | null
): string | null {
  const fromDetails = session.customer_details?.email?.trim();
  if (fromDetails) return fromDetails.toLowerCase();
  const legacy = session.customer_email?.trim();
  if (legacy) return legacy.toLowerCase();
  return order?.email ?? null;
}

function snapshotFromOrder(
  order: InvestmentAnalysisOrderRow
): RentgenCheckoutPropertySnapshot {
  const snap = order.input_snapshot as Partial<RentgenCheckoutPropertySnapshot>;
  return {
    label: snap.label,
    address: snap.address,
    city: snap.city,
    areaM2: snap.areaM2,
    purchasePriceCzk: Number(snap.purchasePriceCzk),
    monthlyGrossRentCzk: Number(snap.monthlyGrossRentCzk),
    capexCzk: Number(snap.capexCzk ?? 0),
    closingCostsCzk: Number(snap.closingCostsCzk ?? 0),
    monthlyOperatingCostsCzk: Number(snap.monthlyOperatingCostsCzk ?? 0),
    monthlyReserveCzk: Number(snap.monthlyReserveCzk ?? 0),
    vacancyRate: Number(snap.vacancyRate ?? 0.05),
    ownFundsCzk: Number(snap.ownFundsCzk),
    loanAmountCzk:
      snap.loanAmountCzk != null ? Number(snap.loanAmountCzk) : undefined,
    annualRatePercent: Number(snap.annualRatePercent),
    termYears: Number(snap.termYears ?? 30),
    fixationYears: Number(snap.fixationYears ?? 5),
  };
}

function toManualInput(
  snap: RentgenCheckoutPropertySnapshot
): ManualPropertyInput {
  return {
    country: "CZ",
    city: snap.city ?? "",
    propertyType: "Byt",
    areaM2: snap.areaM2 ?? null,
    priceCzk: snap.purchasePriceCzk,
    rentMonthlyCzk: snap.monthlyGrossRentCzk,
    equityCzk: snap.ownFundsCzk,
    annualRatePercent: snap.annualRatePercent,
    termYears: snap.termYears ?? 30,
    purpose: "investment",
    listingUrl: "",
  };
}

async function fulfillDigital(
  order: InvestmentAnalysisOrderRow,
  snap: RentgenCheckoutPropertySnapshot,
  customerEmail: string,
  customerName: string | null,
  sessionId: string
): Promise<FulfillOrderResult> {
  const reportId = order.report_id || order.id;
  await updateOrder(order.id, {
    status: "PROCESSING",
    processing_at: new Date().toISOString(),
    fulfillment_error: null,
  });

  const model = runCustomerDigitalModelFromManual(toManualInput(snap));
  if (!model.ok) {
    await updateOrder(order.id, {
      status: "FAILED",
      fulfillment_error: model.messageCs,
    });
    throw new Error(model.messageCs);
  }

  const pdfBuffer = await renderCustomerModelPdfBuffer(model.inputs);
  const uploaded = await uploadPremiumRentgenPdf({
    pdfBuffer,
    reportId,
    signedUrlSeconds: PREMIUM_RENTGEN_EMAIL_SIGNED_URL_SECONDS,
  });

  const email = await sendPremiumAuditReadyEmail({
    to: customerEmail,
    customerName,
    propertyLabel: order.property_label || snap.address || "Nemovitost",
    downloadUrl: uploaded.signedUrl,
    expiresInSeconds: uploaded.expiresInSeconds,
    idempotencyKey: `rentgen-digital-${sessionId}`,
    amountPaidLabel: formatDigitalRentgenPrice(),
  });

  await updateOrder(order.id, {
    status: "READY",
    storage_path: uploaded.path,
    report_id: uploaded.reportId,
    fulfilled_at: new Date().toISOString(),
    result_snapshot: {
      modelVersion: model.modelVersion,
      monthlyCashFlowCzk: model.result.monthlyCashFlowCzk,
    },
  });

  return {
    orderId: order.id,
    publicId: order.public_id,
    status: "READY",
    reportId: uploaded.reportId,
    emailDelivered: email.delivered,
    skipped: false,
  };
}

async function fulfillIndividual(
  order: InvestmentAnalysisOrderRow,
  snap: RentgenCheckoutPropertySnapshot,
  customerEmail: string,
  customerName: string | null,
  sessionId: string
): Promise<FulfillOrderResult> {
  const reportId = order.report_id || order.id;
  await updateOrder(order.id, {
    status: "PROCESSING",
    processing_at: new Date().toISOString(),
    fulfillment_error: null,
  });

  // Auto-generate the model PDF immediately; human review remains AWAITING_DOCUMENTS.
  const auditInput = snapshotToAuditInput(snap, reportId);
  const audit = runPremiumRentgenAudit(auditInput);
  const pdfBuffer = await renderPremiumRentgenPdfBuffer(audit);
  const uploaded = await uploadPremiumRentgenPdf({
    pdfBuffer,
    reportId,
    signedUrlSeconds: PREMIUM_RENTGEN_EMAIL_SIGNED_URL_SECONDS,
  });

  const email = await sendPremiumAuditReadyEmail({
    to: customerEmail,
    customerName,
    propertyLabel: order.property_label || snap.address || "Nemovitost",
    downloadUrl: uploaded.signedUrl,
    expiresInSeconds: uploaded.expiresInSeconds,
    idempotencyKey: `rentgen-individual-${sessionId}`,
    amountPaidLabel: formatAnalysisPrice(),
  });

  await updateOrder(order.id, {
    status: "AWAITING_DOCUMENTS",
    storage_path: uploaded.path,
    report_id: uploaded.reportId,
    fulfilled_at: new Date().toISOString(),
    result_snapshot: {
      auditVersion: "premium",
      note: "Model PDF ready; awaiting client documents for individual commentary.",
    },
  });

  return {
    orderId: order.id,
    publicId: order.public_id,
    status: "AWAITING_DOCUMENTS",
    reportId: uploaded.reportId,
    emailDelivered: email.delivered,
    skipped: false,
  };
}

export async function fulfillRentgenOrderFromSession(
  session: Stripe.Checkout.Session,
  opts?: { eventId?: string }
): Promise<FulfillOrderResult> {
  const orderIdMeta = session.metadata?.orderId?.trim();
  let order =
    (orderIdMeta ? await getOrderById(orderIdMeta) : null) ||
    (await getOrderByCheckoutSessionId(session.id));

  if (!order && session.client_reference_id) {
    order = await getOrderById(session.client_reference_id);
  }

  // Legacy sessions without DB order — fall back to metadata-only premium fulfill path.
  if (!order) {
    const { fulfillRentgenPremiumCheckout } = await import(
      "@/lib/property-rentgen/fulfill-premium-order"
    );
    const legacy = await fulfillRentgenPremiumCheckout(session);
    return {
      orderId: "legacy",
      publicId: legacy.reportId,
      status: "READY",
      reportId: legacy.reportId,
      emailDelivered: legacy.emailDelivered,
      skipped: false,
    };
  }

  if (
    order.status === "READY" ||
    order.status === "AWAITING_DOCUMENTS" ||
    (order.status === "PROCESSING" && order.storage_path)
  ) {
    return {
      orderId: order.id,
      publicId: order.public_id,
      status: order.status,
      reportId: order.report_id,
      emailDelivered: true,
      skipped: true,
    };
  }

  const paymentOk =
    session.payment_status === "paid" ||
    session.payment_status === "no_payment_required";
  if (!paymentOk) {
    await updateOrder(order.id, { status: "PAYMENT_PENDING" });
    return {
      orderId: order.id,
      publicId: order.public_id,
      status: "PAYMENT_PENDING",
      reportId: order.report_id,
      emailDelivered: false,
      skipped: true,
    };
  }

  const productCode =
    normalizeProductCode(order.product_code) ||
    normalizeProductCode(session.metadata?.productCode) ||
    normalizeProductCode(session.metadata?.product) ||
    PRODUCT_CODE.INDIVIDUAL_ANALYSIS;

  const customerEmail = resolveCustomerEmail(session, order);
  if (!customerEmail) {
    throw new Error("Checkout session nemá e-mail zákazníka.");
  }

  await updateOrder(order.id, {
    status: "PAID",
    paid_at: new Date().toISOString(),
    email: customerEmail,
    stripe_payment_intent_id:
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id ?? order.stripe_payment_intent_id,
    stripe_customer_id:
      typeof session.customer === "string"
        ? session.customer
        : session.customer?.id ?? order.stripe_customer_id,
    last_stripe_event_id: opts?.eventId ?? order.last_stripe_event_id,
  });

  let snap: RentgenCheckoutPropertySnapshot;
  try {
    snap = snapshotFromOrder(order);
    if (
      !Number.isFinite(snap.purchasePriceCzk) ||
      snap.purchasePriceCzk <= 0
    ) {
      const meta = parseRentgenCheckoutMetadata(
        session.metadata as Record<string, string> | null
      );
      snap = meta.snapshot;
    }
  } catch {
    const meta = parseRentgenCheckoutMetadata(
      session.metadata as Record<string, string> | null
    );
    snap = meta.snapshot;
  }

  const customerName =
    session.customer_details?.name?.trim() || order.customer_name;

  if (productCode === PRODUCT_CODE.INVESTMENT_XRAY) {
    return fulfillDigital(
      order,
      snap,
      customerEmail,
      customerName,
      session.id
    );
  }

  return fulfillIndividual(
    order,
    snap,
    customerEmail,
    customerName,
    session.id
  );
}

/** @deprecated Prefer fulfillRentgenOrderFromSession */
export async function fulfillRentgenPremiumCheckout(
  session: Stripe.Checkout.Session
) {
  return fulfillRentgenOrderFromSession(session);
}

export type { ProductCode };
