import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DIMENSION_WEIGHTS,
  MATCH_DIMENSIONS,
  WEIGHTS_VERSION,
  applyWhatIfToForm,
  dimensionFit,
  matchMarkets,
  matchMarketsWhatIf,
  recomputeOverallFromBreakdown,
  whatIfFromForm,
  type PassportFormData,
} from "@/lib/market-matching";
import {
  assertOrganicScoreInvariant,
  attemptForbiddenPartnerBoost,
  organicScoreForMarket,
} from "@/lib/market-matching/organic-invariant";

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

  it("has documented weights version v2", () => {
    assert.equal(WEIGHTS_VERSION, "2026-07-investment-passport-v2");
  });

  it("exposes PROMPT 16 dimensions", () => {
    for (const d of [
      "capital_fit",
      "financing_fit",
      "yield_potential",
      "ownership_accessibility",
      "liquidity",
      "fx_risk",
      "regulatory_complexity",
      "tax_complexity",
      "operational_complexity",
      "user_goal_fit",
    ] as const) {
      assert.ok(MATCH_DIMENSIONS.includes(d), d);
    }
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

describe("matchMarkets explainability", () => {
  it("returns top 3 with score/weight/explanation per dimension", () => {
    const r = matchMarkets(baseForm);
    assert.equal(r.topMarkets.length, 3);
    assert.ok(r.allMarkets.length >= 3);
    for (const m of r.topMarkets) {
      assert.ok(m.overallMatch >= 0 && m.overallMatch <= 100);
      assert.ok(m.whyMatches.length > 0);
      assert.ok(m.whyNotMatches.length > 0);
      assert.ok(m.whatWouldChangeScore.length > 0);
      assert.ok(m.financingOptions.length > 0);
      assert.ok(m.topRisks.length > 0);
      assert.equal(m.breakdown.length, 10);
      for (const b of m.breakdown) {
        assert.ok(typeof b.score === "number");
        assert.ok(typeof b.weight === "number");
        assert.ok(b.explanation.length > 10);
        assert.equal(b.score, b.fit);
      }
      assert.equal(
        m.overallMatch,
        recomputeOverallFromBreakdown(m.breakdown)
      );
      assert.equal(m.isSponsored, false);
      assert.equal(m.organicScoreUntouched, true);
    }
    const scores = r.topMarkets.map((m) => m.overallMatch);
    assert.ok(scores[0]! >= scores[1]!);
    assert.ok(scores[1]! >= scores[2]!);
  });

  it("is deterministically reproducible", () => {
    const a = matchMarkets(baseForm);
    const b = matchMarkets(baseForm);
    assert.deepEqual(
      a.allMarkets.map((m) => [m.marketId, m.overallMatch]),
      b.allMarkets.map((m) => [m.marketId, m.overallMatch])
    );
  });

  it("prefers domestic markets for czech_slovak + conservative", () => {
    const r = matchMarkets(baseForm);
    const topNames = r.topMarkets.map((m) => m.name);
    assert.ok(
      topNames.includes("Česká republika") || topNames.includes("Slovensko"),
      `expected CZ/SK in top 3, got ${topNames.join(", ")}`
    );
  });
});

describe("what-if mode", () => {
  it("recalculates when capital / risk / use mode change", () => {
    const baseline = matchMarkets(baseForm);
    const whatIf = whatIfFromForm(baseForm);
    const exotic = matchMarketsWhatIf(baseForm, {
      ...whatIf,
      capitalCzk: 5_000_000,
      yieldAppetite: 90,
      riskTolerance: 90,
      useMode: "investment",
    });
    assert.equal(exotic.weightsVersion, WEIGHTS_VERSION);
    // Ranking or scores should move for at least one market
    const changed = baseline.allMarkets.some((m) => {
      const n = exotic.allMarkets.find((x) => x.marketId === m.marketId);
      return n && n.overallMatch !== m.overallMatch;
    });
    assert.ok(changed, "expected what-if to change at least one score");
  });

  it("applyWhatIfToForm maps useMode to purpose", () => {
    const f = applyWhatIfToForm(baseForm, {
      capitalCzk: 1_500_000,
      horizon: "6_months",
      yieldAppetite: 50,
      riskTolerance: 50,
      useMode: "own_use",
    });
    assert.equal(f.purpose, "partial_use");
    assert.equal(f.horizon, "6_months");
  });
});

describe("organic score partner invariant", () => {
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

  it("assertOrganicScoreInvariant ignores affiliate revenue and boosts", () => {
    const result = assertOrganicScoreInvariant(baseForm, {
      partnerPaid: true,
      affiliateRevenueCzk: 50_000,
      sponsoredMarketIds: ["ae", "id"],
      partnerBoostPoints: 40,
    });
    assert.equal(result.ok, true);
    assert.equal(result.ignoredPartnerSignals.affiliateRevenueCzk, 50_000);

    const before = organicScoreForMarket(baseForm, "cz");
    const afterBoost = attemptForbiddenPartnerBoost(
      result.baseline.allMarkets.find((m) => m.marketId === "cz")!,
      99
    );
    assert.equal(afterBoost.overallMatch, before);
    assert.equal(afterBoost.organicScoreUntouched, true);
  });

  it("matchMarkets function does not accept partner arguments", () => {
    assert.equal(matchMarkets.length, 1);
  });
});
