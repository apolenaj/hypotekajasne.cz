/**
 * Central mortgageRateService — selection, freshness, safe fallback.
 * Uses synthetic fixtures only (never production market rates).
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CZ_LTV_BANDS,
  CZ_MORTGAGE_RATE_SLOTS_MVP,
  findCzRateSlot,
} from "@/lib/mortgage-rates/cz-rate-structure";
import { matchesLtvBand } from "@/lib/mortgage-rates/ltv-band";
import {
  syntheticMortgageRateRow,
  syntheticPurchaseMatrix,
} from "@/lib/mortgage-rates/test-fixtures";
import { DEFAULT_CZ_MODEL_RATE } from "@/lib/rates/mortgage-rate-defaults";
import { rateFreshnessFromCheckedAt } from "@/lib/rates/mortgage-rate-freshness";
import {
  buildFallbackMortgageRate,
  getMortgageRate,
  selectUniqueActiveMortgageRate,
  type MortgageRateRowsReader,
} from "@/lib/rates/mortgageRateService";
import { MODEL_FALLBACK_RATE_PERCENT } from "@/lib/rates/model-fallback";
import type { MortgageRateRow } from "@/lib/mortgage-rates/types";

const NOW = Date.parse("2026-08-08T12:00:00.000Z");
const DAY = 24 * 60 * 60 * 1000;

function daysAgo(days: number): string {
  return new Date(NOW - days * DAY).toISOString();
}

function readerOf(
  rows: MortgageRateRow[],
  error: { message: string } | null = null
): MortgageRateRowsReader {
  return {
    async listActiveByCountry(countryCode: string) {
      if (error) return { data: null, error };
      return {
        data: rows.filter(
          (r) => r.country_code.toUpperCase() === countryCode.toUpperCase()
        ),
        error: null,
      };
    },
  };
}

describe("DEFAULT_CZ_MODEL_RATE single SoT", () => {
  it("is 5.0 and shared with MODEL_FALLBACK_RATE_PERCENT", () => {
    assert.equal(DEFAULT_CZ_MODEL_RATE, 5.0);
    assert.equal(MODEL_FALLBACK_RATE_PERCENT, DEFAULT_CZ_MODEL_RATE);
  });
});

describe("LTV boundary semantics (no gap / no overlap at 80)", () => {
  const low = CZ_LTV_BANDS.to_80;
  const high = CZ_LTV_BANDS.to_90;

  it("represents <=80 and >80–90 without artificial 80.01 threshold", () => {
    assert.equal(low.ltvMin, 0);
    assert.equal(low.ltvMax, 80);
    assert.equal(low.ltvMinExclusive, false);
    assert.equal(high.ltvMin, 80);
    assert.equal(high.ltvMax, 90);
    assert.equal(high.ltvMinExclusive, true);
  });

  it("matches exact boundary cases", () => {
    const cases: Array<{
      ltv: number;
      band: "to_80" | "to_90" | null;
    }> = [
      { ltv: 79.999, band: "to_80" },
      { ltv: 80.0, band: "to_80" },
      { ltv: 80.001, band: "to_90" },
      { ltv: 80.01, band: "to_90" },
      { ltv: 85, band: "to_90" },
      { ltv: 90, band: "to_90" },
      { ltv: 90.001, band: null },
    ];

    for (const { ltv, band } of cases) {
      const inLow = matchesLtvBand(low.ltvMin, low.ltvMax, ltv, {
        ltvMinExclusive: low.ltvMinExclusive,
      });
      const inHigh = matchesLtvBand(high.ltvMin, high.ltvMax, ltv, {
        ltvMinExclusive: high.ltvMinExclusive,
      });
      if (band === "to_80") {
        assert.equal(inLow, true, `LTV ${ltv} should match <=80`);
        assert.equal(inHigh, false, `LTV ${ltv} must not match >80–90`);
      } else if (band === "to_90") {
        assert.equal(inHigh, true, `LTV ${ltv} should match >80–90`);
        assert.equal(inLow, false, `LTV ${ltv} must not match <=80`);
      } else {
        assert.equal(inLow, false, `LTV ${ltv} should miss <=80`);
        assert.equal(inHigh, false, `LTV ${ltv} should miss >80–90`);
      }
      assert.equal(
        inLow && inHigh,
        false,
        `LTV ${ltv} must never match both bands`
      );
    }
  });

  it("exactly LTV 80 never ambiguously matches both bands", () => {
    assert.equal(
      matchesLtvBand(0, 80, 80, { ltvMinExclusive: false }),
      true
    );
    assert.equal(
      matchesLtvBand(80, 90, 80, { ltvMinExclusive: true }),
      false
    );
  });
});

describe("CZ rate structure slots", () => {
  it("defines purchase ≤80 and >80–90 for 1/3/5y plus refinance ≤80", () => {
    const purchase = CZ_MORTGAGE_RATE_SLOTS_MVP.filter(
      (s) => s.purpose === "purchase"
    );
    const refinance = CZ_MORTGAGE_RATE_SLOTS_MVP.filter(
      (s) => s.purpose === "refinance"
    );
    assert.equal(purchase.length, 6);
    assert.equal(refinance.length, 3);
    assert.ok(purchase.some((s) => s.ltvMinExclusive === true));
    assert.ok(purchase.some((s) => s.ltvMinExclusive === false));
  });

  it("findCzRateSlot maps boundary LTVs correctly", () => {
    assert.equal(
      findCzRateSlot({ purpose: "purchase", fixationYears: 3, ltv: 79.999 })
        ?.ltvBandId,
      "to_80"
    );
    assert.equal(
      findCzRateSlot({ purpose: "purchase", fixationYears: 3, ltv: 80 })
        ?.ltvBandId,
      "to_80"
    );
    assert.equal(
      findCzRateSlot({ purpose: "purchase", fixationYears: 3, ltv: 80.001 })
        ?.ltvBandId,
      "to_90"
    );
    assert.equal(
      findCzRateSlot({ purpose: "purchase", fixationYears: 3, ltv: 90.001 }),
      null
    );
  });
});

describe("selection", () => {
  it("LTV 75 gets <=80 rate", async () => {
    const matrix = syntheticPurchaseMatrix(daysAgo(1));
    const result = await getMortgageRate(readerOf(matrix), {
      countryCode: "CZ",
      purpose: "purchase",
      fixationYears: 3,
      ltv: 75,
      nowMs: NOW,
    });
    assert.equal(result.source, "supabase");
    assert.equal(result.ltvMin, 0);
    assert.equal(result.ltvMax, 80);
    assert.equal(result.rate, 9.13);
  });

  it("LTV 85 gets >80–90 rate", async () => {
    const matrix = syntheticPurchaseMatrix(daysAgo(1));
    const result = await getMortgageRate(readerOf(matrix), {
      countryCode: "CZ",
      purpose: "purchase",
      fixationYears: 3,
      ltv: 85,
      nowMs: NOW,
    });
    assert.equal(result.source, "supabase");
    assert.equal(result.ltvMin, 80);
    assert.equal(result.ltvMax, 90);
    assert.equal(result.rate, 9.23);
  });

  it("LTV 80.001 gets >80–90 rate (no gap)", async () => {
    const matrix = syntheticPurchaseMatrix(daysAgo(1));
    const result = await getMortgageRate(readerOf(matrix), {
      countryCode: "CZ",
      purpose: "purchase",
      fixationYears: 3,
      ltv: 80.001,
      nowMs: NOW,
    });
    assert.equal(result.source, "supabase");
    assert.equal(result.ltvMin, 80);
    assert.equal(result.ltvMax, 90);
  });

  it("LTV 90.001 → no matching standard band → fallback", async () => {
    const matrix = syntheticPurchaseMatrix(daysAgo(1));
    const result = await getMortgageRate(readerOf(matrix), {
      countryCode: "CZ",
      purpose: "purchase",
      fixationYears: 3,
      ltv: 90.001,
      nowMs: NOW,
    });
    assert.equal(result.source, "fallback");
    assert.equal(result.selectionError, "no_match");
    assert.equal(result.rate, DEFAULT_CZ_MODEL_RATE);
  });

  it("requires exact fixation years", () => {
    const selected = selectUniqueActiveMortgageRate(
      [syntheticMortgageRateRow({ fixation_years: 5 })],
      {
        countryCode: "CZ",
        purpose: "purchase",
        fixationYears: 3,
        ltv: 75,
      },
      NOW
    );
    assert.equal(selected.status, "no_match");
  });
});

describe("freshness", () => {
  it("checked today → fresh", () => {
    assert.equal(rateFreshnessFromCheckedAt(daysAgo(0), NOW), "fresh");
  });

  it("checked 10 days ago → aging", () => {
    assert.equal(rateFreshnessFromCheckedAt(daysAgo(10), NOW), "aging");
  });

  it("checked 20 days ago → stale", () => {
    assert.equal(rateFreshnessFromCheckedAt(daysAgo(20), NOW), "stale");
  });
});

describe("fallback", () => {
  it("Supabase unavailable → fallback model", async () => {
    const result = await getMortgageRate(
      readerOf([], { message: "unavailable" }),
      {
        countryCode: "CZ",
        purpose: "purchase",
        fixationYears: 3,
        ltv: 75,
        nowMs: NOW,
      }
    );
    assert.equal(result.source, "fallback");
    assert.equal(result.freshness, "fallback");
    assert.equal(result.checkedAt, null);
    assert.equal(result.selectionError, "fetch_failed");
  });

  it("missing fixation match → fallback", async () => {
    const result = await getMortgageRate(
      readerOf([syntheticMortgageRateRow({ fixation_years: 5, rate: 9.11 })]),
      {
        countryCode: "CZ",
        purpose: "purchase",
        fixationYears: 3,
        ltv: 75,
        nowMs: NOW,
      }
    );
    assert.equal(result.source, "fallback");
    assert.equal(result.selectionError, "no_match");
  });
});

describe("ambiguity", () => {
  it("two matching active rows → configuration error / fallback", async () => {
    const result = await getMortgageRate(
      readerOf([
        syntheticMortgageRateRow({
          id: "a",
          ltv_min: 0,
          ltv_max: 80,
          ltv_min_exclusive: false,
          rate: 9.11,
        }),
        syntheticMortgageRateRow({
          id: "b",
          ltv_min: 70,
          ltv_max: 90,
          ltv_min_exclusive: false,
          rate: 9.99,
        }),
      ]),
      {
        countryCode: "CZ",
        purpose: "purchase",
        fixationYears: 3,
        ltv: 75,
        nowMs: NOW,
      }
    );
    assert.equal(result.source, "fallback");
    assert.equal(result.selectionError, "ambiguous_active_rates");
  });
});

describe("buildFallbackMortgageRate", () => {
  it("never pretends supabase provenance", () => {
    const fb = buildFallbackMortgageRate({ fixationYears: 3, ltv: 75 });
    assert.equal(fb.source, "fallback");
    assert.equal(fb.freshness, "fallback");
    assert.equal(fb.checkedAt, null);
  });
});
