import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ACADEMY_LESSONS,
  getAcademyLesson,
  getAllAcademySlugs,
  EMPTY_MEDIA_PLANNED,
} from "@/lib/academy";

describe("academy catalog", () => {
  it("includes required SEO slugs", () => {
    const slugs = getAllAcademySlugs();
    for (const required of [
      "ltv",
      "rpsn",
      "fixace",
      "dti",
      "dsti",
      "americka-hypoteka",
      "freehold-vs-leasehold",
      "off-plan",
    ]) {
      assert.ok(slugs.includes(required), `missing ${required}`);
    }
  });

  it("every lesson has simplySaid not child wording field", () => {
    for (const l of ACADEMY_LESSONS) {
      assert.ok(l.simplySaid.length > 20);
      assert.ok(l.realExample.length > 10);
      assert.ok(l.howCalculated.length > 10);
      assert.ok(l.bankOrInvestor.length > 10);
      assert.ok(l.commonMistake.length > 10);
      assert.ok(l.faq.length >= 1);
      assert.ok(l.sources.length >= 1);
      assert.ok(l.relatedTools.length >= 1);
      assert.ok(l.cta.href);
      assert.equal(l.derivatives.length, 6);
    }
  });

  it("media defaults are PLANNED without fake src", () => {
    const m = EMPTY_MEDIA_PLANNED();
    assert.equal(m.video.status, "PLANNED");
    assert.equal(m.video.src, null);
    assert.equal(m.audio.src, null);
    const ltv = getAcademyLesson("ltv");
    assert.ok(ltv);
    assert.equal(ltv!.media.video.src, null);
  });
});
