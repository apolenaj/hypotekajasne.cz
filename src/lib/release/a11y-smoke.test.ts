/**
 * Lightweight a11y smoke checks (static, no browser).
 * Full axe/Lighthouse remains a manual / CI browser step.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(process.cwd(), "src");

describe("a11y smoke (static)", () => {
  it("cookie banner exposes dialog labelling", () => {
    const banner = readFileSync(
      join(ROOT, "components/consent/CookieConsentBanner.tsx"),
      "utf8"
    );
    assert.ok(banner.includes('role="dialog"'));
    assert.ok(banner.includes("aria-labelledby"));
    assert.ok(banner.includes("Accept all"));
    assert.ok(banner.includes("Reject optional"));
    assert.ok(banner.includes("Settings"));
  });

  it("home hero has single h1 id", () => {
    const hero = readFileSync(
      join(ROOT, "components/home/CockpitHero.tsx"),
      "utf8"
    );
    assert.ok(hero.includes("home-hero-heading"));
    assert.ok(hero.includes("<h1"));
  });

  it("breadcrumbs expose nav aria-label", () => {
    const bc = readFileSync(
      join(ROOT, "components/seo/Breadcrumbs.tsx"),
      "utf8"
    );
    assert.ok(bc.includes('aria-label="Drobečková navigace"'));
  });
});
