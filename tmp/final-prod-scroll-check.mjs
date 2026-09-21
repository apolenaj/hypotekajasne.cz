import { chromium } from "playwright";

const cases = [
  { w: 1920, h: 1080 },
  { w: 1366, h: 768 },
  { w: 1280, h: 720 },
  { w: 1280, h: 650 },
  { w: 1366, h: 650 },
  { w: 390, h: 844 },
  { w: 768, h: 1024 },
];

const browser = await chromium.launch({ headless: true });
let failed = 0;

for (const c of cases) {
  const page = await browser.newPage({ viewport: { width: c.w, height: c.h } });
  await page.goto("https://www.hypotekajasne.cz/", {
    waitUntil: "networkidle",
    timeout: 60000,
  });
  await page.waitForTimeout(600);

  const prog = await page.evaluate(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    window.scrollTo({ top: 1200, behavior: "instant" });
    return window.scrollY;
  });

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  const client = await page.context().newCDPSession(page);
  await client.send("Input.dispatchMouseEvent", {
    type: "mouseWheel",
    x: Math.min(600, c.w / 2),
    y: Math.min(300, c.h / 2),
    deltaX: 0,
    deltaY: 800,
  });
  await page.waitForTimeout(200);
  const wheel = await page.evaluate(() => window.scrollY);

  await page.evaluate(() =>
    window.scrollTo({ top: 3000, behavior: "instant" }),
  );
  const deep = await page.evaluate(() => {
    const el = document.getElementById("situace-cesty");
    const r = el?.getBoundingClientRect();
    return {
      y: window.scrollY,
      pathsInView: !!(r && r.top < window.innerHeight && r.bottom > 0),
      htmlOverflowY: getComputedStyle(document.documentElement).overflowY,
      hasMinH: /\bmin-h-full\b/.test(document.documentElement.className),
      hasLockedHFull: /playfair[^"]* h-full /.test(
        document.documentElement.className + " ",
      ),
    };
  });

  const ok = prog >= 1000 && wheel > 100 && deep.y >= 1000 && !deep.hasLockedHFull;
  if (!ok) failed++;
  console.log(
    `${ok ? "OK" : "FAIL"} ${c.w}x${c.h} prog=${prog} wheel=${wheel} deepY=${deep.y} paths=${deep.pathsInView} overflowY=${deep.htmlOverflowY}`,
  );
  await page.close();
}

await browser.close();
process.exit(failed ? 1 : 0);
