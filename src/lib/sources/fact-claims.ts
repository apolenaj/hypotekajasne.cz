/**
 * Faktický katalog claimů — PROMPT 3 + PROMPT 12.
 * Soft of truth pro veřejná tvrzení (daně, katastr, LTV…).
 * Komponenty nesmí hardcodovat silnější claim mimo tento registr.
 */

import { CNB_LIMITS } from "@/lib/cnb-limits";
import { JURISDICTION_FACT_CLAIMS } from "@/lib/sources/fact-claims-jurisdictions";
import type { FactClaim } from "@/lib/sources/types";

const VERIFIED_AT = "2026-07-21";
const CNB_FROM = "2026-04-01";

const CNB_MACRO_URL =
  "https://www.cnb.cz/cs/financni-stabilita/makroobezretnostni-politika/";
const FS_ACQUISITION_TAX_ABOLITION_URL =
  "https://financnisprava.gov.cz/cs/dane/dane/dan-z-nabyti-nemovitych-veci/informace-stanoviska-a-sdeleni/zruseni-dane-z-nabyti-nemovitych-veci";
const CUZK_FEE_URL =
  "https://www.cuzk.gov.cz/Katastr-nemovitosti/Poplatky/Sazby-spravnich-poplatku.aspx";
const CUZK_HOME = "https://www.cuzk.cz/";

