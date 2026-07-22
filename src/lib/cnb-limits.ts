/**
 * Doporučení ČNB — tenký adapter nad MortgageRegulationEngine.
 * Numerické konstanty žijí v mortgage-regulation/cz-rules.ts.
 */

import {
  evaluateCzMortgageRegulation,
  resolveCzPeriod,
} from "@/lib/mortgage-regulation";

export type MortgagePurpose = "owner_occupied" | "investment";

const current = resolveCzPeriod(new Date().toISOString().slice(0, 10));

/** @deprecated Prefer evaluateMortgageRegulation — konstanty pro kompatibilitu. */
export const CNB_LIMITS = {
  ownerOccupied: {
    ltvStandard: current.ownerOccupied.ltvStandard,
    ltvYoungUnder36: current.ownerOccupied.ltvYoungUnder36,
    note:
      "Pro vlastní bydlení ČNB ponechává horní hranici LTV 80 % (u žadatelů do 36 let až 90 % — jen pokud je věk znám). Ukazatele DTI a DSTI zůstávají deaktivované — banky je mohou používat interně, ale nejde o plošně povinné limity ČNB.",
  },
  investment: {
    ltvMax: current.investment.ltvMax,
    dtiMax: current.investment.dtiMax ?? 7,
    note:
      "Pro investiční hypotéky ČNB doporučuje LTV maximálně 70 % a limit DTI 7 (od 1. 4. 2026). Týká se typicky třetí a další obytné nemovitosti nebo nemovitosti určené k pronájmu.",
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
    description: `Doporučení ČNB od 4/2026: LTV max. ${CNB_LIMITS.investment.ltvMax} %, DTI ${CNB_LIMITS.investment.dtiMax}.`,
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
