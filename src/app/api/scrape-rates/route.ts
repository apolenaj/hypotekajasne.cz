import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { scrapeAllBanks, type ScrapedBankRate } from "@/lib/scrape/bank-scrapers";
import { isValidMortgagePair } from "@/lib/scrape/parse-rate";

export const runtime = "nodejs";
export const maxDuration = 60;

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Chybí NEXT_PUBLIC_SUPABASE_URL nebo SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function authorize(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  return authHeader === `Bearer ${cronSecret}`;
}

function isValidScrapedBank(row: ScrapedBankRate): boolean {
  return (
    typeof row.rateWithInsurance === "number" &&
    Number.isFinite(row.rateWithInsurance) &&
    typeof row.rpsnWithInsurance === "number" &&
    Number.isFinite(row.rpsnWithInsurance) &&
    typeof row.rateWithoutInsurance === "number" &&
    Number.isFinite(row.rateWithoutInsurance) &&
    typeof row.rpsnWithoutInsurance === "number" &&
    Number.isFinite(row.rpsnWithoutInsurance) &&
    isValidMortgagePair(row.rateWithInsurance, row.rpsnWithInsurance) &&
    row.rateWithoutInsurance >= row.rateWithInsurance
  );
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    const e = error as { message: string; code?: string; details?: string; hint?: string };
    return [e.message, e.code, e.details, e.hint].filter(Boolean).join(" | ");
  }
  try {
    return JSON.stringify(error);
  } catch {
    return "Neznámá chyba scrapování";
  }
}

export async function GET(request: Request) {
  if (!authorize(request)) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { success, failures } = await scrapeAllBanks();
    const validBanks: ScrapedBankRate[] = [];
    const allFailures = [...failures];

    for (const row of success) {
      if (isValidScrapedBank(row)) {
        validBanks.push(row);
      } else {
        allFailures.push({
          id: row.id,
          bankName: row.bankName,
          error: `${row.bankName}: neplatná nebo chybějící sazba/RPSN (with=${String(row.rateWithInsurance)}/${String(row.rpsnWithInsurance)}, without=${String(row.rateWithoutInsurance)}/${String(row.rpsnWithoutInsurance)})`,
        });
      }
    }

    const scrapedAt = new Date().toISOString();
    let saved = 0;

    if (validBanks.length > 0) {
      const supabase = getSupabaseAdmin();

      // Inzerovaná sazba = s pojištěním; bez pojištění z DOM nebo +0.2 % fallback
      const upserts = validBanks.map((row) => ({
        id: row.id,
        bank_name: row.bankName,
        rate: row.rateWithInsurance,
        rpsn: row.rpsnWithInsurance,
        rate_with_insurance: row.rateWithInsurance,
        rate_without_insurance: row.rateWithoutInsurance,
        rpsn_with_insurance: row.rpsnWithInsurance,
        rpsn_without_insurance: row.rpsnWithoutInsurance,
        source_url: row.sourceUrl,
        updated_at: scrapedAt,
      }));

      const { error } = await supabase.from("bank_rates").upsert(upserts, {
        onConflict: "id",
      });
      if (error) throw error;

      saved = validBanks.length;

      const primary = validBanks[0];
      const { error: aggregateError } = await supabase.from("current_rates").upsert(
        {
          id: 1,
          rate_with_insurance: primary.rateWithInsurance,
          rate_without_insurance: primary.rateWithoutInsurance,
          rpsn_with_insurance: primary.rpsnWithInsurance,
          rpsn_without_insurance: primary.rpsnWithoutInsurance,
          updated_at: scrapedAt,
        },
        { onConflict: "id" }
      );
      if (aggregateError) {
        console.error("current_rates upsert warning:", aggregateError.message);
      }
    }

    return NextResponse.json({
      success: true,
      scrapedAt,
      saved,
      banks: validBanks,
      failures: allFailures,
    });
  } catch (error: unknown) {
    console.error("scrape-rates error:", error);
    return NextResponse.json(
      { success: false, error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

/** Manuální spuštění (stejná auth jako GET). */
export async function POST(request: Request) {
  return GET(request);
}
