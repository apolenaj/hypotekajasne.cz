import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: {
    analysisOrderId?: string;
    orgId?: string;
    eventType?: string;
    anonymousViewerHash?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.analysisOrderId || !body.eventType) {
    return NextResponse.json(
      { error: "analysisOrderId and eventType required" },
      { status: 400 }
    );
  }

  return NextResponse.json({
    status: "RECORDED",
    message: "Anonymized engagement — no PII stored.",
    eventId: `eng_bridge_${Date.now().toString(36)}`,
  });
}
