/**
 * Central freshness for Phase 2 reference mortgage rates (owner ~weekly review).
 * Not customer-facing yet — later UI mapping:
 *   fresh  → OVĚŘENO / current orientation
 *   aging  → still usable + explicit checked date
 *   stale  → AKTUALIZUJEME / fallback behavior
 */

export type RateFreshness = "fresh" | "aging" | "stale" | "fallback";

const DAY_MS = 24 * 60 * 60 * 1000;

/** 0–7 days inclusive → fresh (age < 8 days). */
export const RATE_FRESH_MAX_AGE_MS = 8 * DAY_MS;

/** 8–14 days inclusive → aging (age < 15 days). */
export const RATE_AGING_MAX_AGE_MS = 15 * DAY_MS;

export function ageMsFromIso(
  iso: string | null | undefined,
  nowMs: number = Date.now()
): number | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return null;
  return Math.max(0, nowMs - t);
}

/**
 * checked_at → freshness.
 * Missing/invalid timestamp → stale (treat as needs update).
 */
export function rateFreshnessFromCheckedAt(
  checkedAt: string | null | undefined,
  nowMs: number = Date.now()
): Exclude<RateFreshness, "fallback"> {
  const age = ageMsFromIso(checkedAt, nowMs);
  if (age == null) return "stale";
  if (age < RATE_FRESH_MAX_AGE_MS) return "fresh";
  if (age < RATE_AGING_MAX_AGE_MS) return "aging";
  return "stale";
}
