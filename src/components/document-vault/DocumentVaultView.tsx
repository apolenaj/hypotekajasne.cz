"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  FileText,
  HelpCircle,
  Lock,
  Share2,
  Shield,
  Trash2,
  Upload,
} from "lucide-react";
import {
  ClaimBadge,
  ClaimLegend,
} from "@/components/property-rentgen/ClaimBadge";
import { FeatureStatusBadge } from "@/components/majetio/FeatureStatusBadge";
import {
  buildDocumentVaultDashboard,
  CONSENT_TEXT_REQUIRED,
  DEMO_VAULT_DOCUMENTS,
  DOCUMENT_VAULT_FEATURE_STATUS,
  initiateSpecialistShare,
  loadAuditLogs,
  loadDocumentVaultStoreDecrypted,
  runDocumentExtraction,
  saveDocumentVaultStore,
  VAULT_CATEGORY_LABELS,
  VAULT_DOCUMENT_CATEGORIES,
  type VaultDocumentCategory,
  type VaultDocumentRecord,
  emptyVaultStore,
  deleteDocumentFromVault,
  applyRetentionPolicy,
} from "@/lib/document-vault";
import { loadFinancialProfile } from "@/lib/financial-passport";
import { routes } from "@/lib/routes";
import { appendAuditLog } from "@/lib/document-vault/security";

function subscribeNoop() {
  return () => {};
}
function useIsClient() {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}

