/**
 * Normalized CZ mortgage market model (Phase 2 Step 1.3).
 * Not wired into production UI.
 */

export {
  applyPublishedRateEffects,
  assertValidLtvBounds,
  assertValidRateType,
  eligibilityAffectsRate,
  findDuplicateActiveVariantIdentities,
  historyCanCoexist,
  isForbiddenRateTypeLabel,
  isLtvUnspecified,
  isMarketBenchmarkNotLenderRate,
  LTV_UNSPECIFIED_IDENTITY_SENTINEL,
  MORTGAGE_MARKET_RLS_POLICY,
  productMaxLtvMustNotBecomeRateLtv,
  RATE_VARIANT_ACTIVE_IDENTITY_FIELDS,
  representativeExampleDiffersFromNominal,
  variantMatchesLtv,
} from "@/lib/mortgage-market/domain-rules";
export {
  CZ_2026_08_09_MANIFEST,
  CZ_MANIFEST_CHECKED_AT,
  isOneSidedLtvRejected,
  mapImportLtvToStorage,
  summarizeMortgageMarketImport,
  validateImportRateRecord,
  validateImportRepresentativeExample,
  validateMortgageMarketImport,
} from "@/lib/mortgage-market/import";
export type {
  ImportAuditStatus,
  ImportAuditSummary,
  ImportRateRecord,
  MortgageMarketImportManifest,
} from "@/lib/mortgage-market/import";
export {
  planRateVariantSupersede,
  type SupersedeRateVariantPlan,
} from "@/lib/mortgage-market/history";
export {
  getEligibleMortgageProducts,
  getMarketBenchmark,
  getMortgageProducts,
  getRateVariants,
  getRepresentativeExamples,
  type GetEligibleProductsQuery,
  type GetMortgageProductsQuery,
  type GetRateVariantsQuery,
} from "@/lib/mortgage-market/service";
export {
  getCatalogRepresentativeExamples,
  getMortgageOffers,
  type GetMortgageOffersQuery,
  type GetMortgageOffersResult,
  type MortgageMarketCatalog,
  type MortgageOffer,
} from "@/lib/mortgage-market/offers";
export {
  catalogFromImportManifest,
  getCz20260809Catalog,
} from "@/lib/mortgage-market/catalog-from-manifest";
export {
  groupOffersByLenderProduct,
  isInsuranceScenarioPair,
} from "@/lib/mortgage-market/group-offers";
export {
  BANK_RATE_PAYMENT_DISCLAIMER,
  computeOrientacniBankMonthlyPayment,
  formatOrientacniBankMonthlyPaymentLine,
  resolveBankRatePaymentDisplay,
  type BankRatePaymentDisplay,
  type BankRatePaymentParams,
} from "@/lib/mortgage-market/bank-rate-monthly-payment";
export {
  evaluatePublicRateDisplay,
  isPubliclyListableMortgageOffer,
  orientacniSazbaPrefix,
  PUBLIC_RATE_VERIFYING_MESSAGE,
} from "@/lib/mortgage-market/public-rate-display";
export {
  formatRatePercentCs,
  ltvScopeLabelCs,
  publicFreshnessLabel,
  scenarioLabelCs,
} from "@/lib/mortgage-market/public-labels";
export * from "@/lib/mortgage-market/types";
