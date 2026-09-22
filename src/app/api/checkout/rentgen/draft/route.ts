/**
 * POST /api/checkout/rentgen/draft
 * Creates or updates a DRAFT order with full property snapshot (no Stripe yet).
 */

import { NextResponse } from "next/server";
import {
  parseEmail,
  parseOrderInputSnapshot,
} from "@/lib/property-rentgen/checkout-parse";
import { isPaidAnalysisCommerciallyAvailable } from "@/lib/legal/operator";
import {
  createDraftOrder,
  getOrderByAccess,
  getOrderById,
  updateOrder,
} from "@/lib/property-rentgen/orders";
import {
  getProductOrThrow,
  normalizeProductCode,
} from "@/lib/property-rentgen/products";
import { buildPropertyAddressLine } from "@/lib/property-rentgen/order-property";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  if (!isPaidAnalysisCommerciallyAvailable()) {
    return NextResponse.json(
      {
        error: "Platební brána není připravená.",
        code: "CHECKOUT_NOT_LIVE",
      },
      { status: 503 }
    );
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!raw || typeof raw !== "object") {
    return NextResponse.json({ error: "Neplatné tělo požadavku." }, { status: 400 });
  }
  const body = raw as Record<string, unknown>;

  const productRaw =
    typeof body.productCode === "string" ? body.productCode : "";
  const productCode = normalizeProductCode(productRaw);
  if (!productCode) {
    return NextResponse.json(
      { error: "Neplatný productCode." },
      { status: 400 }
    );
  }
  const product = getProductOrThrow(productCode);

  const email = parseEmail(body.email ?? body.customerEmail);
  if (!email) {
    return NextResponse.json(
      { error: "Zadejte platný e-mail." },
      { status: 400 }
    );
  }
  const customerName =
    typeof body.name === "string"
      ? body.name.trim().slice(0, 120)
      : typeof body.customerName === "string"
        ? body.customerName.trim().slice(0, 120)
        : undefined;
  const phone =
    typeof body.phone === "string" ? body.phone.trim().slice(0, 40) : undefined;

  if (!customerName || customerName.length < 2) {
    return NextResponse.json({ error: "Zadejte jméno." }, { status: 400 });
  }

  const isPremium = product.code === "INDIVIDUAL_ANALYSIS";
  if (isPremium && (!phone || phone.length < 6)) {
    return NextResponse.json(
      { error: "Zadejte telefonní číslo." },
      { status: 400 }
    );
  }

  const snapshot = parseOrderInputSnapshot(body, {
    requireIdentity: true,
    requireDescription: isPremium,
  });
  if ("error" in snapshot) {
    return NextResponse.json({ error: snapshot.error }, { status: 400 });
  }

  if (
    product.code === "INVESTMENT_XRAY" &&
    (snapshot.areaM2 == null || !(snapshot.areaM2 > 0))
  ) {
    return NextResponse.json(
      { error: "Zadejte podlahovou plochu." },
      { status: 400 }
    );
  }

  const photosFromBody = Array.isArray(
    (body.property as { photos?: unknown } | undefined)?.photos
  )
    ? (body.property as { photos: unknown }).photos
    : body.photos;
  if (Array.isArray(photosFromBody)) {
    snapshot.photos = snapshot.photos; // already parsed inside
  }

  // Photo rule: without listing URL require ≥1 photo already on draft (may upload after).
  const listingOk = Boolean(snapshot.listingUrl);
  const photoCount = snapshot.photos?.length ?? 0;
  if (!listingOk && photoCount < 1 && body.requirePhotos === true) {
    return NextResponse.json(
      {
        error:
          "Nahrajte alespoň jednu fotografii objektu, nebo vložte odkaz na inzerát.",
      },
      { status: 400 }
    );
  }

  const propertyLabel =
    snapshot.propertyAddress ||
    buildPropertyAddressLine({
      street: snapshot.street,
      city: snapshot.city,
      postalCode: snapshot.postalCode,
    }) ||
    snapshot.city ||
    "Nemovitost";

  const orderIdRaw =
    typeof body.orderId === "string" && body.orderId.trim()
      ? body.orderId.trim()
      : null;
  const resumePublicId =
    typeof body.resumePublicId === "string" ? body.resumePublicId.trim() : "";
  const resumeAccess =
    typeof body.resumeAccess === "string" ? body.resumeAccess.trim() : "";

  try {
    let order = null;
    if (resumePublicId && resumeAccess) {
      order = await getOrderByAccess(resumePublicId, resumeAccess);
    } else if (orderIdRaw) {
      order = await getOrderById(orderIdRaw);
    }

    if (order) {
      if (
        order.status === "PAID" ||
        order.status === "PROCESSING" ||
        order.status === "READY" ||
        order.status === "AWAITING_DOCUMENTS"
      ) {
        return NextResponse.json(
          { error: "Objednávka je již uhrazená.", code: "ALREADY_PAID" },
          { status: 409 }
        );
      }
      const existingPhotos =
        (order.input_snapshot as { photos?: unknown })?.photos;
      const mergedPhotos =
        snapshot.photos && snapshot.photos.length > 0
          ? snapshot.photos
          : Array.isArray(existingPhotos)
            ? existingPhotos
            : [];

      order = await updateOrder(order.id, {
        email,
        phone,
        customer_name: customerName,
        product_code: product.code,
        amount_expected_czk: product.amountCzk,
        property_label: propertyLabel,
        input_snapshot: {
          ...snapshot,
          photos: mergedPhotos,
          productCode: product.code,
        },
        status: "DRAFT",
      });
    } else {
      order = await createDraftOrder({
        productCode: product.code,
        amountExpectedCzk: product.amountCzk,
        email,
        phone,
        customerName,
        propertyLabel,
        inputSnapshot: {
          ...snapshot,
          productCode: product.code,
        },
        sourceUrl:
          typeof body.sourceUrl === "string"
            ? body.sourceUrl.slice(0, 500)
            : undefined,
      });
    }

    return NextResponse.json({
      orderId: order.id,
      publicId: order.public_id,
      accessToken: order.access_token,
      amountCzk: product.amountCzk,
      productCode: product.code,
      photoCount: Array.isArray(
        (order.input_snapshot as { photos?: unknown }).photos
      )
        ? ((order.input_snapshot as { photos: unknown[] }).photos.length)
        : 0,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "DB error";
    console.error("[checkout/rentgen/draft]", message);
    return NextResponse.json(
      {
        error:
          "Objednávku se nepodařilo uložit. Ověřte tabulku investment_analysis_orders.",
        detail: process.env.NODE_ENV === "development" ? message : undefined,
      },
      { status: 503 }
    );
  }
}
