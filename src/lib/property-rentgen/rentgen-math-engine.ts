/**
 * Prémiový 30Y finanční motor Investičního rentgenu.
 * Annuity / LTV: kanonicky z @/lib/finance-math (žádná paralelní implementace).
 */

import {
  calculateAnnuityPayment,
  ltvPercent,
  roundMoney,
} from "@/lib/finance-math/core";
import {
  DEFAULT_MARKET_ASSUMPTIONS,
  PREMIUM_RENTGEN_DISCLAIMER,
  type MarketAssumptions,
  type MortgageAssumptions,
  type PremiumRentgenAuditInput,
  type PremiumRentgenAuditResult,
  type PremiumRentgenAuditSummary,
  type PropertyInput,
  type RateShockScenario,
  type StressTestResults,
  type WealthCreationPoint,
  type WealthCreationProjection,
  type YearlyCashFlow,
} from "@/lib/property-rentgen/audit-types";

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

/* -------------------------------------------------------------------------- */
/* Validation                                                                 */
/* -------------------------------------------------------------------------- */

export class RentgenMathValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RentgenMathValidationError";
  }
}

function assertFiniteNonNeg(name: string, value: number): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new RentgenMathValidationError(`${name} musí být nezáporné číslo.`);
  }
}

function assertRateRatio(name: string, value: number): void {
  if (!Number.isFinite(value) || value < -0.5 || value > 0.5) {
    throw new RentgenMathValidationError(
      `${name} musí být roční míra v rozumném pásmu (např. 0.03 = 3 %).`
    );
  }
}

export function resolveLoanAmount(
  property: PropertyInput,
  mortgage: MortgageAssumptions
): number {
  if (mortgage.loanAmountCzk != null) {
    assertFiniteNonNeg("loanAmountCzk", mortgage.loanAmountCzk);
    return roundMoney(mortgage.loanAmountCzk);
  }
  const derived = roundMoney(property.purchasePriceCzk - mortgage.ownFundsCzk);
  if (derived < 0) {
    throw new RentgenMathValidationError(
      "Vlastní zdroje nesmí převýšit kupní cenu (bez explicitního úvěru)."
    );
  }
  return derived;
}

export function resolveTotalDealCost(property: PropertyInput): number {
  return roundMoney(
    property.purchasePriceCzk + property.capexCzk + property.closingCostsCzk
  );
}

export function resolveInitialEquity(
  property: PropertyInput,
  mortgage: MortgageAssumptions,
  loanAmountCzk: number
): number {
  // Equity = vlastní zdroje + CAPEX + closing − (případný „přeúvěr“ nad kupní cenu)
  const cashIn =
    mortgage.ownFundsCzk + property.capexCzk + property.closingCostsCzk;
  const overLoan = Math.max(0, loanAmountCzk - property.purchasePriceCzk);
  return roundMoney(Math.max(0, cashIn - overLoan));
}

function validateInput(input: PremiumRentgenAuditInput): void {
  const { property: p, mortgage: m, market: k } = input;
  assertFiniteNonNeg("purchasePriceCzk", p.purchasePriceCzk);
  if (p.purchasePriceCzk <= 0) {
    throw new RentgenMathValidationError("Kupní cena musí být kladná.");
  }
  assertFiniteNonNeg("capexCzk", p.capexCzk);
  assertFiniteNonNeg("closingCostsCzk", p.closingCostsCzk);
  assertFiniteNonNeg("monthlyGrossRentCzk", p.monthlyGrossRentCzk);
  assertFiniteNonNeg("monthlyOperatingCostsCzk", p.monthlyOperatingCostsCzk);
  assertFiniteNonNeg("monthlyReserveCzk", p.monthlyReserveCzk);
  if (!Number.isFinite(p.vacancyRate) || p.vacancyRate < 0 || p.vacancyRate > 1) {
    throw new RentgenMathValidationError("vacancyRate musí být v intervalu 0–1.");
  }

  assertFiniteNonNeg("ownFundsCzk", m.ownFundsCzk);
  assertFiniteNonNeg("annualRatePercent", m.annualRatePercent);
  if (!Number.isFinite(m.termYears) || m.termYears < 1 || m.termYears > 40) {
    throw new RentgenMathValidationError("termYears musí být 1–40.");
  }
  if (
    !Number.isFinite(m.fixationYears) ||
    m.fixationYears < 1 ||
    m.fixationYears > m.termYears
  ) {
    throw new RentgenMathValidationError(
      "fixationYears musí být 1…termYears (šok po konci fixace)."
    );
  }

  assertRateRatio("rentGrowthPa", k.rentGrowthPa);
  assertRateRatio("opexGrowthPa", k.opexGrowthPa);
  assertRateRatio("propertyAppreciationPa", k.propertyAppreciationPa);
  assertRateRatio("sp500ReturnPa", k.sp500ReturnPa);
  if (
    !Number.isFinite(k.projectionYears) ||
    k.projectionYears < 1 ||
    k.projectionYears > 40
  ) {
    throw new RentgenMathValidationError("projectionYears musí být 1–40.");
  }
  if (!k.rateShockPercents?.length) {
    throw new RentgenMathValidationError("rateShockPercents nesmí být prázdné.");
  }
}

