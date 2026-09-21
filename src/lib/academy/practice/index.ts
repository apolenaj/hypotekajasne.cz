import { GUIDE_PRVNI_HYPOTEKA } from "@/lib/academy/practice/guides/a-prvni-hypoteka";
import { GUIDE_NA_CO_DOSAHNU } from "@/lib/academy/practice/guides/b-na-co-dosahnu";
import { GUIDE_VLASTNI_PENIZE } from "@/lib/academy/practice/guides/c-vlastni-penize";
import { GUIDE_PRIJMY } from "@/lib/academy/practice/guides/d-prijmy";
import { GUIDE_REGISTRY } from "@/lib/academy/practice/guides/e-registry";
import { urokRpsnNakladyGuide } from "@/lib/academy/practice/guides/f-urok-rpsn";
import { mimoradneSplatkyRefinancovaniGuide } from "@/lib/academy/practice/guides/g-refinancovani";
import { pojisteniVypadekPrijmuGuide } from "@/lib/academy/practice/guides/h-pojisteni";
import { hypotekaRozchodRozvodGuide } from "@/lib/academy/practice/guides/i-rozchod";
import { daneBydleniInvesticeGuide } from "@/lib/academy/practice/guides/j-dane";
import type { PracticeGuide } from "@/lib/academy/practice/types";
import { practiceGuidePath, practiceHubPath } from "@/lib/academy/practice/types";

export const PRACTICE_GUIDES: PracticeGuide[] = [
  GUIDE_PRVNI_HYPOTEKA,
  GUIDE_NA_CO_DOSAHNU,
  GUIDE_VLASTNI_PENIZE,
  GUIDE_PRIJMY,
  GUIDE_REGISTRY,
  urokRpsnNakladyGuide,
  mimoradneSplatkyRefinancovaniGuide,
  pojisteniVypadekPrijmuGuide,
  hypotekaRozchodRozvodGuide,
  daneBydleniInvesticeGuide,
];

export function getPracticeGuide(slug: string): PracticeGuide | undefined {
  return PRACTICE_GUIDES.find((g) => g.slug === slug);
}

export function getAllPracticeSlugs(): string[] {
  return PRACTICE_GUIDES.map((g) => g.slug);
}

export {
  practiceGuidePath,
  practiceHubPath,
  PRACTICE_GUIDES as default,
};

export * from "@/lib/academy/practice/types";
export * from "@/lib/academy/practice/search";
export * from "@/lib/academy/practice/math";
