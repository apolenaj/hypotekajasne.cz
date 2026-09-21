import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PracticeGuideView } from "@/components/academy/practice/PracticeGuideView";
import {
  getAllPracticeSlugs,
  getPracticeGuide,
  practiceGuidePath,
} from "@/lib/academy/practice";
import { buildPageMetadata } from "@/lib/seo/metadata";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllPracticeSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getPracticeGuide(slug);
  if (!guide) {
    return buildPageMetadata({
      title: "Průvodce nenalezen",
      description: "Požadovaný průvodce Hypotéky v praxi neexistuje.",
      path: practiceGuidePath(slug),
      noIndex: true,
    });
  }
  return buildPageMetadata({
    title: `${guide.title} | Hypotéky v praxi`,
    description: guide.cardBlurb,
    path: practiceGuidePath(guide.slug),
  });
}

export default async function HypotekyVPraxiGuidePage({ params }: PageProps) {
  const { slug } = await params;
  const guide = getPracticeGuide(slug);
  if (!guide) notFound();
  return <PracticeGuideView guide={guide} />;
}
