import { statusBadgeLabel } from "@/lib/data/display";
import { TERM_CS } from "@/lib/i18n/ui-cs";
import { unifiedDestinations } from "@/lib/unified-destinations";
import { MARKET_PROFILES, WEIGHTS_VERSION } from "@/lib/market-matching/market-profiles";
import {
  DIMENSION_HINTS_CS,
  DIMENSION_LABELS_CS,
  DIMENSION_WEIGHTS,
  MATCH_DIMENSIONS,
  type DimensionBreakdown,
  type DimensionScores,
  type MarketMatchResult,
  type MarketProfile,
  type MatchingResult,
  type ScoreChangeHint,
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

/** What-if overrides — přepočítá organické skóre bez partner vlivu. */
export type WhatIfParams = {
  capitalCzk: number;
  horizon: HorizonChoice;
  /** 0–100: požadovaný výnos (agresivita) */
  yieldAppetite: number;
  /** 0–100: tolerance rizika (vyšší = více rizika OK) */
  riskTolerance: number;
  /** vlastní užívání vs investice */
  useMode: "investment" | "own_use" | "mixed";
};

export const BUDGET_MULTIPLIER = 3;

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n));
}

/** Fit: jak blízko je trh ideálu uživatele (0–100). Deterministické. */
export function dimensionFit(marketValue: number, userIdeal: number): number {
  return clamp(100 - Math.abs(marketValue - userIdeal));
}

export function buildUserIdeals(data: PassportFormData): DimensionScores {
  const ideals: DimensionScores = {
    capital_fit: 70,
    financing_fit: 70,
    yield_potential: 55,
    ownership_accessibility: 75,
    liquidity: 65,
    fx_risk: 70,
    regulatory_complexity: 70,
    tax_complexity: 68,
    operational_complexity: 65,
    user_goal_fit: 65,
  };

  if (data.financing === "max_leverage") {
    ideals.financing_fit = 92;
    ideals.capital_fit = 75;
  } else if (data.financing === "partial") {
    ideals.financing_fit = 70;
    ideals.capital_fit = 65;
  } else if (data.financing === "cash") {
    ideals.financing_fit = 35;
    ideals.capital_fit = 55;
  }

  if (data.purpose === "yield_max") {
    ideals.yield_potential = 90;
    ideals.user_goal_fit = 85;
    ideals.operational_complexity = 45;
  } else if (data.purpose === "partial_use") {
    ideals.user_goal_fit = 92;
    ideals.yield_potential = 60;
    ideals.ownership_accessibility = 80;
  } else if (data.purpose === "conservative") {
    ideals.operational_complexity = 88;
    ideals.ownership_accessibility = 92;
    ideals.fx_risk = 90;
    ideals.regulatory_complexity = 88;
    ideals.tax_complexity = 85;
    ideals.yield_potential = 40;
  } else if (data.purpose === "flipping") {
    ideals.liquidity = 88;
    ideals.yield_potential = 70;
    ideals.financing_fit = 75;
    ideals.operational_complexity = 55;
  }

  if (data.region === "exotic_high_yield") {
    ideals.fx_risk = 35;
    ideals.yield_potential = Math.max(ideals.yield_potential, 85);
    ideals.regulatory_complexity = 45;
    ideals.tax_complexity = 45;
  } else if (data.region === "eu_stability") {
    ideals.regulatory_complexity = 85;
    ideals.ownership_accessibility = 85;
    ideals.fx_risk = 75;
    ideals.tax_complexity = 70;
  } else if (data.region === "czech_slovak") {
    ideals.fx_risk = 95;
    ideals.regulatory_complexity = 90;
    ideals.ownership_accessibility = 92;
    ideals.tax_complexity = 88;
    ideals.financing_fit = Math.max(ideals.financing_fit, 85);
  }

  if (data.horizon === "3_months") {
    ideals.liquidity = 85;
    ideals.operational_complexity = 70;
  } else if (data.horizon === "6_months") {
    ideals.liquidity = 75;
  } else if (data.horizon === "1_year") {
    ideals.liquidity = 65;
  } else if (data.horizon === "just_looking") {
    ideals.liquidity = 55;
    ideals.ownership_accessibility = Math.max(ideals.ownership_accessibility, 80);
  }

  return ideals;
}

/**
 * Map what-if sliders onto form fields + ideal tweaks via purpose/region-compatible form.
 */
