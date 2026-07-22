/**
 * Normalize DB / scrape rows → MortgageRateRecord (PROMPT 6).
 */

import type { BankRateRow } from "@/lib/bank-rates";
import { applyRateFreshness } from "@/lib/rates/freshness-policy";
import type { MortgageRateRecord } from "@/lib/rates/types";
import { MODEL_FALLBACK_RATE_PERCENT } from "@/lib/rates/model-fallback";
import { modelRateDisclaimer } from "@/lib/rates/types";

export function bankRateRowToMortgageRateRecord(
  row: BankRateRow,
  opts: { hasInsurance?: boolean; nowMs?: number } = {}
): MortgageRateRecord {
  const hasInsurance = opts.hasInsurance ?? true;
  const rate = hasInsurance
    ? (row.rateWithInsurance ?? row.rate)
    : row.rateWithoutInsurance;
  const apr = hasInsurance
    ? (row.rpsnWithInsurance ?? row.rpsn)
    : row.rpsnWithoutInsurance;

  const status = applyRateFreshness({
    rate,
    declaredStatus: "LIVE",
    fetchedAt: row.updatedAt,
    nowMs: opts.nowMs,
  });

  const conditions: string[] = [
    hasInsurance ? "s pojištěním schopnosti splácet" : "bez pojištění",
  ];
  if (status === "STALE") {
    conditions.push("údaj starší než LIVE limit — neprezentovat jako aktuální lístek");
  }

  return {
    id: `bank:${row.id}:${hasInsurance ? "with" : "without"}`,
    provider: row.bankName,
    product: "Hypotéka (scraped)",
    rate,
    apr,
    ltv: null,
    fixation: null,
    conditions,
    sourceUrl: row.sourceUrl,
    fetchedAt: row.updatedAt,
    validatedAt: row.updatedAt,
    validFrom: row.updatedAt,
    status,
    notes:
      status === "UNAVAILABLE"
        ? "Sazba chybí nebo je příliš stará pro zobrazení jako živá nabídka."
        : null,
  };
}

export function modelFallbackRateRecord(
  nowIso: string = new Date().toISOString()
): MortgageRateRecord {
  return {
    id: "model:platform-fallback-v1",
    provider: "Hypotéka Jasně",
    product: "Modelová sazba (fallback)",
    rate: MODEL_FALLBACK_RATE_PERCENT,
    apr: null,
    ltv: null,
    fixation: null,
    conditions: ["model — není bankovní nabídka"],
    sourceUrl: null,
    fetchedAt: nowIso,
    validatedAt: nowIso,
    validFrom: null,
    status: "MODEL",
    notes: modelRateDisclaimer(MODEL_FALLBACK_RATE_PERCENT),
  };
}
