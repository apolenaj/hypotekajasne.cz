import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  EMPTY_ANSWERS,
  MODEL_DISCLAIMER,
  buildMajetioListingUrl,
  calculateReadiness,
  type ReadinessAnswers,
} from "@/lib/mortgage-readiness";

describe("calculateReadiness", () => {
  it("returns score 0–100 and required sections", () => {
    const answers: ReadinessAnswers = {
      ...EMPTY_ANSWERS,
      intent: "owner_occupied",
      age: 35,
      incomeType: "employee",
      netIncome: 70_000,
      otherLiabilities: 5_000,
      ownFunds: 800_000,
      targetPrice: 5_000_000,
      employmentMonths: 24,
      noRecentDefaults: true,
    };
    const r = calculateReadiness(answers, 4.5);
    assert.ok(r.score >= 0 && r.score <= 100);
    assert.ok(r.strengths.length > 0);
    assert.ok(r.obstacles.length > 0);
    assert.ok(r.improvements.length > 0);
    assert.ok(r.riskFactors.length > 0);
    assert.ok(r.nextSteps.length > 0);
    assert.ok(r.actionPlan.days30.length > 0);
    assert.ok(r.actionPlan.months3.length > 0);
    assert.ok(r.actionPlan.months6to12.length > 0);
    assert.equal(r.modelDisclaimer, MODEL_DISCLAIMER);
    assert.ok(r.financingRange);
    assert.ok(r.financingRange!.high >= r.financingRange!.low);
  });

  it("never claims bank approval in text", () => {
    const answers: ReadinessAnswers = {
      ...EMPTY_ANSWERS,
      intent: "investment",
      age: 40,
      incomeType: "osvc_pausal",
      netIncome: 40_000,
      ownFunds: 100_000,
      noRecentDefaults: true,
    };
    const r = calculateReadiness(answers, 5);
    const blob = JSON.stringify(r).toLowerCase();
    assert.equal(blob.includes("banka vám schválí"), false);
    assert.equal(blob.includes("vám schválí"), false);
  });

  it("foreign purchase without collateral lowers intent points path", () => {
    const base: ReadinessAnswers = {
      ...EMPTY_ANSWERS,
      intent: "foreign_purchase",
      age: 38,
      incomeType: "employee",
      netIncome: 80_000,
      ownFunds: 1_000_000,
      targetCountry: "Španělsko",
      noRecentDefaults: true,
      hasCzCollateral: false,
    };
    const without = calculateReadiness(base, 5);
    const withCol = calculateReadiness(
      { ...base, hasCzCollateral: true, czCollateralEquity: 2_000_000 },
      5
    );
    assert.ok(withCol.score >= without.score);
  });
});

describe("buildMajetioListingUrl", () => {
  it("passes only necessary params", () => {
    const url = buildMajetioListingUrl({
      budgetMax: 4_500_000,
      equity: 900_000,
      intent: "owner_occupied",
      baseUrl: "https://majetio.cz/",
    });
    const u = new URL(url);
    assert.equal(u.searchParams.get("budget_max"), "4500000");
    assert.equal(u.searchParams.get("equity"), "900000");
    assert.equal(u.searchParams.get("purpose"), "owner_occupied");
    assert.equal(u.searchParams.get("utm_source"), "hypoteka-jasne");
    assert.equal(u.searchParams.has("email"), false);
    assert.equal(u.searchParams.has("phone"), false);
    assert.equal(u.searchParams.has("name"), false);
  });
});
