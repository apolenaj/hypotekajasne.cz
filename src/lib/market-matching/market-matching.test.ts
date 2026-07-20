import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DIMENSION_WEIGHTS,
  MATCH_DIMENSIONS,
  WEIGHTS_VERSION,
  dimensionFit,
  matchMarkets,
  type PassportFormData,
} from "@/lib/market-matching";

const baseForm: PassportFormData = {
  capital: "2000000",
  financing: "partial",
  purpose: "conservative",
  horizon: "1_year",
  region: "czech_slovak",
  name: "Test",
  email: "t@example.com",
  phone: "+420777000000",
};

describe("market matching weights", () => {
  it("weights sum to 1", () => {
    const sum = MATCH_DIMENSIONS.reduce(
      (s, d) => s + DIMENSION_WEIGHTS[d],
      0
    );
    assert.ok(Math.abs(sum - 1) < 1e-9);
  });

  it("has documented weights version", () => {
    assert.equal(WEIGHTS_VERSION, "2026-07-market-matching-v1");
  });
});

describe("dimensionFit", () => {
  it("is 100 when equal", () => {
    assert.equal(dimensionFit(70, 70), 100);
  });
  it("decreases with distance", () => {
    assert.equal(dimensionFit(50, 70), 80);
  });
});

describe("matchMarkets", () => {
  it("returns top 3 with full result fields", () => {
    const r = matchMarkets(baseForm);
    assert.equal(r.topMarkets.length, 3);
    assert.ok(r.allMarkets.length >= 3);
    for (const m of r.topMarkets) {
      assert.ok(m.overallMatch >= 0 && m.overallMatch <= 100);
      assert.ok(m.whyMatches.length > 0);
      assert.ok(m.whyNotMatches.length > 0);
      assert.ok(m.financingOptions.length > 0);
      assert.ok(m.topRisks.length > 0);
      assert.ok(m.breakdown.length === 10);
      assert.equal(m.isSponsored, false);
      assert.equal(m.organicScoreUntouched, true);
      assert.ok(m.dataFreshness.lastReviewedAt);
    }
    const scores = r.topMarkets.map((m) => m.overallMatch);
    assert.ok(scores[0]! >= scores[1]!);
    assert.ok(scores[1]! >= scores[2]!);
  });

  it("prefers domestic markets for czech_slovak + conservative", () => {
    const r = matchMarkets(baseForm);
    const topNames = r.topMarkets.map((m) => m.name);
    assert.ok(
      topNames.includes("Česká republika") || topNames.includes("Slovensko"),
      `expected CZ/SK in top 3, got ${topNames.join(", ")}`
    );
  });

  it("never applies sponsored boost to organic ranking", () => {
    const r = matchMarkets({
      ...baseForm,
      purpose: "yield_max",
      region: "exotic_high_yield",
      financing: "cash",
    });
    assert.ok(r.allMarkets.every((m) => m.isSponsored === false));
    assert.ok(r.allMarkets.every((m) => m.organicScoreUntouched === true));
  });
});
