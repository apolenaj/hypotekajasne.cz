/**
 * Canonical site + Vercel deployment URL strategy.
 *
 * Production canonical: https://hypotekajasne.cz
 * Preview/staging: noindex; never promote Vercel *.vercel.app as canonical.
 */

export const PRODUCTION_HOST = "hypotekajasne.cz";
export const PRODUCTION_ORIGIN = `https://${PRODUCTION_HOST}`;

export type DeployEnv = "production" | "preview" | "development";

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
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (explicit && !explicit.includes("vercel.app")) {
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

export const SITE_NAME = "HypotékaJasně.cz";
export const SITE_NAME_SHORT = "Hypotéka Jasně";

export const DEFAULT_OG_IMAGE = {
  /** Resolved via app/opengraph-image.tsx — metadataBase + /opengraph-image */
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "HypotékaJasně.cz — hypoteční data a investiční nástroje",
} as const;
