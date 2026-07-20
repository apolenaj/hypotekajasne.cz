/**
 * Fast responsive overflow audit.
 * Usage: node scripts/responsive-audit.mjs
 */
import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = process.env.AUDIT_BASE || "http://localhost:3000";

const VIEWPORTS = [
  [320, 568],
  [360, 640],
  [375, 667],
  [390, 844],
  [430, 932],
  [768, 1024],
  [820, 1180],
  [1024, 768],
  [1280, 720],
  [1366, 768],
  [1440, 900],
  [1536, 864],
  [1920, 1080],
  [2560, 1440],
];

const ROUTES = [
  "/",
  "/investicni-rentgen",
  "/investicni-rentgen/porovnani",
  "/investicni-rentgen/modelar",
  "/investicni-pas",
  "/akademie",
  "/akademie/cesty",
  "/clanky",
  "/metodika",
  "/zdroje",
  "/kalkulacky",
  "/navrh-na-miru",
  "/dashboard",
  "/portfolio",
  "/sledovani",
  "/trhovy-puls",
  "/refinancovani-radar",
  "/profesionalni-portal",
  "/pruvodce-investora",
  "/pruvodce-investora/ceska-republika",
  "/o-majetio",
  "/o-nas",
  "/kontakt",
  "/faq",
  "/copilot",
  "/duvera",
  "/jak-vydelavame",
  "/partneri",
  "/editorial-policy",
  "/pravni/gdpr",
  "/pravni/cookies",
  "/pravni/zasady",
  "/pravni/smlouvy",
  "/pravni/placena-analyza",
  "/financni-pas",
  "/strategie-nabidky",
  "/proverka-nemovitosti",
  "/dokumentovy-trezor",
  "/globalni-financovani",
  "/kalkulacky/koupe-vs-najem",
  "/kalkulacky/historicky-vyvoj",
  "/kalkulacky/potencialni-vyvoj",
  "/hypotecni-akademie",
  "/alerty",
  "/reporty",
  "/transakce",
  "/opravy-a-aktualizace",
];

const FULL_MATRIX_ROUTES = new Set([
  "/",
  "/investicni-rentgen",
  "/investicni-pas",
  "/dashboard",
  "/portfolio",
  "/pruvodce-investora/ceska-republika",
  "/kalkulacky",
  "/navrh-na-miru",
]);

const PRIORITY_VPS = [
  [320, 568],
  [375, 667],
  [390, 844],
  [768, 1024],
  [1024, 768],
  [1280, 720],
  [1920, 1080],
];

async function measurePage(page) {
  return page.evaluate(() => {
    const clientW = document.documentElement.clientWidth;
    const scrollW = Math.max(
      document.documentElement.scrollWidth,
      document.body.scrollWidth
    );
    const offenders = [];
    for (const el of document.querySelectorAll("body *")) {
      if (!(el instanceof HTMLElement)) continue;
      const style = getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden") continue;
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;
      if (r.right > clientW + 3 || r.left < -3) {
        const cls =
          typeof el.className === "string" ? el.className.slice(0, 140) : "";
        offenders.push({
          tag: el.tagName.toLowerCase(),
          id: el.id || undefined,
          cls,
          left: Math.round(r.left),
          right: Math.round(r.right),
          w: Math.round(r.width),
        });
      }
    }
    offenders.sort((a, b) => b.right - a.right);

    // Cookie / consent covering bottom CTAs
    let cookieCoversCta = false;
    const candidates = [...document.querySelectorAll("div, aside, section")].filter(
      (d) => /Přijmout vše|Souhlas s cookies|Nastavení cookies/i.test(d.textContent || "")
    );
    const banner = candidates.sort(
      (a, b) => a.textContent.length - b.textContent.length
    )[0];
    if (banner instanceof HTMLElement) {
      const br = banner.getBoundingClientRect();
      if (br.height > 40 && br.bottom > window.innerHeight - 20) {
        const ctas = [...document.querySelectorAll("a, button")].filter((el) => {
          const t = (el.textContent || "").trim();
          return /Začít|Spustit|Objednat|Pokračovat|Vypočítat|Odeslat|Analyzovat/i.test(
            t
          );
        });
        for (const cta of ctas) {
          const cr = cta.getBoundingClientRect();
          if (
            cr.width > 0 &&
            cr.bottom > br.top &&
            cr.top < br.bottom &&
            cr.right > br.left &&
            cr.left < br.right
          ) {
            cookieCoversCta = true;
            break;
          }
        }
      }
    }

    return {
      clientW,
      scrollW,
      overflowPx: scrollW - clientW,
      hasHScroll: scrollW > clientW + 1,
      offenders: offenders.slice(0, 8),
      cookieCoversCta,
      title: document.title,
    };
  });
}

