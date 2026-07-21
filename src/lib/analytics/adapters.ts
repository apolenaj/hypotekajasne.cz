/**
 * Analytics adapters — single abstraction; no vendor calls in UI.
 *
 * - noop: provider missing or no consent (never pretends data is flowing)
 * - debug: logs event names/payloads locally (dev / hj_analytics_debug)
 * - gtag: Google Analytics when configured + consent
 */

import type { AnalyticsEventName, AnalyticsPayload } from "@/lib/analytics/events";
import { COOKIE_STORAGE_KEY } from "@/lib/consent/records";

export type AnalyticsAdapterStatus =
  | "noop_no_consent"
  | "noop_unconfigured"
  | "debug_only"
  | "gtag";

export type AnalyticsAdapter = {
  id: AnalyticsAdapterStatus;
  /** True when a real production sink will receive the event */
  sendsToProduction: boolean;
  send: (event: AnalyticsEventName, payload: AnalyticsPayload) => void;
};

const DEBUG_STORAGE_KEY = "hj_analytics_debug";

export function isAnalyticsDebugEnabled(): boolean {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === "true";
  }
  if (process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === "true") return true;
  if (process.env.NODE_ENV === "development") {
    try {
      if (localStorage.getItem(DEBUG_STORAGE_KEY) === "1") return true;
    } catch {
      /* ignore */
    }
    // Dev default: console debug without production send when GA missing
    return true;
  }
  try {
    return localStorage.getItem(DEBUG_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

/** Enable/disable debug logging from console: analyticsDebug(true) */
export function setAnalyticsDebug(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    if (enabled) localStorage.setItem(DEBUG_STORAGE_KEY, "1");
    else localStorage.removeItem(DEBUG_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function getGaMeasurementId(): string | null {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  return id || null;
}

export function isGtagConfigured(): boolean {
  return Boolean(getGaMeasurementId());
}

function debugAdapter(): AnalyticsAdapter {
  return {
    id: "debug_only",
    sendsToProduction: false,
    send(event, payload) {
      // eslint-disable-next-line no-console
      console.info("[analytics:debug]", event, payload, {
        production: false,
        note: "Not sent to a production provider",
      });
    },
  };
}

function noopAdapter(reason: "noop_no_consent" | "noop_unconfigured"): AnalyticsAdapter {
  return {
    id: reason,
    sendsToProduction: false,
    send() {
      /* intentionally empty — do not invent delivery */
    },
  };
}

function gtagAdapter(): AnalyticsAdapter {
  return {
    id: "gtag",
    sendsToProduction: true,
    send(event, payload) {
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
        return;
      }
      // Configured in env but script not loaded yet — still don't fake success
      if (isAnalyticsDebugEnabled()) {
        // eslint-disable-next-line no-console
        console.info("[analytics:debug] gtag not ready", event, payload);
      }
    },
  };
}

/**
 * Resolve which adapter handles a consented event.
 * Call only after consent check.
 */
export function resolveProductionAdapter(): AnalyticsAdapter {
  if (isGtagConfigured()) return gtagAdapter();
  if (isAnalyticsDebugEnabled()) return debugAdapter();
  return noopAdapter("noop_unconfigured");
}

export function getAnalyticsRuntimeStatus(hasConsent: boolean): {
  consent: boolean;
  providerConfigured: boolean;
  debug: boolean;
  adapter: AnalyticsAdapterStatus;
  sendsToProduction: boolean;
} {
  const debug = isAnalyticsDebugEnabled();
  const providerConfigured = isGtagConfigured();
  if (!hasConsent) {
    return {
      consent: false,
      providerConfigured,
      debug,
      adapter: "noop_no_consent",
      sendsToProduction: false,
    };
  }
  const adapter = resolveProductionAdapter();
  return {
    consent: true,
    providerConfigured,
    debug,
    adapter: adapter.id,
    sendsToProduction: adapter.sendsToProduction,
  };
}

/** Expose helpers on window in development for QA. */
export function installAnalyticsDebugGlobals(): void {
  if (typeof window === "undefined") return;
  if (process.env.NODE_ENV !== "development" && !isAnalyticsDebugEnabled()) {
    return;
  }
  const w = window as unknown as {
    analyticsDebug?: (on?: boolean) => void;
    analyticsStatus?: () => ReturnType<typeof getAnalyticsRuntimeStatus>;
  };
  w.analyticsDebug = (on = true) => {
    setAnalyticsDebug(on);
    // eslint-disable-next-line no-console
    console.info(`[analytics] debug ${on ? "ON" : "OFF"}`);
  };
  w.analyticsStatus = () => {
    let consent = false;
    try {
      const raw = localStorage.getItem(COOKIE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          categories?: { analytics?: boolean };
        };
        consent = Boolean(parsed?.categories?.analytics);
      }
    } catch {
      consent = false;
    }
    return getAnalyticsRuntimeStatus(consent);
  };
}
