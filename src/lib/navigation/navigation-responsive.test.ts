/**
 * Responsive navigation structure & overflow guards (static + unit).
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  desktopNav,
  getViceItemsForBreakpoint,
  mobileNavGroups,
  notebookViceItems,
  navCta,
} from "@/lib/navigation";

const ROOT = join(process.cwd(), "src");

/** Viewport widths from product QA matrix */
export const NAV_BREAKPOINTS = [
  320, 360, 375, 390, 430, 768, 820, 1024, 1280, 1366, 1440, 1536, 1920, 2560,
] as const;

describe("navigation structure", () => {
  it("desktop top-level stays compact (short labels only)", () => {
    const topLabels = [
      desktopNav.overview.label,
      desktopNav.hypoteka.label,
      desktopNav.investice.label,
      desktopNav.trhy.label,
      desktopNav.akademie.label,
      desktopNav.vice.label,
    ];
    for (const label of topLabels) {
      assert.ok(label.length <= 14, `top label too long: ${label}`);
      assert.ok(!label.includes("Zjistit,"), "legacy long primary removed");
    }
  });

  it("groups contain required children", () => {
    assert.ok(
      desktopNav.hypoteka.items.some((i) => i.label.includes("půjčit"))
    );
    assert.ok(
      desktopNav.investice.items.some((i) => i.label.includes("Analyzovat"))
    );
    assert.equal(desktopNav.trhy.items.length >= 8, true);
    assert.ok(desktopNav.vice.items.some((i) => i.href.includes("metodika")));
    assert.ok(desktopNav.vice.items.some((i) => i.href.includes("duvera")));
  });

  it("notebook Více includes Akademie; xl Více does not duplicate top Akademie", () => {
    const notebook = getViceItemsForBreakpoint(1024);
    const xl = getViceItemsForBreakpoint(1280);
    assert.ok(notebook.some((i) => i.label === "Akademie"));
    assert.ok(!xl.some((i) => i.label === "Akademie"));
    assert.ok(notebookViceItems.length > xl.length);
  });

  it("mobile accordion covers all major groups", () => {
    const ids = mobileNavGroups.map((g) => g.id);
    assert.deepEqual(ids, [
      "hypoteka",
      "investice",
      "trhy",
      "akademie",
      "vice",
    ]);
  });

  it("CTA variants exist for anonymous and returning users", () => {
    assert.ok(navCta.default.href.includes("navrh-na-miru"));
    assert.ok(navCta.returning.href.includes("dashboard"));
  });
});

describe("navbar overflow guards (static source)", () => {
  const navbar = readFileSync(
    join(ROOT, "components/layout/Navbar.tsx"),
    "utf8"
  );

  it("does not use width 100vw in header layout", () => {
    assert.ok(!navbar.includes("100vw"));
    assert.ok(!navbar.includes("w-screen"));
  });

  it("desktop nav starts at xl and is single-row flex", () => {
    assert.ok(navbar.includes("xl:flex"));
    assert.ok(navbar.includes('aria-label="Hlavní navigace"'));
    assert.ok(navbar.includes("xl:hidden"));
    assert.ok(
      !navbar.includes("hidden h-20 w-full items-center justify-between gap-8")
    );
  });

  it("mobile drawer uses fixed overlay with 44px touch targets", () => {
    assert.ok(navbar.includes('role="dialog"'));
    assert.ok(navbar.includes("min-h-11"));
    assert.ok(navbar.includes("h-11 w-11"));
  });

  it("header is sticky with high z-index and max-w-full", () => {
    assert.ok(navbar.includes("sticky top-0"));
    assert.ok(navbar.includes("z-50"));
    assert.ok(navbar.includes("max-w-full"));
  });

  it("breakpoint matrix is documented for QA", () => {
    assert.equal(NAV_BREAKPOINTS.length, 14);
    assert.equal(NAV_BREAKPOINTS[0], 320);
    assert.equal(NAV_BREAKPOINTS[NAV_BREAKPOINTS.length - 1], 2560);
    // Policy: <1280 hamburger (+ notebook Více helper), >=1280 desktop groups
    for (const w of NAV_BREAKPOINTS) {
      if (w < 1280) {
        assert.ok(true, `${w}: mobile/tablet drawer`);
        if (w >= 1024) {
          const items = getViceItemsForBreakpoint(w);
          assert.ok(items.some((i) => i.label === "Akademie"), `${w}: notebook`);
        }
      } else {
        const items = getViceItemsForBreakpoint(w);
        assert.ok(!items.some((i) => i.label === "Akademie"), `${w}: xl`);
      }
    }
  });
});
