import { NextResponse } from "next/server";
import { getMortgageRateFromSupabase } from "@/lib/rates/mortgageRateService.server";
import {
  isMortgagePurpose,
  type MortgagePurpose,
} from "@/lib/mortgage-rates/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public orientational mortgage rate read API.
 * Does not expose internal notes or privileged fields.
 *
 * GET /api/rates/mortgage?country=CZ&purpose=purchase&fixation=3&ltv=75
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const country = (url.searchParams.get("country") ?? "CZ").trim();
  const purposeRaw = (url.searchParams.get("purpose") ?? "purchase").trim();
  const fixationRaw = url.searchParams.get("fixation");
  const ltvRaw = url.searchParams.get("ltv");

  if (!isMortgagePurpose(purposeRaw)) {
    return NextResponse.json(
      { error: "Invalid purpose. Allowed: purchase, refinance, investment." },
      { status: 400 }
    );
  }

  const fixationYears = fixationRaw == null ? 5 : Number(fixationRaw);
  const ltv = ltvRaw == null ? 80 : Number(ltvRaw);

  if (!Number.isFinite(fixationYears) || fixationYears <= 0) {
    return NextResponse.json(
      { error: "Invalid fixation. Expected positive number of years." },
      { status: 400 }
    );
  }
  if (!Number.isFinite(ltv) || ltv < 0 || ltv > 100) {
    return NextResponse.json(
      { error: "Invalid ltv. Expected 0–100." },
      { status: 400 }
    );
  }

  const result = await getMortgageRateFromSupabase({
    countryCode: country,
    purpose: purposeRaw as MortgagePurpose,
    fixationYears,
    ltv,
  });

  return NextResponse.json(
    {
      rate: result.rate,
      rateKind: result.rateKind,
      fixationYears: result.fixationYears,
      ltvRange: {
        min: result.ltvMin,
        max: result.ltvMax,
      },
      checkedAt: result.checkedAt,
      freshness: result.freshness,
      source: result.source,
      sourceName: result.sourceName,
      // Intentionally omit: notes, selectionError, raw ids, privileged fields
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    }
  );
}
