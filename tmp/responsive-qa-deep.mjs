/**
 * Deeper responsive QA: real overflow, console errors, hero CTA, calc inputs, cookie.
 */
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const BASE = process.env.QA_BASE_URL ?? "http://127.0.0.1:3000";

const PATHS = [
  "/",
  "/sazby",
  "/kalkulacky/hypotecni",
  "/kalkulacky/koupe-vs-najem",
  "/kalkulacky/rodinny-rozpocet",
  "/kalkulacky/odhad-versus-kupni-cena",
  "/investicni-rentgen",
  "/investicni-rentgen/ukazka",
  "/investicni-rentgen/modelar",
  "/akademie",
  "/akademie/hypoteky-v-praxi",
  "/akademie/hypoteky-v-praxi/prvni-hypoteka",
  "/akademie/ltv",
  "/faq",
  "/kontakt",
  "/navrh-na-miru",
  "/moje-moznosti",
  "/clanky",
  "/refinancovani-radar",
  "/pruvodce/prakticke-situace",
];

const VIEWPORTS = [
  { w: 320, h: 568 },
  { w: 360, h: 800 },
  { w: 375, h: 667 },
  { w: 390, h: 844 },
  { w: 430, h: 932 },
  { w: 480, h: 800 },
  { w: 768, h: 1024 },
  { w: 820, h: 1180 },
  { w: 1024, h: 600 },
  { w: 1280, h: 800 },
  { w: 1440, h: 900 },
];

function measurePage() {
  const doc = document.documentElement;
  const vw = doc.clientWidth;
  const vh = window.innerHeight;
  const offenders = [];
  for (const el of document.body.querySelectorAll("*")) {
    if (!(el instanceof HTMLElement)) continue;
    const style = getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") continue;
    if (style.position === "fixed" || style.position === "absolute") {
      // skip off-screen measurement probes
      if (el.getBoundingClientRect().left < -500) continue;
    }
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    if (r.left < -2 || r.right > vw + 2) {
      // Ignore elements clipped by overflow:hidden ancestors that don't expand page
      let clipped = false;
      let p = el.parentElement;
      while (p) {
        const ps = getComputedStyle(p);
        if (
          (ps.overflowX === "auto" ||
            ps.overflowX === "scroll" ||
            ps.overflowX === "hidden") &&
          p.clientWidth < r.width
        ) {
          clipped = true;
          break;
        }
        p = p.parentElement;
      }
      if (clipped) continue;
      if (r.left < -500) continue;
      offenders.push({
        tag: el.tagName.toLowerCase(),
        id: el.id || "",
        cls: (el.className?.toString?.() || "").slice(0, 80),
        left: Math.round(r.left),
        right: Math.round(r.right),
        vw,
      });
      if (offenders.length >= 8) break;
    }
  }

  const calc = document.getElementById("hero-calculator");
  const inputs = [...document.querySelectorAll("input, select, textarea")].slice(
    0,
    40
  );
  const inputIssues = [];
  for (const input of inputs) {
    if (!(input instanceof HTMLElement)) continue;
    const r = input.getBoundingClientRect();
    const style = getComputedStyle(input);
    if (style.display === "none") continue;
    if (r.width > 0 && (r.right > vw + 2 || r.left < -2)) {
      inputIssues.push({
        name: input.getAttribute("name") || input.id || input.tagName,
        right: Math.round(r.right),
        vw,
      });
    }
    if (
      input instanceof HTMLInputElement &&
      (input.type === "number" || input.inputMode === "decimal" || input.inputMode === "numeric")
    ) {
      // ok
    }
  }

  const smallTargets = [];
  for (const el of document.querySelectorAll(
    "a, button, [role='button'], input[type='checkbox'], input[type='radio']"
  )) {
    if (!(el instanceof HTMLElement)) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;
    if (getComputedStyle(el).display === "none") continue;
    if (r.width < 36 || r.height < 36) {
      // allow inline text links in paragraphs
      if (el.tagName === "A" && el.closest("p, li, td")) continue;
      smallTargets.push({
        tag: el.tagName.toLowerCase(),
        text: (el.textContent || "").trim().slice(0, 40),
        w: Math.round(r.width),
        h: Math.round(r.height),
      });
      if (smallTargets.length >= 10) break;
    }
  }

  return {
    scrollDiff: doc.scrollWidth - doc.clientWidth,
    canScrollY: doc.scrollHeight > doc.clientHeight + 20,
    offenders,
    inputIssues,
    smallTargets,
    heroCalcVisible: calc
      ? (() => {
          const r = calc.getBoundingClientRect();
          return r.width > 0 && r.bottom > 0 && r.top < vh;
        })()
      : null,
    cookie: !!document.querySelector(
      "[data-cookie-banner], #cookie-consent, [aria-label*='cookie' i]"
    ),
  };
}

const findings = [];
const browser = await chromium.launch({ headless: true });

