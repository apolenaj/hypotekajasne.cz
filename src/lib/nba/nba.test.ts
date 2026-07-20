import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  evaluateNextBestActions,
  NBA_RULES,
  type NbaEngineInput,
} from "@/lib/nba";

function base(over: Partial<NbaEngineInput> = {}): NbaEngineInput {
  return {
    readinessScore: null,
    hasProfile: false,
    incomeNet: 0,
    ownFunds: 0,
    profileCompleteness: 0,
    purpose: null,
    fixationMonthsRemaining: null,
    estimatedLtv: null,
    watchlistCount: 0,
    hasSavedProperty: false,
    priceDropPct: null,
    priceDropLabel: null,
    propertyOverBudgetLabel: null,
    topLeverTitle: null,
    now: new Date("2026-07-20T12:00:00.000Z"),
    ...over,
  };
}

describe("NBA rule catalog", () => {
  it("has unique rule ids", () => {
    const ids = NBA_RULES.map((r) => r.id);
    assert.equal(ids.length, new Set(ids).size);
  });
});

describe("NBA engine — deterministic rules", () => {
  it("no profile → start readiness", () => {
    const r = evaluateNextBestActions(base(), { limit: 3 });
    assert.equal(r.recommendations[0]?.id, "start_readiness");
    assert.match(r.recommendations[0]!.action, /připravenost/i);
    assert.ok(r.recommendations[0]!.sourceData.keys.length > 0);
  });

  it("readiness < 50 → improve preparedness first", () => {
    const r = evaluateNextBestActions(
      base({
        hasProfile: true,
        incomeNet: 50_000,
        ownFunds: 500_000,
        profileCompleteness: 80,
        readinessScore: 42,
        purpose: "owner_occupied",
      }),
      { limit: 3 }
    );
    assert.ok(r.recommendations.some((x) => x.id === "readiness_below_50"));
    const top = r.recommendations.find((x) => x.id === "readiness_below_50")!;
    assert.match(top.action, /připravenost/i);
    assert.ok(top.blockingIssues.length > 0);
    assert.equal(top.sourceData.claimKind, "MODEL");
  });

  it("missing own funds → simulate financing alternatives", () => {
    const r = evaluateNextBestActions(
      base({
        hasProfile: true,
        incomeNet: 60_000,
        ownFunds: 50_000,
        profileCompleteness: 70,
        readinessScore: 55,
        purpose: "owner_occupied",
      }),
      { limit: 3 }
    );
    assert.ok(r.recommendations.some((x) => x.id === "missing_own_funds"));
    assert.match(
      r.recommendations.find((x) => x.id === "missing_own_funds")!.action,
      /financování/i
    );
  });

  it("readiness > 75 and no property → Majetio", () => {
    const r = evaluateNextBestActions(
      base({
        hasProfile: true,
        incomeNet: 80_000,
        ownFunds: 1_000_000,
        profileCompleteness: 90,
        readinessScore: 82,
        purpose: "owner_occupied",
        watchlistCount: 0,
        hasSavedProperty: false,
      }),
      { limit: 3 }
    );
    assert.ok(r.recommendations.some((x) => x.id === "ready_browse_majetio"));
    assert.match(
      r.recommendations.find((x) => x.id === "ready_browse_majetio")!.action,
      /Majetio/
    );
  });

  it("saved property → investment analysis", () => {
    const r = evaluateNextBestActions(
      base({
        hasProfile: true,
        incomeNet: 70_000,
        ownFunds: 800_000,
        profileCompleteness: 85,
        readinessScore: 70,
        purpose: "investment",
        watchlistCount: 2,
        hasSavedProperty: true,
      }),
      { limit: 3 }
    );
    assert.ok(r.recommendations.some((x) => x.id === "analyze_saved_property"));
  });

  it("fixation within 12 months → watch refinance", () => {
    const r = evaluateNextBestActions(
      base({
        hasProfile: true,
        incomeNet: 70_000,
        ownFunds: 500_000,
        profileCompleteness: 80,
        readinessScore: 70,
        purpose: "refinance",
        fixationMonthsRemaining: 9,
      }),
      { limit: 3 }
    );
    const fix = r.recommendations.find((x) => x.id === "fixation_within_12m");
    assert.ok(fix);
    assert.match(fix!.action, /refinancování/i);
    assert.match(fix!.reason, /9 měsíc/);
  });

  it("high LTV investor → simulate price drop", () => {
    const r = evaluateNextBestActions(
      base({
        hasProfile: true,
        incomeNet: 90_000,
        ownFunds: 400_000,
        profileCompleteness: 85,
        readinessScore: 68,
        purpose: "investment",
        estimatedLtv: 0.85,
      }),
      { limit: 3 }
    );
    assert.ok(r.recommendations.some((x) => x.id === "high_ltv_stress"));
    assert.match(
      r.recommendations.find((x) => x.id === "high_ltv_stress")!.action,
      /pokles/i
    );
  });

  it("returns at most 3 recommendations sorted by priority", () => {
    const r = evaluateNextBestActions(
      base({
        hasProfile: true,
        incomeNet: 0,
        ownFunds: 0,
        profileCompleteness: 20,
        readinessScore: 30,
        purpose: "owner_occupied",
      }),
      { limit: 3 }
    );
    assert.ok(r.recommendations.length <= 3);
    for (let i = 1; i < r.recommendations.length; i++) {
      assert.ok(
        r.recommendations[i - 1]!.priority >= r.recommendations[i]!.priority
      );
    }
  });

  it("respects dismissed user state", () => {
    const r = evaluateNextBestActions(base(), {
      limit: 3,
      userState: {
        completed: {},
        dismissed: { start_readiness: "2026-07-01T00:00:00.000Z" },
        snoozed: {},
      },
    });
    assert.ok(!r.recommendations.some((x) => x.id === "start_readiness"));
    assert.ok(r.suppressed.some((s) => s.id === "start_readiness" && s.why === "dismissed"));
  });

  it("each recommendation has required explainability fields", () => {
    const r = evaluateNextBestActions(
      base({
        hasProfile: true,
        incomeNet: 50_000,
        ownFunds: 100_000,
        readinessScore: 45,
        profileCompleteness: 70,
        purpose: "owner_occupied",
      })
    );
    for (const rec of r.recommendations) {
      assert.ok(rec.action.length > 0);
      assert.ok(rec.reason.length > 0);
      assert.ok(rec.expectedBenefit.length > 0);
      assert.ok(Array.isArray(rec.blockingIssues));
      assert.ok(rec.sourceData.keys.length > 0);
      assert.ok(rec.href.startsWith("/"));
    }
  });
});
