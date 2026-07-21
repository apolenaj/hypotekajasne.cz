/**
 * Client analytics dispatcher — single entry point for all product events.
 * Respects cookie analytics consent. Never sends PII.
 */

import {
  assertSafeAnalyticsPayload,
  type AnalyticsEventName,
  type AnalyticsPayload,
} from "@/lib/analytics/events";
import {
  installAnalyticsDebugGlobals,
  isAnalyticsDebugEnabled,
  resolveProductionAdapter,
  type AnalyticsAdapterStatus,
} from "@/lib/analytics/adapters";
import {
  COOKIE_STORAGE_KEY,
  type CookieConsentRecord,
} from "@/lib/consent/records";

let globalsInstalled = false;

function ensureDebugGlobals() {
  if (globalsInstalled || typeof window === "undefined") return;
  globalsInstalled = true;
  installAnalyticsDebugGlobals();
}

function hasAnalyticsConsent(): boolean {
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

export type TrackResult = {
  sent: boolean;
  adapter: AnalyticsAdapterStatus;
  reason?: "no_window" | "no_consent" | "unsafe_payload" | "unconfigured";
};

/**
 * Track a taxonomy event.
 * - Without consent: no production send (debug may still log intent)
 * - Without GA configured: no-op production (debug logs clearly)
 * - Never pretends delivery succeeded when adapter is noop
 */
export function track(
  event: AnalyticsEventName,
  payload: AnalyticsPayload = {}
): TrackResult {
  if (typeof window === "undefined") {
    return { sent: false, adapter: "noop_unconfigured", reason: "no_window" };
  }
  ensureDebugGlobals();

  const safe: Record<string, unknown> = { ...payload };
  try {
    assertSafeAnalyticsPayload(safe);
  } catch (err) {
    if (isAnalyticsDebugEnabled() || process.env.NODE_ENV === "development") {
      console.warn("[analytics] blocked unsafe payload", event, err);
    }
    return { sent: false, adapter: "noop_unconfigured", reason: "unsafe_payload" };
  }

  const consented = hasAnalyticsConsent();
  const debug = isAnalyticsDebugEnabled();

  if (!consented) {
    if (debug) {
      console.info("[analytics:debug] skipped (no analytics consent)", event, safe);
    }
    return { sent: false, adapter: "noop_no_consent", reason: "no_consent" };
  }

  const adapter = resolveProductionAdapter();
  adapter.send(event, safe as AnalyticsPayload);

  if (debug && adapter.id !== "debug_only") {
    console.debug("[analytics]", event, safe, { adapter: adapter.id });
  }

  return {
    sent: adapter.sendsToProduction,
    adapter: adapter.id,
    reason: adapter.sendsToProduction ? undefined : "unconfigured",
  };
}

/** Dual-fire helper: legacy + new name (migration continuity). */
export function trackPair(
  legacy: AnalyticsEventName,
  next: AnalyticsEventName,
  payload: AnalyticsPayload = {}
): void {
  track(legacy, payload);
  track(next, payload);
}
