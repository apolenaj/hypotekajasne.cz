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

export const MINI_MORTGAGE_TERM_OPTIONS = [10, 15, 20, 25, 30] as const;
export const MINI_MORTGAGE_FIXATION_OPTIONS = [24, 36, 60, 84, 120] as const;

export const MINI_MORTGAGE_CTA = {
  calculate: "Spočítat splátku",
  viewRates: "Zobrazit sazby pro tento výpočet",
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

  return {
    propertyPriceCzk,
    loanAmountCzk,
    exactLtv: ltv.exactLtv,
    ltvBand: ltv.ltvBand,
    ltvValidationError: ltv.validationError,
    monthlyPaymentCzk,
    annualRatePercent,
    termYears,
    requiredOwnFundsCzk: Math.min(ownFunds, propertyPriceCzk),
    purpose,
    fixationMonths,
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
