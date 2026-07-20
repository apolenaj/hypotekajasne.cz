/**
 * Unit tests — investment engine s předem známými výsledky.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyScenario,
  buildWaterfall,
  calculateInvestment,
  calculateIrr,
  calculateXirr,
  remainingLoanBalance,
  type InvestmentEngineInput,
} from "@/lib/investment-engine/index";

/** Fixtures s ručně spočítanými výsledky */
function allCashInput(
  overrides: Partial<InvestmentEngineInput> = {}
): InvestmentEngineInput {
  return {
    purchasePrice: 1_000_000,
    downPayment: 1_000_000,
    loan: 0,
    rate: null,
    termYears: 30,
    rentMonthly: 5_000, // 60 000 / rok
    vacancyRate: 0.1, // −6 000
    managementFeeRate: 0.1, // 10 % z EGI
    serviceChargesAnnual: 2_000,
    insuranceAnnual: 1_000,
    propertyTaxAnnual: 1_000,
    incomeTaxRate: 0.15,
    maintenanceAnnual: 1_000,
    capexReserveAnnual: 1_000,
    furnishing: 0,
    acquisitionCosts: 0,
    sellingCostRate: 0.03,
    annualRentGrowth: 0,
    annualPropertyGrowth: 0,
    annualFxReturn: 0,
    holdingPeriodYears: 1,
    ...overrides,
  };
}

describe("waterfall known values", () => {
  it("matches hand-computed year-1 CF", () => {
    // PGI 60_000
    // vacancy 6_000 → EGI 54_000
    // opex 2k+1k+1k+1k+1k = 6_000
    // management 5_400
    // NOI = 54_000 − 6_000 − 5_400 = 42_600
    // tax 15 % × 42_600 = 6_390
    // debt 0
    // CF = 42_600 − 6_390 = 36_210
    const r = calculateInvestment(allCashInput(), "base");
    assert.equal(r.noi, 42600);
    assert.equal(r.annualCashFlow, 36210);
    assert.equal(r.monthlyCashFlow, 3017.5);
    assert.equal(r.grossYield, 0.06);
    assert.equal(r.netYield, 0.0426);
    assert.equal(r.cashOnCashReturn, 0.03621);
    assert.equal(r.roeYear1, 0.03621);

    const wf = buildWaterfall({
      grossRentAnnual: 60_000,
      vacancyLoss: 6_000,
      effectiveGrossIncome: 54_000,
      operatingExpenses: 6_000,
      managementFee: 5_400,
      noi: 42_600,
      incomeTax: 6_390,
      annualDebtService: 0,
      annualCashFlow: 36_210,
    });
    assert.equal(wf[0].label, "Hrubý nájem");
    assert.equal(wf[0].amount, 60_000);
    assert.equal(wf.at(-1)?.id, "net_cash_flow");
    assert.equal(wf.at(-1)?.runningTotal, 36_210);
  });
});

describe("levered DSCR and break-even", () => {
  it("computes DSCR and break-even occupancy", () => {
    // Loan 800k @ 0 % for easy debt service: payment = 800k/(30*12)
    const principal = 800_000;
    const months = 30 * 12;
    const monthly = principal / months;
    const annualDebt = monthly * 12; // = 800_000/30

    const r = calculateInvestment(
      allCashInput({
        downPayment: 200_000,
        loan: 800_000,
        rate: 0,
        termYears: 30,
        vacancyRate: 0,
        managementFeeRate: 0,
        serviceChargesAnnual: 0,
        insuranceAnnual: 0,
        propertyTaxAnnual: 0,
        maintenanceAnnual: 0,
        capexReserveAnnual: 0,
        incomeTaxRate: 0,
        rentMonthly: 10_000, // PGI 120_000
      }),
      "base"
    );

    assert.ok(Math.abs(r.annualDebtService - annualDebt) < 0.02);
    assert.equal(r.noi, 120_000);
    assert.ok(r.dscr != null);
    assert.ok(Math.abs(r.dscr! - 120_000 / annualDebt) < 0.01);
    // break-even occ = debt / PGI
    assert.ok(r.breakEvenOccupancy != null);
    assert.ok(
      Math.abs(r.breakEvenOccupancy! - annualDebt / 120_000) < 1e-6
    );
  });
});

describe("Cash-on-Cash uses net CF not gross rent", () => {
  it("is lower than gross yield when opex/tax exist", () => {
    const r = calculateInvestment(allCashInput(), "base");
    assert.ok(r.cashOnCashReturn != null);
    assert.ok(r.cashOnCashReturn! < r.grossYield);
    // Explicit: not rent/price
    assert.notEqual(r.cashOnCashReturn, r.grossYield);
  });
});

describe("scenarios", () => {
  it("bear raises vacancy vs base", () => {
    const base = allCashInput({ vacancyRate: 0.05 });
    const bearIn = applyScenario(base, "bear");
    const bullIn = applyScenario(base, "bull");
    assert.ok(Math.abs(bearIn.vacancyRate - 0.08) < 1e-9);
    assert.ok(Math.abs(bullIn.vacancyRate - 0.03) < 1e-9);
    const bear = calculateInvestment(base, "bear");
    const bull = calculateInvestment(base, "bull");
    assert.ok(bear.annualCashFlow < bull.annualCashFlow);
  });
});

describe("IRR known case", () => {
  it("all-cash 1y hold with flat price → IRR ≈ CoC path", () => {
    // Equity 1M, CF 36210, exit = 1M * 0.97 (3% selling) = 970_000
    // flows: -1_000_000, 36_210 + 970_000 = 1_006_210
    // IRR = 1_006_210/1_000_000 - 1 = 0.621%
    const r = calculateInvestment(allCashInput(), "base");
    assert.ok(r.irr != null);
    assert.ok(Math.abs(r.irr! - 0.00621) < 1e-4);
    assert.equal(r.exitSalePrice, 1_000_000);
    assert.equal(r.exitProceeds, 970_000);
    assert.equal(r.remainingDebt, 0);
    assert.equal(r.equityBuildUp, 0);
  });

  it("calculateIrr matches textbook 10 %", () => {
    // -100, +110 → 10 %
    const irr = calculateIrr([-100, 110]);
    assert.ok(irr != null);
    assert.ok(Math.abs(irr! - 0.1) < 1e-6);
  });

  it("calculateXirr matches 10 % over one year", () => {
    const x = calculateXirr(
      [-100, 110],
      [new Date("2026-01-01"), new Date("2027-01-01")]
    );
    assert.ok(x != null);
    assert.ok(Math.abs(x! - 0.1) < 1e-4);
  });
});

describe("remaining debt", () => {
  it("is zero after full term", () => {
    const bal = remainingLoanBalance(800_000, 5, 30, 30);
    assert.ok(bal < 1);
  });

  it("equals principal at t=0", () => {
    assert.equal(remainingLoanBalance(800_000, 5, 30, 0), 800_000);
  });
});

describe("initial equity includes acquisition and furnishing", () => {
  it("adds costs into CoC denominator", () => {
    const r = calculateInvestment(
      allCashInput({
        acquisitionCosts: 50_000,
        furnishing: 50_000,
      }),
      "base"
    );
    assert.equal(r.initialEquity, 1_100_000);
    assert.ok(r.cashOnCashReturn != null);
    assert.ok(
      Math.abs(r.cashOnCashReturn! - 36_210 / 1_100_000) < 1e-6
    );
  });
});
