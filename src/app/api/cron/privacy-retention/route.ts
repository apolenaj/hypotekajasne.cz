import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { runPrivacyRetentionCleanup } from "@/lib/legal/retention-cleanup";
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
 * Logs aggregate counts only — no personal data.
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

  try {
    const supabase = getSupabaseAdmin();
    const result = await runPrivacyRetentionCleanup(supabase);
    console.info("[privacy-retention]", {
      scanned: result.scanned,
      anonymized: result.anonymized,
      skipped: result.skipped,
      technicalLogsDeleted: result.technicalLogsDeleted,
      errorCount: result.errors.length,
    });
    return NextResponse.json({
      ok: result.errors.length === 0,
      scanned: result.scanned,
      anonymized: result.anonymized,
      skipped: result.skipped,
      technicalLogsDeleted: result.technicalLogsDeleted,
      errors: result.errors.slice(0, 5),
    });
  } catch (err) {
    console.error("[privacy-retention] failed", err);
    return NextResponse.json(
      { error: "Retention cleanup failed" },
      { status: 500 }
    );
  }
}
