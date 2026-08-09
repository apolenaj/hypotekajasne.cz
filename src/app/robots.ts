import type { MetadataRoute } from "next";
import { ROBOTS_DISALLOW_PATHS } from "@/lib/seo/indexation";
import { getSiteOrigin, shouldNoIndex } from "@/lib/seo/site";
import { SITEMAP_BUCKETS } from "@/lib/seo/sitemap-data";

export default function robots(): MetadataRoute.Robots {
  const origin = getSiteOrigin();

  if (shouldNoIndex()) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [...ROBOTS_DISALLOW_PATHS],
      },
    ],
    sitemap: SITEMAP_BUCKETS.map((id) => `${origin}/sitemap/${id}.xml`),
    host: origin.replace(/^https?:\/\//, ""),
  };
}
