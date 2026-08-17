/**
 * Phase 7 marketing conversion unit tests.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  PHASE7_FUNNEL_LANDINGS,
  PHASE7_PRIMARY_CONVERSION,
  PHASE7_SECONDARY_CONVERSIONS,
  PHASE7_SPEND_RULES,
  buildPhase7AdConversionPayload,
  buildPhase7UtmCampaign,
  isValidPhase7UtmToken,
} from "@/lib/marketing/phase7-conversion";
import { mapLeadSuccessForAdConversions } from "@/lib/analytics/track-event";
import { WAVE1_COMMERCIAL_SLUGS } from "@/lib/seo/commercial-wave1";

describe("Phase 7 — conversion hierarchy", () => {
  it("primary conversion is lead_success only", () => {
    assert.equal(PHASE7_PRIMARY_CONVERSION, "lead_success");
    assert.equal(PHASE7_SPEND_RULES.primaryOptimizationEvent, "lead_success");
    assert.ok(PHASE7_SECONDARY_CONVERSIONS.includes("lead_submit"));
    assert.ok(!PHASE7_SECONDARY_CONVERSIONS.includes("lead_success" as never));
  });

  it("maps five commercial funnels to landings", () => {
    assert.equal(PHASE7_FUNNEL_LANDINGS.refinance, "/temata/refinancovani");
    assert.equal(WAVE1_COMMERCIAL_SLUGS.length, 5);
    assert.equal(
      Object.keys(PHASE7_FUNNEL_LANDINGS).length,
      WAVE1_COMMERCIAL_SLUGS.length
    );
  });
});

describe("Phase 7 — UTM naming", () => {
  it("builds lowercase campaigns without diacritics", () => {
    const c = buildPhase7UtmCampaign({
      funnel: "refinance",
      channel: "google",
      campaignType: "search",
      variant: "fix-a",
    });
    assert.equal(c, "cz_refinance_google_search_fix-a");
    assert.ok(isValidPhase7UtmToken(c));
  });

  it("rejects unsafe utm tokens", () => {
    assert.equal(isValidPhase7UtmToken("Google Ads"), false);
    assert.equal(isValidPhase7UtmToken("ok_token"), true);
  });
});

describe("Phase 7 — ad conversion payload safety", () => {
  it("strips PII-shaped keys and keeps attribution", () => {
    const payload = buildPhase7AdConversionPayload({
      page_intent: "refinance",
      utm_source: "google",
      utm_medium: "cpc",
      utm_campaign: "cz_refinance_google_search",
      email: "x@example.com",
      phone: "+420777000000",
      name: "Test",
      gclid: "should-not-pass",
    });
    assert.equal(payload.page_intent, "refinance");
    assert.equal(payload.utm_source, "google");
    assert.equal((payload as { email?: string }).email, undefined);
    assert.equal((payload as { gclid?: string }).gclid, undefined);
  });

  it("mapLeadSuccessForAdConversions stays PII-free", () => {
    const mapped = mapLeadSuccessForAdConversions({
      source_page: "/temata/refinancovani",
      page_intent: "refinance",
      utm_source: "google",
      utm_medium: "cpc",
      utm_campaign: "cz_refinance_google_search",
      email: "leak@example.com",
    } as import("@/lib/analytics/events").AnalyticsPayload);
    assert.equal(mapped.event, "lead_success");
    assert.equal(mapped.payload.page_intent, "refinance");
    assert.equal((mapped.payload as { email?: string }).email, undefined);
  });
});
