import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildSazbyHref,
  computeMiniMortgage,
  MINI_MORTGAGE_CTA,
  miniMortgageCtaLabel,
  miniMortgageLtvPct,
  MINI_MORTGAGE_DEFAULTS,
  validateMiniMortgageInput,
} from "@/lib/mini-mortgage-calculator";
import { parseSazbySearchParams } from "@/lib/mortgage-rates/ltv-context";

describe("mini mortgage calculator", () => {
  it("uses model rate for payment and derives exact LTV / loan", () => {
    const result = computeMiniMortgage({
      propertyPriceCzk: 6_000_000,
      ownFundsCzk: 1_200_000,
      termYears: 30,
      purpose: "purchase",
      fixationMonths: 36,
    });
    assert.equal(result.loanAmountCzk, 4_800_000);
    assert.equal(result.exactLtv, 80);
    assert.equal(miniMortgageLtvPct(result), 80);
    assert.equal(result.ltvBand, 80);
    assert.equal(result.annualRatePercent, MINI_MORTGAGE_DEFAULTS.annualRatePercent);
    assert.ok(result.monthlyPaymentCzk > 0);
  });

  it("7M / 6M loan scenario matches sazby LTV rules", () => {
    const result = computeMiniMortgage({
      propertyPriceCzk: 7_000_000,
      ownFundsCzk: 1_000_000,
      termYears: 30,
    });
    assert.equal(result.exactLtv, 85.7);
    assert.equal(result.ltvBand, 90);
  });

  it("CTA labels follow calculate → view rates flow", () => {
    assert.equal(MINI_MORTGAGE_CTA.calculate, "Spočítat splátku");
    assert.equal(MINI_MORTGAGE_CTA.viewRates, "Zobrazit sazby pro tento výpočet");
    assert.equal(miniMortgageCtaLabel(), MINI_MORTGAGE_CTA.calculate);
  });

  it("validation blocks incomplete inputs", () => {
    assert.equal(
      validateMiniMortgageInput({
        propertyPriceCzk: 0,
        ownFundsCzk: 1_000_000,
        termYears: 30,
      }).valid,
      false
    );
    assert.equal(
      validateMiniMortgageInput({
        propertyPriceCzk: 5_000_000,
        ownFundsCzk: 6_000_000,
        termYears: 30,
      }).valid,
      false
    );
    assert.equal(
      validateMiniMortgageInput({
        propertyPriceCzk: 5_000_000,
        ownFundsCzk: 5_000_000,
        termYears: 30,
      }).valid,
      false
    );
    assert.equal(
      validateMiniMortgageInput({
        propertyPriceCzk: 5_000_000,
        ownFundsCzk: 1_000_000,
        termYears: 30,
      }).valid,
      true
    );
  });

  it("sazby href carries property + loan + equity + term from committed calculation", () => {
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
    assert.ok(href.includes("property=5000000"));
    assert.ok(href.includes("loan=3750000"));
    assert.ok(href.includes("equity=1250000"));
    assert.ok(href.includes("termYears=25"));
    assert.ok(!href.includes("ltv="));

    const parsed = parseSazbySearchParams(
      Object.fromEntries(new URL(href, "https://example.test").searchParams.entries())
    );
    assert.equal(parsed.loanAmountCzk, 3_750_000);
    assert.equal(parsed.propertyValueCzk, 5_000_000);
    assert.equal(parsed.ownFundsCzk, 1_250_000);
    assert.equal(parsed.termYears, 25);
    assert.equal(parsed.purpose, "refinance");
    assert.equal(parsed.fixationMonths, 36);
  });
});
