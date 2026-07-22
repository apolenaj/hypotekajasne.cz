/**
 * SEO magazín — datový model vhodný pro stovky článků.
 *
 * Architektura:
 * - `registry` drží lehké meta (listing, hub, generateStaticParams)
 * - `articles/<slug>.ts` drží plné body + YMYL pole
 * - nad ~100 články přepněte registry na dynamic import loaders (viz ARTICLE_LOADERS)
 */

export type TopicalCluster =
  | "hypoteky"
  | "osvc"
  | "refinancovani"
  | "investicni-hypoteky"
  | "zahranicni-financovani"
  | "cr"
  | "dubaj"
  | "spanelsko"
  | "italie"
  | "chorvatsko"
  | "bali"
  | "saudska-arabie"
  | "slovensko"
  | "investicni-analyza";

export type MagazineCategory =
  | "Hypotéky"
  | "OSVČ"
  | "Refinancování"
  | "Investiční hypotéky"
  | "Zahraniční financování"
  | "Investiční analýza"
  | "Makroekonomika";

export type BodyBlock =
  | { type: "p"; text: string }
  | { type: "h2"; id: string; text: string }
  | { type: "ul"; items: string[] }
  | { type: "callout"; tone: "info" | "warn"; text: string };

export type MagazinePerson = {
  id: string;
  name: string;
  role: string;
  bio: string;
  credentials?: string;
  /** Public profile URL for Person schema (e.g. /o-nas#id) */
  url?: string;
};

export type MagazineSource = {
  label: string;
  url?: string;
  note?: string;
};

export type MagazineRelatedTool = {
  label: string;
  href: string;
};

export type MagazineHero = {
  src: string;
  alt: string;
};

/** Lehký záznam pro hub / filtry / SSG — bez body */
export type MagazineArticleMeta = {
  slug: string;
  title: string;
  description: string;
  category: MagazineCategory;
  clusters: TopicalCluster[];
  authorId: string;
  /** Only when a real named reviewer exists — never invent. */
  reviewerId?: string;
  publishedAt: string;
  updatedAt: string;
  factCheckedAt: string;
  country: string | null;
  financialTopics: string[];
  featured?: boolean;
  hero: MagazineHero;
  readingMinutes: number;
};

/** Plný článek pro detail page */
export type MagazineArticle = MagazineArticleMeta & {
  body: BodyBlock[];
  sources: MagazineSource[];
  relatedTools: MagazineRelatedTool[];
  relatedArticleSlugs: string[];
};
