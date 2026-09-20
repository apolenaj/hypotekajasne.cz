import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { PracticalSituationPage } from "@/components/practical-situations/PracticalSituationPage";
import { SeoLandingView } from "@/components/seo/SeoLandingView";
import {
  getPracticalTopic,
  PRACTICAL_TOPICS,
} from "@/lib/practical-situations/catalog";
import { crumbs } from "@/lib/seo/breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  getAllLandingSlugs,
  getLanding,
  getLandingPath,
} from "@/lib/seo/landings";
import { getPerson } from "@/lib/magazine/authors";
import { routes } from "@/lib/routes";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  const landingSlugs = getAllLandingSlugs().map((slug) => ({ slug }));
  const practicalSlugs = PRACTICAL_TOPICS.map((t) => ({ slug: t.slug }));
  return [...landingSlugs, ...practicalSlugs];
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const practical = getPracticalTopic(slug);
  if (practical) {
    return buildPageMetadata({
      title: practical.title,
      description: practical.lead,
      path: `${routes.temata}/${practical.slug}`,
    });
  }
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
  const practical = getPracticalTopic(slug);
  if (practical) {
    return (
      <>
        <div className="border-b border-border bg-[#f7f8f7]">
          <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6 lg:px-8">
            <Breadcrumbs
              items={crumbs(
                {
                  name: "Praktické situace",
                  path: routes.pruvodce.praktickeSituace,
                },
                {
                  name: practical.shortTitle,
                  path: `${routes.temata}/${practical.slug}`,
                }
              )}
            />
          </div>
        </div>
        <PracticalSituationPage topic={practical} />
      </>
    );
  }
  const landing = getLanding(slug);
  if (!landing) notFound();
  return <SeoLandingView landing={landing} />;
}
