/**
 * Rate engine resilience — LIVE → VERIFIED_RECENT → MODEL_FALLBACK.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { FRESHNESS_THRESHOLD_MS } from "@/lib/data/freshness";
import {
  calculateMortgageDecision,
  type MortgageDecisionInput,
} from "@/lib/mortgage-decision";
import {
  MODEL_FALLBACK_EXPLANATION,
  MODEL_FALLBACK_RATE_PERCENT,
  MODEL_FALLBACK_SOURCE_ID,
} from "@/lib/rates/model-fallback";
import {
  resolveMortgageRate,
  type CachedVerifiedRate,
} from "@/lib/rates/resolve-engine";

const NOW = Date.parse("2026-07-20T12:00:00.000Z");

function hoursAgo(h: number): string {
  return new Date(NOW - h * 60 * 60 * 1000).toISOString();
}

function daysAgo(d: number): string {
  return hoursAgo(d * 24);
}

function decisionInput(
  rate: number,
  overrides: Partial<MortgageDecisionInput> = {}
): MortgageDecisionInput {
  return {
    purpose: "owner_occupied",
    age: 35,
    netIncome: 60_000,
    incomeSource: "employee",
    household: { adults: 2, children: 0 },
    propertyPrice: 5_000_000,
    ownFunds: 1_000_000,
    otherLiabilities: 0,
    creditLimitPayments: 0,
    termYears: 30,
    fixationYears: 5,
    hasInsurance: true,
    extraCollateral: 0,
    nominalRate: rate,
    rateWithInsurance: rate,
    rateWithoutInsurance: rate + 0.3,
    representativeApr: null,
    hasValidAprExample: false,
    ...overrides,
  };
}

describe("MODEL_FALLBACK SoT", () => {
  it("exposes explicit configured rate (not invented ad-hoc)", () => {
    assert.equal(MODEL_FALLBACK_RATE_PERCENT, 5);
    assert.equal(MODEL_FALLBACK_SOURCE_ID, "platform-model-fallback-v1");
    assert.match(MODEL_FALLBACK_EXPLANATION, /modelovou sazbu 5 %/);
    assert.match(MODEL_FALLBACK_EXPLANATION, /Nejde o nabídku banky/);
  });
});

describe("resolveMortgageRate — API / freshness scenarios", () => {
  it("API OK (fresh) → LIVE", () => {
    const r = resolveMortgageRate({
      rateWithInsurance: 4.74,
      rateWithoutInsurance: 5.04,
      updatedAt: hoursAgo(1),
      hasInsurance: true,
      nowMs: NOW,
    });
    assert.equal(r.layer, "LIVE");
    assert.equal(r.uiKind, "LIVE");
    assert.equal(r.ratePercent, 4.74);
    assert.equal(r.isModelFallback, false);
    assert.ok(r.source);
    assert.ok(!r.explanation.includes("STALE"));
  });

  it("API returns empty data → MODEL_FALLBACK", () => {
    const r = resolveMortgageRate({
      rateWithInsurance: null,
      rateWithoutInsurance: null,
      updatedAt: null,
      hasInsurance: true,
      nowMs: NOW,
    });
    assert.equal(r.layer, "MODEL_FALLBACK");
    assert.equal(r.uiKind, "MODEL");
    assert.equal(r.ratePercent, MODEL_FALLBACK_RATE_PERCENT);
    assert.equal(r.source, MODEL_FALLBACK_SOURCE_ID);
    assert.equal(r.explanation, MODEL_FALLBACK_EXPLANATION);
  });

  it("API timeout / error (no payload) → MODEL_FALLBACK", () => {
    // fetchCurrentRates maps timeout/error to EMPTY_RATES — engine must degrade.
    const r = resolveMortgageRate({
      rateWithInsurance: null,
      rateWithoutInsurance: null,
      updatedAt: null,
      hasInsurance: false,
      nowMs: NOW,
      cachedVerified: null,
    });
    assert.equal(r.layer, "MODEL_FALLBACK");
    assert.equal(r.ratePercent, 5);
    assert.equal(r.isModelFallback, true);
  });

  it("stale DB data within VERIFIED window → OVĚŘENO (never STALE UI)", () => {
    const ageH = FRESHNESS_THRESHOLD_MS.LIVE / (60 * 60 * 1000) + 24;
    const r = resolveMortgageRate({
      rateWithInsurance: 4.9,
      rateWithoutInsurance: 5.2,
      updatedAt: hoursAgo(ageH),
      hasInsurance: true,
      nowMs: NOW,
    });
    assert.equal(r.layer, "VERIFIED_RECENT");
    assert.equal(r.uiKind, "OVĚŘENO");
    assert.equal(r.ratePercent, 4.9);
    assert.ok(!JSON.stringify(r).includes("STALE"));
  });

  it("very old DB data → MODEL_FALLBACK without pretending LIVE", () => {
    const r = resolveMortgageRate({
      rateWithInsurance: 3.5,
      rateWithoutInsurance: 3.8,
      updatedAt: daysAgo(200),
      hasInsurance: true,
      nowMs: NOW,
    });
    assert.equal(r.layer, "MODEL_FALLBACK");
    assert.equal(r.uiKind, "MODEL");
    assert.equal(r.ratePercent, MODEL_FALLBACK_RATE_PERCENT);
    assert.equal(r.liveCandidate, 3.5);
  });

  it("cache hit after empty API → VERIFIED_RECENT", () => {
    const cached: CachedVerifiedRate = {
      rateWithInsurance: 4.85,
      rateWithoutInsurance: 5.15,
      updatedAt: daysAgo(10),
      cachedAt: daysAgo(1),
    };
    const r = resolveMortgageRate({
      rateWithInsurance: null,
      rateWithoutInsurance: null,
      updatedAt: null,
      hasInsurance: true,
      cachedVerified: cached,
      nowMs: NOW,
    });
    assert.equal(r.layer, "VERIFIED_RECENT");
    assert.equal(r.uiKind, "OVĚŘENO");
    assert.equal(r.ratePercent, 4.85);
    assert.equal(r.source, "local-verified-cache");
  });

  it("expired cache → MODEL_FALLBACK", () => {
    const cached: CachedVerifiedRate = {
      rateWithInsurance: 4.85,
      rateWithoutInsurance: 5.15,
      updatedAt: daysAgo(200),
      cachedAt: daysAgo(1),
    };
    const r = resolveMortgageRate({
      rateWithInsurance: null,
      rateWithoutInsurance: null,
      updatedAt: null,
      hasInsurance: true,
      cachedVerified: cached,
      nowMs: NOW,
    });
    assert.equal(r.layer, "MODEL_FALLBACK");
  });

  it("rate without timestamp → OVĚŘENO (not LIVE)", () => {
    const r = resolveMortgageRate({
      rateWithInsurance: 4.7,
      rateWithoutInsurance: null,
      updatedAt: null,
      hasInsurance: true,
      nowMs: NOW,
    });
    assert.equal(r.layer, "VERIFIED_RECENT");
    assert.equal(r.uiKind, "OVĚŘENO");
    assert.equal(r.ratePercent, 4.7);
  });

  it("invalid inputs (NaN / negative) → MODEL_FALLBACK", () => {
    const nan = resolveMortgageRate({
      rateWithInsurance: Number.NaN,
      rateWithoutInsurance: null,
      updatedAt: hoursAgo(1),
      hasInsurance: true,
      nowMs: NOW,
    });
    assert.equal(nan.layer, "MODEL_FALLBACK");

    const neg = resolveMortgageRate({
      rateWithInsurance: -1,
      rateWithoutInsurance: null,
      updatedAt: hoursAgo(1),
      hasInsurance: true,
      nowMs: NOW,
    });
    assert.equal(neg.layer, "MODEL_FALLBACK");
  });

  it("zero rate edge case stays LIVE when fresh", () => {
    const r = resolveMortgageRate({
      rateWithInsurance: 0,
      rateWithoutInsurance: 0.3,
      updatedAt: hoursAgo(2),
      hasInsurance: true,
      nowMs: NOW,
    });
    assert.equal(r.layer, "LIVE");
    assert.equal(r.ratePercent, 0);
  });

  it("very high rate stays LIVE when fresh", () => {
    const r = resolveMortgageRate({
      rateWithInsurance: 25,
      rateWithoutInsurance: 25.3,
      updatedAt: hoursAgo(2),
      hasInsurance: true,
      nowMs: NOW,
    });
    assert.equal(r.layer, "LIVE");
    assert.equal(r.ratePercent, 25);
  });

  it("without insurance prefers without side, falls back to with", () => {
    const both = resolveMortgageRate({
      rateWithInsurance: 4.7,
      rateWithoutInsurance: 5.0,
      updatedAt: hoursAgo(1),
      hasInsurance: false,
      nowMs: NOW,
    });
    assert.equal(both.ratePercent, 5.0);

    const onlyWith = resolveMortgageRate({
      rateWithInsurance: 4.7,
      rateWithoutInsurance: null,
      updatedAt: hoursAgo(1),
      hasInsurance: false,
      nowMs: NOW,
    });
    assert.equal(onlyWith.ratePercent, 4.7);
  });
});

describe("calculator always produces useful output on model fallback", () => {
  it("computes payment, interest, stress, three scenarios", () => {
    const r = calculateMortgageDecision(
      decisionInput(MODEL_FALLBACK_RATE_PERCENT)
    );
    const bankMax = r.scenarios.find((s) => s.view === "bank_max")!;
    const recommended = r.scenarios.find((s) => s.view === "recommended")!;
    const conservative = r.scenarios.find((s) => s.view === "conservative")!;

    assert.equal(bankMax.label, "Modelový maximální rozpočet");
    assert.match(bankMax.description, /Orientační horní hranice/);
    assert.ok(bankMax.loanAmount > 0);
    assert.ok(recommended.loanAmount > 0);
    assert.ok(conservative.loanAmount > 0);
    assert.ok(recommended.monthlyPayment != null && recommended.monthlyPayment > 0);
    assert.ok(recommended.totalInterest != null && recommended.totalInterest > 0);
    assert.ok(recommended.totalPaid != null);
    assert.equal(r.stressTests.length, 3);
    assert.ok(r.stressTests.every((t) => t.monthlyPayment > 0));
    assert.equal(r.rateUsed, MODEL_FALLBACK_RATE_PERCENT);
  });

  it("zero rate: principal-only payment path still yields numbers", () => {
    const r = calculateMortgageDecision(decisionInput(0));
    const rec = r.scenarios.find((s) => s.view === "recommended")!;
    assert.ok(rec.monthlyPayment != null && rec.monthlyPayment > 0);
    assert.equal(rec.totalInterest, 0);
    assert.equal(r.stressTests.length, 3);
  });

  it("very high rate still computes", () => {
    const r = calculateMortgageDecision(decisionInput(30));
    const rec = r.scenarios.find((s) => s.view === "recommended")!;
    assert.ok(rec.monthlyPayment != null && rec.monthlyPayment > 0);
    assert.ok(rec.totalInterest != null && rec.totalInterest > 0);
  });

  it("very long maturity (40y) still computes", () => {
    const r = calculateMortgageDecision(
      decisionInput(MODEL_FALLBACK_RATE_PERCENT, { termYears: 40 })
    );
    const rec = r.scenarios.find((s) => s.view === "recommended")!;
    assert.ok(rec.monthlyPayment != null && rec.monthlyPayment > 0);
    assert.equal(r.stressTests.length, 3);
  });

  it("invalid income still returns finite scenarios (may be zero loan)", () => {
    const r = calculateMortgageDecision(
      decisionInput(MODEL_FALLBACK_RATE_PERCENT, {
        netIncome: 0,
        ownFunds: 0,
        propertyPrice: 0,
      })
    );
    assert.ok(Array.isArray(r.scenarios));
    assert.equal(r.scenarios.length, 3);
    assert.ok(r.scenarios.every((s) => Number.isFinite(s.loanAmount)));
  });
});

describe("fallback order documentation invariants", () => {
  it("LIVE beats cache and model", () => {
    const cached: CachedVerifiedRate = {
      rateWithInsurance: 9,
      rateWithoutInsurance: 9.3,
      updatedAt: daysAgo(5),
      cachedAt: daysAgo(1),
    };
    const r = resolveMortgageRate({
      rateWithInsurance: 4.74,
      rateWithoutInsurance: 5.04,
      updatedAt: hoursAgo(1),
      hasInsurance: true,
      cachedVerified: cached,
      nowMs: NOW,
    });
    assert.equal(r.layer, "LIVE");
    assert.equal(r.ratePercent, 4.74);
  });

  it("VERIFIED_RECENT beats MODEL when DB is soft-stale", () => {
    const r = resolveMortgageRate({
      rateWithInsurance: 4.8,
      rateWithoutInsurance: 5.1,
      updatedAt: daysAgo(30),
      hasInsurance: true,
      nowMs: NOW,
    });
    assert.equal(r.layer, "VERIFIED_RECENT");
    assert.notEqual(r.ratePercent, MODEL_FALLBACK_RATE_PERCENT);
  });
});
