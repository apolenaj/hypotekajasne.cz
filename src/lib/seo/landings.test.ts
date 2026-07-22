/**
 * SEO landing quality + architecture guards.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MAGAZINE_PEOPLE } from "@/lib/magazine/authors";
import {
  SEO_LANDING_HUB,
  SEO_LANDINGS,
  getLanding,
  getLandingPath,
  landingBodyWordCount,
} from "@/lib/seo/landings";
import { findStaticPageSeo } from "@/lib/seo/pages";
import { isDisallowedCanonicalOrigin, getSiteOrigin } from "@/lib/seo/site";

describe("SEO landings — quality first, no thin spam", () => {
  it("ships a curated set (not hundreds of pages)", () => {
    assert.ok(SEO_LANDINGS.length >= 7);
    assert.ok(SEO_LANDINGS.length <= 20);
  });

  it("covers required topic slugs", () => {
    const slugs = new Set(SEO_LANDINGS.map((l) => l.slug));
    for (const required of [
      "hypoteka-podle-prijmu",
      "hypoteka-do-36-let",
      "investicni-hypoteka",
      "hypoteka-osvc",
      "refinancovani",
      "koupe-vs-najem",
      "hypoteka-v-zahranici",
    ]) {
      assert.ok(slugs.has(required), required);
    }
  });

  it("foreign hub links countries instead of thin duplicates", () => {
    const foreign = getLanding("hypoteka-v-zahranici");
    assert.ok(foreign);
    assert.ok((foreign!.relatedCountries?.length ?? 0) >= 5);
    // No per-country thin landing under /temata
    assert.equal(getLanding("dubaj"), undefined);
    assert.equal(getLanding("spanelsko"), undefined);
  });

  it("every landing meets YMYL + SEO quality bar", () => {
    const titles = new Set<string>();
    const paths = new Set<string>();
    for (const l of SEO_LANDINGS) {
      assert.ok(l.title.length >= 30, l.slug);
      assert.ok(l.description.length >= 50, l.slug);
      assert.ok(!titles.has(l.title), `dup title ${l.title}`);
      titles.add(l.title);
      const path = getLandingPath(l.slug);
      assert.ok(!paths.has(path));
      paths.add(path);
      assert.ok(MAGAZINE_PEOPLE[l.authorId], l.authorId);
      if (l.reviewerId) {
        assert.ok(MAGAZINE_PEOPLE[l.reviewerId]);
        assert.notEqual(l.reviewerId, l.authorId);
      }
      assert.ok(l.updatedAt);
      assert.ok(l.sources.length >= 1);
      assert.ok(l.sections.length >= 2);
      assert.ok(l.relatedTools.length >= 1);
      assert.ok(landingBodyWordCount(l) >= 150, `${l.slug} too thin`);
      assert.ok(findStaticPageSeo(path), `missing STATIC_PAGE_SEO ${path}`);
    }
    assert.ok(findStaticPageSeo(SEO_LANDING_HUB.path));
  });

  it("rejects AggregateRating-style fields in landing payload", () => {
    const blob = JSON.stringify(SEO_LANDINGS);
    assert.equal(blob.includes("aggregateRating"), false);
    assert.equal(blob.includes("ratingValue"), false);
  });
});

describe("canonical domain config", () => {
  it("rejects vercel.app and localhost as canonical origins", () => {
    assert.equal(
      isDisallowedCanonicalOrigin("https://foo.vercel.app"),
      true
    );
    assert.equal(isDisallowedCanonicalOrigin("http://localhost:3000"), true);
    assert.equal(
      isDisallowedCanonicalOrigin("https://hypotekajasne.cz"),
      false
    );
    assert.ok(!getSiteOrigin().includes("vercel.app"));
  });
});
