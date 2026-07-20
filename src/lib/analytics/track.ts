/**
 * Client analytics dispatcher — only fires after cookie analytics consent.
 */

import {
  assertSafeAnalyticsPayload,
  type AnalyticsEventName,
  type AnalyticsPayload,
} from "@/lib/analytics/events";
import { COOKIE_STORAGE_KEY, type CookieConsentRecord } from "@/lib/consent/records";

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

function pushGtag(event: AnalyticsEventName, payload: AnalyticsPayload) {
  const w = window as unknown as {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  };
  if (typeof w.gtag === "function") {
    w.gtag("event", event, { ...payload, transport_type: "beacon" });
    return;
  }
  if (Array.isArray(w.dataLayer)) {
    w.dataLayer.push({ event, ...payload });
  }
}

/**
 * Track a taxonomy event. No-ops without consent or on server.
 * Scrubs / rejects sensitive keys.
 */
export function track(
  event: AnalyticsEventName,
  payload: AnalyticsPayload = {}
): void {
  if (typeof window === "undefined") return;
  if (!hasAnalyticsConsent()) return;

  const safe: Record<string, unknown> = { ...payload };
  try {
    assertSafeAnalyticsPayload(safe);
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[analytics] blocked unsafe payload", event, err);
    }
    return;
  }

  pushGtag(event, safe as AnalyticsPayload);

  if (process.env.NODE_ENV === "development") {
    console.debug("[analytics]", event, safe);
  }
}
