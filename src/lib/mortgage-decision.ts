/**
 * Český hypoteční decision tool — finanční matematika.
 * Nikdy netvrdí schválení úvěru. RPSN jen pokud korektně dostupné.
 */

import { calculateAnnuityPayment } from "@/lib/calculators";
import type { MortgagePurpose } from "@/lib/cnb-limits";
import {
  AGE_PURPOSE_DEPENDENCY_NOTICE,
  evaluateCzMortgageRegulation,
  type MortgageRegulationResult,
} from "@/lib/mortgage-regulation";
import {
  maxLoanFromPayment,
  totalPaidAndInterest as totalPaidAndInterestCore,
} from "@/lib/finance-math/core";
import type { IncomeSource } from "@/lib/banking";

export type DecisionViewId = "bank_max" | "recommended" | "conservative";

export type HouseholdInput = {
  adults: number;
  children: number;
};

export type MortgageDecisionInput = {
  purpose: MortgagePurpose;
  /** null = věk neznámý — engine neaplikuje young LTV */
  age: number | null;
  netIncome: number;
  incomeSource: IncomeSource;
  household: HouseholdInput;
  propertyPrice: number;
  ownFunds: number;
  otherLiabilities: number;
  /** Měsíční minimální splátky z kreditních karet / kontokorentu */
  creditLimitPayments: number;
  termYears: number;
  fixationYears: number;
  hasInsurance: boolean;
  /** Další zajištění (hotovost / ručení) — zvyšuje konzervativní kapitál */
  extraCollateral: number;
  /** Nominální sazba % p.a. — null = nepočítat splátku */
  nominalRate: number | null;
  /** Sazba s pojištěním (pro odhad nákladů pojištění) */
  rateWithInsurance: number | null;
  /** Sazba bez pojištění (pro odhad nákladů pojištění) */
  rateWithoutInsurance: number | null;
  /** Reprezentativní RPSN jen se validním příkladem */
  representativeApr: number | null;
  hasValidAprExample: boolean;
  /** Již vlastněné obytné (bez kupované); null = neznámé */
  numberOfOwnedResidentialProperties?: number | null;
  investmentPurpose?: boolean | null;
  effectiveDate?: string;
};

export type StressScenario = {
  rateBumpPp: number;
  rate: number;
  monthlyPayment: number;
};

export type DecisionScenarioResult = {
  view: DecisionViewId;
  label: string;
  description: string;
  /** Orientční strop úvěru pro tento pohled */
  loanAmount: number;
  propertyAffordable: number;
  ltv: number;
  monthlyPayment: number | null;
  totalPaid: number | null;
  totalInterest: number | null;
  insuranceMonthly: number | null;
  dstiRatio: number | null;
  householdReserve: number | null;
};

export type MortgageDecisionResult = {
  requestedLoan: number;
  requestedLtv: number;
  maxLtvPercent: number;
  maxLoanByLtv: number;
  maxLoanByDsti: number | null;
  bankMaxLoan: number | null;
  scenarios: DecisionScenarioResult[];
  stressTests: StressScenario[];
  /** RPSN pouze pokud korektně dostupné */
  rpsn: number | null;
  rateUsed: number | null;
  regulation: MortgageRegulationResult;
  agePurposeNotice: string;
  disclaimer: string;
};

/** Orientační životní minimum domácnosti (model, ne zákonný limit). */
export function estimateLivingCosts(household: HouseholdInput): number {
  const adults = Math.max(1, Math.round(household.adults));
  const children = Math.max(0, Math.round(household.children));
  return adults * 12_000 + children * 6_000;
}

/**
 * Max. úvěr z DSTI: (příjem * dstiCap - závazky) → anuitní invers.
 * dstiCap is a MODEL policy input from the caller — not invented ČNB law.
 */
export function maxLoanFromDsti(
  netIncome: number,
  otherLiabilities: number,
  creditLimitPayments: number,
  annualRatePercent: number,
  termYears: number,
  dstiCap: number
): number {
  const maxPayment = Math.max(
    0,
    netIncome * dstiCap - otherLiabilities - creditLimitPayments
  );
  return maxLoanFromPayment(maxPayment, annualRatePercent, termYears);
}

