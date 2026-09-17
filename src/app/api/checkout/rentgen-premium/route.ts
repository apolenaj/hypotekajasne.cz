/**
 * POST /api/checkout/rentgen-premium
 * Stripe Checkout Session for Komplexní Investiční Rentgen (4 990 Kč).
 */

import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import Stripe from "stripe";
import { CANONICAL_PREMIUM_ANALYSIS_PRICE_CZK } from "@/lib/property-rentgen/pricing";
import {
  buildRentgenCheckoutMetadata,
  RENTGEN_PREMIUM_PRODUCT_CODE,
  type RentgenCheckoutPropertySnapshot,
} from "@/lib/property-rentgen/checkout-metadata";
import { PRODUCTION_ORIGIN } from "@/lib/seo/site";

export const runtime = "nodejs";
export const maxDuration = 30;

const PRODUCT_NAME = "Komplexní Investiční Rentgen";
const PRODUCT_DESCRIPTION = "Hloubková datová analýza a PDF report";

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error("Chybí STRIPE_SECRET_KEY.");
  }
  return new Stripe(key, { typescript: true });
}

function baseUrl(): string {
  const fromBase = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "").trim();
  if (fromBase) return fromBase;
  const fromSite = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "").trim();
  if (fromSite) return fromSite;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return PRODUCTION_ORIGIN;
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

/**
 * Accepts either flat body or `{ property: {...} }` from the dashboard.
 */
function parsePropertyPayload(
  raw: Record<string, unknown>
): RentgenCheckoutPropertySnapshot | { error: string } {
  const p =
    raw.property && typeof raw.property === "object"
      ? (raw.property as Record<string, unknown>)
      : raw;

  const purchasePriceCzk = asNumber(
    p.purchasePriceCzk ?? p.priceCzk ?? p.cena
  );
  const monthlyGrossRentCzk = asNumber(
    p.monthlyGrossRentCzk ?? p.monthlyRentCzk ?? p.rentMonthlyCzk ?? p.najem
  );
  const ownFundsCzk = asNumber(p.ownFundsCzk ?? p.equityCzk ?? p.vlastniProstredky);
  const annualRatePercent = asNumber(
    p.annualRatePercent ?? p.interestRatePercent ?? p.sazba
  );

  if (purchasePriceCzk == null || purchasePriceCzk <= 0) {
    return { error: "Chybí platná cena nemovitosti (purchasePriceCzk)." };
  }
  if (monthlyGrossRentCzk == null || monthlyGrossRentCzk < 0) {
    return { error: "Chybí měsíční nájem (monthlyGrossRentCzk)." };
  }
  if (ownFundsCzk == null || ownFundsCzk < 0) {
    return { error: "Chybí vlastní prostředky (ownFundsCzk)." };
  }
  if (annualRatePercent == null || annualRatePercent < 0) {
    return { error: "Chybí modelová sazba (annualRatePercent)." };
  }

  return {
    label: typeof p.label === "string" ? p.label : undefined,
    address:
      typeof p.address === "string"
        ? p.address
        : typeof p.adresa === "string"
          ? p.adresa
          : undefined,
    city: typeof p.city === "string" ? p.city : undefined,
    areaM2: asNumber(p.areaM2 ?? p.plochaM2 ?? p.m2),
    purchasePriceCzk,
    monthlyGrossRentCzk,
    capexCzk: asNumber(p.capexCzk) ?? 0,
    closingCostsCzk: asNumber(p.closingCostsCzk) ?? 0,
    monthlyOperatingCostsCzk: asNumber(p.monthlyOperatingCostsCzk) ?? 0,
    monthlyReserveCzk: asNumber(p.monthlyReserveCzk) ?? 0,
    vacancyRate: asNumber(p.vacancyRate) ?? 0.05,
    ownFundsCzk,
    loanAmountCzk: asNumber(p.loanAmountCzk),
    annualRatePercent,
    termYears: asNumber(p.termYears) ?? 30,
    fixationYears: asNumber(p.fixationYears) ?? 5,
  };
}

export async function GET() {
  return NextResponse.json({
    status: "ready",
    method: "POST",
    product: PRODUCT_NAME,
    amountCzk: CANONICAL_PREMIUM_ANALYSIS_PRICE_CZK,
    currency: "CZK",
    success_url: `${baseUrl()}/investicni-rentgen?success=true`,
    cancel_url: `${baseUrl()}/investicni-rentgen?canceled=true`,
  });
}

export async function POST(request: Request) {
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
  const property = parsePropertyPayload(body);
  if ("error" in property) {
    return NextResponse.json({ error: property.error }, { status: 400 });
  }

  const reportId =
    typeof body.reportId === "string" && body.reportId.trim()
      ? body.reportId.trim()
      : randomUUID();

  const customerEmail =
    typeof body.customerEmail === "string" && body.customerEmail.includes("@")
      ? body.customerEmail.trim().toLowerCase()
      : undefined;

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

  // Full POST snapshot for webhook (Stripe value ≤ 500 chars).
  const propertyDataJson = structuredMeta.auditJson;

  const origin = baseUrl();
  const success_url = `${origin}/investicni-rentgen?success=true`;
  const cancel_url = `${origin}/investicni-rentgen?canceled=true`;
  const unitAmount = Math.round(CANONICAL_PREMIUM_ANALYSIS_PRICE_CZK * 100);

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: customerEmail,
      success_url,
      cancel_url,
      locale: "cs",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "czk",
            unit_amount: unitAmount,
            product_data: {
              name: PRODUCT_NAME,
              description: PRODUCT_DESCRIPTION,
            },
          },
        },
      ],
      metadata: {
        product: RENTGEN_PREMIUM_PRODUCT_CODE,
        reportId: structuredMeta.reportId,
        // JSON string of property params (webhook reads auditJson / propertyData)
        propertyData: propertyDataJson,
        auditJson: propertyDataJson,
        purchasePriceCzk: structuredMeta.purchasePriceCzk,
        areaM2: structuredMeta.areaM2,
        address: structuredMeta.address,
        monthlyRentCzk: structuredMeta.monthlyRentCzk,
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe nevrátil checkout URL." },
        { status: 502 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Stripe error";
    const missingKey = /STRIPE_SECRET_KEY/i.test(message);
    console.error("[checkout/rentgen-premium]", message);
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
