/**
 * Construction / new-build financing model.
 * Owned land is equity-in-kind for collateral context — not cash and not a
 * reduction of new cash outflows.
 */

import { calculateAnnuityPayment } from "@/lib/finance-math/core";

export const CONSTRUCTION_FINANCE_MODEL_VERSION = "construction-finance-v1";

export type ConstructionVariant =
  | "buy_land_and_build"
  | "own_land_and_build"
  | "developer_shell"
  | "finished_new_build";

export type ConstructionBudget = {
  landPurchaseCzk: number;
  designAndSurveysCzk: number;
  permitsCzk: number;
  utilitiesCzk: number;
  constructionCzk: number;
  finishingAndExteriorCzk: number;
  furnitureCzk: number;
  otherCzk: number;
};

export type ConstructionFinanceInput = {
  variant: ConstructionVariant;
  budget: ConstructionBudget;
  /** Owned land value — not a cash outflow and not added to available cash */
  ownedLandValueCzk: number;
  availableCashCzk: number;
  completedPropertyValueCzk: number;
  modelLtvLimitPercent: number;
  annualRatePercent: number;
  drawdownMonths: number;
  amortisationYears: number;
  /** Reserve as % of explicit base (new project expenses before reserve) */
  reservePercentOfBase: number;
  concurrentHousingMonthlyCzk: number;
  /** Optional custom tranche schedule (sum must not exceed loan) */
  customTranchesCzk?: number[] | null;
};

export type DrawdownMonthRow = {
  month: number;
  trancheCzk: number;
  cumulativeDrawnCzk: number;
  interestCzk: number;
  cashSpendCzk: number;
  cashRemainingCzk: number;
  undrawnLoanCzk: number;
  shortfallCzk: number;
};

export type ConstructionFinanceResult = {
  modelVersion: string;
  newProjectExpensesBeforeReserveCzk: number;
  reserveCzk: number;
  newProjectExpensesWithReserveCzk: number;
  loanNeedCzk: number;
  modelMaxLoanByLtvCzk: number;
  cashShortfallCzk: number;
  interestDuringDrawdownCzk: number;
  monthlyPaymentAfterDrawdownCzk: number;
  concurrentHousingDuringDrawdownCzk: number;
  ownedLandValueCzk: number;
  completedPropertyValueCzk: number;
  schedule: DrawdownMonthRow[];
  firstShortfallMonth: number | null;
  scenarios: {
    constructionPlus10: ConstructionScenarioSummary;
    delaySixMonths: ConstructionScenarioSummary;
    valueMinus10: ConstructionScenarioSummary;
  };
  assumptions: string[];
};

export type ConstructionScenarioSummary = {
  label: string;
  loanNeedCzk: number;
  interestDuringDrawdownCzk: number;
  cashShortfallCzk: number;
  completedPropertyValueCzk: number;
  modelMaxLoanByLtvCzk: number;
  drawdownMonths: number;
  concurrentHousingDuringDrawdownCzk: number;
};

