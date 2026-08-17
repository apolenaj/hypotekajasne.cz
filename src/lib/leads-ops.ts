/**
 * Lead operations readiness helpers (Phase 6.1 / 6.2).
 * No PII in structured logs. Notification is best-effort after DB success.
 */

export type LeadOpsLog = {
  event:
    | "lead_insert_ok"
    | "lead_insert_error"
    | "lead_notify_skipped"
    | "lead_notify_error"
    | "lead_notify_retry"
    | "lead_notify_ok"
    | "lead_lifecycle_ok"
    | "lead_lifecycle_error";
  leadId?: string;
  source?: string;
  pageIntent?: string | null;
  status?: number;
  errorCode?: string;
  attempt?: number;
  fromStatus?: string;
  toStatus?: string;
};

export function logLeadOps(entry: LeadOpsLog): void {
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

const WEBHOOK_TIMEOUT_MS = 4_000;
const WEBHOOK_MAX_ATTEMPTS = 2;

async function postWebhookOnce(
  webhook: string,
  body: string,
  attempt: number
): Promise<{ ok: boolean; status?: number; errorCode?: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);
  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      signal: controller.signal,
    });
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        errorCode: "webhook_http_error",
      };
    }
    return { ok: true, status: res.status };
  } catch (err) {
    const aborted =
      err instanceof Error &&
      (err.name === "AbortError" || /aborted/i.test(err.message));
    return {
      ok: false,
      errorCode: aborted ? "webhook_timeout" : "webhook_network_error",
    };
  } finally {
    clearTimeout(timer);
    void attempt;
  }
}

/**
 * Notification channel is optional (LEAD_OPS_WEBHOOK_URL).
 * DB insert success must not depend on notification delivery.
 * Retries the same payload (same leadId) — never creates a second lead.
 */
export async function notifyLeadOperatorsBestEffort(input: {
  leadId: string;
  source: string;
  pageIntent: string | null;
}): Promise<{ attempted: boolean; delivered: boolean; attempts: number }> {
  const webhook = process.env.LEAD_OPS_WEBHOOK_URL?.trim();
  if (!webhook) {
    logLeadOps({
      event: "lead_notify_skipped",
      leadId: input.leadId,
      source: input.source,
      pageIntent: input.pageIntent,
    });
    return { attempted: false, delivered: false, attempts: 0 };
  }

  const body = JSON.stringify({
    type: "lead_created",
    leadId: input.leadId,
    source: input.source,
    pageIntent: input.pageIntent,
  });

  let attempts = 0;
  for (let attempt = 1; attempt <= WEBHOOK_MAX_ATTEMPTS; attempt += 1) {
    attempts = attempt;
    if (attempt > 1) {
      logLeadOps({
        event: "lead_notify_retry",
        leadId: input.leadId,
        source: input.source,
        pageIntent: input.pageIntent,
        attempt,
      });
    }
    const result = await postWebhookOnce(webhook, body, attempt);
    if (result.ok) {
      logLeadOps({
        event: "lead_notify_ok",
        leadId: input.leadId,
        source: input.source,
        pageIntent: input.pageIntent,
        attempt,
        status: result.status,
      });
      return { attempted: true, delivered: true, attempts };
    }
    logLeadOps({
      event: "lead_notify_error",
      leadId: input.leadId,
      source: input.source,
      pageIntent: input.pageIntent,
      status: result.status,
      errorCode: result.errorCode,
      attempt,
    });
  }

  return { attempted: true, delivered: false, attempts };
}

/** Ops API auth: LEAD_OPS_API_SECRET or CRON_SECRET via Bearer. */
export function authorizeLeadOpsRequest(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;
  const secrets = [
    process.env.LEAD_OPS_API_SECRET?.trim(),
    process.env.CRON_SECRET?.trim(),
  ].filter((s): s is string => Boolean(s));
  if (secrets.length === 0) return false;
  return secrets.some((secret) => authHeader === `Bearer ${secret}`);
}
