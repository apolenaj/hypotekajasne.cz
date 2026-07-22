/**
 * Claim-level evidence view-model (PROMPT 12).
 * Soft of truth zůstává FactClaim — toto je UI kontrakt.
 */

import { JURISDICTION_LABELS_CS } from "@/lib/sources/labels";
import {
  MANUAL_VERIFICATION_NOTE,
  type FactClaim,
  type FactClaimStatus,
} from "@/lib/sources/types";
import type { LegalClaim } from "@/lib/country-dossier/types";
import { factStatusToDataStatus, formatFactClaimValue } from "@/lib/sources/fact-claims-display";
import type { DataStatus } from "@/lib/data/types";
import { statusBadgeLabel } from "@/lib/data/display";

export { MANUAL_VERIFICATION_NOTE };
export type SourceEvidence = {
  id: string | null;
  /** Tvrzení */
  statement: string;
  /** Hodnota */
  value: string | null;
  /** Jurisdikce (kód) */
  jurisdiction: string;
  jurisdictionLabel: string;
  /** Zdroj (název organizace / dokumentu) */
  sourceName: string;
  /** Konkrétní URL — null = není ověřený deep-link */
  sourceUrl: string | null;
  /** Datum ověření */
  verifiedAt: string | null;
  /** Platnost od */
  validFrom: string | null;
  /** Platnost do */
  validTo: string | null;
  /** Status */
  status: FactClaimStatus;
  statusLabel: string;
  dataStatus: DataStatus;
  /** Poznámka */
  notes: string | null;
  sourceType: FactClaim["sourceType"] | null;
};

export const FACT_CLAIM_STATUS_LABELS_CS: Record<FactClaimStatus, string> = {
  VERIFIED: "VERIFIED",
  UNVERIFIED: "UNVERIFIED",
  NEEDS_UPDATE: "NEEDS UPDATE",
  MODEL: "MODEL",
  ESTIMATE: "ESTIMATE",
};

export function formatValidityPeriod(
  validFrom: string | null | undefined,
  validTo: string | null | undefined
): string {
  if (!validFrom && !validTo) return "Neuvedena";
  if (validFrom && validTo) return `${validFrom} → ${validTo}`;
  if (validFrom) return `od ${validFrom}`;
  return `do ${validTo}`;
}

export function factClaimToSourceEvidence(fact: FactClaim): SourceEvidence {
  const dataStatus = factStatusToDataStatus(fact.status);
  return {
    id: fact.id,
    statement: fact.claim,
    value:
      fact.value !== null && fact.value !== undefined
        ? formatFactClaimValue(fact)
        : null,
    jurisdiction: fact.jurisdiction,
    jurisdictionLabel:
      JURISDICTION_LABELS_CS[fact.jurisdiction] ?? fact.jurisdiction,
    sourceName: fact.sourceName,
    sourceUrl: fact.sourceUrl,
    verifiedAt: fact.verifiedAt,
    validFrom: fact.validFrom ?? null,
    validTo: fact.validTo ?? null,
    status: fact.status,
    statusLabel: FACT_CLAIM_STATUS_LABELS_CS[fact.status],
    dataStatus,
    notes: fact.notes ?? null,
    sourceType: fact.sourceType,
  };
}

/** LegalClaim z dossieru — slabší evidence (bez FactClaim id). */
export function legalClaimToSourceEvidence(
  claim: LegalClaim,
  jurisdiction = "multi"
): SourceEvidence {
  const status: FactClaimStatus =
    claim.status === "VERIFIED"
      ? "VERIFIED"
      : claim.status === "MODEL"
        ? "MODEL"
        : claim.status === "ESTIMATE"
          ? "ESTIMATE"
          : claim.status === "STALE"
            ? "NEEDS_UPDATE"
            : "UNVERIFIED";

  return {
    id: null,
    statement: claim.text,
    value: null,
    jurisdiction,
    jurisdictionLabel:
      JURISDICTION_LABELS_CS[jurisdiction] ?? jurisdiction,
    sourceName: claim.source,
    sourceUrl: claim.sourceUrl,
    verifiedAt: claim.asOf || null,
    validFrom: null,
    validTo: null,
    status,
    statusLabel: FACT_CLAIM_STATUS_LABELS_CS[status],
    dataStatus: claim.status,
    notes: claim.notes ?? null,
    sourceType: null,
  };
}

export function evidencePrimaryUrlLabel(evidence: SourceEvidence): string {
  if (evidence.sourceUrl) return evidence.sourceUrl;
  return "URL není k dispozici — ponecháno k ručnímu ověření";
}

export function evidenceStatusBadgeText(evidence: SourceEvidence): string {
  return statusBadgeLabel(evidence.dataStatus);
}
