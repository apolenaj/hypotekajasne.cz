import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getPublishedCatalogOffers } from "@/lib/mortgage-market/published-catalog-offers";
import {
  getCz20260809Catalog,
  getPartnerOfferCatalog,
} from "@/lib/mortgage-market/catalog-from-manifest";
import { getMortgageOffers } from "@/lib/mortgage-market/offers";
import {
  compareRatesNullable,
  PARTNER_OFFER_BANK_SLUGS,
  isPartnerOfferBankSlug,
  isPartnerOfferPublicRate,
  normalizePartnerLenderSlug,
} from "@/lib/mortgage-market/partner-offer-banks";
import { sanitizeLeadAttribution } from "@/lib/leads-attribution";

describe("getPublishedCatalogOffers (partner offer SoT)", () => {
  it("exposes only the seven partner-offer banks", () => {
    const result = getPublishedCatalogOffers({
      purpose: "purchase",
      fixationMonths: 36,
      ltv: 75,
      includeLtvUnspecified: true,
    });
    const slugs = new Set([
      ...result.offers.map((o) => o.lenderSlug),
      ...result.unspecifiedLtvOffers.map((o) => o.lenderSlug),
      ...result.lenderAvailability.map((a) => a.lenderSlug),
    ]);
    for (const slug of slugs) {
      assert.ok(isPartnerOfferBankSlug(slug), `unexpected lender ${slug}`);
    }
    assert.ok(!slugs.has("air-bank"));
    assert.ok(!slugs.has("moneta"));
  });

  it("keeps all seven partner lenders in the catalog even without rates", () => {
    const catalog = getPartnerOfferCatalog();
    const slugs = new Set(catalog.lenders.map((l) => l.slug));
    for (const required of PARTNER_OFFER_BANK_SLUGS) {
      assert.ok(slugs.has(required), `missing lender ${required}`);
    }
    assert.equal(slugs.size, 7);
    assert.equal(
      catalog.rates.filter((r) => {
        const product = catalog.products.find((p) => p.id === r.productId);
        const lender = catalog.lenders.find((l) => l.id === product?.lenderId);
        return lender?.slug === "ceska-sporitelna";
      }).length,
      0,
      "partner catalog must not publish ČS rate rows"
    );
  });

  it("includes mBank numeric rates from official sheet", () => {
    const result = getPublishedCatalogOffers({
      purpose: "purchase",
      fixationMonths: 36,
      ltv: 75,
      includeLtvUnspecified: true,
    });
    const mbank = result.offers.filter((o) => o.lenderSlug === "mbank");
    assert.ok(mbank.length >= 1);
    assert.equal(mbank[0]!.nominalInterestRate, 5.59);
    assert.match(mbank[0]!.checkedAt, /^2026-09-28/);
  });

  it("keeps Oberbank without inventing a rate", () => {
    const result = getPublishedCatalogOffers({
      purpose: "purchase",
      fixationMonths: 36,
      ltv: 75,
      includeLtvUnspecified: true,
    });
    assert.ok(
      !result.offers.some((o) => o.lenderSlug === "oberbank"),
      "Oberbank must not publish invented numeric rates"
    );
    assert.ok(
      result.lenderAvailability.some((a) => a.lenderSlug === "oberbank")
    );
  });

  it("does not reintroduce Air Bank / MONETA from historical catalog", () => {
    const result = getPublishedCatalogOffers({
      purpose: "purchase",
      fixationMonths: 36,
      ltv: 75,
      includeLtvUnspecified: true,
    });
    assert.equal(
      result.offers.filter((o) => o.lenderSlug === "air-bank").length,
      0
    );
    assert.equal(
      result.offers.filter((o) => o.lenderSlug === "moneta").length,
      0
    );
    // Historical catalog still has them for audit
    const historical = getMortgageOffers(getCz20260809Catalog(), {
      purpose: "purchase",
      fixationMonths: 36,
      ltv: 75,
      includeLtvUnspecified: true,
      nowMs: Date.parse("2026-09-21T12:00:00.000Z"),
    });
    assert.ok(historical.offers.some((o) => o.lenderSlug === "air-bank"));
  });
});

