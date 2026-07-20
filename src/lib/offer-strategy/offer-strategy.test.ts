import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildOfferStrategyOutput,
  investmentSnapshot,
} from "@/lib/offer-strategy/calculate";
import { buildOfferStrategyModel } from "@/lib/offer-strategy/build";
import { assertEthicalOfferText, buildOfferTextDraft } from "@/lib/offer-strategy/offer-text";
import { DEMO_OFFER_INPUT, DEMO_PROPERTY_LABEL } from "@/lib/offer-strategy/demo";
import { defaultOfferStrategyInput } from "@/lib/offer-strategy/types";

describe("buildOfferStrategyOutput", () => {
  it("produces example-like scenario for demo input", () => {
    const out = buildOfferStrategyOutput(DEMO_OFFER_INPUT);
    assert.ok(out.openingScenarioCzk < DEMO_OFFER_INPUT.askingPriceCzk);
    assert.ok(out.targetPriceCzk >= out.openingScenarioCzk);
    assert.equal(out.claimKind, "MODEL");
    assert.ok(out.disclaimer.includes("MODEL"));
  });

  it("includes key questions without manipulation", () => {
    const out = buildOfferStrategyOutput(DEMO_OFFER_INPUT);
    assert.ok(out.keyQuestions.length >= 5);
    for (const q of out.keyQuestions) {
      assert.ok(!/manipul|falešn|ultimát/i.test(q));
    }
  });

  it("ignores unverified competition in discount", () => {
    const withVerified = buildOfferStrategyOutput(
      defaultOfferStrategyInput({
        ...DEMO_OFFER_INPUT,
        competition: { verified: true, note: "2 zájemci", claimKind: "ODHAD" },
      })
    );
    const without = buildOfferStrategyOutput(
      defaultOfferStrategyInput({
        ...DEMO_OFFER_INPUT,
        competition: { verified: false, note: null, claimKind: "NEOVERENO" },
      })
    );
    assert.ok(withVerified.openingScenarioCzk <= without.openingScenarioCzk);
  });
});

describe("scenario slider / investment snapshot", () => {
  it("higher price lowers yield", () => {
    const low = investmentSnapshot(DEMO_OFFER_INPUT, 5_800_000);
    const high = investmentSnapshot(DEMO_OFFER_INPUT, 6_200_000);
    assert.ok(high.netYield < low.netYield);
    assert.ok(high.ownFundsCzk > low.ownFundsCzk);
  });
});

describe("offer text draft", () => {
  it("builds ethical draft marked as MODEL", () => {
    const out = buildOfferStrategyOutput(DEMO_OFFER_INPUT);
    const draft = buildOfferTextDraft({
      strategyInput: DEMO_OFFER_INPUT,
      openingPriceCzk: out.openingScenarioCzk,
      targetPriceCzk: out.targetPriceCzk,
      propertyLabel: DEMO_PROPERTY_LABEL,
    });
    assert.equal(draft.claimKind, "MODEL");
    assert.ok(draft.ethicsNote.includes("NÁVRH TEXTU"));
    assertEthicalOfferText(draft.body);
  });

  it("rejects manipulative phrases", () => {
    assert.throws(() =>
      assertEthicalOfferText("Toto je manipulativní ultimát jen dnes.")
    );
  });
});

describe("buildOfferStrategyModel", () => {
  it("builds full model with slider range", () => {
    const model = buildOfferStrategyModel(DEMO_OFFER_INPUT, DEMO_PROPERTY_LABEL);
    assert.ok(model.sliderRange.maxCzk > model.sliderRange.minCzk);
    assert.ok(model.offerText.body.length > 50);
    assert.ok(model.methodology.length > 0);
  });
});
