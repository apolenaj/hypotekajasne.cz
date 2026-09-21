/**
 * Fast post-fix responsive smoke (critical paths × key viewports).
 */
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const BASE = process.env.QA_BASE_URL ?? "http://127.0.0.1:3000";
const PATHS = [
  "/",
  "/sazby",
  "/kalkulacky/hypotecni",
  "/kalkulacky/rodinny-rozpocet",
  "/investicni-rentgen",
  "/akademie/hypoteky-v-praxi",
  "/akademie/hypoteky-v-praxi/prvni-hypoteka",
  "/kontakt",
  "/navrh-na-miru",
  "/pruvodce-investora/ceska-republika",
];
const VPS = [
  [320, 568],
  [360, 800],
  [390, 844],
  [430, 932],
  [768, 1024],
  [1024, 600],
  [1280, 800],
  [1440, 900],
];

function measure() {
  const doc = document.documentElement;
  const vw = doc.clientWidth;
  const offenders = [];
  for (const el of document.body.querySelectorAll("*")) {
    if (!(el instanceof HTMLElement)) continue;
    if (el.closest("[data-measure-probe]")) continue;
    const st = getComputedStyle(el);
    if (st.display === "none" || st.visibility === "hidden") continue;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    if (r.left < -500) continue;
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
      if (clipped) continue;
      offenders.push({
        tag: el.tagName.toLowerCase(),
        cls: String(el.className).slice(0, 60),
        right: Math.round(r.right),
        vw,
      });
      if (offenders.length >= 6) break;
    }
  }
  return {
    scrollDiff: doc.scrollWidth - doc.clientWidth,
    canScrollY: doc.scrollHeight > vhSafe() + 40,
    offenders,
  };
  function vhSafe() {
    return window.innerHeight;
  }
}

const findings = [];
const browser = await chromium.launch({ headless: true });
for (const path of PATHS) {
  for (const [w, h] of VPS) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    try {
      await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded", timeout: 40000 });
      await page.waitForTimeout(600);
      const m = await page.evaluate(measure);
      if (m.scrollDiff > 2 || m.offenders.length) {
        findings.push({ severity: "HIGH", path, vp: `${w}x${h}`, ...m });
      }
      if (path === "/" && h <= 650 && !m.canScrollY) {
        findings.push({ severity: "CRITICAL", path, vp: `${w}x${h}`, issue: "no vertical scroll" });
      }
      if (w <= 430) {
        const open = page.getByRole("button", { name: /Otevřít menu/i });
        if (await open.isVisible().catch(() => false)) {
          await open.click();
          await page.waitForTimeout(200);
          const ok = await page.locator("#mobile-nav-drawer a").first().isVisible();
          await page.getByRole("button", { name: /Zavřít menu/i }).first().click();
          await page.waitForTimeout(150);
          const lock = await page.evaluate(() => document.body.style.overflow);
          if (!ok) findings.push({ severity: "HIGH", path, vp: `${w}x${h}`, issue: "menu links hidden" });
          if (lock === "hidden") findings.push({ severity: "HIGH", path, vp: `${w}x${h}`, issue: "scroll lock leak" });
        }
      }
      const chartWarn = errors.filter((e) => /width\(-1\)/i.test(e));
      if (chartWarn.length) {
        findings.push({ severity: "MEDIUM", path, vp: `${w}x${h}`, issue: "recharts -1 size", n: chartWarn.length });
      }
      const other = errors.filter((e) => !/width\(-1\)/i.test(e)).slice(0, 3);
      if (other.length) {
        findings.push({ severity: "MEDIUM", path, vp: `${w}x${h}`, issue: "pageerror", other });
      }
    } catch (e) {
      findings.push({ severity: "CRITICAL", path, vp: `${w}x${h}`, issue: String(e.message || e) });
    }
    await page.close();
  }
}
await browser.close();
const out = {
  findings,
  counts: {
    CRITICAL: findings.filter((f) => f.severity === "CRITICAL").length,
    HIGH: findings.filter((f) => f.severity === "HIGH").length,
    MEDIUM: findings.filter((f) => f.severity === "MEDIUM").length,
  },
};
writeFileSync(new URL("./responsive-qa-fast.json", import.meta.url), JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
process.exit(out.counts.CRITICAL + out.counts.HIGH > 0 ? 1 : 0);
