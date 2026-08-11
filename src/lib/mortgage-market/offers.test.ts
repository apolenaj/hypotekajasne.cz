/**
 * Phase 2 Step 2.4 — mortgage offer selection against production-mirror catalog.
 * HOLD rates are absent from the catalog (same as SQL generator).
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getCz20260809Catalog } from "@/lib/mortgage-market/catalog-from-manifest";
import {
  getCatalogRepresentativeExamples,
  getMortgageOffers,
} from "@/lib/mortgage-market/offers";
import { DEFAULT_CZ_MODEL_RATE } from "@/lib/rates/mortgage-rate-defaults";
import { rateFreshnessFromCheckedAt } from "@/lib/rates/mortgage-rate-freshness";

const catalog = getCz20260809Catalog();
const NOW = Date.parse("2026-08-09T12:00:00.000Z");

describe("getMortgageOffers — Air purchase / refinance scenarios", () => {
  it("A: Air purchase 36m returns both PPI scenarios (4.79 and 4.89)", () => {
    const result = getMortgageOffers(catalog, {
      countryCode: "CZ",
      purpose: "purchase",
      fixationMonths: 36,
      lenderSlug: "air-bank",
      nowMs: NOW,
    });
    assert.equal(result.usedModelFallback, false);
    const rates = result.offers.map((o) => o.nominalInterestRate).sort();
    assert.deepEqual(rates, [4.79, 4.89]);
    const keys = new Set(result.offers.map((o) => o.pricingScenarioKey));
    assert.ok(keys.has("with_repayment_insurance"));
    assert.ok(keys.has("without_repayment_insurance"));
    const withPpi = result.offers.find(
      (o) => o.pricingScenarioKey === "with_repayment_insurance"
    )!;
    const ppi = withPpi.conditions.find(
      (c) => c.conditionType === "repayment_insurance"
    );
    assert.equal(ppi?.rateEffectBp, -10);
    assert.ok(withPpi.evidence);
    assert.ok(withPpi.checkedAt);
    assert.ok(withPpi.validFrom);
  });

  it("B: Air refinance 36m returns 4.69 / 4.79 and does not mix purchase", () => {
    const result = getMortgageOffers(catalog, {
      countryCode: "CZ",
      purpose: "refinance",
      fixationMonths: 36,
      lenderSlug: "air-bank",
      nowMs: NOW,
    });
    const rates = result.offers.map((o) => o.nominalInterestRate).sort();
    assert.deepEqual(rates, [4.69, 4.79]);
    assert.ok(result.offers.every((o) => o.financingPurpose === "refinance"));
    assert.ok(!result.offers.some((o) => o.nominalInterestRate === 4.89));
  });
});

describe("getMortgageOffers — UniCredit / KB LTV boundaries", () => {
  it("C/D: UniCredit 36m LTV 75 → 5.19; LTV 85 → 5.69", () => {
    const at75 = getMortgageOffers(catalog, {
      lenderSlug: "unicredit",
      fixationMonths: 36,
      ltv: 75,
      nowMs: NOW,
    });
    assert.deepEqual(
      at75.offers.map((o) => o.nominalInterestRate),
      [5.19]
    );
    assert.equal(at75.offers[0]!.claimsPersonalizedLtvMatch, true);
    assert.equal(at75.offers[0]!.ltvScope, "explicit");

    const at85 = getMortgageOffers(catalog, {
      lenderSlug: "unicredit",
      fixationMonths: 36,
      ltv: 85,
      nowMs: NOW,
    });
    assert.deepEqual(
      at85.offers.map((o) => o.nominalInterestRate),
      [5.69]
    );
  });

  it("exact LTV boundaries: 80.000 / 80.001 / 90.000 / 90.001", () => {
    const at80 = getMortgageOffers(catalog, {
      lenderSlug: "unicredit",
      fixationMonths: 36,
      ltv: 80,
      nowMs: NOW,
    });
    assert.deepEqual(
      at80.offers.map((o) => o.nominalInterestRate),
      [5.19]
    );

    const justOver80 = getMortgageOffers(catalog, {
      lenderSlug: "unicredit",
      fixationMonths: 36,
      ltv: 80.001,
      nowMs: NOW,
    });
    assert.deepEqual(
      justOver80.offers.map((o) => o.nominalInterestRate),
      [5.69]
    );

    const at90 = getMortgageOffers(catalog, {
      lenderSlug: "unicredit",
      fixationMonths: 36,
      ltv: 90,
      nowMs: NOW,
    });
    assert.deepEqual(
      at90.offers.map((o) => o.nominalInterestRate),
      [5.69]
    );

    const over90 = getMortgageOffers(catalog, {
      lenderSlug: "unicredit",
      fixationMonths: 36,
      ltv: 90.001,
      nowMs: NOW,
    });
    assert.equal(over90.offers.length, 0);
  });

  it("E/F: KB 36m LTV 75 → 5.24; LTV 85 → 5.64; conditional 5.19 not personalized", () => {
    const at75 = getMortgageOffers(catalog, {
      lenderSlug: "komercni-banka",
      fixationMonths: 36,
      ltv: 75,
      includeLtvUnspecified: true,
      nowMs: NOW,
    });
    assert.deepEqual(
      at75.offers.map((o) => o.nominalInterestRate),
      [5.24]
    );
    assert.ok(
      at75.offers.every(
        (o) =>
          o.claimsPersonalizedLtvMatch === true &&
          o.pricingScenarioKey.includes("minimum_rate")
      )
    );
    assert.ok(
      at75.unspecifiedLtvOffers.some(
        (o) =>
          o.nominalInterestRate === 5.19 &&
          o.pricingScenarioKey === "product_page_advertised_from_conditional" &&
          o.claimsPersonalizedLtvMatch === false &&
          o.fixationMonths == null
      )
    );
    assert.ok(
      !at75.offers.some(
        (o) =>
          o.nominalInterestRate === 5.19 &&
          o.pricingScenarioKey === "product_page_advertised_from_conditional"
      )
    );

    const at85 = getMortgageOffers(catalog, {
      lenderSlug: "komercni-banka",
      fixationMonths: 36,
      ltv: 85,
      includeLtvUnspecified: true,
      nowMs: NOW,
    });
    assert.deepEqual(
      at85.offers.map((o) => o.nominalInterestRate),
      [5.64]
    );
    assert.ok(
      at85.offers.every(
        (o) =>
          o.claimsPersonalizedLtvMatch === true &&
          o.pricingScenarioKey.includes("minimum_rate")
      )
    );
    assert.ok(
      at85.unspecifiedLtvOffers.some(
        (o) =>
          o.nominalInterestRate === 5.19 &&
          o.pricingScenarioKey === "product_page_advertised_from_conditional" &&
          o.claimsPersonalizedLtvMatch === false &&
          o.fixationMonths == null
      )
    );
    assert.ok(
      !at85.offers.some((o) => o.nominalInterestRate === 5.19)
    );

    const conditional = catalog.rates.find(
      (r) => r.id === "kb-product-page-advertised-from-5-19"
    );
    assert.ok(conditional);
    assert.equal(conditional.fixationMonths, null);
    assert.equal(conditional.ltvMin, null);
    assert.equal(conditional.ltvMax, null);
    assert.equal(conditional.rateType, "advertised_from");
    const conds = catalog.conditions.filter(
      (c) => c.rateVariantId === conditional.id && c.isActive
    );
    assert.ok(conds.length >= 4);
    assert.ok(conds.every((c) => c.rateEffectBp == null));

    assert.ok(
      !catalog.rates.some(
        (r) =>
          r.id === "kb-mortgage-3y-le80" &&
          Math.abs(r.nominalInterestRate - 5.39) < 1e-9
      )
    );
  });
});

describe("getMortgageOffers — residential vs entrepreneur product audience", () => {
  it("ordinary purchase / 36m keeps MONETA housing 4.99 and excludes trade 5.59", () => {
    const ordinary = getMortgageOffers(catalog, {
      purpose: "purchase",
      fixationMonths: 36,
      includeLtvUnspecified: true,
      nowMs: NOW,
    });
    const moneta = [
      ...ordinary.offers,
      ...ordinary.unspecifiedLtvOffers,
    ].filter((o) => o.lenderSlug === "moneta");

    assert.ok(
      moneta.some(
        (o) =>
          o.productSlug === "mortgage-housing" &&
          o.nominalInterestRate === 4.99
      )
    );
    assert.ok(
      !moneta.some(
        (o) =>
          o.productSlug === "mortgage-trade-entrepreneur" ||
          o.nominalInterestRate === 5.59 ||
          o.productType === "business_secured" ||
          o.borrowerScope === "entrepreneur"
      )
    );
  });

  it("explicit entrepreneur / business path still returns MONETA trade 5.59", () => {
    const bySlug = getMortgageOffers(catalog, {
      purpose: "purchase",
      fixationMonths: 36,
      productSlug: "mortgage-trade-entrepreneur",
      includeLtvUnspecified: true,
      nowMs: NOW,
    });
    const tradeBySlug = [
      ...bySlug.offers,
      ...bySlug.unspecifiedLtvOffers,
    ];
    assert.ok(
      tradeBySlug.some(
        (o) =>
          o.productSlug === "mortgage-trade-entrepreneur" &&
          o.nominalInterestRate === 5.59
      )
    );

    const byAudience = getMortgageOffers(catalog, {
      purpose: "purchase",
      fixationMonths: 36,
      productType: "business_secured",
      borrowerScope: "entrepreneur",
      includeLtvUnspecified: true,
      nowMs: NOW,
    });
    const tradeByAudience = [
      ...byAudience.offers,
      ...byAudience.unspecifiedLtvOffers,
    ];
    assert.ok(
      tradeByAudience.some(
        (o) =>
          o.lenderSlug === "moneta" &&
          o.productSlug === "mortgage-trade-entrepreneur" &&
          o.nominalInterestRate === 5.59
      )
    );
  });
});

describe("getMortgageOffers — unknown LTV safety", () => {
  it("G: MONETA 36m LTV 75 never claims personalized LTV match", () => {
    const strict = getMortgageOffers(catalog, {
      lenderSlug: "moneta",
      fixationMonths: 36,
      ltv: 75,
      nowMs: NOW,
    });
    assert.equal(strict.offers.length, 0);
    assert.ok(
      strict.lenderAvailability.some((a) =>
        a.message.includes("unspecified LTV")
      )
    );

    const withBucket = getMortgageOffers(catalog, {
      lenderSlug: "moneta",
      fixationMonths: 36,
      ltv: 75,
      includeLtvUnspecified: true,
      nowMs: NOW,
    });
    assert.equal(withBucket.offers.length, 0);
    assert.ok(withBucket.unspecifiedLtvOffers.length > 0);
    assert.ok(
      withBucket.unspecifiedLtvOffers.every(
        (o) =>
          o.ltvScope === "unspecified" &&
          o.claimsPersonalizedLtvMatch === false
      )
    );
  });

  it("H: CS 36m Oznámení 4.94 stays LTV unspecified; headline 5.09 not active", () => {
    const withBucket = getMortgageOffers(catalog, {
      lenderSlug: "ceska-sporitelna",
      fixationMonths: 36,
      ltv: 75,
      includeLtvUnspecified: true,
      nowMs: NOW,
    });
    assert.equal(withBucket.offers.length, 0);
    const rates = withBucket.unspecifiedLtvOffers.map(
      (o) => o.nominalInterestRate
    );
    assert.ok(rates.includes(4.94));
    assert.ok(!rates.includes(5.09));
    assert.ok(
      withBucket.unspecifiedLtvOffers.every(
        (o) => o.ltvScope === "unspecified" && !o.claimsPersonalizedLtvMatch
      )
    );
    assert.ok(
      !catalog.rates.some(
        (r) =>
          r.id === "cs-oznameni-3y" &&
          Math.abs(r.nominalInterestRate - 5.09) < 1e-9
      )
    );
  });
});

describe("getMortgageOffers — CSOB / RB / HOLD / fallback safety", () => {
  it("I: CSOB retail has zero verified rates (no fake / HOLD / model)", () => {
    const result = getMortgageOffers(catalog, {
      lenderSlug: "csob",
      productSlug: "retail-mortgage",
      fixationMonths: 36,
      nowMs: NOW,
    });
    assert.equal(result.offers.length, 0);
    assert.equal(result.usedModelFallback, false);
    assert.ok(
      !result.offers.some((o) => o.nominalInterestRate === DEFAULT_CZ_MODEL_RATE)
    );
    assert.ok(
      result.lenderAvailability.some(
        (a) => a.rateStatus === "verification_pending"
      )
    );
  });

  it("J: RB Klasik has zero verified rates; 4.59 never returned as Klasik", () => {
    const result = getMortgageOffers(catalog, {
      lenderSlug: "raiffeisenbank",
      productSlug: "retail-klasik",
      fixationMonths: 36,
      nowMs: NOW,
    });
    assert.equal(result.offers.length, 0);
    assert.ok(!result.offers.some((o) => o.nominalInterestRate === 4.59));
    const anyRb = getMortgageOffers(catalog, {
      lenderSlug: "raiffeisenbank",
      nowMs: NOW,
    });
    assert.ok(
      !anyRb.offers.some(
        (o) =>
          o.productSlug === "retail-klasik" && o.nominalInterestRate === 4.59
      )
    );
  });

  it("model fallback never mixed into bank offers", () => {
    const result = getMortgageOffers(catalog, {
      countryCode: "CZ",
      fixationMonths: 36,
      nowMs: NOW,
    });
    assert.equal(result.usedModelFallback, false);
    assert.ok(
      !result.offers.some((o) => o.nominalInterestRate === DEFAULT_CZ_MODEL_RATE)
    );
  });
});

describe("getMortgageOffers — conditions, RPSN, evidence, freshness", () => {
  it("preserves Air PPI −10bp, MONETA account −50bp / PPI −20bp, UC NULL effect", () => {
    const air = getMortgageOffers(catalog, {
      lenderSlug: "air-bank",
      purpose: "purchase",
      fixationMonths: 36,
      pricingScenarioKey: "with_repayment_insurance",
      nowMs: NOW,
    });
    assert.equal(
      air.offers[0]!.conditions.find(
        (c) => c.conditionType === "repayment_insurance"
      )?.rateEffectBp,
      -10
    );

    const moneta = getMortgageOffers(catalog, {
      lenderSlug: "moneta",
      productSlug: "mortgage-housing",
      fixationMonths: 36,
      nowMs: NOW,
    });
    const conds = moneta.offers[0]!.conditions;
    assert.equal(
      conds.find((c) => c.conditionType === "active_account_required")
        ?.rateEffectBp,
      -50
    );
    assert.equal(
      conds.find((c) => c.conditionType === "repayment_insurance")?.rateEffectBp,
      -20
    );

    const uc = getMortgageOffers(catalog, {
      lenderSlug: "unicredit",
      fixationMonths: 36,
      ltv: 75,
      nowMs: NOW,
    });
    const ucPpi = uc.offers[0]!.conditions.find(
      (c) => c.conditionType === "repayment_insurance"
    );
    assert.equal(ucPpi?.rateEffectBp, null);
  });

  it("MONETA representative examples stay separate; no RPSN ranking", () => {
    const examples = getCatalogRepresentativeExamples(catalog, {
      lenderSlug: "moneta",
      productSlug: "mortgage-housing",
    });
    const withPpi = examples.find((e) => e.id === "moneta-rpsn-with-ppi")!;
    const without = examples.find((e) => e.id === "moneta-rpsn-without-ppi")!;
    assert.equal(withPpi.nominalRate, 4.99);
    assert.equal(withPpi.rpsn, 6.11);
    assert.equal(without.nominalRate, 5.19);
    assert.equal(without.rpsn, 5.33);
    // Lower nominal must not imply cheaper overall cost.
    assert.ok((withPpi.rpsn ?? 0) > (without.rpsn ?? 0));
  });

  it("each returned offer exposes evidence + freshness from checked_at", () => {
    const result = getMortgageOffers(catalog, {
      lenderSlug: "air-bank",
      purpose: "purchase",
      fixationMonths: 36,
      nowMs: NOW,
    });
    for (const o of result.offers) {
      assert.ok(o.evidence);
      assert.ok(o.evidence!.sourceType);
      assert.ok(o.checkedAt);
      assert.equal(
        o.freshness,
        rateFreshnessFromCheckedAt(o.checkedAt, NOW)
      );
      assert.notEqual(o.freshness, "fallback" as string);
    }

    const staleNow = Date.parse("2026-09-01T12:00:00.000Z");
    const aging = getMortgageOffers(catalog, {
      lenderSlug: "air-bank",
      purpose: "purchase",
      fixationMonths: 36,
      nowMs: staleNow,
    });
    assert.ok(aging.offers.every((o) => o.freshness === "stale"));
  });

  it("explicit scenario selector can narrow Air PPI choice", () => {
    const onlyWith = getMortgageOffers(catalog, {
      lenderSlug: "air-bank",
      purpose: "purchase",
      fixationMonths: 36,
      pricingScenarioKey: "with_repayment_insurance",
      nowMs: NOW,
    });
    assert.equal(onlyWith.offers.length, 1);
    assert.equal(onlyWith.offers[0]!.nominalInterestRate, 4.79);
  });
});
