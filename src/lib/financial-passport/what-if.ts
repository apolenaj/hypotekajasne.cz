import type {
  FinancialProfileAnswers,
  FinancialWhatIfParams,
} from "@/lib/financial-passport/types";

function reduceLiabilities(
  profile: FinancialProfileAnswers,
  cutTotal: number
): FinancialProfileAnswers {
  if (cutTotal <= 0) return profile;

  let remaining = cutTotal;
  const next = { ...profile };

  const buckets: (keyof Pick<
    FinancialProfileAnswers,
    | "consumerLoanPayments"
    | "leasePayments"
    | "creditLimitPayments"
    | "otherLiabilities"
    | "mortgagePayment"
  >)[] = [
    "consumerLoanPayments",
    "leasePayments",
    "creditLimitPayments",
    "otherLiabilities",
    "mortgagePayment",
  ];

  for (const key of buckets) {
    const current = Math.max(0, profile[key]);
    const take = Math.min(current, remaining);
    next[key] = current - take;
    remaining -= take;
    if (remaining <= 0) break;
  }

  return next;
}

export function whatIfFromProfile(
  profile: FinancialProfileAnswers,
  baseRate: number
): FinancialWhatIfParams {
  return {
    incomeDeltaCzk: 0,
    liabilitiesDeltaCzk: 0,
    capitalDeltaCzk: 0,
    targetPriceDeltaCzk: 0,
    modelRatePercent: baseRate,
  };
}

export function applyWhatIfToProfile(
  profile: FinancialProfileAnswers,
  whatIf: FinancialWhatIfParams
): FinancialProfileAnswers {
  let next: FinancialProfileAnswers = {
    ...profile,
    netIncome: Math.max(0, profile.netIncome + whatIf.incomeDeltaCzk),
    ownFunds: Math.max(0, profile.ownFunds + whatIf.capitalDeltaCzk),
  };

  if (whatIf.liabilitiesDeltaCzk < 0) {
    next = reduceLiabilities(next, Math.abs(whatIf.liabilitiesDeltaCzk));
  }

  if (profile.targetPrice != null && profile.targetPrice > 0) {
    next.targetPrice = Math.max(
      500_000,
      profile.targetPrice + whatIf.targetPriceDeltaCzk
    );
  }

  return next;
}

export function isWhatIfActive(whatIf: FinancialWhatIfParams, baseRate: number): boolean {
  return (
    whatIf.incomeDeltaCzk !== 0 ||
    whatIf.liabilitiesDeltaCzk !== 0 ||
    whatIf.capitalDeltaCzk !== 0 ||
    whatIf.targetPriceDeltaCzk !== 0 ||
    Math.abs(whatIf.modelRatePercent - baseRate) > 0.01
  );
}
