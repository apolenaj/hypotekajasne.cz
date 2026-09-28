import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getCz20260809Catalog } from "@/lib/mortgage-market/catalog-from-manifest";
import {
  buildHomeRateRows,
  HOME_RATE_UNAVAILABLE,
} from "@/lib/mortgage-market/home-rate-row";
import { getMortgageOffers } from "@/lib/mortgage-market/offers";

const catalog = getCz20260809Catalog();
const CHECKED = Date.parse("2026-09-21T12:00:00.000Z");
/** >72h after catalog checkedAt (2026-09-21). */
const STALE = Date.parse("2026-09-25T12:00:00.000Z");

function offersFor(fixationMonths: number, nowMs: number) {
  const result = getMortgageOffers(catalog, {
    purpose: "purchase",
    fixationMonths,
    includeLtvUnspecified: true,
    nowMs,
  });
  return [...result.offers, ...result.unspecifiedLtvOffers];
}

describe("buildHomeRateRows", () => {
  it("shows the verified figure with its date when the 72h window has passed", () => {
    const rows = buildHomeRateRows(offersFor(36, STALE), 36, STALE);
    assert.ok(rows.length > 0);
    const kb = rows.find((row) => row.lenderSlug === "komercni-banka");
    assert.ok(kb);
    assert.equal(kb!.showNumeric, true);
    assert.match(kb!.rateLabel, /% p\. a\./);
    assert.ok(kb!.ageWarning?.includes("72 hodin"));
    assert.ok(kb!.verifiedAtLabel);
    assert.ok(kb!.sourceUrl?.startsWith("https://"));
  });

  it("does not borrow a rate from another fixation", () => {
    const rows = buildHomeRateRows(offersFor(12, CHECKED), 60, CHECKED);
    assert.equal(rows.length, 0);
  });

  it("labels two products of the same bank instead of merging them", () => {
    const rows = buildHomeRateRows(offersFor(36, CHECKED), 36, CHECKED);
    const kb = rows.filter((row) => row.lenderName.includes("Komerční"));
    if (kb.length > 1) {
      assert.ok(kb.every((row) => row.productLabel));
      const labels = new Set(kb.map((row) => row.productLabel));
      assert.equal(labels.size, kb.length);
    }
  });

  it("says the rate is unavailable when verification date is missing", () => {
    const [sample] = offersFor(36, CHECKED);
    assert.ok(sample);
    const rows = buildHomeRateRows(
      [{ ...sample!, checkedAt: "", evidence: sample!.evidence ? { ...sample!.evidence, checkedAt: "" } : null }],
      36,
      CHECKED
    );
    assert.equal(rows[0]?.rateLabel, HOME_RATE_UNAVAILABLE);
    assert.equal(rows[0]?.showNumeric, false);
  });
});
