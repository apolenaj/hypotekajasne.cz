import type { AcademyProgressStore } from "@/lib/academy/gamification/types";
import {
  ACADEMY_PROGRESS_SERVER_SNAPSHOT,
  ACADEMY_PROGRESS_STORAGE_KEY,
  defaultAcademyProgressStore,
} from "@/lib/academy/gamification/types";

let clientSnapshot: AcademyProgressStore | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

/** Subscribe to in-tab progress updates (for useSyncExternalStore). */
export function subscribeAcademyProgress(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

/** Stable SSR / first-paint snapshot — must be referentially stable. */
export function getAcademyProgressServerSnapshot(): AcademyProgressStore {
  return ACADEMY_PROGRESS_SERVER_SNAPSHOT;
}

/**
 * Client snapshot for useSyncExternalStore.
 * Cached so repeated getSnapshot calls return the same reference until save.
 */
export function loadAcademyProgressStore(): AcademyProgressStore {
  if (typeof window === "undefined") return ACADEMY_PROGRESS_SERVER_SNAPSHOT;
  if (clientSnapshot) return clientSnapshot;

  try {
    const raw = localStorage.getItem(ACADEMY_PROGRESS_STORAGE_KEY);
    if (!raw) {
      clientSnapshot = ACADEMY_PROGRESS_SERVER_SNAPSHOT;
      return clientSnapshot;
    }
    clientSnapshot = {
      ...defaultAcademyProgressStore(),
      ...(JSON.parse(raw) as AcademyProgressStore),
    };
    return clientSnapshot;
  } catch {
    clientSnapshot = ACADEMY_PROGRESS_SERVER_SNAPSHOT;
    return clientSnapshot;
  }
}

export function saveAcademyProgressStore(store: AcademyProgressStore) {
  if (typeof window === "undefined") return;
  clientSnapshot = store;
  localStorage.setItem(ACADEMY_PROGRESS_STORAGE_KEY, JSON.stringify(store));
  emit();
}

/** Test helper — reset module cache between cases. */
export function resetAcademyProgressStoreCacheForTests() {
  clientSnapshot = null;
}
