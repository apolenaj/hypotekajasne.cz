/**
 * Visual smoke for partner-offer banks (local or E2E_BASE_URL).
 * Does not submit real leads.
 */
import { chromium, devices } from "playwright";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const BASE = (process.env.E2E_BASE_URL || "http://127.0.0.1:3000").replace(
  /\/$/,
  ""
);
const OUT = join(process.cwd(), "tmp", "visual-partner-offer");
mkdirSync(OUT, { recursive: true });

const REQUIRED = [
  "Komerční banka",
  "ČSOB",
  "Česká spořitelna",
  "mBank",
  "UniCredit",
  "Raiffeisen",
  "Oberbank",
];

async function checkOffersApi(page) {
  const res = await page.request.get(
    `${BASE}/api/mortgage-market/offers?country=CZ&purpose=purchase&fixationMonths=36&ltv=75&includeLtvUnspecified=1`
  );
  const json = await res.json();
  const slugs = new Set([
    ...(json.offers || []).map((o) => o.lenderSlug),
    ...(json.unspecifiedLtvOffers || []).map((o) => o.lenderSlug),
    ...(json.lenderAvailability || []).map((a) => a.lenderSlug),
  ]);
  const hasAir = slugs.has("air-bank");
  const hasMoneta = slugs.has("moneta");
  const hasCsRate = [...(json.offers || []), ...(json.unspecifiedLtvOffers || [])].some(
    (o) => o.lenderSlug === "ceska-sporitelna"
  );
  return {
    status: res.status(),
    slugCount: slugs.size,
    hasAir,
    hasMoneta,
    hasCsRate,
    slugs: [...slugs],
  };
}

async function checkPage(page, label, url, opts = {}) {
  const res = await page.goto(url, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  const status = res?.status() ?? 0;
  await page.waitForTimeout(1500);
  const body = (await page.locator("body").innerText()).replace(/\s+/g, " ");
  const requireAll = opts.requireAllBanks !== false;
  const missing = requireAll
    ? REQUIRED.filter((name) => !body.includes(name))
    : [];
  const internalLeaks = [" HOLD ", "manifest", "scraper"].filter((w) =>
    body.toLowerCase().includes(w.trim().toLowerCase())
  );
  // Air Bank must not appear as a current offer bank name in the rates UI.
  const airInOffer =
    body.includes("Air Bank") &&
    !body.includes("historický") &&
    !body.includes("Historický");
  const hasCsFloor =
    body.includes("Veřejná sazba od 5,39") || body.includes("od 5,39 %");
  // Stale ČS 5.09 must not appear as ČS current offer (KB/UC may still show 5.09).
  const hasStaleCsAsCurrent =
    /Česká spořitelna[\s\S]{0,240}5[,.]09\s*%/.test(body) ||
    /5[,.]09\s*%[\s\S]{0,240}Česká spořitelna/.test(body);
  const shot = join(OUT, `${label}.png`);
  await page.screenshot({ path: shot, fullPage: true });
  return {
    label,
    url,
    status,
    missing,
    internalLeaks,
    airInOffer,
    hasCsFloor,
    hasStaleCsAsCurrent,
    shot,
    ok:
      status >= 200 &&
      status < 400 &&
      missing.length === 0 &&
      internalLeaks.length === 0 &&
      !airInOffer &&
      !hasStaleCsAsCurrent,
  };
}

async function runViewport(name, contextOptions) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();
  const results = [];

  const home = await checkPage(page, `${name}-home`, `${BASE}/`, {
    requireAllBanks: false,
  });
  results.push(home);
  const homeText = await page.locator("body").innerText();
  const homeLink =
    homeText.includes("Zobrazit všechny banky") ||
    (await page.locator('a[href*="/sazby"]').count()) > 0;

  results.push(
    await checkPage(
      page,
      `${name}-sazby`,
      `${BASE}/sazby?purpose=purchase&fixationMonths=36&property=6000000&loan=4800000&equity=1200000&termYears=30`
    )
  );

  results.push(
    await checkPage(
      page,
      `${name}-sazby-lender`,
      `${BASE}/sazby?purpose=purchase&fixationMonths=36&property=6000000&loan=4800000&equity=1200000&termYears=30&lender=oberbank#sazby-poptavka`
    )
  );
  const selected = await page.locator("body").innerText();
  const preselectOk =
    selected.includes("Oberbank") &&
    (selected.includes("Vybráno") || selected.includes("poptávk"));

  const api = await checkOffersApi(page);

  await browser.close();
  return { name, homeLink, preselectOk, api, results };
}

async function main() {
  const desktop = await runViewport("desktop", {
    viewport: { width: 1280, height: 900 },
  });
  const mobile = await runViewport("mobile", devices["iPhone 13"]);
  const report = { base: BASE, desktop, mobile, at: new Date().toISOString() };
  writeFileSync(join(OUT, "report.json"), JSON.stringify(report, null, 2));
  const all = [...desktop.results, ...mobile.results];
  const failed = all.filter((r) => !r.ok);
  console.log(JSON.stringify(report, null, 2));
  let code = 0;
  if (!desktop.homeLink || !mobile.homeLink) {
    console.error("FAIL: homepage missing link to full offer");
    code = 1;
  }
  if (!desktop.preselectOk || !mobile.preselectOk) {
    console.error("FAIL: ?lender=oberbank did not preselect");
    code = 1;
  }
  if (
    desktop.api.hasAir ||
    desktop.api.hasMoneta ||
    desktop.api.hasCsRate ||
    mobile.api.hasAir ||
    mobile.api.hasMoneta ||
    mobile.api.hasCsRate
  ) {
    console.error("FAIL: offers API still exposes Air/MONETA/CS numeric rates");
    code = 1;
  }
  if (failed.length) {
    console.error("FAIL pages:", failed.map((f) => f.label).join(", "));
    code = 1;
  }
  if (code === 0) console.log("VISUAL_OK");
  process.exit(code);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
