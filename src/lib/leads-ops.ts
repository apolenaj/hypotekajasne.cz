/**
 * Lead operations readiness helpers (Phase 6.1).
 * No PII in structured logs. Notification is best-effort after DB success.
 */

export type LeadOpsLog = {
  event: "lead_insert_ok" | "lead_insert_error" | "lead_notify_skipped" | "lead_notify_error";
  leadId?: string;
  source?: string;
  pageIntent?: string | null;
  status?: number;
  errorCode?: string;
};

export function logLeadOps(entry: LeadOpsLog): void {
  // Structured, PII-free — safe for production log drains.
  console.info("[lead_ops]", JSON.stringify(entry));
}

export function readSafePageIntent(
  metadata: Record<string, unknown> | undefined
): string | null {
  const raw = metadata?.page_intent;
  if (typeof raw !== "string") return null;
  const v = raw.trim().toLowerCase();
  if (
    v === "refinance" ||
    v === "osvc" ||
    v === "foreign_income" ||
    v === "investment" ||
    v === "american"
  ) {
    return v;
  }
  return null;
}

/**
 * Notification channel is not wired to a customer-facing provider in Phase 6.1.
 * DB insert success must not depend on notification delivery.
 */
export async function notifyLeadOperatorsBestEffort(input: {
  leadId: string;
  source: string;
  pageIntent: string | null;
}): Promise<{ attempted: boolean; delivered: boolean }> {
  const webhook = process.env.LEAD_OPS_WEBHOOK_URL?.trim();
  if (!webhook) {
    logLeadOps({
      event: "lead_notify_skipped",
      leadId: input.leadId,
      source: input.source,
      pageIntent: input.pageIntent,
    });
    return { attempted: false, delivered: false };
  }

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        type: "lead_created",
        leadId: input.leadId,
        source: input.source,
        pageIntent: input.pageIntent,
      }),
    });
    if (!res.ok) {
      logLeadOps({
        event: "lead_notify_error",
        leadId: input.leadId,
        source: input.source,
        pageIntent: input.pageIntent,
        status: res.status,
        errorCode: "webhook_http_error",
      });
      return { attempted: true, delivered: false };
    }
    return { attempted: true, delivered: true };
  } catch {
    logLeadOps({
      event: "lead_notify_error",
      leadId: input.leadId,
      source: input.source,
      pageIntent: input.pageIntent,
      errorCode: "webhook_network_error",
    });
    return { attempted: true, delivered: false };
  }
}
