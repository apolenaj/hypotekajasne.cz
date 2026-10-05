/**
 * Homepage educational A/B cost comparison.
 * Model numbers only — not a bank offer. MONETA is not used.
 */

import {
  calculateAnnuityPayment,
  roundMoney,
} from "@/lib/finance-math/core";
import {
  buildFixationVariantSnapshot,
  compareFixationVariants,
  type FixationComparison,
} from "@/lib/mortgage-market/fixation-cost-comparison";

export const RPSN_EDUCATION_PRINCIPAL_CZK = 4_000_000;
export const RPSN_EDUCATION_TERM_YEARS = 30;
export const RPSN_EDUCATION_FIXATION_MONTHS = 36;

const OFFER_A_RATE = 4.69;
const OFFER_B_RATE = 4.89;
const OFFER_A_INSURANCE = 2_000;
const OFFER_B_INSURANCE = 0;

function monthlyPayment(ratePercent: number): number {
  return roundMoney(
    calculateAnnuityPayment(
      RPSN_EDUCATION_PRINCIPAL_CZK,
      ratePercent,
      RPSN_EDUCATION_TERM_YEARS
    )
  );
}

/**
 * Present value of a level monthly outflow at a monthly discount rate.
 */
function presentValueOfMonthlyOutflow(
  monthlyOutflow: number,
  months: number,
  monthlyRate: number
): number {
  if (monthlyRate === 0) return monthlyOutflow * months;
  const factor = Math.pow(1 + monthlyRate, months);
  return (monthlyOutflow * (factor - 1)) / (monthlyRate * factor);
}

/**
 * Model RPSN (APR) from full-term cash-flow:
 * +principal at t=0, then monthly mortgage payment + insurance for term months.
 * Solved by bisection on the monthly internal rate; returned as % p.a. (2 dp).
 */
export function modelRpsnPercent(
  monthlyMortgagePaymentCzk: number,
  monthlyInsuranceCzk: number
): number {
  const months = RPSN_EDUCATION_TERM_YEARS * 12;
  const outflow = monthlyMortgagePaymentCzk + monthlyInsuranceCzk;
  if (outflow <= 0) {
    throw new Error("Modelové RPSN vyžaduje kladný měsíční odtok.");
  }

  let low = 0;
  let high = 0.05; // 5 % monthly ≈ 80 % p.a. — safe upper bound
  while (
    presentValueOfMonthlyOutflow(outflow, months, high) >
    RPSN_EDUCATION_PRINCIPAL_CZK
  ) {
    high *= 2;
    if (high > 1) {
      throw new Error("Modelové RPSN se nepodařilo spočítat.");
    }
  }

  for (let i = 0; i < 80; i += 1) {
    const mid = (low + high) / 2;
    const pv = presentValueOfMonthlyOutflow(outflow, months, mid);
    if (pv > RPSN_EDUCATION_PRINCIPAL_CZK) {
      low = mid;
    } else {
      high = mid;
    }
  }

  const monthlyRate = (low + high) / 2;
  const annualPercent = (Math.pow(1 + monthlyRate, 12) - 1) * 100;
  return Math.round(annualPercent * 100) / 100;
}

export function buildRpsnEducationComparison(): FixationComparison {
  const paymentA = monthlyPayment(OFFER_A_RATE);
  const paymentB = monthlyPayment(OFFER_B_RATE);
  const snapshotA = buildFixationVariantSnapshot({
    id: "offer-a",
    bank: "Model",
    variant: "Nabídka A",
    ratePercent: OFFER_A_RATE,
    aprPercent: modelRpsnPercent(paymentA, OFFER_A_INSURANCE),
    principalCzk: RPSN_EDUCATION_PRINCIPAL_CZK,
    termYears: RPSN_EDUCATION_TERM_YEARS,
    fixationMonths: RPSN_EDUCATION_FIXATION_MONTHS,
    ltvPercent: null,
    monthlyMortgagePaymentCzk: paymentA,
    monthlyInsuranceCzk: OFFER_A_INSURANCE,
    monthlyAdditionalCostsCzk: 0,
    oneOffCostsCzk: 0,
  });
  const snapshotB = buildFixationVariantSnapshot({
    id: "offer-b",
    bank: "Model",
    variant: "Nabídka B",
    ratePercent: OFFER_B_RATE,
    aprPercent: modelRpsnPercent(paymentB, OFFER_B_INSURANCE),
    principalCzk: RPSN_EDUCATION_PRINCIPAL_CZK,
    termYears: RPSN_EDUCATION_TERM_YEARS,
    fixationMonths: RPSN_EDUCATION_FIXATION_MONTHS,
    ltvPercent: null,
    monthlyMortgagePaymentCzk: paymentB,
    monthlyInsuranceCzk: OFFER_B_INSURANCE,
    monthlyAdditionalCostsCzk: 0,
    oneOffCostsCzk: 0,
  });
  return compareFixationVariants([snapshotA, snapshotB], "model");
}
