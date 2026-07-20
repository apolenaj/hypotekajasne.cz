import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    status: "COMING_SOON",
    version: 1,
    method: "POST",
    body: {
      dealRoomId: "string",
      workspaceVersion: "number",
      timelineSnapshot: "TimelineStep[]",
      attribution: { llid: "string?", ref: "string?" },
    },
    note: "Majetio ↔ Deal Room sync — metadata only, no document binary.",
    roles: [
      "user",
      "hypoteka_jasne",
      "majetio",
      "mortgage_specialist",
      "agent_developer",
      "lawyer",
    ],
  });
}

export async function POST() {
  return NextResponse.json(
    {
      status: "COMING_SOON",
      message: "Deal Room sync not yet live — workspace stored locally (BETA).",
    },
    { status: 503 }
  );
}
