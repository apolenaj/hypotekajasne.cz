/**
 * Formula registry — human + machine readable source of truth for QA.
 * Regulatory numbers must be read from CNB_LIMITS / REGULATORY_RECORDS, not invented here.
 */

export type FormulaKind = "exact" | "model" | "external";

export type FormulaEntry = {
  id: string;
  name: string;
  formula: string;
  sourceOfTruth: string;
  units: string;
  rounding: string;
  boundaries: string;
  kind: FormulaKind;
};

export const FORMULA_REGISTRY: FormulaEntry[] = [
  {
    id: "annuity_payment",
    name: "Anuitní měsíční splátka",
    formula:
      "P · r · (1+r)^n / ((1+r)^n − 1); r = annual%/1200; n = years·12; r=0 → P/n",
    sourceOfTruth: "src/lib/finance-math/core.ts#calculateAnnuityPayment",
    units: "money / month; rate as % p.a.",
    rounding: "Full float in engine; UI typically Math.round (CZK). totalPaid = Math.round(payment×months) — not round(payment)×months",
    boundaries: "P≤0, years≤0, rate<0 → 0; zero rate supported",
    kind: "exact",
  },
  {
    id: "max_loan_from_payment",
    name: "PV anuity (max. úvěr ze splátky)",
    formula: "PMT · (1 − (1+r)^(−n)) / r; r=0 → PMT·n",
    sourceOfTruth: "src/lib/finance-math/core.ts#maxLoanFromPayment",
    units: "money; rate % p.a.",
    rounding: "Full float; affordability/readiness Math.round at display",
    boundaries: "PMT≤0 → 0; inverse of annuity within float ε",
    kind: "exact",
  },
  {
    id: "linear_first_payment",
    name: "První splátka lineárního úvěru",
    formula: "P/n + P·annualRate/12",
    sourceOfTruth: "src/lib/finance-math/core.ts#calculateLinearFirstPayment",
    units: "money / month",
    rounding: "Full float; UI rounds",
    boundaries: "P≤0 → 0",
    kind: "exact",
  },
  {
    id: "ltv",
    name: "LTV",
    formula: "loan / propertyPrice",
    sourceOfTruth: "src/lib/finance-math/core.ts#ltvRatio",
    units: "ratio 0–1 or percent",
    rounding: "Display often Math.round(percent)",
    boundaries: "price≤0 → 0; loan clamped ≥0",
    kind: "exact",
  },
  {
    id: "dsti",
    name: "DSTI (splátka / příjem)",
    formula: "monthlyPayment / monthlyIncome",
    sourceOfTruth: "src/lib/finance-math/core.ts#dstiRatio",
    units: "ratio 0–1",
    rounding: "Display as %",
    boundaries: "income≤0 → 0",
    kind: "exact",
  },
  {
    id: "dti",
    name: "DTI (dluh / roční příjem)",
    formula: "totalDebt / annualIncome",
    sourceOfTruth: "src/lib/finance-math/core.ts#dtiRatio",
    units: "ratio (e.g. 7 = 7×)",
    rounding: "Display 1 decimal typical",
    boundaries: "income≤0 → 0",
    kind: "exact",
  },
  {
    id: "cnb_ltv_owner",
    name: "ČNB LTV vlastní bydlení",
    formula: "Constant from CNB_LIMITS (80 / 90 young)",
    sourceOfTruth: "src/lib/cnb-limits.ts → REGULATORY_RECORDS",
    units: "ltv_percent",
    rounding: "Integer percent",
    boundaries: "Do not invent; test against CNB_LIMITS",
    kind: "external",
  },
  {
    id: "cnb_ltv_investment",
    name: "ČNB LTV investiční",
    formula: "CNB_LIMITS.investment.ltvMax (70)",
    sourceOfTruth: "src/lib/cnb-limits.ts",
    units: "ltv_percent",
    rounding: "Integer percent",
    boundaries: "Do not invent",
    kind: "external",
  },
  {
    id: "cnb_dti_investment",
    name: "ČNB DTI investiční",
    formula: "CNB_LIMITS.investment.dtiMax (7)",
    sourceOfTruth: "src/lib/cnb-limits.ts",
    units: "ratio",
    rounding: "Integer",
    boundaries: "Owner-occupied DTI/DSTI deactivated at ČNB (not binding)",
    kind: "external",
  },
  {
    id: "dsti_ui_thresholds",
    name: "UX DSTI warning/danger",
    formula: "REGULATORY_RECORDS.dstiWarning / dstiDanger",
    sourceOfTruth: "src/lib/data/static-regulatory.ts",
    units: "ratio",
    rounding: "n/a",
    boundaries: "MODEL — not ČNB binding limits",
    kind: "model",
  },
  {
    id: "affordability_dsti_cap",
    name: "Affordability DSTI cap",
    formula: "maxPayment = income·0.45 − liabilities; loan = min(PV, cash·4)",
    sourceOfTruth: "src/lib/affordability.ts (policy constants)",
    units: "money",
    rounding: "Math.round",
    boundaries: "0.45 and cash×4 are MODEL heuristics, not ČNB",
    kind: "model",
  },
  {
    id: "stress_rate_bump",
    name: "Stress test sazby",
    formula: "annuity(loan, baseRate + {1,2,3} pp, term)",
    sourceOfTruth: "src/lib/mortgage-decision.ts#buildStressTests",
    units: "money / month",
    rounding: "Math.round",
    boundaries: "Bumps are model assumptions",
    kind: "model",
  },
  {
    id: "gross_yield",
    name: "Hrubý výnos",
    formula: "(rentMonthly · 12) / purchasePrice",
    sourceOfTruth: "src/lib/finance-math/core.ts#grossYieldRatio",
    units: "decimal ratio",
    rounding: "Engine often 6 dp",
    boundaries: "price≤0 → 0; zero rent → 0",
    kind: "exact",
  },
  {
    id: "net_yield_cap_rate",
    name: "Net yield / cap-rate styl",
    formula: "NOI / purchasePrice",
    sourceOfTruth: "src/lib/investment-engine/calculate.ts",
    units: "decimal ratio",
    rounding: "6 dp",
    boundaries: "NOI from ops waterfall (vacancy, opex, mgmt)",
    kind: "exact",
  },
  {
    id: "dscr",
    name: "DSCR",
    formula: "NOI / annualDebtService",
    sourceOfTruth: "src/lib/finance-math/core.ts#dscrRatio + investment-engine",
    units: "ratio",
    rounding: "2 dp in engine",
    boundaries: "No debt → null",
    kind: "exact",
  },
  {
    id: "irr",
    name: "IRR (periodic)",
    formula: "Newton–Raphson on NPV of yearly CF + exit",
    sourceOfTruth: "src/lib/investment-engine/math.ts#calculateIrr",
    units: "decimal annual rate",
    rounding: "6 dp",
    boundaries: "Needs + and − flows; else null",
    kind: "exact",
  },
  {
    id: "vacancy_egi",
    name: "Vacancy → EGI",
    formula: "EGI = rent·12·(1 − vacancyRate)",
    sourceOfTruth: "src/lib/investment-engine/ops.ts#computeYear1Ops",
    units: "money / year; vacancy 0–1",
    rounding: "Full float then round2 on result metrics",
    boundaries: "vacancy clamped 0–1",
    kind: "exact",
  },
  {
    id: "fx_exit",
    name: "FX / growth exit price",
    formula: "price · (1+g)^hold · (1+fx)^hold",
    sourceOfTruth: "src/lib/investment-engine/calculate.ts",
    units: "money; g, fx as decimal annual",
    rounding: "round2",
    boundaries: "FX is user/model assumption — not live FX feed",
    kind: "model",
  },
  {
    id: "rpsn",
    name: "RPSN / APR",
    formula: "Pass-through only when bank example present — never invent",
    sourceOfTruth: "src/lib/mortgage-pipeline/rpsn.ts",
    units: "% p.a.",
    rounding: "As provided",
    boundaries: "estimateBankRpsn deprecated / forbidden",
    kind: "external",
  },
];

export function getFormula(id: string): FormulaEntry | undefined {
  return FORMULA_REGISTRY.find((f) => f.id === id);
}