function nonNeg(n: number): number {
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

export function sumNewProjectExpenses(
  variant: ConstructionVariant,
  budget: ConstructionBudget
): number {
  const b = {
    landPurchaseCzk: nonNeg(budget.landPurchaseCzk),
    designAndSurveysCzk: nonNeg(budget.designAndSurveysCzk),
    permitsCzk: nonNeg(budget.permitsCzk),
    utilitiesCzk: nonNeg(budget.utilitiesCzk),
    constructionCzk: nonNeg(budget.constructionCzk),
    finishingAndExteriorCzk: nonNeg(budget.finishingAndExteriorCzk),
    furnitureCzk: nonNeg(budget.furnitureCzk),
    otherCzk: nonNeg(budget.otherCzk),
  };

  if (variant === "finished_new_build") {
    return b.landPurchaseCzk + b.otherCzk + b.furnitureCzk;
  }
  if (variant === "developer_shell") {
    return (
      b.landPurchaseCzk +
      b.constructionCzk +
      b.finishingAndExteriorCzk +
      b.furnitureCzk +
      b.otherCzk
    );
  }
  if (variant === "own_land_and_build") {
    return (
      b.designAndSurveysCzk +
      b.permitsCzk +
      b.utilitiesCzk +
      b.constructionCzk +
      b.finishingAndExteriorCzk +
      b.furnitureCzk +
      b.otherCzk
    );
  }
  return (
    b.landPurchaseCzk +
    b.designAndSurveysCzk +
    b.permitsCzk +
    b.utilitiesCzk +
    b.constructionCzk +
    b.finishingAndExteriorCzk +
    b.furnitureCzk +
    b.otherCzk
  );
}

function defaultTranches(loanNeedCzk: number, months: number): number[] {
  if (loanNeedCzk <= 0 || months <= 0) return [];
  const n = Math.max(1, Math.trunc(months));
  const base = Math.floor((loanNeedCzk / n) * 100) / 100;
  const tranches = Array.from({ length: n }, () => base);
  const sum = tranches.reduce((a, b) => a + b, 0);
  tranches[n - 1] = loanNeedCzk - (sum - base);
  return tranches;
}

function buildSchedule(args: {
  loanNeedCzk: number;
  availableCashCzk: number;
  annualRatePercent: number;
  newExpensesWithReserveCzk: number;
  tranches: number[];
  concurrentHousingMonthlyCzk: number;
}): { rows: DrawdownMonthRow[]; interestTotal: number; firstShortfall: number | null } {
  const r = args.annualRatePercent / 100 / 12;
  let drawn = 0;
  let cash = args.availableCashCzk;
  let interestTotal = 0;
  let firstShortfall: number | null = null;
  const expensePerMonth =
    args.tranches.length > 0
      ? args.newExpensesWithReserveCzk / args.tranches.length
      : 0;
  const rows: DrawdownMonthRow[] = [];

  for (let i = 0; i < args.tranches.length; i += 1) {
    const month = i + 1;
    let tranche = nonNeg(args.tranches[i] ?? 0);
    if (drawn + tranche > args.loanNeedCzk + 1e-9) {
      tranche = Math.max(0, args.loanNeedCzk - drawn);
    }
    drawn += tranche;
    const interest = drawn * r;
    interestTotal += interest;
    const spend =
      expensePerMonth + interest + nonNeg(args.concurrentHousingMonthlyCzk);
    const funding = tranche;
    cash = cash + funding - spend;
    const shortfall = cash < 0 ? -cash : 0;
    if (shortfall > 0 && firstShortfall == null) firstShortfall = month;
    rows.push({
      month,
      trancheCzk: tranche,
      cumulativeDrawnCzk: drawn,
      interestCzk: interest,
      cashSpendCzk: spend,
      cashRemainingCzk: cash,
      undrawnLoanCzk: Math.max(0, args.loanNeedCzk - drawn),
      shortfallCzk: shortfall,
    });
  }

  return { rows, interestTotal, firstShortfall };
}

function summariseScenario(
  label: string,
  partial: {
    loanNeedCzk: number;
    interestDuringDrawdownCzk: number;
    cashShortfallCzk: number;
    completedPropertyValueCzk: number;
    modelMaxLoanByLtvCzk: number;
    drawdownMonths: number;
    concurrentHousingDuringDrawdownCzk: number;
  }
): ConstructionScenarioSummary {
  return { label, ...partial };
}

export function computeConstructionFinance(
  input: ConstructionFinanceInput
): ConstructionFinanceResult {
  const ownedLandValueCzk = nonNeg(input.ownedLandValueCzk);
  const availableCashCzk = nonNeg(input.availableCashCzk);
  const completedPropertyValueCzk = nonNeg(input.completedPropertyValueCzk);
  const baseExpenses = sumNewProjectExpenses(input.variant, input.budget);
  const reservePercent = nonNeg(input.reservePercentOfBase);
  const reserveCzk = baseExpenses * (reservePercent / 100);
  const newProjectExpensesWithReserveCzk = baseExpenses + reserveCzk;

  const loanNeedCzk = Math.max(
    0,
    newProjectExpensesWithReserveCzk - availableCashCzk
  );

  const ltvLimit =
    Number.isFinite(input.modelLtvLimitPercent) && input.modelLtvLimitPercent > 0
      ? input.modelLtvLimitPercent
      : 0;
  const collateralForLimit =
    completedPropertyValueCzk > 0
      ? completedPropertyValueCzk
      : ownedLandValueCzk > 0
        ? ownedLandValueCzk
        : 0;
  const modelMaxLoanByLtvCzk =
    collateralForLimit > 0 && ltvLimit > 0
      ? collateralForLimit * (ltvLimit / 100)
      : 0;

  const cashShortfallVsLtv = Math.max(0, loanNeedCzk - modelMaxLoanByLtvCzk);
  const cashShortfallCzk =
    cashShortfallVsLtv > 0
      ? cashShortfallVsLtv
      : Math.max(0, newProjectExpensesWithReserveCzk - availableCashCzk - loanNeedCzk);

  const drawdownMonths = Math.max(0, Math.trunc(input.drawdownMonths));
  let tranches =
    input.customTranchesCzk && input.customTranchesCzk.length > 0
      ? input.customTranchesCzk.map(nonNeg)
      : defaultTranches(loanNeedCzk, drawdownMonths);

  const trancheSum = tranches.reduce((a, b) => a + b, 0);
  if (trancheSum > loanNeedCzk + 1e-6) {
    const scale = loanNeedCzk / trancheSum;
    tranches = tranches.map((t) => t * scale);
  } else if (trancheSum < loanNeedCzk - 1e-6 && tranches.length > 0) {
    tranches[tranches.length - 1]! += loanNeedCzk - trancheSum;
  }

  const rate =
    Number.isFinite(input.annualRatePercent) && input.annualRatePercent >= 0
      ? input.annualRatePercent
      : 0;

  const { rows, interestTotal, firstShortfall } = buildSchedule({
    loanNeedCzk,
    availableCashCzk,
    annualRatePercent: rate,
    newExpensesWithReserveCzk: newProjectExpensesWithReserveCzk,
    tranches,
    concurrentHousingMonthlyCzk: input.concurrentHousingMonthlyCzk,
  });

  const amortYears =
    Number.isFinite(input.amortisationYears) && input.amortisationYears > 0
      ? input.amortisationYears
      : 0;
  const monthlyPaymentAfterDrawdownCzk =
    loanNeedCzk > 0 && amortYears > 0
      ? calculateAnnuityPayment(loanNeedCzk, rate, amortYears)
      : 0;

  const concurrentHousingDuringDrawdownCzk =
    nonNeg(input.concurrentHousingMonthlyCzk) * drawdownMonths;

  // Scenario: construction items +10%
  const plusBudget: ConstructionBudget = {
    ...input.budget,
    constructionCzk: nonNeg(input.budget.constructionCzk) * 1.1,
    finishingAndExteriorCzk: nonNeg(input.budget.finishingAndExteriorCzk) * 1.1,
  };
  const plusBase = sumNewProjectExpenses(input.variant, plusBudget);
  const plusReserve = plusBase * (reservePercent / 100);
  const plusTotal = plusBase + plusReserve;
  const plusLoan = Math.max(0, plusTotal - availableCashCzk);
  const plusSchedule = buildSchedule({
    loanNeedCzk: plusLoan,
    availableCashCzk,
    annualRatePercent: rate,
    newExpensesWithReserveCzk: plusTotal,
    tranches: defaultTranches(plusLoan, drawdownMonths),
    concurrentHousingMonthlyCzk: input.concurrentHousingMonthlyCzk,
  });

  // Scenario: delay +6 months — remaining undrawn shifted, extra interest + housing
  const delayMonths = drawdownMonths + 6;
  const delayTranches = defaultTranches(loanNeedCzk, delayMonths);
  const delaySchedule = buildSchedule({
    loanNeedCzk,
    availableCashCzk,
    annualRatePercent: rate,
    newExpensesWithReserveCzk: newProjectExpensesWithReserveCzk,
    tranches: delayTranches,
    concurrentHousingMonthlyCzk: input.concurrentHousingMonthlyCzk,
  });

  // Scenario: completed value −10%
  const valueDown = completedPropertyValueCzk * 0.9;
  const maxLoanDown =
    valueDown > 0 && ltvLimit > 0 ? valueDown * (ltvLimit / 100) : 0;

  return {
    modelVersion: CONSTRUCTION_FINANCE_MODEL_VERSION,
    newProjectExpensesBeforeReserveCzk: baseExpenses,
    reserveCzk,
    newProjectExpensesWithReserveCzk,
    loanNeedCzk,
    modelMaxLoanByLtvCzk,
    cashShortfallCzk: Math.max(
      cashShortfallCzk,
      Math.max(0, loanNeedCzk - modelMaxLoanByLtvCzk)
    ),
    interestDuringDrawdownCzk: interestTotal,
    monthlyPaymentAfterDrawdownCzk,
    concurrentHousingDuringDrawdownCzk,
    ownedLandValueCzk,
    completedPropertyValueCzk,
    schedule: rows,
    firstShortfallMonth: firstShortfall,
    scenarios: {
      constructionPlus10: summariseScenario("Stavební položky +10 %", {
        loanNeedCzk: plusLoan,
        interestDuringDrawdownCzk: plusSchedule.interestTotal,
        cashShortfallCzk: Math.max(0, plusLoan - modelMaxLoanByLtvCzk),
        completedPropertyValueCzk,
        modelMaxLoanByLtvCzk,
        drawdownMonths,
        concurrentHousingDuringDrawdownCzk,
      }),
      delaySixMonths: summariseScenario("Dokončení o 6 měsíců později", {
        loanNeedCzk,
        interestDuringDrawdownCzk: delaySchedule.interestTotal,
        cashShortfallCzk: Math.max(0, loanNeedCzk - modelMaxLoanByLtvCzk),
        completedPropertyValueCzk,
        modelMaxLoanByLtvCzk,
        drawdownMonths: delayMonths,
        concurrentHousingDuringDrawdownCzk:
          nonNeg(input.concurrentHousingMonthlyCzk) * delayMonths,
      }),
      valueMinus10: summariseScenario("Budoucí odhad −10 %", {
        loanNeedCzk,
        interestDuringDrawdownCzk: interestTotal,
        cashShortfallCzk: Math.max(0, loanNeedCzk - maxLoanDown),
        completedPropertyValueCzk: valueDown,
        modelMaxLoanByLtvCzk: maxLoanDown,
        drawdownMonths,
        concurrentHousingDuringDrawdownCzk,
      }),
    },
    assumptions: [
      "Vlastněný pozemek se nepočítá do nových výdajů ani do hotovosti.",
      "Modelový LTV limit není schválená výše úvěru.",
      "Tranše se v modelu čerpají na začátku měsíce; během čerpání se hradí úrok, jistina se nesplácí.",
      "Úroky se automaticky nepřičítají k jistině; anuita začíná měsíc po poslední tranši.",
      "Přednastavený harmonogram je ilustrativní a lze ho upravit.",
    ],
  };
}

/** Exact interest for beginning-of-month drawdown convention (unit tests). */
export function interestForCumulativeDrawn(
  cumulativeDrawnCzk: number,
  annualRatePercent: number
): number {
  return nonNeg(cumulativeDrawnCzk) * (nonNeg(annualRatePercent) / 100 / 12);
}
