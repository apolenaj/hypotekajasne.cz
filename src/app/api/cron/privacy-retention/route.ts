import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  retentionResultPublicJson,
  runPrivacyRetentionCleanup,
} from "@/lib/legal/retention-cleanup";
import { privacyRetention } from "@/lib/legal/privacy-retention";

export const runtime = "nodejs";
export const maxDuration = 60;

function getSupabaseAdmin() {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  url = url.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
  if (!url || !key) {
    throw new Error("Chybí NEXT_PUBLIC_SUPABASE_URL nebo SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function authorize(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  return authHeader === `Bearer ${cronSecret}`;
}

/**
 * Scheduled retention cleanup.
 * Logs aggregate counts only — no personal data / no secret.
 *
 * Safe preview (no writes):
 *   GET /api/cron/privacy-retention?dryRun=true
 *   Authorization: Bearer $CRON_SECRET
 *
 * Controlled synthetic-only delete (manual ops):
 *   GET /api/cron/privacy-retention?onlyLeadId=<uuid>
 *   Lead must carry metadata.test_marker matching phase_6_2_*
 */
export async function GET(request: Request) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!privacyRetention.cleanupScheduledInCron) {
    return NextResponse.json({
      ok: false,
      skipped: true,
      reason: "cleanupScheduledInCron is false",
    });
  }

  const url = new URL(request.url);
  const dryRun = url.searchParams.get("dryRun") === "true";
  const onlyLeadId = url.searchParams.get("onlyLeadId")?.trim() || undefined;

  try {
    const supabase = getSupabaseAdmin();
    const result = await runPrivacyRetentionCleanup(supabase, {
      dryRun,
      onlyLeadId,
    });
    console.info("[privacy-retention]", {
      runId: result.runId,
      dryRun: result.dryRun,
      cutoffIso: result.cutoffIso,
      scanned: result.scanned,
      anonymized: result.anonymized,
      skipped: result.skipped,
      technicalLogsDeleted: result.technicalLogsDeleted,
      technicalLogsWouldDelete: result.technicalLogsWouldDelete,
      candidateCount: result.candidateCount,
      errorCount: result.errors.length,
      status: result.errors.length === 0 ? "ok" : "error",
    });
    return NextResponse.json(retentionResultPublicJson(result));
  } catch {
    console.error("[privacy-retention] failed", {
      status: "error",
      errorCategory: "unhandled",
    });
    return NextResponse.json(
      { error: "Retention cleanup failed" },
      { status: 500 }
    );
  }
}
