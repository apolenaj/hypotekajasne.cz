/**
 * Strict structured format for Czech bank audit / import data.
 * Preparation only — production SQL is generated later from IMPORT_READY rows.
 */

import type {
  InsuranceKind,
  InsuranceRequirementMode,
  MortgageMarketRateType,
  MortgageProductType,
  RateConditionRole,
  RateConditionType,
  SourceEvidenceType,
} from "@/lib/mortgage-market/types";

export const IMPORT_AUDIT_STATUSES = [
  "FOUND",
  "VERIFIED",
  "STRUCTURED",
  "IMPORT_READY",
  "HOLD",
] as const;
export type ImportAuditStatus = (typeof IMPORT_AUDIT_STATUSES)[number];

export const PRIMARY_LENDER_EVIDENCE_TYPES = [
  "official_lender_web",
  "official_rate_page",
  "official_lender_pdf",
  "official_tariff",
  "official_terms",
] as const;
export type PrimaryLenderEvidenceType =
  (typeof PRIMARY_LENDER_EVIDENCE_TYPES)[number];

export type ImportLtvProvenance =
  | "explicit_in_rate_source"
  | "unspecified_in_rate_source"
  | "inferred_from_product_max";

export type ImportLtv =
  | {
      kind: "explicit";
      ltvMin: number;
      ltvMax: number;
      ltvMinExclusive: boolean;
      ltvMaxExclusive: boolean;
      provenance: "explicit_in_rate_source";
    }
  | {
      kind: "unspecified";
      /** Must remain null — LTV pricing segment not evidenced. */
      ltvMin: null;
      ltvMax: null;
      provenance: "unspecified_in_rate_source";
    };

export type ImportEvidence = {
  evidenceId: string;
  sourceType: SourceEvidenceType;
  sourceName: string;
  sourceUrl?: string | null;
  documentTitle?: string | null;
  checkedAt: string;
  reliabilityTier?: "primary" | "secondary" | "tertiary" | "unknown";
  lenderSlug?: string | null;
};

export type ImportCondition = {
  conditionType: RateConditionType;
  conditionRole: RateConditionRole;
  description: string;
  insuranceKind?: InsuranceKind | null;
  requirementMode?: InsuranceRequirementMode | null;
  operator?: string | null;
  valueNumeric?: number | null;
  valueText?: string | null;
  /** Only when source explicitly publishes a numeric effect. */
  rateEffectBp?: number | null;
  isRequired: boolean;
  isOptional: boolean;
  /** True if importer invented a numeric discount/surcharge. Forbidden. */
  effectInferred?: boolean;
};

export type ImportEligibility = {
  ruleCategory: string;
  ruleCode: string;
  effect: string;
  description: string;
  /** Must stay false unless source publishes a pricing change. */
  changesPricing: boolean;
  pricingEffectBp?: number | null;
};

export type ImportLender = {
  recordId: string;
  slug: string;
  name: string;
  countryCode: "CZ";
  websiteUrl?: string | null;
  evidence: ImportEvidence;
  checkedAt: string;
  auditStatus: ImportAuditStatus;
  notes?: string;
};

export type ImportProduct = {
  recordId: string;
  lenderSlug: string;
  slug: string;
  name: string;
  productType: MortgageProductType;
  borrowerScope?: string;
  currency?: string;
  minAmount?: number | null;
  maxAmount?: number | null;
  /** Product eligibility max LTV — never copied onto rate LTV. */
  maxLtv?: number | null;
  minTermYears?: number | null;
  maxTermYears?: number | null;
  /** Fixation options when published as product fact, not rate matrix. */
  fixationMonthsAvailable?: number[] | null;
  documentedConditions?: ImportCondition[];
  eligibility?: ImportEligibility[];
  evidence: ImportEvidence;
  checkedAt: string;
  auditStatus: ImportAuditStatus;
  notes?: string;
};

