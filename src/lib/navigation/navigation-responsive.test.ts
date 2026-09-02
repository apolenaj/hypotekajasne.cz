/**
 * Responsive navigation structure, coverage audit & overflow guards.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  collectPrimaryNavigationHrefs,
  desktopNav,
  getViceItemsForBreakpoint,
  hypotekyNavItems,
  isMortgageFocusedPath,
  isNavItemActive,
  LEGACY_NAV_RELOCATION,
  mobileNavGroups,
  navCta,
  primaryDesktopGroups,
  toolsExtraNavItems,
  utilityNavItems,
} from "@/lib/navigation";
import { routes } from "@/lib/routes";

const ROOT = join(process.cwd(), "src");

/** Viewport widths from product QA matrix */
export const NAV_BREAKPOINTS = [
  320, 360, 375, 390, 430, 768, 820, 1024, 1280, 1366, 1440, 1536, 1920, 2560,
] as const;

/** Původní interní href z navigace před zjednodušením (audit mapy). */
const LEGACY_INTERNAL_HREFS = [
  routes.dashboard,
  routes.sazby,
  routes.kalkulacky.hypotecniKalkulacka,
  routes.mojeMoznosti,
  routes.navrhNaMiru,
  routes.refinanceRadar,
  routes.financniPas,
  routes.pruvodceInvestora,
  routes.investicniPas,
  routes.investicniRentgen,
  routes.investicniRentgenPorovnani,
  routes.portfolio,
  routes.sledovani,
  routes.dueDiligence,
  routes.akademie,
  `${routes.akademie}/cesty`,
  routes.metodika,
  routes.duvera,
  routes.oNas,
  routes.clanky,
  routes.marketPulse,
  routes.alertCenter,
  routes.documentVault,
  routes.dealRoom,
  routes.offerStrategy,
  routes.globalFinancing,
  routes.copilot,
  routes.reportEngine,
  routes.kontakt,
  routes.faq,
];

describe("navigation structure — produktové megamenu", () => {
  it("desktop top-level exposes all product pillars", () => {
    const labels = primaryDesktopGroups.map((g) => g.label);
    assert.deepEqual(labels, [
      "Hypotéky",
      "Nájem vs. hypotéka",
      "Investice",
      "Zahraniční nemovitosti",
      "Kalkulačky",
      "Průvodci",
    ]);
    assert.equal(desktopNav.kalkulacka.href, routes.kalkulacky.hypotecniKalkulacka);
    assert.equal(desktopNav.sazby.href, routes.sazby);
    assert.equal(desktopNav.jakToFunguje.href, "/#jak-to-funguje");
  });

  it("utility bar covers O nás, Kontakt, Centrum důvěry", () => {
    const labels = utilityNavItems.map((i) => i.label);
    assert.ok(labels.includes("O nás"));
    assert.ok(labels.includes("Kontakt"));
    assert.ok(labels.includes("Centrum důvěry"));
  });

  it("hypotéky megamenu covers purchase, refinance, OSVČ and foreign income", () => {
    const labels = hypotekyNavItems.map((i) => i.label);
    assert.ok(labels.some((l) => l.includes("Koupě")));
    assert.ok(labels.some((l) => l.includes("Refinancování")));
    assert.ok(labels.some((l) => l.includes("OSVČ")));
    assert.ok(labels.some((l) => l.includes("zahraničí")));
    assert.ok(
      hypotekyNavItems.some((i) => i.href.includes("purpose=purchase"))
    );
    assert.ok(hypotekyNavItems.some((i) => i.href.includes("/temata/refinancovani")));
  });

  it("investice a AI nástroje nejsou v Hypotéky; AI je v Další nástroje", () => {
    const tools = toolsExtraNavItems.map((i) => i.label);
    assert.ok(tools.some((l) => l.includes("AI průvodce")));
    assert.ok(tools.some((l) => l.includes("Můj přehled")));
    const hypoteky = desktopNav.hypoteky.items.map((i) => i.label);
    assert.ok(!hypoteky.some((l) => l.includes("Investiční pas")));
    assert.ok(!hypoteky.some((l) => l.includes("AI průvodce")));
    assert.ok(desktopNav.investice.items.some((i) => i.label.includes("Investiční")));
  });

  it("mobile accordion mirrors product groups plus utility tools", () => {
    const ids = mobileNavGroups.map((g) => g.id);
    assert.deepEqual(ids, [
      "hypoteky",
      "najem",
      "investice",
      "zahranici",
      "kalkulacky",
      "pruvodci",
      "o-nas",
      "nastroje",
    ]);
    assert.equal(
      mobileNavGroups[0]!.items.length,
      desktopNav.hypoteky.items.length
    );
  });

  it("CTA is Najít ideální řešení for anonymous users", () => {
    assert.equal(navCta.default.label, "Najít ideální řešení");
    assert.equal(navCta.default.href, routes.mojeMoznosti);
    assert.ok(navCta.returning.href.includes("dashboard"));
  });

  it("product pillars stay visible on mortgage paths (no hide)", () => {
    assert.equal(isMortgageFocusedPath("/sazby"), false);
    assert.equal(isMortgageFocusedPath("/temata/refinancovani"), false);
    assert.equal(isMortgageFocusedPath("/kalkulacky/hypotecni"), false);
    assert.equal(isMortgageFocusedPath("/pruvodce-investora"), false);
  });

  it("active state matches path and query (purchase sazby)", () => {
    assert.equal(
      isNavItemActive(
        `${routes.sazby}?purpose=purchase`,
        routes.sazby,
        "?purpose=purchase"
      ),
      true
    );
    assert.equal(
      isNavItemActive(
        `${routes.sazby}?purpose=purchase`,
        routes.sazby,
        "?purpose=refinance"
      ),
      false
    );
    assert.equal(
      isNavItemActive(routes.temata + "/hypoteka-osvc", "/temata/hypoteka-osvc"),
      true
    );
  });
});

