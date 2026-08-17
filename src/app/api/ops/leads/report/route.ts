import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { authorizeLeadOpsRequest } from "@/lib/leads-ops";
import {
  aggregateLeadFunnel,
  isLeadLifecycleStatus,
  type LeadLifecycleStatus,
} from "@/lib/leads-lifecycle";

export const runtime = "nodejs";

function getSupabaseAdmin() {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  url = url.replace(/\/rest\/v1\/?$/i, "").replace(/\/$/, "");
  if (!url || !key) {
    throw new Error("Missing Supabase credentials");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Internal aggregate funnel/revenue report — no PII, Bearer auth required.
 * Query: ?from=ISO&to=ISO (optional)
 */
export async function GET(request: Request) {
  if (!authorizeLeadOpsRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  try {
    const supabase = getSupabaseAdmin();
    let query = supabase
      .from("leads")
      .select(
        "lifecycle_status, page_intent, utm_source, expected_revenue_amount, realized_revenue_amount, realized_at"
      )
      .is("deleted_at", null)
      .limit(5000);

    if (from) query = query.gte("created_at", from);
    if (to) query = query.lte("created_at", to);

    const { data, error } = await query;
    if (error) {
      // Columns may be missing before migration — return empty aggregate.
      if (/column|schema cache|does not exist/i.test(error.message)) {
        return NextResponse.json({
          ok: true,
          rows: [],
          note: "lifecycle_columns_missing",
        });
      }
      return NextResponse.json({ error: "Query failed" }, { status: 502 });
    }

    const normalized = (data ?? []).map((row) => ({
      lifecycle_status: (isLeadLifecycleStatus(row.lifecycle_status)
        ? row.lifecycle_status
        : "new") as LeadLifecycleStatus,
      page_intent:
        typeof row.page_intent === "string" ? row.page_intent : null,
      utm_source: typeof row.utm_source === "string" ? row.utm_source : null,
      expected_revenue_amount:
        row.expected_revenue_amount == null
          ? null
          : Number(row.expected_revenue_amount),
      realized_revenue_amount:
        row.realized_revenue_amount == null
          ? null
          : Number(row.realized_revenue_amount),
      realized_at:
        typeof row.realized_at === "string" ? row.realized_at : null,
    }));

    const rows = aggregateLeadFunnel(normalized);
    const totals = {
      leads: normalized.length,
      contacted: normalized.filter((r) => r.lifecycle_status === "contacted")
        .length,
      qualified: normalized.filter((r) => r.lifecycle_status === "qualified")
        .length,
      appointments: normalized.filter(
        (r) => r.lifecycle_status === "appointment"
      ).length,
      applications: normalized.filter(
        (r) => r.lifecycle_status === "application"
      ).length,
      approved: normalized.filter((r) => r.lifecycle_status === "approved")
        .length,
      funded: normalized.filter((r) => r.lifecycle_status === "funded").length,
      lost: normalized.filter((r) => r.lifecycle_status === "lost").length,
      realized_revenue: normalized.reduce((sum, r) => {
        if (r.realized_revenue_amount != null && r.realized_at) {
          return sum + r.realized_revenue_amount;
        }
        return sum;
      }, 0),
    };

    return NextResponse.json({ ok: true, totals, rows });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
