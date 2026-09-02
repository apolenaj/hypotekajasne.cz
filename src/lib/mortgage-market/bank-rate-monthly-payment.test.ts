/**
 * Orientační bankovní splátka — anuitní matematika + integrace s /sazby katalogem.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getCz20260809Catalog } from "@/lib/mortgage-market/catalog-from-manifest";
import { getMortgageOffers } from "@/lib/mortgage-market/offers";
import {
  BANK_RATE_PAYMENT_DISCLAIMER,
  computeOrientacniBankMonthlyPayment,
  formatOrientacniBankMonthlyPaymentLine,
  resolveBankRatePaymentDisplay,
} from "@/lib/mortgage-market/bank-rate-monthly-payment";
import {
  evaluatePublicRateDisplay,
  PUBLIC_RATE_VERIFYING_MESSAGE,
} from "@/lib/mortgage-market/public-rate-display";
import { PUBLIC_RATE_FRESH_MAX_AGE_MS } from "@/lib/rates/mortgage-rate-freshness";

const catalog = getCz20260809Catalog();
const NOW = Date.parse("2026-08-09T12:00:00.000Z");
const OFFICIAL_URL = "https://www.example-bank.test/rates";

const ACCEPTANCE = {
  loanAmountCzk: 6_000_000,
  termYears: 25,
} as const;

function sampleOffer(overrides: Record<string, unknown> = {}) {
  return {
    checkedAt: "2026-08-09T00:00:00.000Z",
    evidence: {
      id: "ev-1",
      sourceType: "official_lender_web",
      sourceName: "Bank",
      sourceUrl: OFFICIAL_URL,
      checkedAt: "2026-08-09T00:00:00.000Z",
      reliabilityTier: "primary",
    },
    nominalInterestRate: 4.89,
    rateType: "standard" as const,
    pricingScenarioKey: "with_repayment_insurance",
    ...overrides,
  };
}

describe("computeOrientacniBankMonthlyPayment — unit", () => {
  it("acceptance: 6M / 25y @ 4,89 % → 34 692 Kč", () => {
    const payment = computeOrientacniBankMonthlyPayment({
      ...ACCEPTANCE,
      annualRatePercent: 4.89,
    });
    assert.equal(payment, 34_692);
    assert.match(
      formatOrientacniBankMonthlyPaymentLine(payment!),
      /^Orientační splátka: 34[\s\u00a0]?692[\s\u00a0]?Kč\/měs\.$/
    );
  });

  it("acceptance: 6M / 25y @ 5,09 % → 35 391 Kč", () => {
    const payment = computeOrientacniBankMonthlyPayment({
      ...ACCEPTANCE,
      annualRatePercent: 5.09,
    });
    assert.equal(payment, 35_391);
  });

  it("zero rate → jistina / počet splátek", () => {
    const payment = computeOrientacniBankMonthlyPayment({
      loanAmountCzk: 1_200_000,
      termYears: 20,
      annualRatePercent: 0,
    });
    assert.equal(payment, Math.round(1_200_000 / (20 * 12)));
  });

  it("rejects missing or invalid params", () => {
    assert.equal(
      computeOrientacniBankMonthlyPayment({
        loanAmountCzk: 0,
        termYears: 25,
        annualRatePercent: 4.89,
      }),
      null
    );
    assert.equal(
      computeOrientacniBankMonthlyPayment({
        loanAmountCzk: 6_000_000,
        termYears: 0,
        annualRatePercent: 4.89,
      }),
      null
    );
    assert.equal(
      computeOrientacniBankMonthlyPayment({
        loanAmountCzk: Number.NaN,
        termYears: 25,
        annualRatePercent: 4.89,
      }),
      null
    );
    assert.equal(
      computeOrientacniBankMonthlyPayment({
        loanAmountCzk: 6_000_000,
        termYears: 25,
        annualRatePercent: -0.01,
      }),
      null
    );
  });

  it("rejects extreme loan, term, and rate", () => {
    assert.equal(
      computeOrientacniBankMonthlyPayment({
        loanAmountCzk: 600_000_000,
        termYears: 25,
        annualRatePercent: 4.89,
      }),
      null
    );
    assert.equal(
      computeOrientacniBankMonthlyPayment({
        loanAmountCzk: 6_000_000,
        termYears: 60,
        annualRatePercent: 4.89,
      }),
      null
    );
    assert.equal(
      computeOrientacniBankMonthlyPayment({
        loanAmountCzk: 6_000_000,
        termYears: 25,
        annualRatePercent: 35,
      }),
      null
    );
  });
});

describe("resolveBankRatePaymentDisplay", () => {
  it("builds rate headline and payment for fresh published offer", () => {
    const resolved = resolveBankRatePaymentDisplay(
      sampleOffer({ rateType: "advertised_from" }),
      ACCEPTANCE,
      NOW
    );
    assert.ok(resolved);
    assert.match(resolved!.rateHeadline, /^Orientační sazba od 4,89 % p\. a\.$/);
    assert.equal(resolved!.monthlyPaymentCzk, 34_692);
    assert.equal(resolved!.disclaimer, BANK_RATE_PAYMENT_DISCLAIMER);
  });

  it("returns null for stale, hidden, or missing rate", () => {
    const staleAt = new Date(
      NOW - PUBLIC_RATE_FRESH_MAX_AGE_MS - 60_000
    ).toISOString();
    assert.equal(
      resolveBankRatePaymentDisplay(
        sampleOffer({ checkedAt: staleAt }),
        ACCEPTANCE,
        NOW
      ),
      null
    );
    assert.equal(
      resolveBankRatePaymentDisplay(
        sampleOffer({
          evidence: { ...sampleOffer().evidence!, sourceUrl: null },
        }),
        ACCEPTANCE,
        NOW
      ),
      null
    );
    assert.equal(resolveBankRatePaymentDisplay(sampleOffer(), null, NOW), null);
  });
});

describe("getMortgageOffers — purchase product payments integration", () => {
  it("6M / 25y at 4,89 % and 5,09 % through public display pipeline", () => {
    const purchase = getMortgageOffers(catalog, {
      purpose: "purchase",
      fixationMonths: 36,
      lenderSlug: "air-bank",
      nowMs: NOW,
    });
    const rate489 = purchase.offers.find((o) => o.nominalInterestRate === 4.89);
    assert.ok(rate489, "expected purchase offer at 4.89 %");
    assert.ok(purchase.offers.every((o) => o.financingPurpose === "purchase"));

    const payment489 = resolveBankRatePaymentDisplay(rate489!, ACCEPTANCE, NOW);
    const payment509 = resolveBankRatePaymentDisplay(
      sampleOffer({ nominalInterestRate: 5.09, rateType: "advertised_from" }),
      ACCEPTANCE,
      NOW
    );

    assert.equal(payment489?.monthlyPaymentCzk, 34_692);
    assert.equal(payment509?.monthlyPaymentCzk, 35_391);
    assert.notEqual(payment489?.monthlyPaymentCzk, payment509?.monthlyPaymentCzk);
  });

  it("refinance Air Bank rate differs from purchase at same nominal band", () => {
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

    const purchase479 = purchase.offers.find((o) => o.nominalInterestRate === 4.79);
    const refinance469 = refinance.offers.find((o) => o.nominalInterestRate === 4.69);
    assert.ok(purchase479);
    assert.ok(refinance469);

    const purchasePayment = resolveBankRatePaymentDisplay(
      purchase479!,
      ACCEPTANCE,
      NOW
    );
    const refinancePayment = resolveBankRatePaymentDisplay(
      refinance469!,
      ACCEPTANCE,
      NOW
    );

    assert.equal(purchasePayment?.monthlyPaymentCzk, 34_345);
    assert.equal(refinancePayment?.monthlyPaymentCzk, 34_000);
    assert.notEqual(
      purchasePayment?.monthlyPaymentCzk,
      refinancePayment?.monthlyPaymentCzk
    );
  });

  it("stale catalog offer keeps verifying headline and no payment", () => {
    const offer = getMortgageOffers(catalog, {
      purpose: "purchase",
      fixationMonths: 36,
      lenderSlug: "air-bank",
      nowMs: NOW,
    }).offers[0]!;
    const staleDisplay = evaluatePublicRateDisplay(
      offer,
      NOW + PUBLIC_RATE_FRESH_MAX_AGE_MS + 86_400_000
    );
    assert.equal(staleDisplay.showNumeric, false);
    assert.equal(staleDisplay.headline, PUBLIC_RATE_VERIFYING_MESSAGE);
    assert.equal(
      resolveBankRatePaymentDisplay(
        offer,
        ACCEPTANCE,
        NOW + PUBLIC_RATE_FRESH_MAX_AGE_MS + 86_400_000
      ),
      null
    );
  });
});
