import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** Server-side report share — production persistence (BETA: client localStorage) */
export async function GET() {
  return NextResponse.json({
    status: "COMING_SOON",
    version: 1,
    method: "POST",
    note: "BETA: share grants stored in browser localStorage. Server sync planned for B2B.",
    body: {
      reportId: "string",
      expiresInHours: "number",
      password: "string | null",
      allowSensitive: "boolean default false",
      whiteLabel: "WhiteLabelConfig | null",
    },
  });
}

export async function POST(request: Request) {
  let body: {
    reportId?: string;
    expiresInHours?: number;
    password?: string | null;
    allowSensitive?: boolean;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.reportId) {
    return NextResponse.json({ error: "reportId required" }, { status: 400 });
  }

  return NextResponse.json(
    {
      status: "COMING_SOON",
      message: "Server-side share sync není v BETA aktivní — použijte Report Engine UI.",
    },
    { status: 503 }
  );
}
