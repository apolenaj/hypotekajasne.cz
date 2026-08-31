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
  /** Resend message id — not a secret, not PII. */
  providerMessageId?: string;
  /** Safe boolean checks for audit (no raw addresses in logs). */
  senderDomainOk?: boolean;
  recipientOk?: boolean;
  subjectIsTest?: boolean;
};

const BUSINESS_OWNER_LINE = "Business owner: Bc. Josef Apolenář BSc., MBA";
const EXPECTED_RECIPIENT = "josef.apolenar@gmail.com";

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

/**
 * From address. Accepts display-name form:
 * `Hypotéka Jasně <leady@notify.hypotekajasne.cz>`
 */
export function readLeadOpsFromEmail(): string | null {
  const v =
    process.env.LEAD_OPS_FROM_EMAIL?.trim() ||
    process.env.NOTIFY_EMAIL_FROM?.trim() ||
    "";
  if (!v) return null;
  if (extractEmailAddress(v)) return v;
  return null;
}

export function extractEmailAddress(raw: string): string | null {
  const angle = raw.match(/<([^>]+)>/);
  const addr = (angle?.[1] ?? raw).trim().toLowerCase();
  if (!addr.includes("@")) return null;
  return addr;
}

export function readResendApiKey(): string | null {
  const v =
    process.env.RESEND_API_KEY?.trim() ||
    process.env.NOTIFY_EMAIL_PROVIDER_API_KEY?.trim() ||
    "";
  return v || null;
}

export function readResendEmailDomain(): string | null {
  const v = process.env.RESEND_EMAIL_DOMAIN?.trim().toLowerCase() ?? "";
  if (!v || v.includes("/") || v.includes("@")) return null;
  return v;
}

export function senderBelongsToVerifiedDomain(
  fromRaw: string,
  domain: string | null
): boolean {
  const addr = extractEmailAddress(fromRaw);
  if (!addr || !domain) return false;
  return addr.endsWith(`@${domain}`);
}

export function recipientIsTechnicalOwner(to: string | null): boolean {
  return (to ?? "").trim().toLowerCase() === EXPECTED_RECIPIENT;
}

/**
 * Describes which outbound e-mail configuration is missing (no secrets).
 */
export function describeLeadOpsEmailProviderGap(): {
  recipientConfigured: boolean;
  fromConfigured: boolean;
  apiKeyConfigured: boolean;
  domainConfigured: boolean;
  senderDomainOk: boolean;
  recipientOk: boolean;
  ready: boolean;
  missing: string[];
} {
  const recipient = readLeadOpsRecipientEmail();
  const from = readLeadOpsFromEmail();
  const domain = readResendEmailDomain();
  const recipientConfigured = Boolean(recipient);
  const fromConfigured = Boolean(from);
  const apiKeyConfigured = Boolean(readResendApiKey());
  const domainConfigured = Boolean(domain);
  const senderDomainOk = Boolean(
    from && domain && senderBelongsToVerifiedDomain(from, domain)
  );
  const recipientOk = recipientIsTechnicalOwner(recipient);
  const missing: string[] = [];
  if (!recipientConfigured) missing.push("LEAD_OPS_RECIPIENT_EMAIL");
  if (!apiKeyConfigured) {
    missing.push("RESEND_API_KEY (or NOTIFY_EMAIL_PROVIDER_API_KEY)");
  }
  if (!fromConfigured) {
    missing.push("LEAD_OPS_FROM_EMAIL (or NOTIFY_EMAIL_FROM)");
  }
  if (!domainConfigured) missing.push("RESEND_EMAIL_DOMAIN");
  if (fromConfigured && domainConfigured && !senderDomainOk) {
    missing.push("LEAD_OPS_FROM_EMAIL_domain_mismatch");
  }
  if (recipientConfigured && !recipientOk) {
    missing.push("LEAD_OPS_RECIPIENT_EMAIL_mismatch");
  }
  return {
    recipientConfigured,
    fromConfigured,
    apiKeyConfigured,
    domainConfigured,
    senderDomainOk,
    recipientOk,
    ready:
      missing.length === 0 &&
      senderDomainOk &&
      recipientOk &&
      apiKeyConfigured &&
      fromConfigured,
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
  const gap = describeLeadOpsEmailProviderGap();
  const to = readLeadOpsRecipientEmail();
  const from = readLeadOpsFromEmail();
  const apiKey = readResendApiKey();

  if (!to) {
    return {
      attempted: false,
      delivered: false,
      errorCode: "email_recipient_not_configured",
      recipientOk: false,
    };
  }

  if (!gap.ready || !apiKey || !from) {
    return {
      attempted: false,
      delivered: false,
      errorCode: "email_provider_not_configured",
      provider: "resend",
      senderDomainOk: gap.senderDomainOk,
      recipientOk: gap.recipientOk,
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
        senderDomainOk: true,
        recipientOk: true,
        subjectIsTest: payload.isTest,
      };
    }

    let providerMessageId: string | undefined;
    try {
      const json = (await res.json()) as { id?: unknown };
      if (typeof json.id === "string" && json.id.trim()) {
        providerMessageId = json.id.trim();
      }
    } catch {
      /* ignore parse errors — HTTP success still counts as accepted */
    }

    return {
      attempted: true,
      delivered: true,
      status: res.status,
      provider: "resend",
      providerMessageId,
      senderDomainOk: true,
      recipientOk: true,
      subjectIsTest: payload.isTest,
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
      senderDomainOk: true,
      recipientOk: true,
      subjectIsTest: payload.isTest,
    };
  } finally {
    clearTimeout(timer);
  }
}
