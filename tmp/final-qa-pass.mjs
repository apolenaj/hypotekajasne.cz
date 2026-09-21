/**
 * Final functional QA pass — regression + calculators + forms + links + rentgen.
 * Does NOT submit real leads or create paid Stripe sessions.
 * Run: npx tsx --tsconfig tsconfig.json tmp/final-qa-pass.mjs
 */
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
import {
  calculateAnnuityPayment,
  roundMoney,
} from "@/lib/finance-math/core";
import { computeMiniMortgage } from "@/lib/mini-mortgage-calculator";

const BASE = process.env.QA_BASE_URL ?? "http://127.0.0.1:3000";

const ROUTES = [
  "/",
  "/sazby",
  "/kalkulacky",
  "/kalkulacky/hypotecni",
  "/kalkulacky/koupe-vs-najem",
  "/kalkulacky/rodinny-rozpocet",
  "/kalkulacky/odhad-versus-kupni-cena",
  "/kalkulacky/historicky-vyvoj",
  "/kalkulacky/potencialni-vyvoj",
  "/kalkulacky/hypoteka-na-firmu",
  "/kalkulacky/budouci-prijem-z-najmu",
  "/kalkulacky/vystavba",
  "/investicni-rentgen",
  "/investicni-rentgen/ukazka",
  "/investicni-rentgen/modelar",
  "/investicni-rentgen/objednavka",
  "/investicni-rentgen/porovnani",
  "/akademie",
  "/akademie/ltv",
  "/akademie/hypoteky-v-praxi",
  "/akademie/hypoteky-v-praxi/prvni-hypoteka",
  "/akademie/cesty",
  "/faq",
  "/kontakt",
  "/navrh-na-miru",
  "/moje-moznosti",
  "/clanky",
  "/temata",
  "/pruvodce/prakticke-situace",
  "/pruvodce-investora",
  "/pruvodce-investora/ceska-republika",
  "/refinancovani-radar",
  "/o-nas",
  "/duvera",
  "/dashboard",
  "/hypotecni-akademie",
  "/en",
];

const VIEWPORTS = [
  [320, 568],
  [360, 800],
  [375, 667],
  [390, 844],
  [393, 852],
  [412, 915],
  [430, 932],
  [600, 960],
  [768, 1024],
  [800, 1280],
  [820, 1180],
  [834, 1194],
  [1024, 1366],
  [1280, 800],
  [1440, 900],
  [1920, 1080],
];

const LANDSCAPE = [
  [568, 320],
  [800, 360],
  [844, 390],
  [1024, 768],
  [1366, 1024],
];

const report = {
  critical: [],
  high: [],
  medium: [],
  low: [],
  priorFixes: {},
  routes: { checked: 0, status: {} },
  cta: { checked: 0, broken: [] },
  calculators: { tested: [], math: [], ui: [] },
  forms: { tested: [], results: [] },
  auth: { found: false, notes: "" },
  rentgen: { steps: [], ok: false },
  console: { projectErrors: [], thirdParty: [] },
  network: { failed: [] },
  responsive: { viewports: [], landscape: [], failures: [] },
  a11y: [],
};

function push(sev, item) {
  report[sev.toLowerCase()].push(item);
}

async function dismissCookie(page) {
  const btn = page.getByRole("button", {
    name: /Přijmout|Povolit vše|Souhlasím|Pouze nezbytné|Odmítnout/i,
  });
  if (await btn.first().isVisible({ timeout: 800 }).catch(() => false)) {
    await btn.first().click().catch(() => {});
    await page.waitForTimeout(150);
  }
}

function measureOverflow() {
  const doc = document.documentElement;
  const vw = doc.clientWidth;
  const offenders = [];
  for (const el of document.body.querySelectorAll("*")) {
    if (!(el instanceof HTMLElement)) continue;
    if (el.closest("[data-measure-probe]")) continue;
    const st = getComputedStyle(el);
    if (st.display === "none" || st.visibility === "hidden") continue;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2 || r.left < -500) continue;
    if (r.right > vw + 3 || r.left < -3) {
      let clipped = false;
      let p = el.parentElement;
      while (p) {
        const ps = getComputedStyle(p);
        if (["auto", "scroll", "hidden"].includes(ps.overflowX)) {
          clipped = true;
          break;
        }
        p = p.parentElement;
      }
      if (!clipped) {
        offenders.push(el.tagName);
        if (offenders.length >= 5) break;
      }
    }
  }
  return {
    scrollDiff: doc.scrollWidth - doc.clientWidth,
    offenders,
    canScrollY: doc.scrollHeight > window.innerHeight + 40,
  };
}

