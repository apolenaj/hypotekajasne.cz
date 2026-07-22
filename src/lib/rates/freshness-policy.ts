/**
 * Freshness policy pro MortgageRateRecord (PROMPT 6).
 * LIVE starší než limit → STALE. MODEL se nikdy nepromuje na LIVE.
 */

import { FRESHNESS_THRESHOLD_MS } from "@/lib/data/freshness";
import type { MortgageRateStatus } from "@/lib/rates/types";

export const RATE_LIVE_MAX_AGE_MS = FRESHNESS_THRESHOLD_MS.LIVE;
export const RATE_VERIFIED_MAX_AGE_MS = FRESHNESS_THRESHOLD_MS.VERIFIED;

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
 * Aplikuje freshness na deklarovaný status + datum fetch.
 * - Bez sazby → UNAVAILABLE
 * - MODEL zůstává MODEL
 * - LIVE/VERIFIED po překročení LIVE limitu → STALE (pokud stále v okně VERIFIED)
 * - Po překročení VERIFIED limitu → UNAVAILABLE (pro „živou nabídku“),
 *   kalkulačka může dál použít MODEL fallback zvlášť.
 */
export function applyRateFreshness(input: {
  rate: number | null;
  declaredStatus: MortgageRateStatus;
  fetchedAt: string | null;
  nowMs?: number;
}): MortgageRateStatus {
  const { rate, declaredStatus } = input;
  const nowMs = input.nowMs ?? Date.now();

  if (rate == null || !Number.isFinite(rate) || rate < 0) {
    return "UNAVAILABLE";
  }
  if (declaredStatus === "MODEL") return "MODEL";
  if (declaredStatus === "UNAVAILABLE") return "UNAVAILABLE";

  const age = ageMsFromIso(input.fetchedAt, nowMs);
  if (age == null) {
    // Bez timestampu nikdy LIVE
    return declaredStatus === "LIVE" ? "STALE" : declaredStatus;
  }

  if (age <= RATE_LIVE_MAX_AGE_MS) {
    return declaredStatus === "STALE" ? "STALE" : "LIVE";
  }

  if (age <= RATE_VERIFIED_MAX_AGE_MS) {
    return "STALE";
  }

  return "UNAVAILABLE";
}

export function isUsableBankOfferStatus(status: MortgageRateStatus): boolean {
  return status === "LIVE" || status === "VERIFIED" || status === "STALE";
}

export function isLiveDisplayStatus(status: MortgageRateStatus): boolean {
  return status === "LIVE";
}
