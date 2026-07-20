import { unifiedDestinations } from "@/lib/unified-destinations";
import { MARKET_PROFILES, WEIGHTS_VERSION } from "@/lib/market-matching/market-profiles";
import {
  DIMENSION_LABELS_CS,
  DIMENSION_WEIGHTS,
  MATCH_DIMENSIONS,
  type DimensionBreakdown,
  type DimensionScores,
  type MarketMatchResult,
  type MarketProfile,
  type MatchingResult,
  type UserPreferenceProfile,
} from "@/lib/market-matching/types";

export type FinancingChoice = "max_leverage" | "partial" | "cash";
export type PurposeChoice =
  | "yield_max"
  | "partial_use"
  | "conservative"
  | "flipping";
export type HorizonChoice = "3_months" | "6_months" | "1_year" | "just_looking";
export type RegionChoice =
  | "exotic_high_yield"
  | "eu_stability"
  | "czech_slovak";

export type PassportFormData = {
  capital: string;
  financing: FinancingChoice | "";
  purpose: PurposeChoice | "";
  horizon: HorizonChoice | "";
  region: RegionChoice | "";
  name: string;
  email: string;
  phone: string;
};

const BUDGET_MULTIPLIER = 3;

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n));
}

/** Fit: jak blízko je trh ideálu uživatele (0–100). */
export function dimensionFit(marketValue: number, userIdeal: number): number {
  return clamp(100 - Math.abs(marketValue - userIdeal));
}

export function buildUserIdeals(data: PassportFormData): DimensionScores {
  const ideals: DimensionScores = {
    required_capital: 70,
    financing_availability: 70,
    target_yield: 55,
    volatility_risk: 65,
    ownership_security: 75,
    liquidity: 65,
    currency_risk: 70,
    regulation: 70,
    investment_horizon: 60,
    intended_use: 65,
  };

  if (data.financing === "max_leverage") {
    ideals.financing_availability = 92;
    ideals.required_capital = 75;
  } else if (data.financing === "partial") {
    ideals.financing_availability = 70;
    ideals.required_capital = 65;
  } else if (data.financing === "cash") {
    ideals.financing_availability = 35;
    ideals.required_capital = 55;
  }

  if (data.purpose === "yield_max") {
    ideals.target_yield = 90;
    ideals.intended_use = 85;
    ideals.volatility_risk = 45;
  } else if (data.purpose === "partial_use") {
    ideals.intended_use = 92;
    ideals.target_yield = 60;
    ideals.ownership_security = 80;
  } else if (data.purpose === "conservative") {
    ideals.volatility_risk = 88;
    ideals.ownership_security = 92;
    ideals.currency_risk = 90;
    ideals.regulation = 88;
    ideals.target_yield = 40;
  } else if (data.purpose === "flipping") {
    ideals.liquidity = 88;
    ideals.investment_horizon = 35;
    ideals.target_yield = 70;
    ideals.financing_availability = 75;
  }

  if (data.region === "exotic_high_yield") {
    ideals.currency_risk = 35;
    ideals.target_yield = Math.max(ideals.target_yield, 85);
    ideals.regulation = 45;
  } else if (data.region === "eu_stability") {
    ideals.regulation = 85;
    ideals.ownership_security = 85;
    ideals.currency_risk = 75;
  } else if (data.region === "czech_slovak") {
    ideals.currency_risk = 95;
    ideals.regulation = 90;
    ideals.ownership_security = 92;
    ideals.financing_availability = Math.max(ideals.financing_availability, 85);
  }

  if (data.horizon === "3_months") {
    ideals.investment_horizon = 30;
    ideals.liquidity = 80;
  } else if (data.horizon === "6_months") {
    ideals.investment_horizon = 45;
    ideals.liquidity = 75;
  } else if (data.horizon === "1_year") {
    ideals.investment_horizon = 65;
  } else if (data.horizon === "just_looking") {
    ideals.investment_horizon = 80;
  }

  return ideals;
}

function capitalFit(
  profile: MarketProfile,
  capital: number,
  budget: number
): { fit: number; reachableVsEntry: "below" | "near" | "above" } {
  const entry = profile.typicalEntryCapitalCzk;
  const min = profile.typicalMinCapitalCzk;
  let reachableVsEntry: "below" | "near" | "above" = "near";
  if (budget < min) reachableVsEntry = "below";
  else if (budget >= entry * 1.05) reachableVsEntry = "above";
  else if (budget < entry * 0.85) reachableVsEntry = "below";

  // Prefer markets where budget covers entry without extreme over/under
  if (budget < min) return { fit: clamp((budget / min) * 40), reachableVsEntry };
  if (budget < entry) {
    const ratio = (budget - min) / (entry - min || 1);
    return { fit: clamp(55 + ratio * 30), reachableVsEntry };
  }
  // Comfortable headroom, slight penalty if massively overcapitalized vs market
  const over = budget / entry;
  if (over > 4) return { fit: 78, reachableVsEntry };
  return { fit: clamp(88 + Math.min(12, (over - 1) * 4)), reachableVsEntry };
}

function explainDimension(
  dim: (typeof MATCH_DIMENSIONS)[number],
  marketValue: number,
  userIdeal: number,
  fit: number
): string {
  const label = DIMENSION_LABELS_CS[dim];
  if (fit >= 80) {
    return `${label}: trh (${marketValue}) je blízko vašemu ideálu (${userIdeal}).`;
  }
  if (marketValue > userIdeal + 15) {
    return `${label}: trh skóruje výše (${marketValue}) než váš ideál (${userIdeal}) — jiný profil atraktivity.`;
  }
  if (marketValue < userIdeal - 15) {
    return `${label}: trh (${marketValue}) zaostává za ideálem (${userIdeal}).`;
  }
  return `${label}: mírný rozdíl (trh ${marketValue} vs ideál ${userIdeal}).`;
}