describe("ČS public rate policy", () => {
  it("marks ČS oznámení / campaign rows as not currently publishable", () => {
    assert.equal(
      isPartnerOfferPublicRate({
        lenderSlug: "ceska-sporitelna",
        pricingScenarioKey: "oznameni_account_ppi_budoucnost",
      }),
      false
    );
    assert.equal(
      isPartnerOfferPublicRate({
        lenderSlug: "unicredit",
        pricingScenarioKey: "advertised_with_ppi_and_active_account_ltv_le_80",
      }),
      true
    );
  });

  it("excludes ČS historical matrix from partner-offer ranked rates", () => {
    const result = getPublishedCatalogOffers({
      purpose: "purchase",
      fixationMonths: 36,
      ltv: 75,
      includeLtvUnspecified: true,
    });
    assert.equal(
      result.offers.filter((o) => o.lenderSlug === "ceska-sporitelna").length,
      0
    );
    assert.equal(
      result.unspecifiedLtvOffers.filter(
        (o) => o.lenderSlug === "ceska-sporitelna"
      ).length,
      0
    );
    // Historical audit catalog still retains the August matrix (unspecified LTV)
    const historical = getMortgageOffers(getCz20260809Catalog(), {
      purpose: "purchase",
      fixationMonths: 36,
      ltv: 75,
      includeLtvUnspecified: true,
      nowMs: Date.parse("2026-09-21T12:00:00.000Z"),
    });
    assert.ok(
      historical.unspecifiedLtvOffers.some(
        (o) =>
          o.lenderSlug === "ceska-sporitelna" && o.nominalInterestRate === 5.09
      ),
      "historical ČS 5.09 matrix must remain in audit catalog"
    );
  });
});

describe("compareRatesNullable", () => {
  it("sorts missing rates after numeric ones", () => {
    const rates = [null, 5.1, undefined, 4.9, 0, Number.NaN];
    const sorted = [...rates].sort(compareRatesNullable);
    assert.deepEqual(sorted.slice(0, 2), [4.9, 5.1]);
  });
});

describe("partner lender lead metadata", () => {
  it("normalizes mBank and Oberbank slugs", () => {
    assert.equal(normalizePartnerLenderSlug("mbank"), "mbank");
    assert.equal(normalizePartnerLenderSlug("Oberbank"), "oberbank");
    assert.equal(normalizePartnerLenderSlug("unicredit-bank"), "unicredit");
  });

  it("rejects Air Bank / MONETA in sanitizeLeadAttribution", () => {
    const air = sanitizeLeadAttribution({
      selectedLender: "airbank",
      purpose: "purchase",
    });
    assert.equal(air.metadata.selectedLender, undefined);
    assert.equal(air.metadata.lenderSlug, undefined);

    const moneta = sanitizeLeadAttribution({
      lenderSlug: "moneta",
      purpose: "purchase",
    });
    assert.equal(moneta.metadata.lenderSlug, undefined);

    const mbank = sanitizeLeadAttribution({
      selectedLender: "mbank",
      purpose: "purchase",
      test_marker: "TEST-HJ-unit",
    });
    assert.equal(mbank.metadata.selectedLender, "mbank");
    assert.equal(mbank.metadata.lenderSlug, "mbank");
    assert.equal(mbank.metadata.selectedLenderName, "mBank");

    const oberbank = sanitizeLeadAttribution({
      selectedLender: "oberbank",
      purpose: "purchase",
    });
    assert.equal(oberbank.metadata.selectedLender, "oberbank");
    assert.equal(oberbank.metadata.lenderSlug, "oberbank");
    assert.equal(oberbank.metadata.selectedLenderName, "Oberbank");
  });

  it("preserves client current-bank fields while filtering partner selection", () => {
    const out = sanitizeLeadAttribution({
      selectedLender: "air-bank",
      currentBank: "Air Bank",
      purpose: "refinance",
    });
    assert.equal(out.metadata.selectedLender, undefined);
    assert.equal(out.metadata.currentBank, "Air Bank");
  });
});
