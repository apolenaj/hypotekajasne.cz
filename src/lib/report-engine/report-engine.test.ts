import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildReportByType,
  createShareGrant,
  hashPassword,
  REPORT_TYPES,
  renderReportHtml,
  revokeShareGrant,
  sanitizeReportForShare,
  validateShareAccess,
} from "@/lib/report-engine";
import { defaultReportEngineStore } from "@/lib/report-engine/types";

describe("report builders", () => {
  for (const type of REPORT_TYPES) {
    it(`builds ${type} with required sections`, () => {
      const doc = buildReportByType(type, { ratePercent: 4.89 });
      assert.ok(doc.id.startsWith("rpt_"));
      assert.equal(doc.type, type);
      assert.ok(doc.generatedAt);
      assert.ok(doc.version);
      assert.ok(doc.highlights.length >= 1);
      for (const key of [
        "inputs",
        "outputs",
        "assumptions",
        "sources",
        "dataFreshness",
        "methodology",
        "disclaimers",
        "nextSteps",
      ] as const) {
        assert.ok(doc[key].items.length >= 1, key);
      }
      assert.equal(doc.sensitivity, "private");
    });
  }
});

describe("sanitize for public share", () => {
  it("masks income by default", () => {
    const doc = buildReportByType("mortgage_readiness");
    const masked = sanitizeReportForShare(doc, false);
    assert.equal(masked.sensitivity, "shareable_summary");
    const income = masked.inputs.items.find((i) => /příjem/i.test(i.label));
    assert.ok(income);
    assert.match(income!.value, /maskováno|••••/i);
  });

  it("keeps full detail when allowSensitive", () => {
    const doc = buildReportByType("investment_passport");
    const full = sanitizeReportForShare(doc, true);
    assert.equal(full.sensitivity, "private");
    const income = full.inputs.items.find((i) => /příjem/i.test(i.label));
    assert.ok(income?.value.includes("68"));
  });
});

describe("share grants", () => {
  it("expires, password, revoke", () => {
    const doc = buildReportByType("refinance");
    let store = defaultReportEngineStore();
    store = { ...store, reports: { [doc.id]: doc } };

    const { store: withShare, grant } = createShareGrant(store, {
      reportId: doc.id,
      expiresInHours: 24,
      password: "secret",
    });

    assert.ok(grant.token.startsWith("shr_"));
    assert.equal(validateShareAccess(grant, "secret").ok, true);
    assert.equal(validateShareAccess(grant, "wrong").ok, false);

    const expired = {
      ...grant,
      expiresAt: new Date(Date.now() - 1000).toISOString(),
    };
    assert.equal(validateShareAccess(expired).ok, false);

    const revokedStore = revokeShareGrant(withShare, grant.token);
    const revoked = revokedStore.shares[grant.token]!;
    assert.ok(revoked.revokedAt);
    assert.equal(validateShareAccess(revoked).ok, false);
  });

  it("hashPassword is stable", () => {
    assert.equal(hashPassword("x"), hashPassword("x"));
    assert.notEqual(hashPassword("x"), hashPassword("y"));
  });
});

describe("render html", () => {
  it("produces pdf-ready standalone document", () => {
    const doc = buildReportByType("property_comparison");
    const html = renderReportHtml(doc, "pdf");
    assert.ok(html.includes("<!DOCTYPE html>"));
    assert.ok(html.includes(doc.title));
    assert.ok(html.includes("@page"));
    assert.ok(html.includes("Metodika"));
  });
});
