import type { Metadata } from "next";
import {
  absoluteUrl,
  DEFAULT_OG_IMAGE,
  getSiteOrigin,
  shouldNoIndex,
  SITE_BRAND,
  SITE_DOMAIN_LABEL,
  SITE_NAME,
} from "@/lib/seo/site";
import {
  DEFAULT_LOCALE,
  LOCALE_HTML_LANG,
  localizedPath,
  type Locale,
} from "@/lib/i18n/config";
import { PUBLISHED_EN_PATHS } from "@/lib/i18n/messages";

export type PageSeoInput = {
  title: string;
  description: string;
  /** Path without origin, e.g. /clanky/foo */
  path: string;
  locale?: Locale;
  /** Alternate path for other locale (if published) */
  alternatePath?: Partial<Record<Locale, string>>;
  ogImage?: { url: string; alt?: string; width?: number; height?: number };
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  noIndex?: boolean;
  keywords?: string[];
};

function buildAlternates(
  path: string,
  locale: Locale,
  alternatePath?: Partial<Record<Locale, string>>
): Metadata["alternates"] {
  const canonicalPath =
    alternatePath?.[locale] ??
    (locale === "en"
      ? localizedPath("en", path === "/en" ? "/" : path)
      : path);

  const languages: Record<string, string> = {};

  const csPath = alternatePath?.cs ?? (path.startsWith("/en") ? "/" : path);
  languages["cs-CZ"] = absoluteUrl(csPath);

  const enPath = alternatePath?.en;
  if (enPath && PUBLISHED_EN_PATHS.has(enPath)) {
    languages.en = absoluteUrl(enPath);
  }

  languages["x-default"] = absoluteUrl(csPath);

  return {
    canonical: absoluteUrl(canonicalPath),
    languages,
  };
}

/**
 * Unique title + description + canonical + OG + Twitter + robots.
 */
export function buildPageMetadata(input: PageSeoInput): Metadata {
  const locale = input.locale ?? DEFAULT_LOCALE;
  const titleAlreadyBranded =
    input.title.includes(SITE_NAME) ||
    input.title.includes(SITE_BRAND) ||
    input.title.includes(SITE_DOMAIN_LABEL);
  const title = titleAlreadyBranded
    ? input.title
    : `${input.title} | ${SITE_NAME}`;
  const og = input.ogImage ?? DEFAULT_OG_IMAGE;
  const ogUrl = og.url.startsWith("http") ? og.url : absoluteUrl(og.url);
  const noIndex = input.noIndex ?? shouldNoIndex();

  return {
    metadataBase: new URL(getSiteOrigin()),
    title,
    description: input.description,
    keywords: input.keywords,
    authors: input.authors?.map((name) => ({ name })),
    alternates: buildAlternates(input.path, locale, input.alternatePath),
    robots: noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : { index: true, follow: true },
    openGraph: {
      type: input.type ?? "website",
      locale: LOCALE_HTML_LANG[locale] === "cs" ? "cs_CZ" : "en_US",
      url: absoluteUrl(input.path),
      siteName: SITE_NAME,
      title: input.title,
      description: input.description,
      images: [
        {
          url: ogUrl,
          width: og.width ?? 1200,
          height: og.height ?? 630,
          alt: og.alt ?? input.title,
        },
      ],
      ...(input.publishedTime
        ? { publishedTime: input.publishedTime }
        : {}),
      ...(input.modifiedTime ? { modifiedTime: input.modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [ogUrl],
    },
  };
}

export const rootMetadata = buildPageMetadata({
  title: "Hypotéka Jasně | Co si můžete dovolit. Kde koupit. Jak financovat.",
  description:
    "Informační platforma: živá hypoteční data ČR, srovnání trhů, kalkulačky a jasný další krok — bydlení, investice, refinancování i zahraničí. Nejsme banka.",
  path: "/",
  alternatePath: { cs: "/", en: "/en" },
});
