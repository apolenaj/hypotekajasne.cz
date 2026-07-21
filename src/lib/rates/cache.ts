/**
 * Cache posledních ověřených sazeb — graceful degradation při výpadku API.
 * Pouze browser; na serveru no-op.
 */

import type { CachedVerifiedRate } from "@/lib/rates/resolve-engine";

export const RATE_CACHE_STORAGE_KEY = "hj-mortgage-rates-verified-v1";

export function readVerifiedRateCache(): CachedVerifiedRate | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(RATE_CACHE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedVerifiedRate;
    if (
      !parsed ||
      typeof parsed.updatedAt !== "string" ||
      typeof parsed.cachedAt !== "string"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writeVerifiedRateCache(rates: {
  rateWithInsurance: number | null;
  rateWithoutInsurance: number | null;
  updatedAt: string | null;
}): void {
  if (typeof window === "undefined") return;
  if (rates.rateWithInsurance == null && rates.rateWithoutInsurance == null) {
    return;
  }
  if (!rates.updatedAt) return;
  const payload: CachedVerifiedRate = {
    rateWithInsurance: rates.rateWithInsurance,
    rateWithoutInsurance: rates.rateWithoutInsurance,
    updatedAt: rates.updatedAt,
    cachedAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(RATE_CACHE_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore quota / private mode
  }
}
