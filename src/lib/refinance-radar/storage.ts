import type {
  RefinanceLoanProfile,
  RefinanceRadarAlert,
  RefinanceRadarStore,
} from "@/lib/refinance-radar/types";
import {
  emptyLoanProfile,
  REFINANCE_RADAR_STORAGE_KEY,
} from "@/lib/refinance-radar/types";

function defaultStore(): RefinanceRadarStore {
  return {
    version: 1,
    profile: null,
    emittedMilestones: {},
    alerts: [],
    preferences: {
      maxAlertsPerMonth: 4,
      watchEnabled: false,
      watchSavedAt: null,
    },
  };
}

function normalizeStore(parsed: RefinanceRadarStore): RefinanceRadarStore {
  const base = defaultStore();
  const profile = parsed.profile
    ? {
        ...emptyLoanProfile(parsed.profile),
        ...parsed.profile,
        propertyValueCzk:
          parsed.profile.propertyValueCzk !== undefined
            ? parsed.profile.propertyValueCzk
            : null,
      }
    : null;
  return {
    ...base,
    ...parsed,
    version: 1,
    profile,
    preferences: {
      ...base.preferences,
      ...parsed.preferences,
    },
    alerts: Array.isArray(parsed.alerts) ? parsed.alerts : [],
    emittedMilestones: parsed.emittedMilestones ?? {},
  };
}

export function loadRefinanceRadarStore(): RefinanceRadarStore {
  if (typeof window === "undefined") return defaultStore();
  try {
    const raw = localStorage.getItem(REFINANCE_RADAR_STORAGE_KEY);
    if (!raw) return defaultStore();
    const parsed = JSON.parse(raw) as RefinanceRadarStore;
    if (parsed?.version === 1) {
      return normalizeStore(parsed);
    }
  } catch {
    /* empty */
  }
  return defaultStore();
}

export function saveRefinanceRadarStore(store: RefinanceRadarStore) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    REFINANCE_RADAR_STORAGE_KEY,
    JSON.stringify({
      ...normalizeStore(store),
      alerts: store.alerts.slice(0, 30),
    })
  );
}

export function saveLoanProfile(profile: RefinanceLoanProfile) {
  const store = loadRefinanceRadarStore();
  store.profile = { ...profile, updatedAt: new Date().toISOString() };
  saveRefinanceRadarStore(store);
  return store;
}

/** Uloží in-app hlídání — bez falešného e-mailového slibu. */
export function saveRefinanceWatch(enabled: boolean) {
  const store = loadRefinanceRadarStore();
  store.preferences.watchEnabled = enabled;
  store.preferences.watchSavedAt = enabled
    ? new Date().toISOString()
    : null;
  saveRefinanceRadarStore(store);
  return store;
}

export function persistRefinanceAlerts(input: {
  alerts: RefinanceRadarAlert[];
  emittedMilestones: Record<string, string>;
}) {
  const store = loadRefinanceRadarStore();
  store.alerts = [...input.alerts, ...store.alerts].slice(0, 30);
  store.emittedMilestones = {
    ...store.emittedMilestones,
    ...input.emittedMilestones,
  };
  saveRefinanceRadarStore(store);
  return store;
}

export function clearRefinanceRadarProfile() {
  const store = loadRefinanceRadarStore();
  store.profile = null;
  store.preferences.watchEnabled = false;
  store.preferences.watchSavedAt = null;
  saveRefinanceRadarStore(store);
  return store;
}