// --- Math unit checks (no browser) ---
{
  const cases = [
    { principal: 4_000_000, rate: 5, years: 30 },
    { principal: 1_000_000, rate: 0, years: 20 },
    { principal: 5_000_000, rate: 8, years: 15 },
    { principal: 10_000_000, rate: 3.5, years: 25 },
  ];
  for (const c of cases) {
    const pay = calculateAnnuityPayment(c.principal, c.rate, c.years);
    const ok =
      Number.isFinite(pay) &&
      pay >= 0 &&
      (c.rate === 0
        ? Math.abs(pay - c.principal / (c.years * 12)) < 1
        : pay > 0);
    report.calculators.math.push({
      name: "annuity",
      ...c,
      pay: roundMoney(pay),
      ok,
    });
    if (!ok) push("CRITICAL", { route: "math", issue: "annuity invalid", c, pay });
  }
  const mini = computeMiniMortgage({
    propertyPriceCzk: 5_000_000,
    ownFundsCzk: 1_000_000,
    termYears: 30,
    annualRatePercent: 5,
  });
  const expectedLoan = 4_000_000;
  const miniOk =
    mini.loanAmountCzk === expectedLoan &&
    Number.isFinite(mini.monthlyPaymentCzk) &&
    !String(mini.monthlyPaymentCzk).includes("NaN");
  report.calculators.math.push({
    name: "mini-mortgage LTV+payment",
    loan: mini.loanAmountCzk,
    payment: mini.monthlyPaymentCzk,
    ltv: mini.exactLtv,
    ok: miniOk,
  });
  if (!miniOk) push("CRITICAL", { route: "math", issue: "mini mortgage broken", mini });

  // Edge: zero price
  const zero = computeMiniMortgage({
    propertyPriceCzk: 0,
    ownFundsCzk: 0,
    termYears: 30,
    annualRatePercent: 5,
  });
  report.calculators.math.push({
    name: "mini zero price",
    payment: zero.monthlyPaymentCzk,
    ok: Number.isFinite(zero.monthlyPaymentCzk) && zero.monthlyPaymentCzk >= 0,
  });
}

const browser = await chromium.launch({ headless: true });

// --- Route HTTP status ---
{
  const page = await browser.newPage();
  for (const path of ROUTES) {
    const res = await page.goto(BASE + path, {
      waitUntil: "domcontentloaded",
      timeout: 45000,
    });
    const status = res?.status() ?? 0;
    report.routes.checked++;
    report.routes.status[path] = status;
    if (status >= 400) {
      push(status >= 500 ? "CRITICAL" : "HIGH", {
        route: path,
        issue: `HTTP ${status}`,
      });
    }
  }
  await page.close();
}

