import { chromium } from "playwright";

async function probe(url, label) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 650 } });
  await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(800);

  const prog = await page.evaluate(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    window.scrollTo({ top: 900, behavior: "instant" });
    return {
      y: window.scrollY,
      htmlClass: document.documentElement.className.includes("h-full")
        ? "has-h-full"
        : document.documentElement.className.includes("min-h-full")
          ? "has-min-h-full"
          : "other",
      htmlHeight: getComputedStyle(document.documentElement).height,
      htmlOverflowY: getComputedStyle(document.documentElement).overflowY,
      scrollH: document.documentElement.scrollHeight,
      clientH: document.documentElement.clientHeight,
    };
  });

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  const client = await page.context().newCDPSession(page);
  await client.send("Input.dispatchMouseEvent", {
    type: "mouseWheel",
    x: 640,
    y: 320,
    deltaX: 0,
    deltaY: 700,
  });
  await page.waitForTimeout(250);
  const wheelY = await page.evaluate(() => window.scrollY);

  // Can we reach content below hero?
  await page.evaluate(() =>
    window.scrollTo({ top: 2500, behavior: "instant" }),
  );
  await page.waitForTimeout(100);
  const deep = await page.evaluate(() => {
    const paths = document.getElementById("situace-cesty");
    const r = paths?.getBoundingClientRect();
    return {
      y: window.scrollY,
      pathsTop: r?.top ?? null,
      pathsInView: r ? r.top < window.innerHeight && r.bottom > 0 : false,
    };
  });

  console.log("\n===", label, "===");
  console.log("programmatic", prog);
  console.log("wheelY", wheelY);
  console.log("deep", deep);
  await browser.close();
}

await probe("http://127.0.0.1:3456/", "LOCAL FIX");
await probe("https://www.hypotekajasne.cz/", "PRODUCTION CURRENT");
