/**
 * Release audit scanners — catch common P0/P1 regressions.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { STATIC_PAGE_SEO } from "@/lib/seo/pages";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";

const ROOT = join(process.cwd(), "src");

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (name === "node_modules" || name === ".next") continue;
      walk(p, out);
    } else if (/\.(ts|tsx)$/.test(name)) {
      out.push(p);
    }
  }
  return out;
}

/** Public UI surfaces — components + pages + faq/nav/ui-cs strings */
function publicUiFiles(): string[] {
  return walk(ROOT).filter((f) => {
    if (f.includes(`${join("app", "en")}`)) return false;
    if (f.includes(`${join("app", "api")}`)) return false;
    if (f.includes("ui-en.ts")) return false;
    if (f.includes(".test.ts")) return false;
    if (f.includes("release-audit")) return false;
    if (f.includes("CookieConsentProvider")) return false;
    if (f.includes(`${join("components")}`)) return true;
    if (f.includes(`${join("app")}`) && f.endsWith("page.tsx")) return true;
    if (f.includes(`${join("lib", "faq")}`)) return true;
    if (f.includes(`${join("lib", "i18n", "ui-cs.ts")}`)) return true;
    if (f.endsWith(`${join("lib", "navigation.ts")}`)) return true;
    return false;
  });
}

describe("release audit scanners", () => {
  const forbiddenPhoto = ["Fotografie", "brzy"].join(" ");
  const forbiddenRoi = ["Extrémně vysoké ROI", "(až 15 %)"].join(" ");

  it("forbids marketing phrase Fotografie brzy", () => {
    const files = walk(ROOT).filter((f) => !f.includes("release-audit"));
    for (const f of files) {
      const text = readFileSync(f, "utf8");
      assert.ok(!text.includes(forbiddenPhoto), `Found forbidden photo phrase in ${f}`);
    }
  });

  it("forbids undounded Bali-style ROI marketing claim", () => {
    const files = walk(join(ROOT, "lib")).filter(
      (f) => !f.includes("release-audit")
    );
    for (const f of files) {
      const text = readFileSync(f, "utf8");
      assert.ok(
        !text.includes(forbiddenRoi),
        `Found undounded ROI claim in ${f}`
      );
    }
  });

  it("static SEO titles remain unique", () => {
    const titles = STATIC_PAGE_SEO.map((p) => p.title);
    assert.equal(titles.length, new Set(titles).size);
  });

  it("analytics taxonomy is non-empty and stable count", () => {
    assert.equal(ANALYTICS_EVENTS.length, 17);
  });

  it("AboutUs uses honest photo placeholder copy", () => {
    const about = readFileSync(
      join(ROOT, "components/sections/AboutUsView.tsx"),
      "utf8"
    );
    assert.ok(about.includes("Fotografie zatím není dodána"));
    assert.ok(!about.includes("Fotografie brzy"));
  });

  it("forbids developer jargon in public CS UI surfaces", () => {
    const forbidden = [
      "localStorage",
      "signed URL",
      "Source of Truth",
      "Data provenance",
      "(revoke)",
      " · REVOKED",
      "Trust Center",
      "In-app:",
      "Web push:",
      "share link",
      "encrypted object storage",
    ];
    for (const f of publicUiFiles()) {
      const text = readFileSync(f, "utf8");
      for (const phrase of forbidden) {
        assert.ok(
          !text.includes(phrase),
          `Forbidden production wording "${phrase}" in ${f}`
        );
      }
    }
  });

  it("FAQ nav label is Czech", () => {
    const nav = readFileSync(join(ROOT, "lib/navigation.ts"), "utf8");
    assert.ok(nav.includes('label: "Časté otázky"'));
    assert.ok(!nav.includes('label: "FAQ"'));
  });
});
