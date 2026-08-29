/**
 * Orientační měsíční splátka z konkrétní bankovní sazby a parametrů uživatele.
 * Anuitní výpočet deleguje na finance-math/core — bez duplicitní matematiky.
 */

import { calculateAnnuityPayment } from "@/lib/finance-math/core";
import type { MortgageOffer } from "@/lib/mortgage-market/offers";
import { evaluatePublicRateDisplay } from "@/lib/mortgage-market/public-rate-display";
import { formatMoney } from "@/lib/money";

import { BANK_RATE_PAYMENT_NOTE } from "@/lib/legal/regulatory-texts";

export const BANK_RATE_PAYMENT_DISCLAIMER = BANK_RATE_PAYMENT_NOTE.cs;

/** Upper bounds — odmítáme extrémní vstupy místo nesmyslné splátky. */
export const BANK_RATE_PAYMENT_LIMITS = {
  maxLoanCzk: 500_000_000,
  maxTermYears: 50,
  maxAnnualRatePercent: 30,
} as const;

export type BankRatePaymentParams = {
  /** Jistina = požadovaná výše úvěru */
  loanAmountCzk: number;
  /** Celková doba splatnosti úvěru (fixace ≠ splatnost) */
  termYears: number;
};

export type BankRatePaymentDisplay = {
  rateHeadline: string;
  monthlyPaymentCzk: number;
  monthlyPaymentLine: string;
  disclaimer: string;
};

function isUsablePaymentParams(params: BankRatePaymentParams): boolean {
  const { loanAmountCzk, termYears } = params;
  if (!Number.isFinite(loanAmountCzk) || loanAmountCzk <= 0) return false;
  if (loanAmountCzk > BANK_RATE_PAYMENT_LIMITS.maxLoanCzk) return false;
  if (!Number.isFinite(termYears) || termYears <= 0) return false;
  if (termYears > BANK_RATE_PAYMENT_LIMITS.maxTermYears) return false;
  return true;
}

function isUsableAnnualRate(annualRatePercent: number): boolean {
  if (!Number.isFinite(annualRatePercent)) return false;
  if (annualRatePercent < 0) return false;
  if (annualRatePercent > BANK_RATE_PAYMENT_LIMITS.maxAnnualRatePercent) return false;
  return true;
}

/**
 * Anuitní měsíční splátka zaokrouhlená na celé Kč.
 * Vrací null při neplatných nebo extrémních vstupech.
 */
export function computeOrientacniBankMonthlyPayment(
  params: BankRatePaymentParams & { annualRatePercent: number }
): number | null {
  if (!isUsablePaymentParams(params)) return null;
  if (!isUsableAnnualRate(params.annualRatePercent)) return null;

  const raw = calculateAnnuityPayment(
    params.loanAmountCzk,
    params.annualRatePercent,
    params.termYears
  );
  if (!Number.isFinite(raw) || raw <= 0) return null;
  return Math.round(raw);
}

/** České formátování celých Kč pro UI. */
export function formatOrientacniBankMonthlyPaymentLine(
  monthlyPaymentCzk: number
): string {
  return `Orientační měsíční splátka ${formatMoney(monthlyPaymentCzk, "CZK")}`;
}

/**
 * Splátka pro konkrétní produkt — jen u zveřejněné, čerstvé sazby s číslem.
 */
export function resolveBankRatePaymentDisplay(
  offer: Pick<
    MortgageOffer,
    | "checkedAt"
    | "evidence"
    | "nominalInterestRate"
    | "rateType"
    | "pricingScenarioKey"
  >,
  params: BankRatePaymentParams | null | undefined,
  nowMs: number = Date.now()
): BankRatePaymentDisplay | null {
  if (!params || !isUsablePaymentParams(params)) return null;

  const display = evaluatePublicRateDisplay(offer, nowMs);
  if (!display.showNumeric) return null;

  const monthlyPaymentCzk = computeOrientacniBankMonthlyPayment({
    ...params,
    annualRatePercent: offer.nominalInterestRate,
  });
  if (monthlyPaymentCzk == null) return null;

  return {
    rateHeadline: `${display.headline} p. a.`,
    monthlyPaymentCzk,
    monthlyPaymentLine: formatOrientacniBankMonthlyPaymentLine(monthlyPaymentCzk),
    disclaimer: BANK_RATE_PAYMENT_DISCLAIMER,
  };
}
