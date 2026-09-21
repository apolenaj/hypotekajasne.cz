import { NextResponse } from "next/server";
import { getPublishedCatalogOffers } from "@/lib/mortgage-market/published-catalog-offers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Normalized mortgage-market catalog offers for /sazby client filter reloads.
 * Same SoT as SSR /sazby: audited CZ manifest catalog (not Supabase rows).
 *
 * GET /api/mortgage-market/offers?country=CZ&purpose=purchase&fixationMonths=36&ltv=75
 * Optional: lender, product, productType, borrowerScope, pricingScenarioKey, includeLtvUnspecified=1
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const countryCode = (url.searchParams.get("country") ?? "CZ").trim();
  const purpose = url.searchParams.get("purpose")?.trim() || undefined;
  const lenderSlug = url.searchParams.get("lender")?.trim() || undefined;
  const productSlug = url.searchParams.get("product")?.trim() || undefined;
  const productType = url.searchParams.get("productType")?.trim() || undefined;
  const borrowerScope =
    url.searchParams.get("borrowerScope")?.trim() || undefined;
  const pricingScenarioKey =
    url.searchParams.get("pricingScenarioKey")?.trim() || undefined;

  const fixationRaw = url.searchParams.get("fixationMonths");
  const ltvRaw = url.searchParams.get("ltv");
  const includeLtvUnspecified =
    url.searchParams.get("includeLtvUnspecified") === "1" ||
    url.searchParams.get("includeLtvUnspecified") === "true";

  let fixationMonths: number | undefined;
  if (fixationRaw != null && fixationRaw !== "") {
    fixationMonths = Number(fixationRaw);
    if (!Number.isFinite(fixationMonths) || fixationMonths <= 0) {
      return NextResponse.json(
        { error: "Invalid fixationMonths. Expected positive months." },
        { status: 400 }
      );
    }
  }

  let ltv: number | undefined;
  if (ltvRaw != null && ltvRaw !== "") {
    ltv = Number(ltvRaw);
    if (!Number.isFinite(ltv) || ltv < 0 || ltv > 100) {
      return NextResponse.json(
        { error: "Invalid ltv. Expected 0–100." },
        { status: 400 }
      );
    }
  }

  const result = getPublishedCatalogOffers({
    countryCode,
    purpose,
    fixationMonths,
    ltv,
    lenderSlug,
    productSlug,
    productType,
    borrowerScope,
    pricingScenarioKey,
    includeLtvUnspecified,
  });

  return NextResponse.json(
    {
      offers: result.offers,
      unspecifiedLtvOffers: result.unspecifiedLtvOffers,
      lenderAvailability: result.lenderAvailability,
      usedModelFallback: result.usedModelFallback,
    },
    {
      headers: {
        "Cache-Control": "private, no-store",
      },
    }
  );
}
