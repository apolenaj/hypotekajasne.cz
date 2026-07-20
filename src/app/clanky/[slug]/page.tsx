import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getArticle } from "@/lib/magazine";
import { MagazineArticleView } from "@/components/magazine/MagazineArticleView";
import { getAllArticleSlugs } from "@/lib/magazine";
import { notFound } from "next/navigation";
import { routes } from "@/lib/routes";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllArticleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) {
    return buildPageMetadata({
      title: "Článek nenalezen",
      description: "Požadovaný článek neexistuje.",
      path: `${routes.clanky}/${slug}`,
      noIndex: true,
    });
  }
  return buildPageMetadata({
    title: article.title,
    description: article.description,
    path: `${routes.clanky}/${slug}`,
    type: "article",
    publishedTime: article.publishedAt,
    modifiedTime: article.updatedAt,
    authors: [article.authorId],
    ogImage: {
      url: article.hero.src,
      alt: article.hero.alt,
    },
  });
}

export default async function ClanekPage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();
  return <MagazineArticleView article={article} />;
}
