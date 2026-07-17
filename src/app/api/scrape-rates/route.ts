import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { scrapeAllBanks } from "@/lib/scrape/bank-scrapers";

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

export async function GET(request: Request) {
  if (!authorize(request)) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { success, failures } = await scrapeAllBanks();
    const supabase = getSupabaseAdmin();
    const scrapedAt = new Date().toISOString();

    const upserts = success.map((row) => ({
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

    if (upserts.length > 0) {
      const { error } = await supabase.from("bank_rates").upsert(upserts, {
        onConflict: "id",
      });
      if (error) throw error;

      // Agregát pro pojištění / shrnutí — z první úspěšně scrapované banky
      // (typicky Česká spořitelna, pokud prošla).
      const primary = success[0];
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
      saved: success.length,
      banks: success,
      failures,
    });
  } catch (error: unknown) {
    console.error("scrape-rates error:", error);
    const message =
      error instanceof Error ? error.message : "Neznámá chyba scrapování";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

/** Manuální spuštění (stejná auth jako GET). */
export async function POST(request: Request) {
  return GET(request);
}
