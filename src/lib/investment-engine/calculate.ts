import { calculateAnnuityPayment } from "@/lib/calculators";
import {
  calculateIrr,
  calculateXirr,
  clamp01,
  remainingLoanBalance,
} from "@/lib/investment-engine/math";
import {
  applyScenario,
  buildWaterfall,
  computeYear1Ops,
  resolveInitialEquity,
  resolveLoanAmount,
} from "@/lib/investment-engine/ops";
import type {
  InvestmentEngineInput,
  InvestmentEngineResult,
  ScenarioAdjustments,
  ScenarioId,
} from "@/lib/investment-engine/types";

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function annualCashFlowForYear(
  baseInput: InvestmentEngineInput,
  yearIndex: number,
  annualDebtService: number
): number {
  const rentFactor = Math.pow(1 + baseInput.annualRentGrowth, yearIndex);
  const yearInput: InvestmentEngineInput = {
    ...baseInput,
    rentMonthly: baseInput.rentMonthly * rentFactor,
  };
  return computeYear1Ops(yearInput, annualDebtService).annualCashFlow;
}

/**
 * Hlavní výpočet — oddělený od UI.
 */
export function calculateInvestment(
  baseInput: InvestmentEngineInput,
  scenario: ScenarioId = "base",
  customAdjustments?: Partial<ScenarioAdjustments>
): InvestmentEngineResult {
  const input = applyScenario(baseInput, scenario, customAdjustments);
  const loanAmount = resolveLoanAmount(input);
  const initialEquity = resolveInitialEquity(input, loanAmount);

  const hasDebt =
    loanAmount > 0 &&
    input.rate != null &&
    Number.isFinite(input.rate) &&
    input.termYears > 0;

  const monthlyDebtService = hasDebt
    ? calculateAnnuityPayment(loanAmount, input.rate!, input.termYears)
    : 0;
  const annualDebtService = monthlyDebtService * 12;

  const ops = computeYear1Ops(input, annualDebtService);
  const waterfall = buildWaterfall(ops);

  const grossYield =
    input.purchasePrice > 0 ? ops.grossRentAnnual / input.purchasePrice : 0;
  const netYield =
    input.purchasePrice > 0 ? ops.noi / input.purchasePrice : 0;

  const cashOnCashReturn =
    initialEquity > 0 ? ops.annualCashFlow / initialEquity : null;
  const roeYear1 = cashOnCashReturn;

  const dscr =
    annualDebtService > 0 ? ops.noi / annualDebtService : null;

  const breakEvenOccupancy =
    ops.grossRentAnnual > 0
      ? clamp01(
          (ops.operatingExpenses + ops.managementFee + annualDebtService) /
            ops.grossRentAnnual
        )
      : null;

  const hold = Math.max(0, Math.round(input.holdingPeriodYears));
  const remainingDebt = hasDebt
    ? remainingLoanBalance(
        loanAmount,
        input.rate!,
        input.termYears,
        hold
      )
    : 0;
  const equityBuildUp = Math.max(0, loanAmount - remainingDebt);

  const exitSalePrice =
    input.purchasePrice *
    Math.pow(1 + input.annualPropertyGrowth, hold) *
    Math.pow(1 + input.annualFxReturn, hold);

  const netSale = exitSalePrice * (1 - clamp01(input.sellingCostRate));
  const exitProceeds = netSale - remainingDebt;

  const yearlyCfs: number[] = [];
  for (let y = 0; y < hold; y++) {
    yearlyCfs.push(annualCashFlowForYear(input, y, annualDebtService));
  }
  // Last year CF already in loop; exit added separately to final period
  const totalCashFlowsReceived = yearlyCfs.reduce((a, b) => a + b, 0);
  const totalReturn =
    totalCashFlowsReceived + exitProceeds - initialEquity;

  const irrFlows: number[] = [-initialEquity];
  for (let y = 0; y < hold; y++) {
    const cf = yearlyCfs[y] ?? 0;
    irrFlows.push(y === hold - 1 ? cf + exitProceeds : cf);
  }
  if (hold === 0) {
    irrFlows.push(exitProceeds);
  }

  const irr = calculateIrr(irrFlows);

  const start = new Date(Date.UTC(2026, 0, 1));
  const xirrDates: Date[] = [start];
  const xirrFlows: number[] = [-initialEquity];
  for (let y = 1; y <= Math.max(hold, 1); y++) {
    xirrDates.push(new Date(Date.UTC(2026 + y, 0, 1)));
    if (hold === 0) {
      xirrFlows.push(exitProceeds);
    } else if (y < hold) {
      xirrFlows.push(yearlyCfs[y - 1] ?? 0);
    } else {
      xirrFlows.push((yearlyCfs[y - 1] ?? 0) + exitProceeds);
    }
  }
  const xirr = calculateXirr(xirrFlows, xirrDates);

  return {
    scenario,
    inputApplied: input,
    loanAmount: round2(loanAmount),
    initialEquity: round2(initialEquity),
    annualDebtService: round2(annualDebtService),
    monthlyDebtService: hasDebt ? round2(monthlyDebtService) : null,
    grossYield: round2(grossYield * 1e6) / 1e6,
    noi: round2(ops.noi),
    netYield: round2(netYield * 1e6) / 1e6,
    monthlyCashFlow: round2(ops.annualCashFlow / 12),
    annualCashFlow: round2(ops.annualCashFlow),
    cashOnCashReturn:
      cashOnCashReturn == null
        ? null
        : round2(cashOnCashReturn * 1e6) / 1e6,
    roeYear1: roeYear1 == null ? null : round2(roeYear1 * 1e6) / 1e6,
    dscr: dscr == null ? null : round2(dscr * 100) / 100,
    breakEvenOccupancy:
      breakEvenOccupancy == null
        ? null
        : round2(breakEvenOccupancy * 1e6) / 1e6,
    waterfall,
    equityBuildUp: round2(equityBuildUp),
    remainingDebt: round2(remainingDebt),
    exitSalePrice: round2(exitSalePrice),
    exitProceeds: round2(exitProceeds),
    totalCashFlowsReceived: round2(totalCashFlowsReceived),
    totalReturn: round2(totalReturn),
    irr: irr == null ? null : round2(irr * 1e6) / 1e6,
    xirr: xirr == null ? null : round2(xirr * 1e6) / 1e6,
    methodologyNotes: [
      "Gross Yield a Net Yield jsou decimal podíly k kupní ceně (0.06 = 6 %).",
      "Cash-on-Cash Return = roční čistý CF / počáteční equity (akontace + acquisition + furnishing).",
      "Neuvádíme „Cash-on-Cash ROI“ — ten pojem by naznačoval jiný (často chybný) základ.",
      "IRR/XIRR zahrnuje počáteční equity, roční CF a exit proceeds.",
      "Daň z příjmu je zjednodušený assumption z NOI, ne daňové přiznání.",
    ],
  };
}

/** Pomůcka: výnosy jako % pro UI */
export function asPercent(ratio: number | null): number | null {
  if (ratio == null) return null;
  return round2(ratio * 100);
}
