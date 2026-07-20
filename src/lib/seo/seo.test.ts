/**
 * Automated technical SEO checks (no network).
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  absoluteUrl,
  getSiteOrigin,
  PRODUCTION_ORIGIN,
  shouldNoIndex,
} from "@/lib/seo/site";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { STATIC_PAGE_SEO, countryGuideSeoEntries } from "@/lib/seo/pages";
import {
  articleJsonLd,
  breadcrumbListJsonLd,
  courseJsonLd,
  faqPageJsonLd,
  organizationJsonLd,
  videoObjectJsonLd,
  webApplicationJsonLd,
} from "@/lib/seo/json-ld";
import {
  buildSitemapBucket,
  SITEMAP_BUCKETS,
  sitemapIndexEntries,
} from "@/lib/seo/sitemap-data";
import { formatCurrency, formatDate, formatNumber } from "@/lib/i18n/format";
import { LOCALES, localizedPath, stripLocalePrefix } from "@/lib/i18n/config";
import { PUBLISHED_EN_PATHS } from "@/lib/i18n/messages";

describe("site canonical strategy", () => {
  it("uses production hypotekajasne.cz origin by default", () => {
    assert.equal(getSiteOrigin(), PRODUCTION_ORIGIN);
    assert.ok(absoluteUrl("/clanky").startsWith("https://hypotekajasne.cz"));
    assert.equal(absoluteUrl("/"), "https://hypotekajasne.cz");
  });

  it("never treats vercel.app as required canonical host in helper", () => {
    assert.ok(!getSiteOrigin().includes("vercel.app"));
  });
});

describe("unique titles & descriptions", () => {
  it("STATIC_PAGE_SEO titles are unique", () => {
    const titles = STATIC_PAGE_SEO.map((p) => p.title);
    assert.equal(titles.length, new Set(titles).size);
  });

  it("STATIC_PAGE_SEO paths are unique", () => {
    const paths = STATIC_PAGE_SEO.map((p) => p.path);
    assert.equal(paths.length, new Set(paths).size);
  });

  it("every static page has non-empty description >= 50 chars", () => {
    for (const p of STATIC_PAGE_SEO) {
      assert.ok(p.description.length >= 50, p.path);
    }
  });

  it("country hubs have unique paths", () => {
    const paths = countryGuideSeoEntries().map((p) => p.path);
    assert.equal(paths.length, new Set(paths).size);
  });
});

describe("metadata builder", () => {
  it("sets canonical and openGraph url on production host", () => {
    const m = buildPageMetadata({
      title: "Test page",
      description:
        "A sufficiently long description for SEO testing purposes here.",
      path: "/faq",
    });
    assert.equal(m.alternates?.canonical, "https://hypotekajasne.cz/faq");
    assert.equal(
      (m.openGraph as { url?: string } | undefined)?.url,
      "https://hypotekajasne.cz/faq"
    );
    assert.ok(m.twitter);
  });

  it("includes hreflang en only for published EN paths", () => {
    const home = buildPageMetadata({
      title: "Home",
      description:
        "A sufficiently long description for SEO testing purposes here.",
      path: "/",
      alternatePath: { cs: "/", en: "/en" },
    });
    const langs = (home.alternates?.languages ?? {}) as Record<string, string>;
    assert.equal(langs["cs-CZ"], "https://hypotekajasne.cz");
    assert.ok(PUBLISHED_EN_PATHS.has("/en"));
    assert.equal(langs.en, "https://hypotekajasne.cz/en");
  });

  it("respects noIndex flag", () => {
    const m = buildPageMetadata({
      title: "Hidden",
      description:
        "A sufficiently long description for SEO testing purposes here.",
      path: "/dekujeme",
      noIndex: true,
    });
    assert.equal((m.robots as { index?: boolean }).index, false);
  });
});

describe("sitemap index", () => {
  it("exposes four buckets", () => {
    assert.deepEqual(SITEMAP_BUCKETS, [
      "pages",
      "articles",
      "academy",
      "countries",
    ]);
    const index = sitemapIndexEntries();
    assert.equal(index.length, 4);
    assert.ok(index.every((e) => e.url.includes("/sitemap/")));
  });

  it("pages bucket includes home and faq", () => {
    const urls = buildSitemapBucket("pages").map((e) => e.url);
    assert.ok(urls.some((u) => u === "https://hypotekajasne.cz"));
    assert.ok(urls.some((u) => u.includes("/faq")));
  });

  it("articles and academy buckets are non-empty", () => {
    assert.ok(buildSitemapBucket("articles").length > 0);
    assert.ok(buildSitemapBucket("academy").length > 0);
    assert.ok(buildSitemapBucket("countries").length > 0);
  });
});

describe("json-ld — no fake reviews", () => {
  it("organization has no aggregateRating", () => {
    const org = organizationJsonLd();
    assert.equal(org["@type"], "Organization");
    assert.equal(org.aggregateRating, undefined);
    assert.equal(org.review, undefined);
  });

  it("article schema matches visible fields", () => {
    const a = articleJsonLd({
      headline: "Test",
      description: "Desc",
      path: "/clanky/test",
      imageUrl: "https://example.com/x.jpg",
      datePublished: "2026-01-01",
      dateModified: "2026-01-02",
      authorName: "Autor",
      reviewerName: "Reviewer",
    });
    assert.equal(a["@type"], "Article");
    assert.equal(a.aggregateRating, undefined);
  });

  it("course / faq / webapp / video / breadcrumbs types", () => {
    assert.equal(
      courseJsonLd({ name: "LTV", description: "d", path: "/akademie/ltv" })[
        "@type"
      ],
      "Course"
    );
    assert.equal(
      faqPageJsonLd([{ question: "Q?", answer: "A." }])["@type"],
      "FAQPage"
    );
    assert.equal(
      webApplicationJsonLd({
        name: "Calc",
        description: "d",
        path: "/kalkulacky",
      })["@type"],
      "WebApplication"
    );
    assert.equal(
      videoObjectJsonLd({
        name: "V",
        description: "d",
        thumbnailUrl: "https://example.com/t.jpg",
        contentUrl: "https://example.com/v.mp4",
        uploadDate: "2026-01-01",
        transcript: "Hello transcript",
      }).transcript,
      "Hello transcript"
    );
    const bc = breadcrumbListJsonLd([
      { name: "Domů", path: "/" },
      { name: "FAQ", path: "/faq" },
    ]);
    assert.equal(bc["@type"], "BreadcrumbList");
  });
});

describe("i18n architecture", () => {
  it("supports cs and en", () => {
    assert.deepEqual([...LOCALES], ["cs", "en"]);
  });

  it("keeps Czech at root; English under /en", () => {
    assert.equal(localizedPath("cs", "/faq"), "/faq");
    assert.equal(localizedPath("en", "/"), "/en");
    assert.equal(localizedPath("en", "/faq"), "/en/faq");
  });

  it("stripLocalePrefix detects en", () => {
    assert.deepEqual(stripLocalePrefix("/en"), { locale: "en", path: "/" });
    assert.deepEqual(stripLocalePrefix("/faq"), {
      locale: "cs",
      path: "/faq",
    });
  });

  it("formats currency/number/date by locale", () => {
    assert.ok(formatCurrency(1_000_000, "cs").includes("1"));
    assert.ok(formatNumber(1234.5, "en").length > 0);
    assert.ok(formatDate("2026-07-19", "cs").length > 0);
  });
});

describe("preview noindex helper", () => {
  it("shouldNoIndex is boolean", () => {
    assert.equal(typeof shouldNoIndex(), "boolean");
  });
});
