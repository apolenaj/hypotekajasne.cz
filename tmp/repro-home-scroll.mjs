import { chromium } from "playwright";

const viewports = [
  { w: 1366, h: 768 },
  { w: 1280, h: 720 },
  { w: 1280, h: 650 },
  { w: 1366, h: 650 },
  { w: 1920, h: 1080 },
];

const browser = await chromium.launch({ headless: true });

for (const vp of viewports) {
  const page = await browser.newPage({
    viewport: { width: vp.w, height: vp.h },
  });
  await page.goto("https://www.hypotekajasne.cz/", {
    waitUntil: "networkidle",
    timeout: 60000,
  });
  await page.waitForTimeout(1500);

  const metrics = await page.evaluate(() => {
    const html = document.documentElement;
    const body = document.body;
    const hero = document.querySelector('[aria-labelledby="home-hero-heading"]');
    const calc = document.getElementById("hero-calculator");
    const cs = (el) => (el ? getComputedStyle(el) : null);
    const hcs = cs(html);
    const bcs = cs(body);
    const heroCs = cs(hero);
    const main = document.querySelector("main");
    const mcs = cs(main);

    const before = window.scrollY;
    window.scrollBy(0, 400);
    const afterScrollBy = window.scrollY;
    window.scrollTo(0, 0);
    // wheel simulation via scrollTo large
    window.scrollTo(0, document.body.scrollHeight);
    const atBottom = window.scrollY;

    return {
      innerH: window.innerHeight,
      docH: Math.max(
        body.scrollHeight,
        html.scrollHeight,
        body.offsetHeight,
        html.offsetHeight,
      ),
      bodyScrollH: body.scrollHeight,
      htmlScrollH: html.scrollHeight,
      bodyClientH: body.clientHeight,
      htmlClientH: html.clientHeight,
      htmlOverflow: hcs?.overflow,
      htmlOverflowY: hcs?.overflowY,
      htmlHeight: hcs?.height,
      bodyOverflow: bcs?.overflow,
      bodyOverflowY: bcs?.overflowY,
      bodyHeight: bcs?.height,
      bodyMinHeight: bcs?.minHeight,
      bodyDisplay: bcs?.display,
      mainOverflow: mcs?.overflow,
      mainHeight: mcs?.height,
      mainOverflowY: mcs?.overflowY,
      heroOverflow: heroCs?.overflow,
      heroHeight: heroCs?.height,
      heroClientH: hero?.clientHeight ?? null,
      calcH: calc?.getBoundingClientRect().height ?? null,
      calcBottom: calc?.getBoundingClientRect().bottom ?? null,
      scrollBefore: before,
      scrollAfterScrollBy400: afterScrollBy,
      scrollAtBottom: atBottom,
      canScroll: atBottom > 10,
      bodyInlineOverflow: body.style.overflow,
    };
  });

  console.log(`\n=== ${vp.w}x${vp.h} ===`);
  console.log(JSON.stringify(metrics, null, 2));
  await page.close();
}

await browser.close();
