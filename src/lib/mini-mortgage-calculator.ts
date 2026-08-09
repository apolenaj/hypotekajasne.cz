/**
 * Hero mini kalkulačka — tenká vrstva nad sdílenou anuitní matematikou.
 * Modelová sazba je jen pro orientační splátku — ne bankovní nabídka.
 */

import {
  calculateAnnuityPayment,
  ltvPercent,
} from "@/lib/finance-math/core";
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
  loanAmountCzk: number;
  ltvPct: number;
  monthlyPaymentCzk: number;
  annualRatePercent: number;
  termYears: number;
  requiredOwnFundsCzk: number;
  purpose: MiniMortgagePurpose;
  fixationMonths: number;
};

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

/** Text CTA — neutrální. */
export function miniMortgageCtaLabel(): string {
  return "Spočítat hypotéku";
}

/** Anuitní splátka + LTV z ceny a vlastních prostředků. */
export function computeMiniMortgage(input: MiniMortgageInput): MiniMortgageResult {
  const annualRatePercent =
    input.annualRatePercent ?? MODEL_FALLBACK_RATE_PERCENT;
  const termYears = input.termYears > 0 ? input.termYears : 0;
  const purpose = input.purpose ?? "purchase";
  const fixationMonths = input.fixationMonths ?? 36;

  const price = Number.isFinite(input.propertyPriceCzk)
    ? Math.max(0, input.propertyPriceCzk)
    : 0;
  const ownFunds = Number.isFinite(input.ownFundsCzk)
    ? Math.max(0, input.ownFundsCzk)
    : 0;

  const loanAmountCzk = Math.max(0, price - ownFunds);
  const ltvPct =
    price > 0 ? Math.round(ltvPercent(loanAmountCzk, price) * 10) / 10 : 0;
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
    requiredOwnFundsCzk: Math.min(ownFunds, price),
    purpose,
    fixationMonths,
  };
}

/** Build /sazby query from calculator state. */
export function buildSazbyHref(result: MiniMortgageResult): string {
  const params = new URLSearchParams({
    purpose: result.purpose,
    fixationMonths: String(result.fixationMonths),
    ltv: String(Math.round(result.ltvPct)),
    property: String(Math.round(result.loanAmountCzk + result.requiredOwnFundsCzk)),
    loan: String(Math.round(result.loanAmountCzk)),
  });
  return `/sazby?${params.toString()}`;
}
