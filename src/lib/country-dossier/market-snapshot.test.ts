import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildExecutiveSnapshot } from "@/lib/country-dossier/market-snapshot";
import type { CountryId } from "@/lib/calculators";

const ALL: CountryId[] = [
  "cz",
  "dubai",
  "spain",
  "italy",
  "croatia",
  "bali",
  "saudi",
  "slovakia",
];

describe("executive market snapshot", () => {
  it("builds snapshot for every country without inventing empty fields as facts", () => {
    for (const id of ALL) {
      const snap = buildExecutiveSnapshot(id);
      assert.ok(snap.name);
      assert.ok(snap.fields.length >= 3);
      assert.ok(snap.fields.some((f) => f.id === "currency"));
      // Žádné falešné VERIFIED na měně
      const currency = snap.fields.find((f) => f.id === "currency");
      assert.equal(currency?.status, null);
    }
  });

  it("CZ includes financing and ownership from destination metrics", () => {
    const snap = buildExecutiveSnapshot("cz");
    assert.ok(snap.forWhom);
    assert.ok(snap.mainAdvantage);
    assert.ok(snap.mainRisk);
    assert.ok(snap.fields.some((f) => f.id === "financing"));
    assert.ok(snap.fields.some((f) => f.id === "liquidity"));
  });
});
