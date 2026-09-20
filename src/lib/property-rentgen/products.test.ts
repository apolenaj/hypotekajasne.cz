import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildServerStripeLineItem,
  expectedAmountHalere,
  getProductOrThrow,
  normalizeProductCode,
  PRODUCT_CODE,
  RENTGEN_PRODUCTS,
} from "@/lib/property-rentgen/products";
import { parsePropertyPayload } from "@/lib/property-rentgen/checkout-parse";

describe("rentgen product allowlist", () => {
  it("maps 999 Kč INVESTMENT_XRAY", () => {
    const p = getProductOrThrow("INVESTMENT_XRAY");
    assert.equal(p.amountCzk, 999);
    assert.equal(p.code, PRODUCT_CODE.INVESTMENT_XRAY);
    assert.equal(normalizeProductCode("999"), PRODUCT_CODE.INVESTMENT_XRAY);
    assert.equal(normalizeProductCode("digital"), PRODUCT_CODE.INVESTMENT_XRAY);
  });

  it("maps 4990 Kč INDIVIDUAL_ANALYSIS", () => {
    const p = getProductOrThrow("INDIVIDUAL_ANALYSIS");
    assert.equal(p.amountCzk, 4990);
    assert.equal(
      normalizeProductCode("rentgen_premium"),
      PRODUCT_CODE.INDIVIDUAL_ANALYSIS
    );
    assert.equal(normalizeProductCode("4990"), PRODUCT_CODE.INDIVIDUAL_ANALYSIS);
  });

  it("rejects invalid productCode", () => {
    assert.equal(normalizeProductCode("HACKED_PRODUCT"), null);
    assert.throws(() => getProductOrThrow("HACKED_PRODUCT"));
  });

  it("server line item ignores client amount — uses canonical CZK", () => {
    const digital = buildServerStripeLineItem(
      RENTGEN_PRODUCTS.INVESTMENT_XRAY
    );
    const premium = buildServerStripeLineItem(
      RENTGEN_PRODUCTS.INDIVIDUAL_ANALYSIS
    );
    assert.equal(expectedAmountHalere(RENTGEN_PRODUCTS.INVESTMENT_XRAY), 99900);
    assert.equal(
      expectedAmountHalere(RENTGEN_PRODUCTS.INDIVIDUAL_ANALYSIS),
      499000
    );
    if (digital.kind === "price_data") {
      assert.equal(digital.unitAmountHalere, 99900);
    }
    if (premium.kind === "price_data") {
      assert.equal(premium.unitAmountHalere, 499000);
    }
  });
});

describe("checkout property parse", () => {
  it("accepts equity alias and default rate", () => {
    const parsed = parsePropertyPayload({
      priceCzk: 5_000_000,
      monthlyRentCzk: 25_000,
      equityCzk: 1_000_000,
    });
    assert.ok(!("error" in parsed));
    if (!("error" in parsed)) {
      assert.equal(parsed.purchasePriceCzk, 5_000_000);
      assert.equal(parsed.ownFundsCzk, 1_000_000);
      assert.equal(parsed.annualRatePercent, 4.8);
    }
  });

  it("rejects missing purchase price", () => {
    const parsed = parsePropertyPayload({
      monthlyRentCzk: 25_000,
      equityCzk: 1_000_000,
    });
    assert.ok("error" in parsed);
  });
});
