import type { DigitalTwinStore, PropertyDigitalTwin } from "@/lib/digital-twin/types";
import {
  DIGITAL_TWIN_STORAGE_KEY,
  MAX_TWINS,
} from "@/lib/digital-twin/types";

function defaultStore(): DigitalTwinStore {
  return { version: 1, twins: [] };
}

export function loadDigitalTwinStore(): DigitalTwinStore {
  if (typeof window === "undefined") return defaultStore();
  try {
    const raw = localStorage.getItem(DIGITAL_TWIN_STORAGE_KEY);
    if (!raw) return defaultStore();
    const parsed = JSON.parse(raw) as DigitalTwinStore;
    if (parsed?.version === 1 && Array.isArray(parsed.twins)) {
      return parsed;
    }
  } catch {
    /* empty */
  }
  return defaultStore();
}

export function saveDigitalTwinStore(store: DigitalTwinStore) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    DIGITAL_TWIN_STORAGE_KEY,
    JSON.stringify({
      ...store,
      version: 1,
      twins: store.twins.slice(0, MAX_TWINS),
    })
  );
}

export function listOwnedTwins(): PropertyDigitalTwin[] {
  return loadDigitalTwinStore().twins.filter((t) => t.relationship === "owned");
}

export function upsertTwin(twin: PropertyDigitalTwin) {
  const store = loadDigitalTwinStore();
  const rest = store.twins.filter((t) => t.id !== twin.id);
  store.twins = [{ ...twin, updatedAt: new Date().toISOString() }, ...rest].slice(
    0,
    MAX_TWINS
  );
  saveDigitalTwinStore(store);
  return store;
}

export function seedDigitalTwinStore(twins: PropertyDigitalTwin[]) {
  const store = loadDigitalTwinStore();
  if (store.twins.length > 0) return store;
  store.twins = twins.slice(0, MAX_TWINS);
  saveDigitalTwinStore(store);
  return store;
}
