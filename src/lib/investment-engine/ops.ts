import type {
  InvestmentEngineInput,
  ScenarioAdjustments,
  ScenarioId,
  WaterfallLine,
} from "@/lib/investment-engine/types";
import { SCENARIO_PRESETS } from "@/lib/investment-engine/types";
import { clamp01 } from "@/lib/investment-engine/math";

export type Year1Ops = {
  grossRentAnnual: number;
  vacancyLoss: number;
  effectiveGrossIncome: number;
  operatingExpenses: number;
  managementFee: number;
  noi: number;
  incomeTax: number;
  annualDebtService: number;
  annualCashFlow: number;
};

export function applyScenario(
  base: InvestmentEngineInput,
  scenario: ScenarioId,
  custom?: Partial<ScenarioAdjustments>
): InvestmentEngineInput {
  const adj: ScenarioAdjustments =
    scenario === "custom"
      ? {
          vacancyRateDelta: custom?.vacancyRateDelta ?? 0,
          annualRentGrowthDelta: custom?.annualRentGrowthDelta ?? 0,
          annualPropertyGrowthDelta: custom?.annualPropertyGrowthDelta ?? 0,
          annualFxReturnDelta: custom?.annualFxReturnDelta ?? 0,
        }
      : SCENARIO_PRESETS[scenario];

  return {
    ...base,
    vacancyRate: clamp01(base.vacancyRate + adj.vacancyRateDelta),
    annualRentGrowth: base.annualRentGrowth + adj.annualRentGrowthDelta,
    annualPropertyGrowth:
      base.annualPropertyGrowth + adj.annualPropertyGrowthDelta,
    annualFxReturn: base.annualFxReturn + adj.annualFxReturnDelta,
  };
}

export function resolveLoanAmount(input: InvestmentEngineInput): number {
  if (input.loan != null && Number.isFinite(input.loan)) {
    return Math.max(0, input.loan);
  }
  return Math.max(0, input.purchasePrice - input.downPayment);
}

export function resolveInitialEquity(
  input: InvestmentEngineInput,
  loanAmount: number
): number {
  const equityGap = Math.max(
    0,
    input.purchasePrice - loanAmount - input.downPayment
  );
  return (
    Math.max(0, input.downPayment) +
    Math.max(0, input.acquisitionCosts) +
    Math.max(0, input.furnishing) +
    equityGap
  );
}

export function computeYear1Ops(
  input: InvestmentEngineInput,
  annualDebtService: number
): Year1Ops {
  const grossRentAnnual = Math.max(0, input.rentMonthly) * 12;
  const vacancyLoss = grossRentAnnual * clamp01(input.vacancyRate);
  const effectiveGrossIncome = grossRentAnnual - vacancyLoss;

  const operatingExpenses =
    Math.max(0, input.serviceChargesAnnual) +
    Math.max(0, input.insuranceAnnual) +
    Math.max(0, input.propertyTaxAnnual) +
    Math.max(0, input.maintenanceAnnual) +
    Math.max(0, input.capexReserveAnnual);

  const managementFee =
    effectiveGrossIncome * clamp01(input.managementFeeRate);

  const noi = effectiveGrossIncome - operatingExpenses - managementFee;
  const taxableBase = Math.max(0, noi);
  const incomeTax = taxableBase * clamp01(input.incomeTaxRate);
  const annualCashFlow = noi - incomeTax - annualDebtService;

  return {
    grossRentAnnual,
    vacancyLoss,
    effectiveGrossIncome,
    operatingExpenses,
    managementFee,
    noi,
    incomeTax,
    annualDebtService,
    annualCashFlow,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Waterfall: hrubý nájem → −neobsazenost → −provoz → −správa → −daně → −dluh → = CF */
export function buildWaterfall(ops: Year1Ops): WaterfallLine[] {
  const out: WaterfallLine[] = [];
  let run = 0;
  const add = (id: WaterfallLine["id"], label: string, amount: number) => {
    run += amount;
    out.push({
      id,
      label,
      amount: round2(amount),
      runningTotal: round2(run),
    });
  };

  add("gross_rent", "Hrubý nájem", ops.grossRentAnnual);
  add("vacancy", "− Neobsazenost", -ops.vacancyLoss);
  add("operating", "− Provoz", -ops.operatingExpenses);
  add("management", "− Správa", -ops.managementFee);
  add("income_tax", "− Daně (assumption)", -ops.incomeTax);
  add("debt_service", "− Dluhová služba", -ops.annualDebtService);
  out.push({
    id: "net_cash_flow",
    label: "= Čistý cash flow",
    amount: round2(ops.annualCashFlow),
    runningTotal: round2(ops.annualCashFlow),
  });
  return out;
}
