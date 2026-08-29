/**
 * LTV exact value, bank band resolution, URL persistence.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildLtvContext,
  computeExactLtv,
  formatExactLtvCs,
  formatLtvBandLabel,
  parseSazbySearchParams,
  resolveLtvBandUpperLimit,
  roundExactLtv,
  serializeSazbySearchParams,
} from "@/lib/mortgage-rates/ltv-context";

describe("computeExactLtv", () => {
  it("7M property, 6M loan → 85,7 %", () => {
    assert.equal(computeExactLtv(6_000_000, 7_000_000), 85.7);
    assert.equal(formatExactLtvCs(85.7), "85,7");
  });

  it("10M property, 4.23M loan → 42,3 %", () => {
    assert.equal(computeExactLtv(4_230_000, 10_000_000), 42.3);
  });

  it("rejects invalid inputs", () => {
    assert.equal(computeExactLtv(1, 0), null);
    assert.equal(computeExactLtv(-1, 5_000_000), null);
    assert.equal(computeExactLtv(6_000_000, 5_000_000), null);
  });
});

describe("resolveLtvBandUpperLimit", () => {
  it("85,7 % → band do 90 %", () => {
    assert.equal(resolveLtvBandUpperLimit(85.7), 90);
    assert.equal(formatLtvBandLabel(90), "do 90 %");
  });

  it("42,3 % → band do 80 %", () => {
    assert.equal(resolveLtvBandUpperLimit(42.3), 80);
  });

  it("exact 80,0 % → band do 80 %", () => {
    assert.equal(resolveLtvBandUpperLimit(80), 80);
  });

  it("80,1 % → next band do 90 %", () => {
    assert.equal(resolveLtvBandUpperLimit(80.1), 90);
  });

  it("above 90 % → no band", () => {
    assert.equal(resolveLtvBandUpperLimit(90.001), null);
  });
});

describe("buildLtvContext", () => {
  it("combines exact LTV and band with validation", () => {
    const ok = buildLtvContext({
      propertyValueCzk: 7_000_000,
      loanAmountCzk: 6_000_000,
    });
    assert.equal(ok.exactLtv, 85.7);
    assert.equal(ok.ltvBand, 90);
    assert.equal(ok.validationError, null);
    assert.equal(ok.exceedsSupportedMax, false);

    const high = buildLtvContext({
      propertyValueCzk: 10_000_000,
      loanAmountCzk: 9_500_000,
    });
    assert.equal(high.exactLtv, 95);
    assert.equal(high.exceedsSupportedMax, true);
    assert.ok(high.validationError?.includes("90"));
  });
});

describe("sazby URL roundtrip — refresh / back navigation", () => {
  it("property + loan + equity + term survive serialize → parse unchanged", () => {
    const query = {
      purpose: "refinance" as const,
      fixationMonths: 60,
      propertyValueCzk: 7_000_000,
      ownFundsCzk: 1_000_000,
      loanAmountCzk: 6_000_000,
      termYears: 30,
    };
    const serialized = serializeSazbySearchParams(query);
    const parsed = parseSazbySearchParams(
      Object.fromEntries(serialized.entries())
    );
    assert.equal(parsed.purpose, query.purpose);
    assert.equal(parsed.fixationMonths, query.fixationMonths);
    assert.equal(parsed.propertyValueCzk, query.propertyValueCzk);
    assert.equal(parsed.loanAmountCzk, query.loanAmountCzk);
    assert.equal(parsed.ownFundsCzk, query.ownFundsCzk);
    assert.equal(parsed.termYears, query.termYears);

    const ctx = buildLtvContext(parsed);
    assert.equal(ctx.exactLtv, 85.7);
    assert.equal(ctx.ltvBand, 90);
  });

  it("legacy ltv param maps to stable property/loan", () => {
    const parsed = parseSazbySearchParams({ ltv: "85.7", purpose: "purchase" });
    const ctx = buildLtvContext(parsed);
    assert.equal(ctx.exactLtv, 85.7);
    const again = parseSazbySearchParams(
      Object.fromEntries(serializeSazbySearchParams(parsed).entries())
    );
    assert.equal(buildLtvContext(again).exactLtv, 85.7);
  });
});

describe("roundExactLtv", () => {
  it("keeps one decimal", () => {
    assert.equal(roundExactLtv(85.74), 85.7);
    assert.equal(roundExactLtv(80.04), 80);
  });
});
