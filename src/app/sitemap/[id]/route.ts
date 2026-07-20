import type { MetadataRoute } from "next";
import {
  buildSitemapBucket,
  type SitemapBucketId,
  SITEMAP_BUCKETS,
} from "@/lib/seo/sitemap-data";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return SITEMAP_BUCKETS.map((id) => ({ id: `${id}.xml` }));
}

function parseId(raw: string): SitemapBucketId | null {
  const id = raw.replace(/\.xml$/, "") as SitemapBucketId;
  return SITEMAP_BUCKETS.includes(id) ? id : null;
}

/** Bucket sitemaps under /sitemap/[id].xml */
export async function GET(
  _req: Request,
  { params }: Props
): Promise<Response> {
  const { id: raw } = await params;
  const id = parseId(raw);
  if (!id) {
    return new Response("Not found", { status: 404 });
  }

  const entries = buildSitemapBucket(id);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map((e) => {
    const last =
      e.lastModified instanceof Date
        ? e.lastModified.toISOString()
        : e.lastModified
          ? new Date(e.lastModified).toISOString()
          : undefined;
    return `  <url>
    <loc>${e.url}</loc>${last ? `\n    <lastmod>${last}</lastmod>` : ""}${
      e.changeFrequency
        ? `\n    <changefreq>${e.changeFrequency}</changefreq>`
        : ""
    }${e.priority != null ? `\n    <priority>${e.priority}</priority>` : ""}
  </url>`;
  })
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

/** Type helper for MetadataRoute consumers / tests */
export function asMetadataSitemap(id: SitemapBucketId): MetadataRoute.Sitemap {
  return buildSitemapBucket(id);
}
