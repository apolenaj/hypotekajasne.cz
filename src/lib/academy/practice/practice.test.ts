import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  PRACTICE_GUIDES,
  getPracticeGuide,
  searchPracticeGuides,
} from "@/lib/academy/practice";
import {
  estimateGapModel,
  monthlyBudgetResidual,
  mortgageInterestDeductionModel,
  paymentSplitOverMonths,
  refinanceHorizonCompare,
} from "@/lib/academy/practice/math";
import { getAcademyLesson } from "@/lib/academy";

describe("hypotéky v praxi catalog", () => {
  it("exposes exactly ten guides with stable slugs", () => {
    assert.equal(PRACTICE_GUIDES.length, 10);
    const required = [
      "prvni-hypoteka",
      "na-co-dosahnu",
      "vlastni-penize-odhad",
      "prijmy-osvc-zkusebni",
      "registry-zamitnuti",
      "urok-rpsn-naklady",
      "mimoradne-splatky-refinancovani",
      "pojisteni-vypadek-prijmu",
      "hypoteka-rozchod-rozvod",
      "dane-bydleni-investice",
    ];
    for (const slug of required) {
      assert.ok(getPracticeGuide(slug), `missing guide ${slug}`);
    }
  });

  it("every answer has direct answer, explanation and next step", () => {
    for (const guide of PRACTICE_GUIDES) {
      assert.ok(guide.answers.length >= 7, guide.slug);
      for (const a of guide.answers) {
        assert.ok(a.directAnswer.length > 80, `${guide.slug}/${a.id}`);
        assert.ok(a.explanation.length > 80, `${guide.slug}/${a.id}`);
        assert.ok(a.nextStep.href.startsWith("/"), `${guide.slug}/${a.id}`);
        assert.ok(a.nextStep.label.length > 3, `${guide.slug}/${a.id}`);
      }
      for (const slug of guide.relatedLessonSlugs) {
        assert.ok(getAcademyLesson(slug), `missing lesson ${slug}`);
      }
    }
  });

  it("search folds diacritics and expands synonyms", () => {
    const osvc = searchPracticeGuides(PRACTICE_GUIDES, "živnostník");
    assert.ok(osvc.some((h) => h.guideSlug === "prijmy-osvc-zkusebni"));
    const rozvod = searchPracticeGuides(PRACTICE_GUIDES, "rozchod");
    assert.ok(rozvod.some((h) => h.guideSlug === "hypoteka-rozchod-rozvod"));
    const odhad = searchPracticeGuides(PRACTICE_GUIDES, "ocenění");
    assert.ok(odhad.some((h) => h.guideSlug === "vlastni-penize-odhad"));
  });
});

describe("practice math edge cases", () => {
  it("keeps negative residual visible", () => {
    const r = monthlyBudgetResidual({
      netIncomeCzk: 20_000,
      livingCostsCzk: 18_000,
      otherDebtPaymentsCzk: 5_000,
      mortgagePaymentCzk: 12_000,
    });
    assert.ok(r.residualCzk < 0);
  });

  it("models estimate below purchase price at 80% LTV", () => {
    const gap = estimateGapModel({
      purchasePriceCzk: 5_000_000,
      estimateCzk: 4_000_000,
      targetLtvPercent: 80,
    });
    assert.equal(gap.maxLoanFromEstimateCzk, 3_200_000);
    assert.equal(gap.ownFundsForPriceCzk, 1_800_000);
    assert.equal(gap.cashGapVsEstimateCzk, 1_000_000);
  });

  it("handles zero rate payment split without inventing interest", () => {
    const split = paymentSplitOverMonths({
      principalCzk: 1_000_000,
      annualRatePercent: 0,
      termYears: 20,
      months: 12,
    });
    assert.equal(split.interestCzk, 0);
    assert.ok(split.principalPaidCzk > 0);
    assert.ok(split.remainingPrincipalCzk < 1_000_000);
  });

  it("caps tax deduction and respects canUtilize flag", () => {
    const blocked = mortgageInterestDeductionModel({
      annualInterestPaidCzk: 200_000,
      deductibleCapCzk: 150_000,
      marginalTaxRatePercent: 23,
      canUtilizeDeduction: false,
    });
    assert.equal(blocked.applicableDeductionCzk, 0);
    assert.equal(blocked.modelledTaxReliefCzk, 0);

    const ok = mortgageInterestDeductionModel({
      annualInterestPaidCzk: 200_000,
      deductibleCapCzk: 150_000,
      marginalTaxRatePercent: 23,
      canUtilizeDeduction: true,
    });
    assert.equal(ok.applicableDeductionCzk, 150_000);
    assert.equal(ok.unusedInterestCzk, 50_000);
  });

  it("refinance compare includes switch cost on same horizon", () => {
    const cmp = refinanceHorizonCompare({
      remainingPrincipalCzk: 3_000_000,
      currentRatePercent: 5.5,
      newRatePercent: 4.5,
      remainingYears: 20,
      switchCostCzk: 25_000,
      horizonMonths: 36,
    });
    assert.ok(cmp.currentPaymentCzk > 0);
    assert.ok(cmp.newPaymentCzk > 0);
    assert.ok(cmp.newCashOutIncludingSwitchCzk > cmp.newPaymentCzk * 36 - 1);
  });
});