/* -------------------------------------------------------------------------- */
/* Amortization primitives                                                    */
/* -------------------------------------------------------------------------- */

export type YearAmortization = {
  openingBalanceCzk: number;
  closingBalanceCzk: number;
  interestPaidCzk: number;
  principalPaidCzk: number;
  monthsApplied: number;
};

/**
 * Simulace až 12 měsíčních anuitních plateb.
 * Splátka = úrok + úmor; při doplacení se poslední platba zkrátí.
 */
export function amortizeYearMonths(
  openingBalanceCzk: number,
  annualRatePercent: number,
  monthlyPaymentCzk: number,
  months = 12
): YearAmortization {
  let balance = Math.max(0, openingBalanceCzk);
  const r = annualRatePercent / 100 / 12;
  let interestPaid = 0;
  let principalPaid = 0;
  let monthsApplied = 0;

  for (let m = 0; m < months; m += 1) {
    if (balance <= 0.5) {
      balance = 0;
      break;
    }
    const interest = r === 0 ? 0 : balance * r;
    const rawPrincipal = monthlyPaymentCzk - interest;
    const principal = Math.min(Math.max(0, rawPrincipal), balance);
    // If payment < interest (pathological rate spike), capitalize residual interest.
    const unpaidInterest = Math.max(0, interest - monthlyPaymentCzk);
    interestPaid += interest - unpaidInterest;
    principalPaid += principal;
    balance = balance - principal + unpaidInterest;
    monthsApplied += 1;
  }

  return {
    openingBalanceCzk: roundMoney(openingBalanceCzk),
    closingBalanceCzk: roundMoney(Math.max(0, balance)),
    interestPaidCzk: roundMoney(interestPaid),
    principalPaidCzk: roundMoney(principalPaid),
    monthsApplied,
  };
}

export function remainingTermYearsAfter(
  termYears: number,
  yearsElapsed: number
): number {
  return Math.max(0, termYears - yearsElapsed);
}

/* -------------------------------------------------------------------------- */
/* Core 30Y loop                                                              */
/* -------------------------------------------------------------------------- */

function annualOpsForYear(
  property: PropertyInput,
  market: MarketAssumptions,
  yearIndex0: number
): {
  annualEffectiveRentCzk: number;
  annualOperatingCostsCzk: number;
  annualReserveCzk: number;
} {
  const rentFactor = Math.pow(1 + market.rentGrowthPa, yearIndex0);
  const opexFactor = Math.pow(1 + market.opexGrowthPa, yearIndex0);
  const grossRent = property.monthlyGrossRentCzk * 12 * rentFactor;
  const effectiveRent = grossRent * (1 - property.vacancyRate);
  const opex = property.monthlyOperatingCostsCzk * 12 * opexFactor;
  const reserve = property.monthlyReserveCzk * 12 * opexFactor;
  return {
    annualEffectiveRentCzk: roundMoney(effectiveRent),
    annualOperatingCostsCzk: roundMoney(opex),
    annualReserveCzk: roundMoney(reserve),
  };
}

/**
 * 30Y (nebo projectionYears) smyčka: umoření, růst nájmu/nákladů, net CF, equity.
 * Sazba zůstává na base rate — šoky řeší `simulateRateShock` zvlášť.
 */
