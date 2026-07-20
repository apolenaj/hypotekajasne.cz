/**
 * Výpočet financování podle FinancingOption — bez záměny produktů.
 */

import { calculateAnnuityPayment } from "@/lib/calculators";
import { calculateDeveloperPlanSchedule } from "@/lib/financing/developer-plan";
import { getFinancingProduct } from "@/lib/financing/products";
import {
  FINANCING_OPTION_LABELS,
  LOCAL_FINANCING_UNVERIFIED_MESSAGE,
  type FinancingCalculationInput,
  type FinancingCalculationResult,
  type FinancingOptionId,
} from "@/lib/financing/types";

const DISCLAIMER =
  "Orientační model HypotékaJasně.cz. Nejde o nabídku ani příslib schválení. Produkty a sazby bez ověřeného zdroje nezobrazujeme jako dostupné.";

function emptyResult(
  input: FinancingCalculationInput,
  option: FinancingOptionId,
  message: string
): FinancingCalculationResult {
  return {
    option,
    label: FINANCING_OPTION_LABELS[option],
    currency: "EUR",
    available: false,
    calculable: false,
    message,
    propertyPrice: input.propertyPrice,
    ownFunds: input.ownFunds,
    financedAmount: 0,
    ltv: null,
    maxLtvPercent: null,
    ltvExceedsMax: false,
    ratePercentPa: null,
    monthlyPayment: null,
    totalPaid: null,
    totalInterest: null,
    developerPhases: null,
    peakMonthlyPayment: null,
    disclaimer: DISCLAIMER,
  };
}

export function calculateFinancing(
  input: FinancingCalculationInput
): FinancingCalculationResult {
  const product = getFinancingProduct(input.country, input.option);

  if (!product || input.option === "UNAVAILABLE") {
    return emptyResult(
      input,
      "UNAVAILABLE",
      LOCAL_FINANCING_UNVERIFIED_MESSAGE
    );
  }

  const price = Math.max(0, input.propertyPrice);
  const ownFunds = Math.max(0, input.ownFunds);
  const requestedGap = Math.max(0, price - ownFunds);
  const ltv =
    price > 0 ? Math.round((requestedGap / price) * 100) : 0;
  const maxLtv = product.maxLtvPercent;
  const ltvExceedsMax =
    maxLtv != null && maxLtv > 0 ? ltv > maxLtv : false;

  const base = {
    option: product.option,
    label: product.label,
    currency: product.currency,
    available: true,
    propertyPrice: price,
    ownFunds,
    ltv,
    maxLtvPercent: maxLtv,
    ltvExceedsMax,
    disclaimer: DISCLAIMER,
  };

  // ── CASH ──────────────────────────────────────────────────────────
  if (product.option === "CASH") {
    return {
      ...base,
      calculable: true,
      message:
        ownFunds < price
          ? "Pro hotovostní nákup chybí vlastní zdroje do výše ceny."
          : null,
      financedAmount: 0,
      ratePercentPa: null,
      monthlyPayment: 0,
      totalPaid: price,
      totalInterest: 0,
      developerPhases: null,
      peakMonthlyPayment: 0,
    };
  }

  // ── DEVELOPER_PAYMENT_PLAN ────────────────────────────────────────
  if (product.option === "DEVELOPER_PAYMENT_PLAN") {
    const schedule = product.developerSchedule;
    if (!schedule) {
      return {
        ...base,
        calculable: false,
        message: LOCAL_FINANCING_UNVERIFIED_MESSAGE,
        financedAmount: 0,
        ratePercentPa: null,
        monthlyPayment: null,
        totalPaid: null,
        totalInterest: null,
        developerPhases: null,
        peakMonthlyPayment: null,
      };
    }

    const plan = calculateDeveloperPlanSchedule(price, schedule);
    return {
      ...base,
      calculable: true,
      message:
        "Developer payment plan není bankovní hypotéka — jde o rozvrh plateb developerovi.",
      financedAmount: price,
      ratePercentPa: null,
      monthlyPayment: plan.peakMonthlyPayment,
      totalPaid: plan.totalPaid,
      totalInterest: 0,
      developerPhases: plan.phases,
      peakMonthlyPayment: plan.peakMonthlyPayment,
    };
  }

  // ── LOCAL_MORTGAGE ────────────────────────────────────────────────
  if (product.option === "LOCAL_MORTGAGE") {
    const maxLoan =
      maxLtv != null && maxLtv > 0
        ? Math.round((price * maxLtv) / 100)
        : null;
    const financedAmount =
      maxLoan != null
        ? Math.min(requestedGap, maxLoan)
        : requestedGap;

    // Bez ověřené sazby — žádná anuita
    if (
      !product.calculable ||
      product.ratePercentPa == null ||
      product.rateAvailability === "UNAVAILABLE"
    ) {
      return {
        ...base,
        calculable: false,
        message: LOCAL_FINANCING_UNVERIFIED_MESSAGE,
        financedAmount,
        ratePercentPa: null,
        monthlyPayment: null,
        totalPaid: null,
        totalInterest: null,
        developerPhases: null,
        peakMonthlyPayment: null,
      };
    }

    const rate = product.ratePercentPa;
    const payment = Math.round(
      calculateAnnuityPayment(financedAmount, rate, input.termYears)
    );
    const totalPaid = Math.round(payment * input.termYears * 12);
    return {
      ...base,
      calculable: true,
      message: null,
      financedAmount,
      ratePercentPa: rate,
      monthlyPayment: payment,
      totalPaid,
      totalInterest: Math.max(0, totalPaid - financedAmount),
      developerPhases: null,
      peakMonthlyPayment: payment,
    };
  }

  // ── CZECH_EQUITY_LOAN ─────────────────────────────────────────────
  if (product.option === "CZECH_EQUITY_LOAN") {
    const financedAmount = requestedGap;
    const rate = input.czechEquityRatePercentPa;

    if (rate == null || !Number.isFinite(rate)) {
      return {
        ...base,
        currency: "CZK",
        calculable: false,
        message:
          "Sazba americké hypotéky není v živých datech — Na vyžádání.",
        financedAmount,
        ratePercentPa: null,
        monthlyPayment: null,
        totalPaid: null,
        totalInterest: null,
        developerPhases: null,
        peakMonthlyPayment: null,
      };
    }

    const payment = Math.round(
      calculateAnnuityPayment(financedAmount, rate, input.termYears)
    );
    const totalPaid = Math.round(payment * input.termYears * 12);
    return {
      ...base,
      currency: "CZK",
      calculable: true,
      message:
        "České zajištěné financování ≠ lokální hypotéka v cílové zemi.",
      financedAmount,
      ratePercentPa: rate,
      monthlyPayment: payment,
      totalPaid,
      totalInterest: Math.max(0, totalPaid - financedAmount),
      developerPhases: null,
      peakMonthlyPayment: payment,
    };
  }

  // ── PRIVATE_FINANCE / fallback ────────────────────────────────────
  return {
    ...base,
    calculable: false,
    message: LOCAL_FINANCING_UNVERIFIED_MESSAGE,
    financedAmount: 0,
    ratePercentPa: null,
    monthlyPayment: null,
    totalPaid: null,
    totalInterest: null,
    developerPhases: null,
    peakMonthlyPayment: null,
  };
}
