import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 650 } });
await page.goto("https://www.hypotekajasne.cz/", {
  waitUntil: "networkidle",
  timeout: 60000,
});
await page.waitForTimeout(2000);

const info = await page.evaluate(() => {
  const se = document.scrollingElement;
  const html = document.documentElement;
  const body = document.body;

  // Try multiple scroll methods
  const attempts = [];
  const tryScroll = (label, fn) => {
    const before = window.scrollY;
    fn();
    attempts.push({
      label,
      before,
      after: window.scrollY,
      seScrollTop: se?.scrollTop ?? null,
      htmlScrollTop: html.scrollTop,
      bodyScrollTop: body.scrollTop,
    });
  };

  tryScroll("window.scrollTo(0,500)", () => window.scrollTo(0, 500));
  tryScroll("scrollingElement.scrollTop=500", () => {
    if (se) se.scrollTop = 500;
  });
  tryScroll("html.scrollTop=500", () => {
    html.scrollTop = 500;
  });
  tryScroll("body.scrollTop=500", () => {
    body.scrollTop = 500;
  });
  tryScroll("scrollBy", () => window.scrollBy(0, 300));

  // Find fixed/sticky overlays covering viewport
  const covers = [];
  for (const el of document.querySelectorAll("*")) {
    const cs = getComputedStyle(el);
    if (cs.position !== "fixed" && cs.position !== "sticky") continue;
    const r = el.getBoundingClientRect();
    if (r.width < 100 || r.height < 100) continue;
    covers.push({
      tag: el.tagName,
      id: el.id,
      cls: (el.className || "").toString().slice(0, 120),
      pos: cs.position,
      overflow: cs.overflow,
      overflowY: cs.overflowY,
      touchAction: cs.touchAction,
      pointerEvents: cs.pointerEvents,
      z: cs.zIndex,
      top: r.top,
      h: r.height,
      w: r.width,
    });
  }

  return {
    scrollingElement: se?.tagName ?? null,
    htmlOverflow: getComputedStyle(html).overflow,
    htmlOverflowY: getComputedStyle(html).overflowY,
    htmlOverscroll: getComputedStyle(html).overscrollBehavior,
    bodyOverflow: getComputedStyle(body).overflow,
    bodyOverflowY: getComputedStyle(body).overflowY,
    bodyPosition: getComputedStyle(body).position,
    bodyOverscroll: getComputedStyle(body).overscrollBehavior,
    attempts,
    covers: covers.slice(0, 20),
    bodyStyleAttr: body.getAttribute("style"),
    htmlStyleAttr: html.getAttribute("style"),
  };
});

console.log(JSON.stringify(info, null, 2));
await browser.close();
