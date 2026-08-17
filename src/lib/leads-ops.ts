/**
 * Lead operations readiness helpers (Phase 6.1 / 6.2).
 * No PII in structured logs. Notification is best-effort after DB success.
 */

import {
  describeLeadOpsEmailProviderGap,
  sendLeadOpsEmail,
  type LeadOpsEmailPayload,
} from "@/lib/leads-ops-email";
import { isSyntheticRetentionMarker } from "@/lib/leads-attribution";

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
  channel?: "email" | "webhook";
  provider?: string;
  /** Resend message id — technical only. */
  providerMessageId?: string;
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
const EMAIL_MAX_ATTEMPTS = 2;

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

export type LeadNotifyInput = {
  leadId: string;
  source: string;
  pageIntent: string | null;
  createdAt: string;
  name: string;
  email: string;
  phone?: string;
  landingPage?: string;
  message?: string;
  /** From sanitized metadata.test_marker — never logged as free text beyond isTest. */
  testMarker?: string | null;
};

export type LeadNotifyResult = {
  attempted: boolean;
  delivered: boolean;
  attempts: number;
  emailDelivered: boolean;
  webhookDelivered: boolean;
  emailErrorCode?: string;
  providerMessageId?: string;
  emailHttpStatus?: number;
};

function isTestLead(marker: string | null | undefined): boolean {
  return isSyntheticRetentionMarker(marker);
}

/**
 * Best-effort notify after DB insert.
 * Prefer e-mail via LEAD_OPS_RECIPIENT_EMAIL (+ Resend keys).
 * Optional LEAD_OPS_WEBHOOK_URL remains a separate channel (not an e-mail address).
 * DB insert success must not depend on notification delivery.
 * Retries the same leadId — never creates a second lead.
 */
export async function notifyLeadOperatorsBestEffort(
  input: LeadNotifyInput
): Promise<LeadNotifyResult> {
  const isTest = isTestLead(input.testMarker);
  const emailPayload: LeadOpsEmailPayload = {
    leadId: input.leadId,
    createdAt: input.createdAt,
    pageIntent: input.pageIntent,
    name: input.name,
    email: input.email,
    phone: input.phone?.trim() || "",
    landingPage: input.landingPage?.trim() || "",
    message: input.message?.trim() || undefined,
    isTest,
  };

  let attempts = 0;
  let emailDelivered = false;
  let emailErrorCode: string | undefined;
  let emailAttempted = false;
  let providerMessageId: string | undefined;
  let emailHttpStatus: number | undefined;

  const gap = describeLeadOpsEmailProviderGap();
  if (!gap.recipientConfigured && !process.env.LEAD_OPS_WEBHOOK_URL?.trim()) {
    logLeadOps({
      event: "lead_notify_skipped",
      leadId: input.leadId,
      source: input.source,
      pageIntent: input.pageIntent,
      errorCode: "no_notification_channel",
    });
    return {
      attempted: false,
      delivered: false,
      attempts: 0,
      emailDelivered: false,
      webhookDelivered: false,
      emailErrorCode: "no_notification_channel",
    };
  }

  if (gap.recipientConfigured) {
    if (!gap.ready) {
      emailAttempted = false;
      emailErrorCode = "email_provider_not_configured";
      logLeadOps({
        event: "lead_notify_error",
        leadId: input.leadId,
        source: input.source,
        pageIntent: input.pageIntent,
        channel: "email",
        provider: "resend",
        errorCode: emailErrorCode,
      });
    } else {
      for (let attempt = 1; attempt <= EMAIL_MAX_ATTEMPTS; attempt += 1) {
        attempts = Math.max(attempts, attempt);
        emailAttempted = true;
        if (attempt > 1) {
          logLeadOps({
            event: "lead_notify_retry",
            leadId: input.leadId,
            source: input.source,
            pageIntent: input.pageIntent,
            channel: "email",
            provider: "resend",
            attempt,
          });
        }
        const result = await sendLeadOpsEmail(emailPayload);
        emailHttpStatus = result.status;
        if (result.delivered) {
          emailDelivered = true;
          providerMessageId = result.providerMessageId;
          logLeadOps({
            event: "lead_notify_ok",
            leadId: input.leadId,
            source: input.source,
            pageIntent: input.pageIntent,
            channel: "email",
            provider: result.provider,
            attempt,
            status: result.status,
            providerMessageId: result.providerMessageId,
          });
          break;
        }
        emailErrorCode = result.errorCode;
        logLeadOps({
          event: "lead_notify_error",
          leadId: input.leadId,
          source: input.source,
          pageIntent: input.pageIntent,
          channel: "email",
          provider: result.provider,
          status: result.status,
          errorCode: result.errorCode,
          attempt,
        });
        if (!result.attempted) break;
      }
    }
  }

  let webhookDelivered = false;
  const webhook = process.env.LEAD_OPS_WEBHOOK_URL?.trim();
  if (webhook) {
    // Never treat an e-mail address as webhook URL.
    if (/^mailto:/i.test(webhook) || (!/^https?:\/\//i.test(webhook) && webhook.includes("@"))) {
      logLeadOps({
        event: "lead_notify_error",
        leadId: input.leadId,
        source: input.source,
        pageIntent: input.pageIntent,
        channel: "webhook",
        errorCode: "webhook_invalid_url",
      });
    } else {
      const body = JSON.stringify({
        type: "lead_created",
        leadId: input.leadId,
        source: input.source,
        pageIntent: input.pageIntent,
      });

      for (let attempt = 1; attempt <= WEBHOOK_MAX_ATTEMPTS; attempt += 1) {
        attempts = Math.max(attempts, attempt);
        if (attempt > 1) {
          logLeadOps({
            event: "lead_notify_retry",
            leadId: input.leadId,
            source: input.source,
            pageIntent: input.pageIntent,
            channel: "webhook",
            attempt,
          });
        }
        const result = await postWebhookOnce(webhook, body, attempt);
        if (result.ok) {
          webhookDelivered = true;
          logLeadOps({
            event: "lead_notify_ok",
            leadId: input.leadId,
            source: input.source,
            pageIntent: input.pageIntent,
            channel: "webhook",
            attempt,
            status: result.status,
          });
          break;
        }
        logLeadOps({
          event: "lead_notify_error",
          leadId: input.leadId,
          source: input.source,
          pageIntent: input.pageIntent,
          channel: "webhook",
          status: result.status,
          errorCode: result.errorCode,
          attempt,
        });
      }
    }
  }

  const attempted = emailAttempted || Boolean(webhook) || Boolean(emailErrorCode);
  const delivered = emailDelivered || webhookDelivered;

  return {
    attempted,
    delivered,
    attempts,
    emailDelivered,
    webhookDelivered,
    emailErrorCode,
    providerMessageId,
    emailHttpStatus,
  };
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
