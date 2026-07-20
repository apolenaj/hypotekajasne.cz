/**
 * Lehký affordability model (stejná logika jako OnboardingWizard).
 * MODELLED — banky rozhodují individuálně.
 */

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

function maxLoanFromPayment(
  monthlyPayment: number,
  annualRatePercent: number,
  termYears: number
): number {
  if (monthlyPayment <= 0) return 0;
  const r = annualRatePercent / 100 / 12;
  const n = termYears * 12;
  if (r <= 0) return monthlyPayment * n;
  return monthlyPayment * ((1 - Math.pow(1 + r, -n)) / r);
}

export function estimateAffordability(
  input: AffordabilityInput
): AffordabilityResult {
  const termYears = input.termYears ?? 30;
  const maxMonthlyPayment = Math.max(
    0,
    input.monthlyIncome * 0.45 - input.monthlyLiabilities
  );

  const hasRate =
    input.ratePercent != null && Number.isFinite(input.ratePercent);

  const maxLoanDSTI = hasRate
    ? maxLoanFromPayment(maxMonthlyPayment, input.ratePercent!, termYears)
    : 0;

  const maxLoanLTV = Math.max(0, input.cash * 4);
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
    maxLoan: Math.max(0, Math.round(finalMaxLoan)),
    maxPropertyPrice: Math.max(0, Math.round(finalMaxLoan + input.cash)),
    maxMonthlyPayment: Math.max(0, Math.round(maxMonthlyPayment)),
    limitingFactor,
    hasRate,
  };
}
