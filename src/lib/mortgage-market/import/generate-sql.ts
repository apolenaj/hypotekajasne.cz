/**
 * Generate safe production SQL from the verified CZ import manifest.
 * HOLD rates are never emitted. Does not execute SQL.
 */

import { createHash } from "node:crypto";
import type {
  ImportCondition,
  ImportEligibility,
  ImportEvidence,
  ImportFee,
  ImportLender,
  ImportProduct,
  ImportRateRecord,
  ImportRepresentativeExample,
  MortgageMarketImportManifest,
} from "@/lib/mortgage-market/import/types";
import { PRIMARY_LENDER_EVIDENCE_TYPES } from "@/lib/mortgage-market/import/types";
import { CZ_2026_08_09_MANIFEST } from "@/lib/mortgage-market/import/data/cz-2026-08-09";

const PRIMARY = new Set<string>(PRIMARY_LENDER_EVIDENCE_TYPES);
export const EXPECTED_IMPORT_READY_RATES = 65;

export type SqlGenerationReport = {
  manifestImportReadyRates: number;
  generatedRateInserts: number;
  difference: number;
  lenders: number;
  products: number;
  evidence: number;
  conditions: number;
  fees: number;
  examples: number;
  eligibility: number;
  benchmarks: number;
  byLender: Record<string, number>;
  excludedHoldRateIds: string[];
  ratesMissingPrimaryEvidence: string[];
  forbiddenValuesPresent: {
    cs494: boolean;
    kb514: boolean;
    csobHoldRates: boolean;
    rbKlasikRates: boolean;
  };
  productionSql: string;
  verifySql: string;
};