export function applyWhatIfToForm(
  base: PassportFormData,
  whatIf: WhatIfParams
): PassportFormData {
  let purpose: PurposeChoice = base.purpose || "conservative";
  if (whatIf.useMode === "investment") {
    purpose =
      whatIf.yieldAppetite >= 70
        ? "yield_max"
        : whatIf.riskTolerance < 40
          ? "conservative"
          : "yield_max";
  } else if (whatIf.useMode === "own_use") {
    purpose = "partial_use";
  } else {
    purpose =
      whatIf.yieldAppetite >= 65 ? "yield_max" : "partial_use";
  }

  if (whatIf.riskTolerance < 35 && whatIf.useMode !== "own_use") {
    purpose = "conservative";
  }

  let region: RegionChoice = base.region || "eu_stability";
  if (whatIf.riskTolerance >= 75 && whatIf.yieldAppetite >= 70) {
    region = "exotic_high_yield";
  } else if (whatIf.riskTolerance <= 40) {
    region = base.region === "czech_slovak" ? "czech_slovak" : "eu_stability";
  }

  return {
    ...base,
    capital: String(Math.max(0, Math.round(whatIf.capitalCzk))),
    horizon: whatIf.horizon,
    purpose,
    region,
  };
}

export function whatIfFromForm(data: PassportFormData): WhatIfParams {
  const capital = Number(String(data.capital).replace(/\s/g, "")) || 0;
  let yieldAppetite = 55;
  let riskTolerance = 50;
  let useMode: WhatIfParams["useMode"] = "mixed";

  if (data.purpose === "yield_max") {
    yieldAppetite = 85;
    useMode = "investment";
    riskTolerance = 65;
  } else if (data.purpose === "partial_use") {
    yieldAppetite = 55;
    useMode = "own_use";
    riskTolerance = 45;
  } else if (data.purpose === "conservative") {
    yieldAppetite = 35;
    useMode = "investment";
    riskTolerance = 25;
  } else if (data.purpose === "flipping") {
    yieldAppetite = 70;
    useMode = "investment";
    riskTolerance = 60;
  }

  if (data.region === "exotic_high_yield") riskTolerance = Math.max(riskTolerance, 75);
  if (data.region === "czech_slovak") riskTolerance = Math.min(riskTolerance, 40);

  return {
    capitalCzk: capital,
    horizon: data.horizon || "1_year",
    yieldAppetite,
    riskTolerance,
    useMode,
  };
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

  if (budget < min) return { fit: clamp((budget / min) * 40), reachableVsEntry };
  if (budget < entry) {
    const ratio = (budget - min) / (entry - min || 1);
    return { fit: clamp(55 + ratio * 30), reachableVsEntry };
  }
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
  const hint = DIMENSION_HINTS_CS[dim];
  if (fit >= 80) {
    return `${label}: trh (${marketValue}) je blízko vašemu ideálu (${userIdeal}). ${hint}.`;
  }
  if (marketValue > userIdeal + 15) {
    return `${label}: trh skóruje výše (${marketValue}) než ideál (${userIdeal}) — jiný profil atraktivity.`;
  }
  if (marketValue < userIdeal - 15) {
    return `${label}: trh (${marketValue}) zaostává za ideálem (${userIdeal}).`;
  }
  return `${label}: mírný rozdíl (trh ${marketValue} vs ideál ${userIdeal}).`;
}

