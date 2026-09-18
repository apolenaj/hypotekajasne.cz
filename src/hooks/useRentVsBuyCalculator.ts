"use client";

import { useMemo } from "react";
import {
  simulateRentVsBuy,
  type RentVsBuyInputs,
  type RentVsBuyResult,
} from "@/lib/decision-lab/rent-vs-buy-cashflow";

/**
 * Tenký wrapper nad `simulateRentVsBuy`.
 * Výpočet žije v lib — hook jen memoizuje stejný výsledek pro UI.
 */
export function useRentVsBuyCalculator(inputs: RentVsBuyInputs): RentVsBuyResult {
  return useMemo(
    () => simulateRentVsBuy(inputs),
    [
      inputs.propertyPrice,
      inputs.downPayment,
      inputs.annualMortgageRatePct,
      inputs.termYears,
      inputs.monthlyOwnershipCosts,
      inputs.monthlyRent,
      inputs.horizonYears,
      inputs.alternativeAnnualReturn,
      inputs.annualPropertyGrowth,
      inputs.annualRentGrowth,
      inputs.transactionCosts,
      inputs.transactionCostRate,
    ]
  );
}
