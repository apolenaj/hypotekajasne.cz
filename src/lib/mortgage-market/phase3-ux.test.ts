/**
 * Phase 3 — public rate UX selection + LTV safety + scenario grouping.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getCz20260809Catalog } from "@/lib/mortgage-market/catalog-from-manifest";
import { groupOffersByLenderProduct } from "@/lib/mortgage-market/group-offers";
import { getMortgageOffers } from "@/lib/mortgage-market/offers";
import {
  conditionEffectLabelCs,
  ltvScopeLabelCs,
  publicFreshnessLabel,
  scenarioLabelCs,
} from "@/lib/mortgage-market/public-labels";
import { DEFAULT_CZ_MODEL_RATE } from "@/lib/rates/mortgage-rate-defaults";
import { statusBadgeLabel } from "@/lib/data/display";

const catalog = getCz20260809Catalog();
const NOW = Date.parse("2026-08-09T12:00:00.000Z");

describe("Phase 3 UX — purchase LTV75 / 36m", () => {
  it("A: explicit UniCredit/KB matches; Air scenarios; MONETA/CS unspecified", () => {
    const result = getMortgageOffers(catalog, {
      purpose: "purchase",
      fixationMonths: 36,
      ltv: 75,
      includeLtvUnspecified: true,
      nowMs: NOW,
    });

    const matchedRates = result.offers.map((o) => ({
      lender: o.lenderSlug,
      rate: o.nominalInterestRate,
    }));
    assert.ok(matchedRates.some((r) => r.lender === "unicredit" && r.rate === 5.19));
    assert.ok(matchedRates.some((r) => r.lender === "komercni-banka" && r.rate === 5.39));

    const airGroup = groupOffersByLenderProduct(
      result.offers.filter((o) => o.lenderSlug === "air-bank")
    )[0];
    // Air has explicit LTV to 90 — included in matched
    assert.ok(airGroup);
    assert.equal(airGroup.scenarios.length, 2);
    assert.deepEqual(
      airGroup.scenarios.map((s) => s.nominalInterestRate).sort(),
      [4.79, 4.89]
    );

    assert.equal(
      result.offers.filter((o) => o.lenderSlug === "moneta").length,
      0
    );
    assert.ok(
      result.unspecifiedLtvOffers.some(
        (o) =>
          o.lenderSlug === "moneta" &&
          o.productSlug === "mortgage-housing" &&
          o.nominalInterestRate === 4.99
      )
    );
    assert.ok(
      !result.unspecifiedLtvOffers.some(
        (o) =>
          o.lenderSlug === "moneta" &&
          (o.productSlug === "mortgage-trade-entrepreneur" ||
            o.nominalInterestRate === 5.59)
      )
    );
    assert.ok(
      result.unspecifiedLtvOffers.some(
        (o) => o.lenderSlug === "ceska-sporitelna" && o.nominalInterestRate === 5.09
      )
    );
    for (const o of result.unspecifiedLtvOffers) {
      const label = ltvScopeLabelCs(o);
      assert.equal(label.isPersonalizedMatch, false);
      assert.match(label.headline, /neuvedeno/i);
    }
  });

  it("B: LTV85 picks higher UniCredit/KB bands", () => {
    const result = getMortgageOffers(catalog, {
      purpose: "purchase",
      fixationMonths: 36,
      ltv: 85,
      nowMs: NOW,
    });
    assert.ok(result.offers.some((o) => o.lenderSlug === "unicredit" && o.nominalInterestRate === 5.69));
    assert.ok(result.offers.some((o) => o.lenderSlug === "komercni-banka" && o.nominalInterestRate === 5.79));
    assert.ok(!result.offers.some((o) => o.lenderSlug === "unicredit" && o.nominalInterestRate === 5.19));
  });

  it("C: refinance Air is not purchase", () => {
    const result = getMortgageOffers(catalog, {
      purpose: "refinance",
      fixationMonths: 36,
      lenderSlug: "air-bank",
      nowMs: NOW,
    });
    assert.deepEqual(
      result.offers.map((o) => o.nominalInterestRate).sort(),
      [4.69, 4.79]
    );
    assert.ok(result.offers.every((o) => o.financingPurpose === "refinance"));
  });

  it("D/E: CSOB and RB Klasik pending — no fake rates", () => {
    const csob = getMortgageOffers(catalog, {
      lenderSlug: "csob",
      productSlug: "retail-mortgage",
      fixationMonths: 36,
      nowMs: NOW,
    });
    assert.equal(csob.offers.length, 0);
    assert.equal(csob.usedModelFallback, false);
    assert.ok(!csob.offers.some((o) => o.nominalInterestRate === DEFAULT_CZ_MODEL_RATE));

    const rb = getMortgageOffers(catalog, {
      lenderSlug: "raiffeisenbank",
      productSlug: "retail-klasik",
      fixationMonths: 36,
      nowMs: NOW,
    });
    assert.equal(rb.offers.length, 0);
    assert.ok(!rb.offers.some((o) => o.nominalInterestRate === 4.59));
  });
});

describe("Phase 3 UX — labels", () => {
  it("never exposes pricing_scenario_key; PPI pair has Czech labels", () => {
    const air = getMortgageOffers(catalog, {
      lenderSlug: "air-bank",
      purpose: "purchase",
      fixationMonths: 36,
      nowMs: NOW,
    });
    const withPpi = air.offers.find(
      (o) => o.pricingScenarioKey === "with_repayment_insurance"
    )!;
    const without = air.offers.find(
      (o) => o.pricingScenarioKey === "without_repayment_insurance"
    )!;
    assert.equal(scenarioLabelCs(withPpi), "s pojištěním");
    assert.equal(scenarioLabelCs(without), "bez pojištění");
  });

  it("NULL rate effect stays null in public label", () => {
    assert.equal(conditionEffectLabelCs(null), null);
    assert.equal(conditionEffectLabelCs(undefined), null);
    assert.equal(conditionEffectLabelCs(-10), "sleva 0,1 p.b.");
  });

  it("freshness mapping avoids LIVE wording", () => {
    const fresh = publicFreshnessLabel("fresh", "2026-08-09T00:00:00.000Z");
    assert.match(fresh.short, /Ověřeno/);
    assert.ok(!fresh.short.includes("LIVE"));
    const stale = publicFreshnessLabel("stale", "2026-07-01T00:00:00.000Z");
    assert.equal(stale.short, "Aktualizujeme");
  });

  it("public data badges are Czech (no English LIVE/MODEL/NEEDS UPDATE)", () => {
    assert.equal(statusBadgeLabel("LIVE"), "Aktuální data");
    assert.equal(statusBadgeLabel("MODEL"), "Model");
    assert.equal(statusBadgeLabel("STALE"), "Aktualizujeme");
    assert.notEqual(statusBadgeLabel("STALE"), "NEEDS UPDATE");
  });
});