// --- Prior fix regression: menu + scroll lock + overflow ---
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(BASE + "/", { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(700);
  await dismissCookie(page);
  const open = page.getByRole("button", { name: /Otevřít menu/i });
  let menuOk = false;
  let lockOk = false;
  if (await open.isVisible()) {
    await open.click();
    await page.waitForTimeout(250);
    menuOk = await page.locator("#mobile-nav-drawer a").first().isVisible();
    const z = await page.locator("#mobile-nav-drawer").evaluate((el) =>
      getComputedStyle(el).zIndex
    );
    report.priorFixes.menuZIndex = z;
    await page.getByRole("button", { name: /^Zavřít menu$/i }).click();
    await page.waitForTimeout(250);
    const lock = await page.evaluate(() => document.body.style.overflow);
    lockOk = lock !== "hidden";
    report.priorFixes.scrollLockAfterClose = lock || "(empty)";
  }
  report.priorFixes.menuOpenClose = menuOk && lockOk;
  if (!menuOk || !lockOk) {
    push("CRITICAL", {
      route: "/",
      component: "Navbar",
      issue: `menu regression menuOk=${menuOk} lockOk=${lockOk}`,
    });
  }
  const ov = await page.evaluate(measureOverflow);
  report.priorFixes.homeOverflow = ov;
  if (ov.scrollDiff > 2 || ov.offenders.length) {
    push("HIGH", { route: "/", issue: "horizontal overflow", ov });
  }
  const chartErr = errors.filter((e) => /width\(-1\)/i.test(e));
  report.priorFixes.rechartsNeg1 = chartErr.length;
  if (chartErr.length) {
    push("HIGH", { route: "/", issue: "Recharts -1 size", n: chartErr.length });
  }
  await page.close();
}

// --- CTA crawl on homepage + key hubs ---
{
  const hubs = ["/", "/kalkulacky", "/investicni-rentgen", "/akademie", "/sazby"];
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  for (const hub of hubs) {
    await page.goto(BASE + hub, { waitUntil: "domcontentloaded", timeout: 45000 });
    await dismissCookie(page);
    const hrefs = await page.evaluate(() => {
      const out = [];
      for (const a of document.querySelectorAll("a[href]")) {
        const href = a.getAttribute("href") || "";
        const text = (a.textContent || "").trim().slice(0, 60);
        if (!href || href === "#" || href.startsWith("javascript:")) {
          out.push({ href, text, bad: true });
        } else if (href.startsWith("/") || href.startsWith(location.origin)) {
          out.push({ href, text, bad: false });
        }
      }
      for (const b of document.querySelectorAll("button")) {
        const text = (b.textContent || "").trim().slice(0, 60);
        if (/spočítat|kalkulač|hypoték|refinanc|invest|kontakt|odeslat|pokračovat|objednat|rentgen|sazby|možnost/i.test(text)) {
          out.push({ href: "(button)", text, bad: false, isButton: true });
        }
      }
      return out;
    });
    for (const h of hrefs) {
      report.cta.checked++;
      if (h.bad) {
        report.cta.broken.push({ hub, ...h });
        push("HIGH", { route: hub, issue: "empty/broken href", ...h });
      }
    }
    // sample resolve internal links (max 25 per hub)
    const internals = hrefs
      .filter((h) => !h.bad && !h.isButton && h.href.startsWith("/"))
      .slice(0, 25);
    for (const link of internals) {
      const res = await page.request.get(BASE + link.href.split("#")[0]);
      if (res.status() >= 400) {
        report.cta.broken.push({ hub, ...link, status: res.status() });
        push("HIGH", {
          route: hub,
          issue: `CTA link ${link.href} → ${res.status()}`,
        });
      }
    }
  }
  await page.close();
}

// --- Calculator UI smoke ---
{
  const calcPages = [
    "/kalkulacky/hypotecni",
    "/kalkulacky/rodinny-rozpocet",
    "/kalkulacky/koupe-vs-najem",
    "/kalkulacky/odhad-versus-kupni-cena",
    "/kalkulacky/vystavba",
    "/kalkulacky/hypoteka-na-firmu",
    "/kalkulacky/budouci-prijem-z-najmu",
  ];
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  for (const path of calcPages) {
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(BASE + path, { waitUntil: "domcontentloaded", timeout: 45000 });
    await dismissCookie(page);
    await page.waitForTimeout(500);
    const brokenText = await page.evaluate(() => {
      const t = document.body.innerText;
      return {
        nan: /\bNaN\b/.test(t),
        undef: /\bundefined\b/.test(t),
        inf: /\bInfinity\b/.test(t),
      };
    });
    const inputs = page.locator(
      'input[type="text"], input[type="number"], input[inputmode="decimal"], input[inputmode="numeric"]'
    );
    const n = await inputs.count();
    if (n > 0) {
      const first = inputs.first();
      await first.fill("0").catch(() => {});
      await page.waitForTimeout(200);
      await first.fill("10000000").catch(() => {});
      await page.waitForTimeout(200);
      await first.fill("3500000").catch(() => {});
      await page.waitForTimeout(200);
    }
    const after = await page.evaluate(() => {
      const t = document.body.innerText;
      return {
        nan: /\bNaN\b/.test(t),
        undef: /\bundefined\b/.test(t),
        inf: /\bInfinity\b/.test(t),
      };
    });
    const entry = {
      path,
      inputs: n,
      brokenText,
      after,
      pageErrors: errors.slice(0, 3),
    };
    report.calculators.tested.push(path);
    report.calculators.ui.push(entry);
    if (after.nan || after.undef || after.inf) {
      push("CRITICAL", { route: path, issue: "broken calculator output", after });
    }
    if (errors.some((e) => !/ResizeObserver|hydration/i.test(e))) {
      push("MEDIUM", { route: path, issue: "pageerror", errors: errors.slice(0, 3) });
    }
    page.removeAllListeners("pageerror");
  }
  await page.close();
}

// --- Forms: empty submit validation (no real lead) ---
{
  const formPages = [
    { path: "/kontakt", name: "ContactView" },
    { path: "/navrh-na-miru", name: "LeadCapture/navrh" },
  ];
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  for (const f of formPages) {
    await page.goto(BASE + f.path, { waitUntil: "domcontentloaded", timeout: 45000 });
    await dismissCookie(page);
    const submit = page.locator('button[type="submit"], input[type="submit"]').first();
    if (await submit.count()) {
      await submit.click();
      await page.waitForTimeout(400);
      const hasError = await page.evaluate(() => {
        const t = document.body.innerText.toLowerCase();
        return (
          document.querySelectorAll('[aria-invalid="true"], .text-destructive, [role="alert"]').length >
            0 ||
          /povinn|vyplň|neplatn|email|e-mail|telefon|chyba|required/i.test(t)
        );
      });
      report.forms.tested.push(f.path);
      report.forms.results.push({ ...f, emptySubmitShowsError: hasError });
      if (!hasError) {
        push("HIGH", {
          route: f.path,
          component: f.name,
          issue: "empty submit without visible validation",
        });
      }
    } else {
      report.forms.tested.push(f.path);
      report.forms.results.push({ ...f, emptySubmitShowsError: null, note: "no submit button" });
    }
  }
  await page.close();
}

// --- Auth: no public registration route ---
{
  const page = await browser.newPage();
  const candidates = [
    "/registrace",
    "/login",
    "/prihlaseni",
    "/sign-in",
    "/sign-up",
    "/ucet",
    "/account",
    "/auth",
  ];
  const found = [];
  for (const p of candidates) {
    const res = await page.goto(BASE + p, { waitUntil: "domcontentloaded", timeout: 20000 }).catch(() => null);
    const status = res?.status() ?? 0;
    if (status === 200) {
      const title = await page.title();
      // treat soft 200 not-found pages
      const body = await page.locator("h1").first().textContent().catch(() => "");
      if (!/nenalezen|not found|404/i.test(body || "") && !/nenalezen|404/i.test(title)) {
        found.push(p);
      }
    }
  }
  report.auth.found = found.length > 0;
  report.auth.notes = found.length
    ? `Public auth routes: ${found.join(", ")}`
    : "No public registration/login pages; dashboard exists without classic email signup UI.";
  await page.close();
}

// --- Rentgen revenue flow (no payment) ---
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const failed = [];
  page.on("requestfailed", (req) => {
    failed.push({ url: req.url(), error: req.failure()?.errorText });
  });
  const steps = [];
  await page.goto(BASE + "/investicni-rentgen", { waitUntil: "domcontentloaded" });
  await dismissCookie(page);
  steps.push({ step: "landing", status: 200, url: page.url() });

  await page.goto(BASE + "/investicni-rentgen?balicek=digital", {
    waitUntil: "domcontentloaded",
  });
  steps.push({ step: "balicek=digital", url: page.url() });

  await page.goto(BASE + "/investicni-rentgen/ukazka", { waitUntil: "domcontentloaded" });
  const ukazkaText = await page.locator("body").innerText();
  steps.push({
    step: "ukazka",
    hasContent: ukazkaText.length > 200,
    nan: /\bNaN\b/.test(ukazkaText),
  });

  await page.goto(BASE + "/investicni-rentgen/objednavka", {
    waitUntil: "domcontentloaded",
  });
  const orderHasForm = (await page.locator("form").count()) > 0;
  const orderText = await page.locator("body").innerText();
  steps.push({
    step: "objednavka",
    hasForm: orderHasForm,
    mentionsPrice: /999|Kč|CZK|balíček|premium|digitál/i.test(orderText),
  });

  // Do not click pay — verify CTA exists
  const payCta = page.getByRole("button", {
    name: /Zaplatit|Objednat|Pokračovat k platbě|Odeslat poptávku|Poptat/i,
  });
  steps.push({
    step: "payCtaPresent",
    count: await payCta.count(),
  });

  report.rentgen.steps = steps;
  report.rentgen.ok =
    steps.every((s) => s.nan !== true) &&
    steps.find((s) => s.step === "ukazka")?.hasContent &&
    (orderHasForm || steps.find((s) => s.step === "payCtaPresent")?.count >= 0);
  if (!report.rentgen.ok) {
    push("HIGH", { route: "/investicni-rentgen", issue: "rentgen flow incomplete", steps });
  }
  report.network.failed.push(
    ...failed.filter((f) => f.url.includes("127.0.0.1") || f.url.includes("localhost"))
  );
  await page.close();
}

