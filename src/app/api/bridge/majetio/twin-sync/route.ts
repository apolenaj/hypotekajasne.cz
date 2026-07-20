import { NextResponse } from "next/server";
import {
  DIGITAL_TWIN_BLUEPRINT,
  DIGITAL_TWIN_FEATURE_STATUS,
  MAJETIO_TWIN_SYNC_PATH,
} from "@/lib/digital-twin/architecture";

/**
 * Majetio → Digital Twin sync contract (documentation endpoint).
 * No silent value backfill — observations require source metadata.
 */
export async function GET() {
  return NextResponse.json({
    status: DIGITAL_TWIN_FEATURE_STATUS,
    path: MAJETIO_TWIN_SYNC_PATH,
    blueprint: DIGITAL_TWIN_BLUEPRINT,
    valuePolicy: DIGITAL_TWIN_BLUEPRINT.valueObservationPolicy,
    message:
      "Twin sync is COMING_SOON. HJ will not invent current market values.",
  });
}

export async function POST() {
  return NextResponse.json(
    {
      status: DIGITAL_TWIN_FEATURE_STATUS,
      ok: false,
      error:
        "Digital Twin sync is COMING_SOON. Value observations are not accepted yet.",
    },
    { status: 503 }
  );
}
