import { loadFinancialProfile } from "@/lib/financial-passport";
import {
  buildDocumentChecklist,
  checklistCompletionPercent,
  mergeChecklistWithVault,
} from "@/lib/document-vault/checklist";
import {
  countExpired,
  countInconsistencies,
} from "@/lib/document-vault/extraction";
import { VAULT_SECURITY_PRINCIPLES } from "@/lib/document-vault/security";
import type {
  DocumentVaultDashboard,
  DocumentVaultStore,
} from "@/lib/document-vault/types";

export function buildDocumentVaultDashboard(
  store: DocumentVaultStore,
  now: Date = new Date()
): DocumentVaultDashboard {
  const profile = loadFinancialProfile();
  const rawChecklist = buildDocumentChecklist({
    incomeType: profile?.incomeType ?? null,
    intent: profile?.intent ?? null,
    coApplicant: profile?.coApplicant ?? false,
    hasProperty:
      profile?.intent === "owner_occupied" ||
      profile?.intent === "investment" ||
      profile?.intent === "foreign_purchase",
    isRefinance: profile?.intent === "refinance",
  });

  const checklist = mergeChecklistWithVault(rawChecklist, store.documents);
  const completionPercent = checklistCompletionPercent(checklist);

  const pendingShareConsents = store.shareConsents.filter(
    (c) =>
      !c.revokedAt &&
      Date.parse(c.expiresAt) > now.getTime()
  );

  return {
    generatedAt: now.toISOString(),
    documents: store.documents,
    checklist,
    completionPercent,
    expiredCount: countExpired(store.documents),
    inconsistencyCount: countInconsistencies(store.documents),
    pendingShareConsents,
    retention: store.retention,
    securitySummary: [...VAULT_SECURITY_PRINCIPLES],
    methodology: [
      "Checklist je MODEL podle typu příjmu a záměru — každá banka má vlastní seznam.",
      "AI extrakce identifikuje typ, pole, chybějící strany a expiraci — ne právní závěry.",
      "Nesrovnalosti s profilem jsou faktické popisy, ne rozhodnutí banky.",
      "Sdílení se specialistou jen po explicitním souhlasu s expirací.",
      "Citlivé dokumenty nejsou odesílány do analytics.",
    ],
  };
}
