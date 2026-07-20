import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    status: "BETA",
    version: 1,
    method: "POST",
    scoreIsolation: "Payment does NOT affect investment score — enforced server-side in production.",
    body: {
      orgId: "string",
      propertySubmissionId: "string",
      planId: "single_analysis | package_starter | package_pro",
      memberId: "string",
    },
    note: "BETA: orders in browser localStorage. Server persistence COMING_SOON.",
  });
}

export async function POST(request: Request) {
  let body: {
    orgId?: string;
    propertySubmissionId?: string;
    planId?: string;
    memberId?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.orgId || !body.propertySubmissionId) {
    return NextResponse.json(
      { error: "orgId and propertySubmissionId required" },
      { status: 400 }
    );
  }

  return NextResponse.json(
    {
      status: "QUEUED",
      message: "Objednávka přijata — BETA zpracování v klientovi.",
      orderId: `ord_bridge_${Date.now().toString(36)}`,
    },
    { status: 202 }
  );
}
