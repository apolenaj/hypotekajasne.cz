/**
 * Phase 2 Step 1.3 — normalized CZ mortgage market domain types.
 * Parallel to scrape pipeline `mortgage_products` and simple `mortgage_rates`.
 * Not wired into production calculators/UI yet.
 */

export const MORTGAGE_PRODUCT_TYPES = [
  "residential_purchase",
  "residential_refinance",
  "investment",
  "american",
  "business_secured",
  "other",
] as const;
export type MortgageProductType = (typeof MORTGAGE_PRODUCT_TYPES)[number];

/** Extensible financing purposes (free text in DB; these are common values). */
export const FINANCING_PURPOSES = [
  "purchase",
  "construction",
  "refinance",
  "own_housing",
  "investment",
  "non_purpose",
  "american",
  "business",
] as const;
export type FinancingPurpose = (typeof FINANCING_PURPOSES)[number] | string;

/** Lender product rate kinds only — market_reference lives in benchmarks. */
export const MORTGAGE_RATE_TYPES = [
  "advertised_from",
  "standard",
  "representative",
] as const;
export type MortgageMarketRateType = (typeof MORTGAGE_RATE_TYPES)[number];

export const FORBIDDEN_RATE_TYPE_LABELS = [
  "guaranteed",
  "approved",
  "personalized_offer",
  "offer",
  "best",
  "market_reference",
] as const;

export const RATE_CONDITION_ROLES = [
  "required",
  "optional",
  "qualifying",
  "published_discount",
  "published_surcharge",
] as const;
export type RateConditionRole = (typeof RATE_CONDITION_ROLES)[number];

export const INSURANCE_KINDS = [
  "none",
  "repayment",
  "life",
  "property",
] as const;
export type InsuranceKind = (typeof INSURANCE_KINDS)[number];

export const INSURANCE_REQUIREMENT_MODES = [
  "mandatory_for_product",
  "mandatory_for_rate",
  "optional",
  "required_for_discount",
  "not_applicable",
] as const;
export type InsuranceRequirementMode =
  (typeof INSURANCE_REQUIREMENT_MODES)[number];

export const RATE_CONDITION_TYPES = [
  "no_insurance",
  "repayment_insurance",
  "repayment_insurance_required",
  "repayment_insurance_discount",
  "life_insurance",
  "life_insurance_required",
  "property_insurance",
  "property_insurance_required",
  "active_account_required",
  "income_domiciliation_required",
  "salary_account_required",
  "green_property_required",
  "PENB_class_requirement",
  "minimum_loan_amount",
  "maximum_loan_amount",
  "campaign",
  "other",
] as const;
export type RateConditionType = (typeof RATE_CONDITION_TYPES)[number];

export const ELIGIBILITY_CATEGORIES = [
  "applicant",
  "residence_nationality",
  "income",
  "purpose",
  "property",
  "regulatory",
  "other",
] as const;
export type EligibilityCategory = (typeof ELIGIBILITY_CATEGORIES)[number];

export const ELIGIBILITY_EFFECTS = [
  "eligible",
  "not_eligible",
  "manual_assessment",
  "max_ltv",
  "max_amount",
  "required_documentation",
  "block",
  "limit_ltv",
  "limit_amount",
  "allow",
  "require",
  "other",
] as const;
export type EligibilityEffect = (typeof ELIGIBILITY_EFFECTS)[number];

export const SOURCE_EVIDENCE_TYPES = [
  "official_lender_web",
  "official_rate_page",
  "official_lender_pdf",
  "official_tariff",
  "official_terms",
  "CNB",
  "CBA",
  "market_index",
  "other",
] as const;
export type SourceEvidenceType = (typeof SOURCE_EVIDENCE_TYPES)[number];

export type MortgageLender = {
  id: string;
  slug: string;
  name: string;
  countryCode: string;
  websiteUrl?: string | null;
  isActive: boolean;
};

export type MortgageCatalogProduct = {
  id: string;
  lenderId: string;
  slug: string;
  name: string;
  productType: MortgageProductType;
  borrowerScope: string;
  currency: string;
  minAmount?: number | null;
  maxAmount?: number | null;
  maxLtv?: number | null;
  minTermYears?: number | null;
  maxTermYears?: number | null;
  isActive: boolean;
  validFrom: string;
  validTo?: string | null;
  /** Soft optional scrape crosswalk — not a FK. */
  pipelineExternalId?: string | null;
};