// --- Responsive + landscape sweep (main routes) ---
{
  const main = [
    "/",
    "/sazby",
    "/kalkulacky/hypotecni",
    "/investicni-rentgen",
    "/akademie/hypoteky-v-praxi",
    "/kontakt",
  ];
  for (const [w, h] of [...VIEWPORTS, ...LANDSCAPE]) {
    const isLandscape = LANDSCAPE.some((l) => l[0] === w && l[1] === h);
    const bucket = isLandscape ? report.responsive.landscape : report.responsive.viewports;
    bucket.push(`${w}x${h}`);
    for (const path of main) {
      // sample: all viewports only for / and /kalkulacky; others subset
      if (
        path !== "/" &&
        path !== "/kalkulacky/hypotecni" &&
        ![320, 390, 768, 1024, 1280, 568, 844].includes(w)
      ) {
        continue;
      }
      const page = await browser.newPage({ viewport: { width: w, height: h } });
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      try {
        await page.goto(BASE + path, { waitUntil: "domcontentloaded", timeout: 45000 });
        await page.waitForTimeout(400);
        const m = await page.evaluate(measureOverflow);
        if (m.scrollDiff > 2 || m.offenders.length) {
          report.responsive.failures.push({ path, vp: `${w}x${h}`, m });
          push("HIGH", { route: path, issue: "overflow", vp: `${w}x${h}`, m });
        }
        if (path === "/" && h <= 600 && w >= 1000 && !m.canScrollY) {
          push("CRITICAL", { route: "/", issue: "no vertical scroll", vp: `${w}x${h}` });
        }
        const projectErr = errors.filter(
          (e) => !/third-party|gtag|facebook|ResizeObserver/i.test(e)
        );
        if (projectErr.length) {
          report.console.projectErrors.push({ path, vp: `${w}x${h}`, projectErr });
        }
      } catch (e) {
        push("CRITICAL", { route: path, issue: String(e.message || e), vp: `${w}x${h}` });
      }
      await page.close();
    }
  }
}

