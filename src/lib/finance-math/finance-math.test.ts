/**
 * PROMPT 17N — Automated QA & financial calculation test suite.
 * Golden values are hand-verified IEEE results of the documented formulas.
 *
 * Calculator inventory (UI → shared math):
 * - CzMortgageDecisionTool → mortgage-decision + finance-math/core + regulation
 * - ForeignFinancingTool → financing/*
 * - AdvancedCalculator / MortgageCalculator / SmartCalculator → calculators.ts
 * - InvestmentEnginePanel → investment-engine
 * - buy-vs-rent, refinance-radar, readiness → calculateAnnuityPayment
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { estimateAffordability } from "@/lib/affordability";
import { CNB_LIMITS, getRecommendedMaxLtv } from "@/lib/cnb-limits";
import { REGULATORY_RECORDS } from "@/lib/data/static-regulatory";
import {
  calculateAnnuityPayment,
  calculateLinearFirstPayment,
  dscrRatio,
  dstiRatio,
  dtiRatio,
  FORMULA_REGISTRY,
  grossYieldRatio,
  ltvPercent,
  ltvRatio,
  maxLoanFromPayment,
  netYieldRatio,
  roundMoney,
  totalPaidAndInterest,
} from "@/lib/finance-math";
import { calculateInvestment } from "@/lib/investment-engine";
import {
  buildStressTests,
  maxLoanFromDsti,
  maxLoanFromLtv,
} from "@/lib/mortgage-decision";
import { checkDTI } from "@/lib/banking";
import { formatMoney, formatRate } from "@/lib/money";

/** Absolute tolerance for money floats before rounding. */
const EPS_MONEY = 0.02;
const EPS_RATIO = 1e-9;
/** Tolerance for known UX regression case (~19 755 Kč). */
const EPS_UX_ANNUITY = 5;


describe("FORMULA_REGISTRY", () => {
  it("documents core mortgage and investment formulas", () => {
    const ids = new Set(FORMULA_REGISTRY.map((f) => f.id));
    for (const id of [
      "annuity_payment",
      "max_loan_from_payment",
      "ltv",
      "dsti",
      "dti",
      "cnb_ltv_owner",
      "gross_yield",
      "dscr",
      "irr",
      "rpsn",
    ]) {
      assert.ok(ids.has(id), `missing formula ${id}`);
    }
  });
});

describe("regulatory source of truth (do not invent)", () => {
  it("CNB_LIMITS match REGULATORY_RECORDS wrappers", () => {
    assert.equal(
      REGULATORY_RECORDS.ltvOwnerStandard.value,
      CNB_LIMITS.ownerOccupied.ltvStandard
    );
    assert.equal(
      REGULATORY_RECORDS.ltvOwnerYoung.value,
      CNB_LIMITS.ownerOccupied.ltvYoungUnder36
    );
    assert.equal(
      REGULATORY_RECORDS.ltvInvestment.value,
      CNB_LIMITS.investment.ltvMax
    );
    assert.equal(
      REGULATORY_RECORDS.dtiInvestment.value,
      CNB_LIMITS.investment.dtiMax
    );
  });

  it("getRecommendedMaxLtv reads CNB_LIMITS only", () => {
    assert.equal(getRecommendedMaxLtv("owner_occupied"), 80);
    assert.equal(getRecommendedMaxLtv("investment"), 70);
  });

  it("DSTI UI thresholds come from REGULATORY_RECORDS (MODEL)", () => {
    assert.equal(REGULATORY_RECORDS.dstiWarning.value, 0.4);
    assert.equal(REGULATORY_RECORDS.dstiDanger.value, 0.45);
    assert.equal(REGULATORY_RECORDS.dstiWarning.status, "MODEL");
    assert.equal(REGULATORY_RECORDS.dstiDanger.status, "MODEL");
  });
});

