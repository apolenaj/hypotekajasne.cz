/**
 * Hero mini kalkulačka — tenká vrstva nad sdílenou anuitní matematikou.
 */

import {
  calculateAnnuityPayment,
  ltvPercent,
} from "@/lib/finance-math/core";
import { MODEL_FALLBACK_RATE_PERCENT } from "@/lib/rates/model-fallback";

export type MiniMortgageInput = {
  propertyPriceCzk: number;
  ownFundsCzk: number;
  termYears: number;
  /** Modelová sazba p.a. — nikdy LIVE. */
  annualRatePercent?: number;
};

export type MiniMortgageResult = {
  loanAmountCzk: number;
  ltvPct: number;
  monthlyPaymentCzk: number;
  annualRatePercent: number;
  termYears: number;
};

export const MINI_MORTGAGE_DEFAULTS = {
  propertyPriceCzk: 6_000_000,
  ownFundsCzk: 1_200_000,
  termYears: 30,
  annualRatePercent: MODEL_FALLBACK_RATE_PERCENT,
} as const;

export const MINI_MORTGAGE_TERM_OPTIONS = [10, 15, 20, 25, 30] as const;

/** Anuitní splátka + LTV z ceny a vlastních prostředků. */
export function computeMiniMortgage(input: MiniMortgageInput): MiniMortgageResult {
  const annualRatePercent =
    input.annualRatePercent ?? MODEL_FALLBACK_RATE_PERCENT;
  const termYears = input.termYears > 0 ? input.termYears : 0;

  const price = Number.isFinite(input.propertyPriceCzk)
    ? Math.max(0, input.propertyPriceCzk)
    : 0;
  const ownFunds = Number.isFinite(input.ownFundsCzk)
    ? Math.max(0, input.ownFundsCzk)
    : 0;

  const loanAmountCzk = Math.max(0, price - ownFunds);
  const ltvPct =
    price > 0 ? Math.round(ltvPercent(loanAmountCzk, price)) : 0;
  const monthlyPaymentCzk =
    loanAmountCzk > 0 && termYears > 0
      ? Math.round(
          calculateAnnuityPayment(loanAmountCzk, annualRatePercent, termYears)
        )
      : 0;

  return {
    loanAmountCzk,
    ltvPct,
    monthlyPaymentCzk,
    annualRatePercent,
    termYears,
  };
}