for (const path of PATHS) {
  for (const vp of VIEWPORTS) {
    // Full matrix only for critical paths; others sample
    const critical = ["/", "/sazby", "/kalkulacky/hypotecni", "/investicni-rentgen", "/akademie/hypoteky-v-praxi", "/kontakt", "/navrh-na-miru"].includes(path);
    if (!critical && ![320, 390, 768, 1024, 1280].includes(vp.w)) continue;

    const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h } });
    const consoleErrors = [];
    page.on("pageerror", (e) => consoleErrors.push(String(e.message)));
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    try {
      const res = await page.goto(`${BASE}${path}`, {
        waitUntil: "domcontentloaded",
        timeout: 45000,
      });
      await page.waitForTimeout(700);
      // dismiss cookie if present
      const accept = page.getByRole("button", { name: /Přijmout|Souhlasím|Accept|Povolit vše/i });
      if (await accept.isVisible().catch(() => false)) {
        await accept.click().catch(() => {});
        await page.waitForTimeout(200);
      }

      const m = await page.evaluate(measurePage);

      // try menu open/close on mobile
      let menuOk = null;
      if (vp.w <= 900) {
        const open = page.getByRole("button", { name: /Otevřít menu/i });
        if (await open.isVisible().catch(() => false)) {
          await open.click();
          await page.waitForTimeout(250);
          const drawer = page.locator("#mobile-nav-drawer");
          menuOk = await drawer.isVisible();
          // try navigate first link
          const link = drawer.locator("a").first();
          if (await link.count()) {
            // just verify clickable
            menuOk = menuOk && (await link.isVisible());
          }
          await page.getByRole("button", { name: /Zavřít menu/i }).first().click();
          await page.waitForTimeout(200);
          const overflowAfter = await page.evaluate(() => document.body.style.overflow);
          if (overflowAfter === "hidden") {
            findings.push({
              severity: "HIGH",
              path,
              vp: `${vp.w}x${vp.h}`,
              issue: "body overflow stays hidden after menu close",
            });
          }
        }
      }

      // calculator smoke on hypoteční
      if (path === "/kalkulacky/hypotecni") {
        const numberInputs = page.locator('input[type="number"], input[inputmode="numeric"], input[inputmode="decimal"]');
        const n = await numberInputs.count();
        if (n > 0) {
          const first = numberInputs.first();
          await first.fill("3500000");
          await page.waitForTimeout(300);
        }
      }

      if ((res?.status() ?? 0) >= 400) {
        findings.push({
          severity: "CRITICAL",
          path,
          vp: `${vp.w}x${vp.h}`,
          issue: `HTTP ${res.status()}`,
        });
      }
      if (m.scrollDiff > 2) {
        findings.push({
          severity: "HIGH",
          path,
          vp: `${vp.w}x${vp.h}`,
          issue: `document horizontal scrollDiff=${m.scrollDiff}`,
          offenders: m.offenders,
        });
      }
      if (m.offenders.length) {
        findings.push({
          severity: "HIGH",
          path,
          vp: `${vp.w}x${vp.h}`,
          issue: "element overflows viewport",
          offenders: m.offenders,
        });
      }
      if (m.inputIssues.length) {
        findings.push({
          severity: "HIGH",
          path,
          vp: `${vp.w}x${vp.h}`,
          issue: "form control overflows viewport",
          inputIssues: m.inputIssues,
        });
      }
      if (path === "/" && vp.h <= 700 && !m.canScrollY) {
        findings.push({
          severity: "CRITICAL",
          path,
          vp: `${vp.w}x${vp.h}`,
          issue: "homepage cannot scroll vertically",
        });
      }
      if (consoleErrors.length) {
        const unique = [...new Set(consoleErrors)].slice(0, 5);
        findings.push({
          severity: "MEDIUM",
          path,
          vp: `${vp.w}x${vp.h}`,
          issue: "console errors",
          consoleErrors: unique,
        });
      }
      if (menuOk === false) {
        findings.push({
          severity: "HIGH",
          path,
          vp: `${vp.w}x${vp.h}`,
          issue: "mobile menu failed to open/show links",
        });
      }
      // collect small targets only once per path at 390
      if (vp.w === 390 && m.smallTargets.length >= 8) {
        findings.push({
          severity: "MEDIUM",
          path,
          vp: `${vp.w}x${vp.h}`,
          issue: `many small tap targets (${m.smallTargets.length}+)`,
          samples: m.smallTargets.slice(0, 5),
        });
      }
    } catch (e) {
      findings.push({
        severity: "CRITICAL",
        path,
        vp: `${vp.w}x${vp.h}`,
        issue: String(e?.message ?? e),
      });
    }
    await page.close();
  }
}

await browser.close();

const summary = {
  base: BASE,
  findings,
  bySeverity: {
    CRITICAL: findings.filter((f) => f.severity === "CRITICAL").length,
    HIGH: findings.filter((f) => f.severity === "HIGH").length,
    MEDIUM: findings.filter((f) => f.severity === "MEDIUM").length,
  },
};

writeFileSync(
  new URL("./responsive-qa-deep.json", import.meta.url),
  JSON.stringify(summary, null, 2)
);
console.log(JSON.stringify(summary, null, 2));
process.exit(summary.bySeverity.CRITICAL + summary.bySeverity.HIGH > 0 ? 1 : 0);