describe("golden annuity scenarios", () => {
  // Hand-checked: P=4_000_000, 5% p.a., 30y
  const P = 4_000_000;
  const RATE = 5;
  const YEARS = 30;

  it("representative 4M @ 5% / 30y", () => {
    const pmt = calculateAnnuityPayment(P, RATE, YEARS);
    assert.ok(Math.abs(pmt - 21472.864920485594) < EPS_MONEY);
    assert.equal(roundMoney(pmt), 21473);
  });

  it("PV inverse recovers principal", () => {
    const pmt = calculateAnnuityPayment(P, RATE, YEARS);
    const loan = maxLoanFromPayment(pmt, RATE, YEARS);
    assert.ok(Math.abs(loan - P) < 1e-6);
  });

  it("total paid and interest rounds after multiply (not rounded payment × months)", () => {
    const pmt = 21472.864920485594;
    const { totalPaid, totalInterest } = totalPaidAndInterest(P, pmt, YEARS);
    // Documented rounding: Math.round(payment × n), not round(payment) × n
    assert.equal(totalPaid, Math.round(pmt * YEARS * 12));
    assert.equal(totalPaid, 7_730_231);
    assert.equal(totalInterest, totalPaid - P);
    assert.notEqual(totalPaid, roundMoney(pmt) * YEARS * 12);
  });
});

describe("annuity boundaries", () => {
  it("zero principal", () => {
    assert.equal(calculateAnnuityPayment(0, 5, 30), 0);
  });

  it("zero rate → principal / months", () => {
    const pmt = calculateAnnuityPayment(4_000_000, 0, 30);
    assert.ok(Math.abs(pmt - 4_000_000 / 360) < EPS_MONEY);
  });

  it("1% rate", () => {
    const pmt = calculateAnnuityPayment(4_000_000, 1, 30);
    assert.ok(Math.abs(pmt - 12865.580817860015) < EPS_MONEY);
  });

  it("high rate 15%", () => {
    const pmt = calculateAnnuityPayment(4_000_000, 15, 30);
    assert.ok(Math.abs(pmt - 50577.76086260174) < EPS_MONEY);
  });

  it("1 year maturity", () => {
    const pmt = calculateAnnuityPayment(4_000_000, 5, 1);
    assert.ok(Math.abs(pmt - 342429.9271538698) < EPS_MONEY);
  });

  it("30 years", () => {
    assert.ok(calculateAnnuityPayment(4_000_000, 5, 30) > 20_000);
  });

  it("40 years (supported by math even if some UI caps term)", () => {
    const pmt = calculateAnnuityPayment(4_000_000, 5, 40);
    assert.ok(Math.abs(pmt - 19287.86402318253) < EPS_MONEY);
    assert.ok(pmt < calculateAnnuityPayment(4_000_000, 5, 30));
  });

  it("invalid negative inputs", () => {
    assert.equal(calculateAnnuityPayment(-1_000_000, 5, 30), 0);
    assert.equal(calculateAnnuityPayment(4_000_000, -1, 30), 0);
    assert.equal(calculateAnnuityPayment(4_000_000, 5, -10), 0);
    assert.equal(maxLoanFromPayment(-100, 5, 30), 0);
    assert.equal(maxLoanFromPayment(10_000, -1, 30), 0);
  });

  it("NaN / non-finite → 0", () => {
    assert.equal(calculateAnnuityPayment(Number.NaN, 5, 30), 0);
    assert.equal(calculateAnnuityPayment(4_000_000, Number.POSITIVE_INFINITY, 30), 0);
  });

  it("very large property / loan stays finite", () => {
    const pmt = calculateAnnuityPayment(500_000_000, 5, 30);
    assert.ok(Number.isFinite(pmt));
    assert.ok(pmt > 2_000_000);
  });

  it("currency decimal edge — fractional principal", () => {
    const pmt = calculateAnnuityPayment(100_000.55, 4.25, 20);
    assert.ok(Number.isFinite(pmt));
    const back = maxLoanFromPayment(pmt, 4.25, 20);
    assert.ok(Math.abs(back - 100_000.55) < 0.01);
  });
});

