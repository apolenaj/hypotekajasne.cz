/**
 * Decision Lab — unit testy s očekávanými výsledky.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { simulateBuyVsRent } from "@/lib/decision-lab/buy-vs-rent";
import { simulateFutureLab } from "@/lib/decision-lab/future-lab";
import { simulateHistoricalLab } from "@/lib/decision-lab/historical-lab";

describe("buy vs rent", () => {
  it("never hardcodes a universal winner — sentence uses assumptions", () => {
    const r = simulateBuyVsRent({
      purchasePrice: 5_000_000,
      monthlyRent: 20_000,
      mortgageRate: 5,
      downPayment: 1_000_000,
      maintenanceRate: 0.015,
      transactionCostRate: 0.045,
      annualPropertyGrowth: 0.03,
      annualRentGrowth: 0.02,
      alternativeEquityReturn: 0.04,
      horizonYears: 20,
      termYears: 30,
    });
    assert.match(r.verdictSentence, /Při těchto předpokladech/);
    assert.ok(!/univerzáln/i.test(r.verdictSentence));
    assert.ok(r.series.length === 20);
    assert.ok(r.chartMeta.methodology.length > 20);
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
    assert.match(r.verdictSentence, /koupě výhodněji od roku/);
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
    // 60k per year × 3 = 180k cumulative
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
    // y1: 100k; y2: 100k*1.1 + 100k = 210k
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
