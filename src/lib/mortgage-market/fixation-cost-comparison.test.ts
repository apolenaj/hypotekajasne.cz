/**
 * Fixation cost math: published MONETA example, synthetic fees, CZK rounding.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  amortizeKnownMonthlyPayment,
  calculateAnnuityPayment,
  roundMoney,
} from "@/lib/finance-math/core";
import { formatMoney } from "@/lib/money";
import { CZ_MANIFEST_CHECKED_AT } from "@/lib/mortgage-market/import";
import {
  buildFixationVariantSnapshot,
  buildMonetaRepresentativeComparison,
  compareFixationVariants,
  fixationVerdictHeadline,
  type FixationVariantInput,
} from "@/lib/mortgage-market/fixation-cost-comparison";

function modelInput(
  overrides: Partial<FixationVariantInput> = {}
): FixationVariantInput {
  return {
    id: "model",
    bank: "Model",
    variant: "Bez pojištění",
    ratePercent: 5,
    aprPercent: 5.2,
    principalCzk: 1_000_000,
    termYears: 20,
    fixationMonths: 12,
    ltvPercent: null,
    monthlyMortgagePaymentCzk: 6_600,
    monthlyInsuranceCzk: 0,
    monthlyAdditionalCostsCzk: 0,
    oneOffCostsCzk: 0,
    ...overrides,
  };
}

function assertScheduleIdentity(
  snapshot: ReturnType<typeof buildFixationVariantSnapshot>,
  paymentCoversInterest: boolean
) {
  assert.equal(Number.isInteger(snapshot.interestDuringFixation), true);
  assert.equal(Number.isInteger(snapshot.remainingPrincipalAfterFixation), true);
  assert.equal(Number.isInteger(snapshot.totalCostDuringFixation), true);
  assert.equal(
    snapshot.remainingPrincipalAfterFixation +
      snapshot.principalPaidDuringFixation,
    snapshot.principal
  );
  assert.equal(
    snapshot.totalCostDuringFixation,
    snapshot.interestDuringFixation +
      snapshot.insuranceDuringFixation +
      snapshot.feesDuringFixation
  );
  assert.equal(
    snapshot.insuranceDuringFixation,
    snapshot.monthlyInsurance * snapshot.fixationMonths
  );
  assert.equal(
    snapshot.feesDuringFixation,
    snapshot.monthlyAdditionalCosts * snapshot.fixationMonths +
      snapshot.oneOffCosts
  );
  assert.equal(
    snapshot.totalMonthlyOutflow,
    snapshot.monthlyMortgagePayment +
      snapshot.monthlyInsurance +
      snapshot.monthlyAdditionalCosts
  );
  if (paymentCoversInterest) {
    assert.equal(
      snapshot.interestDuringFixation + snapshot.principalPaidDuringFixation,
      snapshot.monthlyMortgagePayment * snapshot.fixationMonths
    );
  }
}

describe("amortizeKnownMonthlyPayment", () => {
  it("reconciles a hand-calculated two-month schedule", () => {
    const result = amortizeKnownMonthlyPayment({
      principal: 100_000,
      annualRatePercent: 12,
      monthlyPayment: 2_000,
      months: 2,
    });
    assert.deepEqual(result, {
      interestCzk: 1_990,
      principalPaidCzk: 2_010,
      remainingPrincipalCzk: 97_990,
      paymentsAppliedCzk: 4_000,
    });
  });

  it("rounds half-crown interest up to a whole crown", () => {
    const result = amortizeKnownMonthlyPayment({
      principal: 100,
      annualRatePercent: 6,
      monthlyPayment: 10,
      months: 1,
    });
    assert.equal(roundMoney(100 * (6 / 100 / 12)), 1);
    assert.equal(result.interestCzk, 1);
    assert.equal(result.principalPaidCzk, 9);
    assert.equal(result.remainingPrincipalCzk, 91);
    assert.equal(result.paymentsAppliedCzk, 10);
  });
});

describe("MONETA representative comparison", () => {
  const comparison = buildMonetaRepresentativeComparison();

  it("uses the published example, not a recalculated annuity or invented LTV", () => {
    assert.ok(comparison);
    assert.equal(comparison.checkedAt, CZ_MANIFEST_CHECKED_AT);
    assert.equal(comparison.parametersMatch, true);
    assert.equal(comparison.assumptions.principalCzk, 2_500_000);
    assert.equal(comparison.assumptions.termYears, 30);
    assert.equal(comparison.assumptions.fixationMonths, 36);
    assert.equal(comparison.assumptions.ltvPercent, null);

    const withInsurance = comparison.variants.find(
      (variant) => variant.id === "moneta-rpsn-with-ppi"
    );
    const withoutInsurance = comparison.variants.find(
      (variant) => variant.id === "moneta-rpsn-without-ppi"
    );
    assert.ok(withInsurance);
    assert.ok(withoutInsurance);

    assert.equal(withInsurance.rate, 4.99);
    assert.equal(withInsurance.apr, 6.11);
    assert.equal(withInsurance.monthlyMortgagePayment, 13_405);
    assert.equal(withInsurance.monthlyInsurance, 1_474);
    assert.equal(withInsurance.monthlyAdditionalCosts, 0);
    assert.equal(withInsurance.oneOffCosts, 0);
    assert.equal(withInsurance.insuranceDuringFixation, 1_474 * 36);

    assert.equal(withoutInsurance.rate, 5.19);
    assert.equal(withoutInsurance.apr, 5.33);
    assert.equal(withoutInsurance.monthlyMortgagePayment, 13_712);
    assert.equal(withoutInsurance.monthlyInsurance, 0);
    assert.equal(withoutInsurance.insuranceDuringFixation, 0);

    const recalculated = roundMoney(
      calculateAnnuityPayment(2_500_000, 4.99, 30)
    );
    assert.equal(recalculated, withInsurance.monthlyMortgagePayment);
    assert.equal(withoutInsurance.monthlyMortgagePayment, 13_712);
    assertScheduleIdentity(withInsurance, true);
    assertScheduleIdentity(withoutInsurance, true);
  });

  it("computes the cheaper variant instead of hardcoding a winner", () => {
    assert.ok(comparison);
    const [first, second] = comparison.variants;
    const expectedCheaper =
      first.totalCostDuringFixation === second.totalCostDuringFixation
        ? null
        : first.totalCostDuringFixation < second.totalCostDuringFixation
          ? first.id
          : second.id;
    assert.equal(comparison.cheaperId, expectedCheaper);
    assert.equal(
      comparison.fixationCostDeltaCzk,
      Math.abs(
        first.totalCostDuringFixation - second.totalCostDuringFixation
      )
    );
    assert.equal(
      comparison.monthlyOutflowDeltaCzk,
      Math.abs(first.totalMonthlyOutflow - second.totalMonthlyOutflow)
    );
    assert.equal(comparison.rpsnDeltaPercentagePoints, 0.78);
    assert.equal(comparison.lowerRateId, "moneta-rpsn-with-ppi");
    assert.equal(comparison.cheaperId, "moneta-rpsn-without-ppi");
    assert.equal(comparison.lowerRateIsCheaper, false);
    assert.equal(
      fixationVerdictHeadline(comparison),
      "Nižší úrok ≠ levnější hypotéka"
    );
    assert.ok(comparison.fixationCostDeltaCzk > 0);
  });
});

describe("synthetic cost edges", () => {
  it("keeps zero insurance out of the cost", () => {
    const snapshot = buildFixationVariantSnapshot(
      modelInput({ monthlyInsuranceCzk: 0 })
    );
    assert.equal(snapshot.monthlyInsurance, 0);
    assert.equal(snapshot.insuranceDuringFixation, 0);
    assert.equal(snapshot.totalMonthlyOutflow, snapshot.monthlyMortgagePayment);
    assert.equal(
      snapshot.totalCostDuringFixation,
      snapshot.interestDuringFixation + snapshot.feesDuringFixation
    );
    assertScheduleIdentity(snapshot, true);
  });

  it("adds a one-off fee once, not every month", () => {
    const plain = buildFixationVariantSnapshot(modelInput());
    const withFee = buildFixationVariantSnapshot(
      modelInput({ id: "fee", oneOffCostsCzk: 2_500, monthlyInsuranceCzk: 0 })
    );
    assert.equal(withFee.oneOffCosts, 2_500);
    assert.equal(withFee.feesDuringFixation, 2_500);
    assert.equal(
      withFee.totalCostDuringFixation,
      plain.totalCostDuringFixation + 2_500
    );
    assert.equal(withFee.totalMonthlyOutflow, plain.totalMonthlyOutflow);
    assertScheduleIdentity(withFee, true);
  });

  it("flips the verdict when the lower rate is actually cheaper", () => {
    const lowerRate = buildFixationVariantSnapshot(
      modelInput({
        id: "low",
        variant: "S pojištěním",
        ratePercent: 4,
        aprPercent: 4.2,
        monthlyInsuranceCzk: 100,
      })
    );
    const higherRate = buildFixationVariantSnapshot(
      modelInput({
        id: "high",
        variant: "Bez pojištění",
        ratePercent: 6,
        aprPercent: 6.1,
        monthlyMortgagePaymentCzk: 8_000,
        monthlyInsuranceCzk: 0,
      })
    );
    const comparison = compareFixationVariants(
      [higherRate, lowerRate],
      "2026-08-09T00:00:00.000Z"
    );
    assert.equal(comparison.lowerRateId, "low");
    assert.equal(comparison.cheaperId, "low");
    assert.equal(comparison.lowerRateIsCheaper, true);
    assert.equal(
      fixationVerdictHeadline(comparison),
      "V tomto příkladu je nižší úrok i levnější"
    );
  });
});

describe("CZK formatting", () => {
  it("formats whole crowns with Czech grouping and no float dust", () => {
    assert.equal(formatMoney(4_000_000), "4\u00a0000\u00a0000\u00a0Kč");
    assert.equal(formatMoney(20_145), "20\u00a0145\u00a0Kč");
    assert.equal(formatMoney(124_850), "124\u00a0850\u00a0Kč");
    assert.equal(formatMoney(13_405.4), "13\u00a0405\u00a0Kč");
    assert.equal(formatMoney(0), "0\u00a0Kč");
  });
});
