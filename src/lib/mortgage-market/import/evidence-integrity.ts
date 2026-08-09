/**
 * Evidence integrity + source-collision reporting for import manifests.
 * No production SQL. No automatic collision resolution.
 */

import type {
  ImportAuditStatus,
  ImportRateRecord,
  ImportValidationIssue,
  MortgageMarketImportManifest,
} from "@/lib/mortgage-market/import/types";
import { PRIMARY_LENDER_EVIDENCE_TYPES } from "@/lib/mortgage-market/import/types";
import { validateMortgageMarketImport } from "@/lib/mortgage-market/import/validate";

const PRIMARY = new Set<string>(PRIMARY_LENDER_EVIDENCE_TYPES);
const CHECKED_AT = "2026-08-09T00:00:00.000Z";

export type RateStatusCounts = {
  total: number;
  IMPORT_READY: number;
  STRUCTURED: number;
  VERIFIED: number;
  HOLD: number;
  FOUND: number;
  other: number;
};

export type SourceCollision = {
  lender: string;
  product: string;
  fixationMonths: number | null;
  sourceA: string;
  rateA: number;
  recordA: string;
  sourceB: string;
  rateB: number;
  recordB: string;
  likelyExplanation: string | null;
  status: "HOLD" | "NEEDS_RECONCILIATION";
};

export type EvidenceIntegrityResult = {
  ok: boolean;
  zeroInference: "PASS" | "FAIL";
  issues: ImportValidationIssue[];
  statusCounts: RateStatusCounts;
  holdRowCount: number;
  collisions: SourceCollision[];
  importReadyRateIds: string[];
};

function issue(
  recordId: string,
  code: string,
  message: string
): ImportValidationIssue {
  return { recordId, code, message, severity: "hold" };
}

export function countRateVariantsByStatus(
  rates: ImportRateRecord[]
): RateStatusCounts {
  const counts: RateStatusCounts = {
    total: rates.length,
    IMPORT_READY: 0,
    STRUCTURED: 0,
    VERIFIED: 0,
    HOLD: 0,
    FOUND: 0,
    other: 0,
  };
  for (const rate of rates) {
    const s = rate.auditStatus;
    if (s === "IMPORT_READY") counts.IMPORT_READY += 1;
    else if (s === "STRUCTURED") counts.STRUCTURED += 1;
    else if (s === "VERIFIED") counts.VERIFIED += 1;
    else if (s === "HOLD") counts.HOLD += 1;
    else if (s === "FOUND") counts.FOUND += 1;
    else counts.other += 1;
  }
  return counts;
}

/**
 * Detect same lender/product/fixation/LTV/scenario with conflicting rates.
 * Intentional scenario splits (e.g. with/without PPI) are not collisions.
 */
export function detectSourceCollisions(
  rates: ImportRateRecord[]
): SourceCollision[] {
  const groups = new Map<string, ImportRateRecord[]>();
  for (const rate of rates) {
    if (rate.fixationMonths == null) continue;
    const key = [
      rate.lenderSlug,
      rate.productSlug,
      rate.fixationMonths,
      rate.pricingScenarioKey,
      rate.ltv.kind === "explicit"
        ? `${rate.ltv.ltvMin}-${rate.ltv.ltvMax}-${rate.ltv.ltvMinExclusive}`
        : "ltv_unspecified",
      rate.financingPurpose ?? "",
    ].join("|");
    const list = groups.get(key) ?? [];
    list.push(rate);
    groups.set(key, list);
  }

  const collisions: SourceCollision[] = [];
  for (const [, group] of groups) {
    const distinctRates = [...new Set(group.map((r) => r.nominalInterestRate))];
    if (distinctRates.length < 2) continue;
    const a = group.find((r) => r.nominalInterestRate === distinctRates[0])!;
    const b = group.find((r) => r.nominalInterestRate === distinctRates[1])!;
    collisions.push({
      lender: a.lenderSlug,
      product: a.productSlug,
      fixationMonths: a.fixationMonths,
      sourceA: a.evidence.sourceName,
      rateA: a.nominalInterestRate,
      recordA: a.recordId,
      sourceB: b.evidence.sourceName,
      rateB: b.nominalInterestRate,
      recordB: b.recordId,
      likelyExplanation: null,
      status: "NEEDS_RECONCILIATION",
    });
  }
  return collisions;
}

