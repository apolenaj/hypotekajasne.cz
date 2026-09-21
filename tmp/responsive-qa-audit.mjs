/**
 * Responsive QA smoke: horizontal overflow + mobile nav scrollability.
 * Detects overflowing descendants even when html/body clip overflow-x.
 */
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const BASE = process.env.QA_BASE_URL ?? "http://127.0.0.1:3000";

const PATHS = [
  "/",
  "/sazby",
  "/kalkulacky",
  "/kalkulacky/hypotecni",
  "/kalkulacky/koupe-vs-najem",
  "/kalkulacky/rodinny-rozpocet",
  "/kalkulacky/odhad-versus-kupni-cena",
  "/investicni-rentgen",
  "/investicni-rentgen/ukazka",
  "/investicni-rentgen/modelar",
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
  "/refinancovani-radar",
  "/o-nas",
  "/duvera",
];

const VIEWPORTS = [
  { w: 320, h: 568 },
  { w: 340, h: 700 },
  { w: 360, h: 800 },
  { w: 375, h: 667 },
  { w: 390, h: 844 },
  { w: 393, h: 852 },
  { w: 412, h: 915 },
  { w: 430, h: 932 },
  { w: 480, h: 800 },
  { w: 550, h: 800 },
  { w: 600, h: 960 },
  { w: 650, h: 900 },
  { w: 700, h: 900 },
  { w: 768, h: 1024 },
  { w: 800, h: 1280 },
  { w: 820, h: 1180 },
  { w: 900, h: 800 },
  { w: 950, h: 700 },
  { w: 1024, h: 600 },
  { w: 1024, h: 1366 },
  { w: 1100, h: 800 },
  { w: 1280, h: 800 },
  { w: 1440, h: 900 },
  { w: 1920, h: 1080 },
];

function findOverflowingElements() {
  const doc = document.documentElement;
  const vw = doc.clientWidth;
  const offenders = [];
  const all = document.body.querySelectorAll("*");
  for (const el of all) {
    if (!(el instanceof HTMLElement)) continue;
    const style = getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") continue;
    // Skip intentionally off-screen measurement probes
    if (el.className?.toString?.().includes("-left-[9999px]")) continue;
    const rect = el.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) continue;
    const right = rect.right;
    const left = rect.left;
    // Allow 1px subpixel; flag if extends past viewport significantly
    if (right > vw + 2 || left < -2) {
      const tag = el.tagName.toLowerCase();
      const id = el.id ? `#${el.id}` : "";
      const cls = (el.className?.toString?.() || "")
        .split(/\s+/)
        .slice(0, 4)
        .join(".");
      offenders.push({
        sel: `${tag}${id}${cls ? "." + cls : ""}`,
        left: Math.round(left),
        right: Math.round(right),
        width: Math.round(rect.width),
        vw,
      });
      if (offenders.length >= 12) break;
    }
  }
  return {
    scrollWidth: doc.scrollWidth,
    clientWidth: doc.clientWidth,
    scrollDiff: doc.scrollWidth - doc.clientWidth,
    offenders,
  };
}

function mobileNavHealth() {
  const drawer = document.getElementById("mobile-nav-drawer");
  if (!drawer) return { open: false };
  const panel = drawer.querySelector("[data-mobile-nav-scroll], .overflow-y-auto");
  const scrollEl =
    panel instanceof HTMLElement
      ? panel
      : drawer.querySelector(".overflow-y-auto");
  const info = {
    open: true,
    drawerH: Math.round(drawer.getBoundingClientRect().height),
    vh: window.innerHeight,
    bodyOverflow: document.body.style.overflow,
  };
  if (scrollEl instanceof HTMLElement) {
    info.scrollH = scrollEl.scrollHeight;
    info.clientH = scrollEl.clientHeight;
    info.canScrollMenu = scrollEl.scrollHeight > scrollEl.clientHeight + 4;
    scrollEl.scrollTop = 40;
    info.scrolled = scrollEl.scrollTop >= 20;
  }
  return info;
}

