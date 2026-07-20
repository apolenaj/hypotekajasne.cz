import type { RefinanceRadarStore } from "@/lib/refinance-radar/types";
import { REFINANCE_RADAR_STORAGE_KEY } from "@/lib/refinance-radar/types";

function defaultStore(): RefinanceRadarStore {
  return {
    version: 1,
    profile: null,
    emittedMilestones: {},
    alerts: [],
    preferences: { maxAlertsPerMonth: 4 },
  };
}

export function loadRefinanceRadarStore(): RefinanceRadarStore {
  if (typeof window === "undefined") return defaultStore();
  try {
    const raw = localStorage.getItem(REFINANCE_RADAR_STORAGE_KEY);
    if (!raw) return defaultStore();
    const parsed = JSON.parse(raw) as RefinanceRadarStore;
    if (parsed?.version === 1) {
      return { ...defaultStore(), ...parsed };
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
    JSON.stringify({ ...store, version: 1, alerts: store.alerts.slice(0, 30) })
  );
}

export function saveLoanProfile(
  profile: NonNullable<RefinanceRadarStore["profile"]>
) {
  const store = loadRefinanceRadarStore();
  store.profile = { ...profile, updatedAt: new Date().toISOString() };
  saveRefinanceRadarStore(store);
  return store;
}
