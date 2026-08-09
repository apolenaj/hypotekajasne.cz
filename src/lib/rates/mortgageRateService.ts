/**
 * ONE central server-side mortgage reference-rate service (Phase 2).
 *
 * Prefer this module over any parallel rate resolvers.
 * Not wired into production calculators/UI yet.
 *
 * Access: server-only Supabase reader (service role). Never import a privileged
 * client into Client Components.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  DEFAULT_CZ_MODEL_RATE,
  DEFAULT_CZ_MODEL_RATE_SOURCE_ID,
} from "@/lib/rates/mortgage-rate-defaults";
import {
  rateFreshnessFromCheckedAt,
  type RateFreshness,
} from "@/lib/rates/mortgage-rate-freshness";
import { matchesLtvBand } from "@/lib/mortgage-rates/ltv-band";
import {
  isMortgagePurpose,
  isMortgageRateKind,
  type MortgagePurpose,
  type MortgageRateKind,
  type MortgageRateRow,
} from "@/lib/mortgage-rates/types";

export type GetMortgageRateInput = {
  countryCode?: string;
  purpose?: MortgagePurpose;
  fixationYears?: number;
  /**
   * Loan-to-value percent (arbitrary precision supported).
   * Matched with row bounds + ltv_min_exclusive / ltv_max_exclusive flags.
   */
  ltv?: number;
  nowMs?: number;
};

export type MortgageRateResult = {
  rate: number;
  fixationYears: number;
  ltvMin: number;
  ltvMax: number;
  rateKind: MortgageRateKind;
  checkedAt: string | null;
  sourceName: string | null;
  sourceUrl: string | null;
  freshness: RateFreshness;
  /** Provenance: supabase row vs centralized model fallback. */
  source: "supabase" | "fallback";
  countryCode: string;
  purpose: MortgagePurpose;
  /** Present when resolution could not use a unique active Supabase row. */
  selectionError?:
    | "no_match"
    | "ambiguous_active_rates"
    | "fetch_failed"
    | "invalid_query";
};

export type MortgageRateRowsReader = {
  listActiveByCountry: (countryCode: string) => Promise<{
    data: MortgageRateRow[] | null;
    error: { message: string } | null;
  }>;
};

const SELECT_COLUMNS =
  "id,country_code,purpose,fixation_years,ltv_min,ltv_max,ltv_min_exclusive,ltv_max_exclusive,rate,rate_kind,provider_name,source_name,source_url,checked_at,valid_from,valid_to,is_active,notes,created_at,updated_at";

