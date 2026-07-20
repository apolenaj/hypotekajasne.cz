/**
 * Focused P0/P1 retest after layout fixes.
 */
import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = process.env.AUDIT_BASE || "http://localhost:3000";

const CASES = [
  ["/", 320, 568],
  ["/", 375, 667],
  ["/", 768, 1024],
  ["/", 1024, 768],
  ["/", 1280, 720],
  ["/", 1920, 1080],
  ["/investicni-rentgen", 320, 568],
  ["/investicni-rentgen", 375, 667],
  ["/investicni-rentgen/modelar", 320, 568],
  ["/investicni-rentgen/modelar", 375, 667],
  ["/investicni-rentgen/modelar", 1024, 768],
  ["/investicni-rentgen/porovnani", 375, 667],
  ["/investicni-pas", 375, 667],
  ["/portfolio", 375, 667],
  ["/dashboard", 375, 667],
  ["/kalkulacky", 320, 568],
  ["/profesionalni-portal", 320, 568],
  ["/profesionalni-portal", 375, 667],
  ["/pruvodce-investora/ceska-republika", 375, 667],
  ["/pruvodce-investora/ceska-republika", 768, 1024],
  ["/trhovy-puls", 375, 667],
  ["/navrh-na-miru", 375, 667],
  ["/copilot", 375, 667],
  ["/dokumentovy-trezor", 375, 667],
  ["/strategie-nabidky", 375, 667],
  ["/proverka-nemovitosti", 375, 667],
  ["/refinancovani-radar", 375, 667],
  ["/akademie", 375, 667],
  ["/clanky", 375, 667],
  ["/faq", 375, 667],
  ["/kontakt", 375, 667],
  ["/o-majetio", 375, 667],
];

async function measure(page) {
  return page.evaluate(() => {
    const clientW = document.documentElement.clientWidth;
    const scrollW = Math.max(
      document.documentElement.scrollWidth,
      document.body.scrollWidth
    );
    const hits = [];
    function walk(el, depth) {
      if (!(el instanceof Element) || depth > 18) return;
      if (el.scrollWidth > el.clientWidth + 2) {
        hits.push({
          tag: el.tagName,
          cls: (el.getAttribute("class") || "").slice(0, 100),
          diff: el.scrollWidth - el.clientWidth,
        });
      }
      for (const c of el.children) walk(c, depth + 1);
    }
    walk(document.body, 0);
    hits.sort((a, b) => b.diff - a.diff);
    return {
      overflowPx: scrollW - clientW,
      hasHScroll: scrollW > clientW + 1,
      hits: hits.slice(0, 6),
      statusText: document.title,
    };
  });
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(35000);
  const findings = [];

  for (const [route, w, h] of CASES) {
    process.stdout.write(`${route} ${w}x${h} … `);
    await page.setViewportSize({ width: w, height: h });
    try {
      const res = await page.goto(`${BASE}${route}`, {
        waitUntil: "domcontentloaded",
        timeout: 35000,
      });
      await page.waitForTimeout(500);
      const m = await measure(page);
      const status = res?.status() ?? 0;
      console.log(
        status,
        m.hasHScroll ? `HSCROLL +${m.overflowPx}` : "ok",
        m.hits[0] ? `(${m.hits[0].tag} +${m.hits[0].diff})` : ""
      );
      if (status >= 500) {
        findings.push({
          route,
          viewport: `${w}x${h}`,
          problem: `HTTP ${status}`,
          severity: "P1",
          fix: "Opravit runtime chybu stránky.",
        });
      }
      if (m.hasHScroll) {
        findings.push({
          route,
          viewport: `${w}x${h}`,
          problem: `Horizontální scroll (+${m.overflowPx}px). ${m.hits[0] ? m.hits[0].tag + "." + (m.hits[0].cls || "").split(" ")[0] : ""}`,
          severity: w <= 430 ? "P0" : "P1",
          fix: "Root cause dle scrollWidth chain; bez overflow-x:hidden na html/body.",
          hits: m.hits,
        });
      }
    } catch (e) {
      console.log("ERR", e.message);
      findings.push({
        route,
        viewport: `${w}x${h}`,
        problem: e.message,
        severity: "P2",
        fix: "Stabilita serveru / route.",
      });
    }
  }

  // Zoom 200%: real browsers shrink layout viewport (≈640×360 for 1280×720)
  await page.setViewportSize({ width: 640, height: 360 });
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(300);
  let m = await measure(page);
  if (m.hasHScroll) {
    findings.push({
      route: "/",
      viewport: "640x360 (≈ zoom 200% of 1280x720)",
      problem: `HSCROLL +${m.overflowPx}`,
      severity: "P1",
      fix: "min-w-0 / wrap / hamburger under xl",
      hits: m.hits,
    });
  }

  // Font enlargement
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await page.addStyleTag({ content: "html{font-size:150%!important}" });
  await page.waitForTimeout(250);
  m = await measure(page);
  if (m.hasHScroll) {
    findings.push({
      route: "/",
      viewport: "1280x720 @ font 150%",
      problem: `HSCROLL +${m.overflowPx}`,
      severity: "P1",
      fix: "wrap / min-w-0",
      hits: m.hits,
    });
  }

  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  try {
    const accept = page.getByRole("button", { name: /Přijmout vše/i });
    if (await accept.isVisible({ timeout: 1200 })) await accept.click();
  } catch {}
  let focused = 0;
  for (let i = 0; i < 25; i++) {
    await page.keyboard.press("Tab");
    if (
      await page.evaluate(() =>
        ["A", "BUTTON", "INPUT", "SELECT", "TEXTAREA"].includes(
          document.activeElement?.tagName || ""
        )
      )
    )
      focused++;
  }
  findings.push({
    route: "/",
    viewport: "1280x720",
    problem:
      focused >= 3
        ? `Keyboard Tab OK (${focused}/25)`
        : `Keyboard Tab weak (${focused}/25)`,
    severity: focused >= 3 ? "info" : "P1",
    fix: focused >= 3 ? "—" : "Focus order / skip link",
  });

  await browser.close();
  const outDir = join(__dirname, "..", "docs");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(
    join(outDir, "responsive-audit-raw.json"),
    JSON.stringify(findings, null, 2)
  );
  const p0 = findings.filter((f) => f.severity === "P0");
  const p1 = findings.filter((f) => f.severity === "P1");
  console.log("\nSUMMARY", { total: findings.length, p0: p0.length, p1: p1.length, p0, p1 });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
