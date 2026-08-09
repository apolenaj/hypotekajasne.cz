/**
 * Phase 4 — consent gating, bands, PII, lead success/error, once-guards.
 */
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import {
  ltvBand,
  mortgageAmountBand,
  pricingScenarioCategory,
  propertyValueBand,
} from "@/lib/analytics/bands";
import {
  assertSafeAnalyticsPayload,
  ANALYTICS_EVENTS,
} from "@/lib/analytics/events";
import { PHASE4_CONVERSION_FUNNEL } from "@/lib/analytics/funnel";
import {
  mapLeadSuccessForAdConversions,
  PHASE4_EVENTS,
  trackEvent,
  trackEventOnce,
} from "@/lib/analytics/track-event";
import { COOKIE_STORAGE_KEY } from "@/lib/consent/records";

type StorageLike = {
  getItem: (k: string) => string | null;
  setItem: (k: string, v: string) => void;
  removeItem: (k: string) => void;
  clear: () => void;
};

function memoryStorage(): StorageLike {
  const map = new Map<string, string>();
  return {
    getItem: (k) => (map.has(k) ? map.get(k)! : null),
    setItem: (k, v) => {
      map.set(k, String(v));
    },
    removeItem: (k) => {
      map.delete(k);
    },
    clear: () => map.clear(),
  };
}

function setAnalyticsConsent(enabled: boolean) {
  localStorage.setItem(
    COOKIE_STORAGE_KEY,
    JSON.stringify({
      policyVersion: "test",
      categories: { necessary: true, analytics: enabled, marketing: false },
      decidedAt: new Date().toISOString(),
    })
  );
}

const gtagCalls: unknown[][] = [];

beforeEach(() => {
  gtagCalls.length = 0;
  const local = memoryStorage();
  const session = memoryStorage();
  (globalThis as { window?: unknown }).window = {
    localStorage: local,
    sessionStorage: session,
    location: { pathname: "/", search: "", hostname: "localhost" },
    gtag: (...args: unknown[]) => {
      gtagCalls.push(args);
    },
    dataLayer: [],
  };
  (globalThis as { localStorage?: StorageLike }).localStorage = local;
  (globalThis as { sessionStorage?: StorageLike }).sessionStorage = session;
  delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  delete process.env.NEXT_PUBLIC_ANALYTICS_DEBUG;
});

afterEach(() => {
  delete (globalThis as { window?: unknown }).window;
  delete (globalThis as { localStorage?: unknown }).localStorage;
  delete (globalThis as { sessionStorage?: unknown }).sessionStorage;
  delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  delete process.env.NEXT_PUBLIC_ANALYTICS_DEBUG;
});

