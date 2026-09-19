/**
 * Fixation-period cost comparison for the public “celková cena” section.
 *
 * Costs = interest + insurance + stated fees during fixation.
 * Repaid principal is tracked separately: it builds equity, it is not a cost.
 *
 * Published bank examples keep their stated payment, rate, RPSN and insurance.
 * Missing fees stay zero — they are not invented. RPSN is never recalculated.
 */

import { CZ_MANIFEST_CHECKED_AT } from "@/lib/mortgage-market/import";
import { getCz20260809Catalog } from "@/lib/mortgage-market/catalog-from-manifest";
import type {
  CatalogRepresentativeExample,
  MortgageMarketCatalog,
} from "@/lib/mortgage-market/offers";
import {
  amortizeKnownMonthlyPayment,
  roundMoney,
} from "@/lib/finance-math/core";

export const FIXATION_COST_INCLUDES =
  "Úroky za dobu fixace, pojištění a poplatky uvedené v příkladu. Splacená jistina mezi náklady nepatří.";

/** Verified representative examples. Not a live price list. */
export const MONETA_EDUCATION_EXAMPLE_IDS = [
  "moneta-rpsn-with-ppi",
  "moneta-rpsn-without-ppi",
] as const;

export type FixationVariantInput = {
  id: string;
  bank: string;
  variant: string;
  ratePercent: number;
  aprPercent: number;
  principalCzk: number;
  termYears: number;
  fixationMonths: number;
  /** null when the source did not state LTV */
  ltvPercent: number | null;
  monthlyMortgagePaymentCzk: number;
  monthlyInsuranceCzk: number;
  monthlyAdditionalCostsCzk: number;
  oneOffCostsCzk: number;
};

export type FixationVariantSnapshot = {
  id: string;
  bank: string;
  variant: string;
  rate: number;
  apr: number;
  principal: number;
  termYears: number;
  fixationMonths: number;
  ltv: number | null;
  monthlyMortgagePayment: number;
  monthlyInsurance: number;
  monthlyAdditionalCosts: number;
  oneOffCosts: number;
  totalMonthlyOutflow: number;
  interestDuringFixation: number;
  insuranceDuringFixation: number;
  feesDuringFixation: number;
  totalCostDuringFixation: number;
  remainingPrincipalAfterFixation: number;
  principalPaidDuringFixation: number;
};

export type FixationComparison = {
  bank: string;
  checkedAt: string;
  parametersMatch: boolean;
  assumptions: {
    principalCzk: number;
    termYears: number;
    fixationMonths: number;
    ltvPercent: number | null;
  };
  variants: FixationVariantSnapshot[];
  cheaperId: string | null;
  lowerRateId: string;
  lowerRateIsCheaper: boolean;
  fixationCostDeltaCzk: number;
  monthlyOutflowDeltaCzk: number;
  rpsnDeltaPercentagePoints: number;
};

function money(amount: number): number {
  return roundMoney(amount);
}

function percentagePointGap(left: number, right: number): number {
  return Math.abs(Math.round(left * 100) - Math.round(right * 100)) / 100;
}

export function yearCountLabel(years: number): string {
  if (years === 1) return "1 rok";
  if (years >= 2 && years <= 4) return `${years} roky`;
  return `${years} let`;
}

export function fixationLengthLabel(months: number): string {
  if (months % 12 !== 0) {
    if (months === 1) return "1 měsíc";
    if (months >= 2 && months <= 4) return `${months} měsíce`;
    return `${months} měsíců`;
  }
  return yearCountLabel(months / 12);
}

/** “za první 3 roky” / “za prvních 5 let” */
export function firstFixationPeriodLabel(months: number): string {
  if (months % 12 !== 0) return `za prvních ${fixationLengthLabel(months)}`;
  const years = months / 12;
  if (years === 1) return "za první rok";
  if (years >= 2 && years <= 4) return `za první ${years} roky`;
  return `za prvních ${years} let`;
}

/** “po 3 letech” */
export function afterFixationLabel(months: number): string {
  if (months % 12 !== 0) return `po ${months} měsících`;
  const years = months / 12;
  if (years === 1) return "po 1 roce";
  return `po ${years} letech`;
}

export function buildFixationVariantSnapshot(
  input: FixationVariantInput
): FixationVariantSnapshot {
  const principal = money(input.principalCzk);
  const fixationMonths = Math.max(0, Math.trunc(input.fixationMonths));
  const monthlyMortgagePayment = money(input.monthlyMortgagePaymentCzk);
  const monthlyInsurance = money(input.monthlyInsuranceCzk);
  const monthlyAdditionalCosts = money(input.monthlyAdditionalCostsCzk);
  const oneOffCosts = money(input.oneOffCostsCzk);
  const schedule = amortizeKnownMonthlyPayment({
    principal,
    annualRatePercent: input.ratePercent,
    monthlyPayment: monthlyMortgagePayment,
    months: fixationMonths,
  });
  const insuranceDuringFixation = monthlyInsurance * fixationMonths;
  const feesDuringFixation =
    monthlyAdditionalCosts * fixationMonths + oneOffCosts;
  const interestDuringFixation = schedule.interestCzk;

  return {
    id: input.id,
    bank: input.bank,
    variant: input.variant,
    rate: input.ratePercent,
    apr: input.aprPercent,
    principal,
    termYears: input.termYears,
    fixationMonths,
    ltv: input.ltvPercent,
    monthlyMortgagePayment,
    monthlyInsurance,
    monthlyAdditionalCosts,
    oneOffCosts,
    totalMonthlyOutflow:
      monthlyMortgagePayment + monthlyInsurance + monthlyAdditionalCosts,
    interestDuringFixation,
    insuranceDuringFixation,
    feesDuringFixation,
    totalCostDuringFixation:
      interestDuringFixation + insuranceDuringFixation + feesDuringFixation,
    remainingPrincipalAfterFixation: schedule.remainingPrincipalCzk,
    principalPaidDuringFixation: schedule.principalPaidCzk,
  };
}

