/**
 * Lehký affordability model (sdílená logika s mortgage readiness / kalkulačkami).
 * MODEL — banky rozhodují individuálně.
 * DSTI 0.45 a cash×4 jsou modelové heuristiky, ne limity ČNB.
 */

import { maxLoanFromPayment, roundMoney } from "@/lib/finance-math/core";

export type AffordabilityInput = {
  monthlyIncome: number;
  monthlyLiabilities: number;
  cash: number;
  /** Roční úrok v % p.a. */
  ratePercent: number | null;
  termYears?: number;
};

export type AffordabilityResult = {
  maxLoan: number;
  maxPropertyPrice: number;
  maxMonthlyPayment: number;
  limitingFactor: "LTV" | "DSTI" | null;
  hasRate: boolean;
};

/** Model DSTI cap for light affordability — not ČNB binding. */
export const AFFORDABILITY_DSTI_CAP = 0.45;
/** Model equity frame ≈ 80 % LTV → loan ≤ cash × 4 */
export const AFFORDABILITY_EQUITY_LOAN_MULTIPLE = 4;

export function estimateAffordability(
  input: AffordabilityInput
): AffordabilityResult {
  const termYears = input.termYears ?? 30;
  const maxMonthlyPayment = Math.max(
    0,
    input.monthlyIncome * AFFORDABILITY_DSTI_CAP - input.monthlyLiabilities
  );

  const hasRate =
    input.ratePercent != null && Number.isFinite(input.ratePercent);

  const maxLoanDSTI = hasRate
    ? maxLoanFromPayment(maxMonthlyPayment, input.ratePercent!, termYears)
    : 0;

  const maxLoanLTV = Math.max(
    0,
    input.cash * AFFORDABILITY_EQUITY_LOAN_MULTIPLE
  );
  const finalMaxLoan = hasRate
    ? Math.min(maxLoanDSTI, maxLoanLTV)
    : maxLoanLTV > 0
      ? maxLoanLTV
      : 0;

  const limitingFactor: AffordabilityResult["limitingFactor"] = !hasRate
    ? maxLoanLTV > 0
      ? "LTV"
      : null
    : maxLoanDSTI > maxLoanLTV
      ? "LTV"
      : "DSTI";

  return {
    maxLoan: Math.max(0, roundMoney(finalMaxLoan)),
    maxPropertyPrice: Math.max(0, roundMoney(finalMaxLoan + input.cash)),
    maxMonthlyPayment: Math.max(0, roundMoney(maxMonthlyPayment)),
    limitingFactor,
    hasRate,
  };
}
