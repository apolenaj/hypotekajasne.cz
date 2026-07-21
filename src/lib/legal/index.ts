export {
  getOperatorIdentity,
  formatOperatorAddress,
  operatorDisplayName,
  isPaidAnalysisCommerciallyAvailable,
  type OperatorIdentity,
} from "@/lib/legal/operator";
export {
  PROCESSING_ROLES,
  REGULATED_BOUNDARIES,
  LAWYER_REVIEW_NOTICE,
} from "@/lib/legal/roles";
export {
  CONSENT_POLICY_VERSION,
  COOKIE_POLICY_VERSION,
  TERMS_VERSION,
  PAID_ANALYSIS_TERMS_VERSION,
  ANALYTICS_LEGAL_BASIS,
  CONSENT_PURPOSES,
  PARTNER_TRANSFER_SCOPE_LABELS,
  buildPartnerTransferCheckboxLabel,
  buildConsentContextSummary,
  type ConsentPurposeId,
  type PartnerTransferScope,
} from "@/lib/legal/consent-versions";
export { getPaidAnalysisTerms } from "@/lib/legal/paid-analysis-terms";
export {
  getMortgagePartners,
  getPrimaryMortgagePartner,
  partnerPublicDisplayName,
  isMortgagePartnerIdentityVerified,
  isMortgagePartnerHandoffReady,
  partnerJerrsPublicLabel,
  auditPartnerConfig,
  COMPENSATION_DISCLOSURE,
  type MortgagePartner,
  type MortgagePartnerJerrsStatus,
} from "@/lib/legal/partner-config";
export {
  collectLegalProductionIssues,
  assertLegalProductionGate,
  PUBLIC_STAGING_PHRASES,
} from "@/lib/legal/production-guard";
