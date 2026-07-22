/**
 * Produkční / CI ochrana partner + operator + lead collection gate.
 * Nespouští falešnou „právní compliance“ — detekuje placeholder a nekompletní identitu.
 */

import {
  getLegalIdentityConfig,
  isLegalIdentityComplete,
  isLegalTextReviewed,
  mustEnforceLegalIdentityForLeadCollection,
} from "@/config/legal";
import {
  auditPartnerConfig,
  isMortgagePartnerIdentityVerified,
  PARTNER_PLACEHOLDER_PATTERNS,
  type MortgagePartner,
} from "@/lib/legal/partner-config";

export type LegalProductionIssue = {
  code: string;
  severity: "error" | "warn";
  message: string;
};

/** Staging / TODO fráze zakázané ve veřejném UI (CS). */
export const PUBLIC_STAGING_PHRASES = [
  "doplníme po ověření",
  "odkaz doplníme",
  "čeká na ověření",
  "odkaz na JERRS / ČNB registr zveřejníme",
  "registrační údaje doplníme",
  "Doplníme po ověření (zatím neuvedeno)",
  "TODO config",
  "TODO IČO",
  "TODO legal operator",
  "Legal review required",
] as const;

export function collectLegalProductionIssues(options?: {
  requirePartnerHandoff?: boolean;
  requireOperatorIdentity?: boolean;
  /** true = fail when collecting leads without complete operator identity */
  requireIdentityForLeads?: boolean;
}): LegalProductionIssue[] {
  const requirePartnerHandoff =
    options?.requirePartnerHandoff ??
    (process.env.LEGAL_STRICT_PRODUCTION === "true" ||
      process.env.LEGAL_REQUIRE_PARTNER_HANDOFF === "true");

  const leadGate =
    options?.requireIdentityForLeads ??
    mustEnforceLegalIdentityForLeadCollection();

  const requireOperatorIdentity =
    options?.requireOperatorIdentity ??
    (process.env.LEGAL_STRICT_PRODUCTION === "true" ||
      process.env.LEGAL_REQUIRE_OPERATOR_IDENTITY === "true" ||
      leadGate);

  const issues: LegalProductionIssue[] = [];
  const audit = auditPartnerConfig();
  const legal = getLegalIdentityConfig();
  const identityComplete = isLegalIdentityComplete(legal);

  for (const hit of audit.placeholderHits) {
    issues.push({
      code: "PARTNER_PLACEHOLDER_FIELD",
      severity: "error",
      message: `Partner pole obsahuje staging placeholder: ${hit}`,
    });
  }

  for (const p of audit.partners) {
    if (p.jerrsStatus === "LIVE" && !isMortgagePartnerIdentityVerified(p)) {
      issues.push({
        code: "PARTNER_LIVE_WITHOUT_IDENTITY",
        severity: "error",
        message: `Partner ${p.id} má jerrsStatus=LIVE bez ověřeného jména/IČO/JERRS URL.`,
      });
    }
  }

  if (requirePartnerHandoff && !audit.handoffReady) {
    issues.push({
      code: "PARTNER_HANDOFF_NOT_READY",
      severity: "error",
      message: `Partner handoff není ready. Chybí env: ${audit.missingEnv.join(", ") || "(viz audit)"}.`,
    });
  } else if (!audit.handoffReady) {
    issues.push({
      code: "PARTNER_HANDOFF_SOFT",
      severity: "warn",
      message:
        "Partner handoff je v režimu provozovatel-only (identita partnera nezveřejněna). Pro produkční předání vyplňte LEGAL_PARTNER_*.",
    });
  }

  if (requireOperatorIdentity && !identityComplete) {
    issues.push({
      code: leadGate
        ? "OPERATOR_IDENTITY_REQUIRED_FOR_LEADS"
        : "OPERATOR_IDENTITY_MISSING",
      severity: "error",
      message: `Právní identita provozovatele není kompletní (sběr leadů v produkci vyžaduje ověřené údaje). Chybí: ${legal.missingRequiredFields.join(", ")}`,
    });
  } else if (!identityComplete) {
    issues.push({
      code: "OPERATOR_IDENTITY_SOFT",
      severity: "warn",
      message:
        "Úplná obchodní identifikace provozovatele (IČO / právní jméno / registr) není v configu — produkční sběr leadů na Vercel production selže, dokud není doplněno.",
    });
  }

  if (!isLegalTextReviewed(legal)) {
    issues.push({
      code: "LEGAL_TEXT_NOT_REVIEWED",
      severity: "warn",
      message:
        "LEGAL_REVIEWED_BY + LEGAL_LAST_REVIEW_DATE nejsou vyplněné — neveřejňujte tvrzení „právně zkontrolováno“.",
    });
  }

  return issues;
}

export function assertNoPartnerPlaceholdersInLiveFields(
  partners: MortgagePartner[]
): void {
  for (const p of partners) {
    if (p.jerrsStatus !== "LIVE") continue;
    const blob = [p.legalName, p.ico, p.jerrsVerificationUrl]
      .filter(Boolean)
      .join(" ");
    for (const re of PARTNER_PLACEHOLDER_PATTERNS) {
      if (re.test(blob)) {
        throw new Error(
          `LIVE partner ${p.id} contains placeholder matching ${re}`
        );
      }
    }
  }
}

/**
 * Tvrdé selhání (CI / Vercel production build):
 * LEGAL_STRICT_PRODUCTION=true nebo VERCEL_ENV=production (lead gate).
 */
export function assertLegalProductionGate(): void {
  const issues = collectLegalProductionIssues({
    requirePartnerHandoff: process.env.LEGAL_STRICT_PRODUCTION === "true",
    requireOperatorIdentity: true,
    requireIdentityForLeads: mustEnforceLegalIdentityForLeadCollection(),
  });
  const errors = issues.filter((i) => i.severity === "error");
  if (errors.length > 0) {
    throw new Error(
      `Legal production gate failed:\n${errors.map((e) => `- ${e.code}: ${e.message}`).join("\n")}`
    );
  }
}

/** Runtime: smí API přijímat osobní leady? */
export function canAcceptPersonalLeads(): boolean {
  if (!mustEnforceLegalIdentityForLeadCollection()) return true;
  return isLegalIdentityComplete();
}
