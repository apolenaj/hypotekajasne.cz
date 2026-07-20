import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { estimateAffordability } from "@/lib/affordability";

describe("estimateAffordability", () => {
  it("limits by DSTI when rate is known and DSTI loan is smaller", () => {
    const r = estimateAffordability({
      monthlyIncome: 60_000,
      monthlyLiabilities: 5_000,
      cash: 2_000_000,
      ratePercent: 5,
      termYears: 30,
    });
    assert.ok(r.hasRate);
    assert.ok(r.maxMonthlyPayment > 0);
    assert.ok(r.maxLoan > 0);
    assert.equal(r.maxPropertyPrice, r.maxLoan + 2_000_000);
    // max payment = 60k * 0.45 - 5k = 22k
    assert.equal(r.maxMonthlyPayment, 22_000);
  });

  it("falls back to LTV-only (cash × 4) without rate", () => {
    const r = estimateAffordability({
      monthlyIncome: 50_000,
      monthlyLiabilities: 0,
      cash: 1_000_000,
      ratePercent: null,
    });
    assert.equal(r.hasRate, false);
    assert.equal(r.maxLoan, 4_000_000);
    assert.equal(r.maxPropertyPrice, 5_000_000);
    assert.equal(r.limitingFactor, "LTV");
  });

  it("uses LTV as limiting factor when equity cap is tighter", () => {
    const r = estimateAffordability({
      monthlyIncome: 200_000,
      monthlyLiabilities: 0,
      cash: 500_000,
      ratePercent: 4,
      termYears: 30,
    });
    // High income → large DSTI capacity; cash × 4 = 2M caps loan
    assert.equal(r.limitingFactor, "LTV");
    assert.equal(r.maxLoan, 2_000_000);
  });

  it("never returns negative loan or payment", () => {
    const r = estimateAffordability({
      monthlyIncome: 10_000,
      monthlyLiabilities: 20_000,
      cash: 0,
      ratePercent: 5,
    });
    assert.equal(r.maxMonthlyPayment, 0);
    assert.equal(r.maxLoan, 0);
    assert.equal(r.maxPropertyPrice, 0);
  });
});
