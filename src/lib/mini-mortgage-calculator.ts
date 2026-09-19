/**
 * Hero mini kalkulačka — tenká vrstva nad sdílenou anuitní matematikou.
 * Modelová sazba je jen pro orientační splátku — ne bankovní nabídka.
 */

import {
  calculateAnnuityPayment,
} from "@/lib/finance-math/core";
import {
  buildMortgageJourneyHref,
  mergeMarketingFromSearch,
  type MortgageJourneyContext,
} from "@/lib/mortgage-rates/mortgage-journey-context";
import {
  buildLtvContext,
  formatExactLtvCs,
  formatLtvBandLabel,
} from "@/lib/mortgage-rates/ltv-context";
import { MODEL_FALLBACK_RATE_PERCENT } from "@/lib/rates/model-fallback";

export type MiniMortgagePurpose = "purchase" | "refinance";

export type MiniMortgageInput = {
  propertyPriceCzk: number;
  ownFundsCzk: number;
  termYears: number;
  /** Modelová sazba p.a. — nikdy bankovní LIVE. */
  annualRatePercent?: number;
  /**
   * Očekávané RPSN p.a. pro odhad celkové zaplacené částky.
   * Splátka se z něj nepočítá. Výchozí je sazba + 0,2 p. b.
   */
  aprPercent?: number;
  purpose?: MiniMortgagePurpose;
  fixationMonths?: number;
};

export type MiniMortgageResult = {
  propertyPriceCzk: number;
  loanAmountCzk: number;
  /** Skutečné LTV (loan / property × 100), jedno desetinné místo. */
  exactLtv: number | null;
  /** Horní limit bankovního pásma pro sazby (např. 90). */
  ltvBand: number | null;
  ltvValidationError: string | null;
  monthlyPaymentCzk: number;
  annualRatePercent: number;
  /** RPSN použité jen pro odhad celkové zaplacené částky. */
  aprPercent: number;
  /** Součet modelových splátek při RPSN za celou splatnost. */
  totalPaidCzk: number;
  termYears: number;
  requiredOwnFundsCzk: number;
  purpose: MiniMortgagePurpose;
  fixationMonths: number;
};

/** @deprecated Prefer exactLtv */
export type MiniMortgageResultLegacy = MiniMortgageResult & { ltvPct: number };

export const MINI_MORTGAGE_DEFAULTS = {
  propertyPriceCzk: 6_000_000,
  ownFundsCzk: 1_200_000,
  termYears: 30,
  annualRatePercent: MODEL_FALLBACK_RATE_PERCENT,
  purpose: "purchase" as MiniMortgagePurpose,
  fixationMonths: 36,
} as const;

/** Odhad poplatků nad nominální sazbu, dokud uživatel RPSN ručně nezmění. */
export const MINI_MORTGAGE_APR_BUFFER_PERCENT = 0.2;

export const MINI_MORTGAGE_PRICE_SLIDER = {
  min: 1_000_000,
  max: 20_000_000,
  step: 100_000,
} as const;

export function suggestedAprPercent(annualRatePercent: number): number {
  const rate = Number.isFinite(annualRatePercent) ? annualRatePercent : 0;
  return Math.round((rate + MINI_MORTGAGE_APR_BUFFER_PERCENT) * 100) / 100;
}

/**
 * Celková zaplacená částka = anuita při RPSN × počet měsíců.
 * Nominální sazba do tohoto součtu nevstupuje.
 */
export function totalPaidFromApr(
  loanAmountCzk: number,
  aprPercent: number,
  termYears: number
): number {
  if (
    !Number.isFinite(loanAmountCzk) ||
    loanAmountCzk <= 0 ||
    !Number.isFinite(termYears) ||
    termYears <= 0 ||
    !Number.isFinite(aprPercent) ||
    aprPercent < 0
  ) {
    return 0;
  }
  const monthly = calculateAnnuityPayment(loanAmountCzk, aprPercent, termYears);
  return Math.round(monthly * termYears * 12);
}

export const MINI_MORTGAGE_TERM_OPTIONS = [10, 15, 20, 25, 30] as const;
export const MINI_MORTGAGE_FIXATION_OPTIONS = [24, 36, 60, 84, 120] as const;

export const MINI_MORTGAGE_CTA = {
  calculate: "Spočítat splátku",
  viewRates: "Porovnat sazby pro toto zadání",
} as const;

/** @deprecated Prefer MINI_MORTGAGE_CTA.calculate */
export function miniMortgageCtaLabel(): string {
  return MINI_MORTGAGE_CTA.calculate;
}

export type MiniMortgageValidation = {
  valid: boolean;
  reason: string | null;
};

/** Whether the user can run an explicit payment calculation. */
export function validateMiniMortgageInput(
  input: MiniMortgageInput
): MiniMortgageValidation {
  const propertyPriceCzk = Number.isFinite(input.propertyPriceCzk)
    ? input.propertyPriceCzk
    : 0;
  const ownFundsCzk = Number.isFinite(input.ownFundsCzk) ? input.ownFundsCzk : 0;
  const termYears = Number.isFinite(input.termYears) ? input.termYears : 0;

  if (propertyPriceCzk <= 0) {
    return { valid: false, reason: "Zadejte cenu nemovitosti." };
  }
  if (ownFundsCzk < 0) {
    return { valid: false, reason: "Vlastní prostředky nemohou být záporné." };
  }
  if (ownFundsCzk > propertyPriceCzk) {
    return {
      valid: false,
      reason: "Vlastní prostředky nesmí přesáhnout cenu nemovitosti.",
    };
  }
  if (propertyPriceCzk - ownFundsCzk <= 0) {
    return {
      valid: false,
      reason: "Výše úvěru musí být větší než nula.",
    };
  }
  if (termYears <= 0) {
    return { valid: false, reason: "Zadejte dobu splácení." };
  }
  return { valid: true, reason: null };
}