export function maxLoanFromLtv(
  propertyPrice: number,
  ownFunds: number,
  extraCollateral: number,
  maxLtvPercent: number
): number {
  const equity = Math.max(0, ownFunds) + Math.max(0, extraCollateral);
  const maxByLtv = propertyPrice * (maxLtvPercent / 100);
  const maxByEquityGap = Math.max(0, propertyPrice - equity);
  return Math.min(maxByLtv, maxByEquityGap);
}

export function totalPaidAndInterest(
  loanAmount: number,
  monthlyPayment: number,
  termYears: number
): { totalPaid: number; totalInterest: number } {
  return totalPaidAndInterestCore(loanAmount, monthlyPayment, termYears);
}

/**
 * Náklady pojištění v modelu:
 * - pokud je splátka se sazbou „s pojištěním“ vyšší → odhad z rozdílu splátek
 * - pokud je sazba s pojištěním výhodnější → pojistné neznáme → null (Na vyžádání)
 * - bez pojištění → 0
 */
export function estimateInsuranceMonthlyCost(
  loanAmount: number,
  termYears: number,
  rateWith: number | null,
  rateWithout: number | null,
  hasInsurance: boolean
): number | null {
  if (!hasInsurance) return 0;
  if (
    rateWith == null ||
    rateWithout == null ||
    !Number.isFinite(rateWith) ||
    !Number.isFinite(rateWithout) ||
    loanAmount <= 0
  ) {
    return null;
  }
  const withPay = calculateAnnuityPayment(loanAmount, rateWith, termYears);
  const withoutPay = calculateAnnuityPayment(loanAmount, rateWithout, termYears);
  const embedded = Math.round(withPay - withoutPay);
  // Preferenční sazba s pojištěním ≠ výše pojistného
  if (embedded <= 0) return null;
  return embedded;
}

export function buildStressTests(
  loanAmount: number,
  termYears: number,
  baseRate: number | null
): StressScenario[] {
  if (baseRate == null || loanAmount <= 0) return [];
  return [1, 2, 3].map((bump) => {
    const rate = baseRate + bump;
    return {
      rateBumpPp: bump,
      rate,
      monthlyPayment: Math.round(
        calculateAnnuityPayment(loanAmount, rate, termYears)
      ),
    };
  });
}

function scenarioLoan(
  view: DecisionViewId,
  input: MortgageDecisionInput,
  maxLtvPercent: number,
  rate: number | null
): number {
  const requested = Math.max(0, input.propertyPrice - input.ownFunds);
  const byLtv = maxLoanFromLtv(
    input.propertyPrice,
    input.ownFunds,
    input.extraCollateral,
    maxLtvPercent
  );

  if (rate == null) {
    // Bez sazby omezíme jen LTV / požadavek
    const caps =
      view === "bank_max"
        ? byLtv
        : view === "recommended"
          ? byLtv * 0.9
          : byLtv * 0.8;
    return Math.min(requested, Math.round(caps));
  }

  const dstiCap =
    view === "bank_max" ? 0.45 : view === "recommended" ? 0.35 : 0.28;
  const ltvFactor =
    view === "bank_max" ? 1 : view === "recommended" ? 0.92 : 0.85;

  const byDsti = maxLoanFromDsti(
    input.netIncome,
    input.otherLiabilities,
    input.creditLimitPayments,
    rate,
    input.termYears,
    dstiCap
  );

  const capped = Math.min(byLtv * ltvFactor, byDsti);
  return Math.max(0, Math.round(Math.min(requested, capped)));
}

