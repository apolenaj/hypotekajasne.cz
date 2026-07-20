import { absoluteUrl, SITE_NAME, SITE_NAME_SHORT } from "@/lib/seo/site";
import { getOperatorIdentity, formatOperatorAddress } from "@/lib/legal";

export type JsonLd = Record<string, unknown>;

export function jsonLdScript(data: JsonLd | JsonLd[]): string {
  return JSON.stringify(data);
}

/** Organization — matches public brand + contact (no fake IČO). */
export function organizationJsonLd(): JsonLd {
  const op = getOperatorIdentity();
  const org: JsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME_SHORT,
    alternateName: SITE_NAME,
    url: absoluteUrl("/"),
    email: op.email,
    telephone: op.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: op.street ?? undefined,
      addressLocality: op.city ?? undefined,
      postalCode: op.zip ?? undefined,
      addressCountry: "CZ",
    },
  };
  if (op.legalName) org.legalName = op.legalName;
  if (op.ico) {
    org.identifier = {
      "@type": "PropertyValue",
      name: "IČO",
      value: op.ico,
    };
  }
  return org;
}

export function webSiteJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: absoluteUrl("/"),
    inLanguage: "cs-CZ",
    publisher: { "@id": absoluteUrl("/#organization") },
  };
}

export type BreadcrumbItem = { name: string; path: string };

export function breadcrumbListJsonLd(items: BreadcrumbItem[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function personJsonLd(input: {
  name: string;
  jobTitle?: string;
  description?: string;
  url?: string;
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: input.name,
    ...(input.jobTitle ? { jobTitle: input.jobTitle } : {}),
    ...(input.description ? { description: input.description } : {}),
    ...(input.url ? { url: input.url } : {}),
  };
}

export function articleJsonLd(input: {
  headline: string;
  description: string;
  path: string;
  imageUrl: string;
  datePublished: string;
  dateModified: string;
  authorName: string;
  reviewerName?: string;
}): JsonLd {
  const article: JsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.headline,
    description: input.description,
    image: [input.imageUrl.startsWith("http") ? input.imageUrl : absoluteUrl(input.imageUrl)],
    datePublished: input.datePublished,
    dateModified: input.dateModified,
    author: {
      "@type": "Person",
      name: input.authorName,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME_SHORT,
      url: absoluteUrl("/"),
    },
    mainEntityOfPage: absoluteUrl(input.path),
    inLanguage: "cs-CZ",
  };
  if (input.reviewerName) {
    article.reviewedBy = {
      "@type": "Person",
      name: input.reviewerName,
    };
  }
  return article;
}

export function courseJsonLd(input: {
  name: string;
  description: string;
  path: string;
  providerName?: string;
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    provider: {
      "@type": "Organization",
      name: input.providerName ?? SITE_NAME_SHORT,
      url: absoluteUrl("/"),
    },
    inLanguage: "cs-CZ",
    isAccessibleForFree: true,
  };
}

export function courseListJsonLd(input: {
  name: string;
  description: string;
  path: string;
  courses: { name: string; path: string; description: string }[];
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    numberOfItems: input.courses.length,
    itemListElement: input.courses.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Course",
        name: c.name,
        description: c.description,
        url: absoluteUrl(c.path),
        isAccessibleForFree: true,
        provider: {
          "@type": "Organization",
          name: SITE_NAME_SHORT,
        },
      },
    })),
  };
}

/** Only when video is LIVE and visible with transcript/captions when available. */
export function videoObjectJsonLd(input: {
  name: string;
  description: string;
  thumbnailUrl: string;
  contentUrl: string;
  uploadDate: string;
  durationSec?: number | null;
  transcript?: string | null;
}): JsonLd {
  const v: JsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: input.name,
    description: input.description,
    thumbnailUrl: input.thumbnailUrl,
    contentUrl: input.contentUrl,
    uploadDate: input.uploadDate,
  };
  if (input.durationSec) {
    v.duration = `PT${Math.round(input.durationSec)}S`;
  }
  if (input.transcript) {
    v.transcript = input.transcript;
  }
  return v;
}

/** WebApplication for genuine interactive tools (kalkulačky hub). */
export function webApplicationJsonLd(input: {
  name: string;
  description: string;
  path: string;
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "CZK",
    },
    inLanguage: "cs-CZ",
    provider: {
      "@type": "Organization",
      name: SITE_NAME_SHORT,
    },
  };
}

export function faqPageJsonLd(
  items: { question: string; answer: string }[]
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export { formatOperatorAddress };