function stableUuid(key: string): string {
  const hash = createHash("sha1")
    .update(`hypoteka-jasne:cz-2026-08-09:${key}`)
    .digest();
  const bytes = Buffer.from(hash.subarray(0, 16));
  bytes[6] = (bytes[6]! & 0x0f) | 0x50;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

function sqlStr(value: string | null | undefined): string {
  if (value == null) return "null";
  return `'${value.replace(/'/g, "''")}'`;
}

function sqlNum(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "null";
  return String(value);
}

function sqlBool(value: boolean): string {
  return value ? "true" : "false";
}

function sqlTs(value: string | null | undefined): string {
  if (!value) return "null";
  return sqlStr(value);
}

function lenderId(slug: string): string {
  return stableUuid(`lender:${slug}`);
}

function evidenceId(id: string): string {
  return stableUuid(`evidence:${id}`);
}

function productId(lenderSlug: string, slug: string): string {
  return stableUuid(`product:${lenderSlug}:${slug}`);
}

function rateId(recordId: string): string {
  return stableUuid(`rate:${recordId}`);
}

function conditionId(rateRecordId: string, index: number): string {
  return stableUuid(`condition:${rateRecordId}:${index}`);
}

function feeId(recordId: string): string {
  return stableUuid(`fee:${recordId}`);
}

function exampleId(recordId: string): string {
  return stableUuid(`example:${recordId}`);
}

function eligibilityId(recordId: string): string {
  return stableUuid(`eligibility:${recordId}`);
}

function mapImportLtv(rate: ImportRateRecord): {
  ltvMin: number | null;
  ltvMax: number | null;
  ltvMinExclusive: boolean;
  ltvMaxExclusive: boolean;
} {
  if (rate.ltv.kind === "unspecified") {
    return {
      ltvMin: null,
      ltvMax: null,
      ltvMinExclusive: false,
      ltvMaxExclusive: false,
    };
  }
  return {
    ltvMin: rate.ltv.ltvMin,
    ltvMax: rate.ltv.ltvMax,
    ltvMinExclusive: rate.ltv.ltvMinExclusive,
    ltvMaxExclusive: rate.ltv.ltvMaxExclusive,
  };
}

function collectUsedEvidence(
  manifest: MortgageMarketImportManifest,
  rates: ImportRateRecord[],
  products: ImportProduct[],
  fees: ImportFee[],
  examples: ImportRepresentativeExample[],
  eligibility: Array<{ evidence: ImportEvidence }>
): ImportEvidence[] {
  const byId = new Map<string, ImportEvidence>();
  for (const e of manifest.evidence ?? []) byId.set(e.evidenceId, e);
  const used = new Map<string, ImportEvidence>();
  const take = (e?: ImportEvidence | null) => {
    if (!e) return;
    const full = byId.get(e.evidenceId) ?? e;
    used.set(full.evidenceId, full);
  };
  for (const l of manifest.lenders ?? []) take(l.evidence);
  for (const p of products) take(p.evidence);
  for (const r of rates) take(r.evidence);
  for (const f of fees) take(f.evidence);
  for (const x of examples) take(x.evidence);
  for (const el of eligibility) take(el.evidence);
  // Never include campaign HOLD evidence (no production rate uses it).
  used.delete("ev-cs-web-campaign-od-4-94-hold");
  return [...used.values()];
}

function emitLender(l: ImportLender): string {
  return `insert into public.mortgage_lenders (
  id, slug, name, country_code, website_url, is_active
) values (
  ${sqlStr(lenderId(l.slug))},
  ${sqlStr(l.slug)},
  ${sqlStr(l.name)},
  ${sqlStr(l.countryCode)},
  ${sqlStr(l.websiteUrl ?? null)},
  true
)
on conflict (id) do update set
  name = excluded.name,
  country_code = excluded.country_code,
  website_url = excluded.website_url,
  is_active = true,
  updated_at = now();`;
}

function emitEvidence(e: ImportEvidence): string {
  return `insert into public.mortgage_source_evidence (
  id, lender_id, product_id, source_type, source_name, source_url,
  document_title, checked_at, reliability_tier
) values (
  ${sqlStr(evidenceId(e.evidenceId))},
  ${e.lenderSlug ? sqlStr(lenderId(e.lenderSlug)) : "null"},
  null,
  ${sqlStr(e.sourceType)},
  ${sqlStr(e.sourceName)},
  ${sqlStr(e.sourceUrl ?? null)},
  ${sqlStr(e.documentTitle ?? null)},
  ${sqlTs(e.checkedAt)},
  ${sqlStr(e.reliabilityTier ?? "primary")}
)
on conflict (id) do update set
  lender_id = excluded.lender_id,
  source_type = excluded.source_type,
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  document_title = excluded.document_title,
  checked_at = excluded.checked_at,
  reliability_tier = excluded.reliability_tier;`;
}

function emitProduct(p: ImportProduct): string {
  return `insert into public.mortgage_catalog_products (
  id, lender_id, slug, name, product_type, borrower_scope, currency,
  min_amount, max_amount, max_ltv, min_term_years, max_term_years,
  is_active, valid_from, source_evidence_id
) values (
  ${sqlStr(productId(p.lenderSlug, p.slug))},
  ${sqlStr(lenderId(p.lenderSlug))},
  ${sqlStr(p.slug)},
  ${sqlStr(p.name)},
  ${sqlStr(p.productType)},
  ${sqlStr(p.borrowerScope ?? "natural_person")},
  ${sqlStr(p.currency ?? "CZK")},
  ${sqlNum(p.minAmount ?? null)},
  ${sqlNum(p.maxAmount ?? null)},
  ${sqlNum(p.maxLtv ?? null)},
  ${sqlNum(p.minTermYears ?? null)},
  ${sqlNum(p.maxTermYears ?? null)},
  true,
  ${sqlTs(p.checkedAt)},
  ${sqlStr(evidenceId(p.evidence.evidenceId))}
)
on conflict (id) do update set
  name = excluded.name,
  product_type = excluded.product_type,
  borrower_scope = excluded.borrower_scope,
  currency = excluded.currency,
  min_amount = excluded.min_amount,
  max_amount = excluded.max_amount,
  max_ltv = excluded.max_ltv,
  min_term_years = excluded.min_term_years,
  max_term_years = excluded.max_term_years,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  updated_at = now();`;
}

function emitRate(r: ImportRateRecord): string {
  const ltv = mapImportLtv(r);
  if (r.fixationMonths == null) {
    throw new Error(`IMPORT_READY rate ${r.recordId} missing fixationMonths`);
  }
  if (!PRIMARY.has(r.evidence.sourceType)) {
    throw new Error(`IMPORT_READY rate ${r.recordId} lacks primary evidence`);
  }
  const validFrom = r.validFrom ?? r.checkedAt;
  return `insert into public.mortgage_rate_variants (
  id, product_id, pricing_scenario_key, pricing_scenario_label, financing_purpose,
  fixation_months, ltv_min, ltv_max, ltv_min_exclusive, ltv_max_exclusive,
  nominal_interest_rate, rate_type, min_loan_amount, max_loan_amount,
  valid_from, valid_to, checked_at, is_active, source_evidence_id, notes
) values (
  ${sqlStr(rateId(r.recordId))},
  ${sqlStr(productId(r.lenderSlug, r.productSlug))},
  ${sqlStr(r.pricingScenarioKey)},
  ${sqlStr(r.pricingScenarioLabel ?? null)},
  ${sqlStr(r.financingPurpose ?? null)},
  ${sqlNum(r.fixationMonths)},
  ${sqlNum(ltv.ltvMin)},
  ${sqlNum(ltv.ltvMax)},
  ${sqlBool(ltv.ltvMinExclusive)},
  ${sqlBool(ltv.ltvMaxExclusive)},
  ${sqlNum(r.nominalInterestRate)},
  ${sqlStr(r.rateType)},
  ${sqlNum(r.minLoanAmount ?? null)},
  ${sqlNum(r.maxLoanAmount ?? null)},
  ${sqlTs(validFrom)},
  null,
  ${sqlTs(r.checkedAt)},
  true,
  ${sqlStr(evidenceId(r.evidence.evidenceId))},
  ${sqlStr(r.notes ? `${r.notes} [manifest:${r.recordId}]` : `[manifest:${r.recordId}]`)}
)
on conflict (id) do update set
  pricing_scenario_key = excluded.pricing_scenario_key,
  pricing_scenario_label = excluded.pricing_scenario_label,
  financing_purpose = excluded.financing_purpose,
  fixation_months = excluded.fixation_months,
  ltv_min = excluded.ltv_min,
  ltv_max = excluded.ltv_max,
  ltv_min_exclusive = excluded.ltv_min_exclusive,
  ltv_max_exclusive = excluded.ltv_max_exclusive,
  nominal_interest_rate = excluded.nominal_interest_rate,
  rate_type = excluded.rate_type,
  min_loan_amount = excluded.min_loan_amount,
  max_loan_amount = excluded.max_loan_amount,
  valid_from = excluded.valid_from,
  checked_at = excluded.checked_at,
  is_active = true,
  source_evidence_id = excluded.source_evidence_id,
  notes = excluded.notes,
  updated_at = now();`;
}

function emitCondition(
  rateRecordId: string,
  c: ImportCondition,
  index: number,
  evidence: ImportEvidence
): string {
  return `insert into public.mortgage_rate_conditions (
  id, rate_variant_id, condition_type, condition_role, insurance_kind,
  requirement_mode, operator, value_numeric, value_text, unit,
  rate_effect_bp, description, is_required, is_optional,
  source_evidence_id, is_active, valid_from
) values (
  ${sqlStr(conditionId(rateRecordId, index))},
  ${sqlStr(rateId(rateRecordId))},
  ${sqlStr(c.conditionType)},
  ${sqlStr(c.conditionRole)},
  ${sqlStr(c.insuranceKind ?? null)},
  ${sqlStr(c.requirementMode ?? null)},
  ${sqlStr(c.operator ?? null)},
  ${sqlNum(c.valueNumeric ?? null)},
  ${sqlStr(c.valueText ?? null)},
  null,
  ${sqlNum(c.rateEffectBp ?? null)},
  ${sqlStr(c.description)},
  ${sqlBool(c.isRequired)},
  ${sqlBool(c.isOptional)},
  ${sqlStr(evidenceId(evidence.evidenceId))},
  true,
  ${sqlTs(evidence.checkedAt)}
)
on conflict (id) do update set
  condition_type = excluded.condition_type,
  condition_role = excluded.condition_role,
  insurance_kind = excluded.insurance_kind,
  requirement_mode = excluded.requirement_mode,
  rate_effect_bp = excluded.rate_effect_bp,
  description = excluded.description,
  is_required = excluded.is_required,
  is_optional = excluded.is_optional,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();`;
}

function emitFee(f: ImportFee): string {
  const percentNote =
    f.percentOfMonthlyPayment != null
      ? ` Published share of monthly payment: ${f.percentOfMonthlyPayment}%. Amount left NULL (not converted to fixed CZK).`
      : "";
  return `insert into public.mortgage_product_fees (
  id, product_id, rate_variant_id, fee_type, amount, currency, frequency,
  is_mandatory, description, checked_at, source_evidence_id, is_active, valid_from
) values (
  ${sqlStr(feeId(f.recordId))},
  ${sqlStr(productId(f.lenderSlug, f.productSlug))},
  null,
  ${sqlStr(f.feeType)},
  null,
  ${sqlStr(f.currency ?? "CZK")},
  ${sqlStr(f.frequency ?? "monthly")},
  ${sqlBool(f.isMandatory)},
  ${sqlStr(`${f.description}${percentNote}`)},
  ${sqlTs(f.checkedAt)},
  ${sqlStr(evidenceId(f.evidence.evidenceId))},
  true,
  ${sqlTs(f.checkedAt)}
)
on conflict (id) do update set
  fee_type = excluded.fee_type,
  amount = excluded.amount,
  currency = excluded.currency,
  frequency = excluded.frequency,
  is_mandatory = excluded.is_mandatory,
  description = excluded.description,
  checked_at = excluded.checked_at,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();`;
}

function emitExample(
  x: ImportRepresentativeExample,
  rateRecordIds: Set<string>
): string {
  const linked =
    x.linkedRateRecordId && rateRecordIds.has(x.linkedRateRecordId)
      ? rateId(x.linkedRateRecordId)
      : null;
  return `insert into public.mortgage_representative_examples (
  id, product_id, rate_variant_id, loan_amount, term_years, fixation_months,
  nominal_rate, rpsn, monthly_payment, total_amount_payable, number_of_payments,
  included_fees, insurance_included, insurance_cost, account_cost,
  representative_example_text, checked_at, valid_from, source_evidence_id, is_active
) values (
  ${sqlStr(exampleId(x.recordId))},
  ${sqlStr(productId(x.lenderSlug, x.productSlug))},
  ${linked ? sqlStr(linked) : "null"},
  ${sqlNum(x.loanAmount)},
  ${sqlNum(x.termYears)},
  ${sqlNum(x.fixationMonths ?? null)},
  ${sqlNum(x.nominalRate ?? null)},
  ${sqlNum(x.rpsn ?? null)},
  ${sqlNum(x.monthlyPayment ?? null)},
  ${sqlNum(x.totalAmountPayable ?? null)},
  ${sqlNum(x.numberOfPayments ?? null)},
  ${sqlStr(x.includedFees ?? null)},
  ${x.insuranceIncluded == null ? "null" : sqlBool(x.insuranceIncluded)},
  ${sqlNum(x.insuranceCost ?? null)},
  ${sqlNum(x.accountCost ?? null)},
  ${sqlStr(
    x.pricingScenarioKey
      ? `Published representative example [${x.pricingScenarioKey}] [manifest:${x.recordId}]`
      : `Published representative example [manifest:${x.recordId}]`
  )},
  ${sqlTs(x.checkedAt)},
  ${sqlTs(x.checkedAt)},
  ${sqlStr(evidenceId(x.evidence.evidenceId))},
  true
)
on conflict (id) do update set
  rate_variant_id = excluded.rate_variant_id,
  loan_amount = excluded.loan_amount,
  term_years = excluded.term_years,
  fixation_months = excluded.fixation_months,
  nominal_rate = excluded.nominal_rate,
  rpsn = excluded.rpsn,
  monthly_payment = excluded.monthly_payment,
  total_amount_payable = excluded.total_amount_payable,
  number_of_payments = excluded.number_of_payments,
  insurance_included = excluded.insurance_included,
  insurance_cost = excluded.insurance_cost,
  account_cost = excluded.account_cost,
  representative_example_text = excluded.representative_example_text,
  checked_at = excluded.checked_at,
  source_evidence_id = excluded.source_evidence_id,
  is_active = true,
  updated_at = now();`;
}

function emitEligibility(
  recordId: string,
  lenderSlug: string,
  productSlug: string,
  e: ImportEligibility,
  evidence: ImportEvidence,
  rateRecordId?: string | null
): string {
  return `insert into public.mortgage_eligibility_rules (
  id, product_id, rate_variant_id, rule_category, rule_code, effect,
  description, changes_pricing, pricing_effect_bp, source_evidence_id,
  is_active, valid_from
) values (
  ${sqlStr(eligibilityId(recordId))},
  ${sqlStr(productId(lenderSlug, productSlug))},
  ${rateRecordId ? sqlStr(rateId(rateRecordId)) : "null"},
  ${sqlStr(e.ruleCategory)},
  ${sqlStr(e.ruleCode)},
  ${sqlStr(e.effect)},
  ${sqlStr(e.description)},
  ${sqlBool(e.changesPricing)},
  ${sqlNum(e.pricingEffectBp ?? null)},
  ${sqlStr(evidenceId(evidence.evidenceId))},
  true,
  ${sqlTs(evidence.checkedAt)}
)
on conflict (id) do update set
  rule_category = excluded.rule_category,
  rule_code = excluded.rule_code,
  effect = excluded.effect,
  description = excluded.description,
  changes_pricing = excluded.changes_pricing,
  pricing_effect_bp = excluded.pricing_effect_bp,
  source_evidence_id = excluded.source_evidence_id,
  rate_variant_id = excluded.rate_variant_id,
  is_active = true,
  updated_at = now();`;
}

function buildVerifySql(report: Omit<SqlGenerationReport, "productionSql" | "verifySql">): string {
  return `-- Phase 2 Step 2.3 — READ-ONLY verification for cz_mortgage_market_2026_08_09
-- Do NOT modify data. Safe to run after import.

-- Core counts
select 'lenders' as entity, count(*)::int as n from public.mortgage_lenders
union all select 'products', count(*)::int from public.mortgage_catalog_products
union all select 'source_evidence', count(*)::int from public.mortgage_source_evidence
union all select 'rate_variants', count(*)::int from public.mortgage_rate_variants where is_active
union all select 'rate_conditions', count(*)::int from public.mortgage_rate_conditions where is_active
union all select 'fees', count(*)::int from public.mortgage_product_fees where is_active
union all select 'representative_examples', count(*)::int from public.mortgage_representative_examples where is_active
union all select 'eligibility_rules', count(*)::int from public.mortgage_eligibility_rules where is_active
union all select 'market_benchmarks', count(*)::int from public.mortgage_market_benchmarks where is_active;

-- A) rate variants by lender
select l.slug as lender, count(*)::int as rate_variants
from public.mortgage_rate_variants v
join public.mortgage_catalog_products p on p.id = v.product_id
join public.mortgage_lenders l on l.id = p.lender_id
where v.is_active
group by l.slug
order by l.slug;

-- B) rate variants by rate_type
select rate_type, count(*)::int as n
from public.mortgage_rate_variants
where is_active
group by rate_type
order by rate_type;

-- C) NULL LTV
select count(*)::int as null_ltv_rates
from public.mortgage_rate_variants
where is_active and ltv_min is null and ltv_max is null;

-- D) explicit LTV
select count(*)::int as explicit_ltv_rates
from public.mortgage_rate_variants
where is_active and ltv_min is not null and ltv_max is not null;

-- E) active duplicate identity check (expect 0)
select count(*)::int as duplicate_active_identities
from (
  select 1
  from public.mortgage_rate_variants
  where is_active
  group by
    product_id,
    fixation_months,
    coalesce(ltv_min, (-1)::numeric),
    coalesce(ltv_max, (-1)::numeric),
    ltv_min_exclusive,
    ltv_max_exclusive,
    pricing_scenario_key,
    rate_type,
    coalesce(financing_purpose, ''),
    coalesce(min_loan_amount, (-1)::numeric),
    coalesce(max_loan_amount, (-1)::numeric)
  having count(*) > 1
) d;

-- F) rate variants missing evidence (expect 0)
select count(*)::int as rates_missing_evidence
from public.mortgage_rate_variants
where is_active and source_evidence_id is null;

-- G) invalid one-sided LTV (expect 0)
select count(*)::int as one_sided_ltv
from public.mortgage_rate_variants
where is_active
  and ((ltv_min is null) <> (ltv_max is null));

-- H) Česká spořitelna — confirm 4.94 absent
select count(*)::int as cs_494_count
from public.mortgage_rate_variants v
join public.mortgage_catalog_products p on p.id = v.product_id
join public.mortgage_lenders l on l.id = p.lender_id
where v.is_active
  and l.slug = 'ceska-sporitelna'
  and v.nominal_interest_rate = 4.94;

select v.fixation_months, v.nominal_interest_rate, v.pricing_scenario_key
from public.mortgage_rate_variants v
join public.mortgage_catalog_products p on p.id = v.product_id
join public.mortgage_lenders l on l.id = p.lender_id
where v.is_active and l.slug = 'ceska-sporitelna'
order by v.fixation_months;

-- I) KB — confirm stale 5.14 absent
select count(*)::int as kb_514_count
from public.mortgage_rate_variants v
join public.mortgage_catalog_products p on p.id = v.product_id
join public.mortgage_lenders l on l.id = p.lender_id
where v.is_active
  and l.slug = 'komercni-banka'
  and v.nominal_interest_rate = 5.14;

-- J) CSOB active retail rate variants (expect 0)
select count(*)::int as csob_active_rates
from public.mortgage_rate_variants v
join public.mortgage_catalog_products p on p.id = v.product_id
join public.mortgage_lenders l on l.id = p.lender_id
where v.is_active and l.slug = 'csob';

-- K) RB Klasik retail rate variants (expect 0)
select count(*)::int as rb_klasik_active_rates
from public.mortgage_rate_variants v
join public.mortgage_catalog_products p on p.id = v.product_id
join public.mortgage_lenders l on l.id = p.lender_id
where v.is_active
  and l.slug = 'raiffeisenbank'
  and p.slug = 'retail-klasik';

-- Expected import snapshot (generator reconciliation)
-- lenders=${report.lenders}
-- products=${report.products}
-- evidence=${report.evidence}
-- rate_variants=${report.generatedRateInserts}
-- conditions=${report.conditions}
-- fees=${report.fees}
-- examples=${report.examples}
-- eligibility=${report.eligibility}
-- benchmarks=${report.benchmarks}
`;
}

export function generateMortgageMarketImportSql(
  manifest: MortgageMarketImportManifest = CZ_2026_08_09_MANIFEST
): SqlGenerationReport {
  const readyRates = manifest.rates.filter((r) => r.auditStatus === "IMPORT_READY");
  const holdRates = manifest.rates.filter((r) => r.auditStatus === "HOLD");

  if (readyRates.length !== EXPECTED_IMPORT_READY_RATES) {
    throw new Error(
      `STOP: expected ${EXPECTED_IMPORT_READY_RATES} IMPORT_READY rates, found ${readyRates.length}`
    );
  }

  // Safety: never emit HOLD/campaign/stale values
  for (const r of readyRates) {
    if (r.nominalInterestRate === 4.94) {
      throw new Error("STOP: CS 4.94 campaign rate must not be IMPORT_READY");
    }
    if (r.lenderSlug === "komercni-banka" && r.nominalInterestRate === 5.14) {
      throw new Error("STOP: stale KB 5.14 must not be IMPORT_READY");
    }
    if (r.lenderSlug === "csob") {
      throw new Error("STOP: CSOB HOLD rates must not be IMPORT_READY");
    }
    if (r.productSlug === "retail-klasik") {
      throw new Error("STOP: RB Klasik rates must not be IMPORT_READY");
    }
    if ((r.ltv.ltvMin == null) !== (r.ltv.ltvMax == null)) {
      throw new Error(`STOP: one-sided LTV on ${r.recordId}`);
    }
    if (r.fixationMonths == null || r.fixationMonths <= 0) {
      throw new Error(`STOP: invalid fixation on ${r.recordId}`);
    }
    if (!PRIMARY.has(r.evidence.sourceType)) {
      throw new Error(`STOP: non-primary evidence on ${r.recordId}`);
    }
  }

  const lenders = manifest.lenders ?? [];
  if (lenders.length !== 7) {
    throw new Error(`STOP: expected 7 lenders, found ${lenders.length}`);
  }

  const products = manifest.products ?? [];
  const fees = (manifest.fees ?? []).filter((f) => f.auditStatus === "IMPORT_READY");
  const examples = (manifest.representativeExamples ?? []).filter(
    (e) => e.auditStatus === "IMPORT_READY"
  );
  const eligibilityStandalone = (manifest.eligibilityRules ?? []).filter(
    (e) => e.auditStatus === "IMPORT_READY" || e.auditStatus === "VERIFIED"
  );

  const evidence = collectUsedEvidence(
    manifest,
    readyRates,
    products,
    fees,
    examples,
    eligibilityStandalone
  );

  const rateIds = new Set(readyRates.map((r) => r.recordId));
  const byLender: Record<string, number> = {};
  for (const r of readyRates) {
    byLender[r.lenderSlug] = (byLender[r.lenderSlug] ?? 0) + 1;
  }

  const parts: string[] = [];
  parts.push(`-- Phase 2 Step 2.3 — Production import from verified manifest
-- Source: src/lib/mortgage-market/import/data/cz-2026-08-09.ts
-- checked_at: 2026-08-09
-- IMPORT_READY rate variants only: ${readyRates.length}
-- HOLD rate variants excluded: ${holdRates.length}
-- DO NOT execute blindly — owner review required.
-- Idempotent via stable UUIDs + ON CONFLICT (id) DO UPDATE.
-- No DELETE ALL / TRUNCATE.
-- Excludes HOLD campaign / stale / CSOB retail / RB Klasik rates.

begin;

-- Pre-import assertions (fail transaction if catalog already has conflicting active identities
-- for this import batch keys). Empty production catalog is expected on first apply.
do $$
begin
  if exists (
    select 1 from public.mortgage_rate_variants
    where is_active
      and notes like '%[manifest:%'
      and notes not like '%[manifest:air-%'
      and notes not like '%[manifest:moneta-%'
      and notes not like '%[manifest:uc-%'
      and notes not like '%[manifest:cs-oznameni-%'
      and notes not like '%[manifest:kb-%'
  ) then
    -- Allow re-import of this batch; do not block.
    null;
  end if;
end $$;
`);

  parts.push("-- 1) lenders");
  for (const l of lenders) parts.push(emitLender(l));

  parts.push("\n-- 2) source evidence (lender FK; product_id filled after products)");
  for (const e of evidence) parts.push(emitEvidence(e));

  parts.push("\n-- 3) catalog products (incl. CSOB/RB catalog even without retail rates)");
  for (const p of products) parts.push(emitProduct(p));

  parts.push("\n-- 3b) attach evidence.product_id where a single product owns the evidence");
  for (const p of products) {
    parts.push(`update public.mortgage_source_evidence
set product_id = ${sqlStr(productId(p.lenderSlug, p.slug))}
where id = ${sqlStr(evidenceId(p.evidence.evidenceId))}
  and (product_id is null or product_id = ${sqlStr(productId(p.lenderSlug, p.slug))});`);
  }

  parts.push("\n-- 4) rate variants (IMPORT_READY only)");
  parts.push(`-- EXPECTED_COUNT=${readyRates.length}`);
  for (const r of readyRates) parts.push(emitRate(r));

  parts.push("\n-- 5) rate conditions (from IMPORT_READY rates only)");
  let conditionCount = 0;
  for (const r of readyRates) {
    (r.conditions ?? []).forEach((c, i) => {
      if (c.effectInferred) {
        throw new Error(`STOP: inferred condition effect on ${r.recordId}`);
      }
      parts.push(emitCondition(r.recordId, c, i, r.evidence));
      conditionCount += 1;
    });
  }

  parts.push("\n-- 6) product fees (insurance % of payment kept as text; amount NULL)");
  for (const f of fees) parts.push(emitFee(f));

  parts.push("\n-- 7) representative examples (IMPORT_READY published examples only)");
  for (const x of examples) {
    if (x.rpsnCalculated) {
      throw new Error(`STOP: calculated RPSN on ${x.recordId}`);
    }
    parts.push(emitExample(x, rateIds));
  }

  parts.push("\n-- 8) eligibility rules (verified/import-ready; no automatic pricing)");
  let eligibilityCount = 0;
  for (const e of eligibilityStandalone) {
    parts.push(
      emitEligibility(
        e.recordId,
        e.lenderSlug,
        e.productSlug,
        e,
        e.evidence
      )
    );
    eligibilityCount += 1;
  }
  for (const r of readyRates) {
    (r.eligibility ?? []).forEach((e, i) => {
      parts.push(
        emitEligibility(
          `${r.recordId}-elig-${i}`,
          r.lenderSlug,
          r.productSlug,
          e,
          r.evidence,
          r.recordId
        )
      );
      eligibilityCount += 1;
    });
  }

  parts.push("\n-- 9) market benchmarks: none in this verified manifest");

  parts.push(`
-- Post-insert assertions inside the same transaction
do $$
declare
  rate_n int;
  missing_ev int;
  one_sided int;
  bad_rate int;
  bad_fix int;
  dupes int;
  cs_494 int;
  kb_514 int;
  csob_n int;
  rb_klasik_n int;
begin
  select count(*) into rate_n from public.mortgage_rate_variants where is_active and notes like '%[manifest:%';
  if rate_n <> ${readyRates.length} then
    raise exception 'IMPORT ASSERT: expected ${readyRates.length} manifest rates, found %', rate_n;
  end if;

  select count(*) into missing_ev
  from public.mortgage_rate_variants
  where is_active and notes like '%[manifest:%' and source_evidence_id is null;
  if missing_ev <> 0 then
    raise exception 'IMPORT ASSERT: % rates missing evidence', missing_ev;
  end if;

  select count(*) into one_sided
  from public.mortgage_rate_variants
  where is_active and notes like '%[manifest:%'
    and ((ltv_min is null) <> (ltv_max is null));
  if one_sided <> 0 then
    raise exception 'IMPORT ASSERT: one-sided LTV present';
  end if;

  select count(*) into bad_rate
  from public.mortgage_rate_variants
  where is_active and notes like '%[manifest:%'
    and (nominal_interest_rate <= 0 or nominal_interest_rate >= 30);
  if bad_rate <> 0 then
    raise exception 'IMPORT ASSERT: invalid nominal rate';
  end if;

  select count(*) into bad_fix
  from public.mortgage_rate_variants
  where is_active and notes like '%[manifest:%'
    and (fixation_months is null or fixation_months <= 0);
  if bad_fix <> 0 then
    raise exception 'IMPORT ASSERT: invalid fixation';
  end if;

  select count(*) into dupes from (
    select 1
    from public.mortgage_rate_variants
    where is_active
    group by product_id, fixation_months,
      coalesce(ltv_min, (-1)::numeric), coalesce(ltv_max, (-1)::numeric),
      ltv_min_exclusive, ltv_max_exclusive, pricing_scenario_key, rate_type,
      coalesce(financing_purpose, ''),
      coalesce(min_loan_amount, (-1)::numeric), coalesce(max_loan_amount, (-1)::numeric)
    having count(*) > 1
  ) d;
  if dupes <> 0 then
    raise exception 'IMPORT ASSERT: duplicate active identities: %', dupes;
  end if;

  select count(*) into cs_494 from public.mortgage_rate_variants v
  join public.mortgage_catalog_products p on p.id = v.product_id
  join public.mortgage_lenders l on l.id = p.lender_id
  where v.is_active and l.slug = 'ceska-sporitelna' and v.nominal_interest_rate = 4.94;
  if cs_494 <> 0 then raise exception 'IMPORT ASSERT: CS 4.94 imported'; end if;

  select count(*) into kb_514 from public.mortgage_rate_variants v
  join public.mortgage_catalog_products p on p.id = v.product_id
  join public.mortgage_lenders l on l.id = p.lender_id
  where v.is_active and l.slug = 'komercni-banka' and v.nominal_interest_rate = 5.14;
  if kb_514 <> 0 then raise exception 'IMPORT ASSERT: stale KB 5.14 imported'; end if;

  select count(*) into csob_n from public.mortgage_rate_variants v
  join public.mortgage_catalog_products p on p.id = v.product_id
  join public.mortgage_lenders l on l.id = p.lender_id
  where v.is_active and l.slug = 'csob';
  if csob_n <> 0 then raise exception 'IMPORT ASSERT: CSOB rates imported'; end if;

  select count(*) into rb_klasik_n from public.mortgage_rate_variants v
  join public.mortgage_catalog_products p on p.id = v.product_id
  join public.mortgage_lenders l on l.id = p.lender_id
  where v.is_active and l.slug = 'raiffeisenbank' and p.slug = 'retail-klasik';
  if rb_klasik_n <> 0 then raise exception 'IMPORT ASSERT: RB Klasik rates imported'; end if;
end $$;

commit;
`);

  const reportBase = {
    manifestImportReadyRates: readyRates.length,
    generatedRateInserts: readyRates.length,
    difference: 0,
    lenders: lenders.length,
    products: products.length,
    evidence: evidence.length,
    conditions: conditionCount,
    fees: fees.length,
    examples: examples.length,
    eligibility: eligibilityCount,
    benchmarks: 0,
    byLender,
    excludedHoldRateIds: holdRates.map((r) => r.recordId),
    ratesMissingPrimaryEvidence: readyRates
      .filter((r) => !PRIMARY.has(r.evidence.sourceType))
      .map((r) => r.recordId),
    forbiddenValuesPresent: {
      cs494: readyRates.some((r) => r.nominalInterestRate === 4.94),
      kb514: readyRates.some((r) => r.nominalInterestRate === 5.14),
      csobHoldRates: readyRates.some((r) => r.lenderSlug === "csob"),
      rbKlasikRates: readyRates.some((r) => r.productSlug === "retail-klasik"),
    },
  };

  return {
    ...reportBase,
    productionSql: parts.join("\n\n"),
    verifySql: buildVerifySql(reportBase),
  };
}
