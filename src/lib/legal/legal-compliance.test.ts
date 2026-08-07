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
  it("does not invent ČNB / JERRS partner handoff without env", () => {
    const p = getMortgagePartners()[0]!;
    assert.equal(p.legalName, null);
    assert.equal(p.ico, null);
    assert.equal(p.jerrsVerificationUrl, null);
    assert.equal(p.jerrsStatus, "UNPUBLISHED");
    assert.equal(isMortgagePartnerHandoffReady(), false);
    assert.match(partnerPublicDisplayName(p), /HEINZKE/i);
  });

  it("consent copy names controller and enquiry purpose without fake handoff", () => {
    const privacy = buildPrivacyProcessingCheckboxLabel();
    assert.match(privacy, /HEINZKE/i);
    assert.match(privacy, /Zásadami ochrany osobních údajů/i);
    assert.match(privacy, /vyřízení vaší poptávky/i);
    assert.ok(!/předání údajů společnosti HEINZKE/i.test(privacy));
    assert.ok(!/předání.*provozovatel/i.test(privacy));

    const summary = buildConsentContextSummary();
    assert.match(summary, /Správce/);
    assert.match(summary, /není banka/);
    assert.match(summary, /HEINZKE|provozovatel|správce/i);
    assert.ok(!/předáme kontakt/i.test(summary));
    assert.ok(!/Předání třetímu partnerovi zatím není aktivní/i.test(summary));

    const label = buildPartnerTransferCheckboxLabel("mortgage_specialist");
    assert.equal(label, "");
    assert.ok(!/předání údajů společnosti HEINZKE/i.test(label));
  });

  it("bumped consent policy version", () => {
    assert.equal(CONSENT_POLICY_VERSION, "2026-08-07.6");
  });

  it("cookie policy version matches material cookie inventory update", async () => {
    const { COOKIE_POLICY_VERSION } = await import("@/lib/legal/consent-versions");
    assert.equal(COOKIE_POLICY_VERSION, "2026-08-07.1");
  });

  it("cookie inventory does not invent inactive third-party trackers", async () => {
    const {
      getCookieInventory,
      isMetaPixelScriptActive,
      getCookiePolicyDeploymentNotes,
    } = await import("@/lib/legal/cookie-inventory");
    assert.equal(isMetaPixelScriptActive(), false);
    const ids = getCookieInventory().map((r) => r.id);
    assert.ok(ids.includes("consent_preference"));
    assert.ok(!ids.includes("meta_pixel"));
    assert.ok(!ids.includes("clarity"));
    assert.ok(!ids.includes("posthog"));
    const notes = getCookiePolicyDeploymentNotes().join(" ");
    assert.match(notes, /Meta Pixel/);
    assert.match(notes, /Clarity/);
  });

  it("privacy retention periods stay unapproved until legal decision", async () => {
    const {
      privacyRetention,
      isRetentionPeriodApproved,
      buildPublicRetentionSummary,
    } = await import("@/lib/legal/privacy-retention");
    assert.equal(privacyRetention.enquiries.days, null);
    assert.equal(privacyRetention.marketingConsent.days, null);
    assert.equal(privacyRetention.enquiries.automation, "manual_erasure_request");
    assert.equal(isRetentionPeriodApproved("enquiries"), false);
    const publicText = buildPublicRetentionSummary("privacy@example.com").join(
      " "
    );
    assert.ok(!/null/i.test(publicText));
    assert.ok(!/TODO/i.test(publicText));
    assert.match(publicText, /Automatické mazání/);
    assert.match(publicText, /není nastaveno/);
  });

  it("marketing consent is email-only and optional", async () => {
    const { CONSENT_PURPOSES } = await import("@/lib/legal/consent-versions");
    const label = CONSENT_PURPOSES.marketing.checkboxLabel;
    assert.match(label, /e-mailem/i);
    assert.match(label, /Hypotéka Jasně/i);
    assert.match(label, /odvolat/i);
    assert.ok(!/telefon/i.test(label));
    assert.equal(CONSENT_PURPOSES.marketing.required, false);
    assert.ok(!/odesláním formuláře/i.test(label));
  });

  it("third-party transfer is off until a named independent recipient exists", async () => {
    const {
      isThirdPartyTransferActive,
      buildPartnerTransferCheckboxLabel,
    } = await import("@/lib/legal/consent-versions");
    assert.equal(isThirdPartyTransferActive("none"), false);
    assert.equal(isThirdPartyTransferActive("mortgage_specialist"), false);
    assert.equal(isThirdPartyTransferActive("majetio"), false);
    assert.equal(isThirdPartyTransferActive("broker_developer"), false);
    assert.equal(buildPartnerTransferCheckboxLabel("mortgage_specialist"), "");
    assert.equal(buildPartnerTransferCheckboxLabel("majetio"), "");
    assert.ok(
      !/HEINZKE/i.test(buildPartnerTransferCheckboxLabel("mortgage_specialist"))
    );
  });

  it("GDPR public roles keep HEINZKE as controller and do not merge INSIA", async () => {
    const {
      getPublicProcessingRoles,
      getConditionalProcessingRoles,
      PROCESSING_ROLES,
    } = await import("@/lib/legal/roles");
    const publicRoles = getPublicProcessingRoles();
    assert.equal(getConditionalProcessingRoles().length, 0);
    assert.equal(publicRoles.length, PROCESSING_ROLES.length);
    assert.equal(publicRoles[0]?.id, "heinzke_operator");
    assert.match(
      publicRoles[0]!.roleLabelCs,
      /správce platformy a údajů z úvodních formulářů/
    );
    assert.equal(publicRoles[1]?.gdprRole, "processor");
    for (const r of publicRoles) {
      assert.ok(!/INSIA/i.test(r.label));
      assert.ok(!/\//.test(r.label));
      assert.ok(!/Odborná hypoteční část/i.test(r.label));
    }
  });
});

