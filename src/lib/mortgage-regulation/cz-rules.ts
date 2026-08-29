/**
 * Česká datová vrstva limitu — oddělená od UI (PROMPT 4).
 * Čísla jen z ověřených období; nevymýšlet bankovní schvalování.
 */

export type CzOwnerOccupiedRules = {
  ltvStandard: number;
  ltvYoungUnder36: number;
  youngAgeExclusiveMax: number;
  dtiStatus: "deactivated";
  dstiStatus: "deactivated";
};

export type CzInvestmentRules = {
  ltvMax: number;
  dtiStatus: "deactivated" | "recommended_limit";
  dtiMax: number | null;
  dstiStatus: "deactivated";
};

export type CzRegulationPeriod = {
  id: string;
  /** Inclusive ISO date */
  validFrom: string;
  /** Inclusive ISO date; null = open-ended */
  validTo: string | null;
  source: string;
  sourceUrl: string;
  verifiedAt: string;
  ownerOccupied: CzOwnerOccupiedRules;
  investment: CzInvestmentRules;
  notes: string;
};

const CNB_MACRO_URL =
  "https://www.cnb.cz/cs/financni-stabilita/makroobezretnostni-politika/";

/**
 * Období před 1. 4. 2026: v našem SoT nemáme oddělený přísnější LTV/DTI
 * pro investiční hypotéky jako po 4/2026 — model používá standardní LTV rámec.
 */
export const CZ_REGULATION_PERIODS: CzRegulationPeriod[] = [
  {
    id: "cz-pre-2026-04",
    validFrom: "2018-10-01",
    validTo: "2026-03-31",
    source: "ČNB — historický LTV rámec (před 1. 4. 2026)",
    sourceUrl: CNB_MACRO_URL,
    verifiedAt: "2026-07-21",
    ownerOccupied: {
      ltvStandard: 80,
      ltvYoungUnder36: 90,
      youngAgeExclusiveMax: 36,
      dtiStatus: "deactivated",
      dstiStatus: "deactivated",
    },
    investment: {
      ltvMax: 80,
      dtiStatus: "deactivated",
      dtiMax: null,
      dstiStatus: "deactivated",
    },
    notes:
      "Před 1. 4. 2026 model neaplikuje post-2026 investiční LTV 70 % / DTI 7.",
  },
  {
    id: "cz-from-2026-04",
    validFrom: "2026-04-01",
    validTo: null,
    source: "Doporučení ČNB pro investiční hypotéky (od 1. 4. 2026)",
    sourceUrl: CNB_MACRO_URL,
    verifiedAt: "2026-07-21",
    ownerOccupied: {
      ltvStandard: 80,
      ltvYoungUnder36: 90,
      youngAgeExclusiveMax: 36,
      dtiStatus: "deactivated",
      dstiStatus: "deactivated",
    },
    investment: {
      ltvMax: 70,
      dtiStatus: "recommended_limit",
      dtiMax: 7,
      dstiStatus: "deactivated",
    },
    notes:
      "Investiční / další obytné: ČNB doporučuje obezřetnější horní hranici LTV 70 % a DTI 7 (od 1. 4. 2026). Vlastní bydlení: LTV 80 % (do 36 let 90 % jen při známém věku).",
  },
];

export function resolveCzPeriod(
  effectiveDate: string
): CzRegulationPeriod {
  const d = effectiveDate.slice(0, 10);
  for (let i = CZ_REGULATION_PERIODS.length - 1; i >= 0; i--) {
    const p = CZ_REGULATION_PERIODS[i]!;
    if (d < p.validFrom) continue;
    if (p.validTo != null && d > p.validTo) continue;
    return p;
  }
  // Před nejstarším obdobím — použij nejstarší známé
  return CZ_REGULATION_PERIODS[0]!;
}