export function projectYearlyCashFlows(
  property: PropertyInput,
  mortgage: MortgageAssumptions,
  market: MarketAssumptions,
  loanAmountCzk: number
): YearlyCashFlow[] {
  const years = Math.round(market.projectionYears);
  const monthlyPayment = calculateAnnuityPayment(
    loanAmountCzk,
    mortgage.annualRatePercent,
    mortgage.termYears
  );
  const rows: YearlyCashFlow[] = [];
  let balance = loanAmountCzk;

  for (let year = 1; year <= years; year += 1) {
    const amort =
      balance > 0 && monthlyPayment > 0
        ? amortizeYearMonths(balance, mortgage.annualRatePercent, monthlyPayment)
        : {
            openingBalanceCzk: roundMoney(balance),
            closingBalanceCzk: 0,
            interestPaidCzk: 0,
            principalPaidCzk: 0,
            monthsApplied: 0,
          };

    balance = amort.closingBalanceCzk;
    const ops = annualOpsForYear(property, market, year - 1);
    const annualDebt = roundMoney(monthlyPayment * amort.monthsApplied);
    const propertyValue = roundMoney(
      property.purchasePriceCzk *
        Math.pow(1 + market.propertyAppreciationPa, year)
    );
    const netCf = roundMoney(
      ops.annualEffectiveRentCzk -
        ops.annualOperatingCostsCzk -
        ops.annualReserveCzk -
        annualDebt
    );

    rows.push({
      year,
      propertyValueCzk: propertyValue,
      loanBalanceEndCzk: balance,
      monthlyPaymentCzk: roundMoney(monthlyPayment),
      annualDebtServiceCzk: annualDebt,
      annualInterestPaidCzk: amort.interestPaidCzk,
      annualPrincipalPaidCzk: amort.principalPaidCzk,
      annualEffectiveRentCzk: ops.annualEffectiveRentCzk,
      annualOperatingCostsCzk: ops.annualOperatingCostsCzk,
      annualReserveCzk: ops.annualReserveCzk,
      annualNetCashFlowCzk: netCf,
      equityCzk: roundMoney(Math.max(0, propertyValue - balance)),
      appliedRatePercent: mortgage.annualRatePercent,
    });
  }

  return rows;
}

/* -------------------------------------------------------------------------- */
/* Rate shock (refix at year fixationYears + 1)                               */
/* -------------------------------------------------------------------------- */

export function simulateRateShock(
  property: PropertyInput,
  mortgage: MortgageAssumptions,
  market: MarketAssumptions,
  loanAmountCzk: number
): StressTestResults {
  const baseMonthly = roundMoney(
    calculateAnnuityPayment(
      loanAmountCzk,
      mortgage.annualRatePercent,
      mortgage.termYears
    )
  );

  // Balance after `fixationYears` full years of base amortization.
  let balance = loanAmountCzk;
  for (let y = 0; y < mortgage.fixationYears; y += 1) {
    if (balance <= 0) break;
    balance = amortizeYearMonths(
      balance,
      mortgage.annualRatePercent,
      baseMonthly
    ).closingBalanceCzk;
  }

  const remainingTerm = remainingTermYearsAfter(
    mortgage.termYears,
    mortgage.fixationYears
  );
  const shockYearIndex0 = mortgage.fixationYears; // first year after fixation
  const ops = annualOpsForYear(property, market, shockYearIndex0);

  const scenarios: RateShockScenario[] = market.rateShockPercents.map(
    (shockRatePercent) => {
      const monthlyAfter =
        balance > 0 && remainingTerm > 0
          ? roundMoney(
              calculateAnnuityPayment(balance, shockRatePercent, remainingTerm)
            )
          : 0;
      const annualDebt = roundMoney(monthlyAfter * 12);
      const netCf = roundMoney(
        ops.annualEffectiveRentCzk -
          ops.annualOperatingCostsCzk -
          ops.annualReserveCzk -
          annualDebt
      );

      return {
        shockRatePercent,
        monthlyPaymentAfterShockCzk: monthlyAfter,
        monthlyPaymentDeltaCzk: roundMoney(monthlyAfter - baseMonthly),
        annualDebtServiceAfterShockCzk: annualDebt,
        annualNetCashFlowYearAfterShockCzk: netCf,
        loanBalanceAtShockCzk: roundMoney(balance),
        remainingTermYearsAtShock: remainingTerm,
      };
    }
  );

  return {
    fixationYears: mortgage.fixationYears,
    baseMonthlyPaymentCzk: baseMonthly,
    scenarios,
  };
}

/* -------------------------------------------------------------------------- */
/* Wealth creation vs S&P 500                                                 */
/* -------------------------------------------------------------------------- */

export function projectWealthCreation(
  yearlyCashFlows: YearlyCashFlow[],
  initialEquityCzk: number,
  market: MarketAssumptions
): WealthCreationProjection {
  const equity0 = Math.max(0, initialEquityCzk);
  const points: WealthCreationPoint[] = yearlyCashFlows.map((row) => {
    const sp500 = roundMoney(
      equity0 * Math.pow(1 + market.sp500ReturnPa, row.year)
    );
    const propertyEquity = row.equityCzk;
    return {
      year: row.year,
      propertyEquityCzk: propertyEquity,
      sp500ValueCzk: sp500,
      leverageAdvantageCzk: roundMoney(propertyEquity - sp500),
      propertyEquityMultiple: equity0 > 0 ? propertyEquity / equity0 : 0,
      sp500Multiple: equity0 > 0 ? sp500 / equity0 : 0,
    };
  });

  const terminal =
    points[points.length - 1] ??
    ({
      year: 0,
      propertyEquityCzk: equity0,
      sp500ValueCzk: equity0,
      leverageAdvantageCzk: 0,
      propertyEquityMultiple: 1,
      sp500Multiple: 1,
    } satisfies WealthCreationPoint);

  return {
    initialEquityCzk: roundMoney(equity0),
    sp500ReturnPa: market.sp500ReturnPa,
    propertyAppreciationPa: market.propertyAppreciationPa,
    points,
    terminal,
  };
}

