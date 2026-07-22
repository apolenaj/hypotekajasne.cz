/**
 * Analytics privacy + funnel + experiment + dictionary tests.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ANALYTICS_EVENTS,
  EVENT_DICTIONARY,
  assertSafeAnalyticsPayload,
  categorizeCopilotPrompt,
  scoreToBucket,
} from "@/lib/analytics/events";
import { parseUtmFromLocation } from "@/lib/analytics/attribution";
import { PRODUCT_KPIS, KPI_PRIVACY_NOTE } from "@/lib/analytics/kpi";
import { EXPERIMENTS } from "@/lib/analytics/experiments";
import {
  FUNNEL_DASHBOARD_SPEC,
  FUNNEL_STAGES,
  NORTH_STAR_FUNNEL,
} from "@/lib/analytics/funnel";
import {
  getGaMeasurementId,
  isAnalyticsDebugEnabled,
  isGtagConfigured,
} from "@/lib/analytics/adapters";

describe("analytics taxonomy", () => {
  it("includes required product + funnel events (PROMPT 19)", () => {
    const required = [
      "page_view",
      "homepage_view",
      "intent_selected",
      "primary_cta_clicked",
      "onboarding_started",
      "onboarding_step_completed",
      "onboarding_completed",
      "onboarding_abandoned",
      "calculator_started",
      "calculator_completed",
      "result_viewed",
      "specialist_cta_clicked",
      "market_viewed",
      "market_compared",
      "market_compare_started",
      "country_calculator_started",
      "passport_started",
      "passport_completed",
      "passport_shared_intent",
      "financial_passport_created",
      "investment_passport_completed",
      "rentgen_started",
      "property_xray_started",
      "property_input_completed",
      "property_xray_completed",
      "free_result_viewed",
      "premium_viewed",
      "premium_cta_clicked",
      "copilot_opened",
      "copilot_question_submitted",
      "source_opened",
      "lead_form_started",
      "lead_form_submitted",
      "lead_form_submitted_success",
      "lead_form_error",
      "lead_submitted",
      "partner_handoff",
      "partner_handoff_requested",
      "refinance_radar_started",
    ];
    for (const e of required) {
      assert.ok(ANALYTICS_EVENTS.includes(e as never), e);
    }
  });

  it("has unique event names and stable count", () => {
    assert.equal(ANALYTICS_EVENTS.length, new Set(ANALYTICS_EVENTS).size);
    assert.equal(ANALYTICS_EVENTS.length, 56);
  });

  it("EVENT_DICTIONARY covers core conversion events", () => {
    const names = new Set(EVENT_DICTIONARY.map((r) => r.event));
    assert.ok(names.has("page_view"));
    assert.ok(names.has("homepage_view"));
    assert.ok(names.has("intent_selected"));
    assert.ok(names.has("calculator_completed"));
    assert.ok(names.has("lead_form_submitted"));
    assert.ok(names.has("property_xray_completed"));
    assert.ok(names.has("refinance_radar_started"));
    assert.ok(names.has("copilot_question_submitted"));
  });

  it("rejects PII / large amounts / chat text keys in payload", () => {
    assert.throws(() => assertSafeAnalyticsPayload({ email: "a@b.cz" }));
    assert.throws(() => assertSafeAnalyticsPayload({ phone: "+420777123456" }));
    assert.throws(() => assertSafeAnalyticsPayload({ income: 80000 }));
    assert.throws(() => assertSafeAnalyticsPayload({ amount_czk: 5_000_000 }));
    assert.throws(() => assertSafeAnalyticsPayload({ debt: 500_000 }));
    assert.throws(() => assertSafeAnalyticsPayload({ liabilities: 100_000 }));
    assert.throws(() => assertSafeAnalyticsPayload({ rodne_cislo: "9001011234" }));
    assert.throws(() => assertSafeAnalyticsPayload({ financial_profile: {} }));
    assert.throws(() =>
      assertSafeAnalyticsPayload({ question: "Kolik si můžu půjčit?" })
    );
    assert.doesNotThrow(() =>
      assertSafeAnalyticsPayload({
        intent_id: "home",
        score_bucket: "51-75",
        partner_scope: "mortgage_specialist",
        question_category: "affordability",
        cta_id: "hero_moje_moznosti",
        utm_source: "google",
        utm_medium: "cpc",
        utm_campaign: "spring_2026",
        visitor_type: "returning",
        session_id: "s_abc123",
        lead_qualified: true,
      })
    );
  });

  it("score buckets are coarse", () => {
    assert.equal(scoreToBucket(10), "0-25");
    assert.equal(scoreToBucket(90), "76-100");
  });

  it("categorizeCopilotPrompt never returns free text", () => {
    const cat = categorizeCopilotPrompt("Jaká je moje DSTI při příjmu?");
    assert.equal(cat, "mortgage_mechanics");
    assert.ok(!cat.includes(" "));
  });
});

describe("analytics attribution", () => {
  it("sanitizes UTM values — alphanumeric only, max 64 chars", () => {
    const parsed = parseUtmFromLocation(
      "?utm_source=Google_Ads&utm_medium=cpc&utm_campaign=spring-2026&utm_content=ignored"
    );
    assert.equal(parsed.utm_source, "google_ads");
    assert.equal(parsed.utm_medium, "cpc");
    assert.equal(parsed.utm_campaign, "spring-2026");
    assert.equal((parsed as { utm_content?: string }).utm_content, undefined);
  });

  it("rejects unsafe UTM injection patterns", () => {
    const parsed = parseUtmFromLocation(
      "?utm_source=<script>&utm_medium=javascript:alert(1)"
    );
    assert.equal(parsed.utm_source, undefined);
    assert.equal(parsed.utm_medium, undefined);
  });
});

describe("analytics KPI spec", () => {
  it("defines seven dashboard-ready KPIs (PROMPT 19)", () => {
    assert.equal(PRODUCT_KPIS.length, 7);
    const ids = PRODUCT_KPIS.map((k) => k.metricId);
    assert.ok(ids.includes("kpi_calculator_completion_rate"));
    assert.ok(ids.includes("kpi_lead_conversion"));
    assert.ok(ids.includes("kpi_qualified_lead_rate"));
    assert.ok(ids.includes("kpi_investment_xray_completion"));
    assert.ok(ids.includes("kpi_refinancing_activation"));
    assert.ok(ids.includes("kpi_returning_users_share"));
    assert.ok(ids.includes("kpi_market_compare_lead_conversion"));
    assert.ok(KPI_PRIVACY_NOTE.includes("Never aggregate raw incomes"));
  });
});

describe("analytics adapters", () => {
  it("exposes configuration helpers without pretending provider is live", () => {
    assert.equal(typeof isGtagConfigured(), "boolean");
    assert.equal(typeof getGaMeasurementId() === "string" || getGaMeasurementId() === null, true);
    assert.equal(typeof isAnalyticsDebugEnabled(), "boolean");
  });
});

describe("funnel dashboard spec", () => {
  it("lists the canonical funnel stages in order", () => {
    assert.deepEqual(
      FUNNEL_STAGES.map((s) => s.id),
      [
        "traffic",
        "tool_start",
        "tool_completion",
        "qualified_lead",
        "partner_handoff",
        "mortgage_completed",
        "property_purchased",
        "analysis_purchased",
      ]
    );
    assert.ok(FUNNEL_DASHBOARD_SPEC.privacyNote.includes("raw incomes"));
    assert.ok(
      FUNNEL_DASHBOARD_SPEC.recommendedWidgets.some((n) =>
        n.includes("kpi_calculator_completion_rate")
      )
    );
  });

  it("defines north-star Moje možnosti funnel", () => {
    assert.equal(NORTH_STAR_FUNNEL.id, "moje_moznosti_north_star");
    assert.deepEqual(
      NORTH_STAR_FUNNEL.steps.map((s) => s.id),
      ["landing", "cta", "result", "decision_action", "conversion"]
    );
  });
});

describe("experiment framework", () => {
  it("defines hero, cta, form_length, free_preview, majetio_cross_sell", () => {
    assert.ok(EXPERIMENTS.hero);
    assert.ok(EXPERIMENTS.cta);
    assert.ok(EXPERIMENTS.form_length);
    assert.ok(EXPERIMENTS.free_preview);
    assert.ok(EXPERIMENTS.majetio_cross_sell);
    assert.ok(EXPERIMENTS.hero.variants.includes("control"));
  });
});
