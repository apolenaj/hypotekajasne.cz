/**
 * Post-payment fulfillment: math engine → PDF → Supabase → customer e-mail.
 */

import type Stripe from "stripe";
import { formatAnalysisPrice } from "@/lib/property-rentgen/pricing";
import {
  parseRentgenCheckoutMetadata,
  snapshotToAuditInput,
} from "@/lib/property-rentgen/checkout-metadata";
import { renderPremiumRentgenPdfBuffer } from "@/lib/property-rentgen/premium-audit-pdf";
import { uploadPremiumRentgenPdf } from "@/lib/property-rentgen/premium-audit-storage";
import { runPremiumRentgenAudit } from "@/lib/property-rentgen/rentgen-math-engine";
import { sendPremiumAuditReadyEmail } from "@/lib/property-rentgen/send-premium-audit-email";

/** Signed download TTL for e-mail links (7 days). */
export const PREMIUM_RENTGEN_EMAIL_SIGNED_URL_SECONDS = 60 * 60 * 24 * 7;

export type FulfillRentgenPremiumResult = {
  reportId: string;
  storagePath: string;
  downloadUrl: string;
  emailDelivered: boolean;
  emailErrorCode?: string;
  customerEmail: string | null;
};

function resolveCustomerEmail(session: Stripe.Checkout.Session): string | null {
  const fromDetails = session.customer_details?.email?.trim();
  if (fromDetails) return fromDetails.toLowerCase();
  const legacy = session.customer_email?.trim();
  return legacy ? legacy.toLowerCase() : null;
}

function resolveCustomerName(session: Stripe.Checkout.Session): string | null {
  return session.customer_details?.name?.trim() || null;
}

export async function fulfillRentgenPremiumCheckout(
  session: Stripe.Checkout.Session
): Promise<FulfillRentgenPremiumResult> {
  const meta = parseRentgenCheckoutMetadata(
    session.metadata as Record<string, string> | null
  );
  const customerEmail = resolveCustomerEmail(session);
  if (!customerEmail) {
    throw new Error("Checkout session nemá e-mail zákazníka.");
  }

  const auditInput = snapshotToAuditInput(meta.snapshot, meta.reportId);
  const audit = runPremiumRentgenAudit(auditInput);
  const pdfBuffer = await renderPremiumRentgenPdfBuffer(audit);

  const uploaded = await uploadPremiumRentgenPdf({
    pdfBuffer,
    reportId: meta.reportId,
    signedUrlSeconds: PREMIUM_RENTGEN_EMAIL_SIGNED_URL_SECONDS,
  });

  const email = await sendPremiumAuditReadyEmail({
    to: customerEmail,
    customerName: resolveCustomerName(session),
    propertyLabel: meta.address,
    downloadUrl: uploaded.signedUrl,
    expiresInSeconds: uploaded.expiresInSeconds,
    idempotencyKey: `rentgen-premium-${session.id}`,
    amountPaidLabel: formatAnalysisPrice(),
  });

  if (!email.delivered) {
    console.error("[rentgen-fulfill] email failed", {
      reportId: meta.reportId,
      sessionId: session.id,
      errorCode: email.errorCode,
    });
  }

  return {
    reportId: uploaded.reportId,
    storagePath: uploaded.path,
    downloadUrl: uploaded.signedUrl,
    emailDelivered: email.delivered,
    emailErrorCode: email.errorCode,
    customerEmail,
  };
}
