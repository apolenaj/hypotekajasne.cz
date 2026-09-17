import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CONTROL_GOLDEN,
  CONTROL_MODEL_INPUTS,
  ControlModelValidationError,
  computeMonthlyAnnuity,
  runControlModel,
  runControlScenarios,
} from "@/lib/property-rentgen/control-model";

const EPS = 0.02;
const EPS_PCT = 1e-5;

function assertClose(actual: number, expected: number, eps = EPS, label = "") {
  assert.ok(
    Math.abs(actual - expected) <= eps,
    `${label} expected ${expected}, got ${actual} (eps ${eps})`
  );
}

describe("control model — golden results", () => {
  it("matches binding control metrics within 0.02 Kč", () => {
    const r = runControlModel();
    assert.equal(r.pricePerM2Czk, CONTROL_GOLDEN.pricePerM2Czk);
    assert.equal(
      r.totalAcquisitionCostCzk,
      CONTROL_GOLDEN.totalAcquisitionCostCzk
    );
    assert.equal(
      r.totalOwnCashIncludingReserveCzk,
      CONTROL_GOLDEN.totalOwnCashIncludingReserveCzk
    );
    assert.equal(
      r.operatingSurplusAfterReserveCzk,
      CONTROL_GOLDEN.operatingSurplusAfterReserveCzk
    );
    assertClose(r.monthlyPaymentCzk, CONTROL_GOLDEN.monthlyPaymentCzk, EPS, "A");
    assertClose(
      r.monthlyCashFlowCzk,
      CONTROL_GOLDEN.monthlyCashFlowCzk,
      EPS,
      "CF/m"
    );
    assertClose(
      r.annualCashFlowCzk,
      CONTROL_GOLDEN.annualCashFlowCzk,
      EPS,
      "CF/y"
    );
    assertClose(
      r.principalPaidFirst12MonthsCzk,
      CONTROL_GOLDEN.principalPaidFirst12MonthsCzk,
      EPS,
      "prin12"
    );
    assertClose(
      r.rentForZeroCashFlowCzk,
      CONTROL_GOLDEN.rentForZeroCashFlowCzk,
      EPS,
      "rentBE"
    );
    assertClose(
      r.purchasePriceForZeroCashFlowAt70LoanCzk,
      CONTROL_GOLDEN.purchasePriceForZeroCashFlowAt70LoanCzk,
      EPS,
      "Pmax"
    );
    assertClose(
      r.grossYieldOnPurchase,
      CONTROL_GOLDEN.grossYieldOnPurchase,
      EPS_PCT,
      "gross%"
    );
    assertClose(
      r.operatingYieldOnAcquisition,
      CONTROL_GOLDEN.operatingYieldOnAcquisition,
      EPS_PCT,
      "op%"
    );
    assertClose(
      r.cashOnCashIncludingReserve,
      CONTROL_GOLDEN.cashOnCashIncludingReserve,
      EPS_PCT,
      "coc%"
    );
  });

  it("matches three scenario cash-flows", () => {
    const scenarios = runControlScenarios();
    const adverse = scenarios.find((s) => s.id === "adverse")!;
    const base = scenarios.find((s) => s.id === "base")!;
    const fav = scenarios.find((s) => s.id === "favorable")!;
    assertClose(
      adverse.monthlyPaymentCzk,
      CONTROL_GOLDEN.adverseMonthlyPaymentCzk,
      EPS
    );
    assertClose(
      adverse.monthlyCashFlowCzk,
      CONTROL_GOLDEN.adverseMonthlyCashFlowCzk,
      EPS
    );
    assertClose(base.monthlyCashFlowCzk, CONTROL_GOLDEN.monthlyCashFlowCzk, EPS);
    assertClose(
      fav.monthlyCashFlowCzk,
      CONTROL_GOLDEN.favorableMonthlyCashFlowCzk,
      EPS
    );
  });
});

describe("control model — edge cases", () => {
  it("supports zero interest rate", () => {
    const payment = computeMonthlyAnnuity(2_940_000, 0, 30);
    assertClose(payment, 2_940_000 / 360, EPS);
  });

  it("supports zero loan", () => {
    const r = runControlModel({ ...CONTROL_MODEL_INPUTS, loanAmountCzk: 0 });
    assert.equal(r.monthlyPaymentCzk, 0);
    assert.ok(r.monthlyCashFlowCzk > 0);
  });

  it("handles 100% vacancy", () => {
    const r = runControlModel({ ...CONTROL_MODEL_INPUTS, vacancyRate: 1 });
    assert.equal(r.collectedAnnualRentCzk, 0);
    assert.ok(r.monthlyCashFlowCzk < 0);
  });

  it("rejects invalid term", () => {
    assert.throws(
      () =>
        runControlModel({
          ...CONTROL_MODEL_INPUTS,
          termYears: 0,
        }),
      ControlModelValidationError
    );
  });
});
