import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  MAJETIO_SAFE_QUERY_KEYS,
  buildFinancialPassport,
  buildMajetioDiscoveryUrl,
  buildMajetioListingUrl,
  evaluateAffordability,
  buildFinancingHandoff,
  FUTURE_SSO_BLUEPRINT,
} from "@/lib/majetio";
import {
  EMPTY_ANSWERS,
  calculateReadiness,
  type ReadinessAnswers,
} from "@/lib/mortgage-readiness";

describe("Financial Passport", () => {
  it("maps readiness without PII fields", () => {
    const answers: ReadinessAnswers = {
      ...EMPTY_ANSWERS,
      intent: "owner_occupied",
      age: 35,
      incomeType: "employee",
      netIncome: 70_000,
      ownFunds: 800_000,
      targetPrice: 5_000_000,
      noRecentDefaults: true,
    };
    const result = calculateReadiness(answers, 4.5);
    const fp = buildFinancialPassport(answers, result);
    assert.equal(fp.version, 1);
    assert.ok(fp.ownFunds === 800_000);
    assert.ok(fp.maxEstimatedBankBudget == null || fp.maxEstimatedBankBudget > 0);
    assert.ok(fp.safeMonthlyPayment != null && fp.safeMonthlyPayment > 0);
    assert.equal(fp.purpose, "owner_occupied");
    assert.equal(fp.country, "Česká republika");
    const json = JSON.stringify(fp);
    assert.equal(json.includes("email"), false);
    assert.equal(json.includes("phone"), false);
  });
});

describe("Majetio discovery URL", () => {
  it("only uses safe query keys + attribution", () => {
    const answers: ReadinessAnswers = {
      ...EMPTY_ANSWERS,
      intent: "investment",
      age: 40,
      incomeType: "employee",
      netIncome: 80_000,
      ownFunds: 1_000_000,
      noRecentDefaults: true,
    };
    const result = calculateReadiness(answers, 5);
    const passport = buildFinancialPassport(answers, result);
    const url = buildMajetioDiscoveryUrl({
      passport,
      attribution: {
        lifecycleId: "ll_test",
        referralId: "ref_test",
        source: "hypoteka-jasne",
        medium: "referral",
        campaign: "readiness",
        conversion: {
          event: "cta",
          product: "mortgage_readiness",
          at: "2026-07-19T00:00:00.000Z",
        },
        utm: {
          utm_source: "hypoteka-jasne",
          utm_medium: "referral",
          utm_campaign: "readiness",
          utm_content: "financial_passport",
        },
      },
      baseUrl: "https://majetio.cz/",
    });
    const u = new URL(url);
    for (const key of u.searchParams.keys()) {
      assert.ok(
        (MAJETIO_SAFE_QUERY_KEYS as readonly string[]).includes(key),
        `unexpected key ${key}`
      );
    }
    assert.equal(u.searchParams.get("llid"), "ll_test");
    assert.equal(u.searchParams.get("ref"), "ref_test");
    assert.equal(u.searchParams.get("utm_source"), "hypoteka-jasne");
    assert.equal(u.searchParams.has("email"), false);
  });

  it("legacy listing url sets purpose + utm", () => {
    const url = buildMajetioListingUrl({
      budgetMax: 4_500_000,
      equity: 900_000,
      intent: "owner_occupied",
      baseUrl: "https://majetio.cz/",
    });
    const u = new URL(url);
    assert.equal(u.searchParams.get("purpose"), "owner_occupied");
    assert.equal(u.searchParams.get("utm_campaign"), "readiness");
  });
});

describe("property detail contracts", () => {
  it("affordability returns insufficient_data without passport", () => {
    const r = evaluateAffordability({
      propertyId: "p1",
      priceCzk: 6_000_000,
    });
    assert.equal(r.verdict, "insufficient_data");
    assert.equal(r.status, "COMING_SOON");
  });

  it("financing handoff is BETA with safe params", () => {
    const r = buildFinancingHandoff({
      propertyId: "p1",
      priceCzk: 6_000_000,
      country: "Česká republika",
    });
    assert.equal(r.status, "BETA");
    assert.ok(r.handoffUrl.includes("kalkulacky"));
    assert.ok(r.handoffUrl.includes("price=6000000"));
  });
});

describe("SSO blueprint", () => {
  it("is COMING_SOON and does not imply live auth", () => {
    assert.equal(FUTURE_SSO_BLUEPRINT.status, "COMING_SOON");
    assert.equal(FUTURE_SSO_BLUEPRINT.mechanism, "none");
  });
});