function toNumber(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function toBoolean(value: unknown, defaultValue: boolean): boolean {
  if (typeof value === "boolean") return value;
  if (value == null) return defaultValue;
  return Boolean(value);
}

function isActiveInWindow(row: MortgageRateRow, nowMs: number): boolean {
  if (!row.is_active) return false;
  const from = Date.parse(row.valid_from);
  if (!Number.isFinite(from) || from > nowMs) return false;
  if (row.valid_to) {
    const to = Date.parse(row.valid_to);
    if (!Number.isFinite(to) || to <= nowMs) return false;
  }
  return true;
}

export { matchesLtvBand } from "@/lib/mortgage-rates/ltv-band";

export function createSupabaseMortgageRateReader(
  client: SupabaseClient
): MortgageRateRowsReader {
  return {
    async listActiveByCountry(countryCode: string) {
      const { data, error } = await client
        .from("mortgage_rates")
        .select(SELECT_COLUMNS)
        .eq("country_code", countryCode.toUpperCase())
        .eq("is_active", true);

      return {
        data: (data as MortgageRateRow[] | null) ?? null,
        error: error ? { message: error.message } : null,
      };
    },
  };
}

/**
 * Build the centralized MODEL fallback result.
 * Never pretends the value came from Supabase.
 */
export function buildFallbackMortgageRate(
  input: GetMortgageRateInput = {}
): MortgageRateResult {
  const fixationYears = input.fixationYears ?? 5;
  const ltv = input.ltv ?? 80;
  return {
    rate: DEFAULT_CZ_MODEL_RATE,
    fixationYears,
    ltvMin: 0,
    ltvMax: ltv > 0 ? ltv : 80,
    rateKind: "model",
    checkedAt: null,
    sourceName: DEFAULT_CZ_MODEL_RATE_SOURCE_ID,
    sourceUrl: null,
    freshness: "fallback",
    source: "fallback",
    countryCode: (input.countryCode ?? "CZ").toUpperCase(),
    purpose: input.purpose ?? "purchase",
  };
}

/**
 * Pure selection: exact country + purpose + fixation, LTV band with exclusivity flags.
 * 0 matches → no_match (caller falls back)
 * 1 match → row
 * 2+ matches → ambiguous (caller falls back + logs)
 */
export function selectUniqueActiveMortgageRate(
  rows: MortgageRateRow[],
  input: Required<
    Pick<GetMortgageRateInput, "countryCode" | "purpose" | "fixationYears" | "ltv">
  >,
  nowMs: number
):
  | { status: "ok"; row: MortgageRateRow }
  | { status: "no_match" }
  | { status: "ambiguous"; matches: MortgageRateRow[] } {
  const country = input.countryCode.toUpperCase();
  const matches: MortgageRateRow[] = [];

  for (const row of rows) {
    if (!isActiveInWindow(row, nowMs)) continue;
    if (row.country_code.toUpperCase() !== country) continue;
    if (row.purpose !== input.purpose) continue;
    if (!isMortgagePurpose(row.purpose) || !isMortgageRateKind(row.rate_kind)) {
      continue;
    }

    const fixation = toNumber(row.fixation_years);
    if (fixation == null || fixation !== input.fixationYears) continue;

    const ltvMin = toNumber(row.ltv_min);
    const ltvMax = toNumber(row.ltv_max);
    const rate = toNumber(row.rate);
    if (ltvMin == null || ltvMax == null || rate == null) continue;
    if (!(rate > 0 && rate < 30)) continue;
    if (
      !matchesLtvBand(ltvMin, ltvMax, input.ltv, {
        ltvMinExclusive: toBoolean(row.ltv_min_exclusive, false),
        ltvMaxExclusive: toBoolean(row.ltv_max_exclusive, false),
      })
    ) {
      continue;
    }

    matches.push(row);
  }

  if (matches.length === 0) return { status: "no_match" };
  if (matches.length > 1) return { status: "ambiguous", matches };
  return { status: "ok", row: matches[0]! };
}

function rowToResult(
  row: MortgageRateRow,
  nowMs: number
): MortgageRateResult | null {
  const rate = toNumber(row.rate);
  const fixationYears = toNumber(row.fixation_years);
  const ltvMin = toNumber(row.ltv_min);
  const ltvMax = toNumber(row.ltv_max);
  if (
    rate == null ||
    fixationYears == null ||
    ltvMin == null ||
    ltvMax == null ||
    !isMortgagePurpose(row.purpose) ||
    !isMortgageRateKind(row.rate_kind)
  ) {
    return null;
  }

  return {
    rate,
    fixationYears,
    ltvMin,
    ltvMax,
    rateKind: row.rate_kind,
    checkedAt: row.checked_at,
    sourceName: row.source_name,
    sourceUrl: row.source_url,
    freshness: rateFreshnessFromCheckedAt(row.checked_at, nowMs),
    source: "supabase",
    countryCode: row.country_code.toUpperCase(),
    purpose: row.purpose,
  };
}

function normalizeQuery(input: GetMortgageRateInput): {
  ok: true;
  query: Required<
    Pick<
      GetMortgageRateInput,
      "countryCode" | "purpose" | "fixationYears" | "ltv"
    >
  > & { nowMs: number };
} | {
  ok: false;
} {
  const countryCode = (input.countryCode ?? "CZ").toUpperCase();
  const purpose = input.purpose ?? "purchase";
  const fixationYears = input.fixationYears ?? 5;
  const ltv = input.ltv ?? 80;
  const nowMs = input.nowMs ?? Date.now();

  if (!isMortgagePurpose(purpose)) return { ok: false };
  if (!(fixationYears > 0)) return { ok: false };
  // Allow LTV outside standard bands (e.g. 90.001) → selection no_match → fallback.
  if (!Number.isFinite(ltv) || ltv < 0) return { ok: false };

  return {
    ok: true,
    query: { countryCode, purpose, fixationYears, ltv, nowMs },
  };
}

/**
 * Central entry point — resolve an orientational mortgage rate.
 * Never throws for missing DB / ambiguity / fetch errors; returns MODEL fallback.
 */
export async function getMortgageRate(
  reader: MortgageRateRowsReader | null,
  input: GetMortgageRateInput = {}
): Promise<MortgageRateResult> {
  const normalized = normalizeQuery(input);
  if (!normalized.ok) {
    return {
      ...buildFallbackMortgageRate(input),
      selectionError: "invalid_query",
    };
  }

  const { query } = normalized;

  if (!reader) {
    return {
      ...buildFallbackMortgageRate(query),
      selectionError: "fetch_failed",
    };
  }

  let rows: MortgageRateRow[] = [];
  try {
    const { data, error } = await reader.listActiveByCountry(query.countryCode);
    if (error) {
      console.error("[mortgageRateService] fetch failed:", error.message);
      return {
        ...buildFallbackMortgageRate(query),
        selectionError: "fetch_failed",
      };
    }
    rows = Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("[mortgageRateService] fetch threw:", err);
    return {
      ...buildFallbackMortgageRate(query),
      selectionError: "fetch_failed",
    };
  }

  const selected = selectUniqueActiveMortgageRate(rows, query, query.nowMs);

  if (selected.status === "ambiguous") {
    console.error(
      "[mortgageRateService] ambiguous active rates — configuration error",
      {
        countryCode: query.countryCode,
        purpose: query.purpose,
        fixationYears: query.fixationYears,
        ltv: query.ltv,
        matchIds: selected.matches.map((m) => m.id),
      }
    );
    return {
      ...buildFallbackMortgageRate(query),
      selectionError: "ambiguous_active_rates",
    };
  }

  if (selected.status === "no_match") {
    return {
      ...buildFallbackMortgageRate(query),
      selectionError: "no_match",
    };
  }

  const mapped = rowToResult(selected.row, query.nowMs);
  if (!mapped) {
    return {
      ...buildFallbackMortgageRate(query),
      selectionError: "no_match",
    };
  }

  return mapped;
}

export {
  DEFAULT_CZ_MODEL_RATE,
  DEFAULT_CZ_MODEL_RATE_SOURCE_ID,
} from "@/lib/rates/mortgage-rate-defaults";
export type { RateFreshness } from "@/lib/rates/mortgage-rate-freshness";
export { rateFreshnessFromCheckedAt } from "@/lib/rates/mortgage-rate-freshness";
