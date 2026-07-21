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
  CONSENT_PURPOSES,
  buildConsentContextSummary,
  buildPartnerTransferCheckboxLabel,
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
    const privacy = CONSENT_PURPOSES.privacy_processing.checkboxLabel;
    assert.match(privacy, /správce/i);
    assert.match(privacy, /Hypotéka Jasně není banka/i);
    assert.match(privacy, /nezávazné/i);

    const summary = buildConsentContextSummary();
    assert.match(summary, /Správce/);
    assert.match(summary, /není banka/);
    assert.match(summary, /není produkčně aktivní|Partneři/);

    const label = buildPartnerTransferCheckboxLabel("mortgage_specialist");
    assert.ok(!label.includes("viz /partneri"));
    assert.match(label, /nezávazné konzultace|specialistovi/i);
  });

  it("bumped consent policy version", () => {
    assert.equal(CONSENT_POLICY_VERSION, "2026-07-20.1");
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
    });
    assert.ok(issues.some((i) => i.code === "PARTNER_HANDOFF_SOFT"));
    assert.ok(issues.some((i) => i.code === "OPERATOR_IDENTITY_SOFT"));
    assert.ok(issues.every((i) => i.severity === "warn"));
  });

  it("strict mode errors when partner handoff required", () => {
    const issues = collectLegalProductionIssues({
      requirePartnerHandoff: true,
      requireOperatorIdentity: false,
    });
    assert.ok(issues.some((i) => i.code === "PARTNER_HANDOFF_NOT_READY"));
  });
});

describe("public UI forbids staging legal phrases", () => {
  it("no doplníme / čeká na ověření in public surfaces", () => {
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
