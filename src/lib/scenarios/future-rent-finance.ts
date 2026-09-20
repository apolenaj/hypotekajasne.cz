/**
 * Future / existing rental income — two separate views:
 * A) model income recognition for assessment illustration
 * B) cash after costs and mortgage payment
 */

import { calculateAnnuityPayment } from "@/lib/finance-math/core";

export const FUTURE_RENT_MODEL_VERSION = "future-rent-v1";

export type FutureRentInput = {
  monthlyRentExServicesCzk: number;
  /** existing | future */
  rentTiming: "existing" | "future";
  otherNetMonthlyIncomeCzk: number;
  /** 0–100 */
  recognitionSharePercent: number;
  loanAmountCzk: number;
  annualRatePercent: number;
  termYears: number;
  /** 0–12 */
  vacancyMonthsPerYear: number;
  fixedAnnualOwnerCostsCzk: number;
  /** 0–100 of collected rent */
  managementPercentOfCollected: number;
  annualRepairReserveCzk: number;
  /** Optional override for cash-flow tests (monthly) */
  monthlyPaymentOverrideCzk?: number | null;
};

export type FutureRentResult = {
  modelVersion: string;
  recognizedMonthlyRentCzk: number;
  totalModelMonthlyIncomeCzk: number;
  annualCollectedRentCzk: number;
  annualManagementCzk: number;
  operatingSurplusAnnualCzk: number;
  monthlyPaymentCzk: number;
  annualDebtServiceCzk: number;
  annualCashAfterDebtAndReserveCzk: number;
  averageMonthlyCashAfterDebtAndReserveCzk: number;
  recognitionSharePercent: number;
  vacancyMonthsPerYear: number;
  sensitivityByShare: Array<{
    sharePercent: number;
    recognizedMonthlyRentCzk: number;
    totalModelMonthlyIncomeCzk: number;
  }>;
  cashBreakdownAnnual: {
    collectedRentCzk: number;
    fixedCostsCzk: number;
    managementCzk: number;
    debtServiceCzk: number;
    repairReserveCzk: number;
    remainderCzk: number;
  };
  scenarios: {
    base: FutureRentCashSnapshot;
    extraVacancyMonth: FutureRentCashSnapshot;
    ratePlusTwoPoints: FutureRentCashSnapshot;
  };
  assumptions: string[];
};

export type FutureRentCashSnapshot = {
  label: string;
  annualCollectedRentCzk: number;
  operatingSurplusAnnualCzk: number;
  annualCashAfterDebtAndReserveCzk: number;
  averageMonthlyCashAfterDebtAndReserveCzk: number;
  monthlyPaymentCzk: number;
};

