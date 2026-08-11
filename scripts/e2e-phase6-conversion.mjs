/**
 * Phase 6 conversion funnel Playwright E2E.
 *
 * Usage:
 *   E2E_BASE_URL=http://127.0.0.1:3000 npm run test:e2e-phase6-conversion
 *   E2E_BASE_URL=https://www.hypotekajasne.cz npm run test:e2e-phase6-conversion
 *
 * Optional controlled lead (once):
 *   E2E_SUBMIT_LEAD=1 E2E_BASE_URL=... npm run test:e2e-phase6-conversion
 * Then delete with:
 *   E2E_DELETE_TEST_LEAD=1 npx tsx scripts/delete-phase6-e2e-lead.ts
 */
import { chromium } from "playwright";

const BASE = (process.env.E2E_BASE_URL || "http://127.0.0.1:3000").replace(
  /\/$/,
  ""
);
const SUBMIT_LEAD = process.env.E2E_SUBMIT_LEAD === "1";
const TEST_EMAIL = "phase6-conversion-e2e@example.com";
const TEST_NAME = "PHASE6 CONVERSION E2E TEST";
const TEST_PHONE = "+420777000999";

let failed = 0;

function assert(cond, msg) {
  if (!cond) {
    console.error("FAIL:", msg);
    failed += 1;
  } else {
    console.log("PASS:", msg);
  }
}

async function acceptCookiesIfPresent(page) {
  const btn = page.getByRole("button", {
    name: /Souhlasím|Přijmout|Accept|Povolit vše/i,
  });
  if (await btn.count()) {
    try {
      await btn.first().click({ timeout: 2000 });
    } catch {
      /* optional */
    }
  }
}

async function checkNoHorizontalOverflow(page, label) {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return doc.scrollWidth > doc.clientWidth + 2;
  });
  assert(!overflow, `${label}: no horizontal overflow`);
}

/** Landing hero CTAs — exclude sticky site nav (hover:bg-deep-teal/5 matches naive selectors). */
function heroCta(page, name) {
  return page
    .locator("header:not([data-site-header])")
    .getByRole("link", { name, exact: true });
}

