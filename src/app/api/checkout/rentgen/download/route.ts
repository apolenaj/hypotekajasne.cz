/**
 * GET /api/checkout/rentgen/download
 * Authorized PDF download via publicId + accessToken (not session_id alone).
 */

import { NextResponse } from "next/server";
import { getOrderByAccess } from "@/lib/property-rentgen/orders";
import {
  getSupabaseAdminForRentgen,
  PREMIUM_RENTGEN_STORAGE_BUCKET,
} from "@/lib/property-rentgen/premium-audit-storage";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const publicId = url.searchParams.get("order")?.trim();
  const access = url.searchParams.get("access")?.trim();

  if (!publicId || !access) {
    return NextResponse.json({ error: "Chybí oprávnění." }, { status: 401 });
  }

  let order;
  try {
    order = await getOrderByAccess(publicId, access);
  } catch (err) {
    console.error("[download]", err);
    return NextResponse.json({ error: "Služba nedostupná." }, { status: 503 });
  }

  if (!order) {
    return NextResponse.json({ error: "Neplatný odkaz." }, { status: 403 });
  }

  if (
    order.status !== "READY" &&
    order.status !== "AWAITING_DOCUMENTS" &&
    order.status !== "PROCESSING"
  ) {
    return NextResponse.json(
      { error: "Výstup ještě není připraven." },
      { status: 409 }
    );
  }

  if (!order.storage_path) {
    return NextResponse.json(
      { error: "Soubor zatím není k dispozici." },
      { status: 404 }
    );
  }

  try {
    const supabase = getSupabaseAdminForRentgen();
    const { data, error } = await supabase.storage
      .from(PREMIUM_RENTGEN_STORAGE_BUCKET)
      .createSignedUrl(order.storage_path, 60 * 15);

    if (error || !data?.signedUrl) {
      return NextResponse.json(
        { error: "Odkaz ke stažení se nepodařilo vytvořit." },
        { status: 502 }
      );
    }

    return NextResponse.redirect(data.signedUrl, 302);
  } catch (err) {
    console.error("[download] signed url", err);
    return NextResponse.json({ error: "Chyba úložiště." }, { status: 503 });
  }
}