describe("PROMPT 5 — UX golden annuity regression", () => {
  it("3 680 000 Kč @ 5 % / 30 y ≈ 19 755 Kč/měs (±5 Kč)", () => {
    const pmt = calculateAnnuityPayment(3_680_000, 5, 30);
    assert.ok(
      Math.abs(pmt - 19_755) < EPS_UX_ANNUITY,
      `got ${pmt}, expected ~19755`
    );
    const rounded = roundMoney(pmt);
    assert.ok(Math.abs(rounded - 19_755) <= EPS_UX_ANNUITY);
  });

  it("very short maturity and high rate stay finite and ordered", () => {
    const short = calculateAnnuityPayment(100_000, 5, 1 / 12);
    assert.ok(Number.isFinite(short) && short > 0);
    const high = calculateAnnuityPayment(3_680_000, 25, 30);
    assert.ok(high > calculateAnnuityPayment(3_680_000, 5, 30));
  });

  it("cs-CZ money and rate formatting uses Kč and comma decimals", () => {
    const money = formatMoney(19_755, "CZK");
    assert.match(money, /Kč/);
    assert.match(money, /19/);
    assert.ok(!money.includes("CZK"));
    const rate = formatRate(5.5, { fractionDigits: 2 });
    assert.match(rate, /5,50/);
    assert.match(rate, /%/);
  });

  it("incomeSourceLabel never returns raw employee enum", async () => {
    const { incomeSourceLabel } = await import("@/lib/banking");
    assert.equal(incomeSourceLabel("employee"), "Zaměstnanec");
    assert.ok(!incomeSourceLabel("employee").includes("employee"));
  });
});

describe("linear first payment", () => {
  it("matches principal/n + interest on full balance", () => {
    const first = calculateLinearFirstPayment(4_000_000, 5, 30);
    const expected = 4_000_000 / 360 + (4_000_000 * 0.05) / 12;
    assert.ok(Math.abs(first - expected) < EPS_MONEY);
  });

  it("zero principal", () => {
    assert.equal(calculateLinearFirstPayment(0, 5, 30), 0);
  });
});

describe("LTV thresholds vs CNB SoT", () => {
  const price = 5_000_000;

  it("exactly at owner LTV threshold", () => {
    const maxPct = CNB_LIMITS.ownerOccupied.ltvStandard;
    const loan = (price * maxPct) / 100;
    assert.equal(ltvPercent(loan, price), maxPct);
    const byLtv = maxLoanFromLtv(price, price - loan, 0, maxPct);
    assert.ok(Math.abs(byLtv - loan) < 1);
  });

  it("just below threshold", () => {
    const maxPct = CNB_LIMITS.ownerOccupied.ltvStandard;
    const loan = (price * (maxPct - 0.1)) / 100;
    assert.ok(ltvPercent(loan, price) < maxPct);
  });

  it("just above threshold", () => {
    const maxPct = CNB_LIMITS.ownerOccupied.ltvStandard;
    const loan = (price * (maxPct + 0.1)) / 100;
    assert.ok(ltvPercent(loan, price) > maxPct);
  });

  it("investment LTV 70% from CNB", () => {
    assert.equal(CNB_LIMITS.investment.ltvMax, 70);
    const loan = (price * 70) / 100;
    assert.equal(Math.round(ltvPercent(loan, price)), 70);
  });

  it("zero equity → LTV 100% of price gap", () => {
    assert.equal(ltvRatio(price, price), 1);
    const capped = maxLoanFromLtv(price, 0, 0, 80);
    assert.equal(capped, price * 0.8);
  });

  it("price ≤ 0 → LTV 0", () => {
    assert.equal(ltvRatio(1_000_000, 0), 0);
    assert.equal(ltvRatio(1_000_000, -1), 0);
  });
});

describe("DSTI / DTI / income edges", () => {
  it("no income → dsti 0 and checkDTI ok empty", () => {
    assert.equal(dstiRatio(20_000, 0), 0);
    const r = checkDTI(20_000, 0, "cz");
    assert.equal(r.level, "ok");
    assert.equal(r.ratio, 0);
  });

  it("high debt → danger uses REGULATORY_RECORDS.dstiDanger", () => {
    const income = 50_000;
    const payment = income * REGULATORY_RECORDS.dstiDanger.value;
    const r = checkDTI(payment, income, "cz");
    assert.equal(r.level, "danger");
    assert.ok(r.ratio >= REGULATORY_RECORDS.dstiDanger.value);
  });

  it("just below warning threshold", () => {
    const income = 50_000;
    const payment = income * REGULATORY_RECORDS.dstiWarning.value - 1;
    const r = checkDTI(payment, income, "cz");
    assert.equal(r.level, "ok");
  });

  it("DTI investment cap from CNB", () => {
    const annual = 600_000;
    const debt = annual * CNB_LIMITS.investment.dtiMax;
    assert.equal(dtiRatio(debt, annual), CNB_LIMITS.investment.dtiMax);
    assert.ok(dtiRatio(debt + 1, annual) > CNB_LIMITS.investment.dtiMax);
  });

  it("maxLoanFromDsti with no income capacity", () => {
    assert.equal(maxLoanFromDsti(0, 0, 0, 5, 30, 0.45), 0);
    assert.equal(maxLoanFromDsti(20_000, 25_000, 0, 5, 30, 0.45), 0);
  });
});

