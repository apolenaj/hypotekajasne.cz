import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 650 } });
await page.goto("http://127.0.0.1:3456/", { waitUntil: "networkidle" });
await page.waitForTimeout(1000);

const info = await page.evaluate(() => {
  const html = document.documentElement;
  const body = document.body;
  const se = document.scrollingElement;

  // Force style
  const before = {
    htmlClass: html.className,
    htmlHeight: getComputedStyle(html).height,
    htmlMinHeight: getComputedStyle(html).minHeight,
    htmlOverflowY: getComputedStyle(html).overflowY,
    htmlScrollH: html.scrollHeight,
    htmlClientH: html.clientHeight,
    se: se?.tagName,
    seScrollH: se?.scrollHeight,
    seClientH: se?.clientHeight,
  };

  // Try keyboard PageDown
  document.body.focus();
  const ev = new WheelEvent("wheel", { deltaY: 400, bubbles: true, cancelable: true });
  document.dispatchEvent(ev);

  html.scrollTop = 800;
  se && (se.scrollTop = 800);
  body.scrollTop = 800;

  return {
    before,
    afterScrollTop: {
      windowY: window.scrollY,
      html: html.scrollTop,
      body: body.scrollTop,
      se: se?.scrollTop,
    },
    // Check if something sets overflow hidden after load
    bodyStyle: body.getAttribute("style"),
    htmlStyle: html.getAttribute("style"),
  };
});

console.log(JSON.stringify(info, null, 2));

// Try CDP scroll
const client = await page.context().newCDPSession(page);
await client.send("Input.dispatchMouseEvent", {
  type: "mouseWheel",
  x: 400,
  y: 300,
  deltaX: 0,
  deltaY: 500,
});
await page.waitForTimeout(300);
const afterWheel = await page.evaluate(() => window.scrollY);
console.log("afterCDPWheel", afterWheel);

await browser.close();