export function scoreMarket(
  profile: MarketProfile,
  prefs: UserPreferenceProfile
): MarketMatchResult {
  const dest = unifiedDestinations.find((d) => d.country === profile.name);
  const cap = capitalFit(
    profile,
    prefs.capitalCzk,
    prefs.reachableBudgetCzk
  );

  const breakdown: DimensionBreakdown[] = MATCH_DIMENSIONS.map((dimension) => {
    const weight = DIMENSION_WEIGHTS[dimension];
    const marketValue = profile.attributes[dimension];
    const userIdeal = prefs.ideals[dimension];
    const fit =
      dimension === "required_capital"
        ? cap.fit
        : dimensionFit(marketValue, userIdeal);
    const weightedContribution = weight * fit;
    return {
      dimension,
      label: DIMENSION_LABELS_CS[dimension],
      weight,
      marketValue,
      userIdeal,
      fit: Math.round(fit),
      weightedContribution,
      explanation: explainDimension(dimension, marketValue, userIdeal, fit),
    };
  });

  const overallMatch = Math.round(
    breakdown.reduce((s, b) => s + b.weightedContribution, 0)
  );

  const sortedByFit = [...breakdown].sort((a, b) => b.fit - a.fit);
  const whyMatches = sortedByFit
    .filter((b) => b.fit >= 72)
    .slice(0, 4)
    .map((b) => b.explanation);
  const whyNotMatches = [...breakdown]
    .sort((a, b) => a.fit - b.fit)
    .filter((b) => b.fit < 65)
    .slice(0, 4)
    .map((b) => b.explanation);

  if (whyMatches.length === 0) {
    whyMatches.push(
      "Žádná dimenze nevyniká — match je průměrný; srovnejte s jinými trhy."
    );
  }
  if (whyNotMatches.length === 0) {
    whyNotMatches.push(
      "Model neidentifikoval silný nesoulad — ověřte rizika v dossieru země."
    );
  }

  const reviewed = new Date(profile.lastReviewedAt);
  const ageDays = Math.round(
    (Date.now() - reviewed.getTime()) / (1000 * 60 * 60 * 24)
  );

  return {
    marketId: profile.id,
    name: profile.name,
    slug: dest?.slug ?? "",
    image: dest?.image ?? "",
    desc: dest?.desc ?? profile.notes,
    overallMatch: clamp(overallMatch),
    whyMatches,
    whyNotMatches,
    capitalRequired: {
      typicalMinCzk: profile.typicalMinCapitalCzk,
      typicalEntryCzk: profile.typicalEntryCapitalCzk,
      reachableVsEntry: cap.reachableVsEntry,
    },
    financingOptions: profile.financingOptions,
    topRisks: profile.topRisks,
    dataFreshness: {
      status: profile.dataStatus,
      lastReviewedAt: profile.lastReviewedAt,
      label: `${profile.dataStatus} · kontrola ${profile.lastReviewedAt} (před ${ageDays} dny)`,
    },
    breakdown,
    isSponsored: false,
    organicScoreUntouched: true,
  };
}

function profileLabel(data: PassportFormData): string {
  if (data.purpose === "yield_max") return "Yield maximizer";
  if (data.purpose === "partial_use") return "Lifestyle + yield";
  if (data.purpose === "conservative") return "Konzervativní ochrana hodnoty";
  if (data.purpose === "flipping") return "Value-add / flipping";
  return "Vyvážený investor";
}

/**
 * Organický ranking. Žádný partner boost se sem nepřidává.
 */
export function matchMarkets(data: PassportFormData): MatchingResult {
  const capital = Number(String(data.capital).replace(/\s/g, "")) || 0;
  const reachableBudget =
    data.financing === "cash"
      ? capital
      : Math.round(capital * BUDGET_MULTIPLIER);

  const prefs: UserPreferenceProfile = {
    ideals: buildUserIdeals(data),
    capitalCzk: capital,
    reachableBudgetCzk: reachableBudget,
  };

  const allMarkets = MARKET_PROFILES.map((p) => scoreMarket(p, prefs)).sort(
    (a, b) => b.overallMatch - a.overallMatch
  );

  // Explicitní ochrana: sponsored never mixes into organic sort key
  const organicOnly = allMarkets.filter((m) => m.isSponsored === false);

  return {
    topMarkets: organicOnly.slice(0, 3),
    allMarkets: organicOnly,
    profileLabel: profileLabel(data),
    capital,
    reachableBudget,
    financingLabel: data.financing || "—",
    horizonLabel: data.horizon || "—",
    weightsVersion: WEIGHTS_VERSION,
  };
}

/** Lidsky čitelný rozklad pro „Proč tento trh získal X/100?“ */
export function formatMatchExplanation(match: MarketMatchResult): string {
  const lines = [
    `Overall Match ${match.overallMatch}/100 (organické skóre, weights ${WEIGHTS_VERSION}).`,
    "Vzorec: Σ (váha × fit), fit = 100 − |atribut trhu − ideál uživatele| (u kapitálu speciální budget fit).",
    "",
    ...match.breakdown.map(
      (b) =>
        `• ${b.label}: váha ${(b.weight * 100).toFixed(0)} % × fit ${b.fit} → +${b.weightedContribution.toFixed(1)} b.`
    ),
  ];
  return lines.join("\n");
}

export { DIMENSION_WEIGHTS, DIMENSION_LABELS_CS, MATCH_DIMENSIONS, WEIGHTS_VERSION };
