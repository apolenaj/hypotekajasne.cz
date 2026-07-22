import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeoLandingView } from "@/components/seo/SeoLandingView";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  getAllLandingSlugs,
  getLanding,
  getLandingPath,
} from "@/lib/seo/landings";
import { getPerson } from "@/lib/magazine/authors";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllLandingSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const landing = getLanding(slug);
  if (!landing) {
    return buildPageMetadata({
      title: "Téma nenalezeno",
      description: "Požadovaný průvodce tématem neexistuje.",
      path: getLandingPath(slug),
      noIndex: true,
    });
  }
  const author = getPerson(landing.authorId);
  return buildPageMetadata({
    title: landing.title,
    description: landing.description,
    path: getLandingPath(landing.slug),
    type: "article",
    publishedTime: landing.publishedAt,
    modifiedTime: landing.updatedAt,
    authors: [author.name],
  });
}

export default async function TemataSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const landing = getLanding(slug);
  if (!landing) notFound();
  return <SeoLandingView landing={landing} />;
}
