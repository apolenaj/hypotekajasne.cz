/**
 * Durable regression guards from final QA pass (no Playwright dependency).
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { calculateAnnuityPayment, roundMoney } from "@/lib/finance-math/core";
import { computeMiniMortgage } from "@/lib/mini-mortgage-calculator";

const ROOT = join(process.cwd(), "src");

describe("final QA — prior responsive regressions", () => {
  it("Navbar does not double-lock body overflow (focus-trap owns lock)", () => {
    const navbar = readFileSync(
      join(ROOT, "components/layout/Navbar.tsx"),
      "utf8"
    );
    assert.ok(navbar.includes("useFocusTrap"));
    assert.ok(navbar.includes("z-[130]"));
    assert.ok(!navbar.includes('document.body.style.overflow = "hidden"'));
  });

  it("cookie banner stays below mobile drawer z-index", () => {
    const cookie = readFileSync(
      join(ROOT, "components/consent/CookieConsentBanner.tsx"),
      "utf8"
    );
    assert.ok(cookie.includes("z-[90]"));
    assert.ok(cookie.includes("safe-area-inset-bottom"));
    assert.ok(cookie.includes("DelayedCookieMount"));
  });

  it("HomePriceChart ResponsiveContainer has minWidth/minHeight 0", () => {
    const chart = readFileSync(
      join(ROOT, "components/home/HomePriceChart.tsx"),
      "utf8"
    );
    assert.ok(chart.includes("minWidth={0}"));
    assert.ok(chart.includes("minHeight={0}"));
  });
});

describe("final QA — calculator math smoke", () => {
  it("annuity handles zero rate and typical mortgage", () => {
    const zero = calculateAnnuityPayment(4_000_000, 0, 30);
    assert.equal(roundMoney(zero), roundMoney(4_000_000 / 360));
    const pmt = calculateAnnuityPayment(4_000_000, 5, 30);
    assert.ok(Number.isFinite(pmt) && pmt > 20_000 && pmt < 30_000);
  });

  it("mini mortgage does not emit NaN for edge inputs", () => {
    for (const input of [
      { propertyPriceCzk: 0, ownFundsCzk: 0, termYears: 30, annualRatePercent: 5 },
      {
        propertyPriceCzk: 10_000_000,
        ownFundsCzk: 2_000_000,
        termYears: 30,
        annualRatePercent: 0,
      },
      {
        propertyPriceCzk: 5_000_000,
        ownFundsCzk: 1_000_000,
        termYears: 30,
        annualRatePercent: 5,
      },
    ]) {
      const r = computeMiniMortgage(input);
      assert.ok(Number.isFinite(r.monthlyPaymentCzk));
      assert.ok(r.monthlyPaymentCzk >= 0);
      assert.ok(Number.isFinite(r.loanAmountCzk));
    }
  });
});
