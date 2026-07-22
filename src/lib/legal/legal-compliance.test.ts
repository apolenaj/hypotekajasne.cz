/**
 * Legal / partner production compliance tests (PROMPT 17E).
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  requiresPartnerTransfer,
  isPartnerHandoffLeadSource,
  validateFormConsent,
} from "@/lib/consent/records";
import {
  CONSENT_POLICY_VERSION,
  buildConsentContextSummary,
  buildPartnerTransferCheckboxLabel,
  buildPrivacyProcessingCheckboxLabel,
} from "@/lib/legal/consent-versions";
import {
  getMortgagePartners,
  isMortgagePartnerHandoffReady,
  partnerPublicDisplayName,
} from "@/lib/legal/partner-config";
import {
  PUBLIC_STAGING_PHRASES,
  collectLegalProductionIssues,
  assertNoPartnerPlaceholdersInLiveFields,
} from "@/lib/legal/production-guard";

const ROOT = join(process.cwd(), "src");

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (name === "node_modules" || name === ".next") continue;
      walk(p, out);
    } else if (/\.(ts|tsx)$/.test(name)) {
      out.push(p);
    }
  }
  return out;
}

function publicSurfaces(): string[] {
  return walk(ROOT).filter((f) => {
    if (f.includes(".test.ts")) return false;
    if (f.includes("production-guard")) return false;
    if (f.includes(`${join("app", "api")}`)) return false;
    if (f.includes(`${join("components")}`)) return true;
    if (f.includes(`${join("app")}`) && f.endsWith("page.tsx")) return true;
    if (f.includes(`${join("lib", "faq")}`)) return true;
    if (f.includes(`${join("lib", "seo", "pages.ts")}`)) return true;
    return false;
  });
}

describe("partner / legal SoT", () => {
  it("does not invent partner identity without env", () => {
    const p = getMortgagePartners()[0]!;
    assert.equal(p.legalName, null);
    assert.equal(p.ico, null);
    assert.equal(p.jerrsVerificationUrl, null);
    assert.equal(p.jerrsStatus, "UNPUBLISHED");
    assert.equal(isMortgagePartnerHandoffReady(), false);
    assert.match(partnerPublicDisplayName(p), /nezveřejněna/i);
  });

  it("consent copy names controller, non-bank, non-binding purpose", () => {
    const privacy = buildPrivacyProcessingCheckboxLabel();
    assert.match(privacy, /správce/i);
    assert.match(privacy, /Hypotéka Jasně není banka/i);
    assert.match(privacy, /nezávazné/i);

    const summary = buildConsentContextSummary();
    assert.match(summary, /Správce/);
    assert.match(summary, /není banka/);
    assert.match(summary, /provozovatel webu|ověřenému partnerovi/i);

    const label = buildPartnerTransferCheckboxLabel("mortgage_specialist");
    assert.ok(!label.includes("viz /partneri"));
    assert.match(label, /nezávazn/i);
    assert.ok(!/licencovan/i.test(label));
  });

  it("bumped consent policy version", () => {
    assert.equal(CONSENT_POLICY_VERSION, "2026-07-21.1");
  });
});

describe("partner handoff gating", () => {
  it("lead sources still show handoff intent UI flag", () => {
    assert.equal(isPartnerHandoffLeadSource("lead_gen"), true);
    assert.equal(isPartnerHandoffLeadSource("contact"), false);
  });

  it("does not require mortgage partner transfer when identity unpublished", () => {
    assert.equal(requiresPartnerTransfer("lead_gen"), false);
    assert.equal(requiresPartnerTransfer("navrh_na_miru"), false);
  });

  it("accepts privacy-only consent for mortgage lead when handoff offline", () => {
    const r = validateFormConsent("lead_gen", {
      policyVersion: CONSENT_POLICY_VERSION,
      privacyAccepted: true,
      partnerTransferAccepted: false,
      partnerTransferScope: "none",
      marketingAccepted: false,
      consentedAt: new Date().toISOString(),
    });
    assert.equal(r.ok, true);
  });
});

describe("production guard", () => {
  it("LIVE fields reject placeholders", () => {
    assert.doesNotThrow(() =>
      assertNoPartnerPlaceholdersInLiveFields(getMortgagePartners())
    );
  });

  it("soft-warns when handoff / operator incomplete (default)", () => {
    const issues = collectLegalProductionIssues({
      requirePartnerHandoff: false,
      requireOperatorIdentity: false,
      requireIdentityForLeads: false,
    });
    assert.ok(issues.some((i) => i.code === "PARTNER_HANDOFF_SOFT"));
    assert.ok(issues.some((i) => i.code === "OPERATOR_IDENTITY_SOFT"));
    assert.ok(issues.some((i) => i.code === "LEGAL_TEXT_NOT_REVIEWED"));
    assert.ok(issues.every((i) => i.severity === "warn"));
  });

  it("errors when identity required for lead collection", () => {
    const issues = collectLegalProductionIssues({
      requirePartnerHandoff: false,
      requireOperatorIdentity: true,
      requireIdentityForLeads: true,
    });
    assert.ok(
      issues.some(
        (i) =>
          i.code === "OPERATOR_IDENTITY_REQUIRED_FOR_LEADS" ||
          i.code === "OPERATOR_IDENTITY_MISSING"
      )
    );
    assert.ok(issues.some((i) => i.severity === "error"));
  });

  it("strict mode errors when partner handoff required", () => {
    const issues = collectLegalProductionIssues({
      requirePartnerHandoff: true,
      requireOperatorIdentity: false,
      requireIdentityForLeads: false,
    });
    assert.ok(issues.some((i) => i.code === "PARTNER_HANDOFF_NOT_READY"));
  });
});

describe("central legal config", () => {
  it("isLegalIdentityComplete is false without inventing data", async () => {
    const { isLegalIdentityComplete, getLegalIdentityConfig } = await import(
      "@/config/legal"
    );
    const cfg = getLegalIdentityConfig();
    assert.equal(cfg.legalName, null);
    assert.equal(cfg.companyId, null);
    assert.equal(isLegalIdentityComplete(cfg), false);
  });

  it("isLegalTextReviewed requires reviewer and date", async () => {
    const { isLegalTextReviewed, getLegalIdentityConfig } = await import(
      "@/config/legal"
    );
    assert.equal(isLegalTextReviewed(getLegalIdentityConfig()), false);
  });
});

describe("public UI forbids staging legal phrases", () => {
  it("no doplníme / TODO legal / Legal review required in public surfaces", () => {
    for (const f of publicSurfaces()) {
      const text = readFileSync(f, "utf8");
      for (const phrase of PUBLIC_STAGING_PHRASES) {
        assert.ok(
          !text.includes(phrase),
          `Staging phrase "${phrase}" found in ${f}`
        );
      }
    }
  });
});

describe("public UI forbids unverified partner trust claims", () => {
  const FORBIDDEN = [
    "prověřenými experty",
    "prověření experti",
    "ověřenými experty",
    "ověřený poradce",
    "náš specialista",
    "ověřeno ČNB",
    "Licencovaný hypoteční specialista — identifikace",
  ];

  it("no over-strong partner claims when identity unpublished", () => {
    assert.equal(isMortgagePartnerHandoffReady(), false);
    for (const f of publicSurfaces()) {
      const text = readFileSync(f, "utf8");
      for (const phrase of FORBIDDEN) {
        assert.ok(
          !text.includes(phrase),
          `Forbidden partner claim "${phrase}" found in ${f}`
        );
      }
    }
  });
});