describe("phase4 analytics abstraction", () => {
  it("exports the primary Phase 4 event taxonomy", () => {
    for (const e of PHASE4_EVENTS) {
      assert.ok(
        (ANALYTICS_EVENTS as readonly string[]).includes(e),
        `missing ${e}`
      );
    }
    assert.deepEqual(
      PHASE4_CONVERSION_FUNNEL.steps.map((s) => s.id),
      [
        "homepage",
        "calculator_start",
        "calculator_complete",
        "rate_results",
        "rate_detail",
        "lead_form",
        "lead_submit",
        "lead_success",
      ]
    );
  });

  it("does not transmit without analytics consent", () => {
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-TESTONLY";
    setAnalyticsConsent(false);
    const result = trackEvent("calculator_start", {
      calculator_type: "mortgage",
    });
    assert.equal(result.sent, false);
    assert.equal(result.reason, "no_consent");
    assert.equal(gtagCalls.length, 0);
  });

  it("transmits consented events when GA is configured", () => {
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-TESTONLY";
    setAnalyticsConsent(true);
    const result = trackEvent("calculator_complete", {
      calculator_type: "mortgage",
      purpose: "purchase",
      ltv_band: "70_80",
      mortgage_amount_band: "4m_6m",
    });
    assert.equal(result.sent, true);
    assert.equal(result.adapter, "gtag");
    assert.ok(gtagCalls.length >= 1);
    const first = gtagCalls[0]!;
    assert.equal(first[0], "event");
    assert.equal(first[1], "calculator_complete");
  });

  it("strips PII keys and never accepts them in safe payload", () => {
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-TESTONLY";
    setAnalyticsConsent(true);
    const result = trackEvent(
      "lead_submit",
      {
        source_page: "/sazby",
        email: "phase4-analytics-test@example.com",
        phone: "+420777000111",
        name: "PHASE4 ANALYTICS TEST",
        message: "secret note",
        notes: "do not send",
      } as Record<string, unknown> as import("@/lib/analytics/events").AnalyticsPayload
    );
    assert.equal(result.sent, true);
    const payload = gtagCalls.find((c) => c[1] === "lead_submit")?.[2] as
      | Record<string, unknown>
      | undefined;
    assert.ok(payload);
    for (const key of [
      "email",
      "phone",
      "name",
      "first_name",
      "last_name",
      "message",
      "notes",
      "address",
    ]) {
      assert.equal(payload[key], undefined, key);
    }
    assert.throws(() =>
      assertSafeAnalyticsPayload({ email: "a@b.cz", phone: "+420111222333" })
    );
  });

  it("maps financial values to allowed bands", () => {
    assert.equal(mortgageAmountBand(1_500_000), "under_2m");
    assert.equal(mortgageAmountBand(3_000_000), "2m_4m");
    assert.equal(mortgageAmountBand(5_000_000), "4m_6m");
    assert.equal(mortgageAmountBand(8_000_000), "6m_10m");
    assert.equal(mortgageAmountBand(12_000_000), "10m_plus");
    assert.equal(propertyValueBand(2_500_000), "2m_4m");
    assert.equal(ltvBand(55), "0_60");
    assert.equal(ltvBand(65), "60_70");
    assert.equal(ltvBand(75), "70_80");
    assert.equal(ltvBand(85), "80_90");
    assert.equal(ltvBand(95), "90_plus");
    assert.doesNotThrow(() =>
      assertSafeAnalyticsPayload({
        mortgage_amount_band: "4m_6m",
        property_value_band: "6m_10m",
        ltv_band: "70_80",
      })
    );
  });

  it("maps pricing scenarios to safe public categories", () => {
    assert.equal(
      pricingScenarioCategory("with_repayment_insurance"),
      "with_insurance"
    );
    assert.equal(
      pricingScenarioCategory("without_repayment_insurance"),
      "without_insurance"
    );
    assert.equal(
      pricingScenarioCategory("active_account_discount"),
      "account_conditions"
    );
    assert.equal(pricingScenarioCategory("green_mortgage"), "green");
    assert.equal(pricingScenarioCategory("custom_internal_v3"), "other");
  });

  it("fires lead_success only as an explicit success event (not on error)", () => {
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-TESTONLY";
    setAnalyticsConsent(true);
    trackEvent("lead_error", {
      source_page: "/sazby",
      error_code: "api_or_network",
    });
    const names = gtagCalls.map((c) => c[1]);
    assert.ok(names.includes("lead_error"));
    assert.ok(!names.includes("lead_success"));
    assert.ok(!names.includes("lead_form_submitted_success"));

    gtagCalls.length = 0;
    trackEvent("lead_success", {
      source_page: "/sazby",
      selected_lender: "airbank",
      selected_rate_scenario_category: "without_insurance",
    });
    const successNames = gtagCalls.map((c) => c[1]);
    assert.ok(successNames.includes("lead_success"));
    assert.ok(successNames.includes("lead_form_submitted_success"));
  });

  it("guards duplicate critical conversion events via trackEventOnce", () => {
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-TESTONLY";
    setAnalyticsConsent(true);
    const a = trackEventOnce("lead_success", "test_lead_success_once", {
      source_page: "/",
    });
    const b = trackEventOnce("lead_success", "test_lead_success_once", {
      source_page: "/",
    });
    assert.equal(a.sent, true);
    assert.equal(b.sent, false);
    assert.equal(
      gtagCalls.filter((c) => c[1] === "lead_success").length,
      1
    );
  });

  it("does not crash when GA measurement id is missing", () => {
    delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    setAnalyticsConsent(true);
    const result = trackEvent("homepage_view", { path: "/" });
    assert.equal(result.sent, false);
    assert.ok(
      result.adapter === "debug_only" || result.adapter === "noop_unconfigured"
    );
  });

  it("phone/email click payloads exclude raw contact values", () => {
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-TESTONLY";
    setAnalyticsConsent(true);
    trackEvent("phone_click", {
      source_page: "/",
      placement: "footer",
    });
    trackEvent("email_click", {
      source_page: "/",
      placement: "footer",
    });
    for (const call of gtagCalls) {
      const payload = call[2] as Record<string, unknown>;
      const serialized = JSON.stringify(payload);
      assert.ok(!serialized.includes("@"));
      assert.ok(!/\+?\d[\d\s-]{8,}/.test(serialized));
      assert.equal(payload.phone, undefined);
      assert.equal(payload.email, undefined);
    }
  });

  it("prepares lead_success mapping for future ad conversions without PII", () => {
    const mapped = mapLeadSuccessForAdConversions({
      source_page: "/sazby",
      purpose: "purchase",
      calculator_type: "mortgage",
      selected_lender: "moneta",
      selected_rate_scenario_category: "other",
      ltv_band: "80_90",
      fixation_months: 36,
      email: "should-not-map@example.com",
    } as import("@/lib/analytics/events").AnalyticsPayload);
    assert.equal(mapped.event, "lead_success");
    assert.equal(mapped.payload.selected_lender, "moneta");
    assert.equal(
      (mapped.payload as { email?: string }).email,
      undefined
    );
  });
});
