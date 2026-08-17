/**
 * Lead ops e-mail notification (server-only).
 * Provider: Resend HTTP API when RESEND_API_KEY + from-address are configured.
 * Never logs PII. Never uses LEAD_OPS_WEBHOOK_URL for e-mail.
 */

export type LeadOpsEmailPayload = {
  leadId: string;
  createdAt: string;
  pageIntent: string | null;
  name: string;
  email: string;
  phone: string;
  landingPage: string;
  message?: string;
  /** Synthetic / Phase 6.2 test leads use the TEST subject prefix. */
  isTest: boolean;
};

export type LeadOpsEmailSendResult = {
  attempted: boolean;
  delivered: boolean;
  status?: number;
  errorCode?: string;
  provider?: "resend";
};

const BUSINESS_OWNER_LINE = "Business owner: Michal Heinzke";

export function buildLeadOpsEmailSubject(
  pageIntent: string | null,
  isTest: boolean
): string {
  const intent = (pageIntent?.trim() || "unknown").slice(0, 64);
  if (isTest) {
    return `[TEST PHASE 6.2] Nový lead – ${intent}`;
  }
  return `[Hypotéka Jasně] Nový lead – ${intent}`;
}

export function buildLeadOpsEmailText(payload: LeadOpsEmailPayload): string {
  const lines = [
    `Lead ID: ${payload.leadId}`,
    `Created at: ${payload.createdAt}`,
    `Page intent: ${payload.pageIntent?.trim() || "—"}`,
    `Name: ${payload.name}`,
    `E-mail: ${payload.email}`,
    `Phone: ${payload.phone || "—"}`,
    `Landing page: ${payload.landingPage || "—"}`,
  ];
  if (payload.message?.trim()) {
    lines.push(`Message: ${payload.message.trim()}`);
  }
  lines.push("", BUSINESS_OWNER_LINE);
  return `${lines.join("\n")}\n`;
}

/** Server-only recipient — never NEXT_PUBLIC_*. */
export function readLeadOpsRecipientEmail(): string | null {
  const v = process.env.LEAD_OPS_RECIPIENT_EMAIL?.trim();
  if (!v || !v.includes("@")) return null;
  return v;
}

export function readLeadOpsFromEmail(): string | null {
  const v =
    process.env.LEAD_OPS_FROM_EMAIL?.trim() ||
    process.env.NOTIFY_EMAIL_FROM?.trim() ||
    "";
  if (!v || !v.includes("@")) return null;
  return v;
}

export function readResendApiKey(): string | null {
  const v =
    process.env.RESEND_API_KEY?.trim() ||
    process.env.NOTIFY_EMAIL_PROVIDER_API_KEY?.trim() ||
    "";
  return v || null;
}

/**
 * Describes which outbound e-mail configuration is missing (no secrets).
 */
export function describeLeadOpsEmailProviderGap(): {
  recipientConfigured: boolean;
  fromConfigured: boolean;
  apiKeyConfigured: boolean;
  ready: boolean;
  missing: string[];
} {
  const recipientConfigured = Boolean(readLeadOpsRecipientEmail());
  const fromConfigured = Boolean(readLeadOpsFromEmail());
  const apiKeyConfigured = Boolean(readResendApiKey());
  const missing: string[] = [];
  if (!recipientConfigured) missing.push("LEAD_OPS_RECIPIENT_EMAIL");
  if (!apiKeyConfigured) {
    missing.push("RESEND_API_KEY (or NOTIFY_EMAIL_PROVIDER_API_KEY)");
  }
  if (!fromConfigured) {
    missing.push("LEAD_OPS_FROM_EMAIL (or NOTIFY_EMAIL_FROM)");
  }
  return {
    recipientConfigured,
    fromConfigured,
    apiKeyConfigured,
    ready: missing.length === 0,
    missing,
  };
}

/**
 * Send via Resend REST API (no SDK dependency).
 * Returns structured result without PII.
 */
export async function sendLeadOpsEmail(
  payload: LeadOpsEmailPayload
): Promise<LeadOpsEmailSendResult> {
  const to = readLeadOpsRecipientEmail();
  if (!to) {
    return {
      attempted: false,
      delivered: false,
      errorCode: "email_recipient_not_configured",
    };
  }

  const apiKey = readResendApiKey();
  const from = readLeadOpsFromEmail();
  if (!apiKey || !from) {
    return {
      attempted: false,
      delivered: false,
      errorCode: "email_provider_not_configured",
      provider: "resend",
    };
  }

  const subject = buildLeadOpsEmailSubject(payload.pageIntent, payload.isTest);
  const text = buildLeadOpsEmailText(payload);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8_000);
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        text,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      return {
        attempted: true,
        delivered: false,
        status: res.status,
        errorCode: "email_http_error",
        provider: "resend",
      };
    }

    return {
      attempted: true,
      delivered: true,
      status: res.status,
      provider: "resend",
    };
  } catch (err) {
    const aborted =
      err instanceof Error &&
      (err.name === "AbortError" || /aborted/i.test(err.message));
    return {
      attempted: true,
      delivered: false,
      errorCode: aborted ? "email_timeout" : "email_network_error",
      provider: "resend",
    };
  } finally {
    clearTimeout(timer);
  }
}
