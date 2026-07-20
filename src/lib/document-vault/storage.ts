import type { DocumentVaultStore } from "@/lib/document-vault/types";
import {
  DOCUMENT_VAULT_STORAGE_KEY,
  emptyVaultStore,
} from "@/lib/document-vault/types";
import { appendAuditLog, encryptMetadata } from "@/lib/document-vault/security";

export function loadDocumentVaultStore(): DocumentVaultStore {
  if (typeof window === "undefined") return emptyVaultStore();
  try {
    const raw = localStorage.getItem(DOCUMENT_VAULT_STORAGE_KEY);
    if (!raw) return emptyVaultStore();
    const parsed = JSON.parse(raw) as DocumentVaultStore;
    if (parsed?.version === 1) {
      return { ...emptyVaultStore(), ...parsed };
    }
  } catch {
    /* empty */
  }
  return emptyVaultStore();
}

export async function saveDocumentVaultStore(store: DocumentVaultStore) {
  if (typeof window === "undefined") return;
  const payload = { ...store, version: 1 as const, updatedAt: new Date().toISOString() };
  if (store.encryptionEnabled) {
    const encrypted = await encryptMetadata(JSON.stringify(payload));
    if (encrypted) {
      localStorage.setItem(
        DOCUMENT_VAULT_STORAGE_KEY,
        JSON.stringify({ version: 1, encrypted: true, payload: encrypted })
      );
      return;
    }
  }
  localStorage.setItem(
    DOCUMENT_VAULT_STORAGE_KEY,
    JSON.stringify({ ...payload, documents: payload.documents.slice(0, 50) })
  );
}

export async function loadDocumentVaultStoreDecrypted(): Promise<DocumentVaultStore> {
  if (typeof window === "undefined") return emptyVaultStore();
  try {
    const raw = localStorage.getItem(DOCUMENT_VAULT_STORAGE_KEY);
    if (!raw) return emptyVaultStore();
    const wrapper = JSON.parse(raw) as {
      version: number;
      encrypted?: boolean;
      payload?: string;
    } & DocumentVaultStore;
    if (wrapper.encrypted && wrapper.payload) {
      const { decryptMetadata } = await import("@/lib/document-vault/security");
      const plain = await decryptMetadata(wrapper.payload);
      if (plain) return JSON.parse(plain) as DocumentVaultStore;
    }
    if (wrapper.version === 1 && wrapper.documents) {
      return wrapper as DocumentVaultStore;
    }
  } catch {
    /* empty */
  }
  return emptyVaultStore();
}

export function deleteDocumentFromVault(
  store: DocumentVaultStore,
  documentId: string
): DocumentVaultStore {
  appendAuditLog({
    action: "document_deleted",
    resourceId: documentId,
    metadata: {},
  });
  return {
    ...store,
    documents: store.documents.filter((d) => d.id !== documentId),
  };
}

export function applyRetentionPolicy(store: DocumentVaultStore): DocumentVaultStore {
  const days = store.retention.autoDeleteAfterDays;
  if (days == null) return store;
  const cutoff = Date.now() - days * 86_400_000;
  const kept = store.documents.filter((d) => {
    if (!d.uploadedAt) return true;
    return Date.parse(d.uploadedAt) >= cutoff;
  });
  if (kept.length < store.documents.length) {
    appendAuditLog({
      action: "document_deleted",
      resourceId: null,
      metadata: {
        reason: "retention_policy",
        removed: String(store.documents.length - kept.length),
      },
    });
  }
  return { ...store, documents: kept };
}
