/**
 * Doporučení ČNB platná od 1. 4. 2026 (makroobezřetnostní doporučení).
 * DTI a DSTI zůstávají u úvěrů na vlastní bydlení deaktivované (nejsou plošně povinné).
 */

export type MortgagePurpose = "owner_occupied" | "investment";

export const CNB_LIMITS = {
  ownerOccupied: {
    ltvStandard: 80,
    ltvYoungUnder36: 90,
    note:
      "Pro vlastní bydlení ČNB ponechává horní hranici LTV 80 % (u žadatelů do 36 let až 90 %). Ukazatele DTI a DSTI zůstávají deaktivované — banky je mohou používat interně, ale nejde o plošně povinné limity ČNB.",
  },
  investment: {
    ltvMax: 70,
    dtiMax: 7,
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
    description: `LTV obvykle do ${CNB_LIMITS.ownerOccupied.ltvStandard} % (do 36 let až ${CNB_LIMITS.ownerOccupied.ltvYoungUnder36} %).`,
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

export function getRecommendedMaxLtv(purpose: MortgagePurpose): number {
  return purpose === "investment"
    ? CNB_LIMITS.investment.ltvMax
    : CNB_LIMITS.ownerOccupied.ltvStandard;
}
