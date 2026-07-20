import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AcademyPathDetail } from "@/components/academy/AcademyPathsHub";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { crumbs } from "@/lib/seo/breadcrumbs";
import {
  LEARNING_PATH_IDS,
  getLearningPath,
  type LearningPathId,
} from "@/lib/academy/gamification";
import { routes } from "@/lib/routes";

export function generateStaticParams() {
  return LEARNING_PATH_IDS.map((id) => ({ pathId: id }));
}

type Props = { params: Promise<{ pathId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pathId } = await params;
  const path = getLearningPath(pathId as LearningPathId);
  if (!path) {
    return buildPageMetadata({
      title: "Vzdělávací cesta",
      description: "Cesta nenalezena.",
      path: `${routes.akademie}/cesty/${pathId}`,
    });
  }
  return buildPageMetadata({
    title: `${path.title} | Hypoteční akademie`,
    description: path.subtitle,
    path: `${routes.akademie}/cesty/${pathId}`,
  });
}

export default async function AcademyPathPage({ params }: Props) {
  const { pathId } = await params;
  const path = getLearningPath(pathId as LearningPathId);
  if (!path) notFound();

  return (
    <div className="bg-white">
      <div className="border-b border-border bg-[#f7f8f7]">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <Breadcrumbs
            items={crumbs(
              { name: "Akademie", path: routes.akademie },
              { name: "Vzdělávací cesty", path: `${routes.akademie}/cesty` },
              { name: path.title, path: `${routes.akademie}/cesty/${pathId}` }
            )}
          />
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Link href={routes.akademie} className="text-sm text-deep-teal underline">
          ← Zpět na akademii
        </Link>
        <div className="mt-6">
          <AcademyPathDetail pathId={path.id} />
        </div>
      </div>
    </div>
  );
}
