/**
 * Rodinný rozpočet — typy časového modelu.
 * MODEL: popisuje rozpočet podle zadaných údajů, ne bankovní schválení.
 */

export type ExpenseKind =
  | "essential"
  | "optional"
  | "planned_saving"
  | "one_time";

export type ExpenseCategoryId =
  | "food"
  | "utilities"
  | "transport"
  | "children"
  | "insurance_health"
  | "other_loans"
  | "property_maintenance"
  | "leisure"
  | "pets"
  | "other"
  | "rent"
  | "own_housing_ops"
  | "childcare"
  | "mortgage";

export type IncomePhase = {
  /** Inclusive month index (1-based in UI; 0-based internally). */
  startMonth: number;
  /** Inclusive end month; null = open until horizon. */
  endMonth: number | null;
  amountCzk: number;
  /** When true, this phase replaces the adult's regular wage for overlap months. */
  replacesRegularWage?: boolean;
  label?: string;
};

export type ContributingAdult = {
  id: string;
  label: string;
  regularNetMonthlyCzk: number;
  /** Amount included in the model from irregular income (bonus etc.). */
  irregularIncludedMonthlyCzk: number;
  phases: IncomePhase[];
};

export type HouseholdExpense = {
  id: string;
  category: ExpenseCategoryId;
  kind: ExpenseKind;
  label: string;
  /** Monthly amount when cadence is monthly. */
  amountCzk: number;
  cadence: "monthly" | "annual";
  /** For annual with a specific payment month (1–12 calendar). When set, not averaged. */
  paymentMonthOfYear?: number | null;
  /** Inclusive active window in model months (1-based). */
  startMonth?: number;
  endMonth?: number | null;
};

export type ParentalAllowancePlan = {
  enabled: boolean;
  /** Adult whose wage is replaced during parental phases. */
  adultId: string;
  startMonth: number;
  /** Manual expected PPM / maternity-period income. */
  maternityMonthlyCzk: number;
  maternityMonths: number;
  /** Expected remaining balance of parental allowance. */
  parentalAllowanceBalanceCzk: number;
  parentalAllowanceMonthlyDrawCzk: number;
  /** Gap months with neither maternity nor allowance before return. */
  gapMonthsBeforeReturn: number;
  returnMonthlyCzk: number;
  returnIsPartial: boolean;
  oneTimeChildCostsCzk: number;
  oneTimeChildCostMonth?: number;
  extraMonthlyChildCostsCzk: number;
  childcareAfterReturnMonthlyCzk: number;
};

export type IncomeGapScenario = {
  enabled: boolean;
  adultId: string;
  startMonth: number;
  durationMonths: 3 | 6 | number;
  /** Replacement income during gap (manual; no auto unemployment). */
  replacementMonthlyCzk: number;
};

export type RefixationScenario = {
  enabled: boolean;
  /** Month when new rate starts (1-based). */
  month: number;
  rateIncreasePp: number;
};

export type MortgageParams = {
  principalCzk: number;
  annualRatePercent: number;
  termYears: number;
  /** Fixed monthly payment until refixation (or whole horizon if no refix). */
  monthlyPaymentCzk: number;
};

export type MinReserveMode = "czk" | "months_essential";

export type FamilyBudgetInput = {
  horizonMonths: 60 | 120 | number;
  initialLiquidReserveCzk: number;
  adults: ContributingAdult[];
  /** Other recurring income (alimony, benefits already net, etc.). */
  otherMonthlyIncomeCzk: number;
  /**
   * Net rental cash available to household after related costs/loans.
   * Flag whether those deductions are already applied.
   */
  rentalCashflowMonthlyCzk: number;
  rentalAlreadyNetOfCostsAndLoans: boolean;
  expenses: HouseholdExpense[];
  mortgage: MortgageParams;
  /** Month when current rent ends (1-based). null = never / no rent. */
  rentEndsMonth: number | null;
  parenthood: ParentalAllowancePlan;
  incomeGap: IncomeGapScenario;
  refixation: RefixationScenario;
  /** Multiply regular living expenses (not mortgage/savings) by this factor. */
  livingExpenseMultiplier: number;
  minReserveMode: MinReserveMode;
  minReserveCzk: number;
  minReserveMonths: number;
  /**
   * When true, parenthood phases are applied.
   * Combinations are controlled by enabled flags on parenthood/gap/refix/multiplier.
   */
  applyParenthood: boolean;
};

export type MonthMarker =
  | "parenthood_start"
  | "return_to_work"
  | "refixation"
  | "rent_end"
  | "allowance_exhausted"
  | "one_time";

export type MonthBreakdown = {
  month: number;
  incomeTotalCzk: number;
  expenseTotalCzk: number;
  mortgagePaymentCzk: number;
  essentialExpenseCzk: number;
  optionalExpenseCzk: number;
  plannedSavingCzk: number;
  oneTimeExpenseCzk: number;
  operatingBalanceCzk: number;
  /** Balance after planned saving transfers (liquidity impact). */
  balanceAfterSavingCzk: number;
  reserveStartCzk: number;
  reserveEndCzk: number;
  uncoveredDeficitCzk: number;
  markers: MonthMarker[];
  notes: string[];
};

export type FamilyBudgetResult = {
  months: MonthBreakdown[];
  typicalMonthlySurplusCzk: number;
  typicalMonthlyAfterSavingCzk: number;
  worstMonth: number | null;
  worstOperatingBalanceCzk: number;
  deficitMonthCount: number;
  lowestReserveCzk: number;
  firstReserveExhaustionMonth: number | null;
  additionalCapitalForMinReserveCzk: number;
  minReserveTargetCzk: number;
  minReserveBasisLabel: string;
  verdict: "surplus" | "drawing_reserve" | "uncovered_deficit";
  verdictText: string;
  assumptions: string[];
};
