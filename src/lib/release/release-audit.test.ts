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
    assert.equal(ANALYTICS_EVENTS.length, 15);
  });

  it("AboutUs uses honest photo placeholder copy", () => {
    const about = readFileSync(
      join(ROOT, "components/sections/AboutUsView.tsx"),
      "utf8"
    );
    assert.ok(about.includes("Fotografie zatím není dodána"));
    assert.ok(!about.includes("Fotografie brzy"));
  });
});
