/**
 * Privacy retention cleanup — anonymize expired ordinary enquiries.
 * Invoked by /api/cron/privacy-retention (Vercel cron + CRON_SECRET).
 *
 * Rules:
 * - skip legal_hold
 * - skip active_case
 * - skip already deleted_at
 * - skip active marketing_consent until retention_until elapsed (defense in depth)
 * - only rows with retention_until < now()
 * - anonymize PII; preserve consent-evidence keys in metadata
 * - dryRun=true selects candidates only (no updates / deletes)
 * - onlyLeadId + synthetic marker: controlled single-row test path
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { isSyntheticRetentionMarker } from "@/lib/leads-attribution";
import { privacyRetention } from "@/lib/legal/privacy-retention";

export type RetentionCleanupResult = {
  dryRun: boolean;
  runId: string;
  scanned: number;
  anonymized: number;
  skipped: number;
  technicalLogsDeleted: number;
  /** Internal only — never expose in public HTTP JSON. */
  candidateIds: string[];
  candidateCount: number;
  cutoffIso: string;
  /** Count of technical logs that would be deleted in a real run. */
  technicalLogsWouldDelete: number;
  errors: string[];
};

export type RetentionCleanupOptions = {
  dryRun?: boolean;
  /** When set, only this lead may be processed (must carry synthetic marker). */
  onlyLeadId?: string;
  runId?: string;
};

const ANON_NAME = "[anonymized]";
const ANON_EMAIL = "anonymized@invalid.local";

/** Consent / legal evidence keys preserved across anonymization. */
const CONSENT_EVIDENCE_KEYS = [
  "consent",
  "privacy_notice_version",
  "privacy_notice_acknowledged",
  "privacy_notice_acknowledged_at",
  "marketing_consent",
  "marketing_consent_at",
  "marketing_consent_withdrawn_at",
  "marketing_consent_version",
  "marketing_opt_in",
  "transfer_consent",
  "transfer_consent_at",
  "transfer_consent_version",
  "transfer_recipient",
  "partner_transfer",
  "partner_scope",
  "consent_policy_version",
  "partner_handoff_ready",
  "intake_mode",
] as const;

function pickConsentEvidence(
  metadata: unknown
): Record<string, unknown> {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return {};
  }
  const src = metadata as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const key of CONSENT_EVIDENCE_KEYS) {
    if (key in src) out[key] = src[key];
  }
  return out;
}

function newRunId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `ret_${Date.now().toString(36)}`;
  }
}

export async function runPrivacyRetentionCleanup(
  supabase: SupabaseClient,
  options: RetentionCleanupOptions = {}
): Promise<RetentionCleanupResult> {
  const dryRun = options.dryRun === true;
  const cutoffIso = new Date().toISOString();
  const result: RetentionCleanupResult = {
    dryRun,
    runId: options.runId ?? newRunId(),
    scanned: 0,
    anonymized: 0,
    skipped: 0,
    technicalLogsDeleted: 0,
    candidateIds: [],
    candidateCount: 0,
    cutoffIso,
    technicalLogsWouldDelete: 0,
    errors: [],
  };

  let query = supabase
    .from("leads")
    .select(
      "id, retention_until, legal_hold, active_case, deleted_at, marketing_consent, metadata"
    )
    .is("deleted_at", null)
    .eq("legal_hold", false)
    .eq("active_case", false)
    .not("retention_until", "is", null)
    .lt("retention_until", cutoffIso)
    .limit(200);

  if (options.onlyLeadId) {
    query = query.eq("id", options.onlyLeadId);
  }

  const { data: rows, error } = await query;

  if (error) {
    result.errors.push(`leads select: ${error.message}`);
    return result;
  }

  const expired = (rows ?? []).filter((row) => {
    // Defense in depth: if marketing consent still active, only clean when
    // retention_until already elapsed (query) — still allow anonymize after window.
    // Misconfigured rows with marketing_consent true but no retention are already excluded.
    void row.marketing_consent;
    if (options.onlyLeadId) {
      const meta =
        row.metadata && typeof row.metadata === "object"
          ? (row.metadata as Record<string, unknown>)
          : {};
      const marker = meta.test_marker ?? meta.synthetic_marker ?? meta.e2e_marker;
      if (!isSyntheticRetentionMarker(marker)) {
        result.skipped += 1;
        result.errors.push("onlyLeadId rejected: missing synthetic test marker");
        return false;
      }
    }
    return true;
  });

  result.scanned = expired.length;
  result.candidateIds = expired.map((row) => String(row.id));
  result.candidateCount = result.candidateIds.length;

  if (dryRun) {
    const logCutoff = new Date(
      Date.now() - privacyRetention.technicalLogDays * 24 * 60 * 60 * 1000
    ).toISOString();

    const { count, error: pipeErr } = await supabase
      .from("pipeline_runs")
      .select("id", { count: "exact", head: true })
      .lt("created_at", logCutoff);

    if (pipeErr) {
      if (!/relation|does not exist|schema cache/i.test(pipeErr.message)) {
        result.errors.push(`pipeline_runs: ${pipeErr.message}`);
      }
    } else {
      result.technicalLogsWouldDelete = count ?? 0;
    }

    return result;
  }

  for (const row of expired) {
    const consentEvidence = pickConsentEvidence(row.metadata);
    const { error: updErr } = await supabase
      .from("leads")
      .update({
        name: ANON_NAME,
        email: ANON_EMAIL,
        phone: null,
        notes: null,
        metadata: {
          ...consentEvidence,
          retention_cleanup: true,
          anonymized_at: cutoffIso,
          prior_id_kept: true,
          retention_run_id: result.runId,
        },
        deleted_at: cutoffIso,
        updated_at: cutoffIso,
        marketing_consent: false,
        marketing_consent_withdrawn_at: cutoffIso,
      })
      .eq("id", row.id)
      .is("deleted_at", null)
      .eq("legal_hold", false)
      .eq("active_case", false);

    if (updErr) {
      // Do not echo lead UUID into durable error strings for cron HTTP responses.
      result.errors.push(`lead update failed: ${updErr.message}`);
      result.skipped += 1;
    } else {
      result.anonymized += 1;
    }
  }

  // When scoped to a single synthetic lead, do not touch technical logs.
  if (options.onlyLeadId) {
    return result;
  }

  const logCutoff = new Date(
    Date.now() - privacyRetention.technicalLogDays * 24 * 60 * 60 * 1000
  ).toISOString();

  const { error: pipeErr, count } = await supabase
    .from("pipeline_runs")
    .delete({ count: "exact" })
    .lt("created_at", logCutoff);

  if (pipeErr) {
    if (!/relation|does not exist|schema cache/i.test(pipeErr.message)) {
      result.errors.push(`pipeline_runs: ${pipeErr.message}`);
    }
  } else {
    result.technicalLogsDeleted = count ?? 0;
  }

  return result;
}

/** Public-safe JSON body for cron HTTP responses (counts only). */
export function retentionResultPublicJson(result: RetentionCleanupResult) {
  return {
    ok: result.errors.length === 0,
    dryRun: result.dryRun,
    runId: result.runId,
    cutoffIso: result.cutoffIso,
    scanned: result.scanned,
    anonymized: result.anonymized,
    skipped: result.skipped,
    candidateCount: result.candidateCount,
    technicalLogsDeleted: result.technicalLogsDeleted,
    technicalLogsWouldDelete: result.technicalLogsWouldDelete,
    errorCount: result.errors.length,
    // Category-only error snippets (no PII); truncate.
    errors: result.errors.slice(0, 5).map((e) => e.slice(0, 120)),
  };
}
