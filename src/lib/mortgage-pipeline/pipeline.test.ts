/**
 * Unit / integration tests — mortgage pipeline financial data.
 * Spouštění: npm test
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { detectAnomalies, detectDisappearedProducts } from "@/lib/mortgage-pipeline/anomaly";
import { buildProductId, hashPayload } from "@/lib/mortgage-pipeline/hash";
import { normalizeScrapedBank } from "@/lib/mortgage-pipeline/normalize";
import { resolveRepresentativeApr } from "@/lib/mortgage-pipeline/rpsn";
import { runPipelineCore } from "@/lib/mortgage-pipeline/run";
import { validateMortgageProduct } from "@/lib/mortgage-pipeline/validate";
import type { MortgageProduct } from "@/lib/mortgage-pipeline/types";
import type { ScrapedBankRate } from "@/lib/scrape/bank-scrapers";

function sampleScraped(
  overrides: Partial<ScrapedBankRate> = {}
): ScrapedBankRate {
  return {
    id: "unicredit-bank",
    bankName: "UniCredit Bank",
    rate: 5.09,
    rpsn: 5.35,
    rateWithInsurance: 5.09,
    rpsnWithInsurance: 5.35,
    rateWithoutInsurance: 5.39,
    rpsnWithoutInsurance: 5.65,
    withoutInsuranceEstimated: false,
    sourceUrl: "https://example.com/unicredit",
    americanRateWithInsurance: null,
    americanRpsnWithInsurance: null,
    americanRateWithoutInsurance: null,
    americanRpsnWithoutInsurance: null,
    americanWithoutInsuranceEstimated: false,
    americanSourceUrl: null,
    ...overrides,
  };
}

function sampleProduct(
  overrides: Partial<MortgageProduct> = {}
): MortgageProduct {
  return {
    id: "abc",
    country: "cz",
    lender: "Test Bank",
    productName: "Hypotéka",
    productType: "classic",
    purpose: "any",
    residency: "resident",
    currency: "CZK",
    rateType: "fixed",
    fixation: 5,
    ltvMin: null,
    ltvMax: null,
    loanAmountMin: null,
    loanAmountMax: null,
    termMin: null,
    termMax: null,
    nominalRateFrom: 5.0,
    representativeAPR: 5.3,
    representativeExample: "Reprezentativní příklad banky.",
    requiredAccount: null,
    requiredInsurance: true,
    fees: [],
    sourceUrl: "https://example.com",
    sourceType: "official_bank",
    validFrom: "2026-07-19T00:00:00.000Z",
    scrapedAt: "2026-07-19T00:00:00.000Z",
    verifiedAt: null,
    status: "LIVE",
    confidence: 0.85,
    rawSnapshotHash: "hash1",
    ...overrides,
  };
}

describe("resolveRepresentativeApr", () => {
  it("keeps APR only with representative example", () => {
    const r = resolveRepresentativeApr({
      apr: 5.35,
      example: "Příklad banky XYZ",
    });
    assert.equal(r.representativeAPR, 5.35);
    assert.ok(r.representativeExample);
  });

  it("drops APR without example (no universal RPSN)", () => {
    const r = resolveRepresentativeApr({ apr: 5.35, example: null });
    assert.equal(r.representativeAPR, null);
    assert.equal(r.reason, "apr_without_example_dropped");
  });

  it("allows computed APR only with complete fees", () => {
    const r = resolveRepresentativeApr({
      apr: null,
      example: null,
      feesComplete: true,
      computedApr: 5.4,
    });
    assert.equal(r.representativeAPR, 5.4);
  });
});

describe("validateMortgageProduct", () => {
  it("accepts valid product with rate + APR example", () => {
    const { ok, issues } = validateMortgageProduct(sampleProduct());
    assert.equal(ok, true);
    assert.equal(issues.filter((i) => i.severity === "error").length, 0);
  });

  it("rejects missing nominal rate", () => {
    const { ok } = validateMortgageProduct(
      sampleProduct({ nominalRateFrom: null })
    );
    assert.equal(ok, false);
  });

  it("rejects APR without example", () => {
    const { ok, issues } = validateMortgageProduct(
      sampleProduct({
        representativeAPR: 5.5,
        representativeExample: null,
      })
    );
    assert.equal(ok, false);
    assert.ok(
      issues.some((i) => i.field === "representativeAPR")
    );
  });
});

describe("detectAnomalies", () => {
  it("blocks auto-publish on large rate jump", () => {
    const prev = sampleProduct({ nominalRateFrom: 4.5 });
    const next = sampleProduct({
      nominalRateFrom: 5.5,
      rawSnapshotHash: "hash2",
    });
    const r = detectAnomalies(next, prev);
    assert.equal(r.blockAutoPublish, true);
    assert.ok(r.flags.some((f) => f.code === "RATE_JUMP"));
  });

  it("allows small rate change", () => {
    const prev = sampleProduct({ nominalRateFrom: 5.0 });
    const next = sampleProduct({
      nominalRateFrom: 5.1,
      rawSnapshotHash: "hash2",
    });
    const r = detectAnomalies(next, prev);
    assert.equal(r.blockAutoPublish, false);
  });
});

describe("detectDisappearedProducts", () => {
  it("flags missing products", () => {
    const flags = detectDisappearedProducts(["a", "b"], ["a"]);
    assert.equal(flags.length, 1);
    assert.equal(flags[0].code, "PRODUCT_DISAPPEARED");
  });
});

describe("normalizeScrapedBank", () => {
  it("does not invent rates — only maps scraped values", () => {
    const scraped = sampleScraped({
      rateWithoutInsurance: null,
      rpsnWithoutInsurance: null,
    });
    const { products } = normalizeScrapedBank(
      scraped,
      "2026-07-19T00:00:00.000Z"
    );
    assert.ok(products.every((p) => p.nominalRateFrom != null));
    assert.ok(
      !products.some((p) => p.productName.includes("bez pojištění"))
    );
  });

  it("marks estimated without-insurance as MODELLED and strips APR", () => {
    const scraped = sampleScraped({
      id: "ceska-sporitelna",
      bankName: "Česká spořitelna",
      withoutInsuranceEstimated: true,
      rateWithoutInsurance: 5.39,
      rpsnWithoutInsurance: 5.7,
    });
    const { products } = normalizeScrapedBank(
      scraped,
      "2026-07-19T00:00:00.000Z"
    );
    const without = products.find((p) =>
      p.productName.includes("bez pojištění")
    );
    assert.ok(without);
    assert.equal(without!.status, "MODELLED");
    assert.equal(without!.representativeAPR, null);
  });
});

describe("runPipelineCore integration", () => {
  it("auto-publishes valid scrape without prior product", () => {
    const result = runPipelineCore([sampleScraped()], [], {
      scrapedAt: "2026-07-19T04:00:00.000Z",
      runId: "00000000-0000-4000-8000-000000000001",
    });
    assert.ok(result.stats.autoPublished >= 1);
    assert.equal(result.stats.anomalyBlocked, 0);
    assert.ok(result.published.every((p) => p.nominalRateFrom != null));
  });

  it("does not auto-publish unnatural rate jump — stages for review", () => {
    const scraped = sampleScraped({ rateWithInsurance: 5.09, rate: 5.09 });
    const { products } = normalizeScrapedBank(
      scraped,
      "2026-07-18T04:00:00.000Z"
    );
    const previous = products.map((p) => ({
      ...p,
      nominalRateFrom:
        p.nominalRateFrom != null ? p.nominalRateFrom - 1.2 : null,
      rawSnapshotHash: "old-hash",
    }));

    const nextScraped = sampleScraped({
      rateWithInsurance: 5.09,
      rate: 5.09,
    });
    const result = runPipelineCore([nextScraped], previous, {
      scrapedAt: "2026-07-19T04:00:00.000Z",
      runId: "00000000-0000-4000-8000-000000000002",
    });

    assert.ok(result.stats.anomalyBlocked >= 1);
    assert.ok(
      result.decisions.some((d) => d.reviewStatus === "pending")
    );
    // Blocked products must not be in auto-published set with new rate
    const pendingIds = new Set(
      result.decisions
        .filter((d) => d.reviewStatus === "pending")
        .map((d) => d.product.id)
    );
    assert.ok(
      !result.published.some(
        (p) => pendingIds.has(p.id) && p.status === "LIVE"
      )
    );
  });

  it("marks disappeared published products as STALE fallback", () => {
    const prev = sampleProduct({
      id: buildProductId({
        country: "cz",
        lender: "Ghost Bank",
        productName: "Gone",
        productType: "classic",
        purpose: "any",
        fixation: 5,
        requiredInsurance: true,
      }),
      lender: "Ghost Bank",
      productName: "Gone",
      status: "LIVE",
    });
    const result = runPipelineCore([sampleScraped()], [prev], {
      scrapedAt: "2026-07-19T04:00:00.000Z",
      runId: "00000000-0000-4000-8000-000000000003",
    });
    assert.ok(result.stats.disappeared >= 1);
    const stale = result.published.find((p) => p.id === prev.id);
    assert.ok(stale);
    assert.equal(stale!.status, "STALE");
  });
});

describe("hash stability", () => {
  it("hashPayload is deterministic", () => {
    assert.equal(hashPayload({ a: 1 }), hashPayload({ a: 1 }));
  });
});
