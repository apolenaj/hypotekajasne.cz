import {
  EMPTY_ANSWERS,
  INTENT_OPTIONS,
  INCOME_TYPE_OPTIONS,
  type ReadinessAnswers,
} from "@/lib/mortgage-readiness/types";
import type {
  AgeRangeId,
  FinancialProfileAnswers,
  HouseholdType,
  ResidencyStatus,
} from "@/lib/financial-passport/types";

export function ageToRange(age: number | null): AgeRangeId {
  if (age == null || !Number.isFinite(age)) return "unknown";
  if (age < 30) return "18-29";
  if (age < 40) return "30-39";
  if (age < 50) return "40-49";
  if (age < 60) return "50-59";
  return "60+";
}

export function householdFromAnswers(
  answers: Pick<FinancialProfileAnswers, "coApplicant" | "dependents" | "householdType">
): HouseholdType {
  if (answers.householdType && answers.householdType !== "unknown") {
    return answers.householdType;
  }
  if (answers.dependents >= 1) return "family";
  if (answers.coApplicant) return "couple";
  return "single";
}

/**
 * Map classic readiness answers → extended profile (missing fields = 0 / unknown).
 */
export function fromReadinessAnswers(
  answers: ReadinessAnswers
): FinancialProfileAnswers {
  const ext = answers as ReadinessAnswers & Partial<FinancialProfileAnswers>;
  return {
    intent: answers.intent,
    age: answers.age,
    coApplicant: answers.coApplicant,
    dependents: answers.dependents,
    incomeType: answers.incomeType,
    netIncome: Math.max(0, answers.netIncome),
    secondaryIncome: Math.max(0, ext.secondaryIncome ?? 0),
    otherLiabilities: Math.max(0, answers.otherLiabilities),
    consumerLoanPayments: Math.max(0, ext.consumerLoanPayments ?? 0),
    leasePayments: Math.max(0, ext.leasePayments ?? 0),
    mortgagePayment: Math.max(0, ext.mortgagePayment ?? 0),
    creditLimitPayments: Math.max(0, answers.creditLimitPayments),
    ownFunds: Math.max(0, answers.ownFunds),
    investmentAssets: Math.max(0, ext.investmentAssets ?? 0),
    existingPropertyEquity: Math.max(0, ext.existingPropertyEquity ?? 0),
    targetPrice: answers.targetPrice,
    targetCountry: answers.targetCountry,
    currentBalance: answers.currentBalance,
    currentRate: answers.currentRate,
    yearsLeft: answers.yearsLeft,
    hasCzCollateral: answers.hasCzCollateral,
    czCollateralEquity: Math.max(0, answers.czCollateralEquity),
    employmentMonths: answers.employmentMonths,
    noRecentDefaults: answers.noRecentDefaults,
    householdType: (ext.householdType as HouseholdType) ?? "unknown",
    residency: (ext.residency as ResidencyStatus) ?? "unknown",
  };
}

/**
 * Flatten profile back to readiness shape (wizard + calculateReadiness).
 * Folded liability streams → otherLiabilities for legacy score engine.
 */
export function toReadinessAnswers(
  profile: FinancialProfileAnswers
): ReadinessAnswers {
  const foldedLiabilities =
    Math.max(0, profile.otherLiabilities) +
    Math.max(0, profile.consumerLoanPayments) +
    Math.max(0, profile.leasePayments) +
    Math.max(0, profile.mortgagePayment);

  return {
    ...EMPTY_ANSWERS,
    intent: profile.intent,
    age: profile.age,
    coApplicant: profile.coApplicant,
    dependents: profile.dependents,
    incomeType: profile.incomeType,
    netIncome: Math.max(0, profile.netIncome) + Math.max(0, profile.secondaryIncome),
    otherLiabilities: foldedLiabilities,
    creditLimitPayments: Math.max(0, profile.creditLimitPayments),
    ownFunds:
      Math.max(0, profile.ownFunds) +
      Math.max(0, profile.investmentAssets) +
      Math.max(0, profile.existingPropertyEquity),
    targetPrice: profile.targetPrice,
    targetCountry: profile.targetCountry,
    currentBalance: profile.currentBalance,
    currentRate: profile.currentRate,
    yearsLeft: profile.yearsLeft,
    hasCzCollateral: profile.hasCzCollateral,
    czCollateralEquity: Math.max(0, profile.czCollateralEquity),
    employmentMonths: profile.employmentMonths,
    noRecentDefaults: profile.noRecentDefaults,
  };
}

/** Persistable blob — readiness + extended fields together. */
export function toPersistedAnswers(
  profile: FinancialProfileAnswers
): ReadinessAnswers & Partial<FinancialProfileAnswers> {
  const base = toReadinessAnswers(profile);
  return {
    ...base,
    // Keep primary income separate for UI round-trip: store primary in netIncome
    // of readiness as total for scoring; also keep extended fields:
    netIncome: Math.max(0, profile.netIncome) + Math.max(0, profile.secondaryIncome),
    secondaryIncome: profile.secondaryIncome,
    consumerLoanPayments: profile.consumerLoanPayments,
    leasePayments: profile.leasePayments,
    mortgagePayment: profile.mortgagePayment,
    investmentAssets: profile.investmentAssets,
    existingPropertyEquity: profile.existingPropertyEquity,
    householdType: profile.householdType,
    residency: profile.residency,
    // ownFunds in readiness = cash only for display; scoring uses toReadinessAnswers
    ownFunds: profile.ownFunds,
    otherLiabilities: profile.otherLiabilities,
    creditLimitPayments: profile.creditLimitPayments,
  };
}

export function purposeLabel(
  intent: FinancialProfileAnswers["intent"]
): string {
  if (!intent) return "Nezadáno";
  return INTENT_OPTIONS.find((o) => o.id === intent)?.label ?? intent;
}

export function incomeTypeLabel(
  type: FinancialProfileAnswers["incomeType"]
): string | null {
  if (!type) return null;
  return INCOME_TYPE_OPTIONS.find((o) => o.id === type)?.label ?? type;
}

export const EMPTY_PROFILE: FinancialProfileAnswers = {
  intent: null,
  age: null,
  coApplicant: false,
  dependents: 0,
  incomeType: null,
  netIncome: 0,
  secondaryIncome: 0,
  otherLiabilities: 0,
  consumerLoanPayments: 0,
  leasePayments: 0,
  mortgagePayment: 0,
  creditLimitPayments: 0,
  ownFunds: 0,
  investmentAssets: 0,
  existingPropertyEquity: 0,
  targetPrice: null,
  targetCountry: null,
  currentBalance: null,
  currentRate: null,
  yearsLeft: null,
  hasCzCollateral: false,
  czCollateralEquity: 0,
  employmentMonths: null,
  noRecentDefaults: null,
  householdType: "unknown",
  residency: "unknown",
};
