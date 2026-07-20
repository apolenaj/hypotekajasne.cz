import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildPropertyComparison,
  DEMO_COMPARE_PROPERTIES,
  decodeComparisonLink,
  encodeComparisonLink,
  MIN_PROPERTIES,
} from "@/lib/property-compare";
import {
  buildFinancialPassportDocument,
  fromReadinessAnswers,
} from "@/lib/financial-passport";
import { EMPTY_ANSWERS } from "@/lib/mortgage-readiness";

describe("property compare engine", () => {
  it("requires at least two properties", () => {
    const r = buildPropertyComparison({
      properties: [DEMO_COMPARE_PROPERTIES[0]!],
      modelRatePercent: 5,
      doc: null,
    });
    assert.equal(r.properties.length, 0);
    assert.match(r.profileRecommendation.headline, /2–5|Přidejte/);
  });

  it("builds full comparison for demo A/B", () => {
    const r = buildPropertyComparison({
      properties: DEMO_COMPARE_PROPERTIES,
      modelRatePercent: 5.2,
      doc: null,
    });
    assert.equal(r.properties.length, 2);
    assert.ok(r.properties[0]!.monthlyCashFlow.value != null);
    assert.ok(r.categoryWinners.length >= 3);
    assert.ok(r.profileRecommendation.tradeoffs.length === 2);
    assert.match(
      r.profileRecommendation.notAbsoluteBest,
      /není absolutní|žádné absolutní/i
    );
  });

  it("assigns category winners without single absolute champion text", () => {
    const r = buildPropertyComparison({
      properties: DEMO_COMPARE_PROPERTIES,
      modelRatePercent: 5,
      doc: null,
    });
    for (const w of r.categoryWinners) {
      assert.ok(w.propertyLabel);
      assert.match(w.reason, /Není absolutní|kategorii/i);
    }
  });

  it("includes affordability category when passport present", () => {
    const doc = buildFinancialPassportDocument(
      fromReadinessAnswers({
        ...EMPTY_ANSWERS,
        intent: "investment",
        netIncome: 70_000,
        ownFunds: 1_200_000,
        targetPrice: 6_000_000,
        noRecentDefaults: true,
        employmentMonths: 24,
      }),
      5
    );
    const r = buildPropertyComparison({
      properties: DEMO_COMPARE_PROPERTIES,
      modelRatePercent: 5,
      doc,
    });
    assert.ok(
      r.categoryWinners.some((w) => w.category === "best_user_fit")
    );
  });

  it("does not invent listing age or similar listings", () => {
    const r = buildPropertyComparison({
      properties: DEMO_COMPARE_PROPERTIES,
      modelRatePercent: 5,
      doc: null,
    });
    for (const p of r.properties) {
      assert.ok(p.estimatedFairValue.kind === "MODEL");
      assert.ok(p.locationScore.kind === "MODEL");
    }
  });

  it("exit scenarios include bear base bull", () => {
    const r = buildPropertyComparison({
      properties: DEMO_COMPARE_PROPERTIES,
      modelRatePercent: 5,
      doc: null,
    });
    for (const p of r.properties) {
      assert.equal(p.exitScenarios.length, 3);
    }
  });
});

describe("comparison link encoding", () => {
  it("round-trips 2 properties", () => {
    const encoded = encodeComparisonLink(DEMO_COMPARE_PROPERTIES);
    const decoded = decodeComparisonLink(encoded);
    assert.ok(decoded);
    assert.equal(decoded!.length, MIN_PROPERTIES);
    assert.equal(decoded![0]!.priceCzk, DEMO_COMPARE_PROPERTIES[0]!.priceCzk);
    assert.equal(decoded![1]!.city, DEMO_COMPARE_PROPERTIES[1]!.city);
  });

  it("rejects invalid payload", () => {
    assert.equal(decodeComparisonLink("not-valid"), null);
    assert.equal(decodeComparisonLink(""), null);
  });
});
