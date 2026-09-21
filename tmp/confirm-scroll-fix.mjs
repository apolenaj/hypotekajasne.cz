import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 650 } });
await page.goto("https://www.hypotekajasne.cz/", {
  waitUntil: "networkidle",
  timeout: 60000,
});

const before = await page.evaluate(() => {
  window.scrollTo(0, 500);
  return window.scrollY;
});

await page.addStyleTag({
  content: `
    html {
      height: auto !important;
      min-height: 100% !important;
      overflow-x: hidden !important;
      overflow-y: auto !important;
    }
    body {
      overflow-x: hidden !important;
      overflow-y: visible !important;
      min-height: 100% !important;
      height: auto !important;
    }
  `,
});

const after = await page.evaluate(() => {
  window.scrollTo(0, 0);
  const a = window.scrollY;
  window.scrollTo(0, 500);
  const b = window.scrollY;
  window.scrollTo(0, document.documentElement.scrollHeight);
  const c = window.scrollY;
  return {
    a,
    b,
    c,
    htmlH: getComputedStyle(document.documentElement).height,
    htmlOverflowY: getComputedStyle(document.documentElement).overflowY,
    canScroll: c > 100,
  };
});

console.log("beforeInjectScrollY", before);
console.log("afterInject", after);
await browser.close();
