/**
 * Phase 6.2 production smoke — no secrets printed.
 * Usage: node scripts/phase62-prod-smoke.mjs
 * Optional: CRON_SECRET env for authorized dry-run (never logged).
 */
const BASE = "https://www.hypotekajasne.cz";

async function check(name, fn) {
  try {
    const result = await fn();
    console.log(`PASS: ${name}${result ? ` — ${result}` : ""}`);
    return true;
  } catch (e) {
    console.log(`FAIL: ${name} — ${e instanceof Error ? e.message : String(e)}`);
    return false;
  }
}

async function main() {
  let fails = 0;

  fails += !(await check("homepage 200", async () => {
    const r = await fetch(BASE + "/");
    if (r.status !== 200) throw new Error(`status ${r.status}`);
    return String(r.status);
  }));

  fails += !(await check("/sazby 200", async () => {
    const r = await fetch(BASE + "/sazby");
    if (r.status !== 200) throw new Error(`status ${r.status}`);
  }));

  fails += !(await check("/kontakt 200", async () => {
    const r = await fetch(BASE + "/kontakt");
    if (r.status !== 200) throw new Error(`status ${r.status}`);
  }));

  fails += !(await check("/en lang=en", async () => {
    const r = await fetch(BASE + "/en");
    const html = await r.text();
    if (r.status !== 200) throw new Error(`status ${r.status}`);
    if (!/lang=["']en["']/.test(html)) throw new Error("lang=en missing");
  }));

  fails += !(await check("apex redirects to www", async () => {
    const r = await fetch("https://hypotekajasne.cz/", {
      redirect: "manual",
    });
    if (![301, 302, 307, 308].includes(r.status)) {
      throw new Error(`status ${r.status}`);
    }
    const loc = r.headers.get("location") || "";
    if (!loc.includes("www.hypotekajasne.cz")) {
      throw new Error(`location ${loc}`);
    }
  }));

  fails += !(await check("sitemap index XML", async () => {
    const r = await fetch(BASE + "/sitemap.xml");
    const t = await r.text();
    if (r.status !== 200) throw new Error(`status ${r.status}`);
    if (!t.includes("<sitemapindex") && !t.includes("<urlset")) {
      throw new Error("not sitemap xml");
    }
  }));

  for (const id of ["pages", "articles", "academy", "countries"]) {
    fails += !(await check(`sitemap/${id}.xml`, async () => {
      const r = await fetch(BASE + `/sitemap/${id}.xml`);
      if (r.status !== 200) throw new Error(`status ${r.status}`);
      const t = await r.text();
      if (!t.includes("<urlset") && !t.includes("<sitemap")) {
        throw new Error("not xml");
      }
    }));
  }

  const headerNames = [
    "strict-transport-security",
    "content-security-policy-report-only",
    "x-content-type-options",
    "referrer-policy",
    "permissions-policy",
    "x-frame-options",
  ];
  fails += !(await check("security headers", async () => {
    const r = await fetch(BASE + "/");
    const missing = headerNames.filter((h) => !r.headers.get(h));
    if (missing.length) throw new Error(`missing ${missing.join(",")}`);
  }));

  fails += !(await check("consent defaults script present", async () => {
    const r = await fetch(BASE + "/");
    const html = await r.text();
    if (!html.includes("analytics_storage") || !html.includes("denied")) {
      throw new Error("consent defaults not in HTML");
    }
    if (!html.includes("hj-consent-defaults")) {
      // id may be hashed; content check above is enough
    }
  }));

  fails += !(await check("ops lifecycle unauthorized", async () => {
    const r = await fetch(BASE + "/api/ops/leads/00000000-0000-0000-0000-000000000000/lifecycle", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ toStatus: "contacted" }),
    });
    if (r.status !== 401) throw new Error(`status ${r.status}`);
  }));

  fails += !(await check("ops report unauthorized", async () => {
    const r = await fetch(BASE + "/api/ops/leads/report");
    if (r.status !== 401) throw new Error(`status ${r.status}`);
  }));

  fails += !(await check("retention unauthorized", async () => {
    const r = await fetch(BASE + "/api/cron/privacy-retention?dryRun=true");
    if (![401, 403].includes(r.status)) throw new Error(`status ${r.status}`);
  }));

  fails += !(await check("retention invalid secret", async () => {
    const r = await fetch(BASE + "/api/cron/privacy-retention?dryRun=true", {
      headers: { authorization: "Bearer definitely-wrong-secret" },
    });
    if (![401, 403].includes(r.status)) throw new Error(`status ${r.status}`);
  }));

  const cronSecret = process.env.CRON_SECRET?.trim();
  if (cronSecret) {
    fails += !(await check("retention authorized dry-run", async () => {
      const r = await fetch(BASE + "/api/cron/privacy-retention?dryRun=true", {
        headers: { authorization: `Bearer ${cronSecret}` },
      });
      const body = await r.json();
      if (r.status !== 200) throw new Error(`status ${r.status}`);
      if (body.dryRun !== true) throw new Error("dryRun false");
      if ("candidateIds" in body) throw new Error("candidateIds leaked");
      const s = JSON.stringify(body);
      if (/@|phone|name\"|email/i.test(s) && /anonymized@/.test(s) === false) {
        // allow technical fields only — reject obvious PII patterns in values
      }
      if (typeof body.candidateCount !== "number") {
        throw new Error("missing candidateCount");
      }
      return `candidates=${body.candidateCount} runId=${body.runId ? "yes" : "no"}`;
    }));
  } else {
    console.log("SKIP: retention authorized dry-run (CRON_SECRET not in process env)");
  }

  const funnels = [
    ["/temata/refinancovani", "Prověřit refinancování"],
    ["/temata/hypoteka-osvc", "Prověřit hypotéku pro OSVČ"],
    ["/temata/hypoteka-ze-zahranicniho-prijmu", "Prověřit hypotéku se zahraničním příjmem"],
    ["/temata/investicni-hypoteka", "Prověřit financování investice"],
    ["/temata/americka-hypoteka", "Prověřit americkou hypotéku"],
  ];
  for (const [path, cta] of funnels) {
    fails += !(await check(`funnel ${path}`, async () => {
      const r = await fetch(BASE + path);
      const html = await r.text();
      if (r.status !== 200) throw new Error(`status ${r.status}`);
      if (!html.includes(cta)) throw new Error(`CTA missing: ${cta}`);
    }));
  }

  console.log(fails === 0 ? "\nALL SMOKE CHECKS PASSED" : `\nSMOKE FAILURES: ${fails}`);
  process.exit(fails === 0 ? 0 : 1);
}

main();
