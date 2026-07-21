/**
 * Produkční / CI ochrana partner + operator config.
 * Nespouští falešnou „právní compliance“ — jen detekuje placeholder a LIVE bez dat.
 */

import { getOperatorIdentity } from "@/lib/legal/operator";
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
] as const;

export function collectLegalProductionIssues(options?: {
  /** true = partner handoff musí být ready (CI / produkční gate) */
  requirePartnerHandoff?: boolean;
  /** true = operator IČO musí být filled */
  requireOperatorIdentity?: boolean;
}): LegalProductionIssue[] {
  const requirePartnerHandoff =
    options?.requirePartnerHandoff ??
    (process.env.LEGAL_STRICT_PRODUCTION === "true" ||
      process.env.LEGAL_REQUIRE_PARTNER_HANDOFF === "true");
  const requireOperatorIdentity =
    options?.requireOperatorIdentity ??
    (process.env.LEGAL_STRICT_PRODUCTION === "true" ||
      process.env.LEGAL_REQUIRE_OPERATOR_IDENTITY === "true");

  const issues: LegalProductionIssue[] = [];
  const audit = auditPartnerConfig();
  const op = getOperatorIdentity();

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

  if (requireOperatorIdentity && !op.isProductionReady) {
    issues.push({
      code: "OPERATOR_IDENTITY_MISSING",
      severity: "error",
      message: `Chybí provozovatel: ${op.missingFields.join(", ")}`,
    });
  } else if (!op.isProductionReady) {
    issues.push({
      code: "OPERATOR_IDENTITY_SOFT",
      severity: "warn",
      message:
        "Úplná obchodní identifikace provozovatele (IČO / právní jméno) není v configu — placené služby zůstávají vypnuté.",
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
 * Volitelné tvrdé selhání (CI): LEGAL_STRICT_PRODUCTION=true
 * nebo skript `npm run check:legal`.
 */
export function assertLegalProductionGate(): void {
  const issues = collectLegalProductionIssues({
    requirePartnerHandoff: true,
    requireOperatorIdentity: true,
  });
  const errors = issues.filter((i) => i.severity === "error");
  if (errors.length > 0) {
    throw new Error(
      `Legal production gate failed:\n${errors.map((e) => `- ${e.code}: ${e.message}`).join("\n")}`
    );
  }
}
