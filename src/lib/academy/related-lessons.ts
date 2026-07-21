/**
 * Strong internal links for core mortgage-mechanics cluster:
 * LTV ↔ DTI ↔ DSTI ↔ RPSN ↔ fixace (+ kalkulačky).
 */

import { routes } from "@/lib/routes";
import { ACADEMY_LESSONS, getAcademyLesson } from "@/lib/academy/catalog";

/** Core SEO / learning cluster — keep in sync with academy.test.ts */
export const MORTGAGE_MECHANICS_CLUSTER = [
  "ltv",
  "dti",
  "dsti",
  "rpsn",
  "fixace",
] as const;

export type MortgageMechanicsSlug =
  (typeof MORTGAGE_MECHANICS_CLUSTER)[number];

export function isMortgageMechanicsSlug(
  slug: string
): slug is MortgageMechanicsSlug {
  return (MORTGAGE_MECHANICS_CLUSTER as readonly string[]).includes(slug);
}

export type RelatedLessonLink = {
  slug: string;
  title: string;
  href: string;
  shortLabel: string;
};

export type RelatedToolLink = {
  label: string;
  href: string;
};

function lessonPath(slug: string): string {
  return `${routes.akademie}/${slug}`;
}

/** Peer lessons in the mechanics cluster (excludes current). */
export function getRelatedMechanicsLessons(
  slug: string
): RelatedLessonLink[] {
  if (!isMortgageMechanicsSlug(slug)) return [];
  return MORTGAGE_MECHANICS_CLUSTER.filter((s) => s !== slug).map((s) => {
    const lesson = getAcademyLesson(s)!;
    return {
      slug: s,
      title: lesson.title,
      shortLabel: lesson.shortLabel,
      href: lessonPath(s),
    };
  });
}

/**
 * Extra calculator / readiness bridges for mechanics lessons
 * (merged with catalog relatedTools in the UI — deduped by href).
 */
export function getMechanicsBridgeTools(slug: string): RelatedToolLink[] {
  if (!isMortgageMechanicsSlug(slug)) return [];
  const bridges: RelatedToolLink[] = [
    { label: "Kalkulačky", href: routes.kalkulacky.root },
    { label: "Hypoteční připravenost", href: routes.navrhNaMiru },
    { label: "Vzdělávací cesty", href: `${routes.akademie}/cesty` },
  ];
  if (slug === "fixace") {
    bridges.push({
      label: "Refinancovací radar",
      href: routes.refinanceRadar,
    });
  }
  if (slug === "ltv" || slug === "dsti" || slug === "dti") {
    bridges.push({
      label: "Investiční rentgen",
      href: routes.investicniRentgen,
    });
  }
  return bridges;
}

/** Sanity: every cluster slug exists in the catalog. */
export function assertMechanicsClusterComplete(): string[] {
  return MORTGAGE_MECHANICS_CLUSTER.filter(
    (s) => !ACADEMY_LESSONS.some((l) => l.slug === s)
  );
}
