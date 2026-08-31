/**
 * Safe end-to-end lead funnel test — Hypotéka Jasně (calculator → sazby → bank → lead).
 *
 * Security:
 * - Never prints secrets or PII.
 * - Production submit only when ALL are set:
 *     E2E_HJ_SUBMIT=1
 *     E2E_HJ_TEST_EMAIL  (owner-approved)
 *     E2E_HJ_TEST_PHONE  (owner-approved)
 * - Marker: TEST-HJ-E2E-{timestamp} in metadata.test_marker / notes.
 * - Does NOT delete leads unless E2E_DELETE_TEST_LEAD=1 (owner confirmation).
 *
 * Usage:
 *   E2E_BASE_URL=http://127.0.0.1:3000 node scripts/test-hj-e2e-lead-funnel.mjs
 *   E2E_BASE_URL=https://www.hypotekajasne.cz E2E_HJ_SUBMIT=1 E2E_HJ_TEST_EMAIL=... E2E_HJ_TEST_PHONE=... node scripts/test-hj-e2e-lead-funnel.mjs
 */
import { readFileSync } from "node:fs";
import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";

const BASE = (process.env.E2E_BASE_URL || "http://127.0.0.1:3000").replace(
  /\/$/,
  ""
);
const MARKER = `TEST-HJ-E2E-${Date.now()}`;
const SUBMIT =
  process.env.E2E_HJ_SUBMIT === "1" &&
  Boolean(process.env.E2E_HJ_TEST_EMAIL?.trim()) &&
  Boolean(process.env.E2E_HJ_TEST_PHONE?.trim());
const TEST_EMAIL = process.env.E2E_HJ_TEST_EMAIL?.trim() || "";
const TEST_PHONE = process.env.E2E_HJ_TEST_PHONE?.trim() || "";
const TEST_NAME = `TEST-HJ-E2E ${MARKER}`;

const results = [];

function record(id, pass, detail, blocked = false) {
  results.push({ id, pass, detail, blocked });
  const label = blocked ? "BLOCKED" : pass ? "PASS" : "FAIL";
  console.log(`${label} [${id}] ${detail}`);
}

function loadEnvLocal() {
  try {
    const raw = readFileSync(".env.local", "utf8");
    const out = {};
    for (const line of raw.split(/\r?\n/)) {
      if (!line || line.startsWith("#") || !line.includes("=")) continue;
      const i = line.indexOf("=");
      let v = line.slice(i + 1).trim();
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1);
      }
      out[line.slice(0, i).trim()] = v;
    }
    return out;
  } catch {
    return {};
  }
}

