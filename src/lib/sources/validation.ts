/**
 * Pravidla provenance — VERIFIED vyžaduje externí autoritu, ne interní storage.
 */

import type { DataRecord, DataStatus, ExternalProvenance } from "@/lib/data/types";

const INTERNAL_PATH_RE =
  /(?:^|[/\\])(?:src[/\\]|node_modules[/\\]|\.next[/\\])/i;
const INTERNAL_HINT_RE =
  /\b(supabase|localStorage|hj-[a-z0-9-]+|static-regulatory|makeDataRecord)\b/i;

export type ProvenanceIssue = {
  code:
    | "verified_without_provenance"
    | "verified_without_external_ref"
    | "internal_presented_as_source"
    | "invalid_url"
    | "missing_last_checked"
    | "missing_organization"
    | "missing_title"
    | "weak_homepage_only";
  message: string;
  field?: string;
};

export function isHttpUrl(value: string | null | undefined): boolean {
  if (!value) return false;
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/** Text vypadá jako interní cesta / technický identifikátor, ne veřejný zdroj. */
export function looksLikeInternalStorage(
  value: string | null | undefined
): boolean {
  if (!value) return false;
  const v = value.trim();
  if (INTERNAL_PATH_RE.test(v)) return true;
  if (v.startsWith("src/") || v.startsWith("src\\")) return true;
  return INTERNAL_HINT_RE.test(v);
}

export function validateExternalProvenance(
  provenance: ExternalProvenance | null | undefined,
  opts?: { requireForVerified?: boolean }
): ProvenanceIssue[] {
  const issues: ProvenanceIssue[] = [];
  if (!provenance) {
    if (opts?.requireForVerified) {
      issues.push({
        code: "verified_without_provenance",
        message:
          "Status VERIFIED vyžaduje ExternalProvenance s autoritativním zdrojem.",
      });
    }
    return issues;
  }

  if (!provenance.title?.trim()) {
    issues.push({
      code: "missing_title",
      message: "Chybí title provenance.",
      field: "title",
    });
  }
  if (!provenance.organization?.trim()) {
    issues.push({
      code: "missing_organization",
      message: "Chybí organization provenance.",
      field: "organization",
    });
  }
  if (!provenance.lastCheckedAt?.trim()) {
    issues.push({
      code: "missing_last_checked",
      message: "Chybí lastCheckedAt.",
      field: "lastCheckedAt",
    });
  }

  const hasUrl = isHttpUrl(provenance.url);
  const hasRef = Boolean(provenance.reference?.trim());
  if (!hasUrl && !hasRef) {
    issues.push({
      code: "verified_without_external_ref",
      message: "VERIFIED vyžaduje URL nebo textovou referenci externího zdroje.",
      field: "url",
    });
  }
  if (provenance.url && !hasUrl) {
    issues.push({
      code: "invalid_url",
      message: `Neplatná URL: ${provenance.url}`,
      field: "url",
    });
  }
  if (looksLikeInternalStorage(provenance.url)) {
    issues.push({
      code: "internal_presented_as_source",
      message: "URL nesmí odkazovat na interní storage.",
      field: "url",
    });
  }
  if (looksLikeInternalStorage(provenance.reference)) {
    issues.push({
      code: "internal_presented_as_source",
      message: "Reference nesmí být interní cesta / tabulka.",
      field: "reference",
    });
  }
  if (looksLikeInternalStorage(provenance.title)) {
    issues.push({
      code: "internal_presented_as_source",
      message: "Title nesmí být interní cesta.",
      field: "title",
    });
  }

  return issues;
}

/**
 * Může záznam legálně nést status VERIFIED?
 * Interní soubor sám o sobě nestačí.
 */
export function canClaimVerified(input: {
  provenance?: ExternalProvenance | null;
  source?: string | null;
  sourceUrl?: string | null;
  internalStorageRef?: string | null;
}): boolean {
  const issues = validateExternalProvenance(input.provenance, {
    requireForVerified: true,
  });
  if (issues.length > 0) return false;
  if (looksLikeInternalStorage(input.source)) return false;
  if (looksLikeInternalStorage(input.sourceUrl)) return false;
  if (
    input.internalStorageRef &&
    !input.provenance?.url &&
    !input.provenance?.reference
  ) {
    return false;
  }
  return true;
}

/**
 * Pokud nelze VERIFIED, vrať bezpečnější status (nikdy neupgrade).
 */
export function downgradeUnverifiedStatus(
  desired: DataStatus,
  input: {
    provenance?: ExternalProvenance | null;
    source?: string | null;
    sourceUrl?: string | null;
    internalStorageRef?: string | null;
  }
): DataStatus {
  if (desired !== "VERIFIED") return desired;
  if (canClaimVerified(input)) return "VERIFIED";
  if (input.source && !looksLikeInternalStorage(input.source)) {
    return "ESTIMATE";
  }
  return "UNVERIFIED";
}

export function validateDataRecordProvenance(
  record: Pick<
    DataRecord,
    | "id"
    | "status"
    | "source"
    | "sourceUrl"
    | "provenance"
    | "internalStorageRef"
  >
): ProvenanceIssue[] {
  const issues: ProvenanceIssue[] = [];

  if (looksLikeInternalStorage(record.source)) {
    issues.push({
      code: "internal_presented_as_source",
      message: `Veřejné pole source nesmí být interní identifikátor (${record.id}).`,
      field: "source",
    });
  }
  if (looksLikeInternalStorage(record.sourceUrl)) {
    issues.push({
      code: "internal_presented_as_source",
      message: `sourceUrl nesmí být interní cesta (${record.id}).`,
      field: "sourceUrl",
    });
  }

  if (record.status === "VERIFIED") {
    issues.push(
      ...validateExternalProvenance(record.provenance, {
        requireForVerified: true,
      })
    );
    if (!canClaimVerified(record)) {
      issues.push({
        code: "verified_without_external_ref",
        message: `Záznam ${record.id} má VERIFIED bez dostatečné externí provenance.`,
      });
    }
  }

  return issues;
}

/** Veřejný display zdroje — nikdy internalStorageRef. */
export function publicSourceLabel(record: {
  provenance?: ExternalProvenance | null;
  source: string;
}): string {
  if (record.provenance?.organization) {
    return record.provenance.title
      ? `${record.provenance.organization} — ${record.provenance.title}`
      : record.provenance.organization;
  }
  return record.source;
}
