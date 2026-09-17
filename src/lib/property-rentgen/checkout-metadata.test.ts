import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildRentgenCheckoutMetadata,
  parseRentgenCheckoutMetadata,
  snapshotToAuditInput,
} from "@/lib/property-rentgen/checkout-metadata";
import { CANONICAL_PREMIUM_ANALYSIS_PRICE_CZK } from "@/lib/property-rentgen/pricing";

describe("rentgen checkout metadata", () => {
  it("round-trips property params under Stripe 500-char limit", () => {
    const meta = buildRentgenCheckoutMetadata({
      address: "Praha 7 · Holešovice · ul. DEMO 12",
      areaM2: 68,
      purchasePriceCzk: 7_200_000,
      monthlyGrossRentCzk: 32_000,
      ownFundsCzk: 1_800_000,
      annualRatePercent: 4.89,
      capexCzk: 420_000,
    });

    assert.equal(meta.product, "rentgen_premium");
    assert.ok(meta.reportId.length > 8);
    assert.ok(meta.auditJson.length <= 500);
    assert.equal(meta.purchasePriceCzk, "7200000");
    assert.equal(meta.areaM2, "68");
    assert.equal(meta.monthlyRentCzk, "32000");
    assert.match(meta.address, /Praha 7/);

    const parsed = parseRentgenCheckoutMetadata(meta);
    assert.equal(parsed.snapshot.purchasePriceCzk, 7_200_000);
    assert.equal(parsed.snapshot.areaM2, 68);
    assert.equal(parsed.snapshot.monthlyGrossRentCzk, 32_000);

    const input = snapshotToAuditInput(parsed.snapshot, parsed.reportId);
    assert.equal(input.property.purchasePriceCzk, 7_200_000);
    assert.equal(input.mortgage.ownFundsCzk, 1_800_000);
    assert.equal(input.property.reportId, parsed.reportId);
  });

  it("keeps canonical premium price at 4990 CZK", () => {
    assert.equal(CANONICAL_PREMIUM_ANALYSIS_PRICE_CZK, 4990);
  });
});
