/**
 * Default social share image (1200×630) — HypotékaJasně v3.
 * Asset: public/og/hypotekajasne-share-v3.png
 * Regenerate: npx tsx --tsconfig tsconfig.json scripts/generate-og-share-v3.tsx
 */

export const OG_SHARE_V3 = {
  width: 1200,
  height: 630,
  /** Versioned public path — cache-busts social scrapers vs v2 progressive JPEG */
  path: "/og/hypotekajasne-share-v3.png",
  contentType: "image/png" as const,
  alt: "HypotékaJasně — hypoteční kalkulačky a analýzy nemovitostí",
  titleShare: "HypotékaJasně | Hypotéky, bydlení a investice",
  descriptionShare:
    "Spočítejte si hypotéku, porovnejte vlastní bydlení s nájmem a prověřte investiční nemovitost. Srozumitelně a na jednom místě.",
} as const;
