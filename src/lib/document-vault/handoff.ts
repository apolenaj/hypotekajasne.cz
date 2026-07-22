import type {
  SpecialistShareConsent,
  VaultDocumentRecord,
} from "@/lib/document-vault/types";
import { appendAuditLog } from "@/lib/document-vault/security";

export type ShareHandoffRequest = {
  documentIds: string[];
  scope: string[];
  consentText: string;
  granted: boolean;
  expiresInHours?: number;
};

export type ShareHandoffResult = {
  success: boolean;
  consent: SpecialistShareConsent | null;
  handoffUrl: string | null;
  message: string;
};

const CONSENT_VERSION = "v1";
const CONSENT_TEXT_REQUIRED =
  "Souhlasím se sdílením vybraných dokumentů s ověřeným partnerem za účelem posouzení hypotéky.";

export function validateShareConsent(input: ShareHandoffRequest): {
  valid: boolean;
  error: string | null;
} {
  if (!input.granted) {
    return { valid: false, error: "Explicitní souhlas je povinný." };
  }
  if (input.documentIds.length === 0) {
    return { valid: false, error: "Vyberte alespoň jeden dokument." };
  }
  if (input.consentText.trim() !== CONSENT_TEXT_REQUIRED) {
    return {
      valid: false,
      error: "Potvrďte souhlas přesným zněním.",
    };
  }
  return { valid: true, error: null };
}

export function createShareConsent(input: {
  documentIds: string[];
  scope: string[];
  expiresInHours?: number;
}): SpecialistShareConsent {
  const now = new Date();
  const hours = input.expiresInHours ?? 72;
  const expiresAt = new Date(now.getTime() + hours * 3_600_000);
  return {
    id: `consent_${now.getTime().toString(36)}`,
    grantedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    scope: input.scope,
    documentIds: input.documentIds,
    revokedAt: null,
    handoffToken: `ht_${crypto.randomUUID?.() ?? Date.now().toString(36)}`,
  };
}

export function buildSpecialistHandoffUrl(consent: SpecialistShareConsent): string {
  return `/navrh-na-miru?vault_handoff=${consent.id}&token=${consent.handoffToken}&v=${CONSENT_VERSION}`;
}

export function initiateSpecialistShare(
  input: ShareHandoffRequest,
  documents: VaultDocumentRecord[]
): ShareHandoffResult {
  const validation = validateShareConsent(input);
  if (!validation.valid) {
    appendAuditLog({
      action: "access_denied",
      resourceId: null,
      metadata: { reason: validation.error ?? "invalid_consent" },
    });
    return {
      success: false,
      consent: null,
      handoffUrl: null,
      message: validation.error ?? "Neplatný souhlas.",
    };
  }

  const missing = input.documentIds.filter(
    (id) => !documents.some((d) => d.id === id)
  );
  if (missing.length > 0) {
    return {
      success: false,
      consent: null,
      handoffUrl: null,
      message: "Některé dokumenty nebyly nalezeny.",
    };
  }

  const consent = createShareConsent({
    documentIds: input.documentIds,
    scope: input.scope.length > 0 ? input.scope : ["mortgage_assessment"],
    expiresInHours: input.expiresInHours,
  });

  appendAuditLog({
    action: "share_consent_granted",
    resourceId: consent.id,
    metadata: {
      documentCount: String(input.documentIds.length),
      expiresAt: consent.expiresAt,
    },
  });

  appendAuditLog({
    action: "share_handoff_initiated",
    resourceId: consent.id,
    metadata: { scope: consent.scope.join(",") },
  });

  return {
    success: true,
    consent,
    handoffUrl: buildSpecialistHandoffUrl(consent),
    message: "Souhlas zaznamenán. Přesměrujeme na specialistu.",
  };
}

export function revokeShareConsent(
  consent: SpecialistShareConsent
): SpecialistShareConsent {
  appendAuditLog({
    action: "share_consent_revoked",
    resourceId: consent.id,
    metadata: {},
  });
  return { ...consent, revokedAt: new Date().toISOString(), handoffToken: null };
}

export { CONSENT_TEXT_REQUIRED };
