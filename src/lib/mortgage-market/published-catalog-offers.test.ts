import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getPublishedCatalogOffers } from "@/lib/mortgage-market/published-catalog-offers";

describe("getPublishedCatalogOffers (public SoT)", () => {
  it("purchase 36m LTV75 returns Air Bank 4.99/5.09 not refinance 4.79/4.89", () => {
    const result = getPublishedCatalogOffers({
      purpose: "purchase",
      fixationMonths: 36,
      ltv: 75,
      includeLtvUnspecified: true,
    });
    const air = result.offers
      .filter((o) => o.lenderSlug === "air-bank")
      .map((o) => o.nominalInterestRate)
      .sort((a, b) => a - b);
    assert.deepEqual(air, [4.99, 5.09]);
    assert.ok(
      air.every((r) => r !== 4.79 && r !== 4.89),
      "purchase must not use refinance table rates"
    );
  });

  it("checkedAt is the Sep 2026 audit window, not 2026-08-09", () => {
    const result = getPublishedCatalogOffers({
      purpose: "purchase",
      fixationMonths: 36,
      ltv: 75,
    });
    const air = result.offers.find((o) => o.lenderSlug === "air-bank");
    assert.ok(air);
    assert.match(air!.checkedAt, /^2026-09-21/);
  });
});
