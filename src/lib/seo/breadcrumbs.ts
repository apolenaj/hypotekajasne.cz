import type { BreadcrumbItem } from "@/lib/seo/json-ld";

export function homeCrumb(): BreadcrumbItem {
  return { name: "Domů", path: "/" };
}

export function crumbs(...items: BreadcrumbItem[]): BreadcrumbItem[] {
  return [homeCrumb(), ...items];
}