export function compareFixationVariants(
  variants: FixationVariantSnapshot[],
  checkedAt: string
): FixationComparison {
  if (variants.length < 2) {
    throw new Error("Porovnání potřebuje dvě varianty.");
  }
  const ordered = [...variants].sort(
    (left, right) => left.rate - right.rate || left.id.localeCompare(right.id)
  );
  const [first, second] = ordered;
  const parametersMatch = ordered.every(
    (variant) =>
      variant.principal === first.principal &&
      variant.termYears === first.termYears &&
      variant.fixationMonths === first.fixationMonths &&
      variant.ltv === first.ltv &&
      variant.bank === first.bank
  );
  const cheapest = ordered.reduce((best, variant) =>
    variant.totalCostDuringFixation < best.totalCostDuringFixation
      ? variant
      : best
  );
  const tied =
    ordered.filter(
      (variant) =>
        variant.totalCostDuringFixation === cheapest.totalCostDuringFixation
    ).length > 1;
  const cheaperId = tied ? null : cheapest.id;
  const lowerRateId = first.id;

  return {
    bank: first.bank,
    checkedAt,
    parametersMatch,
    assumptions: {
      principalCzk: first.principal,
      termYears: first.termYears,
      fixationMonths: first.fixationMonths,
      ltvPercent: first.ltv,
    },
    variants: ordered,
    cheaperId,
    lowerRateId,
    lowerRateIsCheaper: cheaperId != null && cheaperId === lowerRateId,
    fixationCostDeltaCzk: Math.abs(
      first.totalCostDuringFixation - second.totalCostDuringFixation
    ),
    monthlyOutflowDeltaCzk: Math.abs(
      first.totalMonthlyOutflow - second.totalMonthlyOutflow
    ),
    rpsnDeltaPercentagePoints: percentagePointGap(first.apr, second.apr),
  };
}

export function fixationVerdictHeadline(
  comparison: FixationComparison
): string {
  if (comparison.cheaperId == null) {
    return "V tomto příkladu jsou náklady obou variant stejné";
  }
  if (comparison.lowerRateIsCheaper) {
    return "V tomto příkladu je nižší úrok i levnější";
  }
  return "Nižší úrok ≠ levnější hypotéka";
}

function publicBankLabel(name: string): string {
  const trimmed = name.trim();
  if (trimmed.toLocaleLowerCase("cs").startsWith("moneta")) return "MONETA";
  return trimmed;
}

function variantLabel(example: CatalogRepresentativeExample): string {
  if (example.insuranceIncluded === true) return "S pojištěním";
  if (example.insuranceIncluded === false) return "Bez pojištění";
  return "Varianta";
}

function lenderName(
  catalog: MortgageMarketCatalog,
  example: CatalogRepresentativeExample
): string | null {
  const product = catalog.products.find(
    (item) => item.id === example.productId
  );
  if (!product) return null;
  return catalog.lenders.find((item) => item.id === product.lenderId)?.name ?? null;
}

/**
 * MONETA pair from the verified catalog. Insurance is the amount stated in
 * the representative example, not a recomputed price list. Fees the example
 * does not itemise stay at zero. LTV stays null.
 */
export function buildMonetaRepresentativeComparison(
  catalog: MortgageMarketCatalog = getCz20260809Catalog(),
  checkedAt: string = CZ_MANIFEST_CHECKED_AT
): FixationComparison | null {
  const examples = MONETA_EDUCATION_EXAMPLE_IDS.map((id) =>
    catalog.examples?.find((example) => example.id === id && example.isActive)
  );
  if (examples.some((example) => example == null)) return null;

  const snapshots = examples.flatMap((example) => {
    if (
      !example ||
      example.nominalRate == null ||
      example.rpsn == null ||
      example.monthlyPayment == null ||
      example.fixationMonths == null
    ) {
      return [];
    }
    const bankName = lenderName(catalog, example);
    if (!bankName) return [];
    return [
      buildFixationVariantSnapshot({
        id: example.id,
        bank: publicBankLabel(bankName),
        variant: variantLabel(example),
        ratePercent: example.nominalRate,
        aprPercent: example.rpsn,
        principalCzk: example.loanAmount,
        termYears: example.termYears,
        fixationMonths: example.fixationMonths,
        ltvPercent: null,
        monthlyMortgagePaymentCzk: example.monthlyPayment,
        monthlyInsuranceCzk: example.insuranceCost ?? 0,
        monthlyAdditionalCostsCzk: 0,
        oneOffCostsCzk: 0,
      }),
    ];
  });

  if (snapshots.length !== 2) return null;
  return compareFixationVariants(snapshots, checkedAt);
}
