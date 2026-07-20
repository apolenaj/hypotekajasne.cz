import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AcademyLessonView } from "@/components/academy/AcademyLessonView";
import {
  getAcademyLesson,
  getAllAcademySlugs,
  getAcademyLessonPath,
} from "@/lib/academy";
import { buildPageMetadata } from "@/lib/seo/metadata";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllAcademySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const lesson = getAcademyLesson(slug);
  if (!lesson) {
    return buildPageMetadata({
      title: "Lekce nenalezena",
      description: "Požadovaná lekce akademie neexistuje.",
      path: getAcademyLessonPath(slug),
      noIndex: true,
    });
  }
  return buildPageMetadata({
    title: `${lesson.title} | Hypoteční akademie`,
    description: lesson.description,
    path: getAcademyLessonPath(slug),
  });
}

export default async function AkademieLessonPage({ params }: PageProps) {
  const { slug } = await params;
  const lesson = getAcademyLesson(slug);
  if (!lesson) notFound();
  return <AcademyLessonView lesson={lesson} />;
}
