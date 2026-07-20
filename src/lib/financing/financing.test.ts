/**
 * Unit tests — financing types (LOCAL / CZECH_EQUITY / DEVELOPER / CASH / UNAVAILABLE).
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BALI_DEVELOPER_SCHEDULE,
  DUBAI_DEVELOPER_SCHEDULE,
  calculateDeveloperPlanSchedule,
  calculateFinancing,
  defaultOwnFundsForCountry,
  getFinancingProducts,
  hasLocalMortgageProduct,
  LOCAL_FINANCING_UNVERIFIED_MESSAGE,
} from "@/lib/financing/index";

describe("country product catalog", () => {
  it("Bali has no LOCAL_MORTGAGE", () => {
    assert.equal(hasLocalMortgageProduct("bali"), false);
    assert.ok(
      getFinancingProducts("bali").every((p) => p.option !== "LOCAL_MORTGAGE")
    );
  });

  it("Dubai separates developer plan and non-resident mortgage", () => {
    const products = getFinancingProducts("dubai");
    assert.ok(products.some((p) => p.option === "DEVELOPER_PAYMENT_PLAN"));
    const local = products.find((p) => p.option === "LOCAL_MORTGAGE");
    assert.ok(local);
    assert.equal(local!.maxLtvPercent, 50);
    assert.equal(local!.ratePercentPa, null);
    assert.equal(local!.calculable, false);
  });

  it("Spain non-resident LTV is not 80 %", () => {
    const local = getFinancingProducts("spain").find(
      (p) => p.option === "LOCAL_MORTGAGE"
    );
    assert.ok(local);
    assert.equal(local!.maxLtvPercent, 70);
    assert.notEqual(local!.maxLtvPercent, 80);
    assert.equal(local!.ratePercentPa, null);
  });

  it("Italy, Croatia, Slovakia, Saudi have no hardcoded local rate product", () => {
    for (const country of ["italy", "croatia", "slovakia", "saudi"] as const) {
      assert.equal(hasLocalMortgageProduct(country), false);
      for (const p of getFinancingProducts(country)) {
        assert.equal(p.ratePercentPa, null);
      }
    }
  });

  it("default own funds for Dubai respects 50 % LTV (not 20 % equity)", () => {
    const funds = defaultOwnFundsForCountry("dubai", 2_000_000);
    assert.equal(funds, 1_000_000);
  });

  it("default own funds for Spain respects 70 % LTV", () => {
    const funds = defaultOwnFundsForCountry("spain", 350_000);
    assert.equal(funds, 105_000);
  });
});

describe("DEVELOPER_PAYMENT_PLAN", () => {
  it("calculates phase schedule — not annuity interest", () => {
    const plan = calculateDeveloperPlanSchedule(
      1_000_000,
      DUBAI_DEVELOPER_SCHEDULE
    );
    assert.equal(plan.totalPaid, 1_000_000);
    assert.equal(plan.phases.length, 4);

    const booking = plan.phases.find((p) => p.id === "booking")!;
    assert.equal(booking.amount, 100_000);
    assert.equal(booking.monthlyPayment, 100_000);

    const construction = plan.phases.find(
      (p) => p.id === "during_construction"
    )!;
    assert.equal(construction.amount, 500_000);
    assert.equal(construction.durationMonths, 36);
    assert.equal(construction.monthlyPayment, Math.round(500_000 / 36));

    const result = calculateFinancing({
      country: "dubai",
      option: "DEVELOPER_PAYMENT_PLAN",
      propertyPrice: 1_000_000,
      ownFunds: 100_000,
      termYears: 25,
      czechEquityRatePercentPa: null,
    });
    assert.equal(result.calculable, true);
    assert.equal(result.totalInterest, 0);
    assert.ok(result.developerPhases);
    assert.match(result.message ?? "", /není bankovní hypotéka/i);
  });

  it("Bali developer schedule has no local mortgage confusion", () => {
    const plan = calculateDeveloperPlanSchedule(
      200_000,
      BALI_DEVELOPER_SCHEDULE
    );
    assert.equal(plan.totalPaid, 200_000);
    const post = plan.phases.find((p) => p.id === "post_handover")!;
    assert.equal(post.amount, 0);

    const result = calculateFinancing({
      country: "bali",
      option: "DEVELOPER_PAYMENT_PLAN",
      propertyPrice: 200_000,
      ownFunds: 40_000,
      termYears: 20,
      czechEquityRatePercentPa: null,
    });
    assert.equal(result.option, "DEVELOPER_PAYMENT_PLAN");
    assert.equal(result.totalInterest, 0);
    assert.equal(result.ltv, null);
    assert.equal(result.maxLtvPercent, null);
  });
});

describe("LOCAL_MORTGAGE", () => {
  it("Dubai non-resident does not invent payment", () => {
    const result = calculateFinancing({
      country: "dubai",
      option: "LOCAL_MORTGAGE",
      propertyPrice: 2_000_000,
      ownFunds: 800_000,
      termYears: 25,
      czechEquityRatePercentPa: null,
    });
    assert.equal(result.calculable, false);
    assert.equal(result.monthlyPayment, null);
    assert.equal(result.message, LOCAL_FINANCING_UNVERIFIED_MESSAGE);
    assert.equal(result.maxLtvPercent, 50);
    assert.equal(result.ltvExceedsMax, true); // 60 % > 50 %
  });

  it("Spain flags LTV above 70 % without inventing 80 % loan", () => {
    const result = calculateFinancing({
      country: "spain",
      option: "LOCAL_MORTGAGE",
      propertyPrice: 400_000,
      ownFunds: 40_000, // 90 % LTV
      termYears: 30,
      czechEquityRatePercentPa: null,
    });
    assert.equal(result.maxLtvPercent, 70);
    assert.equal(result.ltvExceedsMax, true);
    assert.equal(result.calculable, false);
    assert.equal(result.monthlyPayment, null);
  });
});

describe("CZECH_EQUITY_LOAN", () => {
  it("calculates annuity only with live rate", () => {
    const withRate = calculateFinancing({
      country: "italy",
      option: "CZECH_EQUITY_LOAN",
      propertyPrice: 400_000,
      ownFunds: 100_000,
      termYears: 20,
      czechEquityRatePercentPa: 5.5,
    });
    assert.equal(withRate.calculable, true);
    assert.equal(withRate.currency, "CZK");
    assert.ok(withRate.monthlyPayment != null && withRate.monthlyPayment > 0);
    assert.match(withRate.message ?? "", /≠ lokální hypotéka/);

    const without = calculateFinancing({
      country: "italy",
      option: "CZECH_EQUITY_LOAN",
      propertyPrice: 400_000,
      ownFunds: 100_000,
      termYears: 20,
      czechEquityRatePercentPa: null,
    });
    assert.equal(without.calculable, false);
    assert.equal(without.monthlyPayment, null);
  });
});

describe("CASH", () => {
  it("financed amount is zero", () => {
    const result = calculateFinancing({
      country: "croatia",
      option: "CASH",
      propertyPrice: 300_000,
      ownFunds: 300_000,
      termYears: 1,
      czechEquityRatePercentPa: null,
    });
    assert.equal(result.financedAmount, 0);
    assert.equal(result.monthlyPayment, 0);
    assert.equal(result.totalInterest, 0);
  });
});

describe("UNAVAILABLE / missing local product", () => {
  it("Italy local mortgage option returns unverified message", () => {
    const result = calculateFinancing({
      country: "italy",
      option: "LOCAL_MORTGAGE",
      propertyPrice: 400_000,
      ownFunds: 100_000,
      termYears: 25,
      czechEquityRatePercentPa: null,
    });
    assert.equal(result.available, false);
    assert.equal(result.message, LOCAL_FINANCING_UNVERIFIED_MESSAGE);
  });

  it("Saudi has no invented universal rate", () => {
    const result = calculateFinancing({
      country: "saudi",
      option: "LOCAL_MORTGAGE",
      propertyPrice: 1_000_000,
      ownFunds: 200_000,
      termYears: 25,
      czechEquityRatePercentPa: 5,
    });
    assert.equal(result.calculable, false);
    assert.equal(result.monthlyPayment, null);
  });
});
