import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** Share handoff contract — consent validated client-side; server stores token in production */
export async function GET() {
  return NextResponse.json({
    status: "BETA",
    version: 1,
    method: "POST",
    requiredConsent:
      "Souhlasím se sdílením vybraných dokumentů s licencovaným specialistou za účelem posouzení hypotéky.",
    body: {
      consentId: "string",
      handoffToken: "string",
      documentCount: "number",
      expiresAt: "ISO string",
    },
    note: "No document content in POST — only consent metadata and refs.",
  });
}

export async function POST(request: Request) {
  let body: {
    consentId?: string;
    handoffToken?: string;
    documentCount?: number;
    expiresAt?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.consentId || !body.handoffToken) {
    return NextResponse.json(
      { error: "consentId and handoffToken required" },
      { status: 400 }
    );
  }

  return NextResponse.json({
    status: "QUEUED",
    message: "Handoff přijat — specialista obdrží odkaz bez obsahu dokumentů (BETA).",
    consentId: body.consentId,
    specialistNotified: false,
  });
}
