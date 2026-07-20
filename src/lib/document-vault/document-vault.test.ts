import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildDocumentChecklist,
  checklistCompletionPercent,
  mergeChecklistWithVault,
} from "@/lib/document-vault/checklist";
import {
  assertNotLegalConclusion,
  detectExpiredDocument,
  detectMissingPages,
  detectProfileInconsistency,
  runDocumentExtraction,
} from "@/lib/document-vault/extraction";
import {
  CONSENT_TEXT_REQUIRED,
  initiateSpecialistShare,
  validateShareConsent,
} from "@/lib/document-vault/handoff";
import { buildSignedUrlContract, VAULT_ANALYTICS_FORBIDDEN } from "@/lib/document-vault/security";
import { DEMO_VAULT_DOCUMENTS } from "@/lib/document-vault/demo";
import type { VaultDocumentRecord } from "@/lib/document-vault/types";

describe("document checklist", () => {
  it("employee gets payslips and confirmation", () => {
    const items = buildDocumentChecklist({
      incomeType: "employee",
      intent: "owner_occupied",
      coApplicant: false,
      hasProperty: true,
      isRefinance: false,
    });
    assert.ok(items.some((i) => i.id === "payslips"));
    assert.ok(items.some((i) => i.id === "employment_confirmation"));
  });

  it("OSVČ gets tax returns", () => {
    const items = buildDocumentChecklist({
      incomeType: "osvc_pausal",
      intent: "investment",
      coApplicant: false,
      hasProperty: true,
      isRefinance: false,
    });
    assert.ok(items.some((i) => i.id === "tax_return_osvc"));
  });

  it("refinance adds mortgage docs", () => {
    const items = buildDocumentChecklist({
      incomeType: "employee",
      intent: "refinance",
      coApplicant: false,
      hasProperty: false,
      isRefinance: true,
    });
    assert.ok(items.some((i) => i.id === "mortgage_contract"));
  });

  it("completion percent reflects uploaded docs", () => {
    const items = buildDocumentChecklist({
      incomeType: "employee",
      intent: null,
      coApplicant: false,
      hasProperty: false,
      isRefinance: false,
    });
    const merged = mergeChecklistWithVault(items, [
      { id: "d1", checklistItemId: "payslips", category: "income_documents" },
    ]);
    const pct = checklistCompletionPercent(merged);
    assert.ok(pct > 0 && pct < 100);
  });
});

describe("AI extraction — factual only", () => {
  it("detects expired document with exact wording", () => {
    const past = new Date(Date.now() - 86_400_000).toISOString();
    const obs = detectExpiredDocument(past);
    assert.ok(obs);
    assert.ok(obs!.message.includes("datum platnosti do"));
    assert.ok(obs!.message.includes("po platnosti"));
  });

  it("detects missing page 4", () => {
    const obs = detectMissingPages({ expectedPages: 4, actualPages: 3 });
    assert.ok(obs);
    assert.equal(obs!.message, "Chybí strana 4.");
  });

  it("flags income inconsistency vs profile", () => {
    const obs = detectProfileInconsistency({
      fieldKey: "monthly_income",
      extractedValue: 50_000,
      profileValue: 40_000,
      label: "Částka příjmu",
    });
    assert.ok(obs);
    assert.ok(obs!.message.includes("se liší od profilu"));
  });

  it("rejects legal conclusions", () => {
    assert.throws(() => assertNotLegalConclusion("Banka schválí úvěr."));
  });

  it("runs extraction on demo document", () => {
    const doc = DEMO_VAULT_DOCUMENTS[0]!;
    const { observations } = runDocumentExtraction({
      document: doc,
      profile: { netIncome: 45_000, secondaryIncome: 0 } as never,
    });
    assert.ok(observations.some((o) => o.kind === "document_type_identified"));
  });
});

describe("specialist share handoff", () => {
  it("requires explicit consent text", () => {
    const v = validateShareConsent({
      documentIds: ["doc_demo_payslip"],
      scope: ["mortgage_assessment"],
      consentText: "wrong",
      granted: true,
    });
    assert.equal(v.valid, false);
  });

  it("initiates share with valid consent", () => {
    const result = initiateSpecialistShare(
      {
        documentIds: ["doc_demo_payslip"],
        scope: ["mortgage_assessment"],
        consentText: CONSENT_TEXT_REQUIRED,
        granted: true,
      },
      DEMO_VAULT_DOCUMENTS
    );
    assert.equal(result.success, true);
    assert.ok(result.handoffUrl?.includes("vault_handoff"));
  });
});

describe("signed URLs", () => {
  it("returns expiring url contract", () => {
    const res = buildSignedUrlContract({
      documentId: "doc_1",
      purpose: "view",
      expiresInSeconds: 300,
    });
    assert.ok(res.url.includes("doc_1"));
    assert.ok(Date.parse(res.expiresAt) > Date.now());
  });
});

describe("analytics safety", () => {
  it("forbids sensitive document keys", () => {
    assert.ok(VAULT_ANALYTICS_FORBIDDEN.includes("document_content"));
    assert.ok(VAULT_ANALYTICS_FORBIDDEN.includes("filename"));
  });
});