function clamp(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function nonNeg(n: number): number {
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

export function computeFutureRentCash(args: {
  monthlyRentExServicesCzk: number;
  vacancyMonthsPerYear: number;
  fixedAnnualOwnerCostsCzk: number;
  managementPercentOfCollected: number;
  annualRepairReserveCzk: number;
  monthlyPaymentCzk: number;
}): Omit<
  FutureRentCashSnapshot,
  "label" | "monthlyPaymentCzk"
> & { monthlyPaymentCzk: number; annualCollectedRentCzk: number } {
  const rent = nonNeg(args.monthlyRentExServicesCzk);
  const vacancy = clamp(args.vacancyMonthsPerYear, 0, 12);
  const collected = rent * (12 - vacancy);
  const management =
    collected * (clamp(args.managementPercentOfCollected, 0, 100) / 100);
  const operating = collected - nonNeg(args.fixedAnnualOwnerCostsCzk) - management;
  const annualDebt = args.monthlyPaymentCzk * 12;
  const after =
    operating - annualDebt - nonNeg(args.annualRepairReserveCzk);
  return {
    annualCollectedRentCzk: collected,
    operatingSurplusAnnualCzk: operating,
    annualCashAfterDebtAndReserveCzk: after,
    averageMonthlyCashAfterDebtAndReserveCzk: after / 12,
    monthlyPaymentCzk: args.monthlyPaymentCzk,
  };
}

export function computeFutureRent(input: FutureRentInput): FutureRentResult {
  const monthlyRent = nonNeg(input.monthlyRentExServicesCzk);
  const share = clamp(input.recognitionSharePercent, 0, 100);
  const other = nonNeg(input.otherNetMonthlyIncomeCzk);
  const vacancy = clamp(input.vacancyMonthsPerYear, 0, 12);
  const loan = nonNeg(input.loanAmountCzk);
  const termYears =
    Number.isFinite(input.termYears) && input.termYears > 0
      ? input.termYears
      : 0;
  const rate =
    Number.isFinite(input.annualRatePercent) && input.annualRatePercent >= 0
      ? input.annualRatePercent
      : 0;

  const recognizedMonthlyRentCzk = monthlyRent * (share / 100);
  const totalModelMonthlyIncomeCzk = other + recognizedMonthlyRentCzk;

  const monthlyPaymentCzk =
    input.monthlyPaymentOverrideCzk != null &&
    Number.isFinite(input.monthlyPaymentOverrideCzk)
      ? nonNeg(input.monthlyPaymentOverrideCzk)
      : loan > 0 && termYears > 0
        ? calculateAnnuityPayment(loan, rate, termYears)
        : 0;

  const cash = computeFutureRentCash({
    monthlyRentExServicesCzk: monthlyRent,
    vacancyMonthsPerYear: vacancy,
    fixedAnnualOwnerCostsCzk: input.fixedAnnualOwnerCostsCzk,
    managementPercentOfCollected: input.managementPercentOfCollected,
    annualRepairReserveCzk: input.annualRepairReserveCzk,
    monthlyPaymentCzk,
  });

  const sensitivityByShare = [0, 50, 70, 80, 100].map((sharePercent) => {
    const recognized = monthlyRent * (sharePercent / 100);
    return {
      sharePercent,
      recognizedMonthlyRentCzk: recognized,
      totalModelMonthlyIncomeCzk: other + recognized,
    };
  });

  const extraVacancy = computeFutureRentCash({
    monthlyRentExServicesCzk: monthlyRent,
    vacancyMonthsPerYear: Math.min(12, vacancy + 1),
    fixedAnnualOwnerCostsCzk: input.fixedAnnualOwnerCostsCzk,
    managementPercentOfCollected: input.managementPercentOfCollected,
    annualRepairReserveCzk: input.annualRepairReserveCzk,
    monthlyPaymentCzk,
  });

  const stressPayment =
    loan > 0 && termYears > 0
      ? calculateAnnuityPayment(loan, rate + 2, termYears)
      : monthlyPaymentCzk;
  const ratePlus = computeFutureRentCash({
    monthlyRentExServicesCzk: monthlyRent,
    vacancyMonthsPerYear: vacancy,
    fixedAnnualOwnerCostsCzk: input.fixedAnnualOwnerCostsCzk,
    managementPercentOfCollected: input.managementPercentOfCollected,
    annualRepairReserveCzk: input.annualRepairReserveCzk,
    monthlyPaymentCzk: stressPayment,
  });

  return {
    modelVersion: FUTURE_RENT_MODEL_VERSION,
    recognizedMonthlyRentCzk,
    totalModelMonthlyIncomeCzk,
    annualCollectedRentCzk: cash.annualCollectedRentCzk,
    annualManagementCzk:
      cash.annualCollectedRentCzk *
      (clamp(input.managementPercentOfCollected, 0, 100) / 100),
    operatingSurplusAnnualCzk: cash.operatingSurplusAnnualCzk,
    monthlyPaymentCzk,
    annualDebtServiceCzk: monthlyPaymentCzk * 12,
    annualCashAfterDebtAndReserveCzk: cash.annualCashAfterDebtAndReserveCzk,
    averageMonthlyCashAfterDebtAndReserveCzk:
      cash.averageMonthlyCashAfterDebtAndReserveCzk,
    recognitionSharePercent: share,
    vacancyMonthsPerYear: vacancy,
    sensitivityByShare,
    cashBreakdownAnnual: {
      collectedRentCzk: cash.annualCollectedRentCzk,
      fixedCostsCzk: nonNeg(input.fixedAnnualOwnerCostsCzk),
      managementCzk:
        cash.annualCollectedRentCzk *
        (clamp(input.managementPercentOfCollected, 0, 100) / 100),
      debtServiceCzk: monthlyPaymentCzk * 12,
      repairReserveCzk: nonNeg(input.annualRepairReserveCzk),
      remainderCzk: cash.annualCashAfterDebtAndReserveCzk,
    },
    scenarios: {
      base: {
        label: "Zadaný základ",
        ...cash,
      },
      extraVacancyMonth: {
        label: "O jeden měsíc delší neobsazenost",
        ...extraVacancy,
      },
      ratePlusTwoPoints: {
        label: "Sazba vyšší o 2 p. b. (přepočet modelu)",
        ...ratePlus,
      },
    },
    assumptions: [
      "Podíl uznání nájmu je modelový předpoklad, nikoli metodika konkrétní banky.",
      "Nájem zadávejte bez záloh na služby a energie; kauce není pravidelný příjem.",
      "Pohled A (uznaný příjem) a pohled B (tok po nákladech) se neodečítají navzájem.",
      "Tok je před daní z příjmů, po splátkách a zadané rezervě na opravy.",
      input.rentTiming === "future"
        ? "Budoucí nájem — banka může vyžadovat smlouvu, odhad nebo jiný důkaz."
        : "Existující nájem — banka obvykle vyžaduje doložení plateb a smlouvy.",
    ],
  };
}
