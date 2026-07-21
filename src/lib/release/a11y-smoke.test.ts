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
    assert.ok(banner.includes("Přijmout vše"));
    assert.ok(banner.includes("Odmítnout volitelné"));
    assert.ok(banner.includes("Nastavení"));
  });

  it("home hero has single h1 id and Czech headline", () => {
    const hero = readFileSync(
      join(ROOT, "components/home/CockpitHero.tsx"),
      "utf8"
    );
    assert.ok(hero.includes("home-hero-heading"));
    assert.ok(hero.includes("<h1"));
    assert.ok(!hero.includes("Decision cockpit"));
    assert.ok(
      hero.includes("DecisionSnapshot") ||
        hero.includes("max-h-[720px]") ||
        hero.includes("aria-labelledby")
    );
  });

  it("breadcrumbs expose nav aria-label", () => {
    const bc = readFileSync(
      join(ROOT, "components/seo/Breadcrumbs.tsx"),
      "utf8"
    );
    assert.ok(bc.includes('aria-label="Drobečková navigace"'));
  });

  it("site header is sticky with compact desktop nav landmark", () => {
    const nav = readFileSync(
      join(ROOT, "components/layout/Navbar.tsx"),
      "utf8"
    );
    assert.ok(nav.includes("sticky top-0"));
    assert.ok(nav.includes('aria-label="Hlavní navigace"'));
    assert.ok(nav.includes("desktopNav.hypoteka"));
    assert.ok(nav.includes("desktopNav.investice"));
    assert.ok(nav.includes("min-h-11"));
    assert.ok(nav.includes("useFocusTrap"));
  });

  it("lead form exposes labels and alert errors", () => {
    const form = readFileSync(
      join(ROOT, "components/forms/LeadCaptureForm.tsx"),
      "utf8"
    );
    assert.ok(form.includes("htmlFor"));
    assert.ok(form.includes('role="alert"'));
    assert.ok(form.includes("aria-invalid"));
  });

  it("globals respect prefers-reduced-motion for academy characters", () => {
    const css = readFileSync(join(ROOT, "app/globals.css"), "utf8");
    assert.ok(css.includes("prefers-reduced-motion"));
    assert.ok(css.includes("academy-char--idle"));
  });
});
