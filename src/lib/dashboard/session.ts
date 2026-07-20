/**
 * Soft “signed-in” preference — no account yet.
 * User chooses personalized home vs marketing cockpit.
 */

const PREF_KEY = "hj-home-mode-v1";

export type HomeMode = "marketing" | "dashboard";

export function loadHomeMode(): HomeMode | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(PREF_KEY);
    if (v === "dashboard" || v === "marketing") return v;
  } catch {
    /* ignore */
  }
  return null;
}

export function setHomeMode(mode: HomeMode) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PREF_KEY, mode);
}

/** Auto-enter dashboard when profile exists and preference unset. */
export function resolveHomeMode(hasProfile: boolean): HomeMode {
  const stored = loadHomeMode();
  if (stored) return stored;
  return hasProfile ? "dashboard" : "marketing";
}