describe("partner handoff gating", () => {
  it("lead sources still show handoff intent UI flag", () => {
    assert.equal(isPartnerHandoffLeadSource("lead_gen"), true);
    assert.equal(isPartnerHandoffLeadSource("contact"), false);
  });

  it("does not require third-party transfer when no independent recipient is active", () => {
    assert.equal(requiresPartnerTransfer("lead_gen"), false);
    assert.equal(requiresPartnerTransfer("navrh_na_miru"), false);
    assert.equal(requiresPartnerTransfer("property_analysis"), false);
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

  it("accepts privacy-only consent for property analysis without Majetio PII transfer", () => {
    const r = validateFormConsent("property_analysis", {
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

  it("soft-warns when handoff incomplete / legal text not reviewed (default)", () => {
    const issues = collectLegalProductionIssues({
      requirePartnerHandoff: false,
      requireOperatorIdentity: false,
      requireIdentityForLeads: false,
    });
    assert.ok(issues.some((i) => i.code === "PARTNER_HANDOFF_SOFT"));
    assert.ok(!issues.some((i) => i.code === "OPERATOR_IDENTITY_SOFT"));
    assert.ok(issues.some((i) => i.code === "LEGAL_TEXT_NOT_REVIEWED"));
    assert.ok(issues.every((i) => i.severity === "warn"));
  });

  it("passes operator identity when required for lead collection", () => {
    const issues = collectLegalProductionIssues({
      requirePartnerHandoff: false,
      requireOperatorIdentity: true,
      requireIdentityForLeads: true,
    });
    assert.ok(
      !issues.some(
        (i) =>
          i.code === "OPERATOR_IDENTITY_REQUIRED_FOR_LEADS" ||
          i.code === "OPERATOR_IDENTITY_MISSING"
      )
    );
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
  it("isLegalIdentityComplete with HEINZKE operator defaults", async () => {
    const { isLegalIdentityComplete, getLegalIdentityConfig, legalOperator } =
      await import("@/config/legal");
    const cfg = getLegalIdentityConfig();
    assert.equal(cfg.legalName, legalOperator.companyName);
    assert.equal(cfg.companyId, legalOperator.ico);
    assert.equal(isLegalIdentityComplete(cfg), true);
  });

  it("registered office is atomic Ostrava address, never mixed with Krnov", async () => {
    const { getLegalIdentityConfig, formatCompactOfficeAddress, legalOperator } =
      await import("@/config/legal");
    const { formatOperatorAddressCompact, getOperatorIdentity } = await import(
      "@/lib/legal/operator"
    );
    const cfg = getLegalIdentityConfig();
    assert.equal(cfg.street, "Pavlovova 3048/40");
    assert.equal(cfg.district, "Zábřeh");
    assert.equal(cfg.city, "Ostrava");
    assert.equal(cfg.zip, "700 30");
    assert.match(cfg.registeredOffice ?? "", /Pavlovova 3048\/40/);
    assert.match(cfg.registeredOffice ?? "", /700 30 Ostrava/);
    assert.doesNotMatch(cfg.registeredOffice ?? "", /Krnov|794/);
    const compact = formatOperatorAddressCompact(getOperatorIdentity());
    assert.equal(
      compact,
      formatCompactOfficeAddress({
        street: legalOperator.street,
        district: legalOperator.district,
        zip: legalOperator.zip,
        city: legalOperator.city,
      })
    );
    assert.equal(compact, "Pavlovova 3048/40, Zábřeh, 700 30 Ostrava");
  });

  it("commercial register line uses correct Czech grammar", async () => {
    const { formatCommercialRegisterLine, legalOperator } = await import(
      "@/config/legal"
    );
    const line = formatCommercialRegisterLine({
      court: legalOperator.court,
      registerSection: legalOperator.registerSection,
      registerInsert: legalOperator.registerInsert,
    });
    assert.equal(
      line,
      "Společnost je zapsána v obchodním rejstříku vedeném Krajským soudem v Ostravě, oddíl C, vložka 85937."
    );
    assert.doesNotMatch(line, /zapsaná|vedeném Krajský soud/);
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
