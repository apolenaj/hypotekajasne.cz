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

/**
 * Modelové / demo nabídky pro teaser CTA — ne aktuální sazby bank.
 * Slouží jen k ilustraci konverzního textu tlačítka.
 */
export const MINI_MORTGAGE_TEASER_OFFERS = [
  { id: "teaser-a", label: "Banka A", ratePercent: 4.19 },
  { id: "teaser-b", label: "Banka B", ratePercent: 4.39 },
  { id: "teaser-c", label: "Banka C", ratePercent: 4.59 },
  { id: "teaser-d", label: "Banka D", ratePercent: 4.89 },
  { id: "teaser-e", label: "Banka E", ratePercent: 5.19 },
] as const;

export type MiniMortgageTeaserOffer =
  (typeof MINI_MORTGAGE_TEASER_OFFERS)[number];

/** Nabídka je „lepší nebo blízká“, pokud není o více než 0,30 p.b. nad modelem. */
export const MINI_TEASER_RATE_TOLERANCE_PP = 0.3;

export type MiniTeaserMatch = {
  offers: MiniMortgageTeaserOffer[];
  count: number;
  lowestRatePercent: number | null;
};

/** Filtruje demo nabídky podle aktuální modelové sazby uživatele. */
export function matchMiniTeaserOffers(
  interestRatePercent: number,
  tolerancePp: number = MINI_TEASER_RATE_TOLERANCE_PP
): MiniTeaserMatch {
  const rate = Number.isFinite(interestRatePercent)
    ? interestRatePercent
    : MODEL_FALLBACK_RATE_PERCENT;
  const offers = MINI_MORTGAGE_TEASER_OFFERS.filter(
    (o) => o.ratePercent <= rate + tolerancePp
  )
    .slice()
    .sort((a, b) => a.ratePercent - b.ratePercent);

  return {
    offers,
    count: offers.length,
    lowestRatePercent: offers[0]?.ratePercent ?? null,
  };
}

/** Text CTA podle počtu shodných demo nabídek. */
export function miniMortgageCtaLabel(match: MiniTeaserMatch): string {
  if (match.count <= 0 || match.lowestRatePercent == null) {
    return "Nezávazně ověřit možnosti";
  }
  const lowest = match.lowestRatePercent.toFixed(2).replace(".", ",");
  const noun =
    match.count === 1
      ? "nabídku"
      : match.count >= 2 && match.count <= 4
        ? "nabídky"
        : "nabídek";
  return `Zobrazit ${match.count} ${noun} od ${lowest} %`;
}

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
