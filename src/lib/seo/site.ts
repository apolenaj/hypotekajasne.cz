/**
 * Canonical site + Vercel deployment URL strategy.
 *
 * Configure production canonical via:
 *   NEXT_PUBLIC_SITE_URL=https://hypotekajasne.cz
 *
 * Preview/staging: robots noindex; never promote *.vercel.app as canonical.
 * If NEXT_PUBLIC_SITE_URL points at vercel.app, we fall back to PRODUCTION_ORIGIN.
 */

import {
  SITE_BRAND,
  SITE_DOMAIN_HOST,
  SITE_DOMAIN_LABEL,
  SITE_NAME,
  SITE_NAME_SHORT,
} from "@/lib/brand";

export const PRODUCTION_HOST = SITE_DOMAIN_HOST;
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

export function getDeployEnv(): DeployEnv {
  const v = process.env.VERCEL_ENV;
  if (v === "production") return "production";
  if (v === "preview") return "preview";
  if (process.env.NODE_ENV === "development") return "development";
  // Prefer explicit site URL when set outside Vercel
  if (process.env.NEXT_PUBLIC_SITE_URL?.includes(PRODUCTION_HOST)) {
    return "production";
  }
  return process.env.NODE_ENV === "production" ? "production" : "development";
}

/**
 * Absolute origin used for canonical, OG, sitemap, hreflang.
 * Always production host in production and as canonical target.
 * Preview uses production origin for canonical URLs (and robots noindex).
 */
export function getSiteOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "").trim();
  if (explicit && !isDisallowedCanonicalOrigin(explicit)) {
    return explicit;
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