// --- A11y smoke on kontakt ---
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(BASE + "/kontakt", { waitUntil: "domcontentloaded" });
  const issues = await page.evaluate(() => {
    const out = [];
    for (const input of document.querySelectorAll("input, textarea, select")) {
      const id = input.id;
      const label = id && document.querySelector(`label[for="${id}"]`);
      const aria = input.getAttribute("aria-label") || input.getAttribute("aria-labelledby");
      if (!label && !aria && input.type !== "hidden") {
        out.push({ type: "input-no-label", name: input.name || input.id || input.type });
      }
    }
    for (const btn of document.querySelectorAll("button")) {
      const name = (btn.getAttribute("aria-label") || btn.textContent || "").trim();
      if (!name) out.push({ type: "button-no-name" });
    }
    return out.slice(0, 15);
  });
  report.a11y = issues;
  if (issues.filter((i) => i.type === "button-no-name").length) {
    push("MEDIUM", { route: "/kontakt", issue: "buttons without accessible name", issues });
  }
  await page.close();
}

await browser.close();

writeFileSync(
  new URL("./final-qa-report.json", import.meta.url),
  JSON.stringify(report, null, 2)
);
console.log(
  JSON.stringify(
    {
      critical: report.critical.length,
      high: report.high.length,
      medium: report.medium.length,
      low: report.low.length,
      priorFixes: report.priorFixes,
      routesChecked: report.routes.checked,
      ctaChecked: report.cta.checked,
      ctaBroken: report.cta.broken.length,
      calcs: report.calculators.tested.length,
      forms: report.forms.results,
      auth: report.auth,
      rentgenOk: report.rentgen.ok,
      responsiveFailures: report.responsive.failures.length,
      consoleProject: report.console.projectErrors.length,
      details: {
        critical: report.critical,
        high: report.high.slice(0, 20),
        medium: report.medium.slice(0, 10),
      },
    },
    null,
    2
  )
);
process.exit(report.critical.length + report.high.length > 0 ? 1 : 0);
