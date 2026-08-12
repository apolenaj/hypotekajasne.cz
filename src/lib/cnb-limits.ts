/**
 * Doporučení ČNB — tenký adapter nad MortgageRegulationEngine.
 * Numerické konstanty žijí v mortgage-regulation/cz-rules.ts.
 */

import {
  evaluateCzMortgageRegulation,
  resolveCzPeriod,
} from "@/lib/mortgage-regulation";
import {
  CNB_INVESTMENT_RECOMMENDATION_CS,
  CNB_OWN_HOUSING_LTV_CS,
} from "@/lib/mortgage-regulation/cnb-public-copy";

export type MortgagePurpose = "owner_occupied" | "investment";

const current = resolveCzPeriod(new Date().toISOString().slice(0, 10));

/** @deprecated Prefer evaluateMortgageRegulation — konstanty pro kompatibilitu. */
export const CNB_LIMITS = {
  ownerOccupied: {
    ltvStandard: current.ownerOccupied.ltvStandard,
    ltvYoungUnder36: current.ownerOccupied.ltvYoungUnder36,
    note: `${CNB_OWN_HOUSING_LTV_CS} Ukazatele DTI a DSTI zůstávají deaktivované — banky je mohou používat interně, ale nejde o plošně povinné limity ČNB.`,
  },
  investment: {
    ltvMax: current.investment.ltvMax,
    dtiMax: current.investment.dtiMax ?? 7,
    note: CNB_INVESTMENT_RECOMMENDATION_CS,
  },
} as const;

export const MORTGAGE_PURPOSE_OPTIONS: {
  value: MortgagePurpose;
  label: string;
  description: string;
}[] = [
  {
    value: "owner_occupied",
    label: "Vlastní bydlení",
    description: `LTV obvykle do ${CNB_LIMITS.ownerOccupied.ltvStandard} % (do 36 let až ${CNB_LIMITS.ownerOccupied.ltvYoungUnder36} % — jen při zadaném věku).`,
  },
  {
    value: "investment",
    label: "Investiční nemovitost k pronájmu",
    description: CNB_INVESTMENT_RECOMMENDATION_CS,
  },
];

export function getCnbPurposeNotice(purpose: MortgagePurpose): string {
  return purpose === "investment"
    ? CNB_LIMITS.investment.note
    : CNB_LIMITS.ownerOccupied.note;
}

/**
 * Základní LTV bez věku — NIKDY nevrací young 90 %.
 * Pro věk / bucket použijte evaluateMortgageRegulation.
 */
export function getRecommendedMaxLtv(purpose: MortgagePurpose): number {
  const r = evaluateCzMortgageRegulation({
    purpose,
    age: null,
    numberOfOwnedResidentialProperties: null,
    investmentPurpose: purpose === "investment",
    applicantType: "unknown",
  });
  return r.maxLtv;
}
