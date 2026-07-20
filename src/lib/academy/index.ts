export * from "@/lib/academy/types";
export * from "@/lib/academy/catalog";

import { routes } from "@/lib/routes";

export function getAcademyLessonPath(slug: string): string {
  return `${routes.akademie}/${slug}`;
}

export * from "@/lib/academy/gamification";