export type ImportFee = {
  recordId: string;
  lenderSlug: string;
  productSlug: string;
  feeType: string;
  amount?: number | null;
  /** e.g. PPI as % of monthly mortgage payment when published that way. */
  percentOfMonthlyPayment?: number | null;
  currency?: string;
  frequency?: string;
  description: string;
  isMandatory: boolean;
  evidence: ImportEvidence;
  checkedAt: string;
  auditStatus: ImportAuditStatus;
};

export type ImportHoldRow = {
  recordId: string;
  lenderSlug: string;
  productSlug?: string | null;
  reason: string;
  auditStatus: "HOLD";
  evidence?: ImportEvidence | null;
  checkedAt: string;
};

export type ImportRateRecord = {
  recordId: string;
  lenderSlug: string;
  productSlug: string;
  financingPurpose?: string | null;
  /**
   * Null when fixation is not published. IMPORT_READY only for
   * advertised_from + unspecified LTV product-page conditional scenarios.
   */
  fixationMonths: number | null;
  nominalInterestRate: number;
  rateType: MortgageMarketRateType;
  pricingScenarioKey: string;
  pricingScenarioLabel?: string | null;
  ltv: ImportLtv;
  minLoanAmount?: number | null;
  maxLoanAmount?: number | null;
  /** Optional product eligibility max — must NOT invent rate LTV. */
  productMaxLtv?: number | null;
  /**
   * Forbidden: rate LTV band was copied/inferred from product.max_ltv.
   * Always causes HOLD.
   */
  ltvInferredFromProductMax?: boolean;
  conditions?: ImportCondition[];
  eligibility?: ImportEligibility[];
  evidence: ImportEvidence;
  checkedAt: string;
  validFrom?: string | null;
  auditStatus: ImportAuditStatus;
  notes?: string;
};

export type ImportRepresentativeExample = {
  recordId: string;
  lenderSlug: string;
  productSlug: string;
  loanAmount: number;
  termYears: number;
  numberOfPayments?: number | null;
  /** Required published RPSN for IMPORT_READY examples. */
  rpsn?: number | null;
  nominalRate?: number | null;
  fixationMonths?: number | null;
  monthlyPayment?: number | null;
  totalAmountPayable?: number | null;
  insuranceIncluded?: boolean | null;
  insuranceCost?: number | null;
  accountCost?: number | null;
  includedFees?: string | null;
  pricingScenarioKey?: string | null;
  /** Only when source clearly ties example to a specific rate variant. */
  linkedRateRecordId?: string | null;
  evidence: ImportEvidence;
  checkedAt: string;
  auditStatus: ImportAuditStatus;
  /** Forbidden: calculated rather than published. */
  rpsnCalculated?: boolean;
};

export type MortgageMarketImportManifest = {
  manifestId: string;
  countryCode: "CZ";
  checkedAt?: string;
  lenders?: ImportLender[];
  products?: ImportProduct[];
  rates: ImportRateRecord[];
  conditionsDocumented?: ImportCondition[];
  fees?: ImportFee[];
  representativeExamples?: ImportRepresentativeExample[];
  eligibilityRules?: Array<
    ImportEligibility & {
      recordId: string;
      lenderSlug: string;
      productSlug: string;
      evidence: ImportEvidence;
      checkedAt: string;
      auditStatus: ImportAuditStatus;
    }
  >;
  evidence?: ImportEvidence[];
  holdRows?: ImportHoldRow[];
};

export type ImportValidationIssue = {
  recordId: string;
  code: string;
  message: string;
  severity: "error" | "hold";
};

export type ImportValidationResult = {
  ok: boolean;
  importReadyRecordIds: string[];
  holdRecordIds: string[];
  issues: ImportValidationIssue[];
};

export type ImportAuditSummary = {
  manifestId: string;
  checkedAt: string;
  lenders: number;
  products: number;
  rateVariants: number;
  rateVariantsImportReady: number;
  rateVariantsHold: number;
  conditionsOnRates: number;
  fees: number;
  representativeExamples: number;
  eligibilityRules: number;
  evidenceRows: number;
  holdRows: number;
  importReadyIds: string[];
  holdIds: string[];
  issues: ImportValidationIssue[];
};
