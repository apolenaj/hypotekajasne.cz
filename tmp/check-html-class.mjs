import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });

for (const [label, url] of [
  ["LOCAL", "http://127.0.0.1:3456/"],
  ["PROD", "https://www.hypotekajasne.cz/"],
]) {
  const page = await browser.newPage({ viewport: { width: 1366, height: 650 } });
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(1500);
  const info = await page.evaluate(() => {
    const html = document.documentElement;
    return {
      className: html.className,
      hasExactHFull: /\bh-full\b/.test(html.className),
      hasMinHFull: /\bmin-h-full\b/.test(html.className),
      height: getComputedStyle(html).height,
      minHeight: getComputedStyle(html).minHeight,
      overflowY: getComputedStyle(html).overflowY,
      overflowX: getComputedStyle(html).overflowX,
      scrollY0: window.scrollY,
    };
  });
  await page.evaluate(() =>
    window.scrollTo({ top: 1500, behavior: "instant" }),
  );
  await page.waitForTimeout(100);
  info.scrollY1500 = await page.evaluate(() => window.scrollY);
  console.log(label, info);
  await page.close();
}
await browser.close();