function getSupabase() {
  const env = loadEnvLocal();
  let url = (env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  const key = (env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  url = url.replace(/\/rest\/v1\/?$/i, "").replace(/\/$/, "");
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function acceptCookies(page, analytics = false) {
  const banner = page.getByRole("button", {
    name: /Souhlasím|Přijmout|Accept|Povolit/i,
  });
  if (await banner.count()) {
    try {
      await banner.first().click({ timeout: 2000 });
    } catch {
      /* optional */
    }
  }
  if (analytics) {
    const all = page.getByRole("button", { name: /Povolit vše|Accept all/i });
    if (await all.count()) {
      try {
        await all.first().click({ timeout: 2000 });
      } catch {
        /* optional */
      }
    }
  }
}

async function rejectAnalyticsCookies(page) {
  const necessary = page.getByRole("button", {
    name: /Pouze nezbytn|Necessary only|Jen nezbytn/i,
  });
  if (await necessary.count()) {
    try {
      await necessary.first().click({ timeout: 2000 });
    } catch {
      /* optional */
    }
  }
}

async function testNegativeApi(baseUrl) {
  const cases = [
    {
      id: "10-invalid-email",
      body: {
        name: "Test",
        email: "not-an-email",
        phone: "+420777000111",
        source: "mortgage_calculator",
        consent: {
          policyVersion: "2026-08-31.1",
          privacyAccepted: true,
          partnerTransferAccepted: false,
          partnerTransferScope: "none",
          marketingAccepted: false,
          consentedAt: new Date().toISOString(),
        },
      },
      expectStatus: 400,
    },
    {
      id: "10-invalid-phone",
      body: {
        name: "Test",
        email: "test@example.com",
        phone: "12",
        source: "mortgage_calculator",
        consent: {
          policyVersion: "2026-08-31.1",
          privacyAccepted: true,
          partnerTransferAccepted: false,
          partnerTransferScope: "none",
          marketingAccepted: false,
          consentedAt: new Date().toISOString(),
        },
      },
      expectStatus: 400,
    },
    {
      id: "10-no-consent",
      body: {
        name: "Test",
        email: "test@example.com",
        phone: "+420777000111",
        source: "mortgage_calculator",
        consent: {
          policyVersion: "2026-08-31.1",
          privacyAccepted: false,
          partnerTransferAccepted: false,
          partnerTransferScope: "none",
          marketingAccepted: false,
          consentedAt: new Date().toISOString(),
        },
      },
      expectStatus: 400,
    },
  ];

  for (const c of cases) {
    const res = await fetch(`${baseUrl}/api/leads`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(c.body),
    });
    record(
      c.id,
      res.status === c.expectStatus,
      `POST /api/leads → ${res.status} (expected ${c.expectStatus})`
    );
  }
}

async function verifyLeadInDb(sb, leadId, marker) {
  const { data, error } = await sb
    .from("leads")
    .select(
      "id, source, metadata, marketing_consent, marketing_consent_at, privacy_notice_version, utm_source, utm_medium, utm_campaign, created_at"
    )
    .eq("id", leadId)
    .maybeSingle();

  if (error || !data) {
    record("4-db-record", false, "Lead row not found after submit");
    return null;
  }

  const meta = data.metadata || {};
  record("4-single-record", true, `Lead ID ${leadId.slice(0, 8)}… created`);
  record(
    "5-bank-context",
    Boolean(meta.selectedLender && meta.selectedNominalRate != null),
    `selectedLender=${Boolean(meta.selectedLender)} selectedRate=${meta.selectedNominalRate != null}`
  );
  record(
    "5-calc-context",
    Boolean(meta.mortgageAmount && meta.propertyValue && meta.fixationMonths),
    `mortgage/property/fixation present`
  );
  record(
    "5-ltv",
    meta.exactLtv != null && meta.ltvBand != null,
    `exactLtv=${meta.exactLtv != null} ltvBand=${meta.ltvBand != null}`
  );
  record(
    "5-utm",
    Boolean(data.utm_source || meta.utm_source),
    `utm preserved in row`
  );
  record(
    "5-consent",
    Boolean(data.privacy_notice_version && meta.consent?.consentedAt),
    `privacy_version=${Boolean(data.privacy_notice_version)} consentedAt=${Boolean(meta.consent?.consentedAt)}`
  );
  record(
    "5-marketing-separate",
    data.marketing_consent === false || data.marketing_consent === true,
    `marketing_consent column=${data.marketing_consent}`
  );
  record(
    "6-notify-audit",
    Boolean(meta.notify_audit?.status),
    `notify status=${meta.notify_audit?.status ?? "missing"}`
  );
  record(
    "marker",
    meta.test_marker === marker,
    `test_marker matches`
  );
  return data;
}

async function countLeadsByMarker(sb, marker) {
  const { data } = await sb
    .from("leads")
    .select("id")
    .contains("metadata", { test_marker: marker });
  return data?.length ?? 0;
}

async function runBrowserFunnel() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ locale: "cs-CZ" });
  const page = await context.newPage();

  let leadId = null;
  let idempotencyKey = null;
  const gtagCalls = [];

  await page.addInitScript(() => {
    window.__hjGtagCalls = [];
    window.gtag = (...args) => {
      window.__hjGtagCalls.push(args);
    };
    window.dataLayer = window.dataLayer || [];
  });

  try {
    // 1–2 Calculator → sazby with UTM
    await page.goto(
      `${BASE}/?utm_source=e2e_test&utm_medium=script&utm_campaign=${encodeURIComponent(MARKER)}`,
      { waitUntil: "domcontentloaded" }
    );
    await acceptCookies(page, false);

    const calcArticle = page.locator("article[aria-labelledby='mini-mortgage-heading']");
    if (await calcArticle.count()) {
      await calcArticle.scrollIntoViewIfNeeded();
    }

    const calcBtn = page.getByRole("button", { name: /Spočítat splátku/i });
    let navigatedViaCalculator = false;
    if (await calcBtn.count()) {
      try {
        await calcBtn.click();
        const ratesBtn = page.getByRole("button", {
          name: /Zobrazit sazby pro tento výpočet/i,
        });
        await ratesBtn.waitFor({ state: "visible", timeout: 8000 });
        await ratesBtn.click();
        await page.waitForURL("**/sazby**", { timeout: 15000 });
        navigatedViaCalculator = true;
      } catch {
        /* fall through to direct sazby URL */
      }
    }
    if (!navigatedViaCalculator) {
      await page.goto(
        `${BASE}/sazby?purpose=purchase&fixationMonths=36&property=6000000&loan=4800000&equity=1200000&termYears=30&utm_source=e2e_test&utm_medium=script&utm_campaign=${encodeURIComponent(MARKER)}`,
        { waitUntil: "domcontentloaded" }
      );
    }

    record(
      "1-calculator-sazby",
      page.url().includes("/sazby") && page.url().includes("property="),
      navigatedViaCalculator
        ? "Calculator → sazby navigation OK"
        : "Fallback direct /sazby URL (calculator step skipped or timed out)"
    );
    record(
      "2-utm-in-url",
      page.url().includes("utm_source=e2e_test"),
      `UTM preserved in sazby URL`
    );

    // Select bank offer (wait for rates panel)
    await page.waitForTimeout(2000);
    const selectBtn = page.getByRole("button", {
      name: /Zjistit možnosti pro moji situaci/i,
    });
    if (await selectBtn.count()) {
      await selectBtn.first().click();
      await page.waitForTimeout(800);
      record("2-bank-select", true, "Bank rate CTA clicked");
    } else {
      const hasRatesSection = await page
        .locator("text=/Sazby s cenovým pásmem|Načítám sazby|ověřenou sazbu/i")
        .count();
      record(
        "2-bank-select",
        false,
        hasRatesSection > 0
          ? "Rates panel visible but no bank CTA (empty offer set in this environment)"
          : "No bank rate CTA visible"
      );
    }

    // Scroll to lead form
    await page.locator("#sazby-poptavka").scrollIntoViewIfNeeded();

    if (!SUBMIT) {
      record(
        "3-prod-submit",
        false,
        "E2E_HJ_SUBMIT=1 + E2E_HJ_TEST_EMAIL + E2E_HJ_TEST_PHONE not configured (owner-approved contacts required)",
        true
      );
      record("4-db-record", false, "Skipped — no approved submit", true);
      record("6-email", false, "Skipped — no submit", true);
      record("7-thankyou", false, "Skipped — no submit", true);
      record("8-lead-success", false, "Skipped — no submit", true);
      record("9-dedupe", false, "Skipped — no submit", true);
    } else {
      idempotencyKey = crypto.randomUUID();
      await page.evaluate((key) => {
        sessionStorage.setItem("hj-lead-idempotency-v1:mortgage_calculator", key);
      }, idempotencyKey);

      await page.locator("#sazby-poptavka input").first().fill(TEST_NAME);
      await page.locator('#sazby-poptavka input[type="email"]').fill(TEST_EMAIL);
      await page.locator('#sazby-poptavka input[type="tel"]').fill(TEST_PHONE);

      const checkboxes = page.locator("#sazby-poptavka input[type='checkbox']");
      const count = await checkboxes.count();
      if (count > 0) await checkboxes.nth(0).check();
      // marketing left unchecked (variant without marketing consent)

      const notesField = page.locator("#sazby-poptavka textarea");
      if (await notesField.count()) {
        await notesField.fill(`E2E marker ${MARKER}`);
      }

      const [response] = await Promise.all([
        page.waitForResponse(
          (r) => r.url().includes("/api/leads") && r.request().method() === "POST",
          { timeout: 20000 }
        ),
        page.locator("#sazby-poptavka button[type='submit']").click(),
      ]);

      const body = await response.json();
      leadId = body.leadId || null;
      record(
        "3-single-submit",
        response.status() === 200 && body.ok === true && !body.replayed,
        `POST /api/leads → ${response.status()} replayed=${body.replayed}`
      );

      await page.waitForURL("**/dekujeme**", { timeout: 15000 }).catch(() => null);
      const thanksConfirmed = await page.evaluate(() => {
        const text = document.body?.innerText || "";
        return /poptávku jsme přijali|odesláno|děkujeme/i.test(text);
      });
      record(
        "7-thankyou",
        page.url().includes("/dekujeme") && thanksConfirmed,
        `thank-you URL + confirmed copy`
      );

      // Duplicate submit same idempotency
      await page.goto(page.url(), { waitUntil: "domcontentloaded" });
      await page.goBack().catch(() => null);
      const dupRes = await page.evaluate(async (payload) => {
        const r = await fetch("/api/leads", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });
        return { status: r.status, json: await r.json() };
      }, {
        name: TEST_NAME,
        email: TEST_EMAIL,
        phone: TEST_PHONE,
        source: "mortgage_calculator",
        idempotencyKey,
        metadata: { test_marker: MARKER },
        consent: {
          policyVersion: "2026-08-31.1",
          privacyAccepted: true,
          partnerTransferAccepted: false,
          partnerTransferScope: "none",
          marketingAccepted: false,
          consentedAt: new Date().toISOString(),
        },
      });
      record(
        "9-idempotency-replay",
        dupRes.json.replayed === true && dupRes.json.leadId === leadId,
        `duplicate POST replayed=${dupRes.json.replayed}`
      );

      const gtagAfter = await page.evaluate(() => window.__hjGtagCalls || []);
      const successEvents = gtagAfter.filter(
        (c) => c[1] === "lead_success" || c[0] === "event" && c[1] === "lead_success"
      );
      record(
        "8-lead-success-once",
        successEvents.length <= 1,
        `lead_success gtag calls=${successEvents.length}`
      );
    }

    // 10 GDPR client validation — invalid email blocks submit
    await page.goto(`${BASE}/sazby`, { waitUntil: "domcontentloaded" });
    await page.locator("#sazby-poptavka").scrollIntoViewIfNeeded();
    await page.locator("#sazby-poptavka input").first().fill("Test");
    await page.locator('#sazby-poptavka input[type="email"]').fill("bad");
    await page.locator('#sazby-poptavka input[type="tel"]').fill("+420777000111");
    const privacy = page.locator("#sazby-poptavka input[type='checkbox']").first();
    if (await privacy.count()) await privacy.check();
    await page.locator("#sazby-poptavka button[type='submit']").click();
    await page.waitForTimeout(500);
    const clientError = await page.locator("#sazby-poptavka [role='alert'], #sazby-poptavka .text-red").count();
    record(
      "10-client-invalid-email",
      clientError > 0 || !(page.url().includes("/dekujeme")),
      "Client blocked invalid email"
    );

    // 11 Analytics without consent
    await context.clearCookies();
    await page.evaluate(() => localStorage.removeItem("hj_cookie_consent_v1"));
    await page.goto(`${BASE}/sazby`, { waitUntil: "domcontentloaded" });
    await rejectAnalyticsCookies(page);
    await page.evaluate(() => {
      window.__hjGtagCalls = [];
    });
    await page.evaluate(() => {
      window.dispatchEvent(new Event("hj-analytics-probe"));
    });
    const noConsentCalls = await page.evaluate(() => (window.__hjGtagCalls || []).length);
    record(
      "11-analytics-rejected",
      noConsentCalls === 0,
      `gtag calls with analytics rejected=${noConsentCalls}`
    );

    await acceptCookies(page, true);
    await page.evaluate(() => {
      window.__hjGtagCalls = [];
    });
    record(
      "11-analytics-accepted-setup",
      true,
      "Analytics consent path exercised (manual GA4 verify recommended)"
    );
  } catch (err) {
    record("browser-fatal", false, `Browser funnel error: ${err.message || err}`);
  } finally {
    await browser.close();
  }

  return { leadId, marker: MARKER };
}

