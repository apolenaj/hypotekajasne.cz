/**
 * Partner verification claim tests — PROMPT 2.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assertNoUnauthorizedStrongClaims,
  canUseStrongPartnerTrustClaims,
  getPartnerClaimLabels,
  STRONG_PARTNER_CLAIM_PATTERNS,
  toPartnerVerification,
  type PartnerVerification,
} from "@/lib/partners/verification";
import type { MortgagePartner } from "@/lib/legal/partner-config";

function basePartner(
  overrides: Partial<MortgagePartner> = {}
): MortgagePartner {
  return {
    id: "primary-mortgage-partner",
    legalName: null,
    ico: null,
    role: "role",
    licenceSummary: "summary",
    jerrsVerificationUrl: null,
    jerrsStatus: "UNPUBLISHED",
    scope: "scope",
    compensationDisclosure: "disc",
    ...overrides,
  };
}

describe("PartnerVerification mapping", () => {
  it("maps unpublished partner to UNVERIFIED without inventing name", () => {
    const v = toPartnerVerification(basePartner());
    assert.equal(v.verificationStatus, "UNVERIFIED");
    assert.equal(v.name, null);
    assert.equal(v.registrationNumber, null);
    assert.equal(v.registryUrl, null);
    assert.equal(canUseStrongPartnerTrustClaims(v), false);
  });

  it("maps LIVE identity to VERIFIED with public fields", () => {
    const v = toPartnerVerification(
      basePartner({
        legalName: "Example Partner s.r.o.",
        ico: "12345678",
        jerrsVerificationUrl: "https://www.cnb.cz/example",
        jerrsStatus: "LIVE",
      })
    );
    assert.equal(v.verificationStatus, "VERIFIED");
    assert.equal(v.name, "Example Partner s.r.o.");
    assert.equal(v.registrationNumber, "12345678");
    assert.equal(v.registryUrl, "https://www.cnb.cz/example");
    assert.equal(canUseStrongPartnerTrustClaims(v), true);
  });

  it("maps COMING_SOON to PENDING", () => {
    const v = toPartnerVerification(
      basePartner({ jerrsStatus: "COMING_SOON" })
    );
    assert.equal(v.verificationStatus, "PENDING");
    assert.equal(canUseStrongPartnerTrustClaims(v), false);
  });
});

describe("claim labels strength", () => {
  it("UNVERIFIED labels never say prověřený / ověřenými experty", () => {
    const labels = getPartnerClaimLabels({
      name: null,
      legalEntity: null,
      registrationNumber: null,
      regulator: null,
      registryUrl: null,
      verifiedAt: null,
      verificationStatus: "UNVERIFIED",
    });
    const blob = Object.values(labels).join(" ");
    for (const re of STRONG_PARTNER_CLAIM_PATTERNS) {
      assert.ok(!re.test(blob), `matched ${re}`);
    }
    assert.match(labels.leadIntakeDisclosure, /provozovatel webu/i);
    assert.ok(!/licencovan/i.test(labels.badgeLabel));
  });

  it("PENDING uses ověření probíhá, not Ověřený partner", () => {
    const labels = getPartnerClaimLabels({
      name: null,
      legalEntity: null,
      registrationNumber: null,
      regulator: null,
      registryUrl: null,
      verifiedAt: null,
      verificationStatus: "PENDING",
    });
    assert.match(labels.badgeLabel, /probíhá/i);
    assert.ok(!/^Ověřený partner$/i.test(labels.badgeLabel));
  });

  it("VERIFIED may use Ověřený partner", () => {
    const v: PartnerVerification = {
      name: "Partner A",
      legalEntity: "Partner A",
      registrationNumber: "111",
      regulator: "ČNB",
      registryUrl: "https://example.com/reg",
      verifiedAt: "2026-07-01",
      verificationStatus: "VERIFIED",
    };
    const labels = getPartnerClaimLabels(v);
    assert.equal(labels.badgeLabel, "Ověřený partner");
    assert.match(labels.leadIntakeDisclosure, /Partner A/);
  });

  it("assertNoUnauthorizedStrongClaims throws on banned phrases", () => {
    assert.throws(() =>
      assertNoUnauthorizedStrongClaims(
        "propojujeme vás s prověřenými experty",
        "UNVERIFIED"
      )
    );
    assert.doesNotThrow(() =>
      assertNoUnauthorizedStrongClaims(
        "propojujeme vás s prověřenými experty",
        "VERIFIED"
      )
    );
  });
});
