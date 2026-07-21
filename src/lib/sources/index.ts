export type {
  AuthorityKind,
  AuthoritySource,
  ExternalProvenance,
  OperationalDataStatus,
  ProvenanceClaimLink,
  PublicTrustStatus,
  SourceTopic,
} from "@/lib/sources/types";
export { PUBLIC_TRUST_STATUSES } from "@/lib/sources/types";

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
