import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculateAnnuityPayment } from "@/lib/finance-math/core";
import {
  buildPremiumRentgenInput,
  projectYearlyCashFlows,
  resolveLoanAmount,
  runPremiumRentgenAudit,
  simulateRateShock,
  RentgenMathValidationError,
} from "@/lib/property-rentgen/rentgen-math-engine";

const baseInput = buildPremiumRentgenInput({
  property: {
    label: "TEST Praha",
    purchasePriceCzk: 7_200_000,
    capexCzk: 420_000,
    closingCostsCzk: 120_000,
    monthlyGrossRentCzk: 32_000,
    monthlyOperatingCostsCzk: 4_500,
    monthlyReserveCzk: 2_500,
    vacancyRate: 0.05,
  },
  mortgage: {
    ownFundsCzk: 1_800_000,
    annualRatePercent: 4.89,
    termYears: 30,
    fixationYears: 5,
  },
  market: {
    rentGrowthPa: 0.03,
    opexGrowthPa: 0.04,
    propertyAppreciationPa: 0.03,
    sp500ReturnPa: 0.08,
    projectionYears: 30,
    rateShockPercents: [7, 9],
  },
});

describe("rentgenMathEngine — loan & annuity", () => {
  it("resolves loan = purchase − equity", () => {
    const loan = resolveLoanAmount(baseInput.property, baseInput.mortgage);
    assert.equal(loan, 5_400_000);
  });

  it("year-1 payment matches finance-math annuity", () => {
    const loan = resolveLoanAmount(baseInput.property, baseInput.mortgage);
    const expected = calculateAnnuityPayment(loan, 4.89, 30);
    const rows = projectYearlyCashFlows(
      baseInput.property,
      baseInput.mortgage,
      baseInput.market,
      loan
    );
    assert.equal(rows.length, 30);
    assert.ok(Math.abs(rows[0]!.monthlyPaymentCzk - Math.round(expected)) <= 1);
  });
});

describe("rentgenMathEngine — 30Y cash-flow", () => {
  it("amortizes principal over time and grows rent", () => {
    const result = runPremiumRentgenAudit(baseInput);
    const y1 = result.yearlyCashFlows[0]!;
    const y30 = result.yearlyCashFlows[29]!;

    assert.ok(y1.loanBalanceEndCzk < 5_400_000);
    assert.ok(y30.loanBalanceEndCzk < y1.loanBalanceEndCzk);
    assert.ok(y30.annualEffectiveRentCzk > y1.annualEffectiveRentCzk);
    assert.ok(y30.equityCzk > y1.equityCzk);
    assert.equal(result.summary.loanAmountCzk, 5_400_000);
    assert.ok(result.summary.totalDealCostCzk === 7_200_000 + 420_000 + 120_000);
  });

  it("rejects invalid vacancy", () => {
    assert.throws(
      () =>
        runPremiumRentgenAudit({
          ...baseInput,
          property: { ...baseInput.property, vacancyRate: 1.5 },
        }),
      RentgenMathValidationError
    );
  });
});

describe("rentgenMathEngine — rate shock at year 6", () => {
  it("reprices annuity after 5y fixation at 7% and 9%", () => {
    const loan = resolveLoanAmount(baseInput.property, baseInput.mortgage);
    const stress = simulateRateShock(
      baseInput.property,
      baseInput.mortgage,
      baseInput.market,
      loan
    );

    assert.equal(stress.fixationYears, 5);
    assert.equal(stress.scenarios.length, 2);
    const s7 = stress.scenarios.find((s) => s.shockRatePercent === 7)!;
    const s9 = stress.scenarios.find((s) => s.shockRatePercent === 9)!;
    assert.ok(s7.monthlyPaymentAfterShockCzk > stress.baseMonthlyPaymentCzk);
    assert.ok(s9.monthlyPaymentAfterShockCzk > s7.monthlyPaymentAfterShockCzk);
    assert.equal(s7.remainingTermYearsAtShock, 25);
    assert.ok(s7.loanBalanceAtShockCzk > 0);
    assert.ok(s7.loanBalanceAtShockCzk < loan);
  });
});

describe("rentgenMathEngine — wealth creation", () => {
  it("compares leveraged equity vs 8% S&P path", () => {
    const result = runPremiumRentgenAudit(baseInput);
    const { wealthCreation } = result;
    assert.equal(wealthCreation.points.length, 30);
    assert.equal(wealthCreation.sp500ReturnPa, 0.08);
    // S&P compounds from initial equity only
    const y10 = wealthCreation.points[9]!;
    const expectedSp = Math.round(
      wealthCreation.initialEquityCzk * Math.pow(1.08, 10)
    );
    assert.equal(y10.sp500ValueCzk, expectedSp);
    assert.ok(wealthCreation.terminal.propertyEquityCzk > 0);
  });
});
