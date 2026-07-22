export {
  getOperatorIdentity,
  formatOperatorAddress,
  operatorDisplayName,
  isPaidAnalysisCommerciallyAvailable,
  type OperatorIdentity,
} from "@/lib/legal/operator";
export {
  getLegalIdentityConfig,
  isLegalIdentityComplete,
  isLegalTextReviewed,
  mustEnforceLegalIdentityForLeadCollection,
  LEGAL_IDENTITY_INCOMPLETE_PUBLIC_MESSAGE,
  LEGAL_LEAD_BLOCKED_PUBLIC_MESSAGE,
  getLegalDevIncompleteNotice,
} from "@/config/legal";
export {
  PROCESSING_ROLES,
  REGULATED_BOUNDARIES,
  LEGAL_INTERNAL_REVIEW_NOTE,
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
  buildPrivacyProcessingCheckboxLabel,
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
  canAcceptPersonalLeads,
  PUBLIC_STAGING_PHRASES,
} from "@/lib/legal/production-guard";
export {
  toPartnerVerification,
  getPrimaryPartnerVerification,
  canUseStrongPartnerTrustClaims,
  getPartnerClaimLabels,
  type PartnerVerification,
  type PartnerVerificationStatus,
} from "@/lib/partners/verification";
