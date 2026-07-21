/**
 * Transparentní market-matching — dimenze a váhy.
 * Placené partnerství NESMÍ měnit organic score.
 */

export const MATCH_DIMENSIONS = [
  "required_capital",
  "financing_availability",
  "target_yield",
  "volatility_risk",
  "ownership_security",
  "liquidity",
  "currency_risk",
  "regulation",
  "investment_horizon",
  "intended_use",
] as const;

export type MatchDimension = (typeof MATCH_DIMENSIONS)[number];

/** Váhy organického skóre — součet = 1. Dokumentováno na /metodika. */
export const DIMENSION_WEIGHTS: Record<MatchDimension, number> = {
  required_capital: 0.14,
  financing_availability: 0.12,
  target_yield: 0.12,
  volatility_risk: 0.1,
  ownership_security: 0.12,
  liquidity: 0.08,
  currency_risk: 0.08,
  regulation: 0.08,
  investment_horizon: 0.08,
  intended_use: 0.08,
};

export const DIMENSION_LABELS_CS: Record<MatchDimension, string> = {
  required_capital: "Požadovaný kapitál",
  financing_availability: "Dostupnost financování",
  target_yield: "Cílový výnos",
  volatility_risk: "Volatilita / riziko",
  ownership_security: "Jistota vlastnictví",
  liquidity: "Likvidita",
  currency_risk: "Měnové riziko",
  regulation: "Regulace",
  investment_horizon: "Investiční horizont",
  intended_use: "Zamýšlené použití",
};

/** Vyšší atribut = atraktivnější na dané ose (u rizika = nižší riziko). */
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
  /** Orientační minimální kapitál (CZK) pro smysluplný vstup */
  typicalMinCapitalCzk: number;
  /** Orientační typický vstup (CZK) */
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
  weight: number;
  marketValue: number;
  userIdeal: number;
  fit: number;
  weightedContribution: number;
  explanation: string;
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
  /** Vždy false u organického rankingu; sponzoring jen explicitně označený */
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