export function DocumentVaultView() {
  const ready = useIsClient();
  const router = useRouter();
  const [tick, setTick] = useState(0);
  const [store, setStore] = useState(emptyVaultStore());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [consentText, setConsentText] = useState("");
  const [consentGranted, setConsentGranted] = useState(false);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [uploadCategory, setUploadCategory] =
    useState<VaultDocumentCategory>("income_documents");
  const [uploadLabel, setUploadLabel] = useState("");

  useEffect(() => {
    if (!ready) return;
    void loadDocumentVaultStoreDecrypted().then(setStore);
  }, [ready, tick]);

  const dashboard = useMemo(() => {
    void tick;
    return buildDocumentVaultDashboard(store);
  }, [store, tick]);

  const auditLogs = useMemo(() => (ready ? loadAuditLogs() : []), [ready, tick]);

  const seedDemo = useCallback(async () => {
    const next = { ...emptyVaultStore(), documents: DEMO_VAULT_DOCUMENTS };
    setStore(next);
    await saveDocumentVaultStore(next);
    setTick((t) => t + 1);
  }, []);

  const handleAddDocument = useCallback(async () => {
    const label = uploadLabel.trim() || VAULT_CATEGORY_LABELS[uploadCategory];
    const id = `doc_${Date.now().toString(36)}`;
    const base: Omit<VaultDocumentRecord, "observations" | "extractedFields"> = {
      id,
      category: uploadCategory,
      label,
      storageRef: `vault://local/${id}`,
      mimeType: "application/pdf",
      pageCount: null,
      uploadedAt: new Date().toISOString(),
      expiresAt: null,
      retentionUntil: null,
      encrypted: true,
      checksumSha256: null,
      checklistItemId: null,
      claimKind: "DATA",
    };
    const profile = loadFinancialProfile();
    const { extractedFields, observations } = runDocumentExtraction({
      document: base,
      profile,
    });
    const doc: VaultDocumentRecord = {
      ...base,
      extractedFields,
      observations,
    };
    appendAuditLog({
      action: "document_uploaded",
      resourceId: id,
      metadata: { category: uploadCategory },
    });
    appendAuditLog({
      action: "extraction_run",
      resourceId: id,
      metadata: { observationCount: String(observations.length) },
    });
    const next = {
      ...store,
      documents: [...store.documents, doc],
    };
    setStore(next);
    await saveDocumentVaultStore(next);
    setUploadLabel("");
    setTick((t) => t + 1);
  }, [store, uploadCategory, uploadLabel]);

  const handleDelete = useCallback(
    async (id: string) => {
      const next = deleteDocumentFromVault(store, id);
      setStore(next);
      await saveDocumentVaultStore(next);
      setSelectedIds((s) => {
        const n = new Set(s);
        n.delete(id);
        return n;
      });
      setTick((t) => t + 1);
    },
    [store]
  );

  const handleShare = useCallback(async () => {
    const result = initiateSpecialistShare(
      {
        documentIds: [...selectedIds],
        scope: ["mortgage_assessment"],
        consentText,
        granted: consentGranted,
      },
      store.documents
    );
    setShareMessage(result.message);
    if (result.success && result.consent) {
      const next = {
        ...store,
        shareConsents: [...store.shareConsents, result.consent],
      };
      setStore(next);
      await saveDocumentVaultStore(next);
      if (result.handoffUrl) {
        router.push(result.handoffUrl);
      }
    }
  }, [consentGranted, consentText, router, selectedIds, store]);

  const applyRetention = useCallback(async () => {
    const next = applyRetentionPolicy(store);
    setStore(next);
    await saveDocumentVaultStore(next);
    setTick((t) => t + 1);
  }, [store]);

  const toggleSelect = (id: string) => {
    setSelectedIds((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  if (!ready) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-sm text-muted-foreground">
        Načítám Document Vault…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eef3f1] to-white">
      <header className="border-b border-border bg-deep-teal text-white">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-gold">
              Mortgage & Property Document Vault
            </p>
            <FeatureStatusBadge status={DOCUMENT_VAULT_FEATURE_STATUS} />
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold">
              <Lock className="h-3 w-3" /> Šifrování metadata
            </span>
          </div>
          <h1 className="mt-2 font-heading text-3xl font-black md:text-4xl">
            Document Vault
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-emerald-50/90">
            Bezpečné uložení metadata dokumentů, AI extrakce faktických
            pozorování (ne právní závěry), checklist dle situace a sdílení se
            specialistou jen po explicitním souhlasu.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void seedDemo()}
              className="rounded-full bg-white/15 px-4 py-2 text-sm font-semibold"
            >
              Načíst demo dokumenty
            </button>
            <Link
              href={routes.financniPas}
              className="rounded-full border border-white/30 px-4 py-2 text-sm font-semibold"
            >
              Financial Passport
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-10">
        {/* KPI */}
        <section className="grid gap-4 sm:grid-cols-4">
          {[
            {
              label: "Checklist",
              value: `${dashboard.completionPercent} %`,
              sub: "povinných položek",
            },
            {
              label: "Dokumenty",
              value: String(dashboard.documents.length),
              sub: "v trezoru",
            },
            {
              label: "Po platnosti",
              value: String(dashboard.expiredCount),
              sub: "flagů",
            },
            {
              label: "Nesrovnalosti",
              value: String(dashboard.inconsistencyCount),
              sub: "vs. profil",
            },
          ].map(({ label, value, sub }) => (
            <div key={label} className="rounded-2xl border border-border bg-white p-5">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-1 font-heading text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground">{sub}</p>
            </div>
          ))}
        </section>

        {/* Checklist */}
        <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-heading text-xl font-bold text-deep-teal">
            Checklist dle vaší situace
          </h2>
          <div className="divide-y divide-border">
            {dashboard.checklist.map((item) => (
              <div key={item.id} className="flex items-start gap-3 py-3">
                {item.done ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                ) : (
                  <span className="mt-1 h-4 w-4 shrink-0 rounded-full border-2 border-border" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {item.label}
                    {item.required && (
                      <span className="ml-2 text-xs text-muted-foreground">(povinné)</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <ClaimBadge kind="ODHAD" />
              </div>
            ))}
          </div>
        </section>

        {/* Upload */}
        <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 font-heading text-xl font-bold text-deep-teal">
            <Upload className="h-5 w-5" />
            Přidat dokument (metadata)
          </h2>
          <p className="mb-4 text-xs text-muted-foreground">
            BETA — binární obsah neukládáme do localStorage. Production = encrypted object storage + signed URL.
          </p>
          <div className="flex flex-wrap gap-3">
            <select
              value={uploadCategory}
              onChange={(e) =>
                setUploadCategory(e.target.value as VaultDocumentCategory)
              }
              className="rounded-lg border border-border px-3 py-2 text-sm"
            >
              {VAULT_DOCUMENT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {VAULT_CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Název dokumentu (volitelné)"
              value={uploadLabel}
              onChange={(e) => setUploadLabel(e.target.value)}
              className="min-w-[200px] flex-1 rounded-lg border border-border px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => void handleAddDocument()}
              className="rounded-full bg-deep-teal px-5 py-2 text-sm font-semibold text-white"
            >
              Nahrát + extrahovat
            </button>
          </div>
        </section>

        {/* Documents + extraction */}
        <section className="space-y-4">
          <h2 className="font-heading text-xl font-bold text-deep-teal">
            Dokumenty a AI extrakce
          </h2>
          {dashboard.documents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Zatím žádné dokumenty — načtěte demo nebo přidejte metadata.
            </p>
          ) : (
            dashboard.documents.map((doc) => (
              <div
                key={doc.id}
                className="rounded-2xl border border-border bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(doc.id)}
                      onChange={() => toggleSelect(doc.id)}
                      className="mt-1 h-4 w-4 accent-deep-teal"
                      aria-label={`Vybrat ${doc.label}`}
                    />
                    <div>
                      <p className="font-medium">{doc.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {VAULT_CATEGORY_LABELS[doc.category]}
                        {doc.encrypted && " · šifrováno"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClaimBadge kind={doc.claimKind} />
                    <button
                      type="button"
                      onClick={() => void handleDelete(doc.id)}
                      className="rounded p-1 text-muted-foreground hover:text-red-600"
                      aria-label="Smazat"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {doc.observations.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {doc.observations.map((o) => (
                      <li
                        key={o.id}
                        className={`flex items-start gap-2 rounded-lg p-3 text-sm ${
                          o.kind === "expired_document" ||
                          o.kind === "profile_inconsistency"
                            ? "bg-amber-50 text-amber-900"
                            : "bg-muted/40"
                        }`}
                      >
                        {o.kind === "missing_page" ||
                        o.kind === "profile_inconsistency" ? (
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                        ) : (
                          <FileText className="mt-0.5 h-4 w-4 shrink-0" />
                        )}
                        {o.message}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))
          )}
        </section>

        {/* Share with specialist */}
        <section className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6">
          <h2 className="mb-2 flex items-center gap-2 font-heading text-xl font-bold text-amber-900">
            <Share2 className="h-5 w-5" />
            Sdílet se specialistou
          </h2>
          <p className="mb-4 text-sm text-amber-900/80">
            Pouze explicitní souhlas. Citlivé dokumenty nejsou odesílány do analytics.
          </p>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={consentGranted}
              onChange={(e) => setConsentGranted(e.target.checked)}
              className="mt-1 h-4 w-4"
            />
            Souhlasím se sdílením vybraných dokumentů
          </label>
          <p className="mt-3 text-xs text-muted-foreground">
            Pro potvrzení opište:{" "}
            <em className="text-foreground">{CONSENT_TEXT_REQUIRED}</em>
          </p>
          <textarea
            value={consentText}
            onChange={(e) => setConsentText(e.target.value)}
            rows={2}
            className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-sm"
            placeholder="Opište souhlas…"
          />
          <button
            type="button"
            disabled={selectedIds.size === 0}
            onClick={() => void handleShare()}
            className="mt-3 rounded-full bg-deep-teal px-6 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Sdílet se specialistou ({selectedIds.size} vybráno)
          </button>
          {shareMessage && (
            <p className="mt-2 text-sm text-foreground">{shareMessage}</p>
          )}
        </section>

        {/* Security */}
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-white p-5">
            <h3 className="mb-3 flex items-center gap-2 font-heading font-bold">
              <Shield className="h-4 w-4 text-deep-teal" />
              Retention & mazání
            </h3>
            <p className="text-xs text-muted-foreground">
              Auto-mazání po {store.retention.autoDeleteAfterDays ?? "—"} dnech
            </p>
            <button
              type="button"
              onClick={() => void applyRetention()}
              className="mt-3 rounded-full border border-border px-4 py-1.5 text-xs font-semibold"
            >
              Aplikovat retention policy
            </button>
          </div>
          <div className="rounded-2xl border border-border bg-white p-5">
            <h3 className="mb-3 font-heading font-bold">Audit log (metadata)</h3>
            <ul className="max-h-40 space-y-1 overflow-y-auto text-xs text-muted-foreground">
              {auditLogs.slice(0, 8).map((e) => (
                <li key={e.id}>
                  {new Date(e.at).toLocaleString("cs-CZ")} — {e.action}
                  {e.resourceId ? ` (${e.resourceId.slice(0, 12)}…)` : ""}
                </li>
              ))}
              {auditLogs.length === 0 && <li>Žádné záznamy</li>}
            </ul>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-muted/30 p-5">
          <h3 className="mb-3 flex items-center gap-2 font-heading text-base font-bold">
            <HelpCircle className="h-4 w-4" />
            Metodika
          </h3>
          <ul className="space-y-1">
            {dashboard.methodology.map((m) => (
              <li key={m} className="text-xs text-muted-foreground">
                · {m}
              </li>
            ))}
          </ul>
          <ClaimLegend />
        </section>
      </main>
    </div>
  );
}