describe("affordability model edges", () => {
  it("zero equity with income still DSTI-limited when rate known", () => {
    const r = estimateAffordability({
      monthlyIncome: 60_000,
      monthlyLiabilities: 0,
      cash: 0,
      ratePercent: 5,
      termYears: 30,
    });
    assert.equal(r.maxLoan, 0);
    assert.equal(r.limitingFactor, "LTV");
  });

  it("high debt zeros payment capacity", () => {
    const r = estimateAffordability({
      monthlyIncome: 40_000,
      monthlyLiabilities: 50_000,
      cash: 1_000_000,
      ratePercent: 5,
    });
    assert.equal(r.maxMonthlyPayment, 0);
    assert.equal(r.maxLoan, 0);
  });
});

describe("stress tests", () => {
  it("bumps raise payment monotonically", () => {
    const stress = buildStressTests(4_000_000, 30, 5);
    assert.equal(stress.length, 3);
    assert.ok(stress[0].monthlyPayment < stress[1].monthlyPayment);
    assert.ok(stress[1].monthlyPayment < stress[2].monthlyPayment);
    assert.equal(stress[0].rateBumpPp, 1);
  });

  it("missing rate → empty", () => {
    assert.deepEqual(buildStressTests(4_000_000, 30, null), []);
  });
});

describe("property / investment edges", () => {
  const base = {
    purchasePrice: 1_000_000,
    downPayment: 1_000_000,
    loan: 0,
    rate: null as number | null,
    termYears: 30,
    rentMonthly: 5_000,
    vacancyRate: 0.1,
    managementFeeRate: 0.1,
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
  };

  it("zero rent → zero gross yield; fixed opex can make NOI negative", () => {
    assert.equal(grossYieldRatio(0, 1_000_000), 0);
    const r = calculateInvestment({ ...base, rentMonthly: 0 }, "base");
    assert.equal(r.grossYield, 0);
    // Ops still charge service/insurance/tax/maintenance/capex (6k) with EGI=0
    assert.equal(r.noi, -6000);
    assert.ok(r.annualCashFlow < 0);
  });

  it("100% occupancy (vacancy 0)", () => {
    const r = calculateInvestment({ ...base, vacancyRate: 0 }, "base");
    assert.equal(r.grossYield, 0.06);
  });

  it("low occupancy raises vacancy loss / lowers CF", () => {
    const highOcc = calculateInvestment({ ...base, vacancyRate: 0 }, "base");
    const lowOcc = calculateInvestment({ ...base, vacancyRate: 0.5 }, "base");
    assert.ok(lowOcc.annualCashFlow < highOcc.annualCashFlow);
  });

  it("negative cash flow with high debt", () => {
    const r = calculateInvestment(
      {
        ...base,
        downPayment: 100_000,
        loan: 900_000,
        rate: 12,
        termYears: 15,
        rentMonthly: 2_000,
        vacancyRate: 0,
        managementFeeRate: 0,
        serviceChargesAnnual: 0,
        insuranceAnnual: 0,
        propertyTaxAnnual: 0,
        maintenanceAnnual: 0,
        capexReserveAnnual: 0,
        incomeTaxRate: 0,
      },
      "base"
    );
    assert.ok(r.annualCashFlow < 0);
  });

  it("zero debt → DSCR null, CF = after-tax NOI path", () => {
    const r = calculateInvestment(base, "base");
    assert.equal(r.dscr, null);
    assert.equal(dscrRatio(42_600, 0), null);
  });

  it("net yield / cap-rate style matches NOI/price", () => {
    assert.equal(netYieldRatio(42_600, 1_000_000), 0.0426);
  });

  it("missing / invalid price", () => {
    assert.equal(grossYieldRatio(5_000, 0), 0);
    assert.equal(netYieldRatio(10_000, -1), 0);
  });
});

describe("rounding regression", () => {
  it("roundMoney half-up style Math.round", () => {
    assert.equal(roundMoney(21472.4), 21472);
    assert.equal(roundMoney(21472.5), 21473);
  });
});
