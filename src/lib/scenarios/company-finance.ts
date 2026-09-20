/**
 * Company-secured real-estate loan model (fully amortising annuity).
 * Not a bank underwriting engine — DSCR and LTV are illustrative.
 */

import {
  calculateAnnuityPayment,
  roundMoney,
} from "@/lib/finance-math/core";

export const COMPANY_FINANCE_MODEL_VERSION = "company-finance-v1";

export type CompanyFinanceInput = {
  propertyPriceCzk: number;
  ancillaryCostsCzk: number;
  equityCzk: number;
  /** Bank-recognised collateral value; null/≤0 → LTV unknown */
  collateralValueCzk: number | null;
  annualRatePercent: number;
  termYears: number;
  /** Optional model LTV cap as percent points (e.g. 70) */
  modelLtvLimitPercent: number | null;
  /** Optional affordability module */
  annualCashAvailableForDebtCzk?: number | null;
  annualOtherDebtServiceCzk?: number | null;
  /** Optional rental operating surplus (simplified) */
  monthlyRentCzk?: number | null;
  annualOperatingCostsCzk?: number | null;
};

export type DscrResult =
  | { kind: "ratio"; value: number }
  | { kind: "no_debt_service" }
  | { kind: "unavailable" };

export type CompanyFinanceResult = {
  modelVersion: string;
  acquisitionCostCzk: number;
  loanNeedCzk: number;
  monthlyPaymentCzk: number;
  annualDebtServiceCzk: number;
  ltvPercent: number | null;
  ltvLabel: string;
  modelLtvLimitPercent: number | null;
  gapToLtvLimitCzk: number | null;
  equityExceedsNeed: boolean;
  dscr: DscrResult;
  rentalOperatingSurplusAnnualCzk: number | null;
  principalScheduleSample: Array<{
    year: number;
    remainingPrincipalCzk: number;
  }>;
  assumptions: string[];
};

function nonNeg(n: number): number {
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

export function computeDscr(
  annualCashAvailableForDebtCzk: number,
  annualTotalDebtServiceCzk: number
): DscrResult {
  if (
    !Number.isFinite(annualCashAvailableForDebtCzk) ||
    !Number.isFinite(annualTotalDebtServiceCzk)
  ) {
    return { kind: "unavailable" };
  }
  if (annualTotalDebtServiceCzk <= 0) {
    return { kind: "no_debt_service" };
  }
  return {
    kind: "ratio",
    value: annualCashAvailableForDebtCzk / annualTotalDebtServiceCzk,
  };
}

export function computeCompanyFinance(
  input: CompanyFinanceInput
): CompanyFinanceResult {
  const propertyPriceCzk = nonNeg(input.propertyPriceCzk);
  const ancillaryCostsCzk = nonNeg(input.ancillaryCostsCzk);
  const equityCzk = nonNeg(input.equityCzk);
  const acquisitionCostCzk = propertyPriceCzk + ancillaryCostsCzk;
  const rawNeed = acquisitionCostCzk - equityCzk;
  const loanNeedCzk = Math.max(0, rawNeed);
  const equityExceedsNeed = rawNeed < 0;

  const termYears =
    Number.isFinite(input.termYears) && input.termYears > 0
      ? input.termYears
      : 0;
  const rate =
    Number.isFinite(input.annualRatePercent) && input.annualRatePercent >= 0
      ? input.annualRatePercent
      : 0;

  const monthlyPaymentCzk =
    loanNeedCzk > 0 && termYears > 0
      ? calculateAnnuityPayment(loanNeedCzk, rate, termYears)
      : 0;
  const annualDebtServiceCzk = monthlyPaymentCzk * 12;

  const collateral =
    input.collateralValueCzk != null &&
    Number.isFinite(input.collateralValueCzk) &&
    input.collateralValueCzk > 0
      ? input.collateralValueCzk
      : null;

  let ltvPercent: number | null = null;
  let ltvLabel = "LTV nelze určit";
  if (collateral != null) {
    ltvPercent = (loanNeedCzk / collateral) * 100;
    ltvLabel = `${ltvPercent.toLocaleString("cs-CZ", {
      maximumFractionDigits: 1,
      minimumFractionDigits: 1,
    })}\u00a0%`;
  }

  const modelLtvLimitPercent =
    input.modelLtvLimitPercent != null &&
    Number.isFinite(input.modelLtvLimitPercent) &&
    input.modelLtvLimitPercent > 0
      ? input.modelLtvLimitPercent
      : null;

  let gapToLtvLimitCzk: number | null = null;
  if (collateral != null && modelLtvLimitPercent != null) {
    const maxLoan = collateral * (modelLtvLimitPercent / 100);
    gapToLtvLimitCzk = Math.max(0, loanNeedCzk - maxLoan);
  }

  const otherDebt = nonNeg(input.annualOtherDebtServiceCzk ?? 0);
  const cashAvail =
    input.annualCashAvailableForDebtCzk == null ||
    !Number.isFinite(input.annualCashAvailableForDebtCzk)
      ? null
      : input.annualCashAvailableForDebtCzk;

  const dscr =
    cashAvail == null
      ? ({ kind: "unavailable" } as const)
      : computeDscr(cashAvail, annualDebtServiceCzk + otherDebt);

  let rentalOperatingSurplusAnnualCzk: number | null = null;
  if (
    input.monthlyRentCzk != null &&
    Number.isFinite(input.monthlyRentCzk) &&
    input.monthlyRentCzk > 0
  ) {
    const opex = nonNeg(input.annualOperatingCostsCzk ?? 0);
    rentalOperatingSurplusAnnualCzk = input.monthlyRentCzk * 12 - opex;
  }

  const principalScheduleSample: CompanyFinanceResult["principalScheduleSample"] =
    [];
  if (loanNeedCzk > 0 && termYears > 0 && monthlyPaymentCzk > 0) {
    const r = rate / 100 / 12;
    let balance = loanNeedCzk;
    const months = termYears * 12;
    for (let year = 1; year <= Math.min(termYears, 5); year += 1) {
      const endMonth = year * 12;
      for (let m = (year - 1) * 12; m < endMonth && m < months; m += 1) {
        const interest = r === 0 ? 0 : balance * r;
        const principal = Math.min(
          Math.max(0, monthlyPaymentCzk - interest),
          balance
        );
        balance -= principal;
      }
      principalScheduleSample.push({
        year,
        remainingPrincipalCzk: roundMoney(balance),
      });
    }
  }

  return {
    modelVersion: COMPANY_FINANCE_MODEL_VERSION,
    acquisitionCostCzk,
    loanNeedCzk,
    monthlyPaymentCzk,
    annualDebtServiceCzk,
    ltvPercent,
    ltvLabel,
    modelLtvLimitPercent,
    gapToLtvLimitCzk,
    equityExceedsNeed,
    dscr,
    rentalOperatingSurplusAnnualCzk,
    principalScheduleSample,
    assumptions: [
      "Plně amortizovaný anuitní úvěr — firemní nabídka může mít jiný splátkový profil.",
      "Sazba je modelová, ne individuální firemní nabídka.",
      "LTV používá vámi zadanou hodnotu zástavy; bez ní LTV neurčujeme.",
      "DSCR porovnáváte buď na úrovni projektu, nebo firmy — nemíchejte obě úrovně.",
    ],
  };
}
