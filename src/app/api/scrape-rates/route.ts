import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { scrapeAllBanks, type ScrapedBankRate } from "@/lib/scrape/bank-scrapers";
import { isValidMortgagePair } from "@/lib/scrape/parse-rate";

export const runtime = "nodejs";
export const maxDuration = 60;

function getSupabaseAdmin() {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  url = url.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");

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
  if (
    typeof row.rateWithInsurance !== "number" ||
    !Number.isFinite(row.rateWithInsurance)
  ) {
    return false;
  }

  if (row.rpsnWithInsurance != null) {
    if (
      !Number.isFinite(row.rpsnWithInsurance) ||
      !isValidMortgagePair(row.rateWithInsurance, row.rpsnWithInsurance)
    ) {
      return false;
    }
  }

  // Bez pojištění je volitelné — jen ověřená absolutní sazba, žádné dopočty
  if (row.rateWithoutInsurance != null) {
    if (
      !Number.isFinite(row.rateWithoutInsurance) ||
      row.rateWithoutInsurance < row.rateWithInsurance
    ) {
      return false;
    }
  }

  if (row.rpsnWithoutInsurance != null) {
    if (
      row.rateWithoutInsurance == null ||
      !Number.isFinite(row.rpsnWithoutInsurance) ||
      !isValidMortgagePair(row.rateWithoutInsurance, row.rpsnWithoutInsurance)
    ) {
      return false;
    }
  }

  return true;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    const e = error as {
      message: string;
      code?: string;
      details?: string;
      hint?: string;
    };
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
    let americanSaved = 0;

    if (validBanks.length > 0) {
      const supabase = getSupabaseAdmin();

      const { error: probeError } = await supabase
        .from("bank_rates")
        .select("id")
        .limit(1);
      if (probeError) {
        throw new Error(
          `Supabase bank_rates nedostupná: ${probeError.message}${probeError.code ? ` (${probeError.code})` : ""}. ` +
            `V Supabase SQL Editoru spusťte: NOTIFY pgrst, 'reload schema';`
        );
      }

      const upserts = validBanks.map((row) => {
        const payload: Record<string, unknown> = {
          id: row.id,
          bank_name: row.bankName,
          rate: row.rateWithInsurance,
          rate_with_insurance: row.rateWithInsurance,
          rate_without_insurance: row.rateWithoutInsurance,
          rpsn_with_insurance: row.rpsnWithInsurance,
          rpsn_without_insurance: row.rpsnWithoutInsurance,
          american_rate_with_insurance: row.americanRateWithInsurance,
          american_rate_without_insurance: row.americanRateWithoutInsurance,
          american_rpsn_with_insurance: row.americanRpsnWithInsurance,
          american_rpsn_without_insurance: row.americanRpsnWithoutInsurance,
          american_source_url: row.americanSourceUrl,
          source_url: row.sourceUrl,
          updated_at: scrapedAt,
        };
        // Legacy sloupec rpsn je v některých DB ještě NOT NULL —
        // při chybějícím ověřeném RPSN ho neposíláme (update ponechá starou hodnotu).
        if (row.rpsnWithInsurance != null) {
          payload.rpsn = row.rpsnWithInsurance;
        }
        return payload;
      });

      let americanColumnsMissing = false;
      saved = 0;
      americanSaved = 0;

      for (const payload of upserts) {
        let { error } = await supabase.from("bank_rates").upsert(payload, {
          onConflict: "id",
        });

        if (error && /american_/i.test(error.message + (error.details ?? ""))) {
          americanColumnsMissing = true;
          const {
            american_rate_with_insurance: _a,
            american_rate_without_insurance: _b,
            american_rpsn_with_insurance: _c,
            american_rpsn_without_insurance: _d,
            american_source_url: _e,
            ...classicOnly
          } = payload;
          const retry = await supabase.from("bank_rates").upsert(classicOnly, {
            onConflict: "id",
          });
          error = retry.error;
        }

        if (error) {
          allFailures.push({
            id: String(payload.id),
            bankName: String(payload.bank_name),
            error: `Upsert selhal: ${error.message}${error.details ? ` — ${error.details}` : ""}${
              /null value.*rpsn/i.test(error.message + (error.details ?? ""))
                ? " Spusťte supabase/bank_rates_nullable_rpsn_migration.sql"
                : ""
            }`,
          });
          continue;
        }

        saved += 1;
        if (
          !americanColumnsMissing &&
          payload.american_rate_with_insurance != null
        ) {
          americanSaved += 1;
        }
      }

      if (americanColumnsMissing) {
        allFailures.push({
          id: "schema",
          bankName: "Supabase",
          error:
            "Chybí sloupce american_* — spusťte supabase/bank_rates_american_migration.sql a NOTIFY pgrst, 'reload schema'. Klasické sazby byly uloženy.",
        });
      }

      const primary =
        validBanks.find((b) => b.rpsnWithInsurance != null) ?? validBanks[0];
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
      americanSaved,
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

export async function POST(request: Request) {
  return GET(request);
}