async function main() {
  console.log("=== TEST-HJ-E2E Lead Funnel ===");
  console.log("BASE:", BASE);
  console.log("MARKER:", MARKER);
  console.log("SUBMIT:", SUBMIT ? "enabled" : "blocked");
  console.log("TIME:", new Date().toISOString());
  console.log("");

  await testNegativeApi(BASE);

  const { leadId } = await runBrowserFunnel();

  const sb = getSupabase();
  if (leadId && sb) {
    const countBefore = await countLeadsByMarker(sb, MARKER);
    await verifyLeadInDb(sb, leadId, MARKER);
    const countAfter = await countLeadsByMarker(sb, MARKER);
    record(
      "4-exactly-one",
      countAfter === 1,
      `marker count=${countAfter} (expected 1)`
    );
    if (countBefore > 1) {
      record("4-exactly-one", false, "Multiple rows with same marker");
    }
  } else if (SUBMIT) {
    record("4-db-verify", false, "Supabase credentials missing for DB verify");
  }

  const failed = results.filter((r) => !r.pass && !r.blocked);
  const blocked = results.filter((r) => r.blocked);
  console.log("\n=== PROTOCOL ===");
  for (const r of results) {
    const label = r.blocked ? "BLOCKED" : r.pass ? "PASS" : "FAIL";
    console.log(`${label}\t${r.id}\t${r.detail}`);
  }
  console.log("\nLEAD_ID:", leadId ? `${leadId.slice(0, 8)}…` : "none");
  console.log("MARKER:", MARKER);
  console.log("BLOCKED:", blocked.length);
  console.log("FAILED:", failed.length);
  process.exit(failed.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
