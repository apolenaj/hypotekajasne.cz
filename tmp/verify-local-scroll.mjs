import { chromium } from "playwright";

const base = "http://127.0.0.1:3456/";
const cases = [
  { w: 1920, h: 1080, zoom: 1 },
  { w: 1366, h: 768, zoom: 1 },
  { w: 1280, h: 720, zoom: 1 },
  { w: 1280, h: 650, zoom: 1 },
  { w: 1366, h: 650, zoom: 1 },
  { w: 1280, h: 800, zoom: 1.25 },
  { w: 1280, h: 800, zoom: 1.5 },
  { w: 390, h: 844, zoom: 1 },
  { w: 768, h: 1024, zoom: 1 },
];

const browser = await chromium.launch({ headless: true });
let failed = 0;

for (const c of cases) {
  const page = await browser.newPage({
    viewport: { width: c.w, height: c.h },
    deviceScaleFactor: c.zoom,
  });
  await page.goto(base, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(800);

  const result = await page.evaluate(async () => {
    window.scrollTo(0, 0);
    const start = window.scrollY;
    window.scrollBy(0, 600);
    const mid = window.scrollY;
    window.scrollTo(0, document.documentElement.scrollHeight);
    const bottom = window.scrollY;
    const calc = document.getElementById("hero-calculator");
    const calcBottom = calc?.getBoundingClientRect().bottom ?? 0;
    const html = document.documentElement;
    return {
      start,
      mid,
      bottom,
      docH: html.scrollHeight,
      clientH: html.clientHeight,
      htmlHeight: getComputedStyle(html).height,
      htmlOverflowY: getComputedStyle(html).overflowY,
      canScroll: mid > 50 || bottom > 50,
      calcBottomAtTop: (() => {
        window.scrollTo(0, 0);
        return calc?.getBoundingClientRect().bottom ?? 0;
      })(),
      viewport: window.innerHeight,
    };
  });

  const ok = result.canScroll && result.docH > result.clientH;
  if (!ok) failed++;
  console.log(
    `${ok ? "OK" : "FAIL"} ${c.w}x${c.h} zoom=${c.zoom} mid=${result.mid} bottom=${result.bottom} doc=${Math.round(result.docH)} client=${result.clientH} overflowY=${result.htmlOverflowY} calcBottom@top=${Math.round(result.calcBottomAtTop)}`,
  );
  await page.close();
}

await browser.close();
process.exit(failed ? 1 : 0);
