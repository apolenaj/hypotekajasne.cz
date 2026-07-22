import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  monthsUntilFixation,
  buildPaymentScenarios,
  totalInterestRemaining,
  compareStayVsRefinance,
  importFromFinancialProfile,
  recommendedRefinanceStartDate,
  buildMarketReferenceFromResolved,
} from "./calculate";
import { buildTimelineMilestones, generateRefinanceAlerts } from "./alerts";
import { buildRefinanceRadarDashboard } from "./build";
import { emptyLoanProfile } from "./types";
import type { CurrentRates } from "@/lib/rates";
import type { ResolvedMortgageRate } from "@/lib/rates/resolve-engine";

const NOW = new Date("2025-10-01T12:00:00Z");

function makeProfile(overrides: object = {}) {
  return emptyLoanProfile({
    loanBalanceCzk: 3_000_000,
    ratePercent: 5.5,
    fixationEnd: "2026-07-01",
    monthlyPaymentCzk: 20_000,
    remainingTermYears: 20,
    newTermYears: 20,
    refinancingFeesCzk: 25_000,
    earlyRepaymentPenaltyCzk: 40_000,
    insuranceMonthlyDeltaCzk: 300,
    hasInsuranceBundle: true,
    currentLender: "TestBank",
    ...overrides,
  });
}

describe("monthsUntilFixation", () => {
  it("returns correct positive value", () => {
    const m = monthsUntilFixation("2026-07-01", NOW);
    assert.ok(m != null && m > 0, `Expected positive, got ${m}`);
    assert.ok(m != null && m < 15, `Expected < 15, got ${m}`);
  });
  it("returns null for invalid date", () => {
    assert.equal(monthsUntilFixation("not-a-date", NOW), null);
  });
  it("returns 0 for past date", () => {
    assert.equal(monthsUntilFixation("2020-01-01", NOW), 0);
  });
});

describe("buildPaymentScenarios", () => {
  it("includes current rate scenario", () => {
    const market = {
      ratePercent: 4.5,
      label: "test",
      claimKind: "ODHAD" as const,
      rateStatus: "LIVE" as const,
      note: "",
      updatedAt: null,
    };
    const scenarios = buildPaymentScenarios(makeProfile(), market);
    assert.ok(scenarios.some((s) => s.id === "current"));
    assert.ok(scenarios.some((s) => s.id === "market"));
    assert.ok(scenarios.some((s) => s.id === "market_plus_1"));
  });
  it("returns only current when market is null", () => {
    const market = {
      ratePercent: null,
      label: "",
      claimKind: "NEOVERENO" as const,
      rateStatus: "UNAVAILABLE" as const,
      note: "",
      updatedAt: null,
    };
    const scenarios = buildPaymentScenarios(makeProfile(), market);
    assert.equal(scenarios.length, 1);
    assert.equal(scenarios[0].id, "current");
  });
  it("marks model market scenario as MODEL claim", () => {
    const market = {
      ratePercent: 5,
      label: "model",
      claimKind: "MODEL" as const,
      rateStatus: "MODEL" as const,
      note: "fallback",
      updatedAt: null,
    };
    const scenarios = buildPaymentScenarios(makeProfile(), market);
    const m = scenarios.find((s) => s.id === "market")!;
    assert.equal(m.claimKind, "MODEL");
  });
});

describe("totalInterestRemaining", () => {
  it("returns positive number for valid input", () => {
    const interest = totalInterestRemaining(3_000_000, 5.5, 240);
    assert.ok(interest > 0, `Expected > 0, got ${interest}`);
  });
  it("returns 0 for zero balance", () => {
    assert.equal(totalInterestRemaining(0, 5.5, 240), 0);
  });
});

describe("compareStayVsRefinance", () => {
  it("builds comparison with rows", () => {
    const result = compareStayVsRefinance({
      profile: makeProfile(),
      marketRatePercent: 4.5,
      now: NOW,
    });
    assert.ok(result.rows.length > 4);
    assert.equal(result.claimKind, "MODEL");
    assert.ok(result.stayTotalInterestCzk > 0);
  });
  it("has no breakEven when saving is zero or negative", () => {
    const result = compareStayVsRefinance({
      profile: makeProfile({ ratePercent: 3.0, monthlyPaymentCzk: 10_000 }),
      marketRatePercent: 6.0,
      now: NOW,
    });
    assert.equal(result.breakEvenMonths, null);
    assert.equal(result.potentialMonthlySavingCzk, null);
  });
});