function buildScenario(
  view: DecisionViewId,
  input: MortgageDecisionInput,
  maxLtvPercent: number
): DecisionScenarioResult {
  const labels: Record<
    DecisionViewId,
    { label: string; description: string }
  > = {
    bank_max: {
      label: "Orientační maximum",
      description:
        "Orientační horní hranice podle zadaných údajů. Skutečné podmínky a maximální úvěr stanoví banka.",
    },
    recommended: {
      label: "Doporučený rozpočet",
      description:
        "Vyvážený model (DSTI ~35 %, mírná LTV rezerva) pro běžné hospodaření.",
    },
    conservative: {
      label: "Konzervativní rozpočet",
      description:
        "Nižší zátěž (DSTI ~28 %) a větší rezerva domácnosti.",
    },
  };

  const rate = input.nominalRate;
  const loanAmount = scenarioLoan(view, input, maxLtvPercent, rate);
  const propertyAffordable = loanAmount + input.ownFunds;
  const ltv =
    input.propertyPrice > 0
      ? Math.round((loanAmount / input.propertyPrice) * 100)
      : 0;

  const monthlyPayment =
    rate != null && loanAmount > 0
      ? Math.round(
          calculateAnnuityPayment(loanAmount, rate, input.termYears)
        )
      : null;

  const totals =
    monthlyPayment != null
      ? totalPaidAndInterest(loanAmount, monthlyPayment, input.termYears)
      : { totalPaid: null, totalInterest: null };

          const insuranceMonthly = estimateInsuranceMonthlyCost(
    loanAmount,
    input.termYears,
    input.rateWithInsurance,
    input.rateWithoutInsurance,
    input.hasInsurance
  );

  const living = estimateLivingCosts(input.household);
  const householdReserve =
    monthlyPayment != null
      ? Math.round(
          input.netIncome -
            monthlyPayment -
            input.otherLiabilities -
            input.creditLimitPayments -
            living -
            (insuranceMonthly ?? 0)
        )
      : null;

  const dstiRatio =
    monthlyPayment != null && input.netIncome > 0
      ? (monthlyPayment +
          input.otherLiabilities +
          input.creditLimitPayments) /
        input.netIncome
      : null;

  return {
    view,
    ...labels[view],
    loanAmount,
    propertyAffordable,
    ltv,
    monthlyPayment,
    totalPaid: totals.totalPaid,
    totalInterest: totals.totalInterest,
    insuranceMonthly,
    dstiRatio,
    householdReserve,
  };
}

export function calculateMortgageDecision(
  input: MortgageDecisionInput
): MortgageDecisionResult {
  const regulation = evaluateCzMortgageRegulation({
    purpose: input.purpose,
    age: input.age,
    numberOfOwnedResidentialProperties:
      input.numberOfOwnedResidentialProperties ?? null,
    investmentPurpose:
      input.investmentPurpose ?? input.purpose === "investment",
    applicantType: "individual",
    effectiveDate: input.effectiveDate,
  });
  const maxLtvPercent = regulation.maxLtv;

  const requestedLoan = Math.max(0, input.propertyPrice - input.ownFunds);
  const requestedLtv =
    input.propertyPrice > 0
      ? Math.round((requestedLoan / input.propertyPrice) * 100)
      : 0;

  const maxLoanByLtv = Math.round(
    maxLoanFromLtv(
      input.propertyPrice,
      input.ownFunds,
      input.extraCollateral,
      maxLtvPercent
    )
  );

  const maxLoanByDsti =
    input.nominalRate != null
      ? Math.round(
          maxLoanFromDsti(
            input.netIncome,
            input.otherLiabilities,
            input.creditLimitPayments,
            input.nominalRate,
            input.termYears,
            0.45
          )
        )
      : null;

  const bankMaxLoan =
    maxLoanByDsti != null
      ? Math.min(maxLoanByLtv, maxLoanByDsti)
      : maxLoanByLtv;

  const scenarios = (
    ["bank_max", "recommended", "conservative"] as DecisionViewId[]
  ).map((v) => buildScenario(v, input, maxLtvPercent));

  const recommended = scenarios.find((s) => s.view === "recommended")!;
  const stressLoan = recommended.loanAmount;

  return {
    requestedLoan,
    requestedLtv,
    maxLtvPercent,
    maxLoanByLtv,
    maxLoanByDsti,
    bankMaxLoan,
    scenarios,
    stressTests: buildStressTests(
      stressLoan,
      input.termYears,
      input.nominalRate
    ),
    rpsn:
      input.representativeApr != null && input.hasValidAprExample
        ? input.representativeApr
        : null,
    rateUsed: input.nominalRate,
    regulation,
    agePurposeNotice: AGE_PURPOSE_DEPENDENCY_NOTICE,
    disclaimer: [
      "Výsledky jsou orientační model Hypotéka Jasně. Nejde o nabídku ani příslib schválení úvěru bankou. Individuální posouzení provádí banka / partner po ověření identity.",
      regulation.frameworkDisclaimer,
    ].join(" "),
  };
}
