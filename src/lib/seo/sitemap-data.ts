import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo/site";
import {
  STATIC_PAGE_SEO,
  countryGuideSeoEntries,
} from "@/lib/seo/pages";
import { getAllArticleSlugs, getArticle } from "@/lib/magazine";
import { ACADEMY_LESSONS } from "@/lib/academy";
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
    return STATIC_PAGE_SEO.filter((p) => p.path !== "/dekujeme").map((p) => ({
      url: absoluteUrl(p.path),
      lastModified: now,
      changeFrequency: p.changeFrequency ?? "weekly",
      priority: p.priority ?? 0.5,
    }));
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
    return ACADEMY_LESSONS.map((lesson) => ({
      url: absoluteUrl(`${routes.akademie}/${lesson.slug}`),
      lastModified: new Date(lesson.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  }

  return countryGuideSeoEntries().map((p) => ({
    url: absoluteUrl(p.path),
    lastModified: now,
    changeFrequency: p.changeFrequency ?? "weekly",
    priority: p.priority ?? 0.7,
  }));
}
