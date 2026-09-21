/**
 * Public /sazby rate display policy — 72h freshness, source URL, orientační labels.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getCz20260809Catalog } from "@/lib/mortgage-market/catalog-from-manifest";
import { getMortgageOffers } from "@/lib/mortgage-market/offers";
import {
  evaluatePublicRateDisplay,
  isPubliclyListableMortgageOffer,
  orientacniSazbaPrefix,
} from "@/lib/mortgage-market/public-rate-display";
import { PUBLIC_RATE_FRESH_MAX_AGE_MS } from "@/lib/rates/mortgage-rate-freshness";

const catalog = getCz20260809Catalog();
const NOW = Date.parse("2026-09-21T12:00:00.000Z");
const OFFICIAL_URL = "https://www.example-bank.test/rates";

function sampleOffer(overrides: Record<string, unknown> = {}) {
  return {
    checkedAt: "2026-09-21T00:00:00.000Z",
    evidence: {
      id: "ev-1",
      sourceType: "official_lender_web",
      sourceName: "Bank",
      sourceUrl: OFFICIAL_URL,
      checkedAt: "2026-09-21T00:00:00.000Z",
      reliabilityTier: "primary",
    },
    nominalInterestRate: 4.79,
    rateType: "standard" as const,
    pricingScenarioKey: "with_repayment_insurance",
    validTo: null,
    ...overrides,
  };
}

describe("evaluatePublicRateDisplay — 72h freshness", () => {
  it("fresh rate within 72h shows Orientační sazba od with numeric value", () => {
    const display = evaluatePublicRateDisplay(
      sampleOffer({ rateType: "advertised_from" }),
      NOW
    );
    assert.equal(display.visibility, "published");
    assert.equal(display.showNumeric, true);
    assert.equal(display.headline, "od 4,79 % p. a.");
    assert.match(display.badge, /Ověřeno/);
    assert.ok(display.verifiedAtLabel);
    assert.equal(display.sourceUrl, OFFICIAL_URL);
  });

  it("standard rate uses Orientační sazba without od", () => {
    const display = evaluatePublicRateDisplay(sampleOffer(), NOW);
    assert.match(display.headline, /^4,79 % p\. a\.$/);
    assert.equal(orientacniSazbaPrefix(sampleOffer()), "Orientační sazba");
  });

  it("rate older than 72h keeps the number as last verified, not as current", () => {
    const staleAt = new Date(
      NOW - PUBLIC_RATE_FRESH_MAX_AGE_MS - 60_000
    ).toISOString();
    const display = evaluatePublicRateDisplay(
      sampleOffer({ checkedAt: staleAt }),
      NOW
    );
    assert.equal(display.visibility, "last_verified");
    assert.equal(display.showNumeric, true);
    assert.equal(display.headline, "4,79 % p. a.");
    assert.equal(display.badge, "Poslední ověřená sazba");
    assert.match(display.freshnessNote ?? "", /není potvrzena/);
    assert.ok(display.sourceUrl);
  });

  it("does not present a rate whose published validity has ended", () => {
    const display = evaluatePublicRateDisplay(
      sampleOffer({ validTo: "2026-08-01T00:00:00.000Z" }),
      NOW
    );
    assert.equal(display.visibility, "expired");
    assert.equal(display.showNumeric, false);
    assert.equal(display.headline, "Sazba podle zdroje pozbyla platnosti");
  });

  it("treats a missing end date as unstated, not as expired or currently confirmed beyond checkedAt", () => {
    const { validTo: _ignored, ...withoutEnd } = sampleOffer();
    const omitted = evaluatePublicRateDisplay(withoutEnd, NOW);
    const explicitNull = evaluatePublicRateDisplay(
      sampleOffer({ validTo: null }),
      NOW
    );
    const blank = evaluatePublicRateDisplay(sampleOffer({ validTo: "  " }), NOW);
    assert.equal(omitted.visibility, "published");
    assert.equal(omitted.showNumeric, true);
    assert.equal(explicitNull.visibility, "published");
    assert.equal(blank.visibility, "published");
    assert.equal(explicitNull.headline, omitted.headline);

    const staleAt = new Date(
      NOW - PUBLIC_RATE_FRESH_MAX_AGE_MS - 60_000
    ).toISOString();
    const staleUnstated = evaluatePublicRateDisplay(
      sampleOffer({ checkedAt: staleAt, validTo: null }),
      NOW
    );
    assert.equal(staleUnstated.visibility, "last_verified");
    assert.equal(staleUnstated.showNumeric, true);
  });

  it("keeps a numeric rate when validTo is still in the future", () => {
    const display = evaluatePublicRateDisplay(
      sampleOffer({ validTo: "2026-12-01T00:00:00.000Z" }),
      NOW
    );
    assert.equal(display.visibility, "published");
    assert.equal(display.showNumeric, true);
    assert.equal(display.headline, "4,79 % p. a.");
  });

  it("does not treat an unreadable validTo as open-ended", () => {
    const display = evaluatePublicRateDisplay(
      sampleOffer({ validTo: "není-datum" }),
      NOW
    );
    assert.equal(display.visibility, "unavailable");
    assert.equal(display.showNumeric, false);
    assert.equal(display.headline, "Konec platnosti ve zdroji nelze přečíst");
    assert.notEqual(display.visibility, "published");
  });

  it("missing checkedAt hides offer from public listing", () => {
    const noChecked = sampleOffer({
      checkedAt: "",
      evidence: {
        ...sampleOffer().evidence!,
        checkedAt: "",
      },
    });
    const display = evaluatePublicRateDisplay(noChecked, NOW);
    assert.equal(display.visibility, "hidden");
    assert.equal(isPubliclyListableMortgageOffer(noChecked, NOW), false);
  });

  it("missing official HTTPS source hides offer from public listing", () => {
    const display = evaluatePublicRateDisplay(
      sampleOffer({
        evidence: {
          ...sampleOffer().evidence!,
          sourceUrl: null,
        },
      }),
      NOW
    );
    assert.equal(display.visibility, "hidden");
    assert.equal(
      isPubliclyListableMortgageOffer(
        sampleOffer({
          evidence: {
            ...sampleOffer().evidence!,
            sourceUrl: "http://insecure.test/rates",
          },
        }),
        NOW
      ),
      false
    );
  });
});

describe("getMortgageOffers — purchase vs refinance product rates", () => {
  it("purchase and refinance return distinct Air Bank rates", () => {
    const purchase = getMortgageOffers(catalog, {
      purpose: "purchase",
      fixationMonths: 36,
      lenderSlug: "air-bank",
      nowMs: NOW,
    });
    const refinance = getMortgageOffers(catalog, {
      purpose: "refinance",
      fixationMonths: 36,
      lenderSlug: "air-bank",
      nowMs: NOW,
    });
    assert.deepEqual(
      purchase.offers.map((o) => o.nominalInterestRate).sort(),
      [4.99, 5.09]
    );
    assert.deepEqual(
      refinance.offers.map((o) => o.nominalInterestRate).sort(),
      [4.79, 4.89]
    );
    assert.ok(purchase.offers.every((o) => o.financingPurpose === "purchase"));
    assert.ok(refinance.offers.every((o) => o.financingPurpose === "refinance"));
  });

  it("catalog offers with evidence pass public listing gate at manifest date", () => {
    const result = getMortgageOffers(catalog, {
      purpose: "purchase",
      fixationMonths: 36,
      ltv: 75,
      nowMs: NOW,
    });
    assert.ok(result.offers.length > 0);
    for (const offer of result.offers) {
      assert.ok(
        isPubliclyListableMortgageOffer(offer, NOW),
        `${offer.lenderSlug} should be listable`
      );
      assert.ok(offer.evidence?.sourceUrl?.startsWith("https://"));
      assert.equal(
        offer.validTo,
        null,
        `${offer.lenderSlug} must not invent a validity end`
      );
    }
  });
});
