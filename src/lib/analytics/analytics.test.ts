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
  it("includes required 17M product events", () => {
    const required = [
      "page_view",
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
      "country_calculator_started",
      "passport_started",
      "passport_completed",
      "passport_shared_intent",
      "rentgen_started",
      "property_input_completed",
      "free_result_viewed",
      "premium_viewed",
      "premium_cta_clicked",
      "copilot_opened",
      "copilot_question_submitted",
      "source_opened",
      "lead_form_started",
      "lead_form_submitted_success",
      "lead_form_error",
      "lead_submitted",
      "partner_handoff",
    ];
    for (const e of required) {
      assert.ok(ANALYTICS_EVENTS.includes(e as never), e);
    }
  });

  it("has unique event names and stable count", () => {
    assert.equal(ANALYTICS_EVENTS.length, new Set(ANALYTICS_EVENTS).size);
    assert.equal(ANALYTICS_EVENTS.length, 46);
  });

  it("EVENT_DICTIONARY covers core conversion events", () => {
    const names = new Set(EVENT_DICTIONARY.map((r) => r.event));
    assert.ok(names.has("page_view"));
    assert.ok(names.has("onboarding_completed"));
    assert.ok(names.has("lead_form_submitted_success"));
    assert.ok(names.has("copilot_question_submitted"));
  });

  it("rejects PII / large amounts / chat text keys in payload", () => {
    assert.throws(() => assertSafeAnalyticsPayload({ email: "a@b.cz" }));
    assert.throws(() => assertSafeAnalyticsPayload({ phone: "+420777123456" }));
    assert.throws(() => assertSafeAnalyticsPayload({ income: 80000 }));
    assert.throws(() => assertSafeAnalyticsPayload({ amount_czk: 5_000_000 }));
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
    assert.ok(FUNNEL_DASHBOARD_SPEC.privacyNote.includes("no incomes"));
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