function buildWhatWouldChangeScore(
  profile: MarketProfile,
  prefs: UserPreferenceProfile,
  breakdown: DimensionBreakdown[],
  cap: { reachableVsEntry: "below" | "near" | "above" }
): ScoreChangeHint[] {
  const hints: ScoreChangeHint[] = [];
  const weakest = [...breakdown].sort((a, b) => a.fit - b.fit).slice(0, 3);

  for (const w of weakest) {
    if (w.fit >= 75) continue;
    if (w.dimension === "capital_fit") {
      hints.push({
        id: "capital",
        label: "Zvýšit vlastní kapitál / dosažitelný rozpočet",
        detail: `Typický vstup ${profile.typicalEntryCapitalCzk.toLocaleString("cs-CZ")} Kč (min. ${profile.typicalMinCapitalCzk.toLocaleString("cs-CZ")} Kč). Stav: ${cap.reachableVsEntry}.`,
        direction: "up",
      });
    } else if (w.dimension === "financing_fit") {
      hints.push({
        id: "financing",
        label: "Upravit preferenci financování",
        detail:
          "Max. páka preferuje trhy s hypotékou; cash snižuje váhu financování.",
        direction: "either",
      });
    } else if (w.dimension === "yield_potential") {
      hints.push({
        id: "yield",
        label: "Snížit / zvýšit požadovaný výnos",
        detail:
          "Nižší apetit výnosu lépe sedí konzervativním trhům; vyšší favorizuje exotiku (MODEL).",
        direction: "either",
      });
    } else if (
      w.dimension === "fx_risk" ||
      w.dimension === "regulatory_complexity" ||
      w.dimension === "tax_complexity" ||
      w.dimension === "operational_complexity"
    ) {
      hints.push({
        id: `risk-${w.dimension}`,
        label: "Upravit toleranci rizika",
        detail: `${w.label}: ideál ${w.userIdeal} vs trh ${w.marketValue}. Nižší tolerance preference domácích/EU trhů.`,
        direction: "up",
      });
    } else if (w.dimension === "user_goal_fit") {
      hints.push({
        id: "use-mode",
        label: "Změnit vlastní užívání vs investice",
        detail:
          "Mix vlastní užívání + pronájem preferuje jiné trhy než čistý yield.",
        direction: "either",
      });
    } else {
      hints.push({
        id: w.dimension,
        label: `Upravit ideál: ${w.label}`,
        detail: w.explanation,
        direction: "either",
      });
    }
  }

  if (prefs.capitalCzk > 0 && cap.reachableVsEntry === "above") {
    hints.push({
      id: "horizon",
      label: "Prodloužit horizont",
      detail:
        "Delší horizont snižuje tlak na okamžitou likviditu a může zvýšit shodu u méně likvidních trhů.",
      direction: "up",
    });
  }

  if (hints.length === 0) {
    hints.push({
      id: "stable",
      label: "Profil je již dobře sladěn",
      detail:
        "Malé změny kapitálu nebo výnosového apetitu pořád posunou pořadí — vyzkoušejte what-if.",
      direction: "either",
    });
  }

  return hints.slice(0, 5);
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
      dimension === "capital_fit"
        ? cap.fit
        : dimensionFit(marketValue, userIdeal);
    const score = Math.round(fit);
    const weightedContribution = weight * fit;
    return {
      dimension,
      label: DIMENSION_LABELS_CS[dimension],
      weight,
      marketValue,
      userIdeal,
      score,
      fit: score,
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
      "Žádná dimenze nevyniká — shoda je průměrná; srovnejte s jinými trhy."
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
    whatWouldChangeScore: buildWhatWouldChangeScore(
      profile,
      prefs,
      breakdown,
      cap
    ),
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
      label: `${statusBadgeLabel(profile.dataStatus)} · kontrola ${profile.lastReviewedAt} (před ${ageDays} dny)`,
    },
    breakdown,
    isSponsored: false,
    organicScoreUntouched: true,
  };
}

function profileLabel(data: PassportFormData): string {
  if (data.purpose === "yield_max") return TERM_CS.yieldMaximizer;
  if (data.purpose === "partial_use") return TERM_CS.lifestyleYield;
  if (data.purpose === "conservative") return "Konzervativní ochrana hodnoty";
  if (data.purpose === "flipping") return TERM_CS.valueAddFlipping;
  return "Vyvážený investor";
}

/**
 * Organický ranking. Žádný partner boost se sem nepřidává.
 * Deterministicky reprodukovatelné ze stejného PassportFormData.
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

/** What-if: přepočet z override parametrů. */
export function matchMarketsWhatIf(
  base: PassportFormData,
  whatIf: WhatIfParams
): MatchingResult {
  return matchMarkets(applyWhatIfToForm(base, whatIf));
}

/** Lidsky čitelný rozklad pro „Proč tento trh získal X/100?“ */
export function formatMatchExplanation(match: MarketMatchResult): string {
  const lines = [
    `Celková shoda ${match.overallMatch}/100 (organické skóre, váhy ${WEIGHTS_VERSION}).`,
    "Vzorec: Σ (váha × score), score = 100 − |atribut trhu − ideál uživatele| (u Capital fit shoda s rozpočtem).",
    "",
    ...match.breakdown.map(
      (b) =>
        `• ${b.label}: score ${b.score}, weight ${(b.weight * 100).toFixed(0)} % → +${b.weightedContribution.toFixed(1)} b. — ${b.explanation}`
    ),
    "",
    "Co by změnilo skóre?",
    ...match.whatWouldChangeScore.map((h) => `• ${h.label}: ${h.detail}`),
  ];
  return lines.join("\n");
}

/**
 * Recompute overall from breakdown — for determinism tests.
 */
export function recomputeOverallFromBreakdown(
  breakdown: DimensionBreakdown[]
): number {
  return clamp(
    Math.round(breakdown.reduce((s, b) => s + b.weightedContribution, 0))
  );
}

export {
  DIMENSION_WEIGHTS,
  DIMENSION_LABELS_CS,
  DIMENSION_HINTS_CS,
  MATCH_DIMENSIONS,
  WEIGHTS_VERSION,
};
