import type { Metadata } from "next";
import Link from "next/link";
import { MagazineNewsletterCta } from "@/components/magazine/MagazineNewsletterCta";
import {
  ARTICLE_METAS,
  TOPICAL_CLUSTERS,
  getArticlePath,
  getFeaturedMeta,
} from "@/lib/magazine";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { routes } from "@/lib/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Magazín — články o hypotékách a investicích",
  description:
    "SEO magazín o hypotékách, refinancování, OSVČ a zahraničním financování. YMYL: autor, review, zdroje, aktualizace.",
  path: routes.clanky,
});

type SearchParams = Promise<{ cluster?: string }>;

export default async function ClankyHubPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { cluster } = await searchParams;
  const featured = getFeaturedMeta();
  const list = cluster
    ? ARTICLE_METAS.filter((m) => m.clusters.includes(cluster as never))
    : ARTICLE_METAS;

  const sorted = [...list].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt)
  );

  return (
    <div className="bg-white">
      <header className="border-b border-border bg-gradient-to-br from-[#0b3d3a] via-[#0f4c48] to-[#1a5c4a] text-white">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-gold">
            SEO magazín
          </p>
          <h1 className="mt-3 font-heading text-3xl font-bold sm:text-4xl">
            Články a analýzy
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-white/85 sm:text-base">
            Každý článek má vlastní URL, autora, review, aktualizaci a zdroje.
            Žádné image-only karty bez obsahu.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/clanky"
            className={
              !cluster
                ? "rounded-full bg-deep-teal px-3 py-1 text-xs font-bold text-white"
                : "rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-foreground"
            }
          >
            Vše
          </Link>
          {TOPICAL_CLUSTERS.map((c) => (
            <Link
              key={c.id}
              href={`/clanky?cluster=${c.id}`}
              className={
                cluster === c.id
                  ? "rounded-full bg-deep-teal px-3 py-1 text-xs font-bold text-white"
                  : "rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-foreground"
              }
            >
              {c.label}
            </Link>
          ))}
        </div>

        {featured && !cluster ? (
          <Link
            href={getArticlePath(featured.slug)}
            className="mt-8 block overflow-hidden rounded-2xl border border-border"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={featured.hero.src}
              alt={featured.hero.alt}
              className="h-48 w-full object-cover sm:h-64"
            />
            <div className="p-6">
              <p className="text-xs font-bold uppercase text-deep-teal">
                Featured · {featured.category}
              </p>
              <h2 className="mt-2 font-heading text-2xl font-bold text-text-dark">
                {featured.title}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {featured.description}
              </p>
            </div>
          </Link>
        ) : null}

        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {sorted.map((m) => (
            <li key={m.slug}>
              <Link
                href={getArticlePath(m.slug)}
                className="block h-full rounded-xl border border-border p-5 transition hover:border-deep-teal/40"
              >
                <p className="text-[11px] font-bold uppercase text-deep-teal">
                  /clanky/{m.slug}
                </p>
                <h2 className="mt-2 font-heading text-lg font-bold text-text-dark">
                  {m.title}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                  {m.description}
                </p>
                <p className="mt-3 text-xs text-muted-foreground">
                  {m.category} · {m.readingMinutes} min · update {m.updatedAt}
                </p>
              </Link>
            </li>
          ))}
        </ul>

        {sorted.length === 0 ? (
          <p className="mt-8 text-sm text-muted-foreground">
            V tomto clusteru zatím nejsou články — připravujeme.
          </p>
        ) : null}

        <div className="mt-14">
          <MagazineNewsletterCta />
        </div>
      </div>
    </div>
  );
}