describe("buildTimelineMilestones", () => {
  it("returns 5 milestones", () => {
    const milestones = buildTimelineMilestones("2026-07-01", NOW);
    assert.equal(milestones.length, 5);
  });
  it("marks future 12m milestone as upcoming", () => {
    const milestones = buildTimelineMilestones("2030-01-01", NOW);
    const m12 = milestones.find((m) => m.monthsBefore === 12)!;
    assert.equal(m12.status, "upcoming");
  });
});

describe("generateRefinanceAlerts", () => {
  it("generates personalized alert text with specific amount", () => {
    const profile = makeProfile({ fixationEnd: "2025-11-01" }); // ~1 month from NOW
    const { alerts } = generateRefinanceAlerts({
      profile,
      marketRatePercent: 4.5,
      emittedMilestones: {},
      now: NOW,
    });
    assert.ok(alerts.length > 0, "Expected at least 1 alert");
    assert.ok(alerts[0].body.includes("orientační sazbě"), `Body: ${alerts[0].body}`);
    assert.ok(alerts[0].body.includes("splátka"), `Body: ${alerts[0].body}`);
    assert.equal(alerts[0].personalized, true);
    assert.equal(alerts[0].claimKind, "MODEL");
  });
  it("does not re-emit already emitted milestones", () => {
    const profile = makeProfile({ fixationEnd: "2025-11-01" });
    // Pre-emit all active milestone keys so nothing new is generated
    const { alerts } = generateRefinanceAlerts({
      profile,
      marketRatePercent: 4.5,
      emittedMilestones: { m1: NOW.toISOString(), m3: NOW.toISOString() },
      now: NOW,
    });
    assert.equal(alerts.length, 0);
  });
});

describe("recommendedRefinanceStartDate", () => {
  it("is 6 months before fixation end", () => {
    assert.equal(recommendedRefinanceStartDate("2026-07-01"), "2026-01-01");
  });
  it("returns null for invalid date", () => {
    assert.equal(recommendedRefinanceStartDate("nope"), null);
  });
});

describe("buildMarketReferenceFromResolved", () => {
  it("maps MODEL fallback honestly", () => {
    const resolved = {
      ratePercent: 5,
      layer: "MODEL_FALLBACK",
      uiKind: "MODEL",
      recordStatus: "MODEL",
      lastVerifiedAt: null,
      explanation: "model",
      source: "x",
      isModelFallback: true,
      liveUnavailable: true,
      liveCandidate: null,
    } satisfies ResolvedMortgageRate;
    const m = buildMarketReferenceFromResolved(resolved);
    assert.equal(m.rateStatus, "MODEL");
    assert.equal(m.claimKind, "MODEL");
  });
});

describe("buildRefinanceRadarDashboard", () => {
  it("builds full dashboard model", () => {
    const rates = {
      rateWithInsurance: 4.89,
      rateWithoutInsurance: 4.5,
      withoutInsuranceOrientational: false,
      updatedAt: "2025-01-01",
    } as unknown as CurrentRates;
    const dashboard = buildRefinanceRadarDashboard({
      profile: makeProfile(),
      rates,
      now: NOW,
    });
    assert.ok(dashboard.paymentScenarios.length > 1);
    assert.ok(dashboard.methodology.length > 0);
    assert.ok(dashboard.comparison.rows.length > 4);
    assert.equal(dashboard.timeline.length, 5);
    assert.equal(dashboard.recommendedStartDate, "2026-01-01");
    assert.equal(dashboard.marketReference.rateStatus, "LIVE");
  });
});

describe("importFromFinancialProfile", () => {
  it("maps known fields", () => {
    const partial = importFromFinancialProfile({
      currentBalance: 2_000_000,
      currentRate: 5.0,
      mortgagePayment: 15_000,
      yearsLeft: 18,
      intent: "refinance",
    } as never);
    assert.equal(partial.loanBalanceCzk, 2_000_000);
    assert.equal(partial.ratePercent, 5.0);
    assert.equal(partial.monthlyPaymentCzk, 15_000);
  });
});
