import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  THOUSANDS_SEP,
  formatNumber,
  formatMoneyTyping,
  parseFormattedNumber,
} from "@/lib/format";

describe("cs-CZ money formatting (NBSP)", () => {
  it("formats thousands with non-breaking space", () => {
    const out = formatNumber(60_000, { emptyZero: false });
    assert.equal(out, `60${THOUSANDS_SEP}000`);
    assert.ok(!out.includes(" "));
  });

  it("formats millions", () => {
    const out = formatNumber(1_000_000, { emptyZero: false });
    assert.equal(out, `1${THOUSANDS_SEP}000${THOUSANDS_SEP}000`);
  });

  it("parses spaced / nbsp input to clean integer", () => {
    assert.equal(parseFormattedNumber("60 000"), 60_000);
    assert.equal(parseFormattedNumber(`60${THOUSANDS_SEP}000`), 60_000);
    assert.equal(parseFormattedNumber("1000000"), 1_000_000);
    assert.equal(parseFormattedNumber(""), 0);
  });

  it("formats while typing from raw digits", () => {
    assert.equal(formatMoneyTyping("60000"), `60${THOUSANDS_SEP}000`);
  });
});