/**
 * Known documented collision: ČS Oznámení table vs web campaign headline.
 * Not the same fixation key (campaign has null fixation) — report explicitly.
 */
export function documentedCsCampaignCollision(
  rates: ImportRateRecord[]
): SourceCollision | null {
  const oznameni = rates.find(
    (r) =>
      r.lenderSlug === "ceska-sporitelna" &&
      r.auditStatus === "IMPORT_READY" &&
      r.pricingScenarioKey === "oznameni_account_ppi_budoucnost" &&
      r.fixationMonths === 36
  );
  const campaign = rates.find(
    (r) => r.recordId === "cs-web-campaign-od-5-09-unreconciled"
  );
  if (!oznameni || !campaign) return null;
  return {
    lender: "ceska-sporitelna",
    product: "hypoteka-oznameni-fixed",
    fixationMonths: 36,
    sourceA: oznameni.evidence.sourceName,
    rateA: oznameni.nominalInterestRate,
    recordA: oznameni.recordId,
    sourceB: campaign.evidence.sourceName,
    rateB: campaign.nominalInterestRate,
    recordB: campaign.recordId,
    likelyExplanation:
      "Oznámení fixation table vs product-page headline od 5,09% without fixation; do not invent fixation for the headline",
    status: "NEEDS_RECONCILIATION",
  };
}

function assertImportReadyEvidenceIntegrity(
  rate: ImportRateRecord,
  manifest: MortgageMarketImportManifest
): ImportValidationIssue[] {
  const issues: ImportValidationIssue[] = [];
  const id = rate.recordId;

  if (rate.checkedAt !== CHECKED_AT) {
    issues.push(issue(id, "CHECKED_AT", `checked_at must be ${CHECKED_AT}`));
  }
  if (!rate.evidence?.evidenceId) {
    issues.push(issue(id, "EVIDENCE_ID", "missing evidenceId"));
  }
  if (!PRIMARY.has(rate.evidence.sourceType)) {
    issues.push(issue(id, "EVIDENCE_PRIMARY", "IMPORT_READY requires primary evidence"));
  }
  if (
    rate.evidence.lenderSlug &&
    rate.evidence.lenderSlug !== rate.lenderSlug
  ) {
    issues.push(issue(id, "EVIDENCE_LENDER", "evidence lender mismatch"));
  }
  if (rate.ltvInferredFromProductMax === true) {
    issues.push(issue(id, "LTV_INFERRED", "product max LTV copied into rate LTV"));
  }
  if (
    rate.ltv.kind === "explicit" &&
    rate.productMaxLtv != null &&
    rate.ltv.ltvMin === 0 &&
    rate.ltv.ltvMax === rate.productMaxLtv
  ) {
    // Only flag when explicitly marked inferred; equality alone is allowed if evidenced.
  }
  const allowNullFixation =
    rate.fixationMonths == null &&
    rate.rateType === "advertised_from" &&
    rate.ltv.kind === "unspecified" &&
    (rate.pricingScenarioKey.includes("product_page_advertised") ||
      rate.pricingScenarioKey.includes("advertised_from_conditional"));
  if (
    !allowNullFixation &&
    (rate.fixationMonths == null || rate.fixationMonths <= 0)
  ) {
    issues.push(issue(id, "FIXATION", "IMPORT_READY requires published fixation"));
  }
  for (const c of rate.conditions ?? []) {
    if (c.effectInferred === true) {
      issues.push(
        issue(id, "DISCOUNT_INFERRED", `inferred effect on ${c.conditionType}`)
      );
    }
  }

  const lender = (manifest.lenders ?? []).find((l) => l.slug === rate.lenderSlug);
  if (!lender) {
    issues.push(issue(id, "LENDER_MISSING", "lender not in manifest"));
  }
  const product = (manifest.products ?? []).find(
    (p) => p.lenderSlug === rate.lenderSlug && p.slug === rate.productSlug
  );
  if (!product) {
    issues.push(issue(id, "PRODUCT_MISSING", "product not in manifest"));
  }

  // Campaign rates must never be IMPORT_READY
  if (
    rate.pricingScenarioKey.includes("campaign") ||
    rate.pricingScenarioKey.includes("unreconciled")
  ) {
    issues.push(
      issue(id, "CAMPAIGN_MIX", "campaign/unreconciled scenario cannot be IMPORT_READY")
    );
  }

  return issues;
}

