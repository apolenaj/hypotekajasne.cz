import { NextResponse } from "next/server";
import { buildFinancingHandoff } from "@/lib/majetio/affordability";
import {
  FINANCING_HANDOFF_CONTRACT_VERSION,
  PROPERTY_DETAIL_WIDGETS,
  type FinancingHandoffRequest,
} from "@/lib/majetio/contracts";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    version: FINANCING_HANDOFF_CONTRACT_VERSION,
    widget: PROPERTY_DETAIL_WIDGETS.calculateFinancing,
    method: "POST",
    body: {
      propertyId: "string",
      priceCzk: "number",
      country: "string?",
      purpose: "string?",
      attribution: {
        llid: "string?",
        ref: "string?",
        utm_source: "string?",
        utm_campaign: "string?",
      },
    },
    safeParams: ["price", "country", "purpose", "listing_ref", "utm_*", "llid", "ref"],
    note: "BETA handoff — no PII exchanged.",
  });
}

export async function POST(request: Request) {
  let body: FinancingHandoffRequest;
  try {
    body = (await request.json()) as FinancingHandoffRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body?.propertyId || !(body.priceCzk > 0)) {
    return NextResponse.json(
      { error: "propertyId and priceCzk > 0 required" },
      { status: 400 }
    );
  }

  const result = buildFinancingHandoff(body);
  return NextResponse.json({
    contractVersion: FINANCING_HANDOFF_CONTRACT_VERSION,
    ...result,
  });
}
