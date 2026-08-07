/**
 * Privacy retention cleanup — anonymize expired ordinary enquiries.
 * Invoked by /api/cron/privacy-retention (Vercel cron + CRON_SECRET).
 *
 * Rules:
 * - skip legal_hold
 * - skip active_case
 * - skip already deleted_at
 * - only rows with retention_until < now()
 * - anonymize PII; do not keep unnecessary personal data in cleanup logs
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { privacyRetention } from "@/lib/legal/privacy-retention";

export type RetentionCleanupResult = {
  scanned: number;
  anonymized: number;
  skipped: number;
  technicalLogsDeleted: number;
  errors: string[];
};

const ANON_NAME = "[anonymized]";
const ANON_EMAIL = "anonymized@invalid.local";

export async function runPrivacyRetentionCleanup(
  supabase: SupabaseClient
): Promise<RetentionCleanupResult> {
  const result: RetentionCleanupResult = {
    scanned: 0,
    anonymized: 0,
    skipped: 0,
    technicalLogsDeleted: 0,
    errors: [],
  };

  const nowIso = new Date().toISOString();

  const { data: rows, error } = await supabase
    .from("leads")
    .select("id, retention_until, legal_hold, active_case, deleted_at")
    .is("deleted_at", null)
    .eq("legal_hold", false)
    .eq("active_case", false)
    .not("retention_until", "is", null)
    .lt("retention_until", nowIso)
    .limit(200);

  if (error) {
    // Columns may be missing before migration — surface clearly.
    result.errors.push(`leads select: ${error.message}`);
    return result;
  }

  const expired = rows ?? [];
  result.scanned = expired.length;

  for (const row of expired) {
    const { error: updErr } = await supabase
      .from("leads")
      .update({
        name: ANON_NAME,
        email: ANON_EMAIL,
        phone: null,
        notes: null,
        metadata: {
          retention_cleanup: true,
          anonymized_at: nowIso,
          prior_id_kept: true,
        },
        deleted_at: nowIso,
        updated_at: nowIso,
        marketing_consent: false,
        marketing_consent_withdrawn_at: nowIso,
      })
      .eq("id", row.id)
      .is("deleted_at", null)
      .eq("legal_hold", false)
      .eq("active_case", false);

    if (updErr) {
      result.errors.push(`lead ${row.id}: ${updErr.message}`);
      result.skipped += 1;
    } else {
      result.anonymized += 1;
    }
  }

  // Technical scrape logs (no personal enquiry PII) — best-effort.
  const logCutoff = new Date(
    Date.now() - privacyRetention.technicalLogDays * 24 * 60 * 60 * 1000
  ).toISOString();

  const { error: pipeErr, count } = await supabase
    .from("pipeline_runs")
    .delete({ count: "exact" })
    .lt("created_at", logCutoff);

  if (pipeErr) {
    // Table may not exist in every environment.
    if (!/relation|does not exist|schema cache/i.test(pipeErr.message)) {
      result.errors.push(`pipeline_runs: ${pipeErr.message}`);
    }
  } else {
    result.technicalLogsDeleted = count ?? 0;
  }

  return result;
}
