/**
 * Phase 4 public analytics API.
 * UI → trackEvent → consent check → GA4 (via existing track()).
 * Never send PII. Fail open for UX when GA/consent missing.
 */

import {
  assertSafeAnalyticsPayload,
  type AnalyticsEventName,
  type AnalyticsPayload,
} from "@/lib/analytics/events";
import { track, type TrackResult } from "@/lib/analytics/track";
import { buildPhase7AdConversionPayload } from "@/lib/marketing/phase7-conversion";

/** Phase 4 primary conversion events. */
export const PHASE4_EVENTS = [
  "homepage_view",
  "calculator_start",
  "calculator_complete",
  "rate_results_view",
  "rate_detail_open",
  "situation_select",
  "decision_funnel_start",
  "decision_funnel_complete",
  "lead_form_view",
  "lead_submit",
  "lead_success",
  "lead_error",
  "phone_click",
  "email_click",
  "cta_click",
  "mortgage_calculation_completed",
  "mortgage_rates_cta_clicked",
] as const;

export type Phase4EventName = (typeof PHASE4_EVENTS)[number];

const ONCE_PREFIX = "hj_analytics_once_v1:";

function onceStorageKey(guardKey: string): string {
  return `${ONCE_PREFIX}${guardKey}`;
}

/** Fire once per browser session for critical funnel milestones. */
export function trackEventOnce(
  event: Phase4EventName | AnalyticsEventName,
  guardKey: string,
  payload: AnalyticsPayload = {}
): TrackResult {
  if (typeof window !== "undefined") {
    try {
      const key = onceStorageKey(guardKey);
      if (sessionStorage.getItem(key) === "1") {
        return { sent: false, adapter: "noop_unconfigured", reason: "unconfigured" };
      }
      sessionStorage.setItem(key, "1");
    } catch {
      /* private mode — still attempt track */
    }
  }
  return trackEvent(event, payload);
}

/**
 * Single public event API for product UI.
 * Consent + safety enforced by track().
 */
export function trackEvent(
  event: Phase4EventName | AnalyticsEventName,
  payload: AnalyticsPayload = {}
): TrackResult {
  const cleaned: Record<string, unknown> = { ...payload };
  // Strip any accidental PII-shaped keys before assert
  for (const key of Object.keys(cleaned)) {
    if (
      /^(email|phone|name|message|notes|address|first_name|last_name)$/i.test(
        key
      )
    ) {
      delete cleaned[key];
    }
  }

  try {
    assertSafeAnalyticsPayload(cleaned);
  } catch {
    return { sent: false, adapter: "noop_unconfigured", reason: "unsafe_payload" };
  }

  const safe = cleaned as AnalyticsPayload;
  const result = track(event as AnalyticsEventName, safe);

  // Continuity aliases for existing dashboards (one legacy fire each).
  if (event === "calculator_start") {
    track("calculator_started", safe);
  } else if (event === "calculator_complete") {
    track("calculator_completed", safe);
  } else if (event === "lead_success") {
    track("lead_form_submitted_success", safe);
    track("lead_form_submitted", safe);
    track("lead_submitted", safe);
  } else if (event === "lead_error") {
    track("lead_form_error", safe);
  } else if (event === "lead_form_view") {
    track("lead_form_started", safe);
  } else if (event === "situation_select") {
    track("intent_selected", {
      ...safe,
      intent_id: safe.situation ?? safe.intent_id,
    });
  } else if (event === "cta_click") {
    track("primary_cta_clicked", safe);
  }

  return result;
}

/** Phase 7: map lead_success → ad conversion destinations (no PII). */
export function mapLeadSuccessForAdConversions(
  payload: AnalyticsPayload
): { event: "lead_success"; payload: AnalyticsPayload } {
  const safe = buildPhase7AdConversionPayload({
    ...payload,
    page_intent: payload.page_intent,
    source_page: payload.source_page,
    landing_path: payload.path ?? payload.source_page,
    cta_destination: payload.cta_destination,
    cta_placement: payload.cta_placement,
    funnel_id: payload.funnel_id ?? "phase7_conversion",
    purpose: payload.purpose,
    utm_source: payload.utm_source,
    utm_medium: payload.utm_medium,
    utm_campaign: payload.utm_campaign,
    utm_content: payload.utm_content,
    utm_term: payload.utm_term,
  });
  return {
    event: "lead_success",
    payload: {
      ...safe,
      calculator_type: payload.calculator_type,
      selected_lender: payload.selected_lender,
      selected_rate_scenario_category: payload.selected_rate_scenario_category,
      ltv_band: payload.ltv_band,
      fixation_months: payload.fixation_months,
      funnel_id: safe.funnel_id ?? "phase7_conversion",
    },
  };
}
