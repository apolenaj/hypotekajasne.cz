/**
 * Unit tests — česká hypoteční decision matematika.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatCurrency } from "@/lib/calculators";
import {
  buildStressTests,
  calculateMortgageDecision,
  estimateInsuranceMonthlyCost,
  estimateLivingCosts,
  maxLoanFromDsti,
  maxLoanFromLtv,
  totalPaidAndInterest,
  type MortgageDecisionInput,
} from "@/lib/mortgage-decision";

function baseInput(
  overrides: Partial<MortgageDecisionInput> = {}
): MortgageDecisionInput {
  return {
    purpose: "owner_occupied",
    age: 35,
    netIncome: 60_000,
    incomeSource: "employee",
    household: { adults: 2, children: 1 },
    propertyPrice: 5_000_000,
    ownFunds: 1_000_000,
    otherLiabilities: 0,
    creditLimitPayments: 0,
    termYears: 30,
    fixationYears: 5,
    hasInsurance: true,
    extraCollateral: 0,
    nominalRate: 4.74,
    rateWithInsurance: 4.74,
    rateWithoutInsurance: 5.04,
    representativeApr: 5.1,
    hasValidAprExample: true,
    ...overrides,
  };
}

describe("formatCurrency cs-CZ", () => {
  it("formats CZK with Kč and narrow spaces", () => {
    const s = formatCurrency(4_000_000, "CZK");
    assert.match(s, /4/);
    assert.match(s, /000/);
    assert.match(s, /Kč/);
    assert.ok(!s.includes("CZK"));
    assert.ok(!s.includes(","));
  });

  it("formats monthly payment style", () => {
    const s = formatCurrency(19_771, "CZK");
    assert.match(s, /19/);
    assert.match(s, /771/);
    assert.match(s, /Kč/);
  });
});

describe("maxLoanFromLtv", () => {
  it("respects LTV and equity", () => {
    const loan = maxLoanFromLtv(5_000_000, 1_000_000, 0, 80);
    assert.equal(loan, 4_000_000);
  });

  it("cannot exceed price − equity", () => {
    const loan = maxLoanFromLtv(5_000_000, 2_000_000, 0, 90);
    assert.equal(loan, 3_000_000);
  });
});

describe("maxLoanFromDsti", () => {
  it("returns 0 when liabilities eat capacity", () => {
    const loan = maxLoanFromDsti(50_000, 30_000, 0, 5, 30, 0.45);
    assert.ok(loan >= 0);
    // 50k * 0.45 - 30k = -7500 → 0
    assert.equal(loan, 0);
  });

  it("scales with income", () => {
    const low = maxLoanFromDsti(40_000, 0, 0, 5, 30, 0.35);
    const high = maxLoanFromDsti(80_000, 0, 0, 5, 30, 0.35);
    assert.ok(high > low * 1.5);
  });
});

describe("totalPaidAndInterest", () => {
  it("interest is total − principal", () => {
    const { totalPaid, totalInterest } = totalPaidAndInterest(
      1_000_000,
      10_000,
      10
    );
    assert.equal(totalPaid, 1_200_000);
    assert.equal(totalInterest, 200_000);
  });
});

describe("estimateInsuranceMonthlyCost", () => {
  it("returns null when preferential rate with insurance (premium unknown)", () => {
    // Typický CZ případ: sazba s pojištěním je nižší → pojistné neznáme
    assert.equal(
      estimateInsuranceMonthlyCost(3_000_000, 30, 4.74, 5.04, true),
      null
    );
  });

  it("estimates embedded cost when rate with insurance is higher", () => {
    const cost = estimateInsuranceMonthlyCost(
      3_000_000,
      30,
      5.2,
      4.9,
      true
    );
    assert.ok(cost != null && cost > 0);
  });

  it("returns 0 when insurance not selected", () => {
    assert.equal(
      estimateInsuranceMonthlyCost(3_000_000, 30, 4.74, 5.04, false),
      0
    );
  });

  it("returns null when rate missing", () => {
    assert.equal(
      estimateInsuranceMonthlyCost(3_000_000, 30, 4.74, null, true),
      null
    );
  });
});

describe("buildStressTests", () => {
  it("builds +1 +2 +3 scenarios", () => {
    const tests = buildStressTests(3_000_000, 30, 5);
    assert.equal(tests.length, 3);
    assert.equal(tests[0].rate, 6);
    assert.equal(tests[2].rate, 8);
    assert.ok(tests[2].monthlyPayment > tests[0].monthlyPayment);
  });

  it("empty without rate", () => {
    assert.equal(buildStressTests(3_000_000, 30, null).length, 0);
  });
});

describe("estimateLivingCosts", () => {
  it("grows with household", () => {
    assert.ok(
      estimateLivingCosts({ adults: 2, children: 2 }) >
        estimateLivingCosts({ adults: 1, children: 0 })
    );
  });
});

describe("calculateMortgageDecision", () => {
  it("never implies approval — has disclaimer", () => {
    const r = calculateMortgageDecision(baseInput());
    assert.match(r.disclaimer, /Nejde o nabídku|příslib/i);
  });

  it("returns three budget views", () => {
    const r = calculateMortgageDecision(baseInput());
    assert.equal(r.scenarios.length, 3);
    assert.ok(r.scenarios.every((s) => s.loanAmount >= 0));
    const bank = r.scenarios.find((s) => s.view === "bank_max")!;
    const cons = r.scenarios.find((s) => s.view === "conservative")!;
    assert.ok(bank.loanAmount >= cons.loanAmount);
  });

  it("hides RPSN without valid example", () => {
    const r = calculateMortgageDecision(
      baseInput({ hasValidAprExample: false, representativeApr: 5.2 })
    );
    assert.equal(r.rpsn, null);
  });

  it("exposes RPSN when example valid", () => {
    const r = calculateMortgageDecision(baseInput());
    assert.equal(r.rpsn, 5.1);
  });

  it("stress tests use recommended loan", () => {
    const r = calculateMortgageDecision(baseInput());
    assert.equal(r.stressTests.length, 3);
  });

  it("young applicant can use higher LTV for owner-occupied", () => {
    const young = calculateMortgageDecision(baseInput({ age: 30 }));
    const older = calculateMortgageDecision(baseInput({ age: 40 }));
    assert.equal(young.maxLtvPercent, 90);
    assert.equal(older.maxLtvPercent, 80);
  });
});
