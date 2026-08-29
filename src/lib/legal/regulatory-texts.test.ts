import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildLeadFormIntakeDisclosure,
  buildRegulatoryPlatformBlock,
  CALCULATOR_DISCLAIMER,
  CNB_INVESTMENT_RECOMMENDATION_TITLE,
  collectPublicRegulatoryStrings,
  containsPublicForbiddenPlaceholder,
  getCooperationWordingNeutral,
  getJerrsRegistryUrl,
  INTERMEDIARY_PENDING_MARKER,
  PLATFORM_NEUTRAL_FALLBACK,
  RATES_DISCLAIMER,
  rt,
} from "@/lib/legal/regulatory-texts";
import type { Locale } from "@/lib/i18n/config";

const LOCALES: Locale[] = ["cs", "en"];

describe("regulatory-texts", () => {
  it("uses unified calculator disclaimer CS/EN", () => {
    assert.match(
      rt("cs", CALCULATOR_DISCLAIMER),
      /nepředstavuje nabídku úvěru ani úvěrové doporučení/
    );
    assert.match(
      rt("en", CALCULATOR_DISCLAIMER),
      /does not constitute a loan offer or credit recommendation/
    );
  });

  it("uses unified rates disclaimer CS/EN", () => {
    assert.match(rt("cs", RATES_DISCLAIMER), /orientační/);
    assert.match(rt("en", RATES_DISCLAIMER), /indicative/i);
  });

  it("investment recommendation uses precise CNB title", () => {
    assert.equal(
      rt("cs", CNB_INVESTMENT_RECOMMENDATION_TITLE),
      "Doporučení ČNB pro investiční hypotéky"
    );
  });

  it("unverified partner uses neutral platform fallback without intermediary claim", () => {
    for (const locale of LOCALES) {
      const block = buildRegulatoryPlatformBlock(locale);
      assert.equal(block.platformLine, rt(locale, PLATFORM_NEUTRAL_FALLBACK));
      assert.equal(block.intermediaryLine, null);
      assert.equal(block.usesVerifiedIntermediary, false);
      assert.equal(block.intermediary.legalApprovalStatus, "neutral_fallback");
      assert.ok(!containsPublicForbiddenPlaceholder(block.platformLine));
      if (block.intermediaryLine) {
        assert.ok(!containsPublicForbiddenPlaceholder(block.intermediaryLine));
      }
    }
  });

  it("cooperation wording is neutral in all locales", () => {
    for (const locale of LOCALES) {
      const text = getCooperationWordingNeutral(locale);
      assert.match(text, /HEINZKE/i);
      assert.doesNotMatch(text, /INSIA/i);
      assert.doesNotMatch(text, /licenc/i);
      assert.ok(!containsPublicForbiddenPlaceholder(text));
    }
  });

  it("public regulatory strings never expose internal placeholders", () => {
    for (const locale of LOCALES) {
      for (const text of collectPublicRegulatoryStrings(locale)) {
        assert.ok(
          !containsPublicForbiddenPlaceholder(text),
          `Forbidden placeholder in ${locale}: ${text.slice(0, 120)}`
        );
        assert.ok(!text.includes(INTERMEDIARY_PENDING_MARKER.cs));
        assert.ok(!text.includes(INTERMEDIARY_PENDING_MARKER.en));
      }
    }
  });

  it("JERRS intro URL is published for CS and EN", () => {
    assert.match(getJerrsRegistryUrl("cs"), /jerrs\.cnb\.cz/);
    assert.match(getJerrsRegistryUrl("en"), /p_lang=en/);
  });

  it("lead form disclosure names operator and contact follow-up", () => {
    const cs = buildLeadFormIntakeDisclosure("cs");
    const en = buildLeadFormIntakeDisclosure("en");
    assert.match(cs, /HEINZKE/i);
    assert.match(cs, /přijímá provozovatel/i);
    assert.match(cs, /kontaktuje/i);
    assert.match(en, /received by/i);
    assert.match(en, /will contact you/i);
    assert.doesNotMatch(cs, /INSIA/i);
    assert.doesNotMatch(en, /INSIA/i);
  });

  it("PLATFORM_NEUTRAL_FALLBACK matches required public copy", () => {
    assert.equal(
      rt("cs", PLATFORM_NEUTRAL_FALLBACK),
      "Hypotéka Jasně je informační a kontaktní platforma. Konečné podmínky úvěru stanoví banka po individuálním posouzení."
    );
    assert.equal(
      rt("en", PLATFORM_NEUTRAL_FALLBACK),
      "Hypotéka Jasně is an information and contact platform. Final loan terms are determined by the bank following an individual assessment."
    );
  });
});
