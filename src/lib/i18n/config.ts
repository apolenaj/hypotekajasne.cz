/**
 * Locale architecture: cs (primary) + en (curated only).
 * Nevytváříme strojové překlady — EN stránky jen když existuje human copy.
 */

export const LOCALES = ["cs", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "cs";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** BCP 47 tags for Intl + hreflang */
export const LOCALE_TAG: Record<Locale, string> = {
  cs: "cs-CZ",
  en: "en",
};

export const LOCALE_HTML_LANG: Record<Locale, string> = {
  cs: "cs",
  en: "en",
};

/**
 * Path for a locale. Czech stays at root (clean URLs).
 * English uses /en prefix. Only publish EN when `enPath` is registered.
 */
export function localizedPath(locale: Locale, path: string): string {
  const clean = path === "/" ? "/" : path.startsWith("/") ? path : `/${path}`;
  if (locale === DEFAULT_LOCALE) return clean;
  if (clean === "/") return "/en";
  return `/en${clean}`;
}

/** Strip /en prefix for internal route matching */
export function stripLocalePrefix(pathname: string): {
  locale: Locale;
  path: string;
} {
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const rest = pathname.slice(3) || "/";
    return { locale: "en", path: rest.startsWith("/") ? rest : `/${rest}` };
  }
  return { locale: "cs", path: pathname || "/" };
}
