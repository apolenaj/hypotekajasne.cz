export type {
  FamilyBudgetInput,
  FamilyBudgetResult,
  MonthBreakdown,
  ContributingAdult,
  HouseholdExpense,
  ParentalAllowancePlan,
} from "@/lib/family-budget/types";
export type { ScenarioPresetId } from "@/lib/family-budget/timeline";
export {
  applyScenarioPreset,
  buildParenthoodPhases,
  simulateFamilyBudget,
} from "@/lib/family-budget/timeline";
export {
  calculateAppraisalVsPrice,
  type AppraisalVsPriceInput,
  type AppraisalVsPriceResult,
} from "@/lib/family-budget/appraisal";
