/**
 * Phase 7.1 — pre-launch lead abuse / duplicate protection tests.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, it } from "node:test";
import {
  clearLeadIdempotencyKey,
  consumeLeadThankYouToken,
  getOrCreateLeadIdempotencyKey,
  isValidLeadIdempotencyKey,
  markLeadThankYou,
  normalizeLeadIdempotencyKey,
  LEAD_THANKS_STORAGE_KEY,
} from "@/lib/leads-idempotency";
import {
  evaluateFixedWindowRateLimit,
  hashLeadRateClientId,
  LEAD_RATE_LIMIT_MAX,
  LEAD_RATE_LIMIT_WINDOW_SECONDS,
} from "@/lib/leads-rate-limit";

const ROOT = process.cwd();

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), "utf8");
}

describe("Phase 7.1 — idempotency keys", () => {
  it("accepts UUID keys and rejects PII-shaped values", () => {
    assert.equal(
      isValidLeadIdempotencyKey("550e8400-e29b-41d4-a716-446655440000"),
      true
    );
    assert.equal(normalizeLeadIdempotencyKey("not-a-uuid"), null);
    assert.equal(normalizeLeadIdempotencyKey("user@example.com"), null);
    assert.equal(normalizeLeadIdempotencyKey("+420777000001"), null);
    assert.equal(normalizeLeadIdempotencyKey("Jan Novák"), null);
  });

  it("reuses the same key for retries of the same source", () => {
    const store = new Map<string, string>();
    const sessionStorageMock = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => {
        store.set(k, v);
      },
      removeItem: (k: string) => {
        store.delete(k);
      },
    };
    // @ts-expect-error test shim
    globalThis.window = { sessionStorage: sessionStorageMock };
    // @ts-expect-error test shim
    globalThis.sessionStorage = sessionStorageMock;

    const a = getOrCreateLeadIdempotencyKey("contact");
    const b = getOrCreateLeadIdempotencyKey("contact");
    assert.equal(a, b);
    assert.ok(isValidLeadIdempotencyKey(a));
    clearLeadIdempotencyKey("contact");
    const c = getOrCreateLeadIdempotencyKey("contact");
    assert.notEqual(a, c);
  });

  it("thank-you token confirms once then becomes neutral (refresh-safe)", () => {
    const store = new Map<string, string>();
    const sessionStorageMock = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => {
        store.set(k, v);
      },
      removeItem: (k: string) => {
        store.delete(k);
      },
    };
    // @ts-expect-error test shim
    globalThis.window = { sessionStorage: sessionStorageMock };
    // @ts-expect-error test shim
    globalThis.sessionStorage = sessionStorageMock;

    assert.equal(consumeLeadThankYouToken().confirmed, false);
    markLeadThankYou("contact");
    assert.ok(store.has(LEAD_THANKS_STORAGE_KEY));
    const first = consumeLeadThankYouToken();
    assert.equal(first.confirmed, true);
    assert.equal(first.source, "contact");
    const second = consumeLeadThankYouToken();
    assert.equal(second.confirmed, false);
  });
});

describe("Phase 7.1 — rate limit window math", () => {
  const windowSeconds = LEAD_RATE_LIMIT_WINDOW_SECONDS;
  const max = LEAD_RATE_LIMIT_MAX;
  const start = 1_000_000;

  it("allows requests under the limit", () => {
    const r = evaluateFixedWindowRateLimit({
      nowMs: start + 1_000,
      windowStartedAtMs: start,
      requestCount: 3,
      max,
      windowSeconds,
    });
    assert.equal(r.allowed, true);
    assert.equal(r.currentCount, 4);
    assert.equal(r.retryAfterSeconds, 0);
  });

  it("blocks with 429 semantics when over limit", () => {
    const r = evaluateFixedWindowRateLimit({
      nowMs: start + 1_000,
      windowStartedAtMs: start,
      requestCount: max,
      max,
      windowSeconds,
    });
    assert.equal(r.allowed, false);
    assert.ok(r.retryAfterSeconds >= 1);
    assert.equal(r.currentCount, max);
  });

  it("resets after the window elapses", () => {
    const r = evaluateFixedWindowRateLimit({
      nowMs: start + windowSeconds * 1000,
      windowStartedAtMs: start,
      requestCount: max,
      max,
      windowSeconds,
    });
    assert.equal(r.allowed, true);
    assert.equal(r.currentCount, 1);
  });

  it("separates two clients via distinct HMAC hashes", () => {
    process.env.CRON_SECRET = "phase71-test-secret-not-real";
    const a = hashLeadRateClientId("1.1.1.1|Mozilla/A");
    const b = hashLeadRateClientId("2.2.2.2|Mozilla/B");
    assert.ok(a && b);
    assert.notEqual(a, b);
    assert.equal(a!.includes("1.1.1.1"), false);
    assert.equal(a!.length, 64);
  });
});

describe("Phase 7.1 — API route contracts (static)", () => {
  it("maps empty/invalid JSON to HTTP 400", () => {
    const src = read("src/app/api/leads/route.ts");
    assert.match(src, /await request\.json\(\)/);
    assert.match(src, /Neplatné tělo požadavku/);
    assert.match(src, /status: 400/);
    assert.match(src, /catch \{[\s\S]*status: 400/);
  });

  it("returns 429 with Retry-After on rate limit", () => {
    const src = read("src/app/api/leads/route.ts");
    assert.match(src, /status: 429/);
    assert.match(src, /Retry-After/);
    assert.match(src, /consumeLeadApiRateLimit/);
  });

  it("enforces idempotency via unique key and replay response", () => {
    const src = read("src/app/api/leads/route.ts");
    assert.match(src, /idempotency_key/);
    assert.match(src, /replayed: true/);
    assert.match(src, /isUniqueViolation|23505/);
  });

  it("SQL migration adds nullable key + partial unique index + rate RPC", () => {
    const sql = read("supabase/leads_idempotency_rate_limit.sql");
    assert.match(sql, /idempotency_key text/);
    assert.match(sql, /leads_idempotency_key_uidx/);
    assert.match(sql, /where idempotency_key is not null/);
    assert.match(sql, /lead_api_rate_limits/);
    assert.match(sql, /consume_lead_api_rate_limit/);
    assert.match(sql, /enable row level security/);
  });

  it("dekujeme consumes one-shot token and keeps noindex", () => {
    const page = read("src/app/dekujeme/page.tsx");
    const view = read("src/components/forms/ThankYouView.tsx");
    assert.match(page, /ThankYouView/);
    assert.match(view, /consumeLeadThankYouToken/);
    assert.match(view, /Děkujeme za návštěvu/);
    assert.match(view, /Poptávku jsme přijali/);
    const seo = read("src/lib/seo/pages.ts");
    assert.match(seo, /dekujeme[\s\S]*noIndex:\s*true|noIndex:\s*true[\s\S]*dekujeme/);
  });
});

describe("Phase 7.1 — parallel same-key insert simulation", () => {
  it("two concurrent inserts with the same key yield one winner", async () => {
    const key = "550e8400-e29b-41d4-a716-446655440000";
    const store = new Map<string, string>();
    let lock: Promise<void> = Promise.resolve();

    async function insertOrReplay(id: string): Promise<"inserted" | "replayed"> {
      const run = lock.then(async () => {
        if (store.has(key)) return "replayed" as const;
        // yield to allow interleaving before unique check commits
        await Promise.resolve();
        if (store.has(key)) return "replayed" as const;
        store.set(key, id);
        return "inserted" as const;
      });
      lock = run.then(
        () => undefined,
        () => undefined
      );
      return run;
    }

    const results = await Promise.all([
      insertOrReplay("lead-a"),
      insertOrReplay("lead-b"),
      insertOrReplay("lead-c"),
    ]);
    assert.equal(store.size, 1);
    assert.equal(results.filter((r) => r === "inserted").length, 1);
    assert.equal(results.filter((r) => r === "replayed").length, 2);
  });
});

afterEach(() => {
  // @ts-expect-error cleanup
  delete globalThis.window;
  // @ts-expect-error cleanup
  delete globalThis.sessionStorage;
});
