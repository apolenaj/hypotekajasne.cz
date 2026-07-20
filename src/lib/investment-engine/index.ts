export type {
  InvestmentEngineInput,
  InvestmentEngineResult,
  ScenarioAdjustments,
  ScenarioId,
  WaterfallLine,
} from "@/lib/investment-engine/types";

export {
  INVESTMENT_METRIC_TOOLTIPS,
  SCENARIO_PRESETS,
} from "@/lib/investment-engine/types";

export {
  calculateIrr,
  calculateXirr,
  clamp01,
  remainingLoanBalance,
} from "@/lib/investment-engine/math";

export {
  applyScenario,
  buildWaterfall,
  computeYear1Ops,
  resolveInitialEquity,
  resolveLoanAmount,
} from "@/lib/investment-engine/ops";

export { asPercent, calculateInvestment } from "@/lib/investment-engine/calculate";

export const INVESTMENT_METHODOLOGY = {
  title: "Metodika investment engine",
  paragraphs: [
    "Engine odděluje finanční matematiku od UI a platí pro všechny trhy stejně.",
    "Waterfall: Hrubý nájem − neobsazenost − provoz − správa − daně (assumption) − dluhová služba = čistý cash flow.",
    "Počáteční equity = akontace + pořizovací náklady + vybavení (+ případný doplatek ceny nad úvěr).",
    "Cash-on-Cash Return používá čistý roční cash flow po celém waterfall — ne hrubý nájem / cenu.",
    "Scénáře Bear / Base / Bull upravují neobsazenost, růst nájmu, růst ceny a FX; Custom dovolí vlastní delty.",
    "IRR/XIRR modelují holding period včetně exit proceeds po selling costs a zůstatku dluhu.",
  ],
} as const;
