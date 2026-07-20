import type { CentralAlert } from "@/lib/alert-center/types";

/**
 * Merge alerts by fingerprint — keep highest priority (lowest number).
 * Prevents 5 alerts about the same rate move.
 */
export function dedupeAlerts(alerts: CentralAlert[]): {
  alerts: CentralAlert[];
  removedCount: number;
} {
  const byFingerprint = new Map<string, CentralAlert>();

  for (const alert of alerts) {
    const existing = byFingerprint.get(alert.fingerprint);
    if (!existing || alert.priority < existing.priority) {
      byFingerprint.set(alert.fingerprint, alert);
    }
  }

  const deduped = [...byFingerprint.values()].sort(
    (a, b) => a.priority - b.priority || Date.parse(b.createdAt) - Date.parse(a.createdAt)
  );

  return {
    alerts: deduped,
    removedCount: alerts.length - deduped.length,
  };
}

/** Skip re-emitting within dedupe window (default 24h for same fingerprint) */
export function filterAlreadyEmitted(
  alerts: CentralAlert[],
  emittedFingerprints: Record<string, string>,
  now: Date = new Date(),
  windowHours = 24
): CentralAlert[] {
  const windowMs = windowHours * 3_600_000;
  return alerts.filter((a) => {
    const prev = emittedFingerprints[a.fingerprint];
    if (!prev) return true;
    return now.getTime() - Date.parse(prev) > windowMs;
  });
}

export function stampEmittedFingerprints(
  alerts: CentralAlert[],
  emitted: Record<string, string>,
  now: Date = new Date()
): Record<string, string> {
  const next = { ...emitted };
  for (const a of alerts) {
    next[a.fingerprint] = now.toISOString();
  }
  return next;
}

export function buildFingerprint(
  type: string,
  scope: string,
  changeKey: string
): string {
  return `${type}:${scope}:${changeKey}`.replace(/\s+/g, "_").slice(0, 120);
}

/** Normalize rate delta to 0.05 p.b. buckets for dedupe */
export function rateChangeKey(fromRate: number, toRate: number): string {
  const deltaBp = Math.round((toRate - fromRate) * 100);
  const bucket = Math.round(deltaBp / 5) * 5;
  return `delta_${bucket}bp_from_${fromRate.toFixed(2)}`;
}

export function ltvScopeKey(ltvPercent: number): string {
  const bucket = Math.round(ltvPercent / 10) * 10;
  return `ltv_${bucket}`;
}
