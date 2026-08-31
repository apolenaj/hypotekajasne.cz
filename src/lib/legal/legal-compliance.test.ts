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
    if (f.includes(`${join("lib", "trust")}`)) return true;
    if (f.includes(`${join("lib", "partners", "verification.ts")}`)) return true;
    if (f.includes(`${join("lib", "legal", "roles.ts")}`)) return true;
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
    assert.match(partnerPublicDisplayName(p), /Hunger\s*killers/i);
  });

  it("consent copy names controller and enquiry purpose without fake handoff", () => {
    const privacy = buildPrivacyProcessingCheckboxLabel();
    assert.match(privacy, /Hunger\s*killers/i);
    assert.match(privacy, /Zásadami ochrany osobních údajů/i);
    assert.match(privacy, /vyřízení vaší zprávy nebo poptávky/i);
    assert.ok(!/předání údajů společnosti Hunger/i.test(privacy));
    assert.ok(!/předání.*provozovatel/i.test(privacy));

    const summary = buildConsentContextSummary();
    assert.match(summary, /Správce/);
    assert.match(summary, /není banka/);
    assert.match(summary, /Hunger|provozovatel|správce/i);
    assert.ok(!/předáme kontakt/i.test(summary));
    assert.ok(!/Předání třetímu partnerovi zatím není aktivní/i.test(summary));

    const label = buildPartnerTransferCheckboxLabel("mortgage_specialist");
    assert.equal(label, "");
    assert.ok(!/předání údajů společnosti Hunger/i.test(label));
  });

  it("bumped consent policy version", () => {
    assert.equal(CONSENT_POLICY_VERSION, "2026-08-31.1");
  });

  it("cookie policy version matches material cookie inventory update", async () => {
    const { COOKIE_POLICY_VERSION } = await import("@/lib/legal/consent-versions");
    assert.equal(COOKIE_POLICY_VERSION, "2026-08-07.2");
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

  it("privacy retention policy is concrete and cron-aware", async () => {
    const {
      privacyRetention,
      buildPublicRetentionSummary,
      computeEnquiryRetentionUntil,
    } = await import("@/lib/legal/privacy-retention");
    assert.equal(privacyRetention.inactiveEnquiryMonths, 6);
    assert.equal(privacyRetention.closedCaseMonths, 6);
    assert.equal(privacyRetention.marketingInactivityMonths, 24);
    assert.equal(privacyRetention.technicalLogDays, 90);
    assert.equal(privacyRetention.cleanupScheduledInCron, true);

    const until = computeEnquiryRetentionUntil({
      lastInteractionAt: "2026-01-01T00:00:00.000Z",
      source: "contact",
    });
    assert.ok(until);
    assert.equal(until!.toISOString().startsWith("2026-07-01"), true);

    const publicText = buildPublicRetentionSummary("privacy@example.com").join(
      " "
    );
    assert.ok(!/null/i.test(publicText));
    assert.ok(!/TODO/i.test(publicText));
    assert.ok(!/bude upřesněno/i.test(publicText));
    assert.ok(!/není nastaveno/i.test(publicText));
    assert.match(publicText, /6 měsíců/);
    assert.match(publicText, /24 měsíců/);
    assert.match(publicText, /90 dní/);
    assert.match(publicText, /automatickým úklidem/i);
  });

  it("marketing consent is email-only and optional", async () => {
    const { CONSENT_PURPOSES } = await import("@/lib/legal/consent-versions");
    const label = CONSENT_PURPOSES.marketing.checkboxLabel;
    assert.match(label, /e-mailem/i);
    assert.match(label, /Hypotéka Jasně/i);
    assert.match(label, /odvolat/i);
    assert.ok(!/telefon/i.test(label));
    assert.equal(CONSENT_PURPOSES.marketing.required, false);
    assert.equal(CONSENT_PURPOSES.marketing.uiKind, "consent");
    assert.ok(!/odesláním formuláře/i.test(label));
  });

  it("enquiry privacy notice is acknowledgment not marketing consent", async () => {
    const {
      CONSENT_PURPOSES,
      ENQUIRY_PROCESSING_LEGAL_BASIS,
      buildPrivacyProcessingCheckboxLabel,
    } = await import("@/lib/legal/consent-versions");
    assert.equal(CONSENT_PURPOSES.privacy_processing.uiKind, "privacy_notice");
    assert.equal(ENQUIRY_PROCESSING_LEGAL_BASIS.art6Status, "pending_counsel");
    const notice = buildPrivacyProcessingCheckboxLabel();
    assert.match(notice, /Zásadami ochrany osobních údajů/i);
    assert.match(notice, /Hunger\s*killers/i);
    assert.ok(!/předání údajů společnosti Hunger/i.test(notice));
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
      !/Hunger|HEINZKE/i.test(buildPartnerTransferCheckboxLabel("mortgage_specialist"))
    );
  });

  it("GDPR public roles keep Hunger killers as controller and do not invent INSIA", async () => {
    const {
      getPublicProcessingRoles,
      getConditionalProcessingRoles,
      PROCESSING_ROLES,
    } = await import("@/lib/legal/roles");
    const publicRoles = getPublicProcessingRoles();
    assert.equal(getConditionalProcessingRoles().length, 0);
    assert.equal(publicRoles.length, PROCESSING_ROLES.length);
    assert.equal(publicRoles[0]?.id, "platform_operator");
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
  it("isLegalIdentityComplete with Hunger killers operator defaults", async () => {
    const { isLegalIdentityComplete, getLegalIdentityConfig, legalOperator } =
      await import("@/config/legal");
    const cfg = getLegalIdentityConfig();
    assert.equal(cfg.legalName, legalOperator.companyName);
    assert.equal(cfg.companyId, legalOperator.ico);
    assert.equal(isLegalIdentityComplete(cfg), true);
  });

  it("registered office is atomic Krnov address, never mixed with obsolete Pavlovova", async () => {
    const { getLegalIdentityConfig, formatCompactOfficeAddress, legalOperator } =
      await import("@/config/legal");
    const { formatOperatorAddressCompact, getOperatorIdentity } = await import(
      "@/lib/legal/operator"
    );
    const cfg = getLegalIdentityConfig();
    assert.equal(cfg.street, "Soukenická 82/6");
    assert.equal(cfg.district, "Pod Bezručovým vrchem");
    assert.equal(cfg.city, "Krnov");
    assert.equal(cfg.zip, "794 01");
    assert.match(cfg.registeredOffice ?? "", /Soukenická 82\/6/);
    assert.match(cfg.registeredOffice ?? "", /794 01 Krnov/);
    assert.doesNotMatch(cfg.registeredOffice ?? "", /Pavlovova|700\s*30|Zábřeh/);
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
    assert.equal(compact, "Soukenická 82/6, Pod Bezručovým vrchem, 794 01 Krnov");
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
      "Společnost je zapsána v obchodním rejstříku vedeném Krajským soudem v Ostravě, oddíl C, vložka 93063."
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

  it("operator company name does not create s.r.o.. in public copy helpers", async () => {
    const { legalOperator, financialPartner, withSentencePeriod } = await import(
      "@/config/legal"
    );
    assert.match(legalOperator.companyName, /s\.r\.o\.$/);
    assert.equal(
      withSentencePeriod(legalOperator.companyName),
      legalOperator.companyName
    );
    assert.doesNotMatch(financialPartner.platformWording, /s\.r\.o\.\./);
    assert.doesNotMatch(financialPartner.cooperationWording, /s\.r\.o\.\./);

    for (const f of publicSurfaces()) {
      const text = readFileSync(f, "utf8");
      assert.doesNotMatch(
        text,
        /s\.r\.o\.\./,
        `Double period after s.r.o. in ${f}`
      );
      // Template anti-pattern: companyName}.  (extra period after already-dotted name)
      assert.doesNotMatch(
        text,
        /companyName\}\./,
        `Avoid companyName}. punctuation in ${f}`
      );
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
      // Pattern registry — lists forbidden phrases for enforcement, not UI copy.
      if (f.includes(`${join("lib", "partners", "verification.ts")}`)) continue;
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
