import type { MetadataRoute } from "next";
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
        disallow: [
          "/api/",
          "/dekujeme",
          "/moje-moznosti",
          "/dashboard",
          "/reporty/sdilet/",
        ],
      },
    ],
    sitemap: SITEMAP_BUCKETS.map((id) => `${origin}/sitemap/${id}.xml`),
    host: origin.replace(/^https?:\/\//, ""),
  };
}
