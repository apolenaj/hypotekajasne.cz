import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ANALYSIS_PRODUCT_TIERS,
  ANONYMOUS_SAMPLE_REPORT,
  PROPERTY_ANALYSIS_PRICING,
  SAMPLE_REPORT_SECTION_IDS,
  buildFreePreview,
  formatAnalysisPrice,
  formatAnalysisPriceLabel,
  formatTierPrice,
  getAnalysisTier,
  getRentgenPremiumConfig,
  type ManualPropertyInput,
} from "@/lib/property-rentgen";

describe("PROPERTY_ANALYSIS_PRICING", () => {
  it("defaults to single 4 990 Kč display", () => {
    assert.equal(PROPERTY_ANALYSIS_PRICING.amountCzk, 4990);
    assert.match(formatAnalysisPrice(), /4[\s\u00a0\u202f]?990\s*Kč/);
    assert.ok(!formatAnalysisPrice().includes("/"));
    assert.ok(
      formatAnalysisPriceLabel().includes("Detailní analýza nemovitosti")
    );
    assert.equal(
      PROPERTY_ANALYSIS_PRICING.ctaLabel,
      "Získat detailní analýzu"
    );
  });

  it("exposes free / premium / inquiry tiers without inventing advanced SKU price", () => {
    assert.equal(ANALYSIS_PRODUCT_TIERS.length, 3);
    assert.equal(ANALYSIS_PRODUCT_TIERS[0]!.id, "free");
    assert.equal(ANALYSIS_PRODUCT_TIERS[1]!.priceCzk, 4990);
    assert.equal(ANALYSIS_PRODUCT_TIERS[2]!.commerciallyActive, false);
    assert.match(formatTierPrice(ANALYSIS_PRODUCT_TIERS[2]!), /poptávku/i);
  });

  it("premium tier commerciallyActive follows product config (default preparing)", () => {
    const tiers = getAnalysisTier();
    const premium = tiers.find((t) => t.id === "premium")!;
    const cfg = getRentgenPremiumConfig();
    assert.equal(premium.commerciallyActive, cfg.commerciallyActive);
    assert.equal(cfg.status, "preparing");
    assert.equal(cfg.statusLabel, "Připravujeme");
    assert.equal(cfg.checkoutMode, "interest_only");
  });

  it("SLA is not hardcoded when env unset", () => {
    const cfg = getRentgenPremiumConfig();
    assert.equal(cfg.deliverySla.configured, false);
    assert.ok(cfg.deliverySla.note.length > 10);
  });
});

describe("sample report structure", () => {
  it("has 13 PROMPT 18 sections", () => {
    assert.equal(SAMPLE_REPORT_SECTION_IDS.length, 13);
    assert.equal(ANONYMOUS_SAMPLE_REPORT.sections.length, 13);
    assert.equal(ANONYMOUS_SAMPLE_REPORT.isDemo, true);
    const methods = new Set(
      ANONYMOUS_SAMPLE_REPORT.sections.map((s) => s.method)
    );
    assert.ok(methods.has("automated_calculation"));
    assert.ok(methods.has("ai_analysis"));
    assert.equal(
      ANONYMOUS_SAMPLE_REPORT.sections.some(
        (s) => s.method === "human_verification"
      ),
      false
    );
  });
});

describe("buildFreePreview", () => {
  it("computes DATA yield and price/m2 from manual inputs", () => {
    const input: ManualPropertyInput = {
      country: "Česká republika",
      city: "Praha",
      propertyType: "Byt",
      areaM2: 68,
      priceCzk: 8_400_000,
      rentMonthlyCzk: 28_000,
      equityCzk: 2_000_000,
      purpose: "investment",
      listingUrl: "",
    };
    const r = buildFreePreview(input, "manual");
    assert.equal(r.orientationalYieldPa.kind, "DATA");
    assert.equal(r.orientationalYieldPa.value, 4);
    assert.equal(r.pricePerM2.kind, "DATA");
    assert.equal(r.pricePerM2.value, 123529);
    assert.equal(r.financingFit.kind, "ODHAD");
    assert.ok(r.warningSignals.length > 0);
    assert.ok(r.redFlags.length > 0);
    assert.ok(r.dataQuality.score >= 80);
    assert.ok(r.marketComparison?.hasMarketData);
    assert.ok(r.modelCashFlow?.netMonthlyModel.value != null);
  });

  it("does not invent legal facts — marks missing as NEOVERENO path in limitations", () => {
    const r = buildFreePreview(
      {
        country: "Česká republika",
        city: "",
        propertyType: "Byt",
        areaM2: null,
        priceCzk: null,
        rentMonthlyCzk: null,
        equityCzk: null,
        purpose: "investment",
        listingUrl: "",
      },
      "manual"
    );
    assert.ok(
      r.limitations.some((l) => l.toLowerCase().includes("právní"))
    );
    assert.equal(r.orientationalYieldPa.kind, "NEOVERENO");
    assert.equal(r.dataQuality.band, "insufficient");
  });

  it("skips market comparison when city not in catalog and no price/m2", () => {
    const r = buildFreePreview(
      {
        country: "Česká republika",
        city: "Neexistující Město XYZ",
        propertyType: "Byt",
        areaM2: null,
        priceCzk: null,
        rentMonthlyCzk: null,
        equityCzk: null,
        purpose: "investment",
        listingUrl: "",
      },
      "manual"
    );
    assert.equal(r.marketComparison, null);
  });

  it("treats URL as reference only", () => {
    const r = buildFreePreview(
      {
        country: "Česká republika",
        city: "Praha",
        propertyType: "Byt",
        areaM2: 50,
        priceCzk: 5_000_000,
        rentMonthlyCzk: null,
        equityCzk: 1_000_000,
        purpose: "investment",
        listingUrl: "https://example.com/listing",
      },
      "url"
    );
    assert.ok(
      r.limitations.some((l) => l.includes("URL") || l.includes("neověřujeme"))
    );
  });
});
