/**
 * POST /api/checkout/rentgen
 *
 * Creates DRAFT order → Stripe Checkout Session (hosted).
 * Amount and Price ID are server-authoritative.
 */

import { NextResponse } from "next/server";
import {
  buildRentgenCheckoutMetadata,
  type RentgenCheckoutPropertySnapshot,
} from "@/lib/property-rentgen/checkout-metadata";
import {
  checkoutBaseUrl,
  parseEmail,
  parsePropertyPayload,
} from "@/lib/property-rentgen/checkout-parse";
import { isPaidAnalysisCommerciallyAvailable } from "@/lib/legal/operator";
import {
  createDraftOrder,
  getOrderByAccess,
  getOrderById,
  updateOrder,
  type InvestmentAnalysisOrderRow,
} from "@/lib/property-rentgen/orders";
import {
  buildServerStripeLineItem,
  getProductOrThrow,
  normalizeProductCode,
  PRODUCT_CODE,
} from "@/lib/property-rentgen/products";
import { getStripe } from "@/lib/stripe/client";

export const runtime = "nodejs";
export const maxDuration = 30;

type UtmBody = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  referrer?: string;
};

function asUtm(raw: unknown): UtmBody | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  const pick = (k: string) =>
    typeof o[k] === "string" ? (o[k] as string).slice(0, 200) : undefined;
  return {
    utm_source: pick("utm_source"),
    utm_medium: pick("utm_medium"),
    utm_campaign: pick("utm_campaign"),
    utm_content: pick("utm_content"),
    utm_term: pick("utm_term"),
    referrer: pick("referrer"),
  };
}

function alreadyPaidResponse(order: InvestmentAnalysisOrderRow) {
  return NextResponse.json(
    {
      error: "Objednávka je již uhrazená.",
      code: "ALREADY_PAID",
      publicId: order.public_id,
    },
    { status: 409 }
  );
}

function isPaidLike(status: string): boolean {
  return (
    status === "PAID" ||
    status === "PROCESSING" ||
    status === "READY" ||
    status === "AWAITING_DOCUMENTS"
  );
}

function labelFromProperty(property: RentgenCheckoutPropertySnapshot): string {
  return (
    property.label ||
    property.address ||
    property.city ||
    (property.areaM2
      ? `Nemovitost ${Math.round(property.areaM2)} m²`
      : "Nemovitost")
  );
}

export async function GET() {
  return NextResponse.json({
    status: "ready",
    method: "POST",
    products: [PRODUCT_CODE.INVESTMENT_XRAY, PRODUCT_CODE.INDIVIDUAL_ANALYSIS],
    commerciallyActive: isPaidAnalysisCommerciallyAvailable(),
  });
}

