import { emptyLoanProfile } from "@/lib/refinance-radar/types";

function fixationMonthsFromNow(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

export const DEMO_REFINANCE_PROFILE = emptyLoanProfile({
  label: "Hypotéka — demo",
  currentLender: "Model banka",
  loanBalanceCzk: 3_850_000,
  ratePercent: 5.49,
  fixationEnd: fixationMonthsFromNow(8),
  monthlyPaymentCzk: 24_200,
  propertyValueCzk: 5_200_000,
  remainingTermYears: 22,
  hasInsuranceBundle: true,
  refinancingFeesCzk: 28_000,
  earlyRepaymentPenaltyCzk: 45_000,
  insuranceMonthlyDeltaCzk: 350,
  newTermYears: 20,
});