export { formatExactLtvCs, formatLtvBandLabel };

/** Anuitní splátka + přesné LTV z ceny a vlastních prostředků. */
export function computeMiniMortgage(input: MiniMortgageInput): MiniMortgageResult {
  const annualRatePercent =
    input.annualRatePercent ?? MODEL_FALLBACK_RATE_PERCENT;
  const termYears = input.termYears > 0 ? input.termYears : 0;
  const purpose = input.purpose ?? "purchase";
  const fixationMonths = input.fixationMonths ?? 36;

  const propertyPriceCzk = Number.isFinite(input.propertyPriceCzk)
    ? Math.max(0, input.propertyPriceCzk)
    : 0;
  const ownFunds = Number.isFinite(input.ownFundsCzk)
    ? Math.max(0, input.ownFundsCzk)
    : 0;

  const loanAmountCzk = Math.max(0, propertyPriceCzk - ownFunds);
  const ltv = buildLtvContext({
    propertyValueCzk: propertyPriceCzk,
    loanAmountCzk,
  });

  const monthlyPaymentCzk =
    loanAmountCzk > 0 && termYears > 0
      ? Math.round(
          calculateAnnuityPayment(loanAmountCzk, annualRatePercent, termYears)
        )
      : 0;

  const aprPercent = Number.isFinite(input.aprPercent)
    ? Math.max(0, input.aprPercent as number)
    : suggestedAprPercent(annualRatePercent);
  const totalPaidCzk = totalPaidFromApr(loanAmountCzk, aprPercent, termYears);

  return {
    propertyPriceCzk,
    loanAmountCzk,
    exactLtv: ltv.exactLtv,
    ltvBand: ltv.ltvBand,
    ltvValidationError: ltv.validationError,
    monthlyPaymentCzk,
    annualRatePercent,
    aprPercent,
    totalPaidCzk,
    termYears,
    requiredOwnFundsCzk: Math.min(ownFunds, propertyPriceCzk),
    purpose,
    fixationMonths,
  };
}

export type RefinanceComparison = {
  balanceCzk: number;
  currentMonthlyCzk: number;
  newMonthlyCzk: number;
  differenceMonthlyCzk: number;
  /** Jednorázový náklad. Není přičtený k jistině ani ke splátce. */
  switchCostCzk: number;
};

/**
 * Porovnání dvou anuit ze stejné funkce jako hypoteční splátka.
 * Náklad změny zůstává samostatně, aby se nezapočítal dvakrát.
 */
export function compareRefinancePayments(input: {
  balanceCzk: number;
  currentRatePercent: number;
  newRatePercent: number;
  remainingYears: number;
  switchCostCzk: number;
}): RefinanceComparison | null {
  const balance = input.balanceCzk;
  const years = input.remainingYears;
  if (
    !Number.isFinite(balance) ||
    balance <= 0 ||
    !Number.isFinite(years) ||
    years <= 0 ||
    !Number.isFinite(input.currentRatePercent) ||
    input.currentRatePercent < 0 ||
    !Number.isFinite(input.newRatePercent) ||
    input.newRatePercent < 0 ||
    !Number.isFinite(input.switchCostCzk) ||
    input.switchCostCzk < 0
  ) {
    return null;
  }
  const currentMonthlyCzk = Math.round(
    calculateAnnuityPayment(balance, input.currentRatePercent, years)
  );
  const newMonthlyCzk = Math.round(
    calculateAnnuityPayment(balance, input.newRatePercent, years)
  );
  return {
    balanceCzk: balance,
    currentMonthlyCzk,
    newMonthlyCzk,
    differenceMonthlyCzk: currentMonthlyCzk - newMonthlyCzk,
    switchCostCzk: input.switchCostCzk,
  };
}

/** Backward-compatible alias for analytics callers. */
export function miniMortgageLtvPct(result: MiniMortgageResult): number {
  return result.exactLtv ?? 0;
}

/** Build /sazby query from calculator state — preserves marketing attribution. */
export function buildSazbyHref(
  result: MiniMortgageResult,
  options?: {
    preserveMarketingFrom?: Record<string, string | undefined> | URLSearchParams;
  }
): string {
  const context: MortgageJourneyContext = {
    purpose: result.purpose,
    fixationMonths: result.fixationMonths,
    propertyValueCzk: result.propertyPriceCzk,
    ownFundsCzk: result.requiredOwnFundsCzk,
    loanAmountCzk: result.loanAmountCzk,
    termYears: result.termYears,
    modelRatePercent: result.annualRatePercent,
  };
  const withMarketing =
    typeof window !== "undefined" && !options?.preserveMarketingFrom
      ? mergeMarketingFromSearch(context, window.location.search)
      : context;
  return buildMortgageJourneyHref(withMarketing, options);
}
