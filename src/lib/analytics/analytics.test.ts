/**
 * Analytics privacy + funnel + experiment framework tests.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ANALYTICS_EVENTS,
  assertSafeAnalyticsPayload,
  scoreToBucket,
} from "@/lib/analytics/events";
import { EXPERIMENTS } from "@/lib/analytics/experiments";
import { FUNNEL_DASHBOARD_SPEC, FUNNEL_STAGES } from "@/lib/analytics/funnel";

describe("analytics taxonomy", () => {
  it("includes all required release events", () => {
    const required = [
      "homepage_intent_selected",
      "calculator_started",
      "calculator_completed",
      "prescore_started",
      "prescore_completed",
      "investment_pass_started",
      "investment_pass_completed",
      "country_viewed",
      "financing_option_selected",
      "majetio_clicked",
      "analysis_started",
      "analysis_checkout_started",
      "lead_submitted",
      "partner_handoff",
      "conversion_confirmed",
    ];
    for (const e of required) {
      assert.ok(ANALYTICS_EVENTS.includes(e as never), e);
    }
  });

  it("rejects PII / large amounts in payload", () => {
    assert.throws(() => assertSafeAnalyticsPayload({ email: "a@b.cz" }));
    assert.throws(() => assertSafeAnalyticsPayload({ phone: "+420777123456" }));
    assert.throws(() => assertSafeAnalyticsPayload({ income: 80000 }));
    assert.throws(() => assertSafeAnalyticsPayload({ amount_czk: 5_000_000 }));
    assert.doesNotThrow(() =>
      assertSafeAnalyticsPayload({
        intent_id: "home",
        score_bucket: "51-75",
        partner_scope: "mortgage_specialist",
      })
    );
  });

  it("score buckets are coarse", () => {
    assert.equal(scoreToBucket(10), "0-25");
    assert.equal(scoreToBucket(90), "76-100");
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
