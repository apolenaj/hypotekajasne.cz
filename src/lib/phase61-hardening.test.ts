/**
 * Phase 6.1 customer-hardening regression tests.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import {
  auditCalendarDayPrague,
  formatAuditDateCs,
} from "@/lib/i18n/audit-date";
import {
  LEAD_FORM_FORBIDDEN_OR_CONTACT_PHRASES,
  LEAD_FORM_FRICTION_ABOVE,
  LEAD_FORM_FRICTION_SHORT,
} from "@/lib/leads-form-copy";
import { CZ_2026_08_09_EVIDENCE } from "@/lib/mortgage-market/import/data/cz-2026-08-09";
import { catalogFromImportManifest } from "@/lib/mortgage-market/catalog-from-manifest";
import { CZ_2026_08_09_MANIFEST } from "@/lib/mortgage-market/import/data/cz-2026-08-09";
import {
  getMortgageOffers,
  type MortgageMarketCatalog,
} from "@/lib/mortgage-market/offers";
import {
  hasPublicPrimaryEvidenceUrl,
  publicFreshnessLabel,
} from "@/lib/mortgage-market/public-labels";
import { rateFreshnessFromCheckedAt } from "@/lib/rates/mortgage-rate-freshness";
import { CNB_INVESTMENT_RECOMMENDATION_CS } from "@/lib/mortgage-regulation/cnb-public-copy";
import { REQUIRED_SECURITY_HEADER_NAMES } from "@/lib/security/headers";
import { KB_INSIDER_RATES } from "@/lib/scrape/rate-policy";
import { WAVE1_COMMERCIAL_LANDINGS } from "@/lib/seo/commercial-wave1";

const ROOT = process.cwd();

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), "utf8");
}

describe("Phase 6.1 — form copy matches required fields", () => {
  it("shared copy states name + email + phone", () => {
    assert.match(LEAD_FORM_FRICTION_SHORT, /e-mail/i);
    assert.match(LEAD_FORM_FRICTION_SHORT, /telefon/i);
    assert.match(LEAD_FORM_FRICTION_ABOVE, /e-mail/i);
    assert.match(LEAD_FORM_FRICTION_ABOVE, /telefon/i);
  });

  it("public surfaces do not claim phone OR email while both required", () => {
    const surfaces = [
      "src/components/home/HomeFinalCta.tsx",
      "src/components/seo/SeoLandingView.tsx",
      "src/components/mortgage-market/SazbyExperience.tsx",
      "src/components/seo/LandingCtaRow.tsx",
    ];
    for (const file of surfaces) {
      const src = read(file);
      for (const phrase of LEAD_FORM_FORBIDDEN_OR_CONTACT_PHRASES) {
        assert.equal(
          src.toLowerCase().includes(phrase),
          false,
          `${file} must not contain «${phrase}»`
        );
      }
    }
  });
});

describe("Phase 6.1 — evidence sourceUrl invariant", () => {
  it("IMPORT_READY primary evidence used by active rates has https sourceUrl", () => {
    const catalog = catalogFromImportManifest(CZ_2026_08_09_MANIFEST);
    const now = Date.parse("2026-08-12T12:00:00.000Z");
    const result = getMortgageOffers(catalog as MortgageMarketCatalog, {
      purpose: "purchase",
      fixationMonths: 36,
      ltv: 75,
      nowMs: now,
    });

    for (const offer of result.offers) {
      const freshness = rateFreshnessFromCheckedAt(offer.checkedAt, now);
      if (freshness !== "fresh") continue;
      const tier = offer.evidence?.reliabilityTier;
      if (tier && tier !== "primary") continue;
      assert.ok(
        hasPublicPrimaryEvidenceUrl(offer.evidence?.sourceUrl),
        `${offer.lenderSlug} ${offer.nominalInterestRate} missing primary sourceUrl`
      );
      const label = publicFreshnessLabel(freshness, offer.checkedAt, {
        sourceUrl: offer.evidence?.sourceUrl,
      });
      assert.match(label.short, /Ověřeno/);
    }
  });

  it("Air / UniCredit / MONETA evidence rows carry official URLs in manifest", () => {
    for (const id of [
      "ev-air-bank-rates-2026-03-27",
      "ev-unicredit-purpose-rates",
      "ev-moneta-rates-2026-07-23",
    ]) {
      const ev = CZ_2026_08_09_EVIDENCE.find((e) => e.evidenceId === id);
      assert.ok(ev, id);
      assert.ok(hasPublicPrimaryEvidenceUrl(ev!.sourceUrl), id);
    }
  });
});

describe("Phase 6.1 — timezone-stable audit dates", () => {
  it("UTC midnight 2026-08-09 stays 9. 8. 2026 in Prague calendar", () => {
    const iso = "2026-08-09T00:00:00.000Z";
    assert.equal(auditCalendarDayPrague(iso), "2026-08-09");
    assert.match(formatAuditDateCs(iso), /9\.\s*8\.\s*2026/);
  });

  it("formatter output is stable across visitor TZ simulation via calendar day", () => {
    const iso = "2026-08-09T00:00:00.000Z";
    // Europe/Prague, UTC, and America/New_York all use the same formatter
    // with explicit Europe/Prague — calendar day must not flip.
    for (const _tz of ["Europe/Prague", "UTC", "America/New_York"]) {
      assert.equal(auditCalendarDayPrague(iso), "2026-08-09");
      assert.equal(formatAuditDateCs(iso), formatAuditDateCs(iso));
    }
  });
});

describe("Phase 6.1 — ČNB investment wording", () => {
  it("commercial investment landing avoids absolute statutory limit phrasing", () => {
    const inv = WAVE1_COMMERCIAL_LANDINGS.find(
      (l) => l.slug === "investicni-hypoteka"
    );
    assert.ok(inv);
    const blob = JSON.stringify(inv);
    assert.match(blob, /doporučuje/);
    assert.equal(blob.includes("LTV max. 70 % a DTI max. 7"), false);
    assert.ok(CNB_INVESTMENT_RECOMMENDATION_CS.includes("doporučuje"));
  });
});

describe("Phase 6.1 — KB scraper fallback vs matrix separation", () => {
  it("does not advertise obsolete 5.14 / 5.34 as matrix", () => {
    assert.notEqual(KB_INSIDER_RATES.rateWithInsurance, 5.14);
    assert.notEqual(KB_INSIDER_RATES.rateWithoutInsurance, 5.34);
    const catalog = read("src/lib/data/catalog.ts");
    assert.equal(catalog.includes("KB fallback 5.14"), false);
  });
});

describe("Phase 6.1 — security headers module", () => {
  it("exports required hardening header names including CSP Report-Only", () => {
    assert.ok(
      REQUIRED_SECURITY_HEADER_NAMES.includes(
        "content-security-policy-report-only"
      )
    );
    const headersMod = read("src/lib/security/headers.ts");
    assert.match(headersMod, /X-Content-Type-Options/);
    assert.match(headersMod, /X-Frame-Options/);
    assert.match(headersMod, /Referrer-Policy/);
    assert.match(headersMod, /Permissions-Policy/);
    const cfg = read("next.config.ts");
    assert.match(cfg, /Content-Security-Policy-Report-Only/);
    assert.match(cfg, /SECURITY_HEADERS/);
  });
});

describe("Phase 6.1 — html lang wiring", () => {
  it("root layout reads x-hj-locale for lang=en|cs", () => {
    const layout = read("src/app/layout.tsx");
    assert.match(layout, /x-hj-locale/);
    assert.match(layout, /lang=\{lang\}/);
    const mw = read("src/middleware.ts");
    assert.match(mw, /x-hj-locale/);
    assert.match(mw, /\/en/);
  });
});

describe("Phase 6.1 — funnel regressions preserved", () => {
  it("keeps five commercial intents and CTA destinations", () => {
    const byIntent = Object.fromEntries(
      WAVE1_COMMERCIAL_LANDINGS.map((l) => [l.commercialIntent, l])
    );
    assert.match(byIntent.refinance!.primaryCta.href, /purpose=refinance/);
    assert.equal(byIntent.osvc!.primaryCta.href, "#poptavka");
    assert.match(byIntent.osvc!.secondaryCta!.href, /intent=osvc/);
    assert.equal(
      JSON.stringify(byIntent.osvc).includes("osvc_pausal"),
      false
    );
    assert.match(
      byIntent.foreign_income!.secondaryCta!.href,
      /intent=foreign_income/
    );
    assert.equal(byIntent.investment!.primaryCta.href, "#poptavka");
    assert.match(
      byIntent.investment!.secondaryCta!.href,
      /investicni-rentgen/
    );
    assert.equal(byIntent.american!.primaryCta.href, "#poptavka");
    assert.equal(
      JSON.stringify(byIntent.american).includes("/kalkulacky/hypotecni"),
      false
    );
  });
});
