/**
 * Decision Lab — unit testy s očekávanými výsledky.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { simulateBuyVsRent } from "@/lib/decision-lab/buy-vs-rent";
import {
  RENT_VS_BUY_DEFAULTS,
  buildAmortizationSchedule,
  simulateRentVsBuy,
} from "@/lib/decision-lab/rent-vs-buy-cashflow";
import { simulateFutureLab } from "@/lib/decision-lab/future-lab";
import { simulateHistoricalLab } from "@/lib/decision-lab/historical-lab";

const BASE = {
  purchasePrice: 5_000_000,
  monthlyRent: 20_000,
  mortgageRate: 4.5,
  downPayment: 1_000_000,
  maintenanceRate: 0.015,
  transactionCostRate: 0.045,
  annualPropertyGrowth: 0.02,
  annualRentGrowth: 0.02,
  alternativeEquityReturn: 0.04,
  horizonYears: 15,
  termYears: 30,
} as const;

const ENGINE = {
  propertyPrice: 5_000_000,
  downPayment: 1_000_000,
  annualMortgageRatePct: 4.5,
  termYears: 30,
  monthlyOwnershipCosts: 6_250,
  monthlyRent: 20_000,
  horizonYears: 15,
  alternativeAnnualReturn: 0.07,
  annualPropertyGrowth: 0.03,
  annualRentGrowth: 0.02,
  transactionCostRate: 0,
} as const;

describe("rent vs buy cashflow", () => {
  it("uses approved defaults when growth and return are omitted", () => {
    const r = simulateRentVsBuy({
      propertyPrice: 1_000_000,
      downPayment: 200_000,
      annualMortgageRatePct: 4,
      termYears: 20,
      monthlyOwnershipCosts: 1_000,
      monthlyRent: 8_000,
      horizonYears: 5,
    });
    assert.equal(RENT_VS_BUY_DEFAULTS.alternativeAnnualReturn, 0.07);
    assert.equal(RENT_VS_BUY_DEFAULTS.annualPropertyGrowth, 0.03);
    assert.equal(RENT_VS_BUY_DEFAULTS.annualRentGrowth, 0.02);
    assert.equal(r.transactionCosts, 0);
    assert.equal(r.initialTenantCapital, 200_000);
    const y5 = r.months[5 * 12 - 1]!;
    assert.ok(Math.abs(y5.propertyValue - 1_000_000 * Math.pow(1.03, 5)) < 1);
  });

  it("Test A: 0% property growth keeps price flat", () => {
    const r = simulateRentVsBuy({ ...ENGINE, annualPropertyGrowth: 0 });
    for (const p of r.months) {
      assert.equal(p.propertyValue, ENGINE.propertyPrice);
      assert.ok(Number.isFinite(p.buyerNetWorth));
      assert.ok(Number.isFinite(p.tenantNetWorth));
    }
  });

  it("Test B: 0% rent growth keeps rent flat", () => {
    const r = simulateRentVsBuy({ ...ENGINE, annualRentGrowth: 0 });
    assert.ok(r.months.every((p) => p.rentPaid === 20_000));
    assert.equal(r.years[0]!.rentPaidThisYear, 240_000);
  });

  it("Test C: 0% alternative return does not compound idle capital", () => {
    const r = simulateRentVsBuy({
      ...ENGINE,
      alternativeAnnualReturn: 0,
      monthlyRent: 100_000,
      monthlyOwnershipCosts: 0,
      annualRentGrowth: 0,
      transactionCostRate: 0,
    });
    assert.equal(r.final.tenantContributions, 0);
    assert.ok(Math.abs(r.final.tenantNetWorth - ENGINE.downPayment) < 1);
  });

  it("Test D: 0% mortgage rate has no interest", () => {
    const r = simulateRentVsBuy({ ...ENGINE, annualMortgageRatePct: 0 });
    assert.ok(r.monthlyMortgage > 0);
    assert.ok(Math.abs(r.final.cumulativeInterest) < 1);
    assert.ok(r.final.debtRemaining >= 0);
    assert.ok(r.months.every((p) => p.mortgagePayment >= 0));
  });

  it("Test E: cash purchase / zero loan", () => {
    const r = simulateRentVsBuy({
      ...ENGINE,
      downPayment: ENGINE.propertyPrice,
      annualMortgageRatePct: 0,
    });
    assert.equal(r.loanAmount, 0);
    assert.equal(r.monthlyMortgage, 0);
    assert.equal(r.ltvPercent, 0);
    assert.equal(r.schedule.length, 0);
    assert.ok(r.months.every((p) => p.debtRemaining === 0));
  });

  it("Test F: very high rent is scenario B — tenant does not draw the portfolio", () => {
    const r = simulateRentVsBuy({
      ...ENGINE,
      monthlyRent: 80_000,
      annualRentGrowth: 0,
      alternativeAnnualReturn: 0,
      transactionCostRate: 0,
    });
    assert.ok(r.final.tenantSunkCosts > 80_000 * 12);
    assert.equal(r.final.tenantContributions, 0);
    assert.ok(r.final.buyerContributions > 0);
    assert.ok(Math.abs(r.final.tenantNetWorth - ENGINE.downPayment) < 1);
    assert.ok(r.final.buyerSavingsPortfolio > 0);
  });

  it("Test G: very low rent is scenario A — buyer savings stay empty", () => {
    const r = simulateRentVsBuy({
      ...ENGINE,
      monthlyRent: 1_000,
      annualRentGrowth: 0,
      alternativeAnnualReturn: 0,
      monthlyOwnershipCosts: 0,
      transactionCostRate: 0,
    });
    assert.equal(r.years[0]!.rentPaidThisYear, 12_000);
    assert.ok(r.final.tenantContributions > 0);
    assert.equal(r.final.buyerContributions, 0);
    assert.ok(Math.abs(r.final.buyerSavingsPortfolio) < 1);
    assert.ok(r.final.tenantNetWorth > ENGINE.downPayment);
  });

  it("Test H: horizon shorter than mortgage term leaves debt", () => {
    const r = simulateRentVsBuy({
      ...ENGINE,
      horizonYears: 10,
      termYears: 30,
    });
    assert.equal(r.years.length, 10);
    assert.equal(r.months.length, 120);
    assert.ok(r.final.debtRemaining > 0);
  });

  it("Test I: horizon equal to term pays the loan off", () => {
    const r = simulateRentVsBuy({
      ...ENGINE,
      horizonYears: 30,
      termYears: 30,
    });
    assert.equal(r.years.length, 30);
    assert.ok(r.final.debtRemaining < 1);
    assert.equal(r.schedule.length, 360);
    assert.ok(r.schedule[r.schedule.length - 1]!.balance < 1);
  });

  it("Test J: down payment equals price — no loan, LTV 0", () => {
    const r = simulateRentVsBuy({
      ...ENGINE,
      downPayment: ENGINE.propertyPrice,
    });
    assert.equal(r.loanAmount, 0);
    assert.equal(r.monthlyMortgage, 0);
    assert.equal(r.ltvPercent, 0);
    assert.ok(r.ltvPercent >= 0 && r.ltvPercent <= 100);
  });

  it("adds saved transaction costs to the tenant start, not to buyer equity", () => {
    const r = simulateRentVsBuy({
      ...ENGINE,
      transactionCostRate: 0.045,
      alternativeAnnualReturn: 0,
      monthlyRent: 100_000,
      annualRentGrowth: 0,
    });
    const tx = 5_000_000 * 0.045;
    assert.equal(r.transactionCosts, tx);
    assert.equal(r.initialTenantCapital, ENGINE.downPayment + tx);
    assert.ok(Math.abs(r.final.tenantNetWorth - (ENGINE.downPayment + tx)) < 1);
    assert.ok(r.final.buyerSunkCosts >= tx);
  });

  it("does not double-count principal or down payment as sunk cost", () => {
    const r = simulateRentVsBuy(ENGINE);
    const last = r.final;
    const expectedSunk =
      last.cumulativeInterest + last.cumulativeOwnership + r.transactionCosts;
    assert.ok(Math.abs(last.buyerSunkCosts - expectedSunk) < 1);
    assert.ok(last.buyerCumulativeCashOut > last.buyerSunkCosts);
    const equity = last.propertyValue - last.debtRemaining;
    assert.ok(
      Math.abs(last.buyerNetWorth - (equity + last.buyerSavingsPortfolio)) < 1
    );
    assert.ok(last.cumulativePrincipal > 0);
    assert.ok(last.buyerSunkCosts < last.cumulativePrincipal + expectedSunk);
  });

  it("amortization stays non-negative and finite", () => {
    const schedule = buildAmortizationSchedule(4_000_000, 4.5, 30);
    assert.equal(schedule.length, 360);
    assert.ok(schedule[0]!.payment > 0);
    let prev = 4_000_000;
    for (const row of schedule) {
      assert.ok(row.balance >= 0);
      assert.ok(row.balance <= prev + 0.01);
      assert.ok(row.interest >= -1e-6);
      assert.ok(row.principal >= -1e-6);
      assert.ok(Number.isFinite(row.payment));
      prev = row.balance;
    }
    const r = simulateRentVsBuy({
      ...ENGINE,
      downPayment: -100,
      propertyPrice: 0,
      monthlyRent: -5,
      annualMortgageRatePct: Number.NaN,
    });
    assert.equal(r.loanAmount, 0);
    assert.ok(r.months.every((p) => Number.isFinite(p.buyerNetWorth)));
    assert.ok(r.months.every((p) => Number.isFinite(p.tenantNetWorth)));
  });
});

describe("buy vs rent view", () => {
  it("projects the engine without a second formula and stays cautious", () => {
    const r = simulateBuyVsRent({
      ...BASE,
      mortgageRate: 5,
      annualPropertyGrowth: 0.03,
      horizonYears: 20,
    });
    assert.match(r.verdictSentence, /Při zadaných předpokladech/);
    assert.ok(!/Určitě kupte|Nájem je vždy/i.test(r.verdictSentence));
    assert.equal(r.series.length, 20);
    assert.match(r.costChartMeta.title, /bydlení stát/i);
    const engine = simulateRentVsBuy({
      propertyPrice: BASE.purchasePrice,
      downPayment: BASE.downPayment,
      annualMortgageRatePct: 5,
      termYears: BASE.termYears,
      monthlyOwnershipCosts: (BASE.purchasePrice * BASE.maintenanceRate) / 12,
      monthlyRent: BASE.monthlyRent,
      horizonYears: 20,
      alternativeAnnualReturn: BASE.alternativeEquityReturn,
      annualPropertyGrowth: 0.03,
      annualRentGrowth: BASE.annualRentGrowth,
      transactionCostRate: BASE.transactionCostRate,
    });
    assert.equal(
      r.series[19]!.buyNetWorth,
      Math.round(engine.final.buyerNetWorth)
    );
    assert.equal(
      r.series[19]!.rentNetWorth,
      Math.round(engine.final.tenantNetWorth)
    );
  });
});

describe("future lab reinvestment", () => {
  it("does not compound rent when reinvestmentReturn is 0", () => {
    const r = simulateFutureLab({
      purchasePrice: 1_000_000,
      scenario: "base",
      base: {
        propGrowth: 0,
        rentGrowth: 0,
        inflation: 0,
        startingYield: 0.06,
        reinvestmentReturn: 0,
        years: 3,
      },
    });
    assert.equal(r.reinvestmentEnabled, false);
    assert.equal(r.series[2].rentAccountNominal, 180_000);
    assert.match(r.chartMeta.methodology, /bez úročení/i);
  });

  it("compounds rent when reinvestmentReturn > 0", () => {
    const r = simulateFutureLab({
      purchasePrice: 1_000_000,
      scenario: "custom",
      base: {
        propGrowth: 0,
        rentGrowth: 0,
        inflation: 0,
        startingYield: 0.1,
        reinvestmentReturn: 0.1,
        years: 2,
      },
      custom: {
        propGrowth: 0,
        rentGrowth: 0,
        inflation: 0,
        startingYield: 0.1,
        reinvestmentReturn: 0.1,
        years: 2,
      },
    });
    assert.equal(r.reinvestmentEnabled, true);
    assert.equal(r.series[1].rentAccountNominal, 210_000);
  });
});

describe("historical lab", () => {
  it("separates nominal and real cash", () => {
    const r = simulateHistoricalLab({
      countryId: "cz",
      startYear: 2006,
      initialCash: 1_000_000,
      leverageLtv: 0.7,
      enabledAssets: ["cash", "property_cash"],
    });
    assert.ok(r);
    assert.ok(r!.cpiMultiple > 1);
    const end = r!.series[r!.series.length - 1];
    assert.equal(end.nominal.cash, 1_000_000);
    assert.ok((end.real.cash ?? 0) < 1_000_000);
  });
});
