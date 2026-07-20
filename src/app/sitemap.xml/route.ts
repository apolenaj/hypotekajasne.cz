import { absoluteUrl } from "@/lib/seo/site";
import { SITEMAP_BUCKETS } from "@/lib/seo/sitemap-data";

/**
 * XML sitemap index — points at bucket sitemaps.
 * Production canonical host only (see getSiteOrigin).
 */
export function GET() {
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${SITEMAP_BUCKETS.map(
  (id) => `  <sitemap>
    <loc>${absoluteUrl(`/sitemap/${id}.xml`)}</loc>
  </sitemap>`
).join("\n")}
</sitemapindex>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
