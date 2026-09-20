/**
 * POST /api/checkout/rentgen/photos — upload property photo for a DRAFT order
 * DELETE /api/checkout/rentgen/photos — remove photo from order + storage
 */

import { NextResponse } from "next/server";
import { isPaidAnalysisCommerciallyAvailable } from "@/lib/legal/operator";
import {
  getOrderByAccess,
  getOrderById,
  updateOrder,
  type InvestmentAnalysisOrderRow,
} from "@/lib/property-rentgen/orders";
import {
  deleteOrderPhotoObject,
  uploadOrderPhoto,
} from "@/lib/property-rentgen/order-photos";
import {
  isAllowedPhotoMime,
  RENTGEN_PHOTO_MAX_BYTES,
  RENTGEN_PHOTO_MAX_COUNT,
  type RentgenOrderPhotoRef,
} from "@/lib/property-rentgen/order-property";

export const runtime = "nodejs";
export const maxDuration = 60;

function photosFromOrder(
  order: InvestmentAnalysisOrderRow
): RentgenOrderPhotoRef[] {
  const raw = (order.input_snapshot as { photos?: unknown })?.photos;
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (p): p is RentgenOrderPhotoRef =>
      Boolean(p) &&
      typeof p === "object" &&
      typeof (p as RentgenOrderPhotoRef).id === "string" &&
      typeof (p as RentgenOrderPhotoRef).storageKey === "string"
  );
}

async function resolveOrder(args: {
  orderId?: string | null;
  publicId?: string | null;
  accessToken?: string | null;
}): Promise<InvestmentAnalysisOrderRow | null> {
  if (args.publicId && args.accessToken) {
    return getOrderByAccess(args.publicId, args.accessToken);
  }
  if (args.orderId && args.accessToken) {
    const order = await getOrderById(args.orderId);
    if (!order) return null;
    if (order.access_token !== args.accessToken) return null;
    return order;
  }
  return null;
}

export async function POST(request: Request) {
  if (!isPaidAnalysisCommerciallyAvailable()) {
    return NextResponse.json(
      { error: "Platební brána není připravená." },
      { status: 503 }
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Neplatný upload." }, { status: 400 });
  }

  const orderId = String(form.get("orderId") || "").trim() || null;
  const publicId = String(form.get("publicId") || "").trim() || null;
  const accessToken = String(form.get("accessToken") || "").trim() || null;
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Chybí soubor fotografie." },
      { status: 400 }
    );
  }

  const mimeType = (file.type || "").toLowerCase();
  if (!isAllowedPhotoMime(mimeType)) {
    return NextResponse.json(
      { error: "Povolené formáty jsou JPG, PNG a WEBP." },
      { status: 400 }
    );
  }
  if (file.size <= 0 || file.size > RENTGEN_PHOTO_MAX_BYTES) {
    return NextResponse.json(
      {
        error: `Maximální velikost jedné fotografie je ${Math.round(RENTGEN_PHOTO_MAX_BYTES / (1024 * 1024))} MB.`,
      },
      { status: 400 }
    );
  }

  let order: InvestmentAnalysisOrderRow | null;
  try {
    order = await resolveOrder({ orderId, publicId, accessToken });
  } catch (err) {
    console.error("[photos] resolve", err);
    return NextResponse.json(
      { error: "Objednávku se nepodařilo načíst." },
      { status: 503 }
    );
  }

  if (!order) {
    return NextResponse.json(
      { error: "Objednávka nenalezena nebo neplatný přístup." },
      { status: 404 }
    );
  }
  if (
    order.status === "PAID" ||
    order.status === "PROCESSING" ||
    order.status === "READY"
  ) {
    return NextResponse.json(
      { error: "Fotografie již nelze měnit u uhrazené objednávky." },
      { status: 409 }
    );
  }

  const existing = photosFromOrder(order);
  if (existing.length >= RENTGEN_PHOTO_MAX_COUNT) {
    return NextResponse.json(
      { error: `Maximálně ${RENTGEN_PHOTO_MAX_COUNT} fotografií.` },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  try {
    const photo = await uploadOrderPhoto({
      orderId: order.id,
      buffer,
      mimeType,
      originalName: file.name || "photo.jpg",
      position: existing.length,
    });
    const photos = [...existing, photo];
    const updated = await updateOrder(order.id, {
      input_snapshot: {
        ...order.input_snapshot,
        photos,
      },
    });
    return NextResponse.json({
      photo,
      photoCount: photos.length,
      orderId: updated.id,
      publicId: updated.public_id,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    console.error("[photos] upload", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  if (!isPaidAnalysisCommerciallyAvailable()) {
    return NextResponse.json(
      { error: "Platební brána není připravená." },
      { status: 503 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const photoId =
    typeof body.photoId === "string" ? body.photoId.trim() : "";
  const orderId =
    typeof body.orderId === "string" ? body.orderId.trim() : null;
  const publicId =
    typeof body.publicId === "string" ? body.publicId.trim() : null;
  const accessToken =
    typeof body.accessToken === "string" ? body.accessToken.trim() : null;

  if (!photoId) {
    return NextResponse.json({ error: "Chybí photoId." }, { status: 400 });
  }

  const order = await resolveOrder({ orderId, publicId, accessToken });
  if (!order) {
    return NextResponse.json(
      { error: "Objednávka nenalezena nebo neplatný přístup." },
      { status: 404 }
    );
  }

  const existing = photosFromOrder(order);
  const target = existing.find((p) => p.id === photoId);
  if (!target) {
    return NextResponse.json(
      { error: "Fotografie nenalezena." },
      { status: 404 }
    );
  }

  try {
    await deleteOrderPhotoObject(target.storageKey);
  } catch (err) {
    console.error("[photos] delete object", err);
  }

  const photos = existing
    .filter((p) => p.id !== photoId)
    .map((p, i) => ({ ...p, position: i }));

  await updateOrder(order.id, {
    input_snapshot: {
      ...order.input_snapshot,
      photos,
    },
  });

  return NextResponse.json({ ok: true, photoCount: photos.length, photos });
}
