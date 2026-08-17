import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  authorizeLeadOpsRequest,
  logLeadOps,
} from "@/lib/leads-ops";
import {
  canTransitionLifecycle,
  isLeadLifecycleStatus,
  revenueFieldsForTransition,
  type LeadLifecycleStatus,
  type LeadRevenueStatus,
  type RevenuePatch,
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

type Body = {
  toStatus?: string;
  reason?: string;
  actorSource?: string;
  expectedRevenueAmount?: number | null;
  realizedRevenueAmount?: number | null;
  revenueCurrency?: string;
  realizedAt?: string | null;
  revenueStatus?: string;
};

/**
 * Internal ops-only lifecycle transition.
 * Not publicly callable without Bearer LEAD_OPS_API_SECRET or CRON_SECRET.
 */
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!authorizeLeadOpsRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: "Invalid lead id" }, { status: 400 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isLeadLifecycleStatus(body.toStatus)) {
    return NextResponse.json({ error: "Invalid toStatus" }, { status: 400 });
  }
  const toStatus = body.toStatus as LeadLifecycleStatus;

  const patch: RevenuePatch = {
    expectedRevenueAmount: body.expectedRevenueAmount,
    realizedRevenueAmount: body.realizedRevenueAmount,
    revenueCurrency: body.revenueCurrency,
    realizedAt: body.realizedAt,
    revenueStatus: body.revenueStatus as LeadRevenueStatus | undefined,
  };

  const revenue = revenueFieldsForTransition({ toStatus, patch });
  if (revenue.error) {
    return NextResponse.json({ error: revenue.error }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data: current, error: findErr } = await supabase
      .from("leads")
      .select(
        "id, lifecycle_status, expected_revenue_amount, realized_revenue_amount, realized_at, revenue_status"
      )
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle();

    if (findErr) {
      logLeadOps({
        event: "lead_lifecycle_error",
        leadId: id,
        errorCode: "select_failed",
      });
      return NextResponse.json({ error: "Lead lookup failed" }, { status: 502 });
    }
    if (!current) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const fromStatus = isLeadLifecycleStatus(current.lifecycle_status)
      ? current.lifecycle_status
      : "new";

    if (!canTransitionLifecycle(fromStatus, toStatus)) {
      logLeadOps({
        event: "lead_lifecycle_error",
        leadId: id,
        fromStatus,
        toStatus,
        errorCode: "invalid_transition",
      });
      return NextResponse.json(
        { error: "Invalid lifecycle transition" },
        { status: 400 }
      );
    }

    const nowIso = new Date().toISOString();
    const updateRow: Record<string, unknown> = {
      lifecycle_status: toStatus,
      updated_at: nowIso,
      last_interaction_at: nowIso,
    };
    if (revenue.expected_revenue_amount !== undefined) {
      updateRow.expected_revenue_amount = revenue.expected_revenue_amount;
    }
    if (revenue.realized_revenue_amount !== undefined) {
      updateRow.realized_revenue_amount = revenue.realized_revenue_amount;
    }
    if (revenue.revenue_currency !== undefined) {
      updateRow.revenue_currency = revenue.revenue_currency;
    }
    if (revenue.realized_at !== undefined) {
      updateRow.realized_at = revenue.realized_at;
    }
    if (revenue.revenue_status !== undefined) {
      updateRow.revenue_status = revenue.revenue_status;
    }

    const { error: updErr } = await supabase
      .from("leads")
      .update(updateRow)
      .eq("id", id);

    if (updErr) {
      logLeadOps({
        event: "lead_lifecycle_error",
        leadId: id,
        fromStatus,
        toStatus,
        errorCode: "update_failed",
      });
      return NextResponse.json({ error: "Update failed" }, { status: 502 });
    }

    const actorSource =
      typeof body.actorSource === "string" && body.actorSource.trim()
        ? body.actorSource.trim().slice(0, 64)
        : "ops_api";
    const reason =
      typeof body.reason === "string" ? body.reason.trim().slice(0, 200) : null;

    const { error: histErr } = await supabase.from("lead_lifecycle_events").insert({
      lead_id: id,
      from_status: fromStatus,
      to_status: toStatus,
      changed_at: nowIso,
      actor_source: actorSource,
      reason,
      metadata: {},
    });

    if (histErr) {
      // History failure should not invent success — surface error; lead already updated.
      logLeadOps({
        event: "lead_lifecycle_error",
        leadId: id,
        fromStatus,
        toStatus,
        errorCode: "history_insert_failed",
      });
      return NextResponse.json(
        {
          ok: true,
          warning: "lifecycle_updated_history_failed",
          fromStatus,
          toStatus,
        },
        { status: 200 }
      );
    }

    logLeadOps({
      event: "lead_lifecycle_ok",
      leadId: id,
      fromStatus,
      toStatus,
    });

    return NextResponse.json({
      ok: true,
      fromStatus,
      toStatus,
      revenueStatus: updateRow.revenue_status ?? current.revenue_status,
      realizedRevenueAmount:
        updateRow.realized_revenue_amount !== undefined
          ? updateRow.realized_revenue_amount
          : current.realized_revenue_amount,
    });
  } catch {
    logLeadOps({
      event: "lead_lifecycle_error",
      leadId: id,
      errorCode: "unhandled",
    });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/** Public GET is denied — funnel aggregates use service role / ops auth only. */
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
