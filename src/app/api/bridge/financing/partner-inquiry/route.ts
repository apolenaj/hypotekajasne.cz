import { NextResponse } from "next/server";
import {
  buildPartnerInquiryPayload,
  FINANCING_PARTNER_REGISTRY,
  findPartnerSlot,
} from "@/lib/global-financing/partners";
import type { CountryId } from "@/lib/calculators";
import type { FinancingRoutePathId } from "@/lib/global-financing/types";

export const runtime = "nodejs";

type PartnerInquiryRequest = {
  slotId?: string;
  routeId: string;
  propertyCountry: CountryId;
  pathType: FinancingRoutePathId;
  residency: string;
  purpose: string;
  purchasePrice: number;
};

export async function GET() {
  return NextResponse.json({
    status: "COMING_SOON",
    version: 1,
    registry: FINANCING_PARTNER_REGISTRY.map((s) => ({
      id: s.id,
      countryScope: s.countryScope,
      routeTypes: s.routeTypes,
      integrationStatus: s.integrationStatus,
      marketplaceReady: s.marketplaceReady,
    })),
    note: "Partner marketplace inquiry — BETA stub. No PII in payload.",
  });
}

export async function POST(request: Request) {
  let body: PartnerInquiryRequest;
  try {
    body = (await request.json()) as PartnerInquiryRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const slot =
    (body.slotId
      ? FINANCING_PARTNER_REGISTRY.find((s) => s.id === body.slotId)
      : null) ??
    findPartnerSlot({
      propertyCountry: body.propertyCountry,
      pathType: body.pathType,
    });

  if (!slot) {
    return NextResponse.json(
      { error: "No partner slot", message: "Partner zatím není integrován." },
      { status: 503 }
    );
  }

  if (slot.integrationStatus === "NOT_INTEGRATED") {
    return NextResponse.json(
      {
        status: "NOT_INTEGRATED",
        message:
          "Financování dostupné individuálně – partner zatím není integrován.",
        slotId: slot.id,
        marketplaceReady: slot.marketplaceReady,
      },
      { status: 503 }
    );
  }

  const payload = buildPartnerInquiryPayload({
    slot,
    routeId: body.routeId,
    propertyCountry: body.propertyCountry,
    pathType: body.pathType,
    residency: body.residency,
    purpose: body.purpose,
    purchasePrice: body.purchasePrice,
  });

  return NextResponse.json({
    status: "QUEUED",
    message: "Poptávka přijata — specialisté budou kontaktovat ručně (BETA).",
    payload,
    slotId: slot.id,
  });
}