describe("navigation coverage — žádná stránka nezmizí", () => {
  it("všechny původní interní href zůstávají v navigaci", () => {
    const covered = new Set(collectPrimaryNavigationHrefs());
    for (const href of LEGACY_INTERNAL_HREFS) {
      const path = href.split("?")[0]!;
      assert.ok(
        covered.has(path),
        `missing legacy href in nav: ${href}`
      );
    }
  });

  it("legacy relocation map covers every former top-level group", () => {
    const legacyTop = ["Můj přehled", "Hypotéka", "Investice", "Trhy", "Akademie", "Více"];
    for (const label of legacyTop) {
      assert.ok(
        LEGACY_NAV_RELOCATION.some((r) => r.legacyLabel === label || r.legacyLocation.includes(label)),
        `missing relocation entry for ${label}`
      );
    }
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

  it("desktop nav starts at xl with accessible disclosure megamenu", () => {
    assert.ok(navbar.includes("xl:flex"));
    assert.ok(navbar.includes('aria-label="Hlavní navigace"'));
    assert.ok(navbar.includes("aria-controls={panelId}"));
    assert.ok(navbar.includes("hidden={!open}"));
    assert.ok(!navbar.includes('role="menu"'));
    assert.ok(navbar.includes("isNavItemActive"));
    assert.ok(navbar.includes("primaryDesktopGroups"));
    assert.ok(navbar.includes("utilityNavItems"));
  });

  it("mobile drawer is closable without horizontal scroll", () => {
    assert.ok(navbar.includes('role="dialog"'));
    assert.ok(navbar.includes("useFocusTrap"));
    assert.ok(navbar.includes("overflow-x-hidden"));
    assert.ok(navbar.includes('aria-label="Zavřít menu"'));
    assert.ok(navbar.includes("min-h-11"));
    assert.ok(navbar.includes('document.body.style.overflow = "hidden"'));
  });

  it("breakpoint matrix is documented for QA", () => {
    assert.equal(NAV_BREAKPOINTS.length, 14);
    for (const w of NAV_BREAKPOINTS) {
      if (w < 1280) {
        const items = getViceItemsForBreakpoint(w);
        assert.ok(items.length > 0, `${w}: secondary nav items`);
      }
    }
  });
});
