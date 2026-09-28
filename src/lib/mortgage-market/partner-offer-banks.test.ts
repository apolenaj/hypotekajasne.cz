import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  PARTNER_OFFER_BANKS,
  PARTNER_OFFER_BANK_SLUGS,
  isPartnerOfferBankSlug,
} from "@/lib/mortgage-market/partner-offer-banks";
import { DOMESTIC_BANKS } from "@/lib/banking";

describe("partner offer banks SoT", () => {
  it("lists exactly seven banks", () => {
    assert.equal(PARTNER_OFFER_BANKS.length, 7);
    assert.equal(PARTNER_OFFER_BANK_SLUGS.length, 7);
    assert.deepEqual(
      [...PARTNER_OFFER_BANK_SLUGS].sort(),
      [
        "ceska-sporitelna",
        "csob",
        "komercni-banka",
        "mbank",
        "oberbank",
        "raiffeisenbank",
        "unicredit",
      ].sort()
    );
  });

  it("includes Oberbank website", () => {
    const oberbank = PARTNER_OFFER_BANKS.find((b) => b.slug === "oberbank");
    assert.ok(oberbank);
    assert.equal(oberbank!.websiteUrl, "https://www.oberbank.cz/");
  });

  it("aligns domestic calculator banks with partner scrape names", () => {
    const names = DOMESTIC_BANKS.map((b) => b.name);
    for (const bank of PARTNER_OFFER_BANKS) {
      assert.ok(
        names.includes(bank.scrapeName),
        `DOMESTIC_BANKS missing ${bank.scrapeName}`
      );
    }
    assert.equal(DOMESTIC_BANKS.length, 7);
    assert.ok(!names.includes("Air Bank"));
    assert.ok(!names.includes("MONETA Money Bank"));
  });

  it("rejects non-partner slugs", () => {
    assert.equal(isPartnerOfferBankSlug("air-bank"), false);
    assert.equal(isPartnerOfferBankSlug("moneta"), false);
    assert.equal(isPartnerOfferBankSlug("mbank"), true);
  });
});