async function runViewport(browser, viewport, label) {
  const context = await browser.newContext({
    viewport,
    locale: "cs-CZ",
  });
  const page = await context.newPage();

  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await acceptCookiesIfPresent(page);

  const situations = [
    {
      label: "Refinancuji hypotéku",
      path: "/temata/refinancovani",
      primaryLabel: "Prověřit refinancování",
      primaryHrefPart: "purpose=refinance",
      secondaryLabel: "Nezávazná poptávka",
      secondaryHrefPart: "#poptavka",
    },
    {
      label: "Jsem OSVČ",
      path: "/temata/hypoteka-osvc",
      primaryLabel: "Prověřit hypotéku pro OSVČ",
      primaryHrefPart: "#poptavka",
      secondaryLabel: "Spustit diagnostiku",
      secondaryHrefPart: "intent=osvc",
      forbid: "osvc_pausal",
    },
    {
      label: "Mám příjem ze zahraničí",
      path: "/temata/hypoteka-ze-zahranicniho-prijmu",
      primaryLabel: "Prověřit hypotéku se zahraničním příjmem",
      primaryHrefPart: "#poptavka",
      secondaryLabel: "Orientační diagnostika",
      secondaryHrefPart: "intent=foreign_income",
    },
    {
      label: "Investiční nemovitost",
      path: "/temata/investicni-hypoteka",
      primaryLabel: "Prověřit financování investice",
      primaryHrefPart: "#poptavka",
      secondaryLabel: "Spustit Investiční rentgen",
      secondaryHrefPart: "investicni-rentgen",
    },
    {
      label: "Americká hypotéka",
      path: "/temata/americka-hypoteka",
      primaryLabel: "Prověřit americkou hypotéku",
      primaryHrefPart: "#poptavka",
      secondaryLabel: "Příklady zveřejněných podmínek",
      secondaryHrefPart: "#priklady-bank-americka",
      forbidCalc: true,
    },
  ];

  for (const s of situations) {
    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
    const link = page.getByRole("link", { name: s.label });
    assert((await link.count()) > 0, `${label} homepage has ${s.path} entry`);
    await link.first().click();
    await page.waitForURL(`**${s.path}**`, { timeout: 15000 });
    assert(page.url().includes(s.path), `${label} navigated to ${s.path}`);
    await checkNoHorizontalOverflow(page, `${label} ${s.path}`);

    const byline = await page
      .locator("header:not([data-site-header])")
      .innerText();
    assert(
      !/Autor:\s*Michal\b/i.test(byline),
      `${label} ${s.path} no false Michal authorship`
    );
    assert(
      /Redakce Hypot/i.test(byline),
      `${label} ${s.path} Redakce byline`
    );

    const heroPrimary = heroCta(page, s.primaryLabel);
    assert(
      (await heroPrimary.count()) > 0,
      `${label} ${s.path} has primary CTA «${s.primaryLabel}»`
    );
    const primaryHref = await heroPrimary.first().getAttribute("href");
    assert(
      primaryHref && primaryHref.includes(s.primaryHrefPart),
      `${label} ${s.path} primary CTA → ${s.primaryHrefPart} (got ${primaryHref})`
    );

    if (s.secondaryLabel) {
      const secondary = heroCta(page, s.secondaryLabel);
      assert(
        (await secondary.count()) > 0,
        `${label} ${s.path} has secondary CTA «${s.secondaryLabel}»`
      );
      const secondaryHref = await secondary.first().getAttribute("href");
      assert(
        secondaryHref && secondaryHref.includes(s.secondaryHrefPart),
        `${label} ${s.path} secondary CTA → ${s.secondaryHrefPart} (got ${secondaryHref})`
      );
    }

    const html = await page.content();
    if (s.forbid) {
      assert(!html.includes(s.forbid), `${label} ${s.path} forbids ${s.forbid}`);
    }
    if (s.forbidCalc) {
      assert(
        !html.includes("/kalkulacky/hypotecni"),
        `${label} American page has no generic calculator path`
      );
    }

    const lead = page.locator("#poptavka");
    assert((await lead.count()) > 0, `${label} ${s.path} has #poptavka`);
  }

  // Refinance rates path
  await page.goto(`${BASE}/temata/refinancovani`, {
    waitUntil: "domcontentloaded",
  });
  await heroCta(page, "Prověřit refinancování").first().click();
  await page.waitForURL("**/sazby**", { timeout: 15000 });
  assert(
    page.url().includes("purpose=refinance"),
    `${label} refinance rates keep purpose`
  );

  // OSVC diagnostic intent
  await page.goto(`${BASE}/temata/hypoteka-osvc`, {
    waitUntil: "domcontentloaded",
  });
  await heroCta(page, "Spustit diagnostiku").first().click();
  await page.waitForURL("**/moje-moznosti**", { timeout: 15000 });
  assert(page.url().includes("intent=osvc"), `${label} OSVC diagnostic intent`);
  assert(!page.url().includes("osvc_pausal"), `${label} OSVC no pausal forced`);
  const diagHtml = await page.content();
  assert(
    /OSVČ|paušál|daňová evidence|Nejsem si jistý|Jiný/i.test(diagHtml) ||
      /Situace: hypotéka pro OSVČ/i.test(diagHtml),
    `${label} OSVC diagnostic shows regime choice or hint`
  );

  // Foreign diagnostic
  await page.goto(`${BASE}/temata/hypoteka-ze-zahranicniho-prijmu`, {
    waitUntil: "domcontentloaded",
  });
  await heroCta(page, "Orientační diagnostika").first().click();
  await page.waitForURL("**/moje-moznosti**", { timeout: 15000 });
  assert(
    page.url().includes("intent=foreign_income"),
    `${label} foreign diagnostic intent`
  );
  assert(!page.url().includes("hypoteka-v-zahranici"), `${label} not buy-abroad`);

  // Investment secondary rentgen
  await page.goto(`${BASE}/temata/investicni-hypoteka`, {
    waitUntil: "domcontentloaded",
  });
  await heroCta(page, "Spustit Investiční rentgen").first().click();
  await page.waitForURL("**/investicni-rentgen**", { timeout: 15000 });
  assert(
    page.url().includes("/investicni-rentgen"),
    `${label} Rentgen secondary works`
  );

  // American section anchor
  await page.goto(`${BASE}/temata/americka-hypoteka`, {
    waitUntil: "domcontentloaded",
  });
  await heroCta(page, "Příklady zveřejněných podmínek").first().click();
  await page.waitForTimeout(500);
  assert(
    page.url().includes("#priklady-bank-americka") ||
      (await page.locator("#priklady-bank-americka").count()) > 0,
    `${label} American secondary section`
  );

  if (SUBMIT_LEAD && label === "desktop") {
    await page.goto(`${BASE}/temata/hypoteka-osvc`, {
      waitUntil: "domcontentloaded",
    });
    await acceptCookiesIfPresent(page);
    await page.locator("#poptavka").scrollIntoViewIfNeeded();
    await page.locator("#poptavka input").nth(0).fill(TEST_NAME);
    await page.locator('#poptavka input[type="email"]').fill(TEST_EMAIL);
    await page.locator('#poptavka input[type="tel"]').fill(TEST_PHONE);
    const privacy = page.locator("#poptavka input[type='checkbox']").first();
    if (await privacy.count()) await privacy.check();
    await Promise.all([
      page.waitForURL("**/dekujeme**", { timeout: 20000 }).catch(() => null),
      page.locator("#poptavka button[type='submit']").click(),
    ]);
    const ok =
      page.url().includes("/dekujeme") ||
      (await page.locator("text=/děkuj|odesláno|úspěš/i").count()) > 0;
    assert(ok, `${label} controlled lead submit reached thank-you/success`);
  }

  await context.close();
}

async function main() {
  console.log("E2E Phase 6 conversion against", BASE);
  const browser = await chromium.launch({ headless: true });
  try {
    await runViewport(browser, { width: 1440, height: 900 }, "desktop");
    await runViewport(browser, { width: 390, height: 844 }, "mobile");
  } finally {
    await browser.close();
  }
  if (failed > 0) {
    console.error(`\n${failed} assertion(s) failed`);
    process.exit(1);
  }
  console.log("\nAll Phase 6 conversion E2E assertions passed");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
