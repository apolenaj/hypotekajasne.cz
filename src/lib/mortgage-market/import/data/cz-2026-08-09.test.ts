/**
 * Phase 2 Step 2.2 — evidence integrity for CZ bank import manifest.
 * Pre-Phase-6: KB + ČS current primary-source refresh.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CZ_2026_08_09_MANIFEST,
  CZ_2026_08_09_RB_LOWER_PAYMENT_ANNUITY,
  CZ_MANIFEST_CHECKED_AT,
} from "@/lib/mortgage-market/import/data/cz-2026-08-09";
import {
  countRateVariantsByStatus,
  formatEvidenceIntegrityReport,
  verifyEvidenceIntegrity,
} from "@/lib/mortgage-market/import/evidence-integrity";
import { validateMortgageMarketImport } from "@/lib/mortgage-market/import/validate";

describe("CZ 2026-08-09 evidence integrity", () => {
  it("manifest validator passes", () => {
    const result = validateMortgageMarketImport(CZ_2026_08_09_MANIFEST);
    assert.equal(result.issues.length, 0, JSON.stringify(result.issues, null, 2));
  });

  it("reconciles every rate variant by status (exact sum)", () => {
    const counts = countRateVariantsByStatus(CZ_2026_08_09_MANIFEST.rates);
    const sum =
      counts.IMPORT_READY +
      counts.STRUCTURED +
      counts.VERIFIED +
      counts.HOLD +
      counts.FOUND +
      counts.other;
    assert.equal(sum, counts.total);
    assert.equal(counts.IMPORT_READY, 66);
    assert.equal(counts.HOLD, 7);
    assert.equal(counts.STRUCTURED, 0);
    assert.equal(counts.VERIFIED, 0);
    assert.equal(counts.FOUND, 0);
    assert.equal(counts.other, 0);
    assert.equal(counts.total, 73);
  });

  it("stores current KB Oznámení matrix and keeps product-page 5.19 separate", () => {
    const kb3y80 = CZ_2026_08_09_MANIFEST.rates.find(
      (r) => r.recordId === "kb-mortgage-3y-le80"
    );
    assert.ok(kb3y80);
    assert.equal(kb3y80.nominalInterestRate, 5.24);
    assert.equal(kb3y80.rateType, "advertised_from");
    assert.equal(kb3y80.auditStatus, "IMPORT_READY");
    if (kb3y80.ltv.kind === "explicit") {
      assert.equal(kb3y80.ltv.ltvMin, 0);
      assert.equal(kb3y80.ltv.ltvMax, 80);
      assert.equal(kb3y80.ltv.ltvMinExclusive, false);
    }

    const kb3y90 = CZ_2026_08_09_MANIFEST.rates.find(
      (r) => r.recordId === "kb-mortgage-3y-gt80-90"
    );
    assert.ok(kb3y90);
    assert.equal(kb3y90.nominalInterestRate, 5.64);
    if (kb3y90.ltv.kind === "explicit") {
      assert.equal(kb3y90.ltv.ltvMinExclusive, true);
    }

    const kb1y80 = CZ_2026_08_09_MANIFEST.rates.find(
      (r) => r.recordId === "kb-mortgage-1y-le80"
    );
    assert.ok(kb1y80);
    assert.equal(kb1y80.nominalInterestRate, 5.14);

    const stale539 = CZ_2026_08_09_MANIFEST.rates.filter(
      (r) =>
        r.recordId === "kb-mortgage-3y-le80" &&
        Math.abs(r.nominalInterestRate - 5.39) < 1e-9
    );
    assert.equal(stale539.length, 0);

    const conditional = CZ_2026_08_09_MANIFEST.rates.find(
      (r) => r.recordId === "kb-product-page-advertised-from-5-19"
    );
    assert.ok(conditional);
    assert.equal(conditional.nominalInterestRate, 5.19);
    assert.equal(conditional.fixationMonths, null);
    assert.equal(conditional.ltv.kind, "unspecified");
    assert.equal(
      conditional.pricingScenarioKey,
      "product_page_advertised_from_conditional"
    );
    assert.equal(conditional.auditStatus, "IMPORT_READY");
    assert.ok((conditional.conditions?.length ?? 0) >= 4);
    assert.ok(
      conditional.conditions?.every(
        (c) => c.rateEffectBp == null && c.effectInferred !== true
      )
    );

    const kbAm = CZ_2026_08_09_MANIFEST.rates.find(
      (r) => r.recordId === "kb-american-1y"
    );
    assert.ok(kbAm);
    assert.equal(kbAm.nominalInterestRate, 5.54);
    assert.equal(kbAm.ltv.kind, "unspecified");

    const example = CZ_2026_08_09_MANIFEST.representativeExamples?.find(
      (e) => e.recordId === "kb-product-page-representative-example"
    );
    assert.ok(example);
    assert.equal(example.nominalRate, 5.19);
    assert.equal(example.fixationMonths, 36);
    assert.equal(example.rpsn, 5.34);
    assert.equal(example.auditStatus, "IMPORT_READY");
  });

  it("keeps ČS Oznámení scenario IMPORT_READY and product-page 5.09 on HOLD", () => {
    const oznameni = CZ_2026_08_09_MANIFEST.rates.filter(
      (r) =>
        r.lenderSlug === "ceska-sporitelna" &&
        r.pricingScenarioKey === "oznameni_account_ppi_budoucnost"
    );
    assert.equal(oznameni.length, 9);
    assert.ok(oznameni.every((r) => r.auditStatus === "IMPORT_READY"));
    const cs3y = oznameni.find((r) => r.fixationMonths === 36);
    assert.ok(cs3y);
    assert.equal(cs3y.nominalInterestRate, 4.94);
    assert.ok(
      !oznameni.some(
        (r) =>
          r.fixationMonths === 36 &&
          Math.abs(r.nominalInterestRate - 5.09) < 1e-9
      )
    );
    assert.ok(
      oznameni.every((r) =>
        (r.conditions ?? []).every((c) => c.rateEffectBp == null)
      )
    );

    const campaign = CZ_2026_08_09_MANIFEST.rates.find(
      (r) => r.recordId === "cs-web-campaign-od-5-09-unreconciled"
    );
    assert.ok(campaign);
    assert.equal(campaign.auditStatus, "HOLD");
    assert.equal(campaign.nominalInterestRate, 5.09);
    assert.equal(campaign.fixationMonths, null);
  });

  it("keeps ČSOB displayed rates HOLD without inventing fixation", () => {
    const csob = CZ_2026_08_09_MANIFEST.rates.filter(
      (r) => r.lenderSlug === "csob"
    );
    assert.equal(csob.length, 4);
    assert.ok(csob.every((r) => r.auditStatus === "HOLD"));
    assert.ok(csob.every((r) => r.fixationMonths == null));
    assert.ok(csob.every((r) => r.ltv.kind === "unspecified"));
  });

  it("does not use RB 4.59 as Klasik; attaches example only to lower-payment product", () => {
    const klasikRates = CZ_2026_08_09_MANIFEST.rates.filter(
      (r) =>
        r.lenderSlug === "raiffeisenbank" && r.productSlug === "retail-klasik"
    );
    assert.equal(klasikRates.length, 0);

    const example = CZ_2026_08_09_MANIFEST.representativeExamples?.find(
      (e) => e.recordId === "rb-lower-payment-example"
    );
    assert.ok(example);
    assert.equal(example.productSlug, "hypoteka-s-nizsi-splatkou");
    assert.equal(example.nominalRate, 4.59);
    assert.equal(example.monthlyPayment, 13_388);
    assert.equal(
      CZ_2026_08_09_RB_LOWER_PAYMENT_ANNUITY.fullAnnuityMonthlyPayment,
      22_313
    );
    assert.notEqual(example.auditStatus, "IMPORT_READY");
  });

  it("evidence integrity PASS for all IMPORT_READY rates; reports CS collision", () => {
    const integrity = verifyEvidenceIntegrity(CZ_2026_08_09_MANIFEST);
    assert.equal(
      integrity.zeroInference,
      "PASS",
      formatEvidenceIntegrityReport(integrity)
    );
    assert.equal(integrity.ok, true);
    assert.equal(integrity.importReadyRateIds.length, 66);
    assert.ok(integrity.holdRowCount >= 3);

    const csCollision = integrity.collisions.find(
      (c) => c.recordB === "cs-web-campaign-od-5-09-unreconciled"
    );
    assert.ok(csCollision);
    assert.equal(csCollision.status, "NEEDS_RECONCILIATION");
    assert.equal(csCollision.rateB, 5.09);
    assert.equal(csCollision.rateA, 4.94);

    console.log(formatEvidenceIntegrityReport(integrity));
    console.log(
      JSON.stringify(
        {
          checkedAt: CZ_MANIFEST_CHECKED_AT,
          statusCounts: integrity.statusCounts,
          holdRows: integrity.holdRowCount,
          collisions: integrity.collisions,
          sqlReadiness:
            integrity.zeroInference === "PASS"
              ? "READY TO GENERATE PRODUCTION SQL"
              : "NOT READY TO GENERATE PRODUCTION SQL",
        },
        null,
        2
      )
    );
  });

  it("preserves confirmed Air / MONETA / UniCredit facts", () => {
    const air = CZ_2026_08_09_MANIFEST.rates.find(
      (r) => r.recordId === "air-purchase-3y-with-ppi"
    );
    assert.equal(air?.nominalInterestRate, 4.79);
    assert.equal(air?.ltv.kind, "explicit");

    const moneta = CZ_2026_08_09_MANIFEST.rates.find(
      (r) => r.recordId === "moneta-housing-3y"
    );
    assert.equal(moneta?.nominalInterestRate, 4.99);
    assert.equal(moneta?.ltv.kind, "unspecified");

    const uc = CZ_2026_08_09_MANIFEST.rates.find(
      (r) => r.recordId === "uc-purpose-3y-le80"
    );
    assert.equal(uc?.nominalInterestRate, 5.19);
    const ppi = uc?.conditions?.find(
      (c) => c.conditionType === "repayment_insurance"
    );
    assert.equal(ppi?.rateEffectBp ?? null, null);
  });
});
