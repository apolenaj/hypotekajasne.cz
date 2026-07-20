import type {
  AlertThrottleRecord,
  WatchAlert,
  WatchlistStoreV2,
} from "@/lib/watchlist/types";

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function throttleKey(alert: Pick<WatchAlert, "targetId" | "kind">): string {
  return `${alert.targetId}:${alert.kind}`;
}

/**
 * Intelligent alert throttling — retention without spam.
 * - Cap alerts per calendar day
 * - Same target+kind must wait minHours
 * - digestOnly suppresses immediate emission (alerts still generated for digest queue)
 */
export function filterAlertsByThrottle(
  candidates: WatchAlert[],
  throttle: AlertThrottleRecord,
  preferences: WatchlistStoreV2["preferences"],
  now: Date = new Date()
): { accepted: WatchAlert[]; throttle: AlertThrottleRecord; rejected: string[] } {
  const rejected: string[] = [];
  const accepted: WatchAlert[] = [];
  const next: AlertThrottleRecord = {
    lastEmittedAt: { ...throttle.lastEmittedAt },
    recentEmissionDays: [...throttle.recentEmissionDays],
  };

  // Prune old day keys (keep 14 days)
  const cutoff = new Date(now.getTime() - 14 * 86_400_000);
  next.recentEmissionDays = next.recentEmissionDays.filter((d) => {
    const t = Date.parse(d + "T00:00:00.000Z");
    return Number.isFinite(t) && t >= cutoff.getTime();
  });

  const today = dayKey(now);
  const todayCount = next.recentEmissionDays.filter((d) => d === today).length;

  if (preferences.digestOnly) {
    return {
      accepted: [],
      throttle: next,
      rejected: candidates.map((c) => `${c.id}:digest_only`),
    };
  }

  let emittedToday = todayCount;

  for (const alert of candidates) {
    if (emittedToday >= preferences.maxAlertsPerDay) {
      rejected.push(`${alert.id}:daily_cap`);
      continue;
    }

    const key = throttleKey(alert);
    const last = next.lastEmittedAt[key];
    if (last) {
      const elapsedH =
        (now.getTime() - Date.parse(last)) / (1000 * 60 * 60);
      if (elapsedH < preferences.minHoursBetweenSameKind) {
        rejected.push(`${alert.id}:cooldown`);
        continue;
      }
    }

    // Soft: ignore tiny magnitudes for price (already filtered in generator)
    accepted.push(alert);
    next.lastEmittedAt[key] = now.toISOString();
    next.recentEmissionDays.push(today);
    emittedToday += 1;
  }

  return { accepted, throttle: next, rejected };
}
