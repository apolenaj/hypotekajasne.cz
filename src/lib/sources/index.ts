export type {
  AuthorityKind,
  AuthoritySource,
  ExternalProvenance,
  FactClaim,
  FactClaimStatus,
  FactSourceType,
  OperationalDataStatus,
  ProvenanceClaimLink,
  PublicTrustStatus,
  SourceTopic,
} from "@/lib/sources/types";
export { PUBLIC_TRUST_STATUSES, MANUAL_VERIFICATION_NOTE } from "@/lib/sources/types";

export {
  AUTHORITY_REGISTRY,
  getAuthorityById,
  listAuthorities,
} from "@/lib/sources/authorities";

export {
  CRITICAL_PROVENANCE_CLAIMS,
  getClaimById,
  listClaims,
} from "@/lib/sources/claims";

export {
  FACT_CLAIMS,
  FORBIDDEN_FACT_PHRASES,
  getFactClaim,
  listFactClaims,
  requireFactClaim,
} from "@/lib/sources/fact-claims";

export {
  CLAIM_JURISDICTIONS,
  JURISDICTION_FACT_CLAIMS,
} from "@/lib/sources/fact-claims-jurisdictions";

export {
  factClaimCostRange,
  factClaimToLegalClaim,
  factStatusToDataStatus,
  formatFactClaimValue,
} from "@/lib/sources/fact-claims-display";

export {
  FACT_CLAIM_STATUS_LABELS_CS,
  evidencePrimaryUrlLabel,
  evidenceStatusBadgeText,
  factClaimToSourceEvidence,
  formatValidityPeriod,
  legalClaimToSourceEvidence,
  type SourceEvidence,
} from "@/lib/sources/source-evidence";

export {
  canClaimVerified,
  downgradeUnverifiedStatus,
  isHttpUrl,
  looksLikeInternalStorage,
  publicSourceLabel,
  validateDataRecordProvenance,
  validateExternalProvenance,
  type ProvenanceIssue,
} from "@/lib/sources/validation";

export {
  AUTHORITY_KIND_LABELS_CS,
  JURISDICTION_LABELS_CS,
  SOURCE_TOPIC_LABELS_CS,
} from "@/lib/sources/labels";
