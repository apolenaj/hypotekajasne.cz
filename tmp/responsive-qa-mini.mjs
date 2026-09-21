import { chromium } from "playwright";

const BASE = "http://127.0.0.1:3000";
const cases = [
  ["/", 320, 568],
  ["/", 390, 844],
  ["/", 1024, 600],
  ["/", 1280, 800],
  ["/sazby", 360, 800],
  ["/kalkulacky/hypotecni", 390, 844],
  ["/investicni-rentgen", 390, 844],
  ["/akademie/hypoteky-v-praxi", 390, 844],
  ["/akademie/hypoteky-v-praxi/prvni-hypoteka", 320, 568],
  ["/kontakt", 390, 844],
  ["/navrh-na-miru", 768, 1024],
  ["/pruvodce-investora/ceska-republika", 390, 844],
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
        offenders.push(el.tagName + "." + String(el.className).slice(0, 40));
        if (offenders.length >= 5) break;
      }
    }
  }
  return {
    scrollDiff: doc.scrollWidth - doc.clientWidth,
    canScrollY: doc.scrollHeight > window.innerHeight + 40,
    offenders,
  };
}

const browser = await chromium.launch({ headless: true });
const findings = [];
for (const [path, w, h] of cases) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  const pageErrors = [];
  page.on("pageerror", (e) => pageErrors.push(e.message));
  try {
    await page.goto(BASE + path, { waitUntil: "load", timeout: 60000 });
    await page.waitForTimeout(500);
    // Dismiss cookie if visible (appears after delay on some pages)
    const accept = page.getByRole("button", { name: /Přijmout|Povolit vše|Souhlasím/i });
    if (await accept.isVisible({ timeout: 500 }).catch(() => false)) {
      await accept.click().catch(() => {});
      await page.waitForTimeout(200);
    }
    const m = await page.evaluate(measure);
    let menu = "n/a";
    if (w <= 430) {
      const open = page.getByRole("button", { name: /Otevřít menu/i });
      if (await open.isVisible().catch(() => false)) {
        await open.click();
        await page.waitForTimeout(250);
        const visible = await page.locator("#mobile-nav-drawer a").first().isVisible();
        await page.getByRole("button", { name: /^Zavřít menu$/i }).click();
        await page.waitForTimeout(200);
        const lock = await page.evaluate(() => document.body.style.overflow);
        menu = visible && lock !== "hidden" ? "ok" : `fail visible=${visible} lock=${lock}`;
      }
    }
    const bad =
      m.scrollDiff > 2 ||
      m.offenders.length > 0 ||
      (path === "/" && h <= 650 && !m.canScrollY) ||
      menu.startsWith("fail") ||
      pageErrors.some((e) => /width\(-1\)/i.test(e));
    console.log(
      `${bad ? "FAIL" : "OK"} ${path} ${w}x${h} scrollDiff=${m.scrollDiff} offenders=${m.offenders.length} menu=${menu} chartErr=${pageErrors.filter((e) => /width\(-1\)/i.test(e)).length}`
    );
    if (bad) findings.push({ path, w, h, m, menu, pageErrors: pageErrors.slice(0, 3) });
  } catch (e) {
    console.log(`FAIL ${path} ${w}x${h} ${e.message}`);
    findings.push({ path, w, h, error: e.message });
  }
  await page.close();
}
await browser.close();
console.log("FINDINGS", findings.length);
process.exit(findings.length ? 1 : 0);
