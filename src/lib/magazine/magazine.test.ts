import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ALL_ARTICLES,
  ARTICLE_METAS,
  TOPICAL_CLUSTERS,
  getArticle,
  getAllArticleSlugs,
  getPerson,
  MAGAZINE_PEOPLE,
} from "@/lib/magazine";

const FAKE_REVIEWER_IDS = ["reviewer-compliance", "analytička-hj"];

describe("magazine YMYL + architecture", () => {
  it("every article has slug, author, dates, sources; reviewer only if real", () => {
    for (const a of ALL_ARTICLES) {
      assert.ok(a.slug.length > 2);
      assert.ok(a.authorId);
      assert.ok(MAGAZINE_PEOPLE[a.authorId], `unknown author ${a.authorId}`);
      assert.ok(!FAKE_REVIEWER_IDS.includes(a.authorId));
      if (a.reviewerId) {
        assert.ok(
          MAGAZINE_PEOPLE[a.reviewerId],
          `unknown reviewer ${a.reviewerId}`
        );
        assert.ok(!FAKE_REVIEWER_IDS.includes(a.reviewerId));
        assert.notEqual(a.reviewerId, a.authorId);
      }
      assert.ok(a.publishedAt);
      assert.ok(a.updatedAt);
      assert.ok(a.factCheckedAt);
      assert.ok(a.sources.length >= 1);
      assert.ok(a.body.length >= 2);
      assert.ok(a.clusters.length >= 1);
      assert.ok(a.relatedTools.length >= 1);
      // Person name resolves
      assert.notEqual(getPerson(a.authorId).name, "Neuvedeno");
    }
  });

  it("defines topical clusters requested", () => {
    const ids = TOPICAL_CLUSTERS.map((c) => c.id);
    for (const required of [
      "hypoteky",
      "osvc",
      "refinancovani",
      "investicni-hypoteky",
      "zahranicni-financovani",
      "cr",
      "dubaj",
      "spanelsko",
      "italie",
      "chorvatsko",
      "bali",
      "saudska-arabie",
      "slovensko",
      "investicni-analyza",
    ]) {
      assert.ok(ids.includes(required as never), required);
    }
  });

  it("rejects sensational s.r.o. záchrana claim", () => {
    const blob = JSON.stringify(ALL_ARTICLES).toLowerCase();
    assert.equal(blob.includes("s.r.o. vaší záchranou"), false);
    assert.equal(blob.includes("s.r.o. je vaše záchrana"), false);
    assert.equal(blob.includes("je vaší záchranou"), false);
  });

  it("slugs are unique and loadable", () => {
    const slugs = getAllArticleSlugs();
    assert.equal(new Set(slugs).size, slugs.length);
    assert.equal(ARTICLE_METAS.length, ALL_ARTICLES.length);
    assert.ok(getArticle("regulace-investicni-hypoteky-cr"));
  });
});
