import {
  amortizeKnownMonthlyPayment,
  calculateAnnuityPayment,
  ltvPercent,
  roundMoney,
} from "@/lib/finance-math/core";

/** Own funds / loan gap when estimate differs from purchase price at target LTV. */
export function estimateGapModel(input: {
  purchasePriceCzk: number;
  estimateCzk: number;
  targetLtvPercent: number;
}): {
  maxLoanFromEstimateCzk: number;
  ownFundsForPriceCzk: number;
  cashGapVsEstimateCzk: number;
  effectiveLtvOnPurchase: number;
} {
  const purchase = Math.max(0, input.purchasePriceCzk);
  const estimate = Math.max(0, input.estimateCzk);
  const ltv = Math.min(100, Math.max(0, input.targetLtvPercent)) / 100;
  const maxLoan = roundMoney(estimate * ltv);
  const ownFunds = Math.max(0, purchase - maxLoan);
  const cashGap = Math.max(0, purchase - estimate);
  return {
    maxLoanFromEstimateCzk: maxLoan,
    ownFundsForPriceCzk: ownFunds,
    cashGapVsEstimateCzk: cashGap,
    effectiveLtvOnPurchase: ltvPercent(maxLoan, purchase),
  };
}

/** Monthly budget residual (can be negative — must stay visible). */
export function monthlyBudgetResidual(input: {
  netIncomeCzk: number;
  livingCostsCzk: number;
  otherDebtPaymentsCzk: number;
  mortgagePaymentCzk: number;
}): {
  residualCzk: number;
  dstiPercent: number;
} {
  const income = Math.max(0, input.netIncomeCzk);
  const living = Math.max(0, input.livingCostsCzk);
  const other = Math.max(0, input.otherDebtPaymentsCzk);
  const mortgage = Math.max(0, input.mortgagePaymentCzk);
  const residual = roundMoney(income - living - other - mortgage);
  const dsti =
    income > 0 ? Math.round(((other + mortgage) / income) * 1000) / 10 : 0;
  return { residualCzk: residual, dstiPercent: dsti };
}

/** Principal vs interest share over first N months of an annuity. */
export function paymentSplitOverMonths(input: {
  principalCzk: number;
  annualRatePercent: number;
  termYears: number;
  months: number;
}): {
  monthlyPaymentCzk: number;
  interestCzk: number;
  principalPaidCzk: number;
  remainingPrincipalCzk: number;
  totalCashOutCzk: number;
} {
  const payment = roundMoney(
    calculateAnnuityPayment(
      input.principalCzk,
      input.annualRatePercent,
      input.termYears
    )
  );
  const amort = amortizeKnownMonthlyPayment({
    principal: input.principalCzk,
    annualRatePercent: input.annualRatePercent,
    monthlyPayment: payment,
    months: input.months,
  });
  return {
    monthlyPaymentCzk: payment,
    interestCzk: amort.interestCzk,
    principalPaidCzk: amort.principalPaidCzk,
    remainingPrincipalCzk: amort.remainingPrincipalCzk,
    totalCashOutCzk: amort.paymentsAppliedCzk,
  };
}

/** Simple tax-deduction model — NOT a tax ruling. */
export function mortgageInterestDeductionModel(input: {
  annualInterestPaidCzk: number;
  deductibleCapCzk: number;
  marginalTaxRatePercent: number;
  canUtilizeDeduction: boolean;
}): {
  applicableDeductionCzk: number;
  modelledTaxReliefCzk: number;
  unusedInterestCzk: number;
} {
  const interest = Math.max(0, input.annualInterestPaidCzk);
  const cap = Math.max(0, input.deductibleCapCzk);
  const rate = Math.min(100, Math.max(0, input.marginalTaxRatePercent)) / 100;
  const applicable = input.canUtilizeDeduction
    ? Math.min(interest, cap)
    : 0;
  return {
    applicableDeductionCzk: roundMoney(applicable),
    modelledTaxReliefCzk: roundMoney(applicable * rate),
    unusedInterestCzk: roundMoney(Math.max(0, interest - applicable)),
  };
}

/** Compare keep vs refinance cash over a horizon (same remaining principal). */
export function refinanceHorizonCompare(input: {
  remainingPrincipalCzk: number;
  currentRatePercent: number;
  newRatePercent: number;
  remainingYears: number;
  switchCostCzk: number;
  horizonMonths: number;
}): {
  currentPaymentCzk: number;
  newPaymentCzk: number;
  currentCashOutCzk: number;
  newCashOutIncludingSwitchCzk: number;
  cashDeltaCzk: number;
} {
  const years = Math.max(1 / 12, input.remainingYears);
  const currentPayment = roundMoney(
    calculateAnnuityPayment(
      input.remainingPrincipalCzk,
      input.currentRatePercent,
      years
    )
  );
  const newPayment = roundMoney(
    calculateAnnuityPayment(
      input.remainingPrincipalCzk,
      input.newRatePercent,
      years
    )
  );
  const months = Math.max(1, Math.trunc(input.horizonMonths));
  const currentCash = roundMoney(currentPayment * months);
  const newCash = roundMoney(
    newPayment * months + Math.max(0, input.switchCostCzk)
  );
  return {
    currentPaymentCzk: currentPayment,
    newPaymentCzk: newPayment,
    currentCashOutCzk: currentCash,
    newCashOutIncludingSwitchCzk: newCash,
    cashDeltaCzk: roundMoney(newCash - currentCash),
  };
}

/** Reserve runway in months under reduced income. */
export function reserveRunwayMonths(input: {
  reserveCzk: number;
  monthlyShortfallCzk: number;
}): number | null {
  const shortfall = input.monthlyShortfallCzk;
  if (!Number.isFinite(shortfall) || shortfall <= 0) return null;
  const reserve = Math.max(0, input.reserveCzk);
  return Math.floor(reserve / shortfall);
}
