/**
 * Integration: calculator → /sazby URL → refresh/back → bank selection → lead metadata.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildSazbyHref, computeMiniMortgage } from "@/lib/mini-mortgage-calculator";
import {
  buildLeadMetadataFromJourney,
  buildMortgageJourneyHref,
  journeyCoreEqual,
  parseMortgageJourneyParams,
  serializeMortgageJourneyParams,
} from "@/lib/mortgage-rates/mortgage-journey-context";
import { buildLtvContext } from "@/lib/mortgage-rates/ltv-context";

describe("mortgage journey context — calculator to sazby", () => {
  it("carries all calculator inputs including term, equity, model rate", () => {
    const result = computeMiniMortgage({
      propertyPriceCzk: 5_000_000,
      ownFundsCzk: 1_250_000,
      termYears: 25,
      purpose: "refinance",
      fixationMonths: 36,
      annualRatePercent: 4.89,
    });

    const href = buildSazbyHref(result, {
      preserveMarketingFrom: {
        utm_source: "google",
        utm_medium: "cpc",
        utm_campaign: "spring_2026",
        gclid: "test-click-id",
      },
    });
    const url = new URL(href, "https://example.test");
    const parsed = parseMortgageJourneyParams(
      Object.fromEntries(url.searchParams.entries())
    );

    assert.equal(parsed.context.purpose, "refinance");
    assert.equal(parsed.context.fixationMonths, 36);
    assert.equal(parsed.context.propertyValueCzk, 5_000_000);
    assert.equal(parsed.context.ownFundsCzk, 1_250_000);
    assert.equal(parsed.context.loanAmountCzk, 3_750_000);
    assert.equal(parsed.context.termYears, 25);
    assert.equal(parsed.context.modelRatePercent, 4.89);
    assert.equal(parsed.context.utm_source, "google");
    assert.equal(parsed.context.utm_medium, "cpc");
    assert.equal(parsed.context.utm_campaign, "spring_2026");
    assert.equal(parsed.context.gclid, "test-click-id");
    assert.equal(parsed.ltvContext.exactLtv, 75);
    assert.equal(parsed.ltvContext.ltvBand, 80);
    assert.equal(parsed.paramErrors.length, 0);
  });

  it("refresh and back navigation preserve the same core context", () => {
    const result = computeMiniMortgage({
      propertyPriceCzk: 7_000_000,
      ownFundsCzk: 1_000_000,
      termYears: 30,
      purpose: "purchase",
      fixationMonths: 60,
    });

    const href = buildSazbyHref(result);
    const first = parseMortgageJourneyParams(
      Object.fromEntries(new URL(href, "https://example.test").searchParams.entries())
    );
    const serialized = serializeMortgageJourneyParams(first.context);
    const afterRefresh = parseMortgageJourneyParams(
      Object.fromEntries(serialized.entries())
    );

    assert.ok(journeyCoreEqual(first.context, afterRefresh.context));
    assert.equal(afterRefresh.ltvContext.exactLtv, first.ltvContext.exactLtv);
    assert.equal(afterRefresh.ltvContext.ltvBand, first.ltvContext.ltvBand);

    const backForward = parseMortgageJourneyParams(
      Object.fromEntries(serialized.entries())
    );
    assert.deepEqual(backForward.context, afterRefresh.context);
  });

  it("legacy ltv= URL remains backward compatible", () => {
    const parsed = parseMortgageJourneyParams({
      ltv: "85.7",
      purpose: "purchase",
      fixationMonths: "36",
    });
    assert.equal(parsed.fromLegacyLtv, true);
    assert.equal(parsed.ltvContext.exactLtv, 85.7);
    assert.equal(parsed.ltvContext.ltvBand, 90);

    const modern = serializeMortgageJourneyParams(parsed.context);
    assert.ok(modern.get("property"));
    assert.ok(modern.get("loan"));
    assert.equal(modern.get("ltv"), null);
  });

  it("rejects invalid params with user-visible errors instead of silent defaults", () => {
    const parsed = parseMortgageJourneyParams({
      property: "not-a-number",
      loan: "4800000",
      fixationMonths: "999",
    });
    assert.ok(parsed.paramErrors.length > 0);
    assert.equal(parsed.fromDefaults, false);
  });

  it("blocks PII params in URL", () => {
    const parsed = parseMortgageJourneyParams({
      property: "6000000",
      loan: "4800000",
      email: "user@example.com",
    });
    assert.ok(
      parsed.paramErrors.some((e) => e.includes("Osobní údaje")),
      parsed.paramErrors.join("; ")
    );
  });

  it("detects inconsistent equity / loan / property", () => {
    const parsed = parseMortgageJourneyParams({
      property: "6000000",
      loan: "4800000",
      equity: "500000",
    });
    assert.ok(
      parsed.paramErrors.some((e) => e.includes("odporují")),
      parsed.paramErrors.join("; ")
    );
  });
});

describe("mortgage journey context — bank selection to lead", () => {
  it("buildLeadMetadataFromJourney includes full funnel context", () => {
    const result = computeMiniMortgage({
      propertyPriceCzk: 6_000_000,
      ownFundsCzk: 1_200_000,
      termYears: 30,
      purpose: "purchase",
      fixationMonths: 36,
    });
    const ltvContext = buildLtvContext({
      propertyValueCzk: result.propertyPriceCzk,
      loanAmountCzk: result.loanAmountCzk,
    });

    const metadata = buildLeadMetadataFromJourney(
      {
        purpose: result.purpose,
        fixationMonths: result.fixationMonths,
        propertyValueCzk: result.propertyPriceCzk,
        ownFundsCzk: result.requiredOwnFundsCzk,
        loanAmountCzk: result.loanAmountCzk,
        termYears: result.termYears,
        modelRatePercent: result.annualRatePercent,
        utm_source: "instagram",
        utm_medium: "organic_social",
      },
      ltvContext,
      {
        sourcePage: "/sazby",
        selectedLender: "airbank",
        selectedProduct: "hypoteka",
        selectedPricingScenario: "air_ppi_minus_10bp",
        selectedNominalRate: 4.79,
      }
    );

    assert.equal(metadata.purpose, "purchase");
    assert.equal(metadata.fixationMonths, 36);
    assert.equal(metadata.termYears, 30);
    assert.equal(metadata.propertyValue, 6_000_000);
    assert.equal(metadata.ownFunds, 1_200_000);
    assert.equal(metadata.mortgageAmount, 4_800_000);
    assert.equal(metadata.exactLtv, 80);
    assert.equal(metadata.ltvBand, 80);
    assert.equal(metadata.ltvPct, 80);
    assert.equal(metadata.selectedLender, "airbank");
    assert.equal(metadata.utm_source, "instagram");
    assert.equal((metadata as { email?: string }).email, undefined);
    assert.equal((metadata as { phone?: string }).phone, undefined);
  });

  it("reopened deep link reproduces the same lead context", () => {
    const href = buildMortgageJourneyHref({
      purpose: "refinance",
      fixationMonths: 36,
      propertyValueCzk: 5_000_000,
      ownFundsCzk: 1_000_000,
      loanAmountCzk: 4_000_000,
      termYears: 20,
      utm_campaign: "retarget",
    });
    const parsed = parseMortgageJourneyParams(
      Object.fromEntries(new URL(href, "https://example.test").searchParams.entries())
    );
    const lead = buildLeadMetadataFromJourney(parsed.context, parsed.ltvContext, {
      sourcePage: "/sazby",
      selectedLender: "kb",
    });
    assert.equal(lead.mortgageAmount, 4_000_000);
    assert.equal(lead.termYears, 20);
    assert.equal(lead.utm_campaign, "retarget");
    assert.equal(lead.exactLtv, 80);
  });
});
