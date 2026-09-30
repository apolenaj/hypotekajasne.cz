import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  PARTNER_BANK_LOGO_BY_SLUG,
  getPartnerBankLogoAsset,
  resolvePartnerBankLogoSlug,
} from "@/lib/mortgage-market/bank-logos";
import { PARTNER_OFFER_BANK_SLUGS } from "@/lib/mortgage-market/partner-offer-banks";

describe("partner bank logos", () => {
  it("maps every partner-offer bank to a local SVG asset file", () => {
    for (const slug of PARTNER_OFFER_BANK_SLUGS) {
      const asset = PARTNER_BANK_LOGO_BY_SLUG[slug];
      assert.ok(asset, slug);
      assert.match(asset.src, /^\/images\/banks\/.+\.svg$/);
      const abs = join(process.cwd(), "public", asset.src.replace(/^\//, ""));
      assert.equal(existsSync(abs), true, abs);
    }
  });

  it("resolves known display names to slugs", () => {
    assert.equal(resolvePartnerBankLogoSlug("ČSOB"), "csob");
    assert.equal(resolvePartnerBankLogoSlug("mBank"), "mbank");
    assert.equal(resolvePartnerBankLogoSlug("Oberbank"), "oberbank");
    assert.ok(getPartnerBankLogoAsset("Komerční banka"));
  });
});
