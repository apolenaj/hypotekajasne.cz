/**
 * History-preserving supersede plan for rate variants.
 */

import type { MortgageRateVariant } from "@/lib/mortgage-market/types";

export type SupersedeRateVariantPlan = {
  deactivate: { id: string; isActive: false; validTo: string };
  insert: Omit<MortgageRateVariant, "id">;
};

export function planRateVariantSupersede(input: {
  previous: MortgageRateVariant;
  nominalInterestRate: number;
  checkedAt: string;
  validFrom?: string;
}): SupersedeRateVariantPlan {
  if (!input.previous.isActive) {
    throw new Error("Can only supersede an active rate variant.");
  }
  const at = input.validFrom ?? input.checkedAt;
  return {
    deactivate: {
      id: input.previous.id,
      isActive: false,
      validTo: at,
    },
    insert: {
      productId: input.previous.productId,
      pricingScenarioKey: input.previous.pricingScenarioKey,
      pricingScenarioLabel: input.previous.pricingScenarioLabel,
      financingPurpose: input.previous.financingPurpose,
      fixationMonths: input.previous.fixationMonths,
      ltvMin: input.previous.ltvMin,
      ltvMax: input.previous.ltvMax,
      ltvMinExclusive: input.previous.ltvMinExclusive,
      ltvMaxExclusive: input.previous.ltvMaxExclusive,
      nominalInterestRate: input.nominalInterestRate,
      rateType: input.previous.rateType,
      minLoanAmount: input.previous.minLoanAmount,
      maxLoanAmount: input.previous.maxLoanAmount,
      validFrom: at,
      validTo: null,
      checkedAt: input.checkedAt,
      isActive: true,
      sourceEvidenceId: input.previous.sourceEvidenceId,
    },
  };
}
