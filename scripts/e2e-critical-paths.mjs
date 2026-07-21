/**
 * Critical-path HTTP smoke (PROMPT 17O).
 * No Playwright dependency — fetch against a running Next server.
 *
 * Usage:
 *   1) npm run build && npm run start   (other terminal)
 *   2) npm run test:e2e-critical
 * Or: E2E_BASE_URL=https://staging.example npm run test:e2e-critical
 */

const BASE = (process.env.E2E_BASE_URL || "http://127.0.0.1:3000").replace(
  /\/$/,
  ""
);

/** Persona-critical + legal surfaces that must 200 without redirect loops. */
const CRITICAL_GET = [
  // Persona 1
  "/",
  "/moje-moznosti",
  "/kalkulacky",
  "/navrh-na-miru",
  // Persona 2
  "/pruvodce-investora",
  "/pruvodce-investora/dubaj",
  "/investicni-pas",
  "/globalni-financovani",
  "/investicni-rentgen/modelar",
  // Persona 3
  "/investicni-rentgen",
  "/pravni/placena-analyza",
  // Persona 4
  "/akademie",
  "/financni-pas",
  // Trust / compliance
  "/partneri",
  "/pravni/gdpr",
  "/pravni/cookies",
  "/pravni/zasady",
  "/metodika",
  "/zdroje",
  "/kontakt",
  // Technical
  "/robots.txt",
  "/sitemap.xml",
];

/** Soft-expect: pages may exist but must not 5xx. */
const OPTIONAL_GET = [
  "/transakce",
  "/profesionalni-portal",
  "/dashboard",
];

async function fetchStatus(path) {
  const url = `${BASE}${path}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25_000);
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: { Accept: "text/html,application/xml,*/*" },
    });
    return { path, url, status: res.status, ok: res.ok };
  } catch (err) {
    return {
      path,
      url,
      status: 0,
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  console.log(`E2E critical-path smoke → ${BASE}`);

  // Connectivity probe
  const probe = await fetchStatus("/");
  if (!probe.ok) {
    console.error(
      "FAIL: server not reachable. Start with `npm run build && npm run start` or set E2E_BASE_URL."
    );
    console.error(probe);
    process.exit(2);
  }

  const failures = [];
  for (const path of CRITICAL_GET) {
    const r = await fetchStatus(path);
    const line = `${r.status}\t${path}`;
    if (!r.ok || r.status >= 400) {
      console.error(`FAIL ${line}${r.error ? ` (${r.error})` : ""}`);
      failures.push(r);
    } else {
      console.log(`OK   ${line}`);
    }
  }

  for (const path of OPTIONAL_GET) {
    const r = await fetchStatus(path);
    if (r.status >= 500 || r.status === 0) {
      console.error(`FAIL ${r.status}\t${path} (optional must not 5xx)`);
      failures.push(r);
    } else {
      console.log(`OK   ${r.status}\t${path} (optional)`);
    }
  }

  // Lead API must fail closed without inventing success when body invalid
  try {
    const leadRes = await fetch(`${BASE}/api/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "", email: "bad", source: "contact" }),
    });
    if (leadRes.status >= 500) {
      // Missing Supabase → 500 is fail-closed (acceptable for launch if documented)
      console.log(
        `NOTE ${leadRes.status}\tPOST /api/leads (invalid body / infra) — fail-closed`
      );
    } else if (leadRes.status >= 400) {
      console.log(`OK   ${leadRes.status}\tPOST /api/leads rejects invalid payload`);
    } else {
      console.error(
        `FAIL ${leadRes.status}\tPOST /api/leads accepted invalid payload`
      );
      failures.push({ path: "POST /api/leads", status: leadRes.status, ok: false });
    }
  } catch (err) {
    console.error("FAIL POST /api/leads", err);
    failures.push({ path: "POST /api/leads", status: 0, ok: false });
  }

  if (failures.length) {
    console.error(`\n${failures.length} critical-path failure(s).`);
    process.exit(1);
  }
  console.log("\nCritical-path smoke PASSED.");
}

main();
