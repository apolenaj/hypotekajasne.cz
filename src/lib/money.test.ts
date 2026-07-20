import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatMoney,
  formatMoneyCompact,
  formatRate,
} from "@/lib/money";

describe("formatMoney", () => {
  it("formats CZK with Kč suffix and cs-CZ grouping", () => {
    const out = formatMoney(4_500_000, "CZK");
    assert.match(out, /4/);
    assert.match(out, /500/);
    assert.match(out, /000/);
    assert.ok(out.includes("Kč"));
    assert.ok(!out.includes("CZK"));
  });

  it("formats AED with code suffix — no FX conversion", () => {
    const out = formatMoney(1_000_000, "AED");
    assert.ok(out.includes("AED"));
    assert.ok(!out.includes("Kč"));
    // Same numeric magnitude — display only
    assert.match(out, /1/);
  });

  it("formats EUR with euro sign", () => {
    const out = formatMoney(250_000, "EUR");
    assert.ok(out.includes("€"));
  });

  it("formats SAR and IDR with ISO codes", () => {
    assert.ok(formatMoney(1000, "SAR").includes("SAR"));
    assert.ok(formatMoney(1000, "IDR").includes("IDR"));
  });

  it("returns em dash for non-finite amounts", () => {
    assert.equal(formatMoney(Number.NaN, "CZK"), "—");
    assert.equal(formatMoney(Infinity, "EUR"), "—");
  });
});

describe("formatRate", () => {
  it("uses Czech decimal comma and percent", () => {
    const out = formatRate(4.59);
    assert.match(out, /4[,.]59/);
    assert.ok(out.includes("%"));
  });

  it("can append p. a.", () => {
    const out = formatRate(5.1, { perAnnum: true });
    assert.ok(out.includes("%"));
    assert.ok(out.toLowerCase().includes("p"));
  });
});

describe("formatMoneyCompact", () => {
  it("compacts millions in Czech", () => {
    const out = formatMoneyCompact(1_200_000, "CZK");
    assert.ok(out.includes("mil"));
    assert.ok(out.includes("Kč"));
  });
});