const CZ_FACT_CLAIMS: FactClaim[] = [
  // —— ČNB / LTV DTI DSTI ——
  {
    id: "cz.cnb.ltv.owner_standard",
    claim:
      "Pro vlastní bydlení ČNB doporučuje horní hranici LTV 80 % (standard).",
    value: CNB_LIMITS.ownerOccupied.ltvStandard,
    jurisdiction: "cz",
    sourceName: "Česká národní banka — makroobezřetnostní politika",
    sourceUrl: CNB_MACRO_URL,
    sourceType: "central_bank",
    verifiedAt: VERIFIED_AT,
    validFrom: CNB_FROM,
    status: "VERIFIED",
    notes: "Doporučení ČNB, ne automatické schválení bankou.",
    topic: "ltv_dti_dsti",
  },
  {
    id: "cz.cnb.ltv.owner_young",
    claim:
      "Pro žadatele do 36 let ČNB u vlastního bydlení doporučuje LTV až 90 %.",
    value: CNB_LIMITS.ownerOccupied.ltvYoungUnder36,
    jurisdiction: "cz",
    sourceName: "Česká národní banka — makroobezřetnostní politika",
    sourceUrl: CNB_MACRO_URL,
    sourceType: "central_bank",
    verifiedAt: VERIFIED_AT,
    validFrom: CNB_FROM,
    status: "VERIFIED",
    notes: null,
    topic: "ltv_dti_dsti",
  },
  {
    id: "cz.cnb.dti_dsti.owner_deactivated",
    claim:
      "U úvěrů na vlastní bydlení zůstávají ukazatele DTI a DSTI deaktivované — nejsou plošně povinné limity ČNB (banky je mohou používat interně).",
    value: "deaktivováno",
    jurisdiction: "cz",
    sourceName: "Česká národní banka — makroobezřetnostní politika",
    sourceUrl: CNB_MACRO_URL,
    sourceType: "central_bank",
    verifiedAt: VERIFIED_AT,
    validFrom: CNB_FROM,
    status: "VERIFIED",
    notes: CNB_LIMITS.ownerOccupied.note,
    topic: "ltv_dti_dsti",
  },
  {
    id: "cz.cnb.ltv.investment",
    claim:
      "Pro investiční hypotéky ČNB doporučuje LTV maximálně 70 % (od 1. 4. 2026).",
    value: CNB_LIMITS.investment.ltvMax,
    jurisdiction: "cz",
    sourceName: "Česká národní banka — makroobezřetnostní politika",
    sourceUrl: CNB_MACRO_URL,
    sourceType: "central_bank",
    verifiedAt: VERIFIED_AT,
    validFrom: CNB_FROM,
    status: "VERIFIED",
    notes: CNB_LIMITS.investment.note,
    topic: "ltv_dti_dsti",
  },
  {
    id: "cz.cnb.dti.investment",
    claim:
      "Pro investiční hypotéky ČNB doporučuje limit DTI 7 (od 1. 4. 2026).",
    value: CNB_LIMITS.investment.dtiMax,
    jurisdiction: "cz",
    sourceName: "Česká národní banka — makroobezřetnostní politika",
    sourceUrl: CNB_MACRO_URL,
    sourceType: "central_bank",
    verifiedAt: VERIFIED_AT,
    validFrom: CNB_FROM,
    status: "VERIFIED",
    notes: CNB_LIMITS.investment.note,
    topic: "ltv_dti_dsti",
  },
  {
    id: "cz.model.dsti.warning_threshold",
    claim:
      "Orientační UX práh varování DSTI 40 % — model bankovní praxe, není plošný limit ČNB.",
    value: 40,
    jurisdiction: "cz",
    sourceName: "Hypotéka Jasně — model",
    sourceUrl: null,
    sourceType: "model",
    verifiedAt: VERIFIED_AT,
    status: "MODEL",
    notes: "Není regulatorní limit ČNB.",
    topic: "ltv_dti_dsti",
  },

  // —— Daň z nabytí (known bug fix) ——
  {
    id: "cz.tax.acquisition.abolished_2020",
    claim: "Daň z nabytí nemovitých věcí byla zrušena v roce 2020.",
    value: "zrušena (2020)",
    jurisdiction: "cz",
    sourceName: "Finanční správa ČR — zrušení daně z nabytí",
    sourceUrl: FS_ACQUISITION_TAX_ABOLITION_URL,
    sourceType: "tax_authority",
    verifiedAt: VERIFIED_AT,
    validFrom: "2020-09-26",
    status: "VERIFIED",
    notes:
      "Primární informace Finanční správy k zákonu č. 386/2020 Sb. Neuvádíme další právní interpretace nad rámec ověřeného faktu zrušení.",
    topic: "tax",
  },

  // —— Katastr ——
  {
    id: "cz.cadastre.title_transfer",
    claim:
      "Převod vlastnictví v ČR se zapisuje do katastru nemovitostí. Úschovu kupní ceny a přípravu smluv běžně zajišťuje advokát, notář nebo banka — notářské ověření není jedinou povinnou cestou převodu.",
    value: "zápis do katastru",
    jurisdiction: "cz",
    sourceName: "ČÚZK — katastr nemovitostí",
    sourceUrl: CUZK_HOME,
    sourceType: "land_authority",
    verifiedAt: VERIFIED_AT,
    status: "VERIFIED",
    notes: "Obecný rámec — ne individuální právní rada.",
    topic: "cadastre",
  },
  {
    id: "cz.cadastre.vklad_fee",
    claim:
      "Správní poplatek za přijetí návrhu na zahájení řízení o povolení vkladu do katastru nemovitostí činí 2 000 Kč (položka 120a sazebníku správních poplatků).",
    value: 2000,
    jurisdiction: "cz",
    sourceName: "ČÚZK — sazby správních poplatků",
    sourceUrl: CUZK_FEE_URL,
    sourceType: "land_authority",
    verifiedAt: VERIFIED_AT,
    validFrom: null,
    status: "VERIFIED",
    notes:
      "Zákon č. 634/2004 Sb., položka 120a. U některých veřejně prospěšných staveb může platit úhrnný strop — ověřte u ČÚZK.",
    topic: "cadastre",
  },

  // —— Ostatní CZ náklady / daně (opatrně) ——
  {
    id: "cz.tax.property_annual",
    claim:
      "Daň z nemovitých věcí je roční a sazby stanovují obce — výše není univerzální.",
    value: null,
    jurisdiction: "cz",
    sourceName: "Ministerstvo financí / zákon o dani z nemovitých věcí",
    sourceUrl: "https://www.mfcr.cz/",
    sourceType: "ministry",
    verifiedAt: VERIFIED_AT,
    status: "ESTIMATE",
    notes: "Konkrétní částku vždy ověřte u obce / finanční správy.",
    topic: "tax",
  },
  {
    id: "cz.fees.legal_escrow_band",
    claim:
      "Právní služby a úschova kupní ceny se na trhu typicky pohybují v řádu desítek tisíc Kč podle složitosti — nejde o úřední sazebník.",
    value: "orientačně 10–25 tis. Kč+",
    jurisdiction: "cz",
    sourceName: "Tržní praxe ČR",
    sourceUrl: null,
    sourceType: "market_practice",
    verifiedAt: VERIFIED_AT,
    status: "MODEL",
    notes: "Modelové pásmo, ne ceník.",
    topic: "purchase_costs",
  },
  {
    id: "cz.tax.vat_new_build",
    claim:
      "Sazby DPH u převodu nových nemovitostí se řídí zákonem o DPH — konkrétní sazba závisí na typu a parametrech nemovitosti.",
    value: null,
    jurisdiction: "cz",
    sourceName: "Finanční správa / zákon o DPH",
    sourceUrl: "https://www.financnisprava.cz/",
    sourceType: "tax_authority",
    verifiedAt: VERIFIED_AT,
    status: "NEEDS_UPDATE",
    notes:
      "Dříve hardcodované „12 % / 21 %“ bez primární citace — vyžaduje aktualizaci proti aktuálnímu znění zákona.",
    topic: "tax",
  },
  {
    id: "cz.tax.rental_income",
    claim:
      "Příjem z nájmu fyzických osob podléhá dani z příjmů; konkrétní sazba a odpočty závisí na režimu poplatníka.",
    value: null,
    jurisdiction: "cz",
    sourceName: "Finanční správa / zákon o daních z příjmů",
    sourceUrl: "https://www.financnisprava.cz/",
    sourceType: "tax_authority",
    verifiedAt: VERIFIED_AT,
    status: "NEEDS_UPDATE",
    notes: "Bez individuální interpretace sazeb 15/23 % v UI, dokud není citován aktuální paragraf.",
    topic: "tax",
  },
  {
    id: "cz.tax.capital_gains_time_test",
    claim:
      "Osvobození příjmu z prodeje nemovitosti FO závisí na zákonných podmínkách (časový test / bydlení) — ověřte aktuální znění ZDP.",
    value: null,
    jurisdiction: "cz",
    sourceName: "Finanční správa / zákon o daních z příjmů",
    sourceUrl: "https://www.financnisprava.cz/",
    sourceType: "tax_authority",
    verifiedAt: VERIFIED_AT,
    status: "NEEDS_UPDATE",
    notes: "Hardcoded „0 % po 10/5/2 letech“ bylo zjednodušení — vyžaduje citaci primárního znění.",
    topic: "tax",
  },
  {
    id: "cz.ownership.freehold_katastr",
    claim:
      "Vlastnické právo k nemovitosti v ČR vzniká zápisem do katastru nemovitostí.",
    value: "zápis = vznik práva",
    jurisdiction: "cz",
    sourceName: "ČÚZK / občanský zákoník — katastr",
    sourceUrl: CUZK_HOME,
    sourceType: "land_authority",
    verifiedAt: VERIFIED_AT,
    status: "VERIFIED",
    notes: "Obecný rámec; konkrétní listiny ověřte právně.",
    topic: "ownership",
  },
];

