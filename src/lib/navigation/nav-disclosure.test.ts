/**
 * Desktop disclosure nav — contracts that catch the production megamenu bug:
 * aria-controls must point at a real DOM node; click must expand.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  closeDesktopNavDisclosure,
  toggleDesktopNavDisclosure,
} from "@/lib/navigation/desktop-nav-disclosure";
import { primaryDesktopGroups } from "@/lib/navigation";

const ROOT = join(process.cwd(), "src");

describe("desktop nav disclosure state", () => {
  it("opens Hypotéky on first toggle and closes on second", () => {
    let open: string | null = null;
    open = toggleDesktopNavDisclosure(open, "hypoteky");
    assert.equal(open, "hypoteky");
    open = toggleDesktopNavDisclosure(open, "hypoteky");
    assert.equal(open, null);
  });

  it("opening another category closes the previous", () => {
    let open: string | null = "hypoteky";
    open = toggleDesktopNavDisclosure(open, "investice");
    assert.equal(open, "investice");
    open = closeDesktopNavDisclosure();
    assert.equal(open, null);
  });

  it("covers every primary desktop group id", () => {
    for (const group of primaryDesktopGroups) {
      assert.ok(group.id.length > 0);
      assert.ok(group.items.length > 0, group.id);
    }
  });
});

describe("Navbar disclosure source contracts (regression for aria-controls bug)", () => {
  const navbar = readFileSync(
    join(ROOT, "components/layout/Navbar.tsx"),
    "utf8"
  );

  it("keeps disclosure panel in the DOM (hidden when closed)", () => {
    assert.ok(navbar.includes("hidden={!open}"));
    assert.ok(navbar.includes("aria-controls={panelId}"));
    assert.ok(navbar.includes("id={panelId}"));
    assert.ok(navbar.includes('data-nav-panel={group.id}'));
    assert.ok(navbar.includes('data-nav-disclosure={group.id}'));
  });

  it("does not use APG role=menu without full arrow-key roving tabindex", () => {
    assert.equal(navbar.includes('role="menu"'), false);
    assert.equal(navbar.includes('role="menuitem"'), false);
    assert.ok(navbar.includes('aria-haspopup="true"'));
  });

  it("opens on click (not hover-only) and closes on Escape / outside", () => {
    assert.ok(navbar.includes("onClick={() => onOpenChange(!open)}"));
    assert.equal(navbar.includes("onMouseEnter"), false);
    assert.equal(navbar.includes("onMouseLeave"), false);
    assert.ok(navbar.includes('event.key === "Escape"'));
    assert.ok(navbar.includes("mousedown"));
  });

  it("Hypotéky group is first primary desktop category with real links", () => {
    assert.equal(primaryDesktopGroups[0]?.id, "hypoteky");
    assert.ok(
      primaryDesktopGroups[0]!.items.some((i) =>
        i.href.includes("/temata/refinancovani")
      )
    );
  });
});
