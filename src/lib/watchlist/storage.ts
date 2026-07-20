import type {
  AlertThrottleRecord,
  WatchAlert,
  WatchTarget,
  WatchlistStoreV2,
} from "@/lib/watchlist/types";
import {
  MAX_STORED_ALERTS,
  MAX_WATCH_TARGETS,
  WATCHLIST_STORAGE_KEY,
  emptyWatchTarget,
} from "@/lib/watchlist/types";
import type { WatchlistItem } from "@/lib/dashboard/types";

const LEGACY_KEY = "hj-watchlist-v1";

function defaultStore(): WatchlistStoreV2 {
  return {
    version: 2,
    targets: [],
    alerts: [],
    throttle: { lastEmittedAt: {}, recentEmissionDays: [] },
    preferences: {
      maxAlertsPerDay: 5,
      minHoursBetweenSameKind: 48,
      digestOnly: false,
    },
  };
}

function migrateLegacyItems(items: WatchlistItem[]): WatchTarget[] {
  return items.map((i) =>
    emptyWatchTarget({
      id: i.id,
      kind: "property",
      label: i.label,
      createdAt: i.addedAt,
      priceCzk: i.priceCzk,
      previousPriceCzk: i.previousPriceCzk ?? null,
      city: i.countryHint ?? null,
      notes: i.notes ?? null,
      availability:
        i.status === "sold"
          ? "sold"
          : i.status === "archived"
            ? "unknown"
            : "available",
      sourceClaim: "DATA",
    })
  );
}

export function loadWatchlistStore(): WatchlistStoreV2 {
  if (typeof window === "undefined") return defaultStore();
  try {
    const raw = localStorage.getItem(WATCHLIST_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as WatchlistStoreV2;
      if (parsed?.version === 2 && Array.isArray(parsed.targets)) {
        return {
          ...defaultStore(),
          ...parsed,
          preferences: {
            ...defaultStore().preferences,
            ...parsed.preferences,
          },
          throttle: parsed.throttle ?? defaultStore().throttle,
        };
      }
    }
  } catch {
    /* migrate */
  }

  // Migrate v1 dashboard watchlist
  try {
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const parsed = JSON.parse(legacy) as { items?: WatchlistItem[] };
      if (Array.isArray(parsed.items) && parsed.items.length > 0) {
        const store = defaultStore();
        store.targets = migrateLegacyItems(parsed.items).slice(
          0,
          MAX_WATCH_TARGETS
        );
        saveWatchlistStore(store);
        return store;
      }
    }
  } catch {
    /* empty */
  }

  return defaultStore();
}

export function saveWatchlistStore(store: WatchlistStoreV2) {
  if (typeof window === "undefined") return;
  const next: WatchlistStoreV2 = {
    ...store,
    version: 2,
    targets: store.targets.slice(0, MAX_WATCH_TARGETS),
    alerts: store.alerts.slice(0, MAX_STORED_ALERTS),
  };
  localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(next));

  // Keep v1 mirror for dashboard compatibility (property targets only)
  const legacyItems: WatchlistItem[] = next.targets
    .filter((t) => t.kind === "property" && t.priceCzk != null)
    .map((t) => ({
      id: t.id,
      label: t.label,
      priceCzk: t.priceCzk!,
      previousPriceCzk: t.previousPriceCzk,
      countryHint: t.city,
      status:
        t.availability === "sold"
          ? "sold"
          : "watching",
      addedAt: t.createdAt,
      notes: t.notes ?? undefined,
    }));
  localStorage.setItem(
    LEGACY_KEY,
    JSON.stringify({ version: 1, items: legacyItems })
  );
}

export function listWatchTargets(): WatchTarget[] {
  return loadWatchlistStore().targets;
}

export function upsertWatchTarget(target: WatchTarget) {
  const store = loadWatchlistStore();
  const rest = store.targets.filter((t) => t.id !== target.id);
  store.targets = [
    { ...target, updatedAt: new Date().toISOString() },
    ...rest,
  ].slice(0, MAX_WATCH_TARGETS);
  saveWatchlistStore(store);
  return store;
}

export function removeWatchTarget(id: string) {
  const store = loadWatchlistStore();
  store.targets = store.targets.filter((t) => t.id !== id);
  store.alerts = store.alerts.filter((a) => a.targetId !== id);
  saveWatchlistStore(store);
  return store;
}

export function listWatchAlerts(): WatchAlert[] {
  return loadWatchlistStore().alerts;
}

export function appendWatchAlerts(
  alerts: WatchAlert[],
  throttle: AlertThrottleRecord
) {
  const store = loadWatchlistStore();
  store.alerts = [...alerts, ...store.alerts].slice(0, MAX_STORED_ALERTS);
  store.throttle = throttle;
  saveWatchlistStore(store);
  return store;
}

export function clearWatchAlerts() {
  const store = loadWatchlistStore();
  store.alerts = [];
  saveWatchlistStore(store);
}

export function updateWatchPreferences(
  partial: Partial<WatchlistStoreV2["preferences"]>
) {
  const store = loadWatchlistStore();
  store.preferences = { ...store.preferences, ...partial };
  saveWatchlistStore(store);
  return store;
}
