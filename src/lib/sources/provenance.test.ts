/**
 * Provenance validation — kritická pole nesmí mít falešné VERIFIED.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { REGULATORY_RECORDS } from "@/lib/data/static-regulatory";
import { makeDataRecord } from "@/lib/data/records";
import {
  AUTHORITY_REGISTRY,
  CRITICAL_PROVENANCE_CLAIMS,
  canClaimVerified,
  downgradeUnverifiedStatus,
  looksLikeInternalStorage,
  validateDataRecordProvenance,
  validateExternalProvenance,
} from "@/lib/sources";

describe("provenance validation", () => {
  it("rejects internal paths as public sources", () => {
    assert.equal(
      looksLikeInternalStorage("src/lib/data/static-regulatory.ts"),
      true
    );
    assert.equal(looksLikeInternalStorage("supabase mortgage_rates"), true);
    assert.equal(
      looksLikeInternalStorage(
        "https://www.cnb.cz/cs/financni-stabilita/"
      ),
      false
    );
  });

  it("VERIFIED requires external provenance", () => {
    const issues = validateExternalProvenance(null, {
      requireForVerified: true,
    });
    assert.ok(issues.some((i) => i.code === "verified_without_provenance"));

    assert.equal(
      canClaimVerified({
        source: "ČNB",
        sourceUrl: "https://www.cnb.cz/",
        provenance: null,
      }),
      false
    );
  });

  it("downgrades VERIFIED without provenance to ESTIMATE/UNVERIFIED", () => {
    assert.equal(
      downgradeUnverifiedStatus("VERIFIED", {
        source: "Editorial přehled",
        provenance: null,
      }),
      "ESTIMATE"
    );
    assert.equal(
      downgradeUnverifiedStatus("VERIFIED", {
        source: "src/lib/data/static-regulatory.ts",
        provenance: null,
      }),
      "UNVERIFIED"
    );
  });

  it("internal file alone cannot justify VERIFIED even with storage ref", () => {
    assert.equal(
      canClaimVerified({
        source: "Interní konstanta",
        internalStorageRef: "src/lib/data/static-regulatory.ts",
        provenance: {
          title: "fake",
          organization: "HypotékaJasně",
          url: null,
          reference: null,
          jurisdiction: "cz",
          publishedOrEffectiveAt: null,
          lastCheckedAt: "2026-07-20",
          reviewedBy: null,
          reviewMethod: null,
        },
      }),
      false
    );
  });

  it("all VERIFIED REGULATORY_RECORDS pass provenance validation", () => {
    for (const [key, record] of Object.entries(REGULATORY_RECORDS)) {
      if (record.status !== "VERIFIED") continue;
      const issues = validateDataRecordProvenance(record);
      assert.equal(
        issues.length,
        0,
        `${key}: ${issues.map((i) => i.message).join("; ")}`
      );
      assert.ok(record.provenance, `${key} missing provenance`);
      assert.ok(
        record.provenance!.url?.startsWith("https://"),
        `${key} needs https URL`
      );
      assert.ok(
        record.internalStorageRef,
        `${key} should keep internal audit ref`
      );
      assert.notEqual(
        record.source,
        record.internalStorageRef,
        `${key}: public source must not equal internal path`
      );
    }
  });

  it("MODEL DSTI thresholds are not VERIFIED", () => {
    assert.equal(REGULATORY_RECORDS.dstiWarning.status, "MODEL");
    assert.equal(REGULATORY_RECORDS.dstiDanger.status, "MODEL");
  });

  it("authority registry entries have https URLs and kinds", () => {
    assert.ok(AUTHORITY_REGISTRY.length >= 8);
    for (const a of AUTHORITY_REGISTRY) {
      assert.ok(a.url.startsWith("https://"), a.id);
      assert.ok(a.organization.trim(), a.id);
      assert.ok(a.topics.length > 0, a.id);
      assert.ok(a.lastCheckedAt, a.id);
    }
  });

  it("critical claims with VERIFIED have authority links", () => {
    for (const claim of CRITICAL_PROVENANCE_CLAIMS) {
      if (claim.status !== "VERIFIED") continue;
      assert.ok(claim.authorityIds.length > 0, claim.id);
      const issues = validateExternalProvenance(claim.provenance, {
        requireForVerified: true,
      });
      assert.equal(
        issues.length,
        0,
        `${claim.id}: ${issues.map((i) => i.message).join("; ")}`
      );
      if (claim.internalStorageRef) {
        assert.ok(
          looksLikeInternalStorage(claim.internalStorageRef) ||
            claim.internalStorageRef.includes("src/"),
          "audit ref should be internal"
        );
      }
    }
  });

  it("fabricated VERIFIED record fails validation", () => {
    const fake = makeDataRecord({
      id: "fake.verified",
      value: 80,
      unit: "ltv_percent",
      country: "cz",
      source: "src/lib/data/static-regulatory.ts",
      sourceType: "editorial",
      status: "VERIFIED",
      confidence: 0.9,
    });
    const issues = validateDataRecordProvenance(fake);
    assert.ok(issues.length > 0);
  });
});
