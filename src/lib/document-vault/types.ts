import type { ClaimKind } from "@/lib/property-rentgen/types";
import type { IncomeTypeId, MortgageIntent } from "@/lib/mortgage-readiness/types";

export const DOCUMENT_VAULT_STORAGE_KEY = "hj-document-vault-v1";
export const DOCUMENT_VAULT_AUDIT_KEY = "hj-document-vault-audit-v1";
export const DOCUMENT_VAULT_FEATURE_STATUS = "BETA" as const;

/** Document categories in vault */
export const VAULT_DOCUMENT_CATEGORIES = [
  "income_documents",
  "bank_statements",
  "tax_returns",
  "contracts",
  "mortgage_documents",
  "property_documents",
  "svj_documents",
  "energy_certificates",
  "insurance",
  "valuation_reports",
] as const;

export type VaultDocumentCategory = (typeof VAULT_DOCUMENT_CATEGORIES)[number];

export const VAULT_CATEGORY_LABELS: Record<VaultDocumentCategory, string> = {
  income_documents: "Doklady o příjmu",
  bank_statements: "Výpisy z účtu",
  tax_returns: "Daňová přiznání",
  contracts: "Smlouvy",
  mortgage_documents: "Hypoteční dokumenty",
  property_documents: "Dokumenty k nemovitosti",
  svj_documents: "Dokumenty SVJ",
  energy_certificates: "Průkazy energetické náročnosti",
  insurance: "Pojištění",
  valuation_reports: "Znalecké posudky / odhady",
};

export type ExtractionObservationKind =
  | "document_type_identified"
  | "field_extracted"
  | "missing_page"
  | "expired_document"
  | "profile_inconsistency"
  | "info";

/** AI extraction observation — faktický popis, ne právní závěr */
export type ExtractionObservation = {
  id: string;
  kind: ExtractionObservationKind;
  message: string;
  claimKind: ClaimKind;
  fieldKey?: string;
  extractedValue?: string;
  profileValue?: string;
};

export type ExtractedField = {
  key: string;
  label: string;
  value: string | null;
  confidence: "high" | "medium" | "low";
  claimKind: ClaimKind;
};

export type VaultDocumentRecord = {
  id: string;
  category: VaultDocumentCategory;
  label: string;
  /** Encrypted blob ref on server — never raw binary in localStorage */
  storageRef: string | null;
  mimeType: string | null;
  pageCount: number | null;
  uploadedAt: string | null;
  expiresAt: string | null;
  retentionUntil: string | null;
  encrypted: boolean;
  checksumSha256: string | null;
  extractedFields: ExtractedField[];
  observations: ExtractionObservation[];
  checklistItemId: string | null;
  claimKind: ClaimKind;
};

export type ChecklistItem = {
  id: string;
  category: VaultDocumentCategory;
  label: string;
  description: string;
  required: boolean;
  /** Linked vault document id if uploaded */
  documentId: string | null;
  done: boolean;
};

export type RetentionPolicy = {
  autoDeleteAfterDays: number | null;
  warnBeforeExpiryDays: number;
};

export type AccessControlEntry = {
  actorId: string;
  action: "read" | "write" | "delete" | "share" | "extract";
  resourceId: string;
  at: string;
  allowed: boolean;
};

export type SpecialistShareConsent = {
  id: string;
  grantedAt: string;
  expiresAt: string;
  scope: string[];
  documentIds: string[];
  revokedAt: string | null;
  handoffToken: string | null;
};

export type DocumentVaultStore = {
  version: 1;
  documents: VaultDocumentRecord[];
  checklistOverrides: Record<string, boolean>;
  retention: RetentionPolicy;
  shareConsents: SpecialistShareConsent[];
  encryptionEnabled: boolean;
  updatedAt: string;
};

export type DocumentVaultDashboard = {
  generatedAt: string;
  documents: VaultDocumentRecord[];
  checklist: ChecklistItem[];
  completionPercent: number;
  expiredCount: number;
  inconsistencyCount: number;
  pendingShareConsents: SpecialistShareConsent[];
  retention: RetentionPolicy;
  securitySummary: string[];
  methodology: string[];
};

export type SignedUrlRequest = {
  documentId: string;
  purpose: "view" | "download";
  expiresInSeconds: number;
};

export type SignedUrlResponse = {
  url: string;
  expiresAt: string;
  documentId: string;
};

export type AuditLogEntry = {
  id: string;
  at: string;
  action:
    | "document_uploaded"
    | "document_viewed"
    | "document_deleted"
    | "extraction_run"
    | "share_consent_granted"
    | "share_consent_revoked"
    | "share_handoff_initiated"
    | "retention_updated"
    | "access_denied";
  resourceId: string | null;
  actorId: string;
  metadata: Record<string, string>;
  /** Never document content or PII */
};

export function emptyVaultStore(): DocumentVaultStore {
  const now = new Date().toISOString();
  return {
    version: 1,
    documents: [],
    checklistOverrides: {},
    retention: { autoDeleteAfterDays: 365, warnBeforeExpiryDays: 30 },
    shareConsents: [],
    encryptionEnabled: true,
    updatedAt: now,
  };
}
