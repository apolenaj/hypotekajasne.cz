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
  getPartnerOfferCatalog,
} from "@/lib/mortgage-market/catalog-from-manifest";
export {
  PARTNER_OFFER_BANKS,
  PARTNER_OFFER_BANK_SLUGS,
  PARTNER_OFFER_DISCLAIMER_CS,
  PARTNER_OFFER_FLOOR_NOTE_CS,
  PARTNER_OFFER_FRAMING_CS,
  PARTNER_OFFER_INQUIRY_MESSAGE,
  PARTNER_OFFER_PENDING_CARD_COPY,
  PARTNER_OFFER_PUBLIC_FLOOR,
  PUBLIC_RATE_ON_INQUIRY_CS,
  PUBLIC_RATE_PERSONAL_OFFER_ON_INQUIRY_CS,
  PUBLIC_RATE_VERIFY_ON_INQUIRY_CS,
  compareRatesNullable,
  getPartnerOfferBank,
  isPartnerOfferBankSlug,
  isPartnerOfferPublicRate,
  normalizePartnerLenderSlug,
  partnerOfferSortOrder,
} from "@/lib/mortgage-market/partner-offer-banks";
export {
  BANK_LOGO_BOX_PX,
  PARTNER_BANK_LOGO_BY_SLUG,
  getPartnerBankLogoAsset,
  resolvePartnerBankLogoSlug,
} from "@/lib/mortgage-market/bank-logos";
export type {
  BankLogoAsset,
  BankLogoSize,
} from "@/lib/mortgage-market/bank-logos";
export type {
  PartnerOfferBank,
  PartnerOfferBankId,
  PartnerOfferPendingCardCopy,
  PartnerOfferPublicFloor,
} from "@/lib/mortgage-market/partner-offer-banks";
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
