/**
 * UX simplification — CTA nomenclature + progressive disclosure contracts.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  CTA_CS,
  PRIMARY_PRODUCT_CTA,
  CTA_PRIMARY_CLASS,
} from "@/lib/ux/cta";
import { navCta } from "@/lib/navigation";

const ROOT = join(process.cwd(), "src");

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), "utf8");
}

describe("CTA nomenclature", () => {
  it("keeps one primary product CTA aligned with nav", () => {
    assert.equal(PRIMARY_PRODUCT_CTA.label, CTA_CS.discoverOptions);
    assert.equal(navCta.default.label, CTA_CS.discoverOptions);
    assert.ok(navCta.default.href.includes("moje-moznosti"));
  });

  it("uses touch-friendly primary class (min-h-11)", () => {
    assert.ok(CTA_PRIMARY_CLASS.includes("min-h-11"));
  });
});

describe("progressive disclosure primitives exist", () => {
  it("ships ExplainDisclosure + WhatNextPanel", () => {
    const explain = read("components/ux/ExplainDisclosure.tsx");
    const next = read("components/ux/WhatNextPanel.tsx");
    assert.ok(explain.includes("Jak jsme to spočítali") || explain.includes("CTA_CS.howCalculated"));
    assert.ok(next.includes("Co mám udělat dál") || next.includes("CTA_CS.whatNext"));
    assert.ok(explain.includes("aria-expanded"));
    assert.ok(next.includes("what-next-heading"));
  });
});
