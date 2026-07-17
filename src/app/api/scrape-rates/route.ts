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
    typeof row.rate === "number" &&
    Number.isFinite(row.rate) &&
    typeof row.rpsn === "number" &&
    Number.isFinite(row.rpsn) &&
    isValidMortgagePair(row.rate, row.rpsn)
  );
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }
  return "Neznámá chyba scrapování";
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
          error: `${row.bankName}: neplatná nebo chybějící sazba/RPSN (rate=${String(row.rate)}, rpsn=${String(row.rpsn)})`,
        });
      }
    }

    const scrapedAt = new Date().toISOString();
    let saved = 0;

    if (validBanks.length > 0) {
      const supabase = getSupabaseAdmin();

      const upserts = validBanks.map((row) => ({
        id: row.id,
        bank_name: row.bankName,
        rate: row.rate,
        rpsn: row.rpsn,
        rate_with_insurance: row.rate,
        rate_without_insurance: row.rate,
        rpsn_with_insurance: row.rpsn,
        rpsn_without_insurance: row.rpsn,
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
          rate_with_insurance: primary.rate,
          rate_without_insurance: primary.rate,
          rpsn_with_insurance: primary.rpsn,
          rpsn_without_insurance: primary.rpsn,
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
