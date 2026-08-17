/**
 * Phase 6.2 — final operations verification tests.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, it, mock } from "node:test";
import {
  isSyntheticRetentionMarker,
  sanitizeLeadAttribution,
} from "@/lib/leads-attribution";
import {
  aggregateLeadFunnel,
  canTransitionLifecycle,
  revenueFieldsForTransition,
} from "@/lib/leads-lifecycle";
import {
  authorizeLeadOpsRequest,
  notifyLeadOperatorsBestEffort,
  readSafePageIntent,
} from "@/lib/leads-ops";
import {
  buildLeadOpsEmailSubject,
  buildLeadOpsEmailText,
  describeLeadOpsEmailProviderGap,
} from "@/lib/leads-ops-email";
import {
  CONSENT_DEFAULTS_INLINE_SCRIPT,
  CONSENT_MODE_DEFAULT_DENIED,
} from "@/lib/consent/consent-mode";
import {
  retentionResultPublicJson,
  runPrivacyRetentionCleanup,
} from "@/lib/legal/retention-cleanup";
import { privacyRetention } from "@/lib/legal/privacy-retention";
import { WAVE1_COMMERCIAL_LANDINGS } from "@/lib/seo/commercial-wave1";

const ROOT = process.cwd();

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), "utf8");
}

describe("Phase 6.2 — retention cron", () => {
  it("vercel.json registers privacy-retention cron", () => {
    const cfg = JSON.parse(read("vercel.json")) as {
      crons: Array<{ path: string; schedule: string }>;
    };
    const entry = cfg.crons.find(
      (c) => c.path === "/api/cron/privacy-retention"
    );
    assert.ok(entry, "privacy-retention cron missing");
    assert.equal(entry?.schedule, "30 4 * * *");
  });

  it("route requires Bearer CRON_SECRET and supports dryRun", () => {
    const src = read("src/app/api/cron/privacy-retention/route.ts");
    assert.match(src, /Authorization: Bearer/);
    assert.match(src, /status: 401/);
    assert.match(src, /dryRun=true/);
    assert.match(src, /retentionResultPublicJson/);
    assert.equal(src.includes("candidateIds:"), false);
  });

  it("published GDPR months match cleanup config", () => {
    assert.equal(privacyRetention.inactiveEnquiryMonths, 6);
    assert.equal(privacyRetention.marketingInactivityMonths, 24);
    assert.equal(privacyRetention.technicalLogDays, 90);
    assert.equal(privacyRetention.cleanupScheduledInCron, true);
    const gdprSrc = read("src/lib/legal/privacy-retention.ts");
    assert.match(gdprSrc, /inactiveEnquiryMonths: 6/);
  });

  it("dry-run does not mutate leads and public JSON omits candidateIds", async () => {
    const updates: unknown[] = [];
    const deletes: unknown[] = [];
    const candidates = [
      {
        id: "11111111-1111-1111-1111-111111111111",
        retention_until: "2020-01-01T00:00:00.000Z",
        legal_hold: false,
        active_case: false,
        deleted_at: null,
        marketing_consent: false,
        metadata: { test_marker: "phase_6_2_unit" },
      },
    ];

    const supabase = {
      from(table: string) {
        if (table === "leads") {
          return {
            select() {
              return this;
            },
            is() {
              return this;
            },
            eq() {
              return this;
            },
            not() {
              return this;
            },
            lt() {
              return this;
            },
            limit() {
              return Promise.resolve({ data: candidates, error: null });
            },
            update(payload: unknown) {
              updates.push(payload);
              return {
                eq() {
                  return this;
                },
                is() {
                  return this;
                },
                then() {
                  return Promise.resolve({ error: null });
                },
              };
            },
          };
        }
        // pipeline_runs count
        return {
          select() {
            return this;
          },
          lt() {
            return Promise.resolve({ count: 3, error: null });
          },
          delete() {
            deletes.push(true);
            return {
              lt() {
                return Promise.resolve({ count: 0, error: null });
              },
            };
          },
        };
      },
    };

    const beforeIds = candidates.map((c) => c.id);
    const result = await runPrivacyRetentionCleanup(
      supabase as never,
      { dryRun: true, runId: "test-run" }
    );

    assert.equal(result.dryRun, true);
    assert.equal(result.candidateCount, 1);
    assert.deepEqual(result.candidateIds, beforeIds);
    assert.equal(updates.length, 0);
    assert.equal(deletes.length, 0);
    assert.equal(result.anonymized, 0);
    assert.equal(result.technicalLogsWouldDelete, 3);

    const pub = retentionResultPublicJson(result);
    assert.equal("candidateIds" in pub, false);
    assert.equal(pub.candidateCount, 1);
    assert.equal(pub.runId, "test-run");
    const serialized = JSON.stringify(pub);
    assert.equal(serialized.includes("11111111-1111-1111-1111-111111111111"), false);
  });

  it("idempotent second dry-run returns same candidate count", async () => {
    const candidates = [
      {
        id: "22222222-2222-2222-2222-222222222222",
        retention_until: "2020-01-01T00:00:00.000Z",
        legal_hold: false,
        active_case: false,
        deleted_at: null,
        marketing_consent: false,
        metadata: {},
      },
    ];
    const supabase = {
      from(table: string) {
        if (table === "leads") {
          return {
            select() {
              return this;
            },
            is() {
              return this;
            },
            eq() {
              return this;
            },
            not() {
              return this;
            },
            lt() {
              return this;
            },
            limit() {
              return Promise.resolve({ data: candidates, error: null });
            },
          };
        }
        return {
          select() {
            return this;
          },
          lt() {
            return Promise.resolve({ count: 0, error: null });
          },
        };
      },
    };
    const a = await runPrivacyRetentionCleanup(supabase as never, {
      dryRun: true,
    });
    const b = await runPrivacyRetentionCleanup(supabase as never, {
      dryRun: true,
    });
    assert.equal(a.candidateCount, b.candidateCount);
    assert.deepEqual(a.candidateIds, b.candidateIds);
  });

  it("anonymize preserves consent evidence keys in metadata", async () => {
    const updated: Array<Record<string, unknown>> = [];
    const row = {
      id: "33333333-3333-3333-3333-333333333333",
      retention_until: "2020-01-01T00:00:00.000Z",
      legal_hold: false,
      active_case: false,
      deleted_at: null,
      marketing_consent: false,
      metadata: {
        consent: { privacyAccepted: true },
        privacy_notice_version: "2026-08-07.2",
        name: "should-not-matter",
      },
    };
    const supabase = {
      from(table: string) {
        if (table === "leads") {
          return {
            select() {
              return this;
            },
            is() {
              return this;
            },
            eq(col: string, val: unknown) {
              void col;
              void val;
              return this;
            },
            not() {
              return this;
            },
            lt() {
              return this;
            },
            limit() {
              return Promise.resolve({ data: [row], error: null });
            },
            update(payload: Record<string, unknown>) {
              updated.push(payload);
              return {
                eq() {
                  return this;
                },
                is() {
                  return this;
                },
                then(
                  resolve: (v: { error: null }) => unknown
                ) {
                  return Promise.resolve(resolve({ error: null }));
                },
              };
            },
          };
        }
        return {
          delete() {
            return {
              lt() {
                return Promise.resolve({ count: 0, error: null });
              },
            };
          },
        };
      },
    };

    await runPrivacyRetentionCleanup(supabase as never, { dryRun: false });
    assert.equal(updated.length, 1);
    const meta = updated[0]?.metadata as Record<string, unknown>;
    assert.equal(meta.privacy_notice_version, "2026-08-07.2");
    assert.ok(meta.consent);
    assert.equal(meta.retention_cleanup, true);
  });
});

describe("Phase 6.2 — consent mode + GA gating", () => {
  it("default consent signals are denied", () => {
    assert.equal(CONSENT_MODE_DEFAULT_DENIED.analytics_storage, "denied");
    assert.equal(CONSENT_MODE_DEFAULT_DENIED.ad_storage, "denied");
    assert.equal(CONSENT_MODE_DEFAULT_DENIED.ad_user_data, "denied");
    assert.equal(CONSENT_MODE_DEFAULT_DENIED.ad_personalization, "denied");
    assert.match(CONSENT_DEFAULTS_INLINE_SCRIPT, /analytics_storage: 'denied'/);
    assert.match(CONSENT_DEFAULTS_INLINE_SCRIPT, /ad_storage: 'denied'/);
  });

  it("root layout mounts ConsentDefaultsScript beforeInteractive", () => {
    const layout = read("src/app/layout.tsx");
    assert.match(layout, /ConsentDefaultsScript/);
    const script = read("src/components/consent/ConsentDefaultsScript.tsx");
    assert.match(script, /beforeInteractive/);
  });

  it("GA script loads only after analyticsAllowed", () => {
    const src = read("src/components/consent/ConsentGatedScripts.tsx");
    assert.match(src, /analyticsAllowed && Boolean\(gaId\)/);
    assert.match(src, /consent', 'update'/);
  });
});

describe("Phase 6.2 — lead attribution + ops", () => {
  it("page_intent allowlist rejects arbitrary strings", () => {
    assert.equal(readSafePageIntent({ page_intent: "refinance" }), "refinance");
    assert.equal(readSafePageIntent({ page_intent: "hack" }), null);
    assert.equal(readSafePageIntent({ page_intent: "osvc" }), "osvc");
  });

  it("strips click IDs and unsafe PII keys from metadata", () => {
    const out = sanitizeLeadAttribution({
      page_intent: "investment",
      gclid: "abc123",
      fbclid: "xyz",
      email: "person@example.com",
      utm_source: "google",
      utm_medium: "cpc",
      landing_path: "/hypoteka-na-investici?x=1",
    });
    assert.equal(out.page_intent, "investment");
    assert.equal(out.utm_source, "google");
    assert.equal(out.landing_path, "/hypoteka-na-investici");
    assert.equal("gclid" in out.metadata, false);
    assert.equal("fbclid" in out.metadata, false);
    assert.equal("email" in out.metadata, false);
  });

  it("synthetic marker recognition", () => {
    assert.equal(isSyntheticRetentionMarker("phase_6_2_20260812"), true);
    assert.equal(isSyntheticRetentionMarker("real-customer"), false);
  });

  it("webhook retry uses same leadId and does not invent a second lead", async () => {
    const bodies: string[] = [];
    let calls = 0;
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async (_url: RequestInfo | URL, init?: RequestInit) => {
      calls += 1;
      bodies.push(String(init?.body ?? ""));
      return new Response("fail", { status: 500 });
    }) as typeof fetch;

    process.env.LEAD_OPS_WEBHOOK_URL = "https://example.test/hooks/leads";
    delete process.env.LEAD_OPS_RECIPIENT_EMAIL;
    try {
      const result = await notifyLeadOperatorsBestEffort({
        leadId: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
        source: "landing",
        pageIntent: "refinance",
        createdAt: "2026-08-17T12:00:00.000Z",
        name: "Test",
        email: "test@example.com",
      });
      assert.equal(result.attempted, true);
      assert.equal(result.delivered, false);
      assert.equal(result.attempts, 2);
      assert.equal(calls, 2);
      assert.equal(bodies[0], bodies[1]);
      assert.match(bodies[0]!, /aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee/);
      assert.equal(bodies[0]!.includes("name"), false);
      assert.equal(bodies[0]!.includes("email"), false);
    } finally {
      globalThis.fetch = originalFetch;
      delete process.env.LEAD_OPS_WEBHOOK_URL;
    }
  });

  it("email subjects and body fields match Phase 6.2 contract", () => {
    assert.equal(
      buildLeadOpsEmailSubject("refinance", false),
      "[Hypotéka Jasně] Nový lead – refinance"
    );
    assert.equal(
      buildLeadOpsEmailSubject("osvc", true),
      "[TEST PHASE 6.2] Nový lead – osvc"
    );
    const text = buildLeadOpsEmailText({
      leadId: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
      createdAt: "2026-08-17T12:00:00.000Z",
      pageIntent: "refinance",
      name: "PHASE62",
      email: "phase62@example.com",
      phone: "+420777000001",
      landingPage: "/temata/refinancovani",
      message: "optional note",
      isTest: true,
    });
    assert.match(text, /Lead ID:/);
    assert.match(text, /Business owner: Michal Heinzke/);
    assert.match(text, /Message: optional note/);
    assert.equal(text.includes("gclid"), false);
    assert.equal(text.includes("cookie"), false);
  });

  it("email notify skips send when Resend keys missing (recipient set)", async () => {
    const originalFetch = globalThis.fetch;
    let calls = 0;
    globalThis.fetch = (async () => {
      calls += 1;
      return new Response("{}", { status: 200 });
    }) as typeof fetch;

    process.env.LEAD_OPS_RECIPIENT_EMAIL = "ops@example.com";
    delete process.env.RESEND_API_KEY;
    delete process.env.NOTIFY_EMAIL_PROVIDER_API_KEY;
    delete process.env.LEAD_OPS_FROM_EMAIL;
    delete process.env.NOTIFY_EMAIL_FROM;
    delete process.env.LEAD_OPS_WEBHOOK_URL;

    try {
      const gap = describeLeadOpsEmailProviderGap();
      assert.equal(gap.recipientConfigured, true);
      assert.equal(gap.ready, false);
      assert.ok(gap.missing.includes("RESEND_API_KEY (or NOTIFY_EMAIL_PROVIDER_API_KEY)"));

      const result = await notifyLeadOperatorsBestEffort({
        leadId: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
        source: "landing",
        pageIntent: "refinance",
        createdAt: "2026-08-17T12:00:00.000Z",
        name: "PHASE62",
        email: "phase62@example.com",
        testMarker: "phase_6_2_email_unit",
      });
      assert.equal(result.emailDelivered, false);
      assert.equal(result.emailErrorCode, "email_provider_not_configured");
      assert.equal(calls, 0);
    } finally {
      globalThis.fetch = originalFetch;
      delete process.env.LEAD_OPS_RECIPIENT_EMAIL;
    }
  });

  it("email notify retries same leadId via Resend without creating a second lead", async () => {
    const bodies: string[] = [];
    let calls = 0;
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async (_url: RequestInfo | URL, init?: RequestInit) => {
      calls += 1;
      bodies.push(String(init?.body ?? ""));
      return new Response("fail", { status: 500 });
    }) as typeof fetch;

    process.env.LEAD_OPS_RECIPIENT_EMAIL = "ops@example.com";
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.LEAD_OPS_FROM_EMAIL = "noreply@example.com";
    delete process.env.LEAD_OPS_WEBHOOK_URL;

    try {
      const result = await notifyLeadOperatorsBestEffort({
        leadId: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
        source: "landing",
        pageIntent: "refinance",
        createdAt: "2026-08-17T12:00:00.000Z",
        name: "PHASE62",
        email: "phase62@example.com",
        phone: "+420777000001",
        landingPage: "/temata/refinancovani",
        testMarker: "phase_6_2_email_unit",
      });
      assert.equal(result.attempted, true);
      assert.equal(result.emailDelivered, false);
      assert.equal(result.attempts, 2);
      assert.equal(calls, 2);
      assert.equal(bodies[0], bodies[1]);
      assert.match(bodies[0]!, /aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee/);
      assert.match(bodies[0]!, /\[TEST PHASE 6\.2\] Nový lead – refinance/);
    } finally {
      globalThis.fetch = originalFetch;
      delete process.env.LEAD_OPS_RECIPIENT_EMAIL;
      delete process.env.RESEND_API_KEY;
      delete process.env.LEAD_OPS_FROM_EMAIL;
    }
  });

  it("ops auth rejects missing bearer", () => {
    const req = new Request("https://example.test", {
      headers: {},
    });
    process.env.CRON_SECRET = "test-secret-value";
    try {
      assert.equal(authorizeLeadOpsRequest(req), false);
      const ok = new Request("https://example.test", {
        headers: { authorization: "Bearer test-secret-value" },
      });
      assert.equal(authorizeLeadOpsRequest(ok), true);
      const bad = new Request("https://example.test", {
        headers: { authorization: "Bearer wrong" },
      });
      assert.equal(authorizeLeadOpsRequest(bad), false);
    } finally {
      delete process.env.CRON_SECRET;
    }
  });
});

describe("Phase 6.2 — lifecycle + revenue", () => {
  it("validates transitions and rejects invalid ones", () => {
    assert.equal(canTransitionLifecycle("new", "contacted"), true);
    assert.equal(canTransitionLifecycle("approved", "funded"), true);
    assert.equal(canTransitionLifecycle("approved", "new"), false);
    assert.equal(canTransitionLifecycle("funded", "lost"), false);
    assert.equal(canTransitionLifecycle("new", "funded"), false);
  });

  it("approved does not fabricate realized revenue", () => {
    const r = revenueFieldsForTransition({ toStatus: "approved" });
    assert.equal(r.realized_revenue_amount, undefined);
    assert.equal(r.error, undefined);
  });

  it("funded without amount keeps realized undefined (NULL in DB)", () => {
    const r = revenueFieldsForTransition({ toStatus: "funded" });
    assert.equal(r.realized_revenue_amount, undefined);
  });

  it("explicit null realized stays null; zero is allowed when set", () => {
    const n = revenueFieldsForTransition({
      toStatus: "funded",
      patch: { realizedRevenueAmount: null },
    });
    assert.equal(n.realized_revenue_amount, null);
    assert.equal(n.realized_at, null);

    const z = revenueFieldsForTransition({
      toStatus: "funded",
      patch: { realizedRevenueAmount: 0 },
    });
    assert.equal(z.realized_revenue_amount, 0);
    assert.equal(z.revenue_status, "realized");
  });

  it("aggregate report matches fixture rows without PII fields", () => {
    const rows = aggregateLeadFunnel([
      {
        lifecycle_status: "new",
        page_intent: "refinance",
        utm_source: "google",
        expected_revenue_amount: null,
        realized_revenue_amount: null,
        realized_at: null,
      },
      {
        lifecycle_status: "funded",
        page_intent: "refinance",
        utm_source: "google",
        expected_revenue_amount: 10000,
        realized_revenue_amount: 8000,
        realized_at: "2026-08-01T00:00:00.000Z",
      },
      {
        lifecycle_status: "funded",
        page_intent: "osvc",
        utm_source: null,
        expected_revenue_amount: null,
        realized_revenue_amount: null,
        realized_at: null,
      },
    ]);
    const refiFunded = rows.find(
      (r) =>
        r.page_intent === "refinance" &&
        r.lifecycle_status === "funded" &&
        r.attribution_source === "google"
    );
    assert.ok(refiFunded);
    assert.equal(refiFunded?.realized_revenue_sum, 8000);
    assert.equal(refiFunded?.expected_revenue_sum, 10000);
    const serialized = JSON.stringify(rows);
    assert.equal(/@|phone|name/i.test(serialized), false);
  });

  it("SQL migration is additive and RLS-protects history", () => {
    const sql = read("supabase/leads_lifecycle_revenue.sql");
    assert.match(sql, /add column if not exists lifecycle_status/);
    assert.match(sql, /expected_revenue_amount/);
    assert.match(sql, /realized_revenue_amount/);
    assert.match(sql, /lead_lifecycle_events/);
    assert.match(sql, /enable row level security/);
    assert.match(sql, /lead_ops_funnel_daily/);
  });

  it("lifecycle API rejects unauthenticated callers", () => {
    const src = read("src/app/api/ops/leads/[id]/lifecycle/route.ts");
    assert.match(src, /authorizeLeadOpsRequest/);
    assert.match(src, /status: 401/);
    assert.match(src, /Invalid lifecycle transition/);
  });
});

describe("Phase 6.2 — five funnel regression anchors", () => {
  it("keeps all five commercial page_intent values", () => {
    const intents = WAVE1_COMMERCIAL_LANDINGS.map(
      (l) => l.commercialIntent
    ).sort();
    assert.deepEqual(
      intents,
      ["american", "foreign_income", "investment", "osvc", "refinance"].sort()
    );
  });
});

afterEach(() => {
  mock.restoreAll();
});
