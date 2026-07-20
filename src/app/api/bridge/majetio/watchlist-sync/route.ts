import { NextResponse } from "next/server";
import {
  MAJETIO_WATCH_SYNC_BLUEPRINT,
  MAJETIO_WATCH_SYNC_STATUS,
} from "@/lib/watchlist/majetio-sync";

/**
 * Majetio watchlist sync — contract documentation endpoint.
 * POST body acceptance is COMING_SOON (no silent fake processing).
 */
export async function GET() {
  return NextResponse.json({
    status: MAJETIO_WATCH_SYNC_STATUS,
    blueprint: MAJETIO_WATCH_SYNC_BLUEPRINT,
    message:
      "Inbound observation sync is not live. HJ will not invent similar listings.",
  });
}

export async function POST() {
  return NextResponse.json(
    {
      status: MAJETIO_WATCH_SYNC_STATUS,
      ok: false,
      error:
        "Watchlist sync is COMING_SOON. Observations are not accepted yet.",
    },
    { status: 503 }
  );
}
