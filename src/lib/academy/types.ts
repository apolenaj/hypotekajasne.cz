/**
 * Hypoteční akademie — learning hub typy.
 * Text je SSR; media soubory se nepřidávají fake — jen status + placeholder workflow.
 */

export type MediaAssetStatus = "LIVE" | "PLANNED" | "PROCESSING" | "MISSING";

export type AcademyVideoAsset = {
  status: MediaAssetStatus;
  /** Veřejná URL až když status = LIVE */
  src?: string | null;
  poster?: string | null;
  durationSec?: number | null;
  captionsUrl?: string | null;
  transcript?: string | null;
  provider?: "mux" | "youtube" | "vimeo" | "self" | null;
  /** Cílová délka (placeholder workflow) */
  targetDurationSec?: { min: number; max: number };
};

export type AcademyAudioAsset = {
  status: MediaAssetStatus;
  src?: string | null;
  durationSec?: number | null;
  transcript?: string | null;
  provider?: "self" | "spotify" | null;
};

export type AcademyThumbnail = {
  status: MediaAssetStatus;
  src?: string | null;
  alt?: string;
};

/** Media data model pro lekci */
export type AcademyMediaBundle = {
  video: AcademyVideoAsset;
  audio: AcademyAudioAsset;
  thumbnail: AcademyThumbnail;
  captions?: {
    status: MediaAssetStatus;
    src?: string | null;
    lang?: "cs";
  };
  transcript?: {
    status: MediaAssetStatus;
    text?: string | null;
  };
};

/** Jeden kanonický obsah → odvozené formáty */
export type ContentChannel =
  | "seo_article"
  | "video"
  | "short"
  | "audio"
  | "ebook"
  | "newsletter";

export type ContentDerivativeStatus = "LIVE" | "DRAFT" | "PLANNED";

export type ContentDerivative = {
  channel: ContentChannel;
  status: ContentDerivativeStatus;
  href?: string | null;
  notes?: string;
};

export type AcademyFaqItem = { q: string; a: string };

export type AcademyQuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  /** Index správné odpovědi 0-based */
  correctIndex: number;
  explain: string;
};

export type AcademyCalculatorKind =
  | "ltv"
  | "dsti"
  | "dti"
  | "cash_flow"
  | "none";

export type AcademyRelatedTool = {
  label: string;
  href: string;
};

export type AcademySource = {
  label: string;
  url?: string;
  note?: string;
};

export type AcademyLesson = {
  slug: string;
  title: string;
  shortLabel: string;
  description: string;
  /** 1. Jednoduše řečeno */
  simplySaid: string;
  /** 2. Reálný příklad */
  realExample: string;
  /** 3. Jak se to počítá */
  howCalculated: string;
  /** 4. Co na to banka/investor */
  bankOrInvestor: string;
  /** 5. Nejčastější chyba */
  commonMistake: string;
  calculator: AcademyCalculatorKind;
  media: AcademyMediaBundle;
  quiz: AcademyQuizQuestion[];
  faq: AcademyFaqItem[];
  sources: AcademySource[];
  relatedTools: AcademyRelatedTool[];
  /** CTA */
  cta: { label: string; href: string };
  /** Reuse pipeline */
  derivatives: ContentDerivative[];
  updatedAt: string;
};

export const EMPTY_MEDIA_PLANNED = (): AcademyMediaBundle => ({
  video: {
    status: "PLANNED",
    src: null,
    poster: null,
    durationSec: null,
    captionsUrl: null,
    transcript: null,
    provider: null,
    targetDurationSec: { min: 30, max: 60 },
  },
  audio: {
    status: "PLANNED",
    src: null,
    durationSec: null,
    transcript: null,
    provider: "self",
  },
  thumbnail: {
    status: "PLANNED",
    src: null,
    alt: "Náhled lekce — připravujeme",
  },
  captions: { status: "PLANNED", src: null, lang: "cs" },
  transcript: { status: "PLANNED", text: null },
});

export const DEFAULT_DERIVATIVES = (
  slug: string
): ContentDerivative[] => [
  {
    channel: "seo_article",
    status: "LIVE",
    href: `/akademie/${slug}`,
    notes: "Kanonická lekce akademie",
  },
  {
    channel: "video",
    status: "PLANNED",
    href: null,
    notes: "30–60 s — nahrát až po produkci",
  },
  {
    channel: "short",
    status: "PLANNED",
    href: null,
    notes: "Ořez z video assetu",
  },
  {
    channel: "audio",
    status: "PLANNED",
    href: null,
    notes: "Narrace z transcriptu",
  },
  {
    channel: "ebook",
    status: "PLANNED",
    href: null,
    notes: "Kapitola v e-booku akademie",
  },
  {
    channel: "newsletter",
    status: "PLANNED",
    href: null,
    notes: "Digest / jedna lekce = jeden tip",
  },
];
