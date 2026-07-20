import type { VaultDocumentRecord } from "@/lib/document-vault/types";

const now = new Date().toISOString();
const future = new Date(Date.now() + 180 * 86_400_000).toISOString();
const past = new Date(Date.now() - 30 * 86_400_000).toISOString();

export const DEMO_VAULT_DOCUMENTS: VaultDocumentRecord[] = [
  {
    id: "doc_demo_payslip",
    category: "income_documents",
    label: "Výplatní páska (demo)",
    storageRef: "vault://demo/payslip-2025-03",
    mimeType: "application/pdf",
    pageCount: 1,
    uploadedAt: now,
    expiresAt: null,
    retentionUntil: null,
    encrypted: true,
    checksumSha256: "demo_hash_payslip",
    extractedFields: [],
    observations: [
      {
        id: "obs_demo_type",
        kind: "document_type_identified",
        message: "Identifikovaný typ dokumentu: Výplatní páska (demo) (kategorie income_documents).",
        claimKind: "DATA",
      },
    ],
    checklistItemId: "payslips",
    claimKind: "MODEL",
  },
  {
    id: "doc_demo_id",
    category: "contracts",
    label: "Občanský průkaz (demo)",
    storageRef: "vault://demo/id-card",
    mimeType: "application/pdf",
    pageCount: 2,
    uploadedAt: now,
    expiresAt: past,
    retentionUntil: null,
    encrypted: true,
    checksumSha256: "demo_hash_id",
    extractedFields: [],
    observations: [
      {
        id: "obs_demo_exp",
        kind: "expired_document",
        message: `Na dokumentu je uvedeno datum platnosti do ${new Date(past).toLocaleDateString("cs-CZ")} — dokument je po platnosti.`,
        claimKind: "DATA",
        fieldKey: "expiresAt",
      },
    ],
    checklistItemId: "id_doc",
    claimKind: "MODEL",
  },
  {
    id: "doc_demo_statement",
    category: "bank_statements",
    label: "Výpis z účtu (demo) — chybí strany",
    storageRef: "vault://demo/bank-statement",
    mimeType: "application/pdf",
    pageCount: 3,
    uploadedAt: now,
    expiresAt: future,
    retentionUntil: null,
    encrypted: true,
    checksumSha256: "demo_hash_stmt",
    extractedFields: [],
    observations: [
      {
        id: "obs_demo_pages",
        kind: "missing_page",
        message: "Chybí strana 4.",
        claimKind: "DATA",
      },
    ],
    checklistItemId: "statements",
    claimKind: "MODEL",
  },
];