export type MortgageRateVariant = {
  id: string;
  productId: string;
  /** Stable free-text scenario identity (not an enum). */
  pricingScenarioKey: string;
  pricingScenarioLabel?: string | null;
  /** Extensible purpose; null = purpose-agnostic published rate. */
  financingPurpose?: string | null;
  /** Null when the source does not publish fixation for this scenario. */
  fixationMonths: number | null;
  /**
   * Explicit LTV band, or both null when the rate source does not publish an
   * LTV pricing segment. Null ≠ applies to all LTV. Never copy product.maxLtv.
   */
  ltvMin: number | null;
  ltvMax: number | null;
  ltvMinExclusive: boolean;
  ltvMaxExclusive: boolean;
  nominalInterestRate: number;
  rateType: MortgageMarketRateType;
  minLoanAmount?: number | null;
  maxLoanAmount?: number | null;
  validFrom: string;
  validTo?: string | null;
  checkedAt: string;
  isActive: boolean;
  sourceEvidenceId?: string | null;
};

export type MortgageRateCondition = {
  id: string;
  rateVariantId: string;
  conditionType: RateConditionType;
  conditionRole: RateConditionRole;
  insuranceKind?: InsuranceKind | null;
  requirementMode?: InsuranceRequirementMode | null;
  operator?: string | null;
  valueNumeric?: number | null;
  valueText?: string | null;
  unit?: string | null;
  /** Only when lender explicitly publishes. Never inferred. */
  rateEffectBp?: number | null;
  description: string;
  isRequired: boolean;
  isOptional: boolean;
  isActive: boolean;
};

export type MortgageProductFee = {
  id: string;
  productId: string;
  rateVariantId?: string | null;
  feeType: string;
  amount?: number | null;
  currency: string;
  frequency: string;
  isMandatory: boolean;
  checkedAt: string;
  isActive: boolean;
};

export type MortgageRepresentativeExample = {
  id: string;
  productId: string;
  rateVariantId?: string | null;
  loanAmount: number;
  termYears: number;
  fixationMonths?: number | null;
  nominalRate?: number | null;
  rpsn?: number | null;
  monthlyPayment?: number | null;
  totalAmountPayable?: number | null;
  includedFees?: string | null;
  insuranceIncluded?: boolean | null;
  insuranceCost?: number | null;
  accountCost?: number | null;
  representativeExampleText?: string | null;
  checkedAt: string;
  isActive: boolean;
  sourceEvidenceId?: string | null;
  validFrom?: string | null;
  validTo?: string | null;
};

export type MortgageEligibilityRule = {
  id: string;
  productId: string;
  rateVariantId?: string | null;
  ruleCategory: EligibilityCategory;
  ruleCode: string;
  effect: EligibilityEffect;
  description: string;
  changesPricing: boolean;
  pricingEffectBp?: number | null;
  isActive: boolean;
};

export type MortgageSourceEvidence = {
  id: string;
  lenderId?: string | null;
  productId?: string | null;
  sourceType: SourceEvidenceType;
  sourceName: string;
  sourceUrl?: string | null;
  checkedAt: string;
  reliabilityTier: string;
};

export type MortgageMarketBenchmark = {
  id: string;
  benchmarkName: string;
  provider: string;
  countryCode: string;
  value: number;
  metricType: string;
  checkedAt: string;
  isActive: boolean;
  /** Discriminator — always market_benchmark, never lender_rate. */
  entityKind: "market_benchmark";
};

/**
 * Fields that identify simultaneous active rate variants
 * (mirrors mortgage_rate_variants_active_identity_uidx).
 */
export type ActiveRateVariantIdentity = {
  productId: string;
  fixationMonths: number | null;
  ltvMin: number | null;
  ltvMax: number | null;
  ltvMinExclusive: boolean;
  ltvMaxExclusive: boolean;
  pricingScenarioKey: string;
  rateType: MortgageMarketRateType;
  financingPurpose?: string | null;
  minLoanAmount?: number | null;
  maxLoanAmount?: number | null;
};
