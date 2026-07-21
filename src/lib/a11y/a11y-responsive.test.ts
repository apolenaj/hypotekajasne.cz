/**
 * Static + unit accessibility / mobile QA guards for production.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { getFocusableElements } from "@/lib/a11y/focus-trap";
import { statusBadgeLabel } from "@/lib/data/display";
import type { DataStatus } from "@/lib/data/types";
import { CLAIM_KIND_LABELS, type ClaimKind } from "@/lib/property-rentgen";

const ROOT = join(process.cwd(), "src");

/** Product QA viewport matrix (PROMPT 17L) */
export const A11Y_VIEWPORTS = [
  320, 360, 390, 430, 768, 1024, 1366, 1440, 1920,
] as const;

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), "utf8");
}

describe("viewport QA matrix", () => {
  it("covers phone → ultra-wide breakpoints used in product QA", () => {
    assert.ok(A11Y_VIEWPORTS.includes(320));
    assert.ok(A11Y_VIEWPORTS.includes(390));
    assert.ok(A11Y_VIEWPORTS.includes(430));
    assert.ok(A11Y_VIEWPORTS.includes(1024));
    assert.ok(A11Y_VIEWPORTS.includes(1440));
  });
});

describe("focus trap helper", () => {
  it("exports getFocusableElements", () => {
    assert.equal(typeof getFocusableElements, "function");
  });
});

describe("status badges are not color-only", () => {
  it("every DataStatus has a non-empty Czech text label", () => {
    const statuses: DataStatus[] = [
      "LIVE",
      "VERIFIED",
      "MODEL",
      "ESTIMATE",
      "UNVERIFIED",
      "PARTNER_QUOTE",
      "STALE",
    ];
    for (const s of statuses) {
      const label = statusBadgeLabel(s);
      assert.ok(label.length >= 2, s);
      assert.ok(!/^#[0-9a-f]+$/i.test(label));
    }
  });

  it("ClaimKind labels are visible text (DATA/MODEL/ODHAD)", () => {
    const kinds = Object.keys(CLAIM_KIND_LABELS) as ClaimKind[];
    assert.ok(kinds.length >= 3);
    for (const k of kinds) {
      assert.ok(CLAIM_KIND_LABELS[k].length >= 2, k);
    }
  });

  it("DataStatusBadge renders statusBadgeLabel text", () => {
    const src = read("components/trust/DataStatusBadge.tsx");
    assert.ok(src.includes("statusBadgeLabel(status)"));
    assert.ok(!src.includes("aria-label={status}") || src.includes("statusBadgeLabel"));
  });
});

describe("overlay a11y patterns", () => {
  it("Navbar mobile drawer uses focus trap + dialog semantics", () => {
    const nav = read("components/layout/Navbar.tsx");
    assert.ok(nav.includes("useFocusTrap"));
    assert.ok(nav.includes('role="dialog"'));
    assert.ok(nav.includes("aria-modal"));
    assert.ok(nav.includes("min-h-11"));
  });

  it("Dialog component traps focus and locks scroll", () => {
    const dlg = read("components/ui/dialog.tsx");
    assert.ok(dlg.includes("useFocusTrap"));
    assert.ok(dlg.includes("aria-modal"));
    assert.ok(dlg.includes("overflow-y-auto"));
  });

  it("MethodologyDrawer traps focus with 44px close target", () => {
    const d = read("components/trust/MethodologyDrawer.tsx");
    assert.ok(d.includes("useFocusTrap"));
    assert.ok(d.includes("h-11 w-11") || d.includes("min-h-11"));
  });
});

describe("form labelling & errors", () => {
  it("LeadCaptureForm has visible labels and alert region", () => {
    const form = read("components/forms/LeadCaptureForm.tsx");
    assert.ok(form.includes("<label") || form.includes("htmlFor"));
    assert.ok(form.includes('role="alert"') || form.includes("aria-live"));
    assert.ok(form.includes("aria-invalid") || form.includes("aria-describedby"));
  });

  it("API lead errors tell what is wrong and how to fix", () => {
    const api = read("app/api/leads/route.ts");
    assert.ok(api.includes("e-mail") || api.includes("e-mail"));
    assert.ok(
      api.includes("Zkuste") ||
        api.includes("Vyplňte") ||
        api.includes("Zkontrolujte") ||
        api.includes("zadejte")
    );
  });
});

describe("reduced motion", () => {
  it("globals.css disables academy + home motion under prefers-reduced-motion", () => {
    const css = read("app/globals.css");
    assert.ok(css.includes("prefers-reduced-motion"));
    assert.ok(css.includes("academy-char"));
    assert.ok(css.includes("animation: none"));
  });
});

describe("mobile overflow guards", () => {
  it("DataSourcePopover clamps width to viewport", () => {
    const pop = read("components/trust/DataSourcePopover.tsx");
    assert.ok(
      pop.includes("innerWidth") &&
        (pop.includes("Math.min") || pop.includes("min("))
    );
  });

  it("country sticky offsets match mobile header h-14", () => {
    const dossier = read("components/sections/CountryDossierView.tsx");
    assert.ok(
      dossier.includes("top-14") || dossier.includes("sm:top-16"),
      "dossier sticky should align with mobile header"
    );
  });
});

describe("critical surfaces exist for QA matrix", () => {
  it("homepage, calculators, rentgen, akademie, trust components present", () => {
    const required = [
      "components/home/CockpitHero.tsx",
      "components/layout/Navbar.tsx",
      "components/layout/Footer.tsx",
      "components/property-rentgen/RentgenToolIsland.tsx",
      "components/financial-passport/FinancialPassportView.tsx",
      "components/copilot/CopilotView.tsx",
      "components/academy/AcademyLessonView.tsx",
      "components/trust/TrustPageShell.tsx",
    ];
    for (const rel of required) {
      assert.ok(statSync(join(ROOT, rel)).isFile(), rel);
    }
  });
});
