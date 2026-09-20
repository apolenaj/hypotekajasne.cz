/**
 * Default social share image (1200×630) — Hypotéka Jasně.
 * Asset: public/og/hypotekajasne-share-v2.jpg
 * Regenerate: npx tsx --tsconfig tsconfig.json scripts/generate-og-share-v2.tsx
 */

export const OG_SHARE_V2 = {
  width: 1200,
  height: 630,
  /** Versioned public path — cache-busts social scrapers vs /opengraph-image */
  path: "/og/hypotekajasne-share-v2.jpg",
  contentType: "image/jpeg" as const,
  alt: "Hypotéka Jasně — hypoteční kalkulačky a analýzy nemovitostí",
  titleShare: "HypotékaJasně | Hypotéky, bydlení a investice",
  descriptionShare:
    "Spočítejte si hypotéku, porovnejte vlastní bydlení s nájmem a prověřte investiční nemovitost. Srozumitelně a na jednom místě.",
} as const;
