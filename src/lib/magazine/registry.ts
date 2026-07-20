import type { MagazineArticle, MagazineArticleMeta } from "@/lib/magazine/types";
import { article as a1 } from "@/lib/magazine/articles/urokove-sazby-hypotek-2026";
import { article as a2 } from "@/lib/magazine/articles/spanelsko-apartmany-rizika-vynosy";
import { article as a3 } from "@/lib/magazine/articles/dubaj-flipping-off-plan-realita";
import { article as a4 } from "@/lib/magazine/articles/regulace-investicni-hypoteky-cr";
import { article as a5 } from "@/lib/magazine/articles/bali-leasehold-vynosy-rizika";
import { article as a6 } from "@/lib/magazine/articles/zahranicni-financovani-ceske-zajisteni";
import { article as a7 } from "@/lib/magazine/articles/refinancovani-po-fixaci-checklist";

/**
 * Plný katalog — synchronní import OK do ~desítek/nízkých stovek modulů.
 * Pro větší objem: přepněte na ARTICLE_LOADERS níže (dynamic import).
 */
export const ALL_ARTICLES: MagazineArticle[] = [a1, a2, a3, a4, a5, a6, a7];

function toMeta(a: MagazineArticle): MagazineArticleMeta {
  const { body: _b, sources: _s, relatedTools: _t, relatedArticleSlugs: _r, ...meta } =
    a;
  return meta;
}

export const ARTICLE_METAS: MagazineArticleMeta[] = ALL_ARTICLES.map(toMeta);

/** Škálování: lazy loadery (připraveno, zatím nevyužito v runtime). */
export const ARTICLE_LOADERS: Record<
  string,
  () => Promise<{ article: MagazineArticle }>
> = {
  "urokove-sazby-hypotek-2026": () =>
    import("@/lib/magazine/articles/urokove-sazby-hypotek-2026"),
  "spanelsko-apartmany-rizika-vynosy": () =>
    import("@/lib/magazine/articles/spanelsko-apartmany-rizika-vynosy"),
  "dubaj-flipping-off-plan-realita": () =>
    import("@/lib/magazine/articles/dubaj-flipping-off-plan-realita"),
  "regulace-investicni-hypoteky-cr": () =>
    import("@/lib/magazine/articles/regulace-investicni-hypoteky-cr"),
  "bali-leasehold-vynosy-rizika": () =>
    import("@/lib/magazine/articles/bali-leasehold-vynosy-rizika"),
  "zahranicni-financovani-ceske-zajisteni": () =>
    import("@/lib/magazine/articles/zahranicni-financovani-ceske-zajisteni"),
  "refinancovani-po-fixaci-checklist": () =>
    import("@/lib/magazine/articles/refinancovani-po-fixaci-checklist"),
};

export function getAllArticleSlugs(): string[] {
  return ARTICLE_METAS.map((m) => m.slug);
}

export function getArticleMeta(slug: string): MagazineArticleMeta | undefined {
  return ARTICLE_METAS.find((m) => m.slug === slug);
}

export function getArticle(slug: string): MagazineArticle | undefined {
  return ALL_ARTICLES.find((a) => a.slug === slug);
}

export async function loadArticle(
  slug: string
): Promise<MagazineArticle | undefined> {
  const loader = ARTICLE_LOADERS[slug];
  if (!loader) return getArticle(slug);
  const mod = await loader();
  return mod.article;
}

export function getArticlePath(slug: string): string {
  return `/clanky/${slug}`;
}

export function listArticlesByCluster(cluster: string): MagazineArticleMeta[] {
  return ARTICLE_METAS.filter((m) =>
    m.clusters.includes(cluster as MagazineArticleMeta["clusters"][number])
  ).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function getFeaturedMeta(): MagazineArticleMeta | undefined {
  return ARTICLE_METAS.find((m) => m.featured) ?? ARTICLE_METAS[0];
}

export function getNextArticle(
  slug: string
): MagazineArticleMeta | undefined {
  const ordered = [...ARTICLE_METAS].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt)
  );
  const i = ordered.findIndex((m) => m.slug === slug);
  if (i < 0 || i >= ordered.length - 1) return ordered[0];
  return ordered[i + 1];
}

export function getRelatedArticles(
  article: MagazineArticle
): MagazineArticleMeta[] {
  return article.relatedArticleSlugs
    .map((s) => getArticleMeta(s))
    .filter((m): m is MagazineArticleMeta => Boolean(m));
}