export function verifyEvidenceIntegrity(
  manifest: MortgageMarketImportManifest
): EvidenceIntegrityResult {
  const validation = validateMortgageMarketImport(manifest);
  const issues = [...validation.issues];
  const statusCounts = countRateVariantsByStatus(manifest.rates);

  const sumStatuses =
    statusCounts.IMPORT_READY +
    statusCounts.STRUCTURED +
    statusCounts.VERIFIED +
    statusCounts.HOLD +
    statusCounts.FOUND +
    statusCounts.other;
  if (sumStatuses !== statusCounts.total) {
    issues.push(
      issue(
        manifest.manifestId,
        "STATUS_SUM",
        `status counts ${sumStatuses} != total ${statusCounts.total}`
      )
    );
  }

  const importReadyRates = manifest.rates.filter(
    (r) => r.auditStatus === "IMPORT_READY"
  );
  for (const rate of importReadyRates) {
    issues.push(...assertImportReadyEvidenceIntegrity(rate, manifest));
  }

  for (const example of manifest.representativeExamples ?? []) {
    if (example.rpsnCalculated === true) {
      issues.push(
        issue(example.recordId, "RPSN_CALCULATED", "RPSN must not be calculated")
      );
    }
    if (
      example.auditStatus === "IMPORT_READY" &&
      (example.rpsn == null || !Number.isFinite(example.rpsn))
    ) {
      issues.push(
        issue(example.recordId, "RPSN_MISSING", "IMPORT_READY example needs published RPSN")
      );
    }
  }

  // Stale prior KB 3y matrix (5.39 / 5.79) must not remain as current active rates
  for (const rate of manifest.rates) {
    if (
      rate.recordId === "kb-mortgage-3y-le80" &&
      Math.abs(rate.nominalInterestRate - 5.39) < 1e-9 &&
      rate.auditStatus === "IMPORT_READY"
    ) {
      issues.push(
        issue(
          rate.recordId,
          "STALE_KB_539",
          "stale KB 3y <=80 5.39 must not remain as current IMPORT_READY rate"
        )
      );
    }
    if (
      rate.recordId === "kb-mortgage-3y-gt80-90" &&
      Math.abs(rate.nominalInterestRate - 5.79) < 1e-9 &&
      rate.auditStatus === "IMPORT_READY"
    ) {
      issues.push(
        issue(
          rate.recordId,
          "STALE_KB_579",
          "stale KB 3y >80–90 5.79 must not remain as current IMPORT_READY rate"
        )
      );
    }
  }

  const collisions = [
    ...detectSourceCollisions(manifest.rates),
    documentedCsCampaignCollision(manifest.rates),
  ].filter((c): c is SourceCollision => c != null);

  const zeroInference =
    issues.length === 0 && validation.issues.length === 0 ? "PASS" : "FAIL";

  return {
    ok: issues.length === 0,
    zeroInference,
    issues,
    statusCounts,
    holdRowCount: manifest.holdRows?.length ?? 0,
    collisions,
    importReadyRateIds: importReadyRates.map((r) => r.recordId),
  };
}

export function formatEvidenceIntegrityReport(
  result: EvidenceIntegrityResult
): string {
  const lines = [
    `ZERO-INFERENCE: ${result.zeroInference}`,
    `Rate variants total: ${result.statusCounts.total}`,
    `  IMPORT_READY: ${result.statusCounts.IMPORT_READY}`,
    `  STRUCTURED: ${result.statusCounts.STRUCTURED}`,
    `  VERIFIED: ${result.statusCounts.VERIFIED}`,
    `  HOLD: ${result.statusCounts.HOLD}`,
    `  FOUND: ${result.statusCounts.FOUND}`,
    `  other: ${result.statusCounts.other}`,
    `HOLD rows: ${result.holdRowCount}`,
    `Source collisions: ${result.collisions.length}`,
  ];
  for (const c of result.collisions) {
    lines.push(
      `  - ${c.lender}/${c.product} fix=${c.fixationMonths}: ${c.rateA} (${c.sourceA}) vs ${c.rateB} (${c.sourceB}) → ${c.status}`
    );
    if (c.likelyExplanation) lines.push(`    explanation: ${c.likelyExplanation}`);
  }
  if (result.issues.length) {
    lines.push(`Issues (${result.issues.length}):`);
    for (const i of result.issues) {
      lines.push(`  - [${i.code}] ${i.recordId}: ${i.message}`);
    }
  }
  return lines.join("\n");
}

export type { ImportAuditStatus };
