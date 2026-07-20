import type { ClaimKind } from "@/lib/property-rentgen/types";
import type { ScenarioId } from "@/lib/investment-engine/types";
import type { AffordabilityCheckResponse } from "@/lib/majetio/contracts";

export type RenovationNeed = "none" | "light" | "major" | "unknown";

export type ComparePropertyInput = {
  id: string;
  label: string;
  country: string;
  city: string;
  propertyType: "Byt" | "Dům" | "Komerce" | "";
  areaM2: number;
  priceCzk: number;
  /** null → odhad z modelové yield lokality */
  rentMonthlyCzk: number | null;
  /** null → 20 % ceny (MODEL) nebo z passportu */
  equityCzk: number | null;
  ratePercent: number | null;
  termYears: number;
  purpose: "investment" | "own_use";
  renovationNeed: RenovationNeed;
  listingUrl?: string;
  /** 0–100 — kolik klíčových dat uživatel potvrdil */
  dataCompletenessPct?: number | null;
};

export type ClaimedMetric<T = number | string | null> = {
  value: T;
  kind: ClaimKind;
  note?: string;
};

export type ExitScenarioRow = {
  scenario: ScenarioId;
  label: string;
  irrPct: number | null;
  exitProceedsCzk: number;
  claimKind: ClaimKind;
};

export type ComparePropertyMetrics = {
  id: string;
  label: string;
  purchasePrice: ClaimedMetric<number>;
  pricePerM2: ClaimedMetric<number | null>;
  estimatedFairValue: ClaimedMetric<number | null>;
  discountPremiumPct: ClaimedMetric<number | null>;
  grossYieldPct: ClaimedMetric<number | null>;
  netYieldPct: ClaimedMetric<number | null>;
  monthlyCashFlow: ClaimedMetric<number | null>;
  irrPct: ClaimedMetric<number | null>;
  requiredCash: ClaimedMetric<number>;
  mortgagePayment: ClaimedMetric<number | null>;
  dscr: ClaimedMetric<number | null>;
  liquidityScore: ClaimedMetric<number>;
  rentalDemandScore: ClaimedMetric<number>;
  locationScore: ClaimedMetric<number>;
  riskScore: ClaimedMetric<number>;
  dataCompleteness: ClaimedMetric<number>;
  renovationNeed: ClaimedMetric<string>;
  exitScenarios: ExitScenarioRow[];
  affordability: AffordabilityCheckResponse | null;
  /** Normalized 0–100 for radar (secondary viz) */
  radar: Record<
    | "cashFlow"
    | "yield"
    | "appreciation"
    | "liquidity"
    | "location"
    | "lowRisk"
    | "affordability",
    number
  >;
};

export type CompareCategoryId =
  | "best_cash_flow"
  | "best_appreciation"
  | "lowest_risk"
  | "lowest_capital"
  | "best_user_fit";

export type CategoryWinner = {
  category: CompareCategoryId;
  title: string;
  propertyId: string;
  propertyLabel: string;
  valueDisplay: string;
  reason: string;
};

export type PropertyTradeoff = {
  propertyId: string;
  label: string;
  pros: string[];
  cons: string[];
};

export type ProfileRecommendation = {
  propertyId: string | null;
  propertyLabel: string | null;
  headline: string;
  explanation: string;
  /** Explicit — není absolutní vítěz ve všech kategoriích */
  notAbsoluteBest: string;
  tradeoffs: PropertyTradeoff[];
  weightsUsed: string[];
};

export type PropertyComparisonResult = {
  generatedAt: string;
  propertyCount: number;
  properties: ComparePropertyMetrics[];
  categoryWinners: CategoryWinner[];
  profileRecommendation: ProfileRecommendation;
  methodology: string[];
};
