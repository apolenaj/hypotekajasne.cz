import type { ClaimKind } from "@/lib/property-rentgen/types";

export const OFFER_STRATEGY_STORAGE_KEY = "hj-offer-strategy-v1";
export const OFFER_STRATEGY_FEATURE_STATUS = "BETA" as const;

export type PropertyCondition = "good" | "average" | "needs_work";
export type UserUrgency = "low" | "medium" | "high";

export type PriceHistoryPoint = {
  date: string;
  priceCzk: number;
  claimKind: ClaimKind;
};

export type ComparableListing = {
  id: string;
  label: string;
  priceCzk: number;
  distanceHint: string | null;
  claimKind: ClaimKind;
};

export type VerifiedCompetition = {
  verified: boolean;
  note: string | null;
  claimKind: ClaimKind;
};

export type OfferStrategyInput = {
  askingPriceCzk: number;
  fairValueLowCzk: number;
  fairValueHighCzk: number;
  daysOnMarket: number | null;
  priceHistory: PriceHistoryPoint[];
  comparables: ComparableListing[];
  condition: PropertyCondition;
  urgency: UserUrgency;
  competition: VerifiedCompetition;
  /** Cílový čistý výnos (decimal 0.05 = 5 %) — null = neaplikovat */
  targetNetYield: number | null;
  /** Pro scenario slider / investment engine */
  rentMonthlyCzk: number;
  downPaymentPercent: number;
  mortgageRatePercent: number;
  termYears: number;
  holdingYears: number;
};

export type OfferPriceScenario = {
  label: string;
  priceCzk: number;
  role: "opening" | "target" | "maximum" | "slider";
  claimKind: ClaimKind;
};

export type OfferInvestmentSnapshot = {
  purchasePriceCzk: number;
  grossYield: number;
  netYield: number;
  monthlyCashFlowCzk: number;
  irr: number | null;
  ownFundsCzk: number;
  claimKind: ClaimKind;
};

export type OfferStrategyOutput = {
  openingRange: { lowCzk: number; highCzk: number };
  openingScenarioCzk: number;
  targetPriceCzk: number;
  maximumEconomicallySensibleCzk: number;
  negotiationMarginCzk: number;
  negotiationMarginPercent: number;
  effectOnYield: string;
  effectOnCashFlow: string;
  keyQuestions: string[];
  scenarios: OfferPriceScenario[];
  claimKind: ClaimKind;
  disclaimer: string;
};

export type ScenarioSliderPoint = {
  priceCzk: number;
  snapshot: OfferInvestmentSnapshot;
};

export type OfferTextDraft = {
  subject: string;
  body: string;
  claimKind: ClaimKind;
  ethicsNote: string;
};

export type OfferStrategyModel = {
  generatedAt: string;
  input: OfferStrategyInput;
  output: OfferStrategyOutput;
  sliderRange: { minCzk: number; maxCzk: number; stepCzk: number };
  methodology: string[];
};

export function defaultOfferStrategyInput(
  partial?: Partial<OfferStrategyInput>
): OfferStrategyInput {
  return {
    askingPriceCzk: partial?.askingPriceCzk ?? 6_500_000,
    fairValueLowCzk: partial?.fairValueLowCzk ?? 5_950_000,
    fairValueHighCzk: partial?.fairValueHighCzk ?? 6_250_000,
    daysOnMarket: partial?.daysOnMarket ?? 45,
    priceHistory: partial?.priceHistory ?? [],
    comparables: partial?.comparables ?? [],
    condition: partial?.condition ?? "average",
    urgency: partial?.urgency ?? "medium",
    competition: partial?.competition ?? {
      verified: false,
      note: null,
      claimKind: "NEOVERENO",
    },
    targetNetYield: partial?.targetNetYield ?? 0.045,
    rentMonthlyCzk: partial?.rentMonthlyCzk ?? 22_000,
    downPaymentPercent: partial?.downPaymentPercent ?? 20,
    mortgageRatePercent: partial?.mortgageRatePercent ?? 5.2,
    termYears: partial?.termYears ?? 25,
    holdingYears: partial?.holdingYears ?? 10,
  };
}
