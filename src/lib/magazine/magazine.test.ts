import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ALL_ARTICLES,
  ARTICLE_METAS,
  TOPICAL_CLUSTERS,
  getArticle,
  getAllArticleSlugs,
} from "@/lib/magazine";

describe("magazine YMYL + architecture", () => {
  it("every article has slug, author, reviewer, dates, sources", () => {
    for (const a of ALL_ARTICLES) {
      assert.ok(a.slug.length > 2);
      assert.ok(a.authorId);
      assert.ok(a.reviewerId);
      assert.ok(a.publishedAt);
      assert.ok(a.updatedAt);
      assert.ok(a.factCheckedAt);
      assert.ok(a.sources.length >= 1);
      assert.ok(a.body.length >= 2);
      assert.ok(a.clusters.length >= 1);
      assert.ok(a.relatedTools.length >= 1);
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
