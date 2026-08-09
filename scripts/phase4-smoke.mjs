/**
 * Phase 4 local smoke + controlled test lead (create → verify → delete).
 * Loads .env.local; never prints secrets or GA id.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      if (!line || line.trim().startsWith("#")) continue;
      const i = line.indexOf("=");
      if (i < 0) continue;
      const k = line.slice(0, i).trim();
      let v = line.slice(i + 1).trim();
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1);
      }
      if (k && process.env[k] == null) process.env[k] = v;
    }
  } catch {
    /* optional */
  }
}

loadEnvLocal();

const BASE = process.env.PHASE4_SMOKE_BASE || "http://127.0.0.1:3011";
const TEST_EMAIL = "phase4-analytics-test@example.com";
const TEST_NAME = "PHASE4 ANALYTICS TEST";

async function check(path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Accept: "text/html,application/json" },
  });
  const text = await res.text();
  return { status: res.status, text };
}

function report(label, ok, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"} ${label}${detail ? ` — ${detail}` : ""}`);
}

async function main() {
  console.log(`BASE=${BASE}`);
  console.log(
    `GA_configured=${Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim())}`
  );

  const home = await check("/");
  report("homepage HTTP", home.status === 200, String(home.status));
  report(
    "homepage phase3 markers",
    /Co právě řešíte|Hypoteční kalkulačka|mini-mortgage/i.test(home.text)
  );
  report(
    "homepage no gtag without consent",
    !/googletagmanager\.com\/gtag/i.test(home.text)
  );

  const sazby = await check("/sazby");
  report("sazby HTTP", sazby.status === 200, String(sazby.status));
  report(
    "sazby lead form",
    /Odeslat poptávku|Nezávazná poptávka|Jméno a příjmení/i.test(sazby.text)
  );

  const api = await check(
    "/api/mortgage-market/offers?country=CZ&purpose=purchase&fixationMonths=36&ltv=75&includeLtvUnspecified=1"
  );
  report("offers API HTTP", api.status === 200, String(api.status));
  let offersOk = false;
  try {
    const json = JSON.parse(api.text);
    offersOk = Array.isArray(json.offers);
    report(
      "offers API payload",
      offersOk,
      `matched=${json.offers?.length ?? "?"} unspecified=${json.unspecifiedLtvOffers?.length ?? "?"}`
    );
  } catch {
    report("offers API payload", false, "invalid JSON");
  }

  const consent = {
    policyVersion: "2026-08-07.8",
    privacyAccepted: true,
    partnerTransferAccepted: false,
    partnerTransferScope: "none",
    marketingAccepted: false,
    consentedAt: new Date().toISOString(),
    sourcePath: "/sazby",
  };

  const leadRes = await fetch(`${BASE}/api/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      name: TEST_NAME,
      email: TEST_EMAIL,
      phone: "+420777000111",
      source: "mortgage_calculator",
      country: "CZ",
      notes: "PHASE4_ANALYTICS_TEST_ONLY",
      metadata: {
        sourcePage: "/sazby",
        purpose: "purchase",
        fixationMonths: 36,
        ltv: 75,
        selectedLender: "airbank",
        selectedPricingScenario: "without_repayment_insurance",
        selectedRateScenarioCategory: "without_insurance",
        calculatorType: "mortgage",
        phase4Test: true,
      },
      consent,
    }),
  });
  const leadBody = await leadRes.text();
  report("lead POST", leadRes.ok, `HTTP ${leadRes.status} ${leadBody.slice(0, 120)}`);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    report("lead verify/delete", false, "missing Supabase admin env");
    process.exitCode = 1;
    return;
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: rows, error: selErr } = await supabase
    .from("leads")
    .select("id,name,email,metadata,source")
    .eq("email", TEST_EMAIL)
    .eq("name", TEST_NAME)
    .order("created_at", { ascending: false })
    .limit(5);

  if (selErr) {
    report("lead row exists", false, selErr.message);
    process.exitCode = 1;
    return;
  }

  const row = rows?.[0];
  report("lead row exists", Boolean(row), row ? `id=${row.id}` : "none");
  if (row?.metadata) {
    const m = row.metadata;
    report(
      "lead metadata funnel context",
      m.purpose === "purchase" &&
        m.selectedLender === "airbank" &&
        m.sourcePage === "/sazby",
      `purpose=${m.purpose} lender=${m.selectedLender}`
    );
    report(
      "lead consent metadata",
      m.privacy_notice_acknowledged === true &&
        m.marketing_consent === false &&
        Boolean(m.consent_policy_version || m.privacy_notice_version)
    );
  }

  if (row?.id) {
    const { error: delErr, count } = await supabase
      .from("leads")
      .delete({ count: "exact" })
      .eq("id", row.id)
      .eq("email", TEST_EMAIL)
      .eq("name", TEST_NAME);
    report("test lead removed", !delErr, delErr?.message ?? `count=${count ?? "?"}`);

    const { data: leftover } = await supabase
      .from("leads")
      .select("id")
      .eq("email", TEST_EMAIL)
      .eq("name", TEST_NAME);
    report("no leftover test leads", !leftover?.length, `left=${leftover?.length ?? 0}`);
  }

  if (!home.status || home.status !== 200 || !offersOk || !leadRes.ok) {
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
