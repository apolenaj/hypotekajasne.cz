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
  it("keeps control golden on original assignment", () => {
    const b = buildCaseStudyBundle();
    assert.ok(
      Math.abs(
        b.originalModel.monthlyCashFlowCzk - CONTROL_GOLDEN.monthlyCashFlowCzk
      ) < 0.02
    );
    assert.equal(
      b.originalModel.totalOwnCashIncludingReserveCzk,
      CONTROL_GOLDEN.totalOwnCashIncludingReserveCzk
    );
  });

  it("worsens cash-flow after SVJ document uplift", () => {
    const b = buildCaseStudyBundle();
    assert.ok(b.adjustedModel.monthlyCashFlowCzk < b.originalModel.monthlyCashFlowCzk);
    assert.equal(b.adjustedInputs.ownerBuildingCostsAnnualCzk, 2_800 * 12);
    assert.equal(b.adjustedInputs.initialFitOutCzk, 145_000);
  });

  it("combined liquidity: 3 empty + repair month without rent", () => {
    const b = buildCaseStudyBundle();
    assert.equal(b.combinedLiquidity.emptyMonthsWithoutRent, 4);
    assert.equal(b.combinedLiquidity.emptyMonthsBeforeRepair, 3);
    assert.equal(b.combinedLiquidity.repairMonth, 4);
    assert.equal(b.combinedLiquidity.path.length, 12);
    assert.equal(b.combinedLiquidity.path[0]!.opsInflowCzk, 0);
    assert.ok(b.combinedLiquidity.path[0]!.outflowCzk > 15_000);
    assert.ok(b.combinedLiquidity.path[3]!.outflowCzk > 80_000);
    assert.match(b.combinedLiquidity.noteCs, /čtyři měsíce bez nájemného/i);
  });

  it("historical vacancy 4/36 is distinct from future 5% assumption", () => {
    const b = buildCaseStudyBundle();
    assert.ok(Math.abs(b.vacancyAnalysis.historicalRate - 4 / 36) < 1e-12);
    assert.equal(b.vacancyAnalysis.futureAssumptionRate, 0.05);
    assert.ok(
      Math.abs(b.vacancyAnalysis.monthlyCashFlowAtFutureAssumptionCzk - -1_675.16) <
        0.1
    );
    assert.ok(
      Math.abs(b.vacancyAnalysis.monthlyCashFlowAtHistoricalRateCzk - -2_836.27) <
        0.1
    );
    assert.match(b.documents.find((d) => d.id === "doc-occupancy")!.says, /11,11/);
  });

  it("settlement uses ending reserve from history, not full initial reserve after stress", () => {
    const b = buildCaseStudyBundle();
    assert.equal(b.settlementY5.scenarioId, "base");
    assert.equal(b.settlementStressY5.scenarioId, "stress");
    assert.ok(b.settlementStressY5.investorTopUpsCzk > 0);
    // Stres: konečná rezerva ≠ slepé vrácení celých 150 000 Kč
    assert.ok(
      Math.abs(
        b.settlementStressY5.reserveReleasedCzk -
          b.adjustedModel.inputs.cashReserveCzk
      ) > 1
    );
    const wrongStress =
      -b.settlementStressY5.initialOwnCashCzk +
      b.settlementStressY5.cumulativeOperatingCashCzk -
      b.settlementStressY5.investorTopUpsCzk +
      b.settlementStressY5.saleNetProceedsBeforeTaxCzk +
      b.adjustedModel.inputs.cashReserveCzk;
    assert.ok(
      Math.abs(b.settlementStressY5.totalResultBeforeTaxCzk - wrongStress) > 1
    );
  });

  it("refix isolated matches constant-rent shock; connected uses grown rent", () => {
    const b = buildCaseStudyBundle();
    assert.equal(b.refixIsolated.fixationYears, 5);
    assert.ok(Math.abs(b.refixIsolated.balanceAtRefixCzk - 2_692_014.52) < 1);
    assert.ok(Math.abs(b.refixIsolated.shockedPaymentCzk - 18_684.52) < 1);
    // Isolated uses original rent; connected uses rent after 5 × 2% growth
    assert.equal(b.refixIsolated.rentAtRefixCzk, 20_000);
    assert.ok(
      Math.abs(b.refixConnected.rentAtRefixCzk - 20_000 * Math.pow(1.02, 5)) <
        0.01
    );
    assert.ok(
      b.refixConnected.monthlyCashFlowAfterRefixCzk >
        b.refixIsolated.monthlyCashFlowAfterRefixCzk
    );
    // After SVJ uplift, isolated CF is worse than the textbook −4 134.52 (original costs)
    assert.ok(b.refixIsolated.monthlyCashFlowAfterRefixCzk < -4_134);
  });

  it("textbook payment on original assignment is about 15425.16", () => {
    const b = buildCaseStudyBundle();
    assert.ok(Math.abs(b.originalModel.monthlyPaymentCzk - 15_425.16) < 0.1);
  });

  it("year-10 flat vs grown costs differ as expected", () => {
    const b = buildCaseStudyBundle();
    const flat = b.longTermFlatCosts[9]!;
    const grown = b.longTermGrownCosts[9]!;
    assert.ok(grown.otherMonthlyCzk > flat.otherMonthlyCzk);
    assert.ok(grown.netCfCzk < flat.netCfCzk);
  });

  it("concrete sensitivity deltas match control magnitudes on adjusted base payment", () => {
    const b = buildCaseStudyBundle();
    const rentDelta = b.sensitivity.concreteDeltas.find(
      (d) => d.id === "rent-plus-1000"
    )!;
    const rateDelta = b.sensitivity.concreteDeltas.find(
      (d) => d.id === "rate-plus-1pp"
    )!;
    assert.ok(Math.abs(rentDelta.deltaMonthlyCashFlowCzk - 902.5) < 0.02);
    assert.ok(
      rateDelta.deltaPaymentCzk != null &&
        Math.abs(rateDelta.deltaPaymentCzk - 1_825.38) < 1
    );
  });

  it("sale net proceeds subtract debt and selling costs", () => {
    const b = buildCaseStudyBundle();
    const s = b.sales[0]!;
    assert.ok(
      Math.abs(
        s.netProceedsBeforeTaxCzk -
          (s.assumedSalePriceCzk - s.sellingCostsCzk - s.loanBalanceCzk)
      ) < 0.02
    );
  });

  it("settlement is not equal to sale proceeds alone", () => {
    const b = buildCaseStudyBundle();
    assert.notEqual(
      b.settlementY5.totalResultBeforeTaxCzk,
      b.settlementY5.saleNetProceedsBeforeTaxCzk
    );
    assert.match(b.settlementY5.excludedCs, /dan/i);
  });

  it("market comps are public listings with URLs; exclusions labeled", () => {
    const b = buildCaseStudyBundle();
    assert.equal(b.saleListings.length, 3);
    assert.equal(b.rentListings.length, 3);
    assert.ok(b.saleListings.every((l) => l.provenance === "verejna_nabidka"));
    assert.ok(b.saleListings.every((l) => l.url && l.url.startsWith("http")));
    assert.ok(b.excludedListings.length >= 1);
    assert.ok(b.excludedListings.every((l) => l.excluded));
  });

  it("at least three findings come from document / market work", () => {
    const b = buildCaseStudyBundle();
    const docFindings = b.findings.filter((f) => f.fromDocumentWork);
    assert.ok(docFindings.length >= 3);
    assert.ok(b.whatPremiumAddsCs.length >= 4);
  });
});

describe("sample pdf package routing helpers", () => {
  it("maps query to distinct variants and page targets", () => {
    assert.equal(samplePackageFromQuery("999"), "digital");
    assert.equal(samplePackageFromQuery("4990"), "premium");
    assert.equal(DIGITAL_SAMPLE_PAGE_COUNT, 8);
    assert.equal(PREMIUM_SAMPLE_PAGE_COUNT, 16);
  });
});
