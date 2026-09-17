import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildCaseStudyBundle } from "@/lib/property-rentgen/case-study-analytics";
import { CONTROL_GOLDEN } from "@/lib/property-rentgen/control-model";
import { samplePackageFromQuery } from "@/lib/property-rentgen/package-query";
import {
  DIGITAL_SAMPLE_PAGE_COUNT,
  PREMIUM_SAMPLE_PAGE_COUNT,
} from "@/lib/property-rentgen/sample-pdf-meta";

describe("case study analytics", () => {
  it("keeps control golden cash-flow and cash need", () => {
    const b = buildCaseStudyBundle();
    assert.ok(
      Math.abs(b.model.monthlyCashFlowCzk - CONTROL_GOLDEN.monthlyCashFlowCzk) <
        0.02
    );
    assert.equal(
      b.model.totalOwnCashIncludingReserveCzk,
      CONTROL_GOLDEN.totalOwnCashIncludingReserveCzk
    );
  });

  it("vacancy stress does not double-count average vacancy", () => {
    const b = buildCaseStudyBundle();
    assert.match(b.vacancyStress.noteCs, /nepoužívá zároveň/);
    assert.equal(b.vacancyStress.reservePath.length, 3);
    assert.ok(b.vacancyStress.reservePath[0]!.inflowCzk === 0);
  });

  it("refix uses remaining balance after fixation years", () => {
    const b = buildCaseStudyBundle();
    assert.equal(b.refix.fixationYears, 5);
    assert.ok(b.refix.balanceAtRefixCzk < b.model.inputs.loanAmountCzk);
    assert.ok(b.refix.shockedPaymentCzk > b.refix.basePaymentCzk);
  });

  it("sale net subtracts debt and selling costs", () => {
    const b = buildCaseStudyBundle();
    const s = b.sales[0]!;
    assert.ok(
      Math.abs(
        s.netBeforeTaxCzk -
          (s.assumedSalePriceCzk - s.sellingCostsCzk - s.loanBalanceCzk)
      ) < 0.02
    );
  });

  it("synthetic comps are labeled as synthetic", () => {
    const b = buildCaseStudyBundle();
    assert.ok(b.saleListings.every((l) => l.provenance === "synteticka_srovnavaci_sada"));
    assert.ok(b.whatPremiumAddsCs.length >= 4);
  });
});

describe("sample pdf package routing helpers", () => {
  it("maps query to distinct variants and page targets", () => {
    assert.equal(samplePackageFromQuery("999"), "digital");
    assert.equal(samplePackageFromQuery("4990"), "premium");
    assert.equal(DIGITAL_SAMPLE_PAGE_COUNT, 8);
    assert.equal(PREMIUM_SAMPLE_PAGE_COUNT, 30);
  });
});
