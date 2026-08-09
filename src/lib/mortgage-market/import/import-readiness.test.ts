/**
 * Phase 2 Step 2.0 — unknown LTV + import readiness (synthetic only).
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import {
  assertValidLtvBounds,
  eligibilityAffectsRate,
  findDuplicateActiveVariantIdentities,
  isLtvUnspecified,
  productMaxLtvMustNotBecomeRateLtv,
  variantMatchesLtv,
} from "@/lib/mortgage-market/domain-rules";
import {
  isOneSidedLtvRejected,
  mapImportLtvToStorage,
  validateImportRateRecord,
  validateImportRepresentativeExample,
  validateMortgageMarketImport,
} from "@/lib/mortgage-market/import/validate";
import type {
  ImportEvidence,
  ImportRateRecord,
  MortgageMarketImportManifest,
} from "@/lib/mortgage-market/import/types";
import { getRateVariants } from "@/lib/mortgage-market/service";
import type { MortgageRateVariant } from "@/lib/mortgage-market/types";

const PRODUCT = "prod-a";

function primaryEvidence(
  overrides: Partial<ImportEvidence> = {}
): ImportEvidence {
  return {
    evidenceId: "ev-synthetic-1",
    sourceType: "official_rate_page",
    sourceName: "SYNTHETIC bank rate page",
    sourceUrl: "https://example.test/rates",
    checkedAt: "2026-08-08T12:00:00.000Z",
    reliabilityTier: "primary",
    ...overrides,
  };
}

function rate(
  overrides: Partial<ImportRateRecord> = {}
): ImportRateRecord {
  return {
    recordId: "r1",
    lenderSlug: "synthetic-bank",
    productSlug: "synthetic-hypoteka",
    fixationMonths: 36,
    nominalInterestRate: 4.99,
    rateType: "standard",
    pricingScenarioKey: "base",
    ltv: {
      kind: "explicit",
      ltvMin: 0,
      ltvMax: 80,
      ltvMinExclusive: false,
      ltvMaxExclusive: false,
      provenance: "explicit_in_rate_source",
    },
    evidence: primaryEvidence(),
    checkedAt: "2026-08-08T12:00:00.000Z",
    validFrom: "2026-08-01T00:00:00.000Z",
    auditStatus: "IMPORT_READY",
    ...overrides,
  };
}

function variant(
  overrides: Partial<MortgageRateVariant> = {}
): MortgageRateVariant {
  return {
    id: "v1",
    productId: PRODUCT,
    pricingScenarioKey: "base",
    fixationMonths: 36,
    ltvMin: 0,
    ltvMax: 80,
    ltvMinExclusive: false,
    ltvMaxExclusive: false,
    nominalInterestRate: 4.99,
    rateType: "standard",
    validFrom: "2026-08-01T00:00:00.000Z",
    checkedAt: "2026-08-08T12:00:00.000Z",
    isActive: true,
    ...overrides,
  };
}

describe("A/B — explicit LTV bands", () => {
  it("A: explicit <=80 is correctly represented", () => {
    const stored = mapImportLtvToStorage({
      kind: "explicit",
      ltvMin: 0,
      ltvMax: 80,
      ltvMinExclusive: false,
      ltvMaxExclusive: false,
      provenance: "explicit_in_rate_source",
    });
    assert.deepEqual(stored, {
      ltvMin: 0,
      ltvMax: 80,
      ltvMinExclusive: false,
      ltvMaxExclusive: false,
    });
    assert.equal(variantMatchesLtv(stored, 80), true);
    assert.equal(variantMatchesLtv(stored, 80.001), false);
  });

  it("B: explicit >80–90 is correctly represented", () => {
    const stored = mapImportLtvToStorage({
      kind: "explicit",
      ltvMin: 80,
      ltvMax: 90,
      ltvMinExclusive: true,
      ltvMaxExclusive: false,
      provenance: "explicit_in_rate_source",
    });
    assert.equal(variantMatchesLtv(stored, 80), false);
    assert.equal(variantMatchesLtv(stored, 80.001), true);
    assert.equal(variantMatchesLtv(stored, 90), true);
  });
});

describe("C/D — unknown LTV", () => {
  it("C: unknown LTV is a valid record", () => {
    const rec = rate({
      recordId: "unknown-ltv",
      ltv: {
        kind: "unspecified",
        ltvMin: null,
        ltvMax: null,
        provenance: "unspecified_in_rate_source",
      },
    });
    const result = validateImportRateRecord(rec);
    assert.equal(result.effectiveStatus, "IMPORT_READY");
    const stored = mapImportLtvToStorage(rec.ltv);
    assert.equal(isLtvUnspecified(stored), true);
    assert.equal(assertValidLtvBounds(null, null), true);
  });

  it("D: unknown LTV does NOT match personalized LTV=75 automatically", () => {
    const unknown = variant({
      id: "u",
      ltvMin: null,
      ltvMax: null,
    });
    const explicit = variant({ id: "e" });
    assert.equal(variantMatchesLtv(unknown, 75), false);
    assert.equal(
      getRateVariants([unknown, explicit], { productId: PRODUCT, ltv: 75 })
        .map((v) => v.id)
        .join(","),
      "e"
    );
    assert.equal(
      getRateVariants([unknown, explicit], {
        productId: PRODUCT,
        ltv: 75,
        includeLtvUnspecified: true,
      }).length,
      2
    );
  });
});

describe("E — one-sided LTV rejected", () => {
  it("rejects one NULL bound + one real bound", () => {
    assert.equal(assertValidLtvBounds(0, null), false);
    assert.equal(assertValidLtvBounds(null, 80), false);
    assert.equal(isOneSidedLtvRejected(0, null), true);
    assert.equal(isOneSidedLtvRejected(null, null), false);
    assert.equal(isOneSidedLtvRejected(0, 80), false);
  });
});

describe("F/G — active uniqueness with unknown LTV", () => {
  it("F: duplicate active unknown-LTV variant rejected", () => {
    const a = variant({
      id: "a",
      ltvMin: null,
      ltvMax: null,
      pricingScenarioKey: "base",
    });
    const b = variant({
      id: "b",
      ltvMin: null,
      ltvMax: null,
      pricingScenarioKey: "base",
    });
    assert.equal(findDuplicateActiveVariantIdentities([a, b]).length, 1);
  });

  it("G: same unknown-LTV identity with different pricing scenario allowed", () => {
    const base = variant({
      id: "base",
      ltvMin: null,
      ltvMax: null,
      pricingScenarioKey: "base",
    });
    const insured = variant({
      id: "ins",
      ltvMin: null,
      ltvMax: null,
      pricingScenarioKey: "with_repayment_insurance",
    });
    assert.deepEqual(
      findDuplicateActiveVariantIdentities([base, insured]),
      []
    );
  });
});

describe("H — product max LTV ≠ rate LTV", () => {
  it("product max LTV does NOT automatically become rate LTV", () => {
    assert.equal(
      productMaxLtvMustNotBecomeRateLtv({
        productMaxLtv: 90,
        rateLtvMin: 0,
        rateLtvMax: 90,
        ltvProvenance: "inferred_from_product_max",
      }),
      false
    );
    assert.equal(
      productMaxLtvMustNotBecomeRateLtv({
        productMaxLtv: 90,
        rateLtvMin: null,
        rateLtvMax: null,
        ltvProvenance: "unspecified_in_rate_source",
      }),
      true
    );

    const bad = rate({
      recordId: "inferred",
      productMaxLtv: 90,
      ltvInferredFromProductMax: true,
      ltv: {
        kind: "explicit",
        ltvMin: 0,
        ltvMax: 90,
        ltvMinExclusive: false,
        ltvMaxExclusive: false,
        provenance: "explicit_in_rate_source",
      },
    });
    const result = validateImportRateRecord(bad);
    assert.equal(result.effectiveStatus, "HOLD");
    assert.ok(result.issues.some((i) => i.code === "LTV_FROM_PRODUCT_MAX"));
  });
});

describe("I — evidence for IMPORT_READY", () => {
  it("missing primary evidence on IMPORT_READY lender rate → HOLD", () => {
    const rec = rate({
      recordId: "secondary",
      evidence: primaryEvidence({
        sourceType: "market_index",
        sourceName: "SYNTHETIC index",
        reliabilityTier: "secondary",
      }),
    });
    const result = validateImportRateRecord(rec);
    assert.equal(result.effectiveStatus, "HOLD");
    assert.ok(result.issues.some((i) => i.code === "EVIDENCE_NOT_PRIMARY"));
  });
});

describe("J — RPSN safety", () => {
  it("missing published RPSN remains NULL and is never calculated", () => {
    const example = {
      recordId: "rpsn1",
      lenderSlug: "synthetic-bank",
      productSlug: "synthetic-hypoteka",
      loanAmount: 3_000_000,
      termYears: 30,
      rpsn: null,
      nominalRate: 4.99,
      rpsnCalculated: false,
      evidence: primaryEvidence(),
      checkedAt: "2026-08-08T12:00:00.000Z",
      auditStatus: "STRUCTURED" as const,
    };
    const structured = validateImportRepresentativeExample(example);
    assert.equal(structured.effectiveStatus, "STRUCTURED");
    assert.equal(example.rpsn, null);

    const readyMissing = validateImportRepresentativeExample({
      ...example,
      auditStatus: "IMPORT_READY",
    });
    assert.equal(readyMissing.effectiveStatus, "HOLD");
    assert.ok(readyMissing.issues.some((i) => i.code === "RPSN_MISSING"));

    const calculated = validateImportRepresentativeExample({
      ...example,
      rpsn: 5.2,
      rpsnCalculated: true,
      auditStatus: "IMPORT_READY",
    });
    assert.equal(calculated.effectiveStatus, "HOLD");
    assert.ok(calculated.issues.some((i) => i.code === "RPSN_CALCULATED"));
  });
});

describe("K/L — conditions and eligibility", () => {
  it("K: condition with no explicit effect keeps rate_effect_bp NULL", () => {
    const rec = rate({
      conditions: [
        {
          conditionType: "active_account_required",
          conditionRole: "required",
          description: "Account required for advertised rate",
          isRequired: true,
          isOptional: false,
          rateEffectBp: null,
          effectInferred: false,
        },
      ],
    });
    const result = validateImportRateRecord(rec);
    assert.equal(result.effectiveStatus, "IMPORT_READY");
    assert.equal(rec.conditions?.[0]?.rateEffectBp, null);

    const inferred = validateImportRateRecord(
      rate({
        recordId: "inferred-bp",
        conditions: [
          {
            conditionType: "repayment_insurance",
            conditionRole: "required",
            description: "Insurance required — discount invented",
            isRequired: true,
            isOptional: false,
            rateEffectBp: -20,
            effectInferred: true,
          },
        ],
      })
    );
    assert.equal(inferred.effectiveStatus, "HOLD");
  });

  it("L: eligibility does not change rate", () => {
    const rec = rate({
      eligibility: [
        {
          ruleCategory: "applicant",
          ruleCode: "osvc",
          effect: "manual_assessment",
          description: "OSVČ individually assessed",
          changesPricing: false,
          pricingEffectBp: null,
        },
      ],
    });
    assert.equal(
      eligibilityAffectsRate({
        id: "e1",
        productId: PRODUCT,
        ruleCategory: "applicant",
        ruleCode: "osvc",
        effect: "manual_assessment",
        description: "OSVČ",
        changesPricing: false,
        pricingEffectBp: null,
        isActive: true,
      }),
      false
    );
    assert.equal(validateImportRateRecord(rec).effectiveStatus, "IMPORT_READY");
  });
});

describe("manifest + SQL patch", () => {
  it("validateMortgageMarketImport only marks true IMPORT_READY", () => {
    const manifest: MortgageMarketImportManifest = {
      manifestId: "m1",
      countryCode: "CZ",
      rates: [
        rate({ recordId: "ok" }),
        rate({
          recordId: "hold-secondary",
          evidence: primaryEvidence({ sourceType: "CBA" }),
        }),
      ],
    };
    const result = validateMortgageMarketImport(manifest);
    assert.deepEqual(result.importReadyRecordIds, ["ok"]);
    assert.ok(result.holdRecordIds.includes("hold-secondary"));
  });

  it("import readiness SQL patch makes LTV nullable with coalesce unique index", () => {
    const sqlPath = path.join(
      process.cwd(),
      "supabase",
      "mortgage_market_import_readiness.sql"
    );
    const sql = readFileSync(sqlPath, "utf8");
    assert.match(sql, /alter column ltv_min drop not null/i);
    assert.match(sql, /alter column ltv_max drop not null/i);
    assert.match(sql, /ltv_min is null\s+and ltv_max is null/i);
    assert.match(sql, /coalesce\(ltv_min, \(-1\)::numeric\)/);
    assert.match(sql, /coalesce\(ltv_max, \(-1\)::numeric\)/);
    assert.doesNotMatch(sql, /^\s*drop\s+table\b/im);
    assert.doesNotMatch(sql, /^\s*truncate\s+/im);
  });
});