/* -------------------------------------------------------------------------- */
/* Orchestrator                                                               */
/* -------------------------------------------------------------------------- */

function buildSummary(
  property: PropertyInput,
  mortgage: MortgageAssumptions,
  loanAmountCzk: number,
  initialEquityCzk: number,
  baseMonthlyPaymentCzk: number,
  year1: YearlyCashFlow | undefined
): PremiumRentgenAuditSummary {
  const totalDeal = resolveTotalDealCost(property);
  const y1Cf = year1?.annualNetCashFlowCzk ?? 0;
  const noiProxy =
    (year1?.annualEffectiveRentCzk ?? 0) -
    (year1?.annualOperatingCostsCzk ?? 0) -
    (year1?.annualReserveCzk ?? 0);

  return {
    purchasePriceCzk: roundMoney(property.purchasePriceCzk),
    totalDealCostCzk: totalDeal,
    loanAmountCzk,
    initialEquityCzk,
    ltvPercent: roundMoney(ltvPercent(loanAmountCzk, property.purchasePriceCzk) * 10) / 10,
    baseMonthlyPaymentCzk,
    year1NetCashFlowCzk: y1Cf,
    year1NetYieldOnDealPct:
      totalDeal > 0 ? roundMoney((noiProxy / totalDeal) * 1000) / 10 : 0,
    year1CashOnCashPct:
      initialEquityCzk > 0
        ? roundMoney((y1Cf / initialEquityCzk) * 1000) / 10
        : null,
  };
}

export function runPremiumRentgenAudit(
  input: PremiumRentgenAuditInput
): PremiumRentgenAuditResult {
  const normalized: PremiumRentgenAuditInput = {
    property: input.property,
    mortgage: input.mortgage,
    market: {
      ...DEFAULT_MARKET_ASSUMPTIONS,
      ...input.market,
      rateShockPercents:
        input.market.rateShockPercents ??
        DEFAULT_MARKET_ASSUMPTIONS.rateShockPercents,
    },
  };

  validateInput(normalized);

  const loanAmountCzk = resolveLoanAmount(
    normalized.property,
    normalized.mortgage
  );
  if (loanAmountCzk > normalized.property.purchasePriceCzk) {
    throw new RentgenMathValidationError(
      "Úvěr nesmí být vyšší než kupní cena nemovitosti."
    );
  }

  const initialEquityCzk = resolveInitialEquity(
    normalized.property,
    normalized.mortgage,
    loanAmountCzk
  );

  const yearlyCashFlows = projectYearlyCashFlows(
    normalized.property,
    normalized.mortgage,
    normalized.market,
    loanAmountCzk
  );
  const stressTests = simulateRateShock(
    normalized.property,
    normalized.mortgage,
    normalized.market,
    loanAmountCzk
  );
  const wealthCreation = projectWealthCreation(
    yearlyCashFlows,
    initialEquityCzk,
    normalized.market
  );

  return {
    generatedAt: new Date().toISOString(),
    disclaimer: PREMIUM_RENTGEN_DISCLAIMER,
    input: normalized,
    summary: buildSummary(
      normalized.property,
      normalized.mortgage,
      loanAmountCzk,
      initialEquityCzk,
      stressTests.baseMonthlyPaymentCzk,
      yearlyCashFlows[0]
    ),
    yearlyCashFlows,
    stressTests,
    wealthCreation,
  };
}

/** Convenience: merge partial market defaults. */
export function buildPremiumRentgenInput(args: {
  property: PropertyInput;
  mortgage: MortgageAssumptions;
  market?: Partial<MarketAssumptions>;
}): PremiumRentgenAuditInput {
  return {
    property: args.property,
    mortgage: args.mortgage,
    market: {
      ...DEFAULT_MARKET_ASSUMPTIONS,
      ...args.market,
      rateShockPercents:
        args.market?.rateShockPercents ??
        DEFAULT_MARKET_ASSUMPTIONS.rateShockPercents,
    },
  };
}
