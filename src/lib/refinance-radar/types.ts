import type { ClaimKind } from "@/lib/property-rentgen/types";

export const REFINANCE_RADAR_STORAGE_KEY = "hj-refinance-radar-v1";
export const REFINANCE_RADAR_FEATURE_STATUS = "BETA" as const;

/** Timeline milestone months before fixation end */
export const FIXATION_ALERT_MONTHS = [12, 9, 6, 3, 1] as const;

export type RefinanceRateStatus = "LIVE" | "STALE" | "MODEL" | "UNAVAILABLE";

export type RefinanceLoanProfile = {
  id: string;
  label: string;
  currentLender: string;
  loanBalanceCzk: number;
  ratePercent: number;
  fixationEnd: string;
  monthlyPaymentCzk: number;
  /** Orientační hodnota nemovitosti — volitelné (LTV kontext) */
  propertyValueCzk: number | null;
  remainingTermYears: number;
  hasInsuranceBundle: boolean;
  /** One-off refinancing fees (odhad / user) */
  refinancingFeesCzk: number;
  /** Penalty if refinancing before fixation end — null = unknown */
  earlyRepaymentPenaltyCzk: number | null;
  /** Monthly insurance delta if refinancing (can be negative) */
  insuranceMonthlyDeltaCzk: number;
  /** Proposed new term if refinancing */
  newTermYears: number;
  updatedAt: string;
};

export type MarketRateReference = {
  ratePercent: number | null;
  label: string;
  claimKind: ClaimKind;
  /** LIVE vs MODEL — nikdy nevydávat MODEL za bankovní nabídku */
  rateStatus: RefinanceRateStatus;
  note: string;
  updatedAt: string | null;
};

export type PaymentScenario = {
  id: string;
  label: string;
  ratePercent: number;
  monthlyPaymentCzk: number;
  claimKind: ClaimKind;
};

export type RefinanceTimelineMilestone = {
  monthsBefore: (typeof FIXATION_ALERT_MONTHS)[number];
  dueAt: string;
  status: "upcoming" | "active" | "passed";
};

export type RefinanceRadarAlert = {
  id: string;
  milestoneMonths: number | null;
  title: string;
  body: string;
  createdAt: string;
  claimKind: ClaimKind;
  personalized: true;
};

export type StayVsRefinanceRow = {
  dimension: string;
  stay: string;
  refinance: string;
  claimKind: ClaimKind;
};

export type StayVsRefinanceComparison = {
  stayTotalInterestCzk: number;
  refinanceTotalInterestCzk: number;
  stayTotalCostCzk: number;
  refinanceTotalCostCzk: number;
  upfrontRefinanceCostsCzk: number;
  monthlyPaymentStayCzk: number;
  monthlyPaymentRefinanceCzk: number;
  breakEvenMonths: number | null;
  potentialMonthlySavingCzk: number | null;
  rows: StayVsRefinanceRow[];
  summary: string;
  claimKind: ClaimKind;
};

export type RefinanceRadarDashboard = {
  generatedAt: string;
  profile: RefinanceLoanProfile;
  monthsToFixation: number | null;
  daysToFixation: number | null;
  /** Doporučený začátek řešení = konec fixace − N měsíců (default 6) */
  recommendedStartDate: string | null;
  recommendedStartMonthsBefore: number;
  currentRate: { value: number; claimKind: ClaimKind };
  marketReference: MarketRateReference;
  paymentScenarios: PaymentScenario[];
  comparison: StayVsRefinanceComparison;
  timeline: RefinanceTimelineMilestone[];
  alerts: RefinanceRadarAlert[];
  methodology: string[];
};

export type RefinanceRadarStore = {
  version: 1;
  profile: RefinanceLoanProfile | null;
  emittedMilestones: Record<string, string>;
  alerts: RefinanceRadarAlert[];
  preferences: {
    maxAlertsPerMonth: number;
    /** In-app hlídání v prohlížeči — e-mail zatím není dostupný */
    watchEnabled: boolean;
    watchSavedAt: string | null;
  };
};

export function emptyLoanProfile(
  partial?: Partial<RefinanceLoanProfile>
): RefinanceLoanProfile {
  const now = new Date().toISOString();
  return {
    id: partial?.id ?? `loan_${Date.now().toString(36)}`,
    label: partial?.label ?? "Moje hypotéka",
    currentLender: partial?.currentLender ?? "",
    loanBalanceCzk: partial?.loanBalanceCzk ?? 0,
    ratePercent: partial?.ratePercent ?? 0,
    fixationEnd: partial?.fixationEnd ?? "",
    monthlyPaymentCzk: partial?.monthlyPaymentCzk ?? 0,
    propertyValueCzk:
      partial?.propertyValueCzk !== undefined ? partial.propertyValueCzk : null,
    remainingTermYears: partial?.remainingTermYears ?? 25,
    hasInsuranceBundle: partial?.hasInsuranceBundle ?? true,
    refinancingFeesCzk: partial?.refinancingFeesCzk ?? 25_000,
    earlyRepaymentPenaltyCzk: partial?.earlyRepaymentPenaltyCzk ?? null,
    insuranceMonthlyDeltaCzk: partial?.insuranceMonthlyDeltaCzk ?? 0,
    newTermYears: partial?.newTermYears ?? 25,
    updatedAt: partial?.updatedAt ?? now,
  };
}
