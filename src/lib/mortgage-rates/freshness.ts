/**
 * Compatibility re-exports — canonical freshness lives in
 * `@/lib/rates/mortgage-rate-freshness`.
 */

export {
  RATE_AGING_MAX_AGE_MS,
  RATE_FRESH_MAX_AGE_MS,
  ageMsFromIso,
  rateFreshnessFromCheckedAt,
  rateFreshnessFromCheckedAt as referenceRateFreshnessFromCheckedAt,
  type RateFreshness,
} from "@/lib/rates/mortgage-rate-freshness";

import type { RateFreshness } from "@/lib/rates/mortgage-rate-freshness";

/** Usable for display (not only fallback). Stale is still returned from DB. */
export function isUsableReferenceFreshness(freshness: RateFreshness): boolean {
  return (
    freshness === "fresh" || freshness === "aging" || freshness === "stale"
  );
}
