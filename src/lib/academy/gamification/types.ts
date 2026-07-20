/**
 * Gamifikace Hypoteční akademie — bez streaků a casino mechanik.
 */

export const ACADEMY_PROGRESS_STORAGE_KEY = "hj-academy-progress-v1";
export const ACADEMY_GAMIFICATION_FEATURE_STATUS = "BETA" as const;

export const LEARNING_PATH_IDS = [
  "first_home",
  "osvc_mortgage",
  "refinance",
  "first_investment",
  "foreign_property",
  "advanced_investor",
] as const;

export type LearningPathId = (typeof LEARNING_PATH_IDS)[number];

export type PathStepKind = "lesson" | "quiz" | "calculator" | "practical_task";

export type LearningPathStep = {
  kind: PathStepKind;
  id: string;
  label: string;
  /** Lesson slug when kind = lesson | quiz */
  lessonSlug?: string;
  href: string;
  estimatedMinutes: number;
  weight: number;
};

export type LearningPath = {
  id: LearningPathId;
  title: string;
  subtitle: string;
  persona: string;
  steps: LearningPathStep[];
  /** Character id for future video layer */
  guideCharacterId: AcademyCharacterId;
  badgeId: string | null;
};

export const ACADEMY_CHARACTER_IDS = [
  "investor_igor",
  "banker_bohous",
  "madame_inflation",
  "property_detective",
] as const;

export type AcademyCharacterId = (typeof ACADEMY_CHARACTER_IDS)[number];

export type CharacterAnimationState =
  | "idle"
  | "talking"
  | "pointing"
  | "thinking";

export type AcademyCharacter = {
  id: AcademyCharacterId;
  name: string;
  role: string;
  tagline: string;
  topics: string[];
  accentColor: string;
  /** CSS token for future Lottie/video slot */
  illustrationClass: string;
  animationStates: CharacterAnimationState[];
  /** Editorial — character is visual, not source of truth */
  trustNote: string;
};

export type AcademyBadgeId =
  | "understand_ltv"
  | "ready_first_viewing"
  | "investor_basics_complete"
  | "refinance_ready"
  | "foreign_dd_basics";

export type AcademyBadge = {
  id: AcademyBadgeId;
  title: string;
  description: string;
  /** Meaningful unlock — no random achievements */
  unlockCriteria: string;
};

export type StepProgress = {
  stepId: string;
  completedAt: string | null;
};

export type PathProgress = {
  pathId: LearningPathId;
  steps: Record<string, StepProgress>;
  progressPercent: number;
};

export type AcademyProgressStore = {
  version: 1;
  lessonReadAt: Record<string, string>;
  quizPassedAt: Record<string, string>;
  calculatorUsedAt: Record<string, string>;
  practicalTaskDoneAt: Record<string, string>;
  paths: Record<string, PathProgress>;
  earnedBadges: AcademyBadgeId[];
  /** Explicitly no streak — field absent by design */
};

export type LessonToolBridge = {
  lessonSlug: string;
  label: string;
  href: string;
  description: string;
};

export type AcademyLessonRecommendation = {
  id: string;
  lessonSlug: string;
  headline: string;
  reason: string;
  estimatedMinutes: number;
  characterId: AcademyCharacterId;
  tryOnScenarioHref: string;
  tryOnScenarioLabel: string;
  claimKind: "MODEL" | "DATA";
};

export type AcademyGamificationDashboard = {
  generatedAt: string;
  paths: PathProgress[];
  earnedBadges: AcademyBadge[];
  availableBadges: AcademyBadge[];
  recommendations: AcademyLessonRecommendation[];
  characters: AcademyCharacter[];
  methodology: string[];
};

export function defaultAcademyProgressStore(): AcademyProgressStore {
  return {
    version: 1,
    lessonReadAt: {},
    quizPassedAt: {},
    calculatorUsedAt: {},
    practicalTaskDoneAt: {},
    paths: {},
    earnedBadges: [],
  };
}
