import { routes } from "@/lib/routes";

/** Canonical lesson URL — keep out of gamification barrel to avoid circular imports. */
export function getAcademyLessonPath(slug: string): string {
  return `${routes.akademie}/${slug}`;
}
