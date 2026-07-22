/**
 * PROMPT 20 — Release regression gate.
 * Focused invariants for math, regulation, trust data, rates, partners, legal.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculateAnnuityPayment } from "@/lib/finance-math";
import { evaluateMortgageRegulation } from "@/lib/mortgage-regulation";
import { missingDataLabel } from "@/lib/data/display";
import {
  canUseStrongPartnerTrustClaims,
  getPartnerClaimLabels,
  toPartnerVerification,
} from "@/lib/partners/verification";
import { FRESHNESS_THRESHOLD_MS } from "@/lib/data/freshness";
import { resolveMortgageRate } from "@/lib/rates/resolve-engine";
import {
  MODEL_FALLBACK_RATE_PERCENT,
  MODEL_FALLBACK_SOURCE_ID,
} from "@/lib/rates/model-fallback";
import { collectLegalProductionIssues } from "@/lib/legal/production-guard";
import { mustEnforceLegalIdentityForLeadCollection } from "@/config/legal";

const NOW = Date.parse("2026-07-20T12:00:00.000Z");

describe("regression gate — annuity calculation", () => {
  it("golden annuity payment stays stable (4M / 5% / 30y)", () => {
    const payment = calculateAnnuityPayment(4_000_000, 5, 30);
    assert.ok(
      Math.abs(payment - 21_472.864920485594) < 0.02,
      `unexpected payment ${payment}`
    );
  });

  it("zero rate falls back to linear division", () => {
    const payment = calculateAnnuityPayment(1_200_000, 0, 20);
    assert.equal(payment, 5_000);
  });
});

describe("regression gate — LTV rule engine", () => {
  it("young owner-occupied cap remains 90% LTV", () => {
    const r = evaluateMortgageRegulation({
      country: "cz",
      applicantType: "individual",
      purpose: "owner_occupied",
      age: 30,
      numberOfOwnedResidentialProperties: 0,
      investmentPurpose: false,
      effectiveDate: "2026-07-21",
    });
    assert.equal(r.maxLtv, 90);
    assert.equal(r.youngLtvApplied, true);
  });

  it("third residential purchase maps to investment bucket (70% cap post-2026)", () => {
    const r = evaluateMortgageRegulation({
      country: "cz",
      applicantType: "individual",
      purpose: "owner_occupied",
      age: 40,
      numberOfOwnedResidentialProperties: 2,
      investmentPurpose: false,
      effectiveDate: "2026-07-21",
    });
    assert.equal(r.appliedBucket, "investment");
    assert.equal(r.maxLtv, 70);
  });
});

describe("regression gate — partner verification claims", () => {
  it("UNVERIFIED partner never gets strong trust labels", () => {
    const v = toPartnerVerification({
      id: "test",
      legalName: null,
      ico: null,
      role: "role",
      licenceSummary: "summary",
      jerrsVerificationUrl: null,
      jerrsStatus: "UNPUBLISHED",
      scope: "scope",
      compensationDisclosure: "disc",
    });
    assert.equal(canUseStrongPartnerTrustClaims(v), false);
    const labels = getPartnerClaimLabels(v);
    const blob = Object.values(labels).join(" ").toLowerCase();
    assert.ok(!blob.includes("prověřen"));
    assert.ok(!blob.includes("ověřenými experty"));
  });
});

describe("regression gate — data status fallback", () => {
  it("missing values never invent numbers — STALE vs default label", () => {
    assert.equal(missingDataLabel("STALE"), "Data ověřujeme");
    assert.equal(missingDataLabel("UNVERIFIED"), "Data ověřujeme");
    assert.equal(missingDataLabel(null), "Na vyžádání");
    assert.equal(missingDataLabel("LIVE"), "Na vyžádání");
  });
});

describe("regression gate — stale/live rate behavior", () => {
  it("fresh verified rate resolves LIVE", () => {
    const resolved = resolveMortgageRate({
      rateWithInsurance: 5.49,
      rateWithoutInsurance: 5.79,
      updatedAt: new Date(NOW - 2 * 60 * 60 * 1000).toISOString(),
      hasInsurance: true,
      nowMs: NOW,
    });
    assert.equal(resolved.layer, "LIVE");
    assert.equal(resolved.recordStatus, "LIVE");
  });

  it("stale LIVE degrades to STALE; empty API uses MODEL fallback", () => {
    const ageH = FRESHNESS_THRESHOLD_MS.LIVE / (60 * 60 * 1000) + 1;
    const staleAt = new Date(NOW - ageH * 60 * 60 * 1000).toISOString();
    const stale = resolveMortgageRate({
      rateWithInsurance: 5.49,
      rateWithoutInsurance: 5.79,
      updatedAt: staleAt,
      hasInsurance: true,
      nowMs: NOW,
    });
    assert.equal(stale.layer, "STALE");
    assert.equal(stale.recordStatus, "STALE");

    const model = resolveMortgageRate({
      rateWithInsurance: null,
      rateWithoutInsurance: null,
      updatedAt: null,
      hasInsurance: true,
      nowMs: NOW,
    });
    assert.equal(model.layer, "MODEL_FALLBACK");
    assert.equal(model.recordStatus, "MODEL");
    assert.equal(model.ratePercent, MODEL_FALLBACK_RATE_PERCENT);
    assert.equal(model.isModelFallback, true);
  });
});

describe("regression gate — legal production gate", () => {
  it("soft mode allows incomplete identity with warnings", () => {
    const issues = collectLegalProductionIssues({
      requireOperatorIdentity: false,
      requireIdentityForLeads: false,
      requirePartnerHandoff: false,
    });
    const codes = issues.map((i) => i.code);
    assert.ok(codes.includes("OPERATOR_IDENTITY_SOFT"));
    assert.ok(!issues.some((i) => i.severity === "error"));
  });

  it("production lead gate fails when identity incomplete (simulated Vercel prod)", () => {
    const leadGate = mustEnforceLegalIdentityForLeadCollection();
    if (!leadGate) {
      // Local dev — gate not enforced; still assert strict path works when forced.
      const strict = collectLegalProductionIssues({
        requireOperatorIdentity: true,
        requireIdentityForLeads: true,
      });
      assert.ok(
        strict.some((i) => i.severity === "error"),
        "expected error when operator identity forced incomplete"
      );
      return;
    }
    const issues = collectLegalProductionIssues({
      requireOperatorIdentity: true,
      requireIdentityForLeads: true,
    });
    assert.ok(issues.some((i) => i.severity === "error"));
  });
});