export async function POST(request: Request) {
  if (!isPaidAnalysisCommerciallyAvailable()) {
    return NextResponse.json(
      {
        error:
          "Online nákup zatím není spuštěný. Zanechte poptávku na stránce Investičního rentgenu.",
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
    typeof body.productCode === "string"
      ? body.productCode
      : typeof body.product === "string"
        ? body.product
        : "";
  const productCode = normalizeProductCode(productRaw);
  if (!productCode) {
    return NextResponse.json(
      { error: "Neplatný productCode.", code: "INVALID_PRODUCT" },
      { status: 400 }
    );
  }

  let product;
  try {
    product = getProductOrThrow(productCode);
  } catch {
    return NextResponse.json(
      { error: "Neplatný productCode.", code: "INVALID_PRODUCT" },
      { status: 400 }
    );
  }

  const resumePublicId =
    typeof body.resumePublicId === "string" ? body.resumePublicId.trim() : "";
  const resumeAccess =
    typeof body.resumeAccess === "string" ? body.resumeAccess.trim() : "";
  const orderIdRaw =
    typeof body.orderId === "string" && body.orderId.trim()
      ? body.orderId.trim()
      : null;

  let order: InvestmentAnalysisOrderRow | null = null;
  let property: RentgenCheckoutPropertySnapshot;

  try {
    if (resumePublicId && resumeAccess) {
      const existing = await getOrderByAccess(resumePublicId, resumeAccess);
      if (!existing) {
        return NextResponse.json(
          { error: "Objednávka nenalezena." },
          { status: 404 }
        );
      }
      if (isPaidLike(existing.status)) return alreadyPaidResponse(existing);
      order = existing;
      const resumed = parsePropertyPayload(
        existing.input_snapshot as Record<string, unknown>
      );
      if ("error" in resumed) {
        return NextResponse.json({ error: resumed.error }, { status: 400 });
      }
      property = resumed;
    } else if (orderIdRaw) {
      const existing = await getOrderById(orderIdRaw);
      if (!existing) {
        return NextResponse.json(
          { error: "Objednávka nenalezena." },
          { status: 404 }
        );
      }
      if (isPaidLike(existing.status)) return alreadyPaidResponse(existing);
      order = existing;
      const fromBody = parsePropertyPayload(body);
      if (!("error" in fromBody)) {
        property = fromBody;
      } else {
        const fromStore = parsePropertyPayload(
          existing.input_snapshot as Record<string, unknown>
        );
        if ("error" in fromStore) {
          return NextResponse.json({ error: fromStore.error }, { status: 400 });
        }
        property = fromStore;
      }
    } else {
      const fromBody = parsePropertyPayload(body);
      if ("error" in fromBody) {
        return NextResponse.json({ error: fromBody.error }, { status: 400 });
      }
      property = fromBody;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "DB error";
    console.error("[checkout/rentgen] load order", message);
    return NextResponse.json(
      {
        error:
          "Objednávku se nepodařilo načíst. Ověřte tabulku investment_analysis_orders v Supabase.",
        detail: process.env.NODE_ENV === "development" ? message : undefined,
      },
      { status: 503 }
    );
  }

  const email =
    parseEmail(body.email ?? body.customerEmail) ||
    parseEmail(order?.email) ||
    null;
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
        : order?.customer_name || undefined;
  const phone =
    typeof body.phone === "string"
      ? body.phone.trim().slice(0, 40)
      : order?.phone || undefined;

  const billingType =
    body.billingType === "company" ? "company" : ("person" as const);
  const billingCompanyName =
    typeof body.billingCompanyName === "string"
      ? body.billingCompanyName.trim().slice(0, 200)
      : undefined;
  const billingIco =
    typeof body.billingIco === "string"
      ? body.billingIco.trim().slice(0, 20)
      : undefined;
  const billingDic =
    typeof body.billingDic === "string"
      ? body.billingDic.trim().slice(0, 20)
      : undefined;
  const billingAddress =
    typeof body.billingAddress === "string"
      ? body.billingAddress.trim().slice(0, 300)
      : undefined;

  if (billingType === "company" && !billingCompanyName) {
    return NextResponse.json(
      { error: "Pro firmu zadejte název společnosti." },
      { status: 400 }
    );
  }

  const propertyLabel = labelFromProperty(property);

  try {
    if (!order) {
      order = await createDraftOrder({
        productCode: product.code,
        amountExpectedCzk: product.amountCzk,
        email,
        phone,
        customerName,
        billingType,
        billingCompanyName,
        billingIco,
        billingDic,
        billingAddress,
        propertyLabel,
        inputSnapshot: {
          ...property,
          productCode: product.code,
        },
        sourceUrl:
          typeof body.sourceUrl === "string"
            ? body.sourceUrl.slice(0, 500)
            : undefined,
        utm: asUtm(body.utm ?? body),
      });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "DB error";
    console.error("[checkout/rentgen] draft order", message);
    return NextResponse.json(
      {
        error:
          "Objednávku se nepodařilo uložit. Ověřte, že je v Supabase nasazená tabulka investment_analysis_orders.",
        detail: process.env.NODE_ENV === "development" ? message : undefined,
      },
      { status: 503 }
    );
  }

  const reportId = order.report_id || order.id;
  let structuredMeta;
  try {
    structuredMeta = buildRentgenCheckoutMetadata(property, reportId);
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Metadata se nepodařilo sestavit.",
      },
      { status: 400 }
    );
  }

  const origin = checkoutBaseUrl();
  const success_url = `${origin}/investicni-rentgen/dekujeme?session_id={CHECKOUT_SESSION_ID}`;
  const cancel_url = `${origin}/investicni-rentgen/objednavka?order=${encodeURIComponent(order.public_id)}&access=${encodeURIComponent(order.access_token)}&canceled=1`;

  const line = buildServerStripeLineItem(product);
  const lineItems =
    line.kind === "price"
      ? [{ quantity: 1 as const, price: line.priceId }]
      : [
          {
            quantity: 1 as const,
            price_data: {
              currency: "czk" as const,
              unit_amount: line.unitAmountHalere,
              product_data: {
                name: line.name,
                description: line.description,
              },
            },
          },
        ];

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      success_url,
      cancel_url,
      locale: "cs",
      client_reference_id: order.id,
      line_items: lineItems,
      metadata: {
        orderId: order.id,
        publicId: order.public_id,
        productCode: product.code,
        product:
          product.code === PRODUCT_CODE.INDIVIDUAL_ANALYSIS
            ? "rentgen_premium"
            : product.code,
        reportId: structuredMeta.reportId,
        propertyData: structuredMeta.auditJson,
        auditJson: structuredMeta.auditJson,
        purchasePriceCzk: structuredMeta.purchasePriceCzk,
        areaM2: structuredMeta.areaM2,
        address: structuredMeta.address,
        monthlyRentCzk: structuredMeta.monthlyRentCzk,
        environment:
          process.env.VERCEL_ENV === "production" ? "production" : "test",
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe nevrátil checkout URL." },
        { status: 502 }
      );
    }

    await updateOrder(order.id, {
      status: "CHECKOUT_CREATED",
      stripe_checkout_session_id: session.id,
      stripe_price_id: line.kind === "price" ? line.priceId : null,
      report_id: structuredMeta.reportId,
      email,
      customer_name: customerName ?? order.customer_name,
      phone: phone ?? order.phone,
      property_label: propertyLabel,
      input_snapshot: {
        ...property,
        productCode: product.code,
      },
    });

    return NextResponse.json({
      url: session.url,
      orderId: order.id,
      publicId: order.public_id,
      accessToken: order.access_token,
      amountCzk: product.amountCzk,
      productCode: product.code,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Stripe error";
    const missingKey = /STRIPE_SECRET_KEY/i.test(message);
    console.error("[checkout/rentgen]", message);
    return NextResponse.json(
      {
        error: missingKey
          ? "Platební brána není nakonfigurovaná (STRIPE_SECRET_KEY)."
          : "Vytvoření Checkout Session selhalo.",
        detail: process.env.NODE_ENV === "development" ? message : undefined,
      },
      { status: missingKey ? 503 : 500 }
    );
  }
}
