/**
 * Phase 5 — route indexation policy (code SoT for tests + sitemap audits).
 * Human-readable map: docs/seo-indexation-map.md
 */

import { routes } from "@/lib/routes";
import { STATIC_PAGE_SEO, findStaticPageSeo } from "@/lib/seo/pages";

/** Core commercial INDEX pages — must stay crawlable + in sitemap. */
export const CORE_INDEX_PATHS = [
  "/",
  routes.sazby,
  routes.kalkulacky.hypotecniKalkulacka,
  routes.kalkulacky.root,
  routes.faq,
  routes.oNas,
  routes.kontakt,
] as const;

/**
 * Query keys that personalize /sazby or calculators — never create distinct
 * indexable documents; canonical stays the base path.
 */
export const NON_INDEXABLE_QUERY_KEYS = [
  "fixationMonths",
  "ltv",
  "purpose",
  "property",
  "loan",
  "tab",
  "amount",
  "rate",
] as const;

/** Prefixes disallowed in robots.txt (in addition to /api/). */
export const ROBOTS_DISALLOW_PATHS = [
  "/api/",
  "/dekujeme",
  "/moje-moznosti",
  "/dashboard",
  "/reporty/sdilet/",
  "/financni-pas",
  "/portfolio",
  "/sledovani",
  "/alerty",
  "/profesionalni-portal",
  "/transakce",
] as const;

export function catalogNoIndexPaths(): string[] {
  return STATIC_PAGE_SEO.filter((p) => p.noIndex).map((p) => p.path);
}

export function catalogIndexPaths(): string[] {
  return STATIC_PAGE_SEO.filter((p) => !p.noIndex).map((p) => p.path);
}

export function assertCoreIndexInCatalog(): string[] {
  const missing: string[] = [];
  for (const path of CORE_INDEX_PATHS) {
    const entry = findStaticPageSeo(path);
    if (!entry || entry.noIndex) missing.push(path);
  }
  return missing;
}
