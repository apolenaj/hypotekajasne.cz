/**
 * Re-export matching the planned services path.
 * Canonical implementation: @/lib/property-rentgen/rentgen-math-engine
 */
export {
  RentgenMathValidationError,
  amortizeYearMonths,
  buildPremiumRentgenInput,
  projectWealthCreation,
  projectYearlyCashFlows,
  remainingTermYearsAfter,
  resolveInitialEquity,
  resolveLoanAmount,
  resolveTotalDealCost,
  runPremiumRentgenAudit,
  simulateRateShock,
} from "@/lib/property-rentgen/rentgen-math-engine";

export type {
  MarketAssumptions,
  MortgageAssumptions,
  PremiumRentgenAuditInput,
  PremiumRentgenAuditResult,
  PropertyInput,
  StressTestResults,
  WealthCreationProjection,
  YearlyCashFlow,
} from "@/lib/property-rentgen/audit-types";
