/**
 * Canonical site + Vercel deployment URL strategy.
 *
 * Production host (matches current Vercel primary):
 *   https://www.hypotekajasne.cz
 * Apex https://hypotekajasne.cz must 301/308 → www (Vercel domain config).
 *
 * Configure via:
 *   NEXT_PUBLIC_SITE_URL=https://www.hypotekajasne.cz
 *   (apex URL is normalized to www so sitemap/canonicals never diverge)
 *
 * Preview/staging: robots noindex; never promote *.vercel.app as canonical.
 */

import {
  SITE_BRAND,
  SITE_DOMAIN_HOST,
  SITE_DOMAIN_LABEL,
  SITE_NAME,
  SITE_NAME_SHORT,
} from "@/lib/brand";

/** Bare apex hostname (brand DNS). */
export const APEX_HOST = SITE_DOMAIN_HOST;

/**
 * Canonical production hostname.
 * Matches live Vercel primary (apex currently redirects → www).
 * Prefer www until apex can be primary without a redirect loop.
 */
export const PRODUCTION_HOST = `www.${SITE_DOMAIN_HOST}`;
export const PRODUCTION_ORIGIN = `https://${PRODUCTION_HOST}`;

export type DeployEnv = "production" | "preview" | "development";

/** Hosts that must never appear as the public canonical domain. */
export function isDisallowedCanonicalOrigin(origin: string): boolean {
  try {
    const host = new URL(origin).hostname.toLowerCase();
    return (
      host === "vercel.app" ||
      host.endsWith(".vercel.app") ||
      host.includes("localhost") ||
      host === "127.0.0.1"
    );
  } catch {
    return true;
  }
}

/** Collapse apex ↔ www to the single canonical production origin. */
export function normalizeProductionOrigin(origin: string): string {
  try {
    const host = new URL(origin).hostname.toLowerCase();
    if (host === APEX_HOST || host === PRODUCTION_HOST) {
      return PRODUCTION_ORIGIN;
    }
    return origin.replace(/\/$/, "");
  } catch {
    return PRODUCTION_ORIGIN;
  }
}

export function getDeployEnv(): DeployEnv {
  const v = process.env.VERCEL_ENV;
  if (v === "production") return "production";
  if (v === "preview") return "preview";
  if (process.env.NODE_ENV === "development") return "development";
  // Prefer explicit site URL when set outside Vercel
  if (
    process.env.NEXT_PUBLIC_SITE_URL?.includes(APEX_HOST) ||
    process.env.NEXT_PUBLIC_SITE_URL?.includes(PRODUCTION_HOST)
  ) {
    return "production";
  }
  return process.env.NODE_ENV === "production" ? "production" : "development";
}

/**
 * Absolute origin used for canonical, OG, sitemap, hreflang.
 * Always the single production host (www). Preview uses the same origin
 * for canonical URLs while robots stay noindex.
 */
export function getSiteOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "").trim();
  if (explicit && !isDisallowedCanonicalOrigin(explicit)) {
    return normalizeProductionOrigin(explicit);
  }
  return PRODUCTION_ORIGIN;
}

/** Runtime request origin (may be preview) — not for canonical. */
export function getRequestOriginFallback(): string {
  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;
  return getSiteOrigin();
}

export function shouldNoIndex(): boolean {
  const env = getDeployEnv();
  if (env === "preview") return true;
  if (process.env.SEO_FORCE_NOINDEX === "1") return true;
  return false;
}

export function absoluteUrl(path: string): string {
  const base = getSiteOrigin();
  if (!path || path === "/") return base;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

export { SITE_BRAND, SITE_DOMAIN_LABEL, SITE_NAME, SITE_NAME_SHORT };

export const DEFAULT_OG_IMAGE = {
  /** Resolved via app/opengraph-image.tsx — metadataBase + /opengraph-image */
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: `${SITE_BRAND} (${SITE_DOMAIN_LABEL}) — hypoteční data a investiční nástroje`,
} as const;
