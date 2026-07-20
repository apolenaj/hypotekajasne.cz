import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  PROPERTY_ANALYSIS_PRICING,
  buildFreePreview,
  formatAnalysisPrice,
  formatAnalysisPriceLabel,
  type ManualPropertyInput,
} from "@/lib/property-rentgen";

describe("PROPERTY_ANALYSIS_PRICING", () => {
  it("defaults to single 4 990 Kč display", () => {
    assert.equal(PROPERTY_ANALYSIS_PRICING.amountCzk, 4990);
    assert.match(formatAnalysisPrice(), /4[\s\u00a0\u202f]?990\s*Kč/);
    assert.ok(!formatAnalysisPrice().includes("/"));
    assert.ok(
      formatAnalysisPriceLabel().includes("Kompletní analýza nemovitosti")
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
    assert.ok(r.redFlags.length > 0);
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
