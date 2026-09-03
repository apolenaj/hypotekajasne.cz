/**
 * Playwright smoke: desktop disclosure nav must mount a real panel on click.
 * Usage: E2E_BASE_URL=https://www.hypotekajasne.cz node scripts/e2e-nav-disclosure.mjs
 *        (or against local `npm run start`)
 */
import { chromium } from "playwright";

const baseArg = process.argv.find((a) => a.startsWith("--base="))?.slice(7);
const BASE = (baseArg || process.env.E2E_BASE_URL || "http://127.0.0.1:3010").replace(
  /\/$/,
  ""
);

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];

  try {
    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await page.waitForSelector('[data-desktop-nav]', { timeout: 30_000 });

    const btn = page.locator('[data-nav-disclosure="hypoteky"]');
    await btn.waitFor({ state: "visible" });

    const controls = await btn.getAttribute("aria-controls");
    if (!controls) errors.push("Hypotéky missing aria-controls");

    const panelBefore = page.locator(`[data-nav-panel="hypoteky"]`);
    await panelBefore.waitFor({ state: "attached" });
    const existsBefore = await page.evaluate((id) => !!document.getElementById(id), controls);
    if (!existsBefore) {
      errors.push(`aria-controls target #${controls} missing before open`);
    }

    const expandedBefore = await btn.getAttribute("aria-expanded");
    if (expandedBefore !== "false") {
      errors.push(`expected aria-expanded=false before click, got ${expandedBefore}`);
    }

    await btn.click();
    await page.waitForTimeout(150);

    const expandedAfter = await btn.getAttribute("aria-expanded");
    if (expandedAfter !== "true") {
      errors.push(`expected aria-expanded=true after click, got ${expandedAfter}`);
    }

    const linkCount = await panelBefore.locator("a").count();
    if (linkCount < 3) {
      errors.push(`Hypotéky panel should list links, got ${linkCount}`);
    }

    const hidden = await panelBefore.getAttribute("hidden");
    if (hidden !== null) {
      errors.push("open panel still has hidden attribute");
    }

    await page.keyboard.press("Escape");
    await page.waitForTimeout(100);
    const afterEsc = await btn.getAttribute("aria-expanded");
    if (afterEsc !== "false") {
      errors.push(`Escape should close panel, aria-expanded=${afterEsc}`);
    }

    // Open Investice exclusively
    await btn.click();
    await page.locator('[data-nav-disclosure="investice"]').click();
    await page.waitForTimeout(100);
    const hypoOpen = await btn.getAttribute("aria-expanded");
    const invOpen = await page
      .locator('[data-nav-disclosure="investice"]')
      .getAttribute("aria-expanded");
    if (hypoOpen !== "false" || invOpen !== "true") {
      errors.push(`exclusive open failed: hypoteky=${hypoOpen} investice=${invOpen}`);
    }
  } catch (err) {
    errors.push(err instanceof Error ? err.message : String(err));
  } finally {
    await browser.close();
  }

  if (errors.length) {
    console.error("e2e-nav-disclosure FAILED");
    for (const e of errors) console.error(" -", e);
    process.exit(1);
  }
  console.log("e2e-nav-disclosure OK against", BASE);
}

main();
