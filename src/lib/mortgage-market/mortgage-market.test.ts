/**
 * Critical model rules for Phase 2 Step 1.3 — synthetic data only.
 * Covers launch-gate cases A–I.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import {
  applyPublishedRateEffects,
  assertValidRateType,
  eligibilityAffectsRate,
  findDuplicateActiveVariantIdentities,
  historyCanCoexist,
  isForbiddenRateTypeLabel,
  isMarketBenchmarkNotLenderRate,
  MORTGAGE_MARKET_RLS_POLICY,
  RATE_VARIANT_ACTIVE_IDENTITY_FIELDS,
  representativeExampleDiffersFromNominal,
  variantMatchesLtv,
} from "@/lib/mortgage-market/domain-rules";
import { planRateVariantSupersede } from "@/lib/mortgage-market/history";
import {
  getEligibleMortgageProducts,
  getMarketBenchmark,
  getMortgageProducts,
  getRateVariants,
} from "@/lib/mortgage-market/service";
import type {
  MortgageCatalogProduct,
  MortgageEligibilityRule,
  MortgageMarketBenchmark,
  MortgageRateCondition,
  MortgageRateVariant,
  MortgageRepresentativeExample,
} from "@/lib/mortgage-market/types";

const PRODUCT_A = "prod-a";
const PRODUCT_B = "prod-b";
const LENDER = "lender-1";

function variant(
  overrides: Partial<MortgageRateVariant> = {}
): MortgageRateVariant {
  return {
    id: "var-1",
    productId: PRODUCT_A,
    pricingScenarioKey: "base",
    pricingScenarioLabel: "Standard / without extras",
    financingPurpose: null,
    fixationMonths: 36,
    ltvMin: 0,
    ltvMax: 80,
    ltvMinExclusive: false,
    ltvMaxExclusive: false,
    nominalInterestRate: 4.79,
    rateType: "standard",
    minLoanAmount: null,
    maxLoanAmount: null,
    validFrom: "2026-01-01T00:00:00.000Z",
    validTo: null,
    checkedAt: "2026-08-01T00:00:00.000Z",
    isActive: true,
    ...overrides,
  };
}

describe("A/B — pricing scenario uniqueness", () => {
  it("A: same product/fixation/LTV + base AND insurance scenarios coexist", () => {
    const base = variant({
      id: "base",
      pricingScenarioKey: "base",
      nominalInterestRate: 4.89,
    });
    const insured = variant({
      id: "insured",
      pricingScenarioKey: "with_repayment_insurance",
      pricingScenarioLabel: "With repayment insurance",
      nominalInterestRate: 4.69,
    });
    assert.deepEqual(
      findDuplicateActiveVariantIdentities([base, insured]),
      []
    );
    assert.equal(
      getRateVariants([base, insured], {
        productId: PRODUCT_A,
        fixationMonths: 36,
        ltv: 80,
      }).length,
      2
    );
  });

  it("B: exact duplicate active scenario is rejected", () => {
    const a = variant({ id: "a", pricingScenarioKey: "base" });
    const b = variant({ id: "b", pricingScenarioKey: "base" });
    const dupes = findDuplicateActiveVariantIdentities([a, b]);
    assert.equal(dupes.length, 1);
  });
});

describe("C — versioning / history", () => {
  it("historical inactive version + new active version is valid", () => {
    const oldV = variant({
      id: "old",
      isActive: false,
      validTo: "2026-08-01T00:00:00.000Z",
      nominalInterestRate: 4.5,
    });
    const newV = variant({
      id: "new",
      isActive: true,
      validTo: null,
      nominalInterestRate: 4.79,
    });
    assert.equal(historyCanCoexist(oldV, newV), true);
    assert.deepEqual(findDuplicateActiveVariantIdentities([oldV, newV]), []);

    const plan = planRateVariantSupersede({
      previous: variant({ id: "live", nominalInterestRate: 4.5 }),
      nominalInterestRate: 4.79,
      checkedAt: "2026-08-08T12:00:00.000Z",
    });
    assert.equal(plan.deactivate.isActive, false);
    assert.equal(plan.insert.isActive, true);
    assert.equal(plan.insert.pricingScenarioKey, "base");
    assert.equal(plan.insert.nominalInterestRate, 4.79);
  });
});

describe("D — LTV boundaries on rate variants", () => {
  it("80.000 vs 80.001 use correct bands (no 80.01 workaround)", () => {
    const low = variant({
      ltvMin: 0,
      ltvMax: 80,
      ltvMinExclusive: false,
    });
    const high = variant({
      id: "var-high",
      pricingScenarioKey: "base",
      ltvMin: 80,
      ltvMax: 90,
      ltvMinExclusive: true,
      nominalInterestRate: 5.1,
    });

    assert.equal(variantMatchesLtv(low, 80.0), true);
    assert.equal(variantMatchesLtv(high, 80.0), false);
    assert.equal(variantMatchesLtv(low, 80.001), false);
    assert.equal(variantMatchesLtv(high, 80.001), true);
  });
});

describe("E/F — conditions and published rate effects", () => {
  it("E: condition without published effect does NOT modify rate", () => {
    const conditions: MortgageRateCondition[] = [
      {
        id: "c1",
        rateVariantId: "var-1",
        conditionType: "active_account_required",
        conditionRole: "required",
        description: "Account required (no published discount)",
        isRequired: true,
        isOptional: false,
        isActive: true,
        rateEffectBp: null,
      },
    ];
    const result = applyPublishedRateEffects(4.79, conditions);
    assert.equal(result.rate, 4.79);
    assert.equal(result.appliedEffectsBp, 0);
  });

  it("F: published rate effect is stored and applied explicitly only", () => {
    const conditions: MortgageRateCondition[] = [
      {
        id: "c1",
        rateVariantId: "var-1",
        conditionType: "active_account_required",
        conditionRole: "required",
        description: "Account required",
        isRequired: true,
        isOptional: false,
        isActive: true,
        rateEffectBp: null,
      },
      {
        id: "c2",
        rateVariantId: "var-1",
        conditionType: "repayment_insurance_discount",
        conditionRole: "published_discount",
        insuranceKind: "repayment",
        requirementMode: "required_for_discount",
        description: "Published −20 bp if insurance",
        isRequired: false,
        isOptional: true,
        isActive: true,
        rateEffectBp: -20,
      },
    ];
    const withPublished = applyPublishedRateEffects(4.79, conditions);
    assert.equal(withPublished.appliedEffectsBp, -20);
    assert.ok(Math.abs(withPublished.rate - 4.59) < 1e-9);
  });
});

describe("G — RPSN representative examples", () => {
  it("representative RPSN example can differ from nominal rate", () => {
    const v = variant({ nominalInterestRate: 4.79 });
    const example: MortgageRepresentativeExample = {
      id: "ex1",
      productId: PRODUCT_A,
      rateVariantId: v.id,
      loanAmount: 3_000_000,
      termYears: 30,
      fixationMonths: 36,
      nominalRate: 4.79,
      rpsn: 5.12,
      monthlyPayment: 15_720,
      totalAmountPayable: 5_659_200,
      includedFees: "arrangement, valuation",
      insuranceIncluded: true,
      insuranceCost: 450,
      accountCost: 0,
      checkedAt: "2026-08-01T00:00:00.000Z",
      isActive: true,
      sourceEvidenceId: "ev-1",
    };
    assert.equal(representativeExampleDiffersFromNominal(example, v), true);
  });
});

describe("H — price vs eligibility separation", () => {
  it("eligibility rule does not implicitly alter price", () => {
    const products: MortgageCatalogProduct[] = [
      {
        id: PRODUCT_A,
        lenderId: LENDER,
        slug: "std",
        name: "SYNTHETIC",
        productType: "residential_purchase",
        borrowerScope: "natural_person",
        currency: "CZK",
        maxLtv: 80,
        isActive: true,
        validFrom: "2026-01-01T00:00:00.000Z",
      },
    ];
    const rules: MortgageEligibilityRule[] = [
      {
        id: "r1",
        productId: PRODUCT_A,
        ruleCategory: "applicant",
        ruleCode: "osvc",
        effect: "not_eligible",
        description: "OSVČ not accepted on this synthetic product",
        changesPricing: false,
        pricingEffectBp: null,
        isActive: true,
      },
      {
        id: "r2",
        productId: PRODUCT_A,
        ruleCategory: "income",
        ruleCode: "foreign_income",
        effect: "manual_assessment",
        description: "Foreign income needs manual review",
        changesPricing: false,
        pricingEffectBp: null,
        isActive: true,
      },
    ];

    assert.equal(eligibilityAffectsRate(rules[0]!), false);
    assert.equal(eligibilityAffectsRate(rules[1]!), false);
    const blocked = getEligibleMortgageProducts(products, rules, {
      applicantType: "osvc",
    });
    assert.equal(blocked.length, 0);

    const allowed = getEligibleMortgageProducts(products, rules, {
      applicantType: "employee",
    });
    assert.equal(allowed.length, 1);
    assert.equal(variant().nominalInterestRate, 4.79);
  });
});

describe("I — market benchmarks vs lender rates", () => {
  it("market benchmark remains separate from lender rate", () => {
    const bench: MortgageMarketBenchmark = {
      id: "b1",
      benchmarkName: "SYNTHETIC Hypoindex",
      provider: "synthetic-provider",
      countryCode: "CZ",
      value: 4.5,
      metricType: "average_rate",
      checkedAt: "2026-08-01T00:00:00.000Z",
      isActive: true,
      entityKind: "market_benchmark",
    };
    assert.equal(isMarketBenchmarkNotLenderRate(bench), true);
    assert.equal(
      getMarketBenchmark([bench], { provider: "synthetic-provider" }).length,
      1
    );
    assert.equal(assertValidRateType("guaranteed"), false);
    assert.equal(assertValidRateType("market_reference"), false);
    assert.equal(assertValidRateType("standard"), true);
    assert.equal(isForbiddenRateTypeLabel("personalized_offer"), true);
  });
});

describe("products, purpose, and insurance model", () => {
  it("lender may have multiple products; one product may price by purpose", () => {
    const products: MortgageCatalogProduct[] = [
      {
        id: PRODUCT_A,
        lenderId: LENDER,
        slug: "hypoteka-standard",
        name: "SYNTHETIC Standard",
        productType: "residential_purchase",
        borrowerScope: "natural_person",
        currency: "CZK",
        isActive: true,
        validFrom: "2026-01-01T00:00:00.000Z",
      },
      {
        id: PRODUCT_B,
        lenderId: LENDER,
        slug: "hypoteka-american",
        name: "SYNTHETIC American",
        productType: "american",
        borrowerScope: "natural_person",
        currency: "CZK",
        isActive: true,
        validFrom: "2026-01-01T00:00:00.000Z",
      },
    ];
    assert.equal(
      getMortgageProducts(products, { lenderId: LENDER }).length,
      2
    );

    const variants = [
      variant({
        id: "purchase",
        financingPurpose: "purchase",
        pricingScenarioKey: "base",
      }),
      variant({
        id: "refinance",
        financingPurpose: "refinance",
        pricingScenarioKey: "base",
        nominalInterestRate: 4.69,
      }),
    ];
    assert.deepEqual(findDuplicateActiveVariantIdentities(variants), []);
  });

  it("insurance kinds are distinct and do not merge cost into nominal rate", () => {
    const conditions: MortgageRateCondition[] = [
      {
        id: "ins-none",
        rateVariantId: "var-1",
        conditionType: "no_insurance",
        conditionRole: "qualifying",
        insuranceKind: "none",
        requirementMode: "not_applicable",
        description: "Rate without insurance",
        isRequired: false,
        isOptional: true,
        isActive: true,
        rateEffectBp: null,
      },
      {
        id: "ins-rep",
        rateVariantId: "var-ins",
        conditionType: "repayment_insurance",
        conditionRole: "required",
        insuranceKind: "repayment",
        requirementMode: "mandatory_for_rate",
        description: "Repayment insurance required for this scenario",
        isRequired: true,
        isOptional: false,
        isActive: true,
        rateEffectBp: null,
      },
    ];
    assert.equal(applyPublishedRateEffects(4.79, conditions).rate, 4.79);
  });
});

describe("RLS / migration safety / identity documentation", () => {
  it("policy forbids anonymous writes and browser service-role", () => {
    assert.equal(MORTGAGE_MARKET_RLS_POLICY.anonInsert, false);
    assert.equal(MORTGAGE_MARKET_RLS_POLICY.anonUpdate, false);
    assert.equal(MORTGAGE_MARKET_RLS_POLICY.anonDelete, false);
    assert.equal(MORTGAGE_MARKET_RLS_POLICY.anonSelect, false);
    assert.equal(MORTGAGE_MARKET_RLS_POLICY.browserServiceRoleForbidden, true);
  });

  it("migration SQL encodes launch-gate identity, RLS, and scrape/catalog split", () => {
    const sqlPath = path.join(
      process.cwd(),
      "supabase",
      "mortgage_market_model.sql"
    );
    const sql = readFileSync(sqlPath, "utf8");
    assert.match(sql, /enable row level security/i);
    assert.match(sql, /Intentionally NO policies for anon/i);
    assert.doesNotMatch(
      sql,
      /create policy[\s\S]*for insert[\s\S]*to anon/i
    );
    assert.doesNotMatch(sql, /^\s*drop\s+table\b/im);
    assert.doesNotMatch(sql, /^\s*truncate\s+/im);
    assert.doesNotMatch(
      sql,
      /create table if not exists public\.mortgage_products\s*\(/i
    );
    assert.match(sql, /mortgage_catalog_products/);
    assert.match(sql, /pricing_scenario_key/);
    assert.match(sql, /RAW \/ AUTOMATED INGESTION/);
    assert.match(sql, /CURATED PRODUCT CATALOG/);
    assert.match(
      sql,
      /create unique index mortgage_rate_variants_active_identity_uidx/
    );
    assert.match(sql, /pricing_scenario_key,/);
    assert.match(sql, /coalesce\(financing_purpose, ''\)/);
    assert.match(sql, /coalesce\(ltv_min, \(-1\)::numeric\)/);
    assert.match(sql, /coalesce\(ltv_max, \(-1\)::numeric\)/);
    assert.ok(RATE_VARIANT_ACTIVE_IDENTITY_FIELDS.includes("pricing_scenario_key"));
    assert.match(
      sql,
      /rate_type in \(\s*'advertised_from',\s*'standard',\s*'representative'\s*\)/
    );
    assert.match(sql, /'market_reference'/);
    assert.match(
      sql,
      /market_reference belongs here, not in mortgage_rate_variants/i
    );
  });
});
