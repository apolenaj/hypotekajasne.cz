import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  matchMiniTeaserOffers,
  miniMortgageCtaLabel,
} from "@/lib/mini-mortgage-calculator";

describe("mini mortgage teaser CTA", () => {
  it("matches better-or-close offers at default 5 %", () => {
    const match = matchMiniTeaserOffers(5);
    assert.ok(match.count >= 3);
    assert.equal(match.lowestRatePercent, 4.19);
    assert.match(miniMortgageCtaLabel(match), /Zobrazit \d+ nabídek od 4,19 %/);
  });

  it("falls back when user rate is far below all teasers", () => {
    const match = matchMiniTeaserOffers(3.5);
    assert.equal(match.count, 0);
    assert.equal(
      miniMortgageCtaLabel(match),
      "Nezávazně ověřit možnosti"
    );
  });

  it("uses Czech plural for 1–4 offers", () => {
    const one = matchMiniTeaserOffers(4.0);
    assert.equal(one.count, 1);
    assert.equal(miniMortgageCtaLabel(one), "Zobrazit 1 nabídku od 4,19 %");

    const few = matchMiniTeaserOffers(4.2);
    assert.equal(few.count, 2);
    assert.equal(miniMortgageCtaLabel(few), "Zobrazit 2 nabídky od 4,19 %");
  });
});
