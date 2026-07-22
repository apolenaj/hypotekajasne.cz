/**
 * Marketing attribution + UTM persistence (PROMPT 19).
 * Writes to storage ONLY after analytics cookie consent.
 * Never stores PII, full URLs, or financial profile data.
 */

import { COOKIE_STORAGE_KEY, type CookieConsentRecord } from "@/lib/consent/records";

const ATTRIBUTION_STORAGE_KEY = "hj-analytics-attribution-v1";
const UTM_PENDING_KEY = "hj-analytics-utm-pending";
const VISITOR_STORAGE_KEY = "hj-analytics-visitor-v1";
const SESSION_STORAGE_KEY = "hj-analytics-session-v1";

const UTM_PARAM_KEYS = ["utm_source", "utm_medium", "utm_campaign"] as const;

export type UtmParamKey = (typeof UTM_PARAM_KEYS)[number];

export type PersistedAttribution = {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  captured_at: string;
  landing_path: string | null;
};

export type VisitorContext = {
  visitor_type: "new" | "returning";
  session_id: string;
  visit_count: number;
};

export type AnalyticsContext = PersistedAttribution &
  VisitorContext & {
    has_attribution: boolean;
  };

function sanitizeUtmValue(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim().slice(0, 64);
  if (trimmed.length < 1) return null;
  if (!/^[a-zA-Z0-9._-]+$/.test(trimmed)) return null;
  return trimmed.toLowerCase();
}

function sanitizePath(path: string | null | undefined): string | null {
  if (!path) return null;
  const p = path.split("?")[0]?.slice(0, 120) ?? null;
  return p && p.startsWith("/") ? p : null;
}

function readJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / private mode */
  }
}

export function hasAnalyticsConsentFromStorage(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(COOKIE_STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as CookieConsentRecord;
    return Boolean(parsed?.categories?.analytics);
  } catch {
    return false;
  }
}

/** Parse UTM from current URL — safe to call before consent (not persisted yet). */
export function parseUtmFromLocation(
  search: string = typeof window !== "undefined" ? window.location.search : ""
): Partial<Record<UtmParamKey, string>> {
  const params = new URLSearchParams(search);
  const out: Partial<Record<UtmParamKey, string>> = {};
  for (const key of UTM_PARAM_KEYS) {
    const v = sanitizeUtmValue(params.get(key));
    if (v) out[key] = v;
  }
  return out;
}

/**
 * Stage UTM in sessionStorage until analytics consent (first-touch capture).
 * Only sanitized utm_* keys — never full query string.
 */
export function stageUtmFromUrl(pathname?: string): void {
  if (typeof window === "undefined") return;
  const parsed = parseUtmFromLocation();
  if (Object.keys(parsed).length === 0) return;
  try {
    sessionStorage.setItem(
      UTM_PENDING_KEY,
      JSON.stringify({
        ...parsed,
        landing_path: sanitizePath(pathname ?? window.location.pathname),
        staged_at: new Date().toISOString(),
      })
    );
  } catch {
    /* ignore */
  }
}

function loadPendingUtm(): Partial<Record<UtmParamKey, string>> & {
  landing_path?: string | null;
} | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(UTM_PENDING_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<Record<UtmParamKey, string>> & {
      landing_path?: string | null;
    };
  } catch {
    return null;
  }
}

function clearPendingUtm(): void {
  try {
    sessionStorage.removeItem(UTM_PENDING_KEY);
  } catch {
    /* ignore */
  }
}

/** Persist first-touch attribution after consent. Does not overwrite existing. */
export function persistAttributionAfterConsent(
  pathname?: string
): PersistedAttribution | null {
  if (!hasAnalyticsConsentFromStorage()) return null;

  const existing = readJson<PersistedAttribution>(ATTRIBUTION_STORAGE_KEY);
  if (existing?.utm_source || existing?.utm_medium || existing?.utm_campaign) {
    return existing;
  }

  const pending = loadPendingUtm();
  const live = parseUtmFromLocation();
  const merged = { ...live, ...pending };

  const next: PersistedAttribution = {
    utm_source: merged.utm_source ?? null,
    utm_medium: merged.utm_medium ?? null,
    utm_campaign: merged.utm_campaign ?? null,
    captured_at: new Date().toISOString(),
    landing_path:
      sanitizePath(pending?.landing_path) ??
      sanitizePath(pathname ?? window.location.pathname),
  };

  if (!next.utm_source && !next.utm_medium && !next.utm_campaign) {
    return null;
  }

  writeJson(ATTRIBUTION_STORAGE_KEY, next);
  clearPendingUtm();
  return next;
}

function randomSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `s_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
  }
  return `s_${Date.now().toString(36)}`;
}

/** Read visitor context without incrementing visit count. */
export function readVisitorContext(): VisitorContext | null {
  if (!hasAnalyticsConsentFromStorage()) return null;

  let sessionId: string | null = null;
  try {
    sessionId = sessionStorage.getItem(SESSION_STORAGE_KEY);
  } catch {
    sessionId = null;
  }
  if (!sessionId) return null;

  const prev =
    readJson<{ visit_count: number; first_at: string }>(VISITOR_STORAGE_KEY) ??
    null;
  const visitCount = prev?.visit_count ?? 1;

  return {
    visitor_type: visitCount > 1 ? "returning" : "new",
    session_id: sessionId,
    visit_count: visitCount,
  };
}

/** Increment visit count once per bootstrap — not on every event. */
export function touchVisitorSession(): VisitorContext | null {
  if (!hasAnalyticsConsentFromStorage()) return null;

  let sessionId: string | null = null;
  try {
    sessionId = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!sessionId) {
      sessionId = randomSessionId();
      sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    }
  } catch {
    sessionId = randomSessionId();
  }

  const prev =
    readJson<{ visit_count: number; first_at: string }>(VISITOR_STORAGE_KEY) ??
    null;
  const visitCount = (prev?.visit_count ?? 0) + 1;
  writeJson(VISITOR_STORAGE_KEY, {
    visit_count: visitCount,
    first_at: prev?.first_at ?? new Date().toISOString(),
  });

  return {
    visitor_type: visitCount > 1 ? "returning" : "new",
    session_id: sessionId!,
    visit_count: visitCount,
  };
}

export function loadPersistedAttribution(): PersistedAttribution | null {
  if (!hasAnalyticsConsentFromStorage()) return null;
  return readJson<PersistedAttribution>(ATTRIBUTION_STORAGE_KEY);
}

/** Coarse attribution fields safe for analytics payloads. */
export function getAnalyticsContext(): Partial<AnalyticsContext> {
  if (!hasAnalyticsConsentFromStorage()) return {};

  const attr = loadPersistedAttribution();
  const visitor = readVisitorContext();

  const ctx: Partial<AnalyticsContext> = {
    ...(visitor ?? {}),
    has_attribution: Boolean(
      attr?.utm_source || attr?.utm_medium || attr?.utm_campaign
    ),
  };

  if (attr?.utm_source) ctx.utm_source = attr.utm_source;
  if (attr?.utm_medium) ctx.utm_medium = attr.utm_medium;
  if (attr?.utm_campaign) ctx.utm_campaign = attr.utm_campaign;

  return ctx;
}

/** Bootstrap: stage URL UTMs always; persist only with consent. */
export function bootstrapAnalyticsAttribution(pathname?: string): void {
  stageUtmFromUrl(pathname);
  if (hasAnalyticsConsentFromStorage()) {
    persistAttributionAfterConsent(pathname);
    touchVisitorSession();
  }
}
