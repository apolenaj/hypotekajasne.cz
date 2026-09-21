import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 650 } });
await page.goto("http://127.0.0.1:3456/", { waitUntil: "networkidle" });
await page.waitForTimeout(500);

// Listen for scroll resets
await page.evaluate(() => {
  window.__scrollLog = [];
  window.addEventListener(
    "scroll",
    () => {
      window.__scrollLog.push(window.scrollY);
    },
    { passive: true },
  );
});

await page.evaluate(() => window.scrollTo({ top: 900, behavior: "instant" }));
await page.waitForTimeout(200);
const instant = await page.evaluate(() => ({
  y: window.scrollY,
  log: window.__scrollLog.slice(-5),
}));

await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(100);

const client = await page.context().newCDPSession(page);
for (let i = 0; i < 3; i++) {
  await client.send("Input.dispatchMouseEvent", {
    type: "mouseWheel",
    x: 640,
    y: 300,
    deltaX: 0,
    deltaY: 400,
  });
  await page.waitForTimeout(100);
}

const afterWheels = await page.evaluate(() => ({
  y: window.scrollY,
  log: window.__scrollLog.slice(-10),
  calcVisible: (() => {
    const el = document.getElementById("hero-calculator");
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.bottom <= window.innerHeight && r.top >= 0
      ? "fully"
      : r.top < window.innerHeight && r.bottom > 0
        ? "partial"
        : "off";
  })(),
  belowFoldVisible: (() => {
    const el = document.getElementById("situace-cesty");
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.top < window.innerHeight;
  })(),
}));

console.log("instantScrollTo", instant);
console.log("afterWheels", afterWheels);

// Production comparison with same CDP method
await page.goto("https://www.hypotekajasne.cz/", { waitUntil: "networkidle" });
await page.waitForTimeout(800);
const client2 = await page.context().newCDPSession(page);
await client2.send("Input.dispatchMouseEvent", {
  type: "mouseWheel",
  x: 640,
  y: 300,
  deltaX: 0,
  deltaY: 500,
});
await page.waitForTimeout(200);
const prod = await page.evaluate(() => window.scrollY);
console.log("productionAfterWheel", prod);

await browser.close();
