/**
 * Next Best Action Engine — deterministic, rule-driven, explainable.
 * Not an LLM black box.
 */

export type NbaPriority = number; // 1–100, higher = more urgent

export type NbaRecommendation = {
  /** Stable rule id — used for dismiss / complete / snooze */
  id: string;
  /** Short imperative action label */
  action: string;
  /** Why this fires now (shown under „Proč?“) */
  reason: string;
  priority: NbaPriority;
  /** What the user gains if they act — honest, non-hype */
  expectedBenefit: string;
  /** ISO timestamp after which recommendation should be re-evaluated / dropped */
  expiresAt: string | null;
  /** Provenance of inputs that triggered the rule */
  sourceData: {
    keys: string[];
    claimKind: "DATA" | "MODEL" | "ODHAD" | "NEOVERENO";
    snapshot: Record<string, string | number | boolean | null>;
  };
  /** Issues that block progress until resolved */
  blockingIssues: string[];
  href: string;
  /** Soft urgency — never fake scarcity */
  urgency: "high" | "medium" | "low";
};

export type NbaUserState = {
  completed: Record<string, string>; // ruleId → completedAt ISO
  dismissed: Record<string, string>; // ruleId → dismissedAt ISO
  snoozed: Record<string, string>; // ruleId → showAfter ISO
};

export type NbaEngineInput = {
  readinessScore: number | null;
  hasProfile: boolean;
  incomeNet: number;
  ownFunds: number;
  profileCompleteness: number;
  purpose:
    | "owner_occupied"
    | "investment"
    | "refinance"
    | "foreign_purchase"
    | "unknown"
    | null;
  /** Months left on current fixation — null if unknown */
  fixationMonthsRemaining: number | null;
  /** Model LTV 0–1 if price + equity known */
  estimatedLtv: number | null;
  watchlistCount: number;
  hasSavedProperty: boolean;
  priceDropPct: number | null;
  priceDropLabel: string | null;
  propertyOverBudgetLabel: string | null;
  topLeverTitle: string | null;
  now?: Date;
};

export type NbaRule = {
  id: string;
  /** Human-readable rule name for audits/tests */
  name: string;
  /** Deterministic predicate */
  when: (ctx: NbaEngineInput) => boolean;
  /** Priority if rule fires */
  priority: NbaPriority;
  build: (ctx: NbaEngineInput) => Omit<
    NbaRecommendation,
    "id" | "priority" | "urgency"
  > & { urgency?: NbaRecommendation["urgency"] };
};

export const NBA_ENGINE_VERSION = "2026-07-20.1";
