/**
 * Viewport screenshots + CTA prefill checks for „Nabídky dalších bank“.
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = (process.env.E2E_BASE_URL || "http://127.0.0.1:3000").replace(
  /\/$/,
  ""
);
const OUT = join(process.cwd(), "tmp", "visual-pending-banks");
mkdirSync(OUT, { recursive: true });

const URL = `${BASE}/sazby?purpose=purchase&fixationMonths=36&property=6000000&loan=4800000&equity=1200000&termYears=30`;

const VIEWPORTS = [
  { name: "mobile-390", width: 390, height: 844 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1440", width: 1440, height: 900 },
];

const BANKS = [
  "ČSOB",
  "Česká spořitelna",
  "Raiffeisenbank",
  "Oberbank",
];

async function checkPrefills(page, section) {
  const results = {};
  for (const bank of BANKS) {
    await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(1200);
    const heading = page.getByRole("heading", {
      name: "Nabídky dalších bank",
    });
    await heading.scrollIntoViewIfNeeded();
    const liveSection = heading.locator(
      "xpath=ancestor::div[contains(@class,'mt-10')][1]"
    );
    const card = liveSection.locator("article").filter({ hasText: bank }).first();
    await card.getByRole("button", { name: "Zjistit nabídku" }).click();
    await page.waitForTimeout(700);
    const after = await page.locator("body").innerText();
    const selected =
      after.includes(bank) &&
      (after.includes("Vybráno") ||
        after.includes("poptávk") ||
        after.includes("Poptáv") ||
        after.includes("Nezávazná poptávka"));
    // Avoid false positives from another bank remaining selected.
    const wrongOther = BANKS.filter((b) => b !== bank).some((other) =>
      new RegExp(`Vybráno[\\s\\S]{0,80}${other}|${other}[\\s\\S]{0,40}Vybráno`).test(
        after
      )
    );
    results[bank] = selected && !wrongOther;
  }
  return results;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const report = { base: BASE, at: new Date().toISOString(), shots: [] };

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
    });
    const page = await context.newPage();
    const res = await page.goto(URL, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    await page.waitForTimeout(2000);

    const heading = page.getByRole("heading", {
      name: "Nabídky dalších bank",
    });
    await heading.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);

    const section = heading.locator(
      "xpath=ancestor::div[contains(@class,'mt-10')][1]"
    );
    const body = (await page.locator("body").innerText()).replace(/\s+/g, " ");
    const leaks = [
      "plná matice",
      "číselného žebříčku",
      "bez scrapu",
      "nenahrazujeme údajem z jiné fixace",
    ].filter((w) => body.toLowerCase().includes(w.toLowerCase()));

    const ctaCount = await section
      .getByRole("button", { name: "Zjistit nabídku" })
      .count();
    const detailsCount = await section
      .getByRole("button", { name: /Podmínky a zdroj|Podrobnosti/ })
      .count();

    const firstDetails = section
      .getByRole("button", { name: /Podmínky a zdroj|Podrobnosti/ })
      .first();
    if ((await firstDetails.count()) > 0) {
      await firstDetails.focus();
      await firstDetails.press("Enter");
      await page.waitForTimeout(200);
    }

    // Snapshot with one details panel open (ČS conditions link if present).
    const csDetails = section.getByRole("button", { name: "Podmínky a zdroj" });
    if ((await csDetails.count()) > 0) {
      await csDetails.click();
      await page.waitForTimeout(200);
    }

    const fullShot = join(OUT, `${vp.name}-full.png`);
    const sectionShot = join(OUT, `${vp.name}-section.png`);
    await page.screenshot({ path: fullShot, fullPage: true });
    if ((await section.count()) > 0) {
      await section.screenshot({ path: sectionShot });
    }

    const prefills = await checkPrefills(page, section);
    const prefillOk = BANKS.every((b) => prefills[b] === true);

    report.shots.push({
      viewport: vp,
      status: res?.status() ?? 0,
      hasHeading: (await heading.count()) > 0,
      ctaCount,
      detailsCount,
      leaks,
      prefills,
      prefillOk,
      fullShot,
      sectionShot,
      overflowX: await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 1
      ),
    });

    await context.close();
  }

  await browser.close();
  writeFileSync(join(OUT, "report.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  const bad = report.shots.filter(
    (s) =>
      !s.hasHeading ||
      s.ctaCount < 4 ||
      s.leaks.length > 0 ||
      s.overflowX ||
      !s.prefillOk
  );
  if (bad.length) {
    console.error("FAIL viewports:", bad.map((b) => b.viewport.name).join(", "));
    process.exit(1);
  }
  console.log("PENDING_BANKS_VISUAL_OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
