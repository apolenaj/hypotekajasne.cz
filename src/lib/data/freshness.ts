/**
 * Freshness & effective status — nikdy nepromovat MODEL → LIVE.
 */

import type { DataRecord, DataStatus } from "@/lib/data/types";

/** Maximální stáří od lastFetchedAt / lastVerifiedAt podle deklarovaného statusu. */
export const FRESHNESS_THRESHOLD_MS: Record<DataStatus, number> = {
  LIVE: 48 * 60 * 60 * 1000, // 48 h
  PARTNER_QUOTE: 7 * 24 * 60 * 60 * 1000, // 7 dní
  VERIFIED: 180 * 24 * 60 * 60 * 1000, // ~6 měsíců
  MODEL: Number.POSITIVE_INFINITY, // model nestárne do LIVE
  ESTIMATE: Number.POSITIVE_INFINITY,
  UNVERIFIED: Number.POSITIVE_INFINITY,
  STALE: 0,
};

export type FreshnessResult = {
  /** Status po aplikaci thresholdu (nikdy LIVE z MODEL). */
  effectiveStatus: DataStatus;
  isStaleByAge: boolean;
  ageMs: number | null;
  thresholdMs: number;
  referenceAt: string | null;
};

function parseTime(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : null;
}

/**
 * Referenční čas pro freshness: preferuj lastFetchedAt, jinak lastVerifiedAt.
 */
export function getFreshnessReferenceAt(
  record: Pick<DataRecord, "lastFetchedAt" | "lastVerifiedAt">
): string | null {
  return record.lastFetchedAt ?? record.lastVerifiedAt ?? null;
}

/**
 * Vypočítá efektivní status. MODEL a STALE se nikdy nepromují na LIVE.
 * LIVE / PARTNER_QUOTE / VERIFIED po překročení thresholdu → STALE.
 */
export function resolveEffectiveStatus(
  record: Pick<
    DataRecord,
    "status" | "lastFetchedAt" | "lastVerifiedAt" | "value"
  >,
  nowMs: number = Date.now()
): FreshnessResult {
  const declared = record.status;
  const thresholdMs = FRESHNESS_THRESHOLD_MS[declared];
  const referenceAt = getFreshnessReferenceAt(record);
  const refMs = parseTime(referenceAt);
  const ageMs = refMs == null ? null : Math.max(0, nowMs - refMs);

  // Chybějící value u údajů, které mají být aktuální → STALE
  if (
    (declared === "LIVE" || declared === "PARTNER_QUOTE") &&
    (record.value == null ||
      (typeof record.value === "number" && !Number.isFinite(record.value)))
  ) {
    return {
      effectiveStatus: "STALE",
      isStaleByAge: false,
      ageMs,
      thresholdMs,
      referenceAt,
    };
  }

  // MODEL / ESTIMATE / UNVERIFIED nikdy nevydávat za LIVE
  if (
    declared === "MODEL" ||
    declared === "ESTIMATE" ||
    declared === "UNVERIFIED"
  ) {
    return {
      effectiveStatus: declared,
      isStaleByAge: false,
      ageMs,
      thresholdMs,
      referenceAt,
    };
  }

  if (declared === "STALE") {
    return {
      effectiveStatus: "STALE",
      isStaleByAge: false,
      ageMs,
      thresholdMs,
      referenceAt,
    };
  }

  const isStaleByAge =
    Number.isFinite(thresholdMs) &&
    ageMs != null &&
    ageMs > thresholdMs;

  // Bez timestampu u LIVE = konzervativně STALE (nevíme, zda je čerstvé)
  const missingStampAsStale =
    (declared === "LIVE" || declared === "PARTNER_QUOTE") && refMs == null;

  if (isStaleByAge || missingStampAsStale) {
    return {
      effectiveStatus: "STALE",
      isStaleByAge: isStaleByAge || missingStampAsStale,
      ageMs,
      thresholdMs,
      referenceAt,
    };
  }

  return {
    effectiveStatus: declared,
    isStaleByAge: false,
    ageMs,
    thresholdMs,
    referenceAt,
  };
}

/** Aplikuje freshness na celý DataRecord (immutable). */
export function withEffectiveStatus<T extends DataRecord["value"]>(
  record: DataRecord<T>,
  nowMs?: number
): DataRecord<T> {
  const { effectiveStatus } = resolveEffectiveStatus(
    record as Pick<
      DataRecord,
      "status" | "lastFetchedAt" | "lastVerifiedAt" | "value"
    >,
    nowMs
  );
  if (effectiveStatus === record.status) return record;
  return {
    ...record,
    status: effectiveStatus,
    notes:
      effectiveStatus === "STALE" && record.status !== "STALE"
        ? [record.notes, "Automaticky označeno jako „Čeká na aktualizaci“ (data jsou starší)."]
            .filter(Boolean)
            .join(" ")
        : record.notes,
  };
}

export function formatCzechDateTime(iso: string | null | undefined): string {
  if (!iso || Number.isNaN(Date.parse(iso))) return "—";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatCzechDate(iso: string | null | undefined): string {
  if (!iso || Number.isNaN(Date.parse(iso))) return "—";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
}

export function formatAgeLabel(ageMs: number | null): string | null {
  if (ageMs == null) return null;
  const hours = Math.floor(ageMs / (60 * 60 * 1000));
  if (hours < 1) return "méně než 1 h";
  if (hours < 48) return `${hours} h`;
  const days = Math.floor(hours / 24);
  return `${days} d`;
}