async function main() {
  console.log("Launching Chromium…");
  const browser = await chromium.launch({ headless: true });
  const findings = [];
  const context = await browser.newContext({
    // Accept cookies storage empty → banner visible
  });
  const page = await context.newPage();
  page.setDefaultTimeout(20000);
  page.setDefaultNavigationTimeout(25000);

  let i = 0;
  for (const route of ROUTES) {
    const vps = FULL_MATRIX_ROUTES.has(route) ? VIEWPORTS : PRIORITY_VPS;
    for (const [w, h] of vps) {
      i += 1;
      process.stdout.write(`[${i}] ${route} ${w}x${h} … `);
      await page.setViewportSize({ width: w, height: h });
      try {
        const res = await page.goto(`${BASE}${route}`, {
          waitUntil: "domcontentloaded",
          timeout: 25000,
        });
        await page.waitForTimeout(350);
        // dismiss any open dialogs that block measure? keep cookie for worst case
        const m = await measurePage(page);
        const status = res?.status() ?? 0;
        console.log(
          status,
          m.hasHScroll ? `HSCROLL +${m.overflowPx}` : "ok",
          m.cookieCoversCta ? "COOKIE_CTA" : ""
        );

        if (status >= 400) {
          findings.push({
            route,
            viewport: `${w}x${h}`,
            problem: `HTTP ${status}`,
            severity: "P2",
            fix: "Ověřit, že route existuje.",
          });
        }
        if (m.hasHScroll) {
          const tip = m.offenders[0]
            ? `${m.offenders[0].tag}${m.offenders[0].id ? "#" + m.offenders[0].id : ""} ${(m.offenders[0].cls || "").split(/\s+/).slice(0, 3).join(".")} right=${m.offenders[0].right}`
            : "neznámý";
          findings.push({
            route,
            viewport: `${w}x${h}`,
            problem: `Horizontální scroll (+${m.overflowPx}px). Offender: ${tip}`,
            severity: w <= 430 ? "P0" : "P1",
            fix: "Root cause: fixed/min-width nebo flex bez min-w-0. Opravit bez overflow-x:hidden na html/body.",
            offenders: m.offenders,
          });
        }
        if (m.cookieCoversCta && w <= 430) {
          findings.push({
            route,
            viewport: `${w}x${h}`,
            problem: "Cookie banner překrývá spodní CTA",
            severity: "P1",
            fix: "padding-bottom na main při otevřeném banneru + max-height scroll banneru.",
          });
        }
      } catch (err) {
        console.log("ERR", err.message);
        findings.push({
          route,
          viewport: `${w}x${h}`,
          problem: `Load error: ${err.message}`,
          severity: "P2",
          fix: "Ověřit server / route.",
        });
      }
    }
  }

  console.log("Zoom 200%…");
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    document.documentElement.style.zoom = "2";
  });
  await page.waitForTimeout(300);
  const zoom = await measurePage(page);
  if (zoom.hasHScroll) {
    findings.push({
      route: "/",
      viewport: "1280x720 @ zoom 200%",
      problem: `Horizontální scroll při zoom 200% (+${zoom.overflowPx}px)`,
      severity: "P1",
      fix: "min-w-0 na flex children; vyhnout se pevným šířkám.",
      offenders: zoom.offenders,
    });
  }
  await page.evaluate(() => {
    document.documentElement.style.zoom = "";
  });

  console.log("Font 150%…");
  await page.addStyleTag({ content: "html { font-size: 150% !important; }" });
  await page.waitForTimeout(250);
  const font = await measurePage(page);
  if (font.hasHScroll) {
    findings.push({
      route: "/",
      viewport: "1280x720 @ font 150%",
      problem: `Horizontální scroll při zvětšení písma (+${font.overflowPx}px)`,
      severity: "P1",
      fix: "Wrap textů, min-w-0, relative units.",
      offenders: font.offenders,
    });
  }

  console.log("Keyboard Tab…");
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await page.setViewportSize({ width: 1280, height: 720 });
  // Accept cookies so nav is usable
  try {
    const accept = page.getByRole("button", { name: /Přijmout vše/i });
    if (await accept.isVisible({ timeout: 1500 })) await accept.click();
  } catch {
    /* no banner */
  }
  let focusedInteractive = 0;
  for (let t = 0; t < 30; t++) {
    await page.keyboard.press("Tab");
    const ok = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return false;
      const tag = el.tagName.toLowerCase();
      return ["a", "button", "input", "select", "textarea"].includes(tag);
    });
    if (ok) focusedInteractive++;
  }
  if (focusedInteractive < 3) {
    findings.push({
      route: "/",
      viewport: "1280x720",
      problem: `Keyboard Tab: jen ${focusedInteractive} interaktivních focusů z 30`,
      severity: "P1",
      fix: "Zkontrolovat focus order / skip link / tabindex.",
    });
  } else {
    findings.push({
      route: "/",
      viewport: "1280x720",
      problem: `Keyboard Tab OK (${focusedInteractive}/30 interaktivních)`,
      severity: "info",
      fix: "—",
    });
  }

  // Mobile nav open check @ 375
  console.log("Mobile nav…");
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  try {
    const menu = page.getByRole("button", { name: /menu|navigace|otevřít/i }).first();
    if (await menu.isVisible({ timeout: 2000 })) {
      await menu.click();
      await page.waitForTimeout(300);
      const navM = await measurePage(page);
      if (navM.hasHScroll) {
        findings.push({
          route: "/",
          viewport: "375x667 (mobile menu open)",
          problem: `Horizontální scroll při otevřeném mobile menu (+${navM.overflowPx}px)`,
          severity: "P0",
          fix: "Mobile drawer: w-full / max-w, min-w-0.",
          offenders: navM.offenders,
        });
      }
    }
  } catch (e) {
    findings.push({
      route: "/",
      viewport: "375x667",
      problem: `Mobile menu: ${e.message}`,
      severity: "P2",
      fix: "Ověřit aria-label hamburgeru.",
    });
  }

  await browser.close();

  const outDir = join(__dirname, "..", "docs");
  mkdirSync(outDir, { recursive: true });
  const jsonPath = join(outDir, "responsive-audit-raw.json");
  writeFileSync(jsonPath, JSON.stringify(findings, null, 2), "utf8");

  const p0 = findings.filter((f) => f.severity === "P0");
  const p1 = findings.filter((f) => f.severity === "P1");
  console.log(
    "\nDONE",
    JSON.stringify(
      {
        total: findings.length,
        p0: p0.length,
        p1: p1.length,
        p0sample: p0.slice(0, 15),
        p1sample: p1.slice(0, 15),
        jsonPath,
      },
      null,
      2
    )
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
