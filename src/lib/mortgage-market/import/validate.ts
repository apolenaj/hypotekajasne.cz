/**
 * Production import validator for curated mortgage market data.
 * Rejects invented precision. Only IMPORT_READY may become production SQL.
 */

import {
  assertValidLtvBounds,
  assertValidRateType,
  productMaxLtvMustNotBecomeRateLtv,
} from "@/lib/mortgage-market/domain-rules";
import type {
  ImportAuditStatus,
  ImportRateRecord,
  ImportRepresentativeExample,
  ImportValidationIssue,
  ImportValidationResult,
  MortgageMarketImportManifest,
} from "@/lib/mortgage-market/import/types";
import { PRIMARY_LENDER_EVIDENCE_TYPES } from "@/lib/mortgage-market/import/types";

const PRIMARY = new Set<string>(PRIMARY_LENDER_EVIDENCE_TYPES);

function issue(
  recordId: string,
  code: string,
  message: string,
  severity: "error" | "hold" = "hold"
): ImportValidationIssue {
  return { recordId, code, message, severity };
}

function hasNonEmpty(value: string | null | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function isPrimaryLenderEvidence(sourceType: string): boolean {
  return PRIMARY.has(sourceType);
}

function validateEvidence(
  recordId: string,
  evidence: ImportRateRecord["evidence"],
  requirePrimary: boolean
): ImportValidationIssue[] {
  const issues: ImportValidationIssue[] = [];
  if (!hasNonEmpty(evidence.sourceType)) {
    issues.push(issue(recordId, "EVIDENCE_TYPE", "source_type is required"));
  }
  if (!hasNonEmpty(evidence.sourceName)) {
    issues.push(
      issue(recordId, "EVIDENCE_NAME", "source_name/title is required")
    );
  }
  if (!hasNonEmpty(evidence.checkedAt)) {
    issues.push(
      issue(recordId, "EVIDENCE_CHECKED_AT", "evidence.checked_at is required")
    );
  }
  if (requirePrimary && !isPrimaryLenderEvidence(evidence.sourceType)) {
    issues.push(
      issue(
        recordId,
        "EVIDENCE_NOT_PRIMARY",
        "IMPORT_READY lender rates require primary official lender evidence; secondary sources must not silently become primary",
        "hold"
      )
    );
  }
  return issues;
}

function validateLtv(record: ImportRateRecord): ImportValidationIssue[] {
  const issues: ImportValidationIssue[] = [];
  const { ltv } = record;

  if (record.ltvInferredFromProductMax === true) {
    issues.push(
      issue(
        record.recordId,
        "LTV_FROM_PRODUCT_MAX",
        "product max LTV must not invent rate LTV bounds"
      )
    );
  }

  if (
    !productMaxLtvMustNotBecomeRateLtv({
      productMaxLtv: record.productMaxLtv,
      rateLtvMin: ltv.ltvMin,
      rateLtvMax: ltv.ltvMax,
      ltvProvenance: record.ltvInferredFromProductMax
        ? "inferred_from_product_max"
        : ltv.kind === "unspecified"
          ? "unspecified_in_rate_source"
          : "explicit_in_rate_source",
    })
  ) {
    if (!issues.some((i) => i.code === "LTV_FROM_PRODUCT_MAX")) {
      issues.push(
        issue(
          record.recordId,
          "LTV_FROM_PRODUCT_MAX",
          "product max LTV must not invent rate LTV bounds"
        )
      );
    }
  }

  if (ltv.kind === "unspecified") {
    if (ltv.ltvMin != null || ltv.ltvMax != null) {
      issues.push(
        issue(
          record.recordId,
          "LTV_UNSPECIFIED_BOUNDS",
          "unspecified LTV must keep both bounds null"
        )
      );
    }
    if (ltv.provenance !== "unspecified_in_rate_source") {
      issues.push(
        issue(
          record.recordId,
          "LTV_PROVENANCE",
          "unspecified LTV requires provenance unspecified_in_rate_source"
        )
      );
    }
    return issues;
  }

  if (!assertValidLtvBounds(ltv.ltvMin, ltv.ltvMax)) {
    issues.push(
      issue(
        record.recordId,
        "LTV_BOUNDS_INVALID",
        "explicit LTV requires both bounds with valid 0–100 range"
      )
    );
  }
  if (ltv.provenance !== "explicit_in_rate_source") {
    issues.push(
      issue(
        record.recordId,
        "LTV_PROVENANCE",
        "explicit LTV requires provenance explicit_in_rate_source"
      )
    );
  }
  return issues;
}

function validateConditions(record: ImportRateRecord): ImportValidationIssue[] {
  const issues: ImportValidationIssue[] = [];
  for (const c of record.conditions ?? []) {
    if (c.effectInferred === true) {
      issues.push(
        issue(
          record.recordId,
          "CONDITION_EFFECT_INFERRED",
          `condition ${c.conditionType}: never invent rate_effect_bp`
        )
      );
    }
    if (
      c.rateEffectBp != null &&
      c.conditionRole !== "published_discount" &&
      c.conditionRole !== "published_surcharge"
    ) {
      issues.push(
        issue(
          record.recordId,
          "CONDITION_EFFECT_ROLE",
          `condition ${c.conditionType}: rate_effect_bp requires published_discount/surcharge role`,
          "hold"
        )
      );
    }
  }
  return issues;
}

function validateEligibility(record: ImportRateRecord): ImportValidationIssue[] {
  const issues: ImportValidationIssue[] = [];
  for (const e of record.eligibility ?? []) {
    if (e.changesPricing === true && e.pricingEffectBp == null) {
      issues.push(
        issue(
          record.recordId,
          "ELIGIBILITY_PRICING_WITHOUT_BP",
          "eligibility pricing impact requires explicitly published pricing_effect_bp"
        )
      );
    }
    if (e.changesPricing === false && e.pricingEffectBp != null) {
      issues.push(
        issue(
          record.recordId,
          "ELIGIBILITY_IMPLICIT_PRICE",
          "eligibility must not carry pricing_effect_bp when changesPricing=false"
        )
      );
    }
  }
  return issues;
}

function validateRateCore(record: ImportRateRecord): ImportValidationIssue[] {
  const issues: ImportValidationIssue[] = [];
  if (!hasNonEmpty(record.lenderSlug)) {
    issues.push(issue(record.recordId, "LENDER", "lender slug is required"));
  }
  if (!hasNonEmpty(record.productSlug)) {
    issues.push(issue(record.recordId, "PRODUCT", "product slug is required"));
  }
  if (
    !Number.isFinite(record.nominalInterestRate) ||
    record.nominalInterestRate <= 0 ||
    record.nominalInterestRate >= 30
  ) {
    issues.push(
      issue(
        record.recordId,
        "NOMINAL_RATE",
        "nominal_interest_rate out of bounds"
      )
    );
  }
  if (!assertValidRateType(record.rateType)) {
    issues.push(
      issue(record.recordId, "RATE_TYPE", "invalid or forbidden rate_type")
    );
  }
  if (!hasNonEmpty(record.pricingScenarioKey)) {
    issues.push(
      issue(record.recordId, "SCENARIO", "pricing_scenario_key is required")
    );
  }
  if (record.auditStatus === "IMPORT_READY") {
    const allowNullFixation =
      record.fixationMonths == null &&
      record.rateType === "advertised_from" &&
      record.ltv.kind === "unspecified" &&
      (record.pricingScenarioKey.includes("product_page_advertised") ||
        record.pricingScenarioKey.includes("advertised_from_conditional"));
    if (
      !allowNullFixation &&
      (record.fixationMonths == null ||
        !Number.isInteger(record.fixationMonths) ||
        record.fixationMonths <= 0)
    ) {
      issues.push(
        issue(
          record.recordId,
          "FIXATION",
          "IMPORT_READY rates require published positive fixation_months"
        )
      );
    }
  } else if (
    record.fixationMonths != null &&
    (!Number.isInteger(record.fixationMonths) || record.fixationMonths <= 0)
  ) {
    issues.push(
      issue(
        record.recordId,
        "FIXATION",
        "fixation_months must be a positive integer when set"
      )
    );
  }
  if (!hasNonEmpty(record.checkedAt)) {
    issues.push(issue(record.recordId, "CHECKED_AT", "checked_at is required"));
  }
  if (
    record.minLoanAmount != null &&
    record.maxLoanAmount != null &&
    record.minLoanAmount > record.maxLoanAmount
  ) {
    issues.push(
      issue(record.recordId, "AMOUNT_BOUNDS", "invalid loan amount bounds")
    );
  }
  return issues;
}

/**
 * Validate a single rate for production import readiness.
 * Claiming IMPORT_READY without passing checks → forced HOLD.
 */
export function validateImportRateRecord(record: ImportRateRecord): {
  issues: ImportValidationIssue[];
  effectiveStatus: ImportAuditStatus;
} {
  const issues: ImportValidationIssue[] = [
    ...validateRateCore(record),
    ...validateLtv(record),
    ...validateConditions(record),
    ...validateEligibility(record),
  ];

  const wantsReady = record.auditStatus === "IMPORT_READY";
  issues.push(
    ...validateEvidence(record.recordId, record.evidence, wantsReady)
  );

  if (wantsReady && issues.length > 0) {
    return { issues, effectiveStatus: "HOLD" };
  }
  return { issues, effectiveStatus: record.auditStatus };
}

export function validateImportRepresentativeExample(
  example: ImportRepresentativeExample
): {
  issues: ImportValidationIssue[];
  effectiveStatus: ImportAuditStatus;
} {
  const issues: ImportValidationIssue[] = [];
  if (!hasNonEmpty(example.lenderSlug) || !hasNonEmpty(example.productSlug)) {
    issues.push(
      issue(
        example.recordId,
        "RPSN_PRODUCT",
        "RPSN example requires lender + product"
      )
    );
  }
  if (!(example.loanAmount > 0) || !(example.termYears > 0)) {
    issues.push(
      issue(
        example.recordId,
        "RPSN_AMOUNT_TERM",
        "RPSN example requires loan amount + term"
      )
    );
  }
  if (!hasNonEmpty(example.checkedAt)) {
    issues.push(
      issue(example.recordId, "RPSN_CHECKED_AT", "checked_at is required")
    );
  }
  issues.push(
    ...validateEvidence(
      example.recordId,
      example.evidence,
      example.auditStatus === "IMPORT_READY"
    )
  );

  if (example.rpsnCalculated === true) {
    issues.push(
      issue(
        example.recordId,
        "RPSN_CALCULATED",
        "RPSN must never be calculated during import; leave null if unpublished"
      )
    );
  }

  if (example.auditStatus === "IMPORT_READY") {
    if (example.rpsn == null || !Number.isFinite(example.rpsn)) {
      issues.push(
        issue(
          example.recordId,
          "RPSN_MISSING",
          "IMPORT_READY RPSN example requires published RPSN; never invent"
        )
      );
    }
  }

  if (example.auditStatus === "IMPORT_READY" && issues.length > 0) {
    return { issues, effectiveStatus: "HOLD" };
  }
  return { issues, effectiveStatus: example.auditStatus };
}

/**
 * Validate a full import manifest. Only IMPORT_READY records may be emitted
 * to production SQL generators (not implemented here).
 */
export function validateMortgageMarketImport(
  manifest: MortgageMarketImportManifest
): ImportValidationResult {
  const issues: ImportValidationIssue[] = [];
  const importReadyRecordIds: string[] = [];
  const holdRecordIds: string[] = [];

  if (manifest.countryCode !== "CZ") {
    issues.push(
      issue(manifest.manifestId, "COUNTRY", "only CZ imports are supported")
    );
  }

  for (const rate of manifest.rates) {
    const result = validateImportRateRecord(rate);
    issues.push(...result.issues);
    if (result.effectiveStatus === "IMPORT_READY") {
      importReadyRecordIds.push(rate.recordId);
    } else if (
      result.effectiveStatus === "HOLD" ||
      rate.auditStatus === "HOLD"
    ) {
      holdRecordIds.push(rate.recordId);
    }
  }

  for (const example of manifest.representativeExamples ?? []) {
    const result = validateImportRepresentativeExample(example);
    issues.push(...result.issues);
    if (result.effectiveStatus === "IMPORT_READY") {
      importReadyRecordIds.push(example.recordId);
    } else if (
      result.effectiveStatus === "HOLD" ||
      example.auditStatus === "HOLD"
    ) {
      holdRecordIds.push(example.recordId);
    }
  }

  for (const hold of manifest.holdRows ?? []) {
    holdRecordIds.push(hold.recordId);
  }

  return {
    ok: issues.length === 0,
    importReadyRecordIds,
    holdRecordIds: [...new Set(holdRecordIds)],
    issues,
  };
}

/** Readable audit counts for owner review (no SQL generation). */
export function summarizeMortgageMarketImport(
  manifest: MortgageMarketImportManifest
): import("@/lib/mortgage-market/import/types").ImportAuditSummary {
  const validation = validateMortgageMarketImport(manifest);
  let conditionsOnRates = 0;
  for (const rate of manifest.rates) {
    conditionsOnRates += rate.conditions?.length ?? 0;
  }
  for (const product of manifest.products ?? []) {
    conditionsOnRates += product.documentedConditions?.length ?? 0;
  }

  return {
    manifestId: manifest.manifestId,
    checkedAt: manifest.checkedAt ?? "",
    lenders: manifest.lenders?.length ?? 0,
    products: manifest.products?.length ?? 0,
    rateVariants: manifest.rates.length,
    rateVariantsImportReady: manifest.rates.filter(
      (r) =>
        r.auditStatus === "IMPORT_READY" &&
        validation.importReadyRecordIds.includes(r.recordId)
    ).length,
    rateVariantsHold: manifest.rates.filter((r) => r.auditStatus === "HOLD")
      .length,
    conditionsOnRates,
    fees: manifest.fees?.length ?? 0,
    representativeExamples: manifest.representativeExamples?.length ?? 0,
    eligibilityRules: manifest.eligibilityRules?.length ?? 0,
    evidenceRows: manifest.evidence?.length ?? 0,
    holdRows: manifest.holdRows?.length ?? 0,
    importReadyIds: validation.importReadyRecordIds,
    holdIds: validation.holdRecordIds,
    issues: validation.issues,
  };
}

/** Maps a validated import LTV into catalog storage shape. */
export function mapImportLtvToStorage(ltv: ImportRateRecord["ltv"]): {
  ltvMin: number | null;
  ltvMax: number | null;
  ltvMinExclusive: boolean;
  ltvMaxExclusive: boolean;
} {
  if (ltv.kind === "unspecified") {
    return {
      ltvMin: null,
      ltvMax: null,
      ltvMinExclusive: false,
      ltvMaxExclusive: false,
    };
  }
  return {
    ltvMin: ltv.ltvMin,
    ltvMax: ltv.ltvMax,
    ltvMinExclusive: ltv.ltvMinExclusive,
    ltvMaxExclusive: ltv.ltvMaxExclusive,
  };
}

/** True when one-sided LTV bounds must be rejected. */
export function isOneSidedLtvRejected(
  ltvMin: number | null,
  ltvMax: number | null
): boolean {
  return !assertValidLtvBounds(ltvMin, ltvMax);
}
