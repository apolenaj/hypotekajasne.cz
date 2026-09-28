/**
 * Regression tests for lead API validation + idempotency contract (no live submit).
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isValidLeadIdempotencyKey,
  normalizeLeadIdempotencyKey,
} from "@/lib/leads-idempotency";
import { validateFormConsent } from "@/lib/consent/records";
import { CONSENT_POLICY_VERSION } from "@/lib/legal/consent-versions";
import { sanitizeLeadAttribution } from "@/lib/leads-attribution";
import { buildLeadMetadataFromJourney } from "@/lib/mortgage-rates/mortgage-journey-context";
import { buildLtvContext } from "@/lib/mortgage-rates/ltv-context";

const baseConsent = {
  policyVersion: CONSENT_POLICY_VERSION,
  privacyAccepted: true,
  partnerTransferAccepted: false,
  partnerTransferScope: "none" as const,
  marketingAccepted: false,
  consentedAt: new Date().toISOString(),
};

describe("lead funnel E2E regression (safe)", () => {
  it("rejects submit without privacy consent", () => {
    const result = validateFormConsent("mortgage_calculator", {
      ...baseConsent,
      privacyAccepted: false,
    });
    assert.equal(result.ok, false);
  });

  it("allows mortgage_calculator with privacy only (no marketing)", () => {
    const result = validateFormConsent("mortgage_calculator", baseConsent);
    assert.equal(result.ok, true);
    assert.equal(result.consent.marketingAccepted, false);
  });

  it("strips click IDs and PII keys from lead metadata", () => {
    const out = sanitizeLeadAttribution({
      purpose: "purchase",
      exactLtv: 80,
      ltvBand: 80,
      email: "secret@example.com",
      gclid: "abc",
      utm_source: "google",
    });
    assert.equal(out.utm_source, "google");
    assert.equal("gclid" in out.metadata, false);
    assert.equal("email" in out.metadata, false);
  });

  it("buildLeadMetadataFromJourney carries bank + calc context for lead row", () => {
    const ctx = {
      purpose: "purchase" as const,
      fixationMonths: 36,
      propertyValueCzk: 6_000_000,
      ownFundsCzk: 1_200_000,
      loanAmountCzk: 4_800_000,
      termYears: 30,
      utm_source: "e2e_test",
    };
    const ltv = buildLtvContext(ctx);
    const meta = buildLeadMetadataFromJourney(ctx, ltv, {
      selectedLender: "mbank",
      selectedNominalRate: 5.59,
      selectedPricingScenario: "mhypoteka_fixed_ltv_le_80",
      test_marker: "TEST-HJ-E2E-unit",
    });
    assert.equal(meta.selectedLender, "mbank");
    assert.equal(meta.exactLtv, 80);
    assert.equal(meta.ltvBand, 80);
    assert.equal(meta.utm_source, "e2e_test");
  });

  it("carries Oberbank inquiry selection without inventing a rate", () => {
    const ctx = {
      purpose: "purchase" as const,
      fixationMonths: 36,
      propertyValueCzk: 6_000_000,
      ownFundsCzk: 1_200_000,
      loanAmountCzk: 4_800_000,
      termYears: 30,
    };
    const ltv = buildLtvContext(ctx);
    const meta = buildLeadMetadataFromJourney(ctx, ltv, {
      selectedLender: "oberbank",
      lenderSlug: "oberbank",
      rateAvailability: "inquiry_only",
      test_marker: "TEST-HJ-E2E-oberbank",
    });
    assert.equal(meta.selectedLender, "oberbank");
    assert.equal(meta.lenderSlug, "oberbank");
    assert.equal(meta.selectedNominalRate, undefined);
  });

  it("sanitizes all seven partner banks into lead metadata and rejects historical", () => {
    for (const slug of [
      "komercni-banka",
      "csob",
      "ceska-sporitelna",
      "mbank",
      "unicredit",
      "raiffeisenbank",
      "oberbank",
    ] as const) {
      const out = sanitizeLeadAttribution({
        selectedLender: slug,
        purpose: "purchase",
        rateAvailability: "inquiry_only",
        test_marker: `TEST-HJ-E2E-${slug}`,
      });
      assert.equal(out.metadata.selectedLender, slug);
      assert.equal(out.metadata.lenderSlug, slug);
    }

    const rejected = sanitizeLeadAttribution({
      selectedLender: "air-bank",
      lenderSlug: "moneta",
      purpose: "purchase",
    });
    assert.equal(rejected.metadata.selectedLender, undefined);
    assert.equal(rejected.metadata.lenderSlug, undefined);
  });

  it("accepts UUID idempotency keys only", () => {
    const key = "550e8400-e29b-41d4-a716-446655440000";
    assert.equal(isValidLeadIdempotencyKey(key), true);
    assert.equal(normalizeLeadIdempotencyKey("not-a-uuid"), null);
    assert.equal(
      normalizeLeadIdempotencyKey("550e8400-e29b-41d4-a716-446655440000"),
      key
    );
  });

  it("new consent records stamp Hunger killers controller + current policy version", async () => {
    const { buildFormConsentRecord } = await import("@/lib/consent/records");
    const { legalOperator } = await import("@/config/legal");
    const record = buildFormConsentRecord({
      privacyAccepted: true,
      partnerTransferAccepted: false,
      partnerTransferScope: "none",
      marketingAccepted: false,
    });
    assert.equal(record.policyVersion, CONSENT_POLICY_VERSION);
    assert.equal(record.dataControllerName, legalOperator.companyName);
    assert.equal(record.dataControllerIco, legalOperator.ico);
    assert.match(record.dataControllerName ?? "", /Hunger\s*killers/);
    assert.equal(record.dataControllerIco, "19488483");
  });
});
