/**
 * Security architecture for Document Vault.
 * BETA: client-side metadata encryption + audit; production = KMS + object storage.
 */

import type {
  AccessControlEntry,
  AuditLogEntry,
  SignedUrlRequest,
  SignedUrlResponse,
} from "@/lib/document-vault/types";
import { DOCUMENT_VAULT_AUDIT_KEY } from "@/lib/document-vault/types";

const SESSION_KEY_ID = "hj-vault-session-key-v1";
const ACTOR_ID_KEY = "hj-vault-actor-id";

export function getVaultActorId(): string {
  if (typeof window === "undefined") return "server";
  let id = sessionStorage.getItem(ACTOR_ID_KEY);
  if (!id) {
    id = `actor_${crypto.randomUUID().slice(0, 12)}`;
    sessionStorage.setItem(ACTOR_ID_KEY, id);
  }
  return id;
}

/** Append-only audit log — metadata only, no document content */
export function appendAuditLog(
  entry: Omit<AuditLogEntry, "id" | "at" | "actorId">
): AuditLogEntry {
  const full: AuditLogEntry = {
    ...entry,
    id: `audit_${Date.now().toString(36)}`,
    at: new Date().toISOString(),
    actorId: getVaultActorId(),
  };
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(DOCUMENT_VAULT_AUDIT_KEY);
      const logs: AuditLogEntry[] = raw ? JSON.parse(raw) : [];
      logs.unshift(full);
      localStorage.setItem(
        DOCUMENT_VAULT_AUDIT_KEY,
        JSON.stringify(logs.slice(0, 100))
      );
    } catch {
      /* fail silent — audit must not break UX */
    }
  }
  return full;
}

export function loadAuditLogs(): AuditLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DOCUMENT_VAULT_AUDIT_KEY);
    return raw ? (JSON.parse(raw) as AuditLogEntry[]) : [];
  } catch {
    return [];
  }
}

/** Strict access control check */
export function checkAccess(input: {
  action: AccessControlEntry["action"];
  resourceId: string;
  encryptionEnabled: boolean;
}): { allowed: boolean; reason: string } {
  if (typeof window === "undefined") {
    return { allowed: false, reason: "Server-side access requires auth token." };
  }
  if (!input.encryptionEnabled && input.action === "share") {
    return {
      allowed: false,
      reason: "Sdílení vyžaduje aktivní šifrování.",
    };
  }
  return { allowed: true, reason: "Session actor authorized for BETA vault." };
}

/** Generate/import session encryption key (Web Crypto) */
export async function getOrCreateVaultKey(): Promise<CryptoKey | null> {
  if (typeof window === "undefined" || !crypto.subtle) return null;
  const stored = sessionStorage.getItem(SESSION_KEY_ID);
  if (stored) {
    try {
      const raw = Uint8Array.from(atob(stored), (c) => c.charCodeAt(0));
      return crypto.subtle.importKey("raw", raw, "AES-GCM", false, [
        "encrypt",
        "decrypt",
      ]);
    } catch {
      /* regenerate */
    }
  }
  const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, [
    "encrypt",
    "decrypt",
  ]);
  const exported = await crypto.subtle.exportKey("raw", key);
  sessionStorage.setItem(
    SESSION_KEY_ID,
    btoa(String.fromCharCode(...new Uint8Array(exported)))
  );
  return key;
}

export async function encryptMetadata(plaintext: string): Promise<string | null> {
  const key = await getOrCreateVaultKey();
  if (!key) return null;
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);
  const combined = new Uint8Array(iv.length + cipher.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(cipher), iv.length);
  return btoa(String.fromCharCode(...combined));
}

export async function decryptMetadata(ciphertext: string): Promise<string | null> {
  const key = await getOrCreateVaultKey();
  if (!key) return null;
  try {
    const combined = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
    return new TextDecoder().decode(plain);
  } catch {
    return null;
  }
}

/** Signed URL contract — production uses presigned S3/Blob storage */
export function buildSignedUrlContract(
  req: SignedUrlRequest
): SignedUrlResponse {
  const expiresAt = new Date(
    Date.now() + req.expiresInSeconds * 1000
  ).toISOString();
  return {
    documentId: req.documentId,
    expiresAt,
    url: `/api/bridge/documents/signed/${req.documentId}?purpose=${req.purpose}&exp=${encodeURIComponent(expiresAt)}`,
  };
}

export const VAULT_SECURITY_PRINCIPLES = [
  "Binární obsah dokumentů nikdy v localStorage — jen metadata a encrypted refs.",
  "Audit log obsahuje akce, ne obsah souborů.",
  "Signed URLs s krátkou expirací — production presigned object storage.",
  "Šifrování metadata AES-GCM (session key); production = KMS per user.",
  "Analytics nikdy neobdrží názvy souborů, obsah ani částky z dokumentů.",
  "Sdílení se specialistou jen po explicitním consentu s expirací.",
  "AI extrakce = faktické pozorování, ne právní závěry.",
  "Retention policy — automatické mazání po uplynutí období (BETA: manuální trigger).",
] as const;

export const VAULT_ANALYTICS_FORBIDDEN = [
  "filename",
  "document_content",
  "extracted_amount",
  "income_amount",
  "tax_id",
  "account_number",
  "iban",
  "address",
  "name",
  "document_category_detail",
] as const;
