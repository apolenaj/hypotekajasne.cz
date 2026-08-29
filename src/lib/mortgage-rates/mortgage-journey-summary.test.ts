/**
 * Acceptance: 7M / 1M equity / 6M loan / 25y → LTV 85,7 %, band do 90 %.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseMortgageJourneyParams } from "@/lib/mortgage-rates/mortgage-journey-context";
import {
  formatFixationMonthsCs,
  resolveMortgageJourneySummary,
} from "@/lib/mortgage-rates/mortgage-journey-summary";

describe("resolveMortgageJourneySummary", () => {
  it("acceptance scenario 7M property, 1M equity, 25y, LTV 85,7 %", () => {
    const journey = parseMortgageJourneyParams({
      purpose: "purchase",
      fixationMonths: "36",
      property: "7000000",
      loan: "6000000",
      equity: "1000000",
      termYears: "25",
      modelRate: "5",
    });

    assert.equal(journey.fromDefaults, false);
    assert.equal(journey.paramErrors.length, 0);
    assert.equal(journey.ltvContext.exactLtv, 85.7);
    assert.equal(journey.ltvContext.ltvBand, 90);

    const summary = resolveMortgageJourneySummary(journey);
    assert.equal(summary.status, "ready");
    if (summary.status !== "ready") return;

    assert.equal(summary.propertyValueCzk, 7_000_000);
    assert.equal(summary.ownFundsCzk, 1_000_000);
    assert.equal(summary.loanAmountCzk, 6_000_000);
    assert.equal(summary.termYears, 25);
    assert.equal(summary.exactLtv, 85.7);
    assert.equal(summary.exactLtvLabel, "85,7\u00a0%");
    assert.equal(summary.ltvBand, 90);
    assert.equal(summary.ltvBandLabel, "do 90 %");
    assert.equal(summary.purposeLabel, "Koupě bydlení");
    assert.ok(summary.modelMonthlyPaymentCzk > 0);
    assert.ok(summary.editHref.includes("/kalkulacky/hypotecni"));
    assert.ok(summary.editHref.includes("property=7000000"));
    assert.ok(summary.editHref.includes("equity=1000000"));
  });

  it("bare /sazby defaults → incomplete, no misleading numbers", () => {
    const journey = parseMortgageJourneyParams({});
    const summary = resolveMortgageJourneySummary(journey);
    assert.equal(summary.status, "incomplete");
    assert.ok(summary.message.includes("kalkulačce"));
  });

  it("invalid URL params → incomplete", () => {
    const journey = parseMortgageJourneyParams({
      property: "not-valid",
      loan: "6000000",
    });
    const summary = resolveMortgageJourneySummary(journey);
    assert.equal(summary.status, "incomplete");
  });

  it("formatFixationMonthsCs", () => {
    assert.equal(formatFixationMonthsCs(36), "3 roky");
    assert.equal(formatFixationMonthsCs(60), "5 let");
  });
});
