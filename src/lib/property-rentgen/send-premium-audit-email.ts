/**
 * Customer delivery e-mail for paid Komplexní Investiční Audit.
 * Uses existing Resend HTTP API (same provider as lead-ops) + React Email HTML.
 */

import { render } from "@react-email/render";
import {
  extractEmailAddress,
  readLeadOpsFromEmail,
  readResendApiKey,
  readResendEmailDomain,
  senderBelongsToVerifiedDomain,
} from "@/lib/leads-ops-email";
import { formatAnalysisPrice } from "@/lib/property-rentgen/pricing";
import { PremiumAuditReadyEmail } from "@/lib/property-rentgen/emails/PremiumAuditReadyEmail";

export type SendPremiumAuditEmailResult = {
  attempted: boolean;
  delivered: boolean;
  errorCode?: string;
  providerMessageId?: string;
};

function readRentgenFromEmail(): string | null {
  const dedicated =
    process.env.RENTGEN_AUDIT_FROM_EMAIL?.trim() ||
    process.env.NOTIFY_EMAIL_FROM?.trim() ||
    "";
  if (dedicated && extractEmailAddress(dedicated)) return dedicated;
  return readLeadOpsFromEmail();
}

export async function sendPremiumAuditReadyEmail(args: {
  to: string;
  customerName?: string | null;
  propertyLabel: string;
  downloadUrl: string;
  expiresInSeconds: number;
  /** Stripe session id — Resend Idempotency-Key */
  idempotencyKey: string;
  amountPaidLabel?: string;
}): Promise<SendPremiumAuditEmailResult> {
  const to = args.to.trim().toLowerCase();
  if (!to.includes("@")) {
    return { attempted: false, delivered: false, errorCode: "invalid_recipient" };
  }

  const apiKey = readResendApiKey();
  const from = readRentgenFromEmail();
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

  const expiresInHours = Math.max(1, Math.round(args.expiresInSeconds / 3600));
  const amountPaidLabel = args.amountPaidLabel ?? formatAnalysisPrice();

  const html = await render(
    PremiumAuditReadyEmail({
      customerName: args.customerName,
      propertyLabel: args.propertyLabel,
      downloadUrl: args.downloadUrl,
      expiresInHours,
      amountPaidLabel,
    })
  );

  const text = [
    args.customerName?.trim()
      ? `Dobrý den, ${args.customerName.trim()},`
      : "Dobrý den,",
    "",
    "Děkujeme za zakoupení Investičního rentgenu. Váš komplexní audit je připraven.",
    "",
    `Nemovitost: ${args.propertyLabel}`,
    `Uhrazeno: ${amountPaidLabel}`,
    "",
    `Stáhnout PDF: ${args.downloadUrl}`,
    `Odkaz platí cca ${expiresInHours} hodin.`,
    "",
    "Modelový výstup Hypotéka Jasně — ne nabídka banky.",
  ].join("\n");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12_000);
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
        to: [to],
        subject:
          "Váš Komplexní Investiční Audit je připraven | Hypotéka Jasně",
        html,
        text,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      return {
        attempted: true,
        delivered: false,
        errorCode: `email_http_${res.status}`,
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
