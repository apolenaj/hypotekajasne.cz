import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 650 } });

// Patch scroll methods before navigation
await page.addInitScript(() => {
  window.__scrollCalls = [];
  const orig = window.scrollTo.bind(window);
  window.scrollTo = (...args) => {
    window.__scrollCalls.push({
      args: JSON.stringify(args),
      stack: new Error().stack?.split("\n").slice(0, 6).join(" | "),
    });
    return orig(...args);
  };
  Element.prototype.scrollIntoView = new Proxy(Element.prototype.scrollIntoView, {
    apply(target, thisArg, argArray) {
      window.__scrollCalls.push({
        args: "scrollIntoView:" + (thisArg.id || thisArg.tagName),
        stack: new Error().stack?.split("\n").slice(0, 6).join(" | "),
      });
      return Reflect.apply(target, thisArg, argArray);
    },
  });
});

await page.goto("http://127.0.0.1:3456/", { waitUntil: "networkidle" });
await page.waitForTimeout(500);

await page.evaluate(() => window.scrollTo({ top: 1200, behavior: "instant" }));
await page.waitForTimeout(100);
const y1 = await page.evaluate(() => window.scrollY);

await page.waitForTimeout(2000);
const y2 = await page.evaluate(() => ({
  y: window.scrollY,
  calls: window.__scrollCalls?.slice(-15),
}));

console.log("yAfterInstant", y1);
console.log("yAfter2s", y2);

// Wheel once and wait 2s
const client = await page.context().newCDPSession(page);
await client.send("Input.dispatchMouseEvent", {
  type: "mouseWheel",
  x: 640,
  y: 300,
  deltaX: 0,
  deltaY: 800,
});
await page.waitForTimeout(100);
const y3 = await page.evaluate(() => window.scrollY);
await page.waitForTimeout(2000);
const y4 = await page.evaluate(() => ({
  y: window.scrollY,
  calls: window.__scrollCalls?.slice(-20),
}));
console.log("yAfterWheel", y3);
console.log("yAfterWheel2s", y4);

await browser.close();
