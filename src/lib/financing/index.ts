export type {
  DeveloperPhaseResult,
  DeveloperPlanPhase,
  DeveloperPlanPhaseId,
  FinancingCalculationInput,
  FinancingCalculationResult,
  FinancingOptionId,
  FinancingProductDefinition,
  RateAvailability,
} from "@/lib/financing/types";

export {
  FINANCING_OPTION_IDS,
  FINANCING_OPTION_LABELS,
  LOCAL_FINANCING_UNVERIFIED_MESSAGE,
} from "@/lib/financing/types";

export {
  BALI_DEVELOPER_SCHEDULE,
  COUNTRY_FINANCING_PRODUCTS,
  DUBAI_DEVELOPER_SCHEDULE,
  defaultFinancingOption,
  defaultOwnFundsForCountry,
  getFinancingProduct,
  getFinancingProducts,
  hasLocalMortgageProduct,
} from "@/lib/financing/products";

export {
  assertSchedulePercents,
  calculateDeveloperPlanSchedule,
} from "@/lib/financing/developer-plan";

export { calculateFinancing } from "@/lib/financing/calculate";
