/**
 * Canonical mortgage / ratio math — single implementation for annuity & PV inverse.
 * Callers must not re-implement these formulas elsewhere.
 *
 * Units:
 * - Money: currency units (CZK/EUR/…) as plain numbers — no FX conversion here
 * - Rates: annual percent p.a. (5 = 5 %), never decimal 0.05
 * - Terms: whole years → months = years * 12
 * - Ratios (LTV/DSTI): 0–1 unless function name ends in Percent
 *
 * Rounding: core returns full IEEE floats. UI rounds with roundMoney / Math.round.
 */

/** Annuity monthly payment. Zero rate → principal / months. */
export function calculateAnnuityPayment(
  principal: number,
  annualRatePercent: number,
  years: number
): number {
  if (!Number.isFinite(principal) || principal <= 0) return 0;
  if (!Number.isFinite(years) || years <= 0) return 0;
  if (!Number.isFinite(annualRatePercent) || annualRatePercent < 0) return 0;

  const monthlyRate = annualRatePercent / 100 / 12;
  const months = years * 12;
  if (monthlyRate === 0) return principal / months;
  const factor = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * factor) / (factor - 1);
}

/**
 * Present value of an annuity — max loan from max monthly payment.
 * Inverse of calculateAnnuityPayment (within float tolerance).
 */
export function maxLoanFromPayment(
  monthlyPayment: number,
  annualRatePercent: number,
  termYears: number
): number {
  if (!Number.isFinite(monthlyPayment) || monthlyPayment <= 0) return 0;
  if (!Number.isFinite(termYears) || termYears <= 0) return 0;
  if (!Number.isFinite(annualRatePercent) || annualRatePercent < 0) return 0;

  const r = annualRatePercent / 100 / 12;
  const n = termYears * 12;
  if (r <= 0) return monthlyPayment * n;
  return monthlyPayment * ((1 - Math.pow(1 + r, -n)) / r);
}

/** First-month linear (constant principal) payment. */
export function calculateLinearFirstPayment(
  principal: number,
  annualRatePercent: number,
  years: number
): number {
  if (!Number.isFinite(principal) || principal <= 0) return 0;
  if (!Number.isFinite(years) || years <= 0) return 0;
  if (!Number.isFinite(annualRatePercent) || annualRatePercent < 0) return 0;

  const monthlyPrincipal = principal / (years * 12);
  const monthlyInterest = (principal * (annualRatePercent / 100)) / 12;
  return monthlyPrincipal + monthlyInterest;
}

/** Loan / price as 0–1. Invalid → 0. */
export function ltvRatio(loanAmount: number, propertyPrice: number): number {
  if (
    !Number.isFinite(loanAmount) ||
    !Number.isFinite(propertyPrice) ||
    propertyPrice <= 0
  ) {
    return 0;
  }
  return Math.max(0, loanAmount) / propertyPrice;
}

export function ltvPercent(loanAmount: number, propertyPrice: number): number {
  return ltvRatio(loanAmount, propertyPrice) * 100;
}

/** Payment / income as 0–1 (DSTI-style). No income → 0. */
export function dstiRatio(
  monthlyPayment: number,
  monthlyIncome: number
): number {
  if (
    !Number.isFinite(monthlyPayment) ||
    !Number.isFinite(monthlyIncome) ||
    monthlyIncome <= 0
  ) {
    return 0;
  }
  return Math.max(0, monthlyPayment) / monthlyIncome;
}

/** Total debt / annual income (DTI). */
export function dtiRatio(totalDebt: number, annualIncome: number): number {
  if (
    !Number.isFinite(totalDebt) ||
    !Number.isFinite(annualIncome) ||
    annualIncome <= 0
  ) {
    return 0;
  }
  return Math.max(0, totalDebt) / annualIncome;
}

export function totalPaidAndInterest(
  loanAmount: number,
  monthlyPayment: number,
  termYears: number
): { totalPaid: number; totalInterest: number } {
  const totalPaid = Math.round(monthlyPayment * termYears * 12);
  const totalInterest = Math.max(0, totalPaid - Math.round(loanAmount));
  return { totalPaid, totalInterest };
}

/** Round to nearest currency unit (haléře/cents discarded). */
export function roundMoney(amount: number): number {
  if (!Number.isFinite(amount)) return 0;
  return Math.round(amount);
}

/** Round to 2 decimal places (rates, ratios display). */
export function round2(amount: number): number {
  if (!Number.isFinite(amount)) return 0;
  return Math.round(amount * 100) / 100;
}

/**
 * Gross rental yield = (rentMonthly * 12) / price.
 * Returns decimal ratio (0.05 = 5 %).
 */
export function grossYieldRatio(
  rentMonthly: number,
  purchasePrice: number
): number {
  if (
    !Number.isFinite(rentMonthly) ||
    !Number.isFinite(purchasePrice) ||
    purchasePrice <= 0
  ) {
    return 0;
  }
  return (Math.max(0, rentMonthly) * 12) / purchasePrice;
}

/** Cap-rate style: NOI / price (decimal). */
export function netYieldRatio(noi: number, purchasePrice: number): number {
  if (!Number.isFinite(noi) || !Number.isFinite(purchasePrice) || purchasePrice <= 0) {
    return 0;
  }
  return noi / purchasePrice;
}

/** DSCR = NOI / annual debt service. null when no debt. */
export function dscrRatio(
  noi: number,
  annualDebtService: number
): number | null {
  if (!Number.isFinite(noi) || !Number.isFinite(annualDebtService)) return null;
  if (annualDebtService <= 0) return null;
  return noi / annualDebtService;
}
