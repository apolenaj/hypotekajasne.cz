/**
 * Group verified offers for public comparison UX.
 * Same lender/product/fixation keeps multiple pricing scenarios together.
 */

import type { MortgageOffer } from "@/lib/mortgage-market/offers";

export type LenderOfferGroup = {
  key: string;
  lenderSlug: string;
  lenderName: string;
  productSlug: string;
  productName: string;
  fixationMonths: number;
  financingPurpose: string | null;
  scenarios: MortgageOffer[];
};

function groupKey(o: MortgageOffer): string {
  return [
    o.lenderSlug,
    o.productSlug,
    o.fixationMonths,
    o.financingPurpose ?? "",
  ].join("|");
}

export function groupOffersByLenderProduct(
  offers: MortgageOffer[]
): LenderOfferGroup[] {
  const map = new Map<string, LenderOfferGroup>();
  for (const o of offers) {
    const key = groupKey(o);
    const existing = map.get(key);
    if (existing) {
      existing.scenarios.push(o);
      continue;
    }
    map.set(key, {
      key,
      lenderSlug: o.lenderSlug,
      lenderName: o.lenderName,
      productSlug: o.productSlug,
      productName: o.productName,
      fixationMonths: o.fixationMonths,
      financingPurpose: o.financingPurpose ?? null,
      scenarios: [o],
    });
  }

  return [...map.values()]
    .map((g) => ({
      ...g,
      scenarios: [...g.scenarios].sort(
        (a, b) => a.nominalInterestRate - b.nominalInterestRate
      ),
    }))
    .sort((a, b) => {
      const byLender = a.lenderName.localeCompare(b.lenderName, "cs");
      if (byLender !== 0) return byLender;
      return (
        a.scenarios[0]!.nominalInterestRate -
        b.scenarios[0]!.nominalInterestRate
      );
    });
}

/** Prefer PPI / without-PPI pair labels when both present. */
export function isInsuranceScenarioPair(group: LenderOfferGroup): boolean {
  if (group.scenarios.length < 2) return false;
  const keys = new Set(group.scenarios.map((s) => s.pricingScenarioKey));
  return (
    keys.has("with_repayment_insurance") &&
    keys.has("without_repayment_insurance")
  );
}
