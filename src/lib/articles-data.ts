/**
 * @deprecated Použijte `@/lib/magazine`. Shim pro CountryInvestmentHub.
 */
import {
  ARTICLE_METAS,
  getArticlePath,
  type MagazineArticleMeta,
} from "@/lib/magazine";

export type ArticleCategory = string;

export interface Article {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  targetCountry?: string;
  readTime: string;
  date: string;
  image: string;
  featured: boolean;
  content: string;
  slug: string;
  href: string;
}

function metaToLegacy(m: MagazineArticleMeta, index: number): Article {
  return {
    id: index + 1,
    title: m.title,
    excerpt: m.description,
    category: m.category,
    targetCountry: m.country ?? undefined,
    readTime: `${m.readingMinutes} min čtení`,
    date: m.publishedAt,
    image: m.hero.src,
    featured: Boolean(m.featured),
    content: "",
    slug: m.slug,
    href: getArticlePath(m.slug),
  };
}

export const articlesData: Article[] = ARTICLE_METAS.map(metaToLegacy);

export const articleCategories = [
  "Vše",
  ...Array.from(new Set(ARTICLE_METAS.map((m) => m.category))),
];

export function getFeaturedArticle(): Article | undefined {
  const i = ARTICLE_METAS.findIndex((m) => m.featured);
  if (i < 0) return articlesData[0];
  return articlesData[i];
}

export function getArticleById(id: number): Article | undefined {
  return articlesData.find((a) => a.id === id);
}

export function getArticlesByCategory(
  category: string,
  excludeFeatured = true
): Article[] {
  return articlesData.filter((a) => {
    if (excludeFeatured && a.featured) return false;
    if (category === "Vše") return true;
    return a.category === category;
  });
}
