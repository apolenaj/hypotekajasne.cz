/**
 * Homepage RPSN education model — A/B costs without bank branding.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildRpsnEducationComparison,
  modelRpsnPercent,
  RPSN_EDUCATION_FIXATION_MONTHS,
  RPSN_EDUCATION_PRINCIPAL_CZK,
  RPSN_EDUCATION_TERM_YEARS,
} from "@/lib/mortgage-market/rpsn-education-model";

describe("rpsn education model", () => {
  const comparison = buildRpsnEducationComparison();
  const offerA = comparison.variants.find((v) => v.id === "offer-a")!;
  const offerB = comparison.variants.find((v) => v.id === "offer-b")!;

  it("uses shared loan parameters", () => {
    assert.equal(comparison.assumptions.principalCzk, RPSN_EDUCATION_PRINCIPAL_CZK);
    assert.equal(comparison.assumptions.termYears, RPSN_EDUCATION_TERM_YEARS);
    assert.equal(
      comparison.assumptions.fixationMonths,
      RPSN_EDUCATION_FIXATION_MONTHS
    );
    assert.equal(comparison.parametersMatch, true);
  });

  it("computes payments, RPSN and 3-year costs for both offers", () => {
    assert.ok(offerA);
    assert.ok(offerB);

    assert.equal(offerA.rate, 4.69);
    assert.equal(offerA.monthlyMortgagePayment, 20_721);
    assert.equal(offerA.monthlyInsurance, 2_000);
    assert.equal(offerA.totalMonthlyOutflow, 22_721);
    assert.equal(offerA.apr, 5.64);
    assert.equal(offerA.interestDuringFixation, 549_698);
    assert.equal(offerA.insuranceDuringFixation, 72_000);
    assert.equal(offerA.totalCostDuringFixation, 621_698);

    assert.equal(offerB.rate, 4.89);
    assert.equal(offerB.monthlyMortgagePayment, 21_205);
    assert.equal(offerB.monthlyInsurance, 0);
    assert.equal(offerB.totalMonthlyOutflow, 21_205);
    assert.equal(offerB.apr, 5);
    assert.equal(offerB.interestDuringFixation, 573_607);
    assert.equal(offerB.insuranceDuringFixation, 0);
    assert.equal(offerB.totalCostDuringFixation, 573_607);
  });

  it("shows higher-rate offer as cheaper over 3 years", () => {
    assert.equal(comparison.lowerRateId, "offer-a");
    assert.equal(comparison.cheaperId, "offer-b");
    assert.equal(comparison.lowerRateIsCheaper, false);
    assert.equal(comparison.fixationCostDeltaCzk, 48_091);
    assert.ok(offerA.apr > offerB.apr);
  });

  it("does not brand any real bank", () => {
    assert.equal(offerA.bank, "Model");
    assert.equal(offerB.bank, "Model");
    assert.equal(offerA.variant, "Nabídka A");
    assert.equal(offerB.variant, "Nabídka B");
    assert.equal(/MONETA|Moneta|moneta/i.test(JSON.stringify(comparison)), false);
  });

  it("modelRpsnPercent rises when insurance is added", () => {
    const bare = modelRpsnPercent(21_205, 0);
    const withInsurance = modelRpsnPercent(20_721, 2_000);
    assert.ok(withInsurance > bare);
  });
});
