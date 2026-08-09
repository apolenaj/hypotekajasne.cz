import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildSazbyHref,
  computeMiniMortgage,
  miniMortgageCtaLabel,
  MINI_MORTGAGE_DEFAULTS,
} from "@/lib/mini-mortgage-calculator";

describe("mini mortgage calculator", () => {
  it("uses model rate for payment and derives LTV / loan", () => {
    const result = computeMiniMortgage({
      propertyPriceCzk: 6_000_000,
      ownFundsCzk: 1_200_000,
      termYears: 30,
      purpose: "purchase",
      fixationMonths: 36,
    });
    assert.equal(result.loanAmountCzk, 4_800_000);
    assert.equal(result.ltvPct, 80);
    assert.equal(result.annualRatePercent, MINI_MORTGAGE_DEFAULTS.annualRatePercent);
    assert.ok(result.monthlyPaymentCzk > 0);
  });

  it("CTA stays neutral and sazby href carries funnel context", () => {
    assert.equal(miniMortgageCtaLabel(), "Spočítat hypotéku");
    const result = computeMiniMortgage({
      propertyPriceCzk: 5_000_000,
      ownFundsCzk: 1_250_000,
      termYears: 25,
      purpose: "refinance",
      fixationMonths: 36,
    });
    const href = buildSazbyHref(result);
    assert.ok(href.includes("purpose=refinance"));
    assert.ok(href.includes("fixationMonths=36"));
    assert.ok(href.includes("ltv=75"));
  });
});
