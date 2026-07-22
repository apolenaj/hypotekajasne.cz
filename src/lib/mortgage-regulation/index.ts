export type {
  ApplicantType,
  IndicatorStatus,
  MortgageRegulationInput,
  MortgageRegulationResult,
  RegulationCountry,
  RegulationPurpose,
  RegulationRuleType,
} from "@/lib/mortgage-regulation/types";

export {
  AGE_PURPOSE_DEPENDENCY_NOTICE,
  REGULATION_FRAMEWORK_DISCLAIMER,
} from "@/lib/mortgage-regulation/types";

export {
  CZ_REGULATION_PERIODS,
  resolveCzPeriod,
} from "@/lib/mortgage-regulation/cz-rules";

export {
  evaluateCzMortgageRegulation,
  evaluateMortgageRegulation,
  resolveAppliedBucket,
} from "@/lib/mortgage-regulation/engine";
