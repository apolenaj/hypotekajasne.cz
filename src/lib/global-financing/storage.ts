import type { GlobalFinancingStore } from "@/lib/global-financing/types";
import { GLOBAL_FINANCING_STORAGE_KEY } from "@/lib/global-financing/types";

function defaultStore(): GlobalFinancingStore {
  return { version: 1, input: null, lastViewedAt: null };
}

export function loadGlobalFinancingStore(): GlobalFinancingStore {
  if (typeof window === "undefined") return defaultStore();
  try {
    const raw = localStorage.getItem(GLOBAL_FINANCING_STORAGE_KEY);
    if (!raw) return defaultStore();
    const parsed = JSON.parse(raw) as GlobalFinancingStore;
    if (parsed?.version === 1) return { ...defaultStore(), ...parsed };
  } catch {
    /* empty */
  }
  return defaultStore();
}

export function saveGlobalFinancingInput(
  input: NonNullable<GlobalFinancingStore["input"]>
) {
  if (typeof window === "undefined") return;
  const store: GlobalFinancingStore = {
    version: 1,
    input,
    lastViewedAt: new Date().toISOString(),
  };
  localStorage.setItem(GLOBAL_FINANCING_STORAGE_KEY, JSON.stringify(store));
}
