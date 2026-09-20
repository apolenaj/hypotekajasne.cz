/**
 * Mandatory control examples for company / rent / construction scenarios.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  computeCompanyFinance,
  computeDscr,
} from "@/lib/scenarios/company-finance";
import { computeFutureRent } from "@/lib/scenarios/future-rent-finance";
import {
  computeConstructionFinance,
  interestForCumulativeDrawn,
} from "@/lib/scenarios/construction-finance";
import { calculateAnnuityPayment } from "@/lib/finance-math/core";

describe("future rent control example A", () => {
  it("matches recognized income and cash after costs", () => {
    const result = computeFutureRent({
      monthlyRentExServicesCzk: 20_000,
      rentTiming: "future",
      otherNetMonthlyIncomeCzk: 50_000,
      recognitionSharePercent: 70,
      loanAmountCzk: 0,
      annualRatePercent: 5,
      termYears: 30,
      vacancyMonthsPerYear: 1,
      fixedAnnualOwnerCostsCzk: 24_000,
      managementPercentOfCollected: 0,
      annualRepairReserveCzk: 12_000,
      monthlyPaymentOverrideCzk: 15_000,
    });

    assert.equal(result.recognizedMonthlyRentCzk, 14_000);
    assert.equal(result.totalModelMonthlyIncomeCzk, 64_000);
    assert.equal(result.annualCollectedRentCzk, 220_000);
    assert.equal(result.operatingSurplusAnnualCzk, 196_000);
    assert.equal(result.annualCashAfterDebtAndReserveCzk, 4_000);
    assert.ok(
      Math.abs(result.averageMonthlyCashAfterDebtAndReserveCzk - 333.3333333333) <
        1e-9
    );
  });
});

describe("DSCR control example B", () => {
  it("returns 1.25 and no_debt_service when service is zero", () => {
    const dscr = computeDscr(600_000, 480_000);
    assert.equal(dscr.kind, "ratio");
    if (dscr.kind === "ratio") {
      assert.equal(dscr.value, 1.25);
    }
    assert.equal(computeDscr(600_000, 0).kind, "no_debt_service");
  });
});

describe("drawdown interest control example C", () => {
  it("charges interest on cumulative beginning-of-month drawn principal", () => {
    assert.equal(interestForCumulativeDrawn(1_000_000, 6), 5_000);
    assert.equal(interestForCumulativeDrawn(2_000_000, 6), 10_000);
  });
});

describe("owned land control example D", () => {
  it("does not reduce loan need by owned land value", () => {
    const result = computeConstructionFinance({
      variant: "own_land_and_build",
      budget: {
        landPurchaseCzk: 0,
        designAndSurveysCzk: 0,
        permitsCzk: 0,
        utilitiesCzk: 0,
        constructionCzk: 5_000_000,
        finishingAndExteriorCzk: 0,
        furnitureCzk: 0,
        otherCzk: 0,
      },
      ownedLandValueCzk: 2_000_000,
      availableCashCzk: 1_000_000,
      completedPropertyValueCzk: 8_000_000,
      modelLtvLimitPercent: 90,
      annualRatePercent: 5,
      drawdownMonths: 12,
      amortisationYears: 25,
      reservePercentOfBase: 0,
      concurrentHousingMonthlyCzk: 0,
    });

    assert.equal(result.newProjectExpensesBeforeReserveCzk, 5_000_000);
    assert.equal(result.loanNeedCzk, 4_000_000);
    assert.equal(result.ownedLandValueCzk, 2_000_000);
    assert.notEqual(result.loanNeedCzk, 2_000_000);
  });
});

describe("edge cases", () => {
  it("handles zero rate annuity as principal / n", () => {
    const pmt = calculateAnnuityPayment(1_200_000, 0, 10);
    assert.equal(pmt, 10_000);
    const company = computeCompanyFinance({
      propertyPriceCzk: 1_200_000,
      ancillaryCostsCzk: 0,
      equityCzk: 0,
      collateralValueCzk: 1_200_000,
      annualRatePercent: 0,
      termYears: 10,
      modelLtvLimitPercent: 80,
    });
    assert.equal(company.monthlyPaymentCzk, 10_000);
  });

  it("marks LTV unknown when collateral missing", () => {
    const company = computeCompanyFinance({
      propertyPriceCzk: 5_000_000,
      ancillaryCostsCzk: 100_000,
      equityCzk: 1_000_000,
      collateralValueCzk: null,
      annualRatePercent: 5,
      termYears: 20,
      modelLtvLimitPercent: 70,
    });
    assert.equal(company.ltvPercent, null);
    assert.equal(company.ltvLabel, "LTV nelze určit");
    assert.equal(company.loanNeedCzk, 4_100_000);
  });

  it("flags first cash shortfall month in construction schedule", () => {
    const result = computeConstructionFinance({
      variant: "buy_land_and_build",
      budget: {
        landPurchaseCzk: 0,
        designAndSurveysCzk: 0,
        permitsCzk: 0,
        utilitiesCzk: 0,
        constructionCzk: 3_000_000,
        finishingAndExteriorCzk: 0,
        furnitureCzk: 0,
        otherCzk: 0,
      },
      ownedLandValueCzk: 0,
      availableCashCzk: 50_000,
      completedPropertyValueCzk: 4_000_000,
      modelLtvLimitPercent: 80,
      annualRatePercent: 6,
      drawdownMonths: 3,
      amortisationYears: 25,
      reservePercentOfBase: 0,
      concurrentHousingMonthlyCzk: 40_000,
      customTranchesCzk: [100_000, 100_000, 100_000],
    });
    assert.ok(result.firstShortfallMonth != null);
    assert.ok(result.firstShortfallMonth! >= 1);
  });
});
