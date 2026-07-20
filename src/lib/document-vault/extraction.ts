/**
 * AI document extraction — faktická pozorování, ne právní závěry.
 * BETA: rule-based extraction from metadata; production = OCR/LLM pipeline s audit.
 */

import type { FinancialProfileAnswers } from "@/lib/financial-passport/types";
import type {
  ExtractionObservation,
  ExtractedField,
  VaultDocumentCategory,
  VaultDocumentRecord,
} from "@/lib/document-vault/types";

const LEGAL_CONCLUSION_PATTERNS = [
  /schvál/i,
  /zamítn/i,
  /porušuje zákon/i,
  /neplatn/i,
  /podvod/i,
  /doporučujeme refinanc/i,
];

export function assertNotLegalConclusion(message: string): void {
  for (const pattern of LEGAL_CONCLUSION_PATTERNS) {
    if (pattern.test(message)) {
      throw new Error(
        "Extraction must not contain legal conclusions — use factual observations only."
      );
    }
  }
}

export function identifyDocumentType(input: {
  category: VaultDocumentCategory;
  label: string;
  mimeType: string | null;
}): ExtractionObservation {
  const msg = `Identifikovaný typ dokumentu: ${input.label} (kategorie ${input.category}).`;
  assertNotLegalConclusion(msg);
  return {
    id: `obs_type_${Date.now()}`,
    kind: "document_type_identified",
    message: msg,
    claimKind: "DATA",
  };
}

export function detectExpiredDocument(
  expiresAt: string | null
): ExtractionObservation | null {
  if (!expiresAt) return null;
  const exp = Date.parse(expiresAt);
  if (!Number.isFinite(exp)) return null;
  const now = Date.now();
  const dateStr = new Date(exp).toLocaleDateString("cs-CZ");
  if (exp < now) {
    const msg = `Na dokumentu je uvedeno datum platnosti do ${dateStr} — dokument je po platnosti.`;
    assertNotLegalConclusion(msg);
    return {
      id: `obs_exp_${Date.now()}`,
      kind: "expired_document",
      message: msg,
      claimKind: "DATA",
      fieldKey: "expiresAt",
      extractedValue: dateStr,
    };
  }
  if (exp - now < 30 * 86_400_000) {
    const msg = `Na dokumentu je uvedeno datum platnosti do ${dateStr} — blíží se konec platnosti.`;
    assertNotLegalConclusion(msg);
    return {
      id: `obs_exp_soon_${Date.now()}`,
      kind: "expired_document",
      message: msg,
      claimKind: "DATA",
      fieldKey: "expiresAt",
      extractedValue: dateStr,
    };
  }
  return null;
}

export function detectMissingPages(input: {
  expectedPages: number | null;
  actualPages: number | null;
}): ExtractionObservation | null {
  if (input.expectedPages == null || input.actualPages == null) return null;
  if (input.actualPages >= input.expectedPages) return null;
  const missing = input.expectedPages - input.actualPages;
  const msg =
    missing === 1
      ? `Chybí strana ${input.actualPages + 1}.`
      : `Chybí ${missing} stran (nahrané ${input.actualPages} z ${input.expectedPages}).`;
  assertNotLegalConclusion(msg);
  return {
    id: `obs_pages_${Date.now()}`,
    kind: "missing_page",
    message: msg,
    claimKind: "DATA",
  };
}

export function detectProfileInconsistency(input: {
  fieldKey: string;
  extractedValue: number;
  profileValue: number | null;
  label: string;
  tolerancePercent?: number;
}): ExtractionObservation | null {
  if (input.profileValue == null || input.profileValue <= 0) return null;
  const tolerance = input.tolerancePercent ?? 5;
  const diff = Math.abs(input.extractedValue - input.profileValue);
  const pctDiff = (diff / input.profileValue) * 100;
  if (pctDiff <= tolerance) return null;

  const fmt = (n: number) =>
    new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 0 }).format(n);

  const msg = `${input.label} se liší od profilu: na dokumentu ${fmt(input.extractedValue)}, v profilu ${fmt(input.profileValue)}.`;
  assertNotLegalConclusion(msg);
  return {
    id: `obs_inc_${input.fieldKey}_${Date.now()}`,
    kind: "profile_inconsistency",
    message: msg,
    claimKind: "DATA",
    fieldKey: input.fieldKey,
    extractedValue: String(input.extractedValue),
    profileValue: String(input.profileValue),
  };
}

export function runDocumentExtraction(input: {
  document: Omit<VaultDocumentRecord, "observations" | "extractedFields">;
  profile: FinancialProfileAnswers | null;
  expectedPages?: number | null;
}): {
  extractedFields: ExtractedField[];
  observations: ExtractionObservation[];
} {
  const observations: ExtractionObservation[] = [];
  const extractedFields: ExtractedField[] = [];

  observations.push(
    identifyDocumentType({
      category: input.document.category,
      label: input.document.label,
      mimeType: input.document.mimeType,
    })
  );

  const expired = detectExpiredDocument(input.document.expiresAt);
  if (expired) observations.push(expired);

  const missingPages = detectMissingPages({
    expectedPages: input.expectedPages ?? null,
    actualPages: input.document.pageCount,
  });
  if (missingPages) observations.push(missingPages);

  if (
    input.document.category === "income_documents" &&
    input.profile != null
  ) {
    const profileIncome =
      (input.profile.netIncome ?? 0) + (input.profile.secondaryIncome ?? 0);
    if (profileIncome > 0) {
    const demoExtractedIncome = input.document.label.includes("demo")
      ? Math.round(profileIncome * 1.12)
      : null;
    if (demoExtractedIncome != null) {
      extractedFields.push({
        key: "monthly_income",
        label: "Měsíční příjem (extrahováno)",
        value: String(demoExtractedIncome),
        confidence: "medium",
        claimKind: "MODEL",
      });
      const inc = detectProfileInconsistency({
        fieldKey: "monthly_income",
        extractedValue: demoExtractedIncome,
        profileValue: profileIncome,
        label: "Částka příjmu",
      });
      if (inc) observations.push(inc);
    }
    }
  }

  for (const obs of observations) {
    assertNotLegalConclusion(obs.message);
  }

  return { extractedFields, observations };
}

export function countInconsistencies(documents: VaultDocumentRecord[]): number {
  return documents.reduce(
    (n, d) =>
      n + d.observations.filter((o) => o.kind === "profile_inconsistency").length,
    0
  );
}

export function countExpired(documents: VaultDocumentRecord[]): number {
  return documents.reduce(
    (n, d) =>
      n +
      d.observations.filter(
        (o) => o.kind === "expired_document" && o.message.includes("po platnosti")
      ).length,
    0
  );
}
