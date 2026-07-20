import { NextResponse } from "next/server";
import { evaluateAffordability } from "@/lib/majetio/affordability";
import {
  AFFORDABILITY_CONTRACT_VERSION,
  PROPERTY_DETAIL_WIDGETS,
  type AffordabilityCheckRequest,
} from "@/lib/majetio/contracts";

export const runtime = "nodejs";

/** Contract discovery (SSR/docs clients). */
export async function GET() {
  return NextResponse.json({
    version: AFFORDABILITY_CONTRACT_VERSION,
    widget: PROPERTY_DETAIL_WIDGETS.canIAfford,
    method: "POST",
    body: {
      propertyId: "string",
      priceCzk: "number",
      country: "string?",
      passport: {
        safePropertyBudget: "number?",
        maxEstimatedBankBudget: "number?",
        ownFunds: "number?",
        safeMonthlyPayment: "number?",
        purpose: "string?",
      },
      attribution: {
        llid: "string?",
        ref: "string?",
        utm_source: "string?",
        utm_campaign: "string?",
      },
    },
    note: "Status COMING_SOON on Majetio UI; HJ endpoint is ready for integration tests.",
  });
}

export async function POST(request: Request) {
  let body: AffordabilityCheckRequest;
  try {
    body = (await request.json()) as AffordabilityCheckRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body?.propertyId || !(body.priceCzk > 0)) {
    return NextResponse.json(
      { error: "propertyId and priceCzk > 0 required" },
      { status: 400 }
    );
  }

  const result = evaluateAffordability(body);
  return NextResponse.json({
    contractVersion: AFFORDABILITY_CONTRACT_VERSION,
    ...result,
  });
}
