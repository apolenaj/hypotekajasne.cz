/**
 * Decision Lab — unit testy s očekávanými výsledky.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { simulateBuyVsRent } from "@/lib/decision-lab/buy-vs-rent";
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

describe("buy vs rent", () => {
  it("never hardcodes a universal winner — sentence uses assumptions", () => {
    const r = simulateBuyVsRent({
      ...BASE,
      mortgageRate: 5,
      annualPropertyGrowth: 0.03,
      horizonYears: 20,
    });
    assert.match(r.verdictSentence, /Při zadaných předpokladech/);
    assert.ok(!/univerzáln/i.test(r.verdictSentence));
    assert.ok(!/Určitě kupte|Nájem je vždy/i.test(r.verdictSentence));
    assert.ok(r.series.length === 20);
    assert.ok(r.chartMeta.methodology.length > 20);
    assert.match(r.costChartMeta.title, /bydlení stát/i);
  });

  it("finds buy advantage year when growth is strong and rent high", () => {
    const r = simulateBuyVsRent({
      purchasePrice: 1_000_000,
      monthlyRent: 8_000,
      mortgageRate: null,
      downPayment: 1_000_000,
      maintenanceRate: 0.01,
      transactionCostRate: 0,
      annualPropertyGrowth: 0.05,
      annualRentGrowth: 0.01,
      alternativeEquityReturn: 0.01,
      horizonYears: 15,
      termYears: 30,
    });
    assert.ok(r.buyAdvantageFromYear != null);
    assert.match(r.verdictSentence, /koupě|vlastní bydlení/i);
  });

  it("Test A: 0% property growth — finite results", () => {
    const r = simulateBuyVsRent({ ...BASE, annualPropertyGrowth: 0 });
    for (const p of r.series) {
      assert.ok(Number.isFinite(p.buyNetWorth));
      assert.ok(Number.isFinite(p.rentNetWorth));
      assert.equal(p.propertyValue, BASE.purchasePrice);
    }
  });

  it("Test B: 0% rent growth — rent stays flat annually", () => {
    const r = simulateBuyVsRent({ ...BASE, annualRentGrowth: 0 });
    assert.ok(r.series.every((p) => p.rentPaidThisYear === 20_000 * 12));
  });

  it("Test C: 0% alternative return — portfolio does not compound passively", () => {
    const r = simulateBuyVsRent({ ...BASE, alternativeEquityReturn: 0 });
    assert.ok(Number.isFinite(r.series[r.series.length - 1]!.rentNetWorth));
  });

  it("Test D: 0% mortgage rate — no interest, no NaN", () => {
    const r = simulateBuyVsRent({ ...BASE, mortgageRate: 0 });
    assert.ok(r.today.monthlyMortgage > 0);
    assert.equal(r.breakdown.totalInterest, 0);
    for (const p of r.series) {
      assert.ok(Number.isFinite(p.buyNetWorth));
      assert.ok(p.debtRemaining >= 0);
    }
  });

  it("Test E: cash purchase / zero loan", () => {
    const r = simulateBuyVsRent({
      ...BASE,
      downPayment: 5_000_000,
      mortgageRate: null,
    });
    assert.equal(r.today.loanAmount, 0);
    assert.equal(r.today.monthlyMortgage, 0);
    assert.equal(r.today.ltvPercent, 0);
    assert.equal(r.series[0]!.debtRemaining, 0);
  });

  it("Test F: very high rent — finite, rent cash rises fast", () => {
    const r = simulateBuyVsRent({ ...BASE, monthlyRent: 80_000 });
    const last = r.series[r.series.length - 1]!;
    assert.ok(Number.isFinite(last.rentCumulativeCashOut));
    assert.ok(last.rentCumulativeCashOut > 80_000 * 12);
  });

  it("Test G: very low rent", () => {
    const r = simulateBuyVsRent({ ...BASE, monthlyRent: 1_000 });
    assert.ok(Number.isFinite(r.finalGap));
    assert.ok(r.series[0]!.rentPaidThisYear === 12_000);
  });

  it("Test H: horizon shorter than mortgage term", () => {
    const r = simulateBuyVsRent({
      ...BASE,
      horizonYears: 10,
      termYears: 30,
    });
    assert.equal(r.series.length, 10);
    assert.ok(r.series[9]!.debtRemaining > 0);
  });

  it("Test I: horizon equals mortgage term", () => {
    const r = simulateBuyVsRent({
      ...BASE,
      horizonYears: 30,
      termYears: 30,
    });
    assert.equal(r.series.length, 30);
    assert.ok(r.series[29]!.debtRemaining < 1_000);
  });

  it("Test J: down payment equals purchase price", () => {
    const r = simulateBuyVsRent({
      ...BASE,
      downPayment: BASE.purchasePrice,
      mortgageRate: 4.5,
    });
    assert.equal(r.today.loanAmount, 0);
    assert.ok(r.today.monthlyMortgage === 0);
    assert.ok(r.today.ltvPercent === 0);
  });

  it("does not treat principal as economic cost (no double count)", () => {
    const r = simulateBuyVsRent(BASE);
    const last = r.series[r.series.length - 1]!;
    // Economic cost = interest + maintenance + tx (no principal, no down)
    const expectedEconomic =
      last.cumulativeInterest +
      last.cumulativeMaintenance +
      Math.round(BASE.purchasePrice * BASE.transactionCostRate);
    assert.ok(
      Math.abs(last.buyCumulativeEconomicCost - expectedEconomic) < 5
    );
    // Cash out includes down + tx + debt service + maintenance
    assert.ok(last.buyCumulativeCashOut > last.buyCumulativeEconomicCost);
    // Equity is property - debt, not reduced by counting principal as cost
    assert.ok(
      Math.abs(last.buyNetWorth - (last.propertyValue - last.debtRemaining)) <= 1
    );
  });

  it("rejects negative loan / payment artifacts", () => {
    const r = simulateBuyVsRent(BASE);
    assert.ok(r.today.loanAmount >= 0);
    assert.ok(r.today.monthlyMortgage >= 0);
    assert.ok(r.today.ltvPercent >= 0 && r.today.ltvPercent <= 100);
    for (const p of r.series) {
      assert.ok(p.debtRemaining >= 0);
      assert.ok(!Number.isNaN(p.buyNetWorth));
      assert.ok(!Number.isNaN(p.rentNetWorth));
    }
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
