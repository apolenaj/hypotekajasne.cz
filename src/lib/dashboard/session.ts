/**
 * Legacy preference key — homepage already always shows marketing.
 * Kept for backward compatibility with older localStorage values.
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

/** @deprecated Homepage is always marketing; dashboard lives at /dashboard. */
export function setHomeMode(mode: HomeMode) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PREF_KEY, mode);
}

/**
 * @deprecated Do not gate `/` with this — use routes.dashboard for the app shell.
 * Kept so older callers compile; always returns marketing for homepage safety.
 */
export function resolveHomeMode(_hasProfile: boolean): HomeMode {
  return "marketing";
}
