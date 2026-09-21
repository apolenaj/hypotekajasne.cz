/**
 * Hypotéky v praxi — structured educational guides inside Akademie.
 * Content is SSR; interactive viz are client islands keyed by vizId.
 */

import type { routes } from "@/lib/routes";

export type PracticeSituationTag =
  | "prvni-bydleni"
  | "prijmy"
  | "vlastni-penize"
  | "splacim"
  | "rodina"
  | "investice";

export const PRACTICE_TAG_LABELS: Record<PracticeSituationTag, string> = {
  "prvni-bydleni": "První bydlení",
  prijmy: "Příjmy",
  "vlastni-penize": "Vlastní peníze",
  splacim: "Už splácím",
  rodina: "Rodina",
  investice: "Investice",
};

export type PracticeSource = {
  label: string;
  /** Official primary URL when available */
  url?: string;
  /** ISO date of editorial check — only when actually checked */
  checkedAt?: string;
  /** What the source supports */
  notes?: string;
};

export type PracticeTable = {
  caption?: string;
  headers: string[];
  rows: string[][];
};

export type PracticeAnswer = {
  id: string;
  question: string;
  /** ~40–80 words direct answer */
  directAnswer: string;
  /** Conditions, consequences, bank vs model */
  explanation: string;
  /** Numeric walkthrough when useful */
  example?: string;
  table?: PracticeTable;
  commonMistake?: string;
  nextStep: { label: string; href: string };
  sources?: PracticeSource[];
  /** Client viz island id */
  vizId?: string;
  /** Synonyms / search boost terms */
  searchTerms?: string[];
};

export type PracticeGuide = {
  slug: string;
  title: string;
  /** One sentence for hub card */
  cardBlurb: string;
  sampleQuestions: [string, string] | [string, string, string];
  tags: PracticeSituationTag[];
  /** Lucide icon key used by UI map */
  icon:
    | "route"
    | "wallet"
    | "landmark"
    | "briefcase"
    | "shieldAlert"
    | "percent"
    | "refreshCw"
    | "heartPulse"
    | "users"
    | "receipt";
  relatedLessonSlugs: string[];
  cta: { label: string; href: string };
  answers: PracticeAnswer[];
  checklist?: string[];
  updatedAt: string;
};

export type PracticeSearchHit = {
  guideSlug: string;
  guideTitle: string;
  answerId: string;
  question: string;
  snippet: string;
  href: string;
};

export function practiceGuidePath(slug: string): string {
  return `/akademie/hypoteky-v-praxi/${slug}`;
}

export function practiceHubPath(): string {
  return "/akademie/hypoteky-v-praxi";
}

export function practiceAnswerPath(slug: string, answerId: string): string {
  return `${practiceGuidePath(slug)}#${answerId}`;
}

/** Route helpers typed against project routes object shape */
export type PracticeRoutes = typeof routes;
