/**
 * Transparentní market-matching — dimenze a váhy (PROMPT 16).
 * Placené partnerství / affiliate NESMÍ měnit organic score.
 */

export const MATCH_DIMENSIONS = [
  "capital_fit",
  "financing_fit",
  "yield_potential",
  "ownership_accessibility",
  "liquidity",
  "fx_risk",
  "regulatory_complexity",
  "tax_complexity",
  "operational_complexity",
  "user_goal_fit",
] as const;

export type MatchDimension = (typeof MATCH_DIMENSIONS)[number];

/**
 * Váhy organického skóre — součet = 1.
 * Vyšší atribut trhu = atraktivnější (u complexity = nižší složitost pro investora).
 */
export const DIMENSION_WEIGHTS: Record<MatchDimension, number> = {
  capital_fit: 0.12,
  financing_fit: 0.11,
  yield_potential: 0.12,
  ownership_accessibility: 0.11,
  liquidity: 0.09,
  fx_risk: 0.09,
  regulatory_complexity: 0.09,
  tax_complexity: 0.08,
  operational_complexity: 0.09,
  user_goal_fit: 0.1,
};

export const DIMENSION_LABELS_CS: Record<MatchDimension, string> = {
  capital_fit: "Capital fit",
  financing_fit: "Financing fit",
  yield_potential: "Yield potential",
  ownership_accessibility: "Ownership accessibility",
  liquidity: "Liquidity",
  fx_risk: "FX risk",
  regulatory_complexity: "Regulatory complexity",
  tax_complexity: "Tax complexity",
  operational_complexity: "Operational complexity",
  user_goal_fit: "User-goal fit",
};

export const DIMENSION_HINTS_CS: Record<MatchDimension, string> = {
  capital_fit: "Shoda vašeho kapitálu / rozpočtu s typickým vstupem na trhu",
  financing_fit: "Dostupnost financování vůči vaší preferenci páky",
  yield_potential: "Modelový potenciál výnosu vůči vašemu apetitu",
  ownership_accessibility: "Přístupnost a jistota vlastnické struktury",
  liquidity: "Jak snadno lze pozici opustit",
  fx_risk: "Měnové riziko (vyšší = bezpečnější / méně FX)",
  regulatory_complexity: "Regulatorní náročnost (vyšší = jednodušší rámec)",
  tax_complexity: "Daňová náročnost (vyšší = jednodušší pro investora)",
  operational_complexity: "Provozní náročnost (správa, sezónnost, vzdálenost)",
  user_goal_fit: "Shoda s cílem: investice vs vlastní užívání",
};

/** Vyšší atribut = atraktivnější na dané ose. */
export type DimensionScores = Record<MatchDimension, number>;

export type MarketId =
  | "cz"
  | "sk"
  | "ae"
  | "es"
  | "it"
  | "hr"
  | "id"
  | "sa";

export type MarketProfile = {
  id: MarketId;
  name: string;
  typicalMinCapitalCzk: number;
  typicalEntryCapitalCzk: number;
  attributes: DimensionScores;
  financingOptions: string[];
  topRisks: string[];
  dataStatus: "MODEL" | "VERIFIED";
  lastReviewedAt: string;
  notes: string;
};

export type UserPreferenceProfile = {
  ideals: DimensionScores;
  capitalCzk: number;
  reachableBudgetCzk: number;
};

export type DimensionBreakdown = {
  dimension: MatchDimension;
  label: string;
  /** 0–1 */
  weight: number;
  /** 0–100 market attribute */
  marketValue: number;
  /** 0–100 user ideal */
  userIdeal: number;
  /** 0–100 fit */
  score: number;
  /** Alias of score — API clarity for PROMPT 16 */
  fit: number;
  weightedContribution: number;
  explanation: string;
};

export type ScoreChangeHint = {
  id: string;
  label: string;
  detail: string;
  /** Expected direction if user acts on hint */
  direction: "up" | "down" | "either";
};

export type MarketMatchResult = {
  marketId: MarketId;
  name: string;
  slug: string;
  image: string;
  desc: string;
  /** Organické Overall Match 0–100 — bez sponzoringu */
  overallMatch: number;
  whyMatches: string[];
  whyNotMatches: string[];
  /** „Co by změnilo skóre?“ */
  whatWouldChangeScore: ScoreChangeHint[];
  capitalRequired: {
    typicalMinCzk: number;
    typicalEntryCzk: number;
    reachableVsEntry: "below" | "near" | "above";
  };
  financingOptions: string[];
  topRisks: string[];
  dataFreshness: {
    status: "MODEL" | "VERIFIED";
    lastReviewedAt: string;
    label: string;
  };
  breakdown: DimensionBreakdown[];
  /** Vždy false u organického rankingu */
  isSponsored: false;
  organicScoreUntouched: true;
};

export type MatchingResult = {
  topMarkets: MarketMatchResult[];
  allMarkets: MarketMatchResult[];
  profileLabel: string;
  capital: number;
  reachableBudget: number;
  financingLabel: string;
  horizonLabel: string;
  weightsVersion: string;
};
