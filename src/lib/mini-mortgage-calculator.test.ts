import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  matchMiniTeaserOffers,
  miniMortgageCtaLabel,
} from "@/lib/mini-mortgage-calculator";

describe("mini mortgage teaser CTA", () => {
  it("uses neutral CTA without invented bank offer counts", () => {
    const match = matchMiniTeaserOffers(5);
    assert.ok(match.count >= 3);
    assert.equal(match.lowestRatePercent, 4.19);
    assert.equal(miniMortgageCtaLabel(match), "Zjistit moje možnosti");
    assert.equal(miniMortgageCtaLabel(), "Zjistit moje možnosti");
  });

  it("keeps teaser matching available for internal demos", () => {
    const match = matchMiniTeaserOffers(3.5);
    assert.equal(match.count, 0);
    assert.equal(miniMortgageCtaLabel(match), "Zjistit moje možnosti");
  });

  it("uses Czech plural counts only inside match helper", () => {
    const one = matchMiniTeaserOffers(4.0);
    assert.equal(one.count, 1);
    assert.equal(one.lowestRatePercent, 4.19);

    const few = matchMiniTeaserOffers(4.2);
    assert.equal(few.count, 2);
    assert.equal(few.lowestRatePercent, 4.19);
  });
});