const results = [];
const browser = await chromium.launch({ headless: true });

// Sample matrix: all paths × key viewports + full viewport sweep on homepage + a few critical tools
const keyViewports = [
  { w: 320, h: 568 },
  { w: 360, h: 800 },
  { w: 390, h: 844 },
  { w: 430, h: 932 },
  { w: 768, h: 1024 },
  { w: 1024, h: 600 },
  { w: 1280, h: 800 },
];

const sweepPaths = ["/", "/sazby", "/kalkulacky/hypotecni", "/investicni-rentgen", "/akademie/hypoteky-v-praxi"];

for (const path of PATHS) {
  for (const vp of keyViewports) {
    const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h } });
    const url = `${BASE}${path}`;
    let status = 0;
    let error = null;
    let overflow = null;
    let nav = null;
    try {
      const res = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
      status = res?.status() ?? 0;
      await page.waitForTimeout(500);
      overflow = await page.evaluate(findOverflowingElements);
      if (vp.w <= 900) {
        const menuBtn = page.getByRole("button", { name: /Otevřít menu/i });
        if (await menuBtn.isVisible().catch(() => false)) {
          await menuBtn.click();
          await page.waitForTimeout(300);
          nav = await page.evaluate(mobileNavHealth);
          const closeBtn = page.getByRole("button", { name: /Zavřít menu/i });
          if (await closeBtn.isVisible().catch(() => false)) {
            await closeBtn.click();
            await page.waitForTimeout(200);
            nav.bodyOverflowAfterClose = await page.evaluate(
              () => document.body.style.overflow
            );
          }
        }
      }
    } catch (e) {
      error = String(e?.message ?? e);
    }
    const bad =
      error ||
      status >= 400 ||
      (overflow &&
        (overflow.scrollDiff > 2 ||
          overflow.offenders.some((o) => o.right - o.vw > 8)));
    results.push({
      path,
      vp: `${vp.w}x${vp.h}`,
      status,
      error,
      scrollDiff: overflow?.scrollDiff,
      offenders: overflow?.offenders?.slice(0, 5),
      nav,
      bad: Boolean(bad),
    });
    await page.close();
  }
}

// Intermediate viewport sweep on critical paths
for (const path of sweepPaths) {
  for (const vp of VIEWPORTS) {
    if (keyViewports.some((k) => k.w === vp.w && k.h === vp.h)) continue;
    const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h } });
    try {
      await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded", timeout: 45000 });
      await page.waitForTimeout(400);
      const overflow = await page.evaluate(findOverflowingElements);
      const bad =
        overflow.scrollDiff > 2 ||
        overflow.offenders.some((o) => o.right - o.vw > 8);
      if (bad) {
        results.push({
          path,
          vp: `${vp.w}x${vp.h}`,
          status: 200,
          scrollDiff: overflow.scrollDiff,
          offenders: overflow.offenders.slice(0, 5),
          bad: true,
          sweep: true,
        });
      }
    } catch (e) {
      results.push({
        path,
        vp: `${vp.w}x${vp.h}`,
        error: String(e?.message ?? e),
        bad: true,
        sweep: true,
      });
    }
    await page.close();
  }
}

await browser.close();

const failures = results.filter((r) => r.bad);
const summary = {
  base: BASE,
  checked: results.length,
  failures: failures.length,
  failureSamples: failures.slice(0, 40),
  navIssues: results.filter(
    (r) =>
      r.nav?.open &&
      r.nav.scrollH > r.nav.clientH + 4 &&
      r.nav.scrolled === false
  ),
  bodyScrollLockLeaks: results.filter(
    (r) => r.nav && r.nav.bodyOverflowAfterClose === "hidden"
  ),
};

writeFileSync(
  new URL("./responsive-qa-report.json", import.meta.url),
  JSON.stringify(summary, null, 2)
);
console.log(JSON.stringify(summary, null, 2));
process.exit(failures.length ? 1 : 0);
