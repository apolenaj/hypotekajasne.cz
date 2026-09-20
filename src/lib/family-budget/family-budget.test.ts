/**
 * Kontrolní testy časového modelu rodinného rozpočtu a odhadu.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculateAppraisalVsPrice } from "@/lib/family-budget/appraisal";
import {
  applyScenarioPreset,
  buildParenthoodPhases,
  simulateFamilyBudget,
} from "@/lib/family-budget/timeline";
import type { FamilyBudgetInput } from "@/lib/family-budget/types";
import { calculateAnnuityPayment, roundMoney } from "@/lib/finance-math/core";

function baseInput(over: Partial<FamilyBudgetInput> = {}): FamilyBudgetInput {
  return {
    horizonMonths: 60,
    initialLiquidReserveCzk: 300_000,
    adults: [
      {
        id: "a1",
        label: "Dospělý 1",
        regularNetMonthlyCzk: 45_000,
        irregularIncludedMonthlyCzk: 0,
        phases: [],
      },
      {
        id: "a2",
        label: "Dospělý 2",
        regularNetMonthlyCzk: 35_000,
        irregularIncludedMonthlyCzk: 0,
        phases: [],
      },
    ],
    otherMonthlyIncomeCzk: 0,
    rentalCashflowMonthlyCzk: 0,
    rentalAlreadyNetOfCostsAndLoans: true,
    expenses: [
      {
        id: "life",
        category: "other",
        kind: "essential",
        label: "Životní výdaje",
        amountCzk: 35_000,
        cadence: "monthly",
      },
    ],
    mortgage: {
      principalCzk: 4_000_000,
      annualRatePercent: 5,
      termYears: 30,
      monthlyPaymentCzk: 25_000,
    },
    rentEndsMonth: null,
    parenthood: {
      enabled: false,
      adultId: "a2",
      startMonth: 13,
      maternityMonthlyCzk: 0,
      maternityMonths: 0,
      parentalAllowanceBalanceCzk: 0,
      parentalAllowanceMonthlyDrawCzk: 0,
      gapMonthsBeforeReturn: 0,
      returnMonthlyCzk: 35_000,
      returnIsPartial: false,
      oneTimeChildCostsCzk: 0,
      extraMonthlyChildCostsCzk: 0,
      childcareAfterReturnMonthlyCzk: 0,
    },
    incomeGap: {
      enabled: false,
      adultId: "a1",
      startMonth: 1,
      durationMonths: 3,
      replacementMonthlyCzk: 0,
    },
    refixation: {
      enabled: false,
      month: 36,
      rateIncreasePp: 2,
    },
    livingExpenseMultiplier: 1,
    minReserveMode: "czk",
    minReserveCzk: 100_000,
    minReserveMonths: 3,
    applyParenthood: false,
    ...over,
  };
}

describe("family-budget control phases", () => {
  it("months 1–12: +20k surplus, reserve 540k at month 12", () => {
    const result = simulateFamilyBudget(
      baseInput({
        adults: [
          {
            id: "a1",
            label: "Dospělý 1",
            regularNetMonthlyCzk: 45_000,
            irregularIncludedMonthlyCzk: 0,
            phases: [],
          },
          {
            id: "a2",
            label: "Dospělý 2",
            regularNetMonthlyCzk: 35_000,
            irregularIncludedMonthlyCzk: 0,
            phases: [
              {
                startMonth: 13,
                endMonth: 36,
                amountCzk: 12_000,
                replacesRegularWage: true,
                label: "testovací příjem",
              },
            ],
          },
        ],
        expenses: [
          {
            id: "life",
            category: "other",
            kind: "essential",
            label: "Životní výdaje",
            amountCzk: 35_000,
            cadence: "monthly",
            startMonth: 1,
            endMonth: 12,
          },
          {
            id: "life2",
            category: "other",
            kind: "essential",
            label: "Životní výdaje fáze 2",
            amountCzk: 40_000,
            cadence: "monthly",
            startMonth: 13,
            endMonth: 36,
          },
        ],
        horizonMonths: 36,
      })
    );

    const m1 = result.months[0]!;
    assert.equal(m1.incomeTotalCzk, 80_000);
    assert.equal(m1.expenseTotalCzk, 60_000);
    assert.equal(m1.operatingBalanceCzk, 20_000);
    assert.equal(result.months[11]!.reserveEndCzk, 540_000);

    const m13 = result.months[12]!;
    assert.equal(m13.incomeTotalCzk, 57_000);
    assert.equal(m13.expenseTotalCzk, 65_000);
    assert.equal(m13.operatingBalanceCzk, -8_000);
    assert.equal(result.months[35]!.reserveEndCzk, 348_000);
  });

  it("stops parental allowance after balance is exhausted", () => {
    const built = buildParenthoodPhases({
      enabled: true,
      adultId: "a2",
      startMonth: 1,
      maternityMonthlyCzk: 0,
      maternityMonths: 0,
      parentalAllowanceBalanceCzk: 30_000,
      parentalAllowanceMonthlyDrawCzk: 12_000,
      gapMonthsBeforeReturn: 0,
      returnMonthlyCzk: 20_000,
      returnIsPartial: true,
      oneTimeChildCostsCzk: 0,
      extraMonthlyChildCostsCzk: 0,
      childcareAfterReturnMonthlyCzk: 0,
    });
    assert.equal(built.allowanceSchedule.length, 3);
    assert.equal(built.allowanceSchedule[2]!.amountCzk, 6_000);
    assert.equal(built.allowanceExhaustedMonth, 3);
  });

  it("removes replaced wage during parenthood phase", () => {
    const result = simulateFamilyBudget(
      baseInput({
        applyParenthood: true,
        parenthood: {
          enabled: true,
          adultId: "a2",
          startMonth: 1,
          maternityMonthlyCzk: 12_000,
          maternityMonths: 6,
          parentalAllowanceBalanceCzk: 0,
          parentalAllowanceMonthlyDrawCzk: 0,
          gapMonthsBeforeReturn: 0,
          returnMonthlyCzk: 35_000,
          returnIsPartial: false,
          oneTimeChildCostsCzk: 0,
          extraMonthlyChildCostsCzk: 0,
          childcareAfterReturnMonthlyCzk: 0,
        },
        horizonMonths: 6,
      })
    );
    // 45k + 12k (replaced 35k), not 45+35+12
    assert.equal(result.months[0]!.incomeTotalCzk, 57_000);
  });

  it("does not double-subtract wage when gap and parenthood would overlap same adult — gap wins in window", () => {
    const result = simulateFamilyBudget(
      baseInput({
        applyParenthood: true,
        parenthood: {
          enabled: true,
          adultId: "a1",
          startMonth: 1,
          maternityMonthlyCzk: 10_000,
          maternityMonths: 6,
          parentalAllowanceBalanceCzk: 0,
          parentalAllowanceMonthlyDrawCzk: 0,
          gapMonthsBeforeReturn: 0,
          returnMonthlyCzk: 45_000,
          returnIsPartial: false,
          oneTimeChildCostsCzk: 0,
          extraMonthlyChildCostsCzk: 0,
          childcareAfterReturnMonthlyCzk: 0,
        },
        incomeGap: {
          enabled: true,
          adultId: "a1",
          startMonth: 1,
          durationMonths: 3,
          replacementMonthlyCzk: 5_000,
        },
        horizonMonths: 3,
      })
    );
    // Gap takes precedence for adult a1; a2 still 35k → 5k + 35k = 40k
    assert.equal(result.months[0]!.incomeTotalCzk, 40_000);
  });

  it("refixation uses remaining principal and new rate", () => {
    const principal = 3_000_000;
    const rate = 4;
    const years = 25;
    const payment = roundMoney(calculateAnnuityPayment(principal, rate, years));
    const result = simulateFamilyBudget(
      baseInput({
        mortgage: {
          principalCzk: principal,
          annualRatePercent: rate,
          termYears: years,
          monthlyPaymentCzk: payment,
        },
        refixation: { enabled: true, month: 13, rateIncreasePp: 2 },
        horizonMonths: 14,
        adults: [
          {
            id: "a1",
            label: "A",
            regularNetMonthlyCzk: 100_000,
            irregularIncludedMonthlyCzk: 0,
            phases: [],
          },
        ],
        expenses: [],
      })
    );
    assert.equal(result.months[0]!.mortgagePaymentCzk, payment);
    assert.ok(result.months[12]!.markers.includes("refixation"));
    assert.notEqual(result.months[12]!.mortgagePaymentCzk, payment);
    assert.ok(result.months[12]!.mortgagePaymentCzk > payment);
  });

  it("ends rent after move-in month and keeps own housing ops", () => {
    const result = simulateFamilyBudget(
      baseInput({
        rentEndsMonth: 3,
        expenses: [
          {
            id: "rent",
            category: "rent",
            kind: "essential",
            label: "Nájem",
            amountCzk: 15_000,
            cadence: "monthly",
          },
          {
            id: "ops",
            category: "own_housing_ops",
            kind: "essential",
            label: "Provoz vlastního bydlení",
            amountCzk: 5_000,
            cadence: "monthly",
            startMonth: 4,
          },
          {
            id: "life",
            category: "other",
            kind: "essential",
            label: "Život",
            amountCzk: 10_000,
            cadence: "monthly",
          },
        ],
        horizonMonths: 5,
        adults: [
          {
            id: "a1",
            label: "A",
            regularNetMonthlyCzk: 80_000,
            irregularIncludedMonthlyCzk: 0,
            phases: [],
          },
        ],
        mortgage: {
          principalCzk: 1,
          annualRatePercent: 0,
          termYears: 1,
          monthlyPaymentCzk: 0,
        },
      })
    );
    assert.equal(result.months[2]!.essentialExpenseCzk, 25_000); // rent+life
    assert.equal(result.months[3]!.essentialExpenseCzk, 15_000); // ops+life, no rent
  });

  it("books one-time expense once", () => {
    const result = simulateFamilyBudget(
      baseInput({
        expenses: [
          {
            id: "life",
            category: "other",
            kind: "essential",
            label: "Život",
            amountCzk: 10_000,
            cadence: "monthly",
          },
          {
            id: "move",
            category: "other",
            kind: "one_time",
            label: "Stěhování",
            amountCzk: 50_000,
            cadence: "monthly",
            startMonth: 2,
            endMonth: 2,
          },
        ],
        mortgage: {
          principalCzk: 0,
          annualRatePercent: 0,
          termYears: 1,
          monthlyPaymentCzk: 0,
        },
        adults: [
          {
            id: "a1",
            label: "A",
            regularNetMonthlyCzk: 40_000,
            irregularIncludedMonthlyCzk: 0,
            phases: [],
          },
        ],
        horizonMonths: 3,
        initialLiquidReserveCzk: 100_000,
      })
    );
    assert.equal(result.months[1]!.oneTimeExpenseCzk, 50_000);
    assert.equal(result.months[2]!.oneTimeExpenseCzk, 0);
  });

  it("tracks reserve exhaustion and uncovered deficit", () => {
    const result = simulateFamilyBudget(
      baseInput({
        initialLiquidReserveCzk: 10_000,
        adults: [
          {
            id: "a1",
            label: "A",
            regularNetMonthlyCzk: 10_000,
            irregularIncludedMonthlyCzk: 0,
            phases: [],
          },
        ],
        expenses: [
          {
            id: "life",
            category: "other",
            kind: "essential",
            label: "Život",
            amountCzk: 20_000,
            cadence: "monthly",
          },
        ],
        mortgage: {
          principalCzk: 0,
          annualRatePercent: 0,
          termYears: 1,
          monthlyPaymentCzk: 0,
        },
        horizonMonths: 5,
      })
    );
    assert.equal(result.verdict, "uncovered_deficit");
    assert.ok(result.firstReserveExhaustionMonth != null);
    assert.ok(result.months.some((m) => m.uncoveredDeficitCzk > 0));
  });

  it("handles missing inputs and zero rate mortgage payment", () => {
    const result = simulateFamilyBudget(
      baseInput({
        adults: [],
        expenses: [],
        mortgage: {
          principalCzk: 120_000,
          annualRatePercent: 0,
          termYears: 10,
          monthlyPaymentCzk: 1_000,
        },
        horizonMonths: 2,
        initialLiquidReserveCzk: 0,
      })
    );
    assert.equal(result.months[0]!.mortgagePaymentCzk, 1_000);
    assert.equal(result.months[0]!.incomeTotalCzk, 0);
  });

  it("scenario presets do not enable conflicting flags on current", () => {
    const preset = applyScenarioPreset(baseInput(), "current");
    assert.equal(preset.applyParenthood, false);
    assert.equal(preset.incomeGap.enabled, false);
    assert.equal(preset.refixation.enabled, false);
    assert.equal(preset.livingExpenseMultiplier, 1);
  });
});

describe("appraisal vs purchase price", () => {
  it("computes missing capital when appraisal is below purchase", () => {
    const r = calculateAppraisalVsPrice({
      purchasePriceCzk: 5_000_000,
      bankRecognizedValueCzk: 4_500_000,
      ownCashCzk: 500_000,
      sideCostsCzk: 100_000,
      modelLtvLimit: 0.8,
      additionalCollateralValueCzk: 0,
      additionalCollateralUnencumberedAccepted: false,
    });
    assert.equal(r.ltvCapCzk, 3_600_000);
    assert.ok(r.missingCapitalCzk > 0);
    assert.ok(r.gapFromLowerAppraisalCzk > 0);
  });

  it("does not sum encumbered extra collateral", () => {
    const r = calculateAppraisalVsPrice({
      purchasePriceCzk: 5_000_000,
      bankRecognizedValueCzk: 5_000_000,
      ownCashCzk: 1_000_000,
      sideCostsCzk: 0,
      modelLtvLimit: 0.8,
      additionalCollateralValueCzk: 2_000_000,
      additionalCollateralUnencumberedAccepted: false,
    });
    assert.equal(r.effectiveCollateralBaseCzk, 5_000_000);
    assert.ok(r.warnings.length > 0);
  });
});
