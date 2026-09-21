import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo/site";
import {
  STATIC_PAGE_SEO,
  countryGuideSeoEntries,
} from "@/lib/seo/pages";
import { getAllArticleSlugs, getArticle } from "@/lib/magazine";
import { ACADEMY_LESSONS } from "@/lib/academy";
import { LEARNING_PATHS } from "@/lib/academy/gamification";
import { PRACTICE_GUIDES, practiceGuidePath } from "@/lib/academy/practice";
import { routes } from "@/lib/routes";

export type SitemapBucketId = "pages" | "articles" | "academy" | "countries";

export const SITEMAP_BUCKETS: SitemapBucketId[] = [
  "pages",
  "articles",
  "academy",
  "countries",
];

export function sitemapIndexEntries(): { id: SitemapBucketId; url: string }[] {
  return SITEMAP_BUCKETS.map((id) => ({
    id,
    url: absoluteUrl(`/sitemap/${id}.xml`),
  }));
}

export function buildSitemapBucket(
  id: SitemapBucketId
): MetadataRoute.Sitemap {
  const now = new Date();

  if (id === "pages") {
    return STATIC_PAGE_SEO.filter((p) => !p.noIndex && p.path !== "/dekujeme").map(
      (p) => ({
        url: absoluteUrl(p.path),
        lastModified: now,
        changeFrequency: p.changeFrequency ?? "weekly",
        priority: p.priority ?? 0.5,
      })
    );
  }

  if (id === "articles") {
    return getAllArticleSlugs().map((slug) => {
      const a = getArticle(slug);
      return {
        url: absoluteUrl(`${routes.clanky}/${slug}`),
        lastModified: a ? new Date(a.updatedAt) : now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      };
    });
  }

  if (id === "academy") {
    const lessons = ACADEMY_LESSONS.map((lesson) => ({
      url: absoluteUrl(`${routes.akademie}/${lesson.slug}`),
      lastModified: new Date(lesson.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
    // Hub /akademie/cesty and /akademie/hypoteky-v-praxi are in pages sitemap via STATIC_PAGE_SEO.
    const paths = LEARNING_PATHS.map((p) => ({
      url: absoluteUrl(`${routes.akademie}/cesty/${p.id}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.65,
    }));
    const practice = PRACTICE_GUIDES.map((guide) => ({
      url: absoluteUrl(practiceGuidePath(guide.slug)),
      lastModified: new Date(guide.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.75,
    }));
    return [...paths, ...practice, ...lessons];
  }

  return countryGuideSeoEntries().map((p) => ({
    url: absoluteUrl(p.path),
    lastModified: now,
    changeFrequency: p.changeFrequency ?? "weekly",
    priority: p.priority ?? 0.7,
  }));
}
