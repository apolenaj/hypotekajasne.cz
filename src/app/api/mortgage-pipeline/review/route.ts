import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { approveStagingProduct } from "@/lib/mortgage-pipeline";

export const runtime = "nodejs";

function getSupabaseAdmin() {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  url = url.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
  if (!url || !key) {
    throw new Error("Chybí Supabase credentials");
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
 * Manuální approve / reject staging produktu.
 * POST { pipelineRunId, productId, approve, reviewedBy?, notes? }
 */
export async function POST(request: Request) {
  if (!authorize(request)) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      pipelineRunId?: string;
      productId?: string;
      approve?: boolean;
      reviewedBy?: string;
      notes?: string;
    };

    if (!body.pipelineRunId || !body.productId || typeof body.approve !== "boolean") {
      return NextResponse.json(
        { success: false, error: "Vyžadováno: pipelineRunId, productId, approve" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const result = await approveStagingProduct(supabase, {
      pipelineRunId: body.pipelineRunId,
      productId: body.productId,
      approve: body.approve,
      reviewedBy: body.reviewedBy ?? "operator",
      notes: body.notes,
    });

    if (!result.ok) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      action: body.approve ? "approved" : "rejected",
      productId: body.productId,
      pipelineRunId: body.pipelineRunId,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Review selhal";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/** Seznam pending staging + otevřené alerty */
export async function GET(request: Request) {
  if (!authorize(request)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data: staging } = await supabase
    .from("mortgage_products_staging")
    .select("*")
    .eq("review_status", "pending")
    .order("created_at", { ascending: false })
    .limit(100);

  const { data: alerts } = await supabase
    .from("pipeline_alerts")
    .select("*")
    .eq("acknowledged", false)
    .order("created_at", { ascending: false })
    .limit(100);

  return NextResponse.json({
    success: true,
    pending: staging ?? [],
    alerts: alerts ?? [],
  });
}