/** Kompletní SoT — CZ + zahraniční jurisdikce (PROMPT 12). */
export const FACT_CLAIMS: FactClaim[] = [
  ...CZ_FACT_CLAIMS,
  ...JURISDICTION_FACT_CLAIMS,
];

export function getFactClaim(id: string): FactClaim | undefined {
  return FACT_CLAIMS.find((c) => c.id === id);
}

export function requireFactClaim(id: string): FactClaim {
  const c = getFactClaim(id);
  if (!c) throw new Error(`Missing FactClaim: ${id}`);
  return c;
}

export function listFactClaims(filters?: {
  jurisdiction?: string | null;
  topic?: FactClaim["topic"] | null;
  status?: FactClaim["status"] | null;
}): FactClaim[] {
  return FACT_CLAIMS.filter((c) => {
    if (filters?.jurisdiction && c.jurisdiction !== filters.jurisdiction) {
      return false;
    }
    if (filters?.topic && c.topic !== filters.topic) return false;
    if (filters?.status && c.status !== filters.status) return false;
    return true;
  });
}

/** Zakázané historické / chybné fráze — nesmí se objevit ve veřejném UI. */
export const FORBIDDEN_FACT_PHRASES = [
  "od 2016 neplatí kupující",
  "řádově stovky až tisíce Kč",
] as const;
