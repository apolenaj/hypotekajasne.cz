import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  RATE_LIVE_MAX_AGE_MS,
  ageMsFromIso,
} from "@/lib/rates/freshness-policy";
import { MODEL_FALLBACK_RATE_PERCENT } from "@/lib/rates/model-fallback";
import {
  getRatePipelineTelemetry,
  type RatesHealthPayload,
} from "@/lib/rates/pipeline";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Secure health/debug for mortgage rate pipeline.
 * Auth: Authorization: Bearer CRON_SECRET
 *    or Authorization: Bearer RATE_HEALTH_SECRET (optional dedicated token)
 * Never public — no invented LIVE rates in response.
 */
function authorize(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;
  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) return false;

  const cron = process.env.CRON_SECRET?.trim();
  const health = process.env.RATE_HEALTH_SECRET?.trim();
  if (cron && token === cron) return true;
  if (health && token === health) return true;
  return false;
}

function getSupabaseAdmin() {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  url = url.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function GET(request: Request) {
  if (!authorize(request)) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 }
    );
  }

  const checkedAt = new Date().toISOString();
  const telemetry = getRatePipelineTelemetry();
  const store: RatesHealthPayload["store"] = {
    currentRatesUpdatedAt: null,
    bankRatesCount: null,
    bankRatesFreshCount: null,
    lastSuccessfulUpdate: telemetry.lastSuccessfulFetchAt,
    error: null,
  };

  const admin = getSupabaseAdmin();
  if (!admin) {
    store.error = "missing_supabase_admin_env";
  } else {
    try {
      const nowMs = Date.now();
      const { data: current, error: currentErr } = await admin
        .from("current_rates")
        .select("updated_at, rate_with_insurance")
        .eq("id", 1)
        .maybeSingle();

      if (currentErr) {
        store.error = currentErr.message;
      } else if (current) {
        store.currentRatesUpdatedAt = current.updated_at
          ? String(current.updated_at)
          : null;
        if (store.currentRatesUpdatedAt) {
          store.lastSuccessfulUpdate =
            store.lastSuccessfulUpdate ?? store.currentRatesUpdatedAt;
        }
      }

      const { data: banks, error: banksErr } = await admin
        .from("bank_rates")
        .select("updated_at, rate_with_insurance");

      if (banksErr) {
        store.error = store.error
          ? `${store.error}; ${banksErr.message}`
          : banksErr.message;
      } else {
        const rows = banks ?? [];
        store.bankRatesCount = rows.length;
        store.bankRatesFreshCount = rows.filter((r) => {
          const age = ageMsFromIso(
            r.updated_at ? String(r.updated_at) : null,
            nowMs
          );
          return (
            age != null &&
            age <= RATE_LIVE_MAX_AGE_MS &&
            r.rate_with_insurance != null
          );
        }).length;
      }
    } catch (err) {
      store.error = err instanceof Error ? err.message : "health_query_failed";
    }
  }

  const liveFresh =
    store.currentRatesUpdatedAt != null &&
    (ageMsFromIso(store.currentRatesUpdatedAt) ?? Infinity) <=
      RATE_LIVE_MAX_AGE_MS;

  const payload: RatesHealthPayload = {
    ok: store.error == null && (liveFresh || (store.bankRatesFreshCount ?? 0) > 0),
    checkedAt,
    liveMaxAgeHours: RATE_LIVE_MAX_AGE_MS / (60 * 60 * 1000),
    modelFallbackPercent: MODEL_FALLBACK_RATE_PERCENT,
    telemetry,
    store,
  };

  return NextResponse.json(payload, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
