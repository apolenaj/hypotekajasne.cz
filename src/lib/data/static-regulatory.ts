/**

 * Regulatorní limity jako DataRecord (Source of Truth metadata).

 * Numerické konstanty zůstávají v cnb-limits.ts / banking.ts kvůli kompatibilitě.

 *

 * DŮLEŽITÉ: Tento soubor NENÍ veřejný zdroj pravdy — jen interní storage.

 * VERIFIED status vyžaduje ExternalProvenance na ČNB (viz src/lib/sources).

 */



import { CNB_LIMITS } from "@/lib/cnb-limits";

import { makeDataRecord } from "@/lib/data/records";

import type { DataRecord, ExternalProvenance } from "@/lib/data/types";



const CNB_VALID_FROM = "2026-04-01";

const CNB_CHECKED = "2026-07-20";



const CNB_PROVENANCE_BASE: Omit<ExternalProvenance, "title"> = {

  organization: "Česká národní banka (ČNB)",

  url: "https://www.cnb.cz/cs/financni-stabilita/makroobezretnostni-politika/",

  reference: null,

  jurisdiction: "cz",

  publishedOrEffectiveAt: CNB_VALID_FROM,

  lastCheckedAt: CNB_CHECKED,

  reviewedBy: "redakce HypotékaJasně",

  reviewMethod: "Manuální kontrola oficiální stránky ČNB",

};



function cnbProvenance(title: string): ExternalProvenance {

  return { ...CNB_PROVENANCE_BASE, title };

}



export const REGULATORY_RECORDS = {

  ltvOwnerStandard: makeDataRecord({

    id: "ltv.cnb.owner_occupied.standard",

    value: CNB_LIMITS.ownerOccupied.ltvStandard,

    unit: "ltv_percent",

    country: "cz",

    source: "ČNB — makroobezřetnostní doporučení",

    sourceUrl: CNB_PROVENANCE_BASE.url,

    sourceType: "cnb",

    status: "VERIFIED",

    confidence: 0.95,

    validFrom: CNB_VALID_FROM,

    lastVerifiedAt: CNB_CHECKED,

    notes: CNB_LIMITS.ownerOccupied.note,

    provenance: cnbProvenance("ČNB — LTV pro vlastní bydlení (standard)"),

    internalStorageRef: "src/lib/data/static-regulatory.ts#ltvOwnerStandard",

  }),

  ltvOwnerYoung: makeDataRecord({

    id: "ltv.cnb.owner_occupied.young",

    value: CNB_LIMITS.ownerOccupied.ltvYoungUnder36,

    unit: "ltv_percent",

    country: "cz",

    source: "ČNB — žadatelé do 36 let",

    sourceUrl: CNB_PROVENANCE_BASE.url,

    sourceType: "cnb",

    status: "VERIFIED",

    confidence: 0.95,

    validFrom: CNB_VALID_FROM,

    lastVerifiedAt: CNB_CHECKED,

    notes: null,

    provenance: cnbProvenance("ČNB — LTV pro žadatele do 36 let"),

    internalStorageRef: "src/lib/data/static-regulatory.ts#ltvOwnerYoung",

  }),

  ltvInvestment: makeDataRecord({

    id: "ltv.cnb.investment",

    value: CNB_LIMITS.investment.ltvMax,

    unit: "ltv_percent",

    country: "cz",

    source: "ČNB — investiční hypotéky",

    sourceUrl: CNB_PROVENANCE_BASE.url,

    sourceType: "cnb",

    status: "VERIFIED",

    confidence: 0.95,

    validFrom: CNB_VALID_FROM,

    lastVerifiedAt: CNB_CHECKED,

    notes: CNB_LIMITS.investment.note,

    provenance: cnbProvenance(

      "ČNB — LTV investiční / další obytné nemovitosti"

    ),

    internalStorageRef: "src/lib/data/static-regulatory.ts#ltvInvestment",

  }),

  dtiInvestment: makeDataRecord({

    id: "dti.cnb.investment",

    value: CNB_LIMITS.investment.dtiMax,

    unit: "ratio",

    country: "cz",

    source: "ČNB — DTI investiční",

    sourceUrl: CNB_PROVENANCE_BASE.url,

    sourceType: "cnb",

    status: "VERIFIED",

    confidence: 0.95,

    validFrom: CNB_VALID_FROM,

    lastVerifiedAt: CNB_CHECKED,

    notes: null,

    provenance: cnbProvenance("ČNB — DTI investiční hypotéky"),

    internalStorageRef: "src/lib/data/static-regulatory.ts#dtiInvestment",

  }),

  dstiWarning: makeDataRecord({

    id: "dsti.ui.warning",

    value: 0.4,

    unit: "ratio",

    country: "cz",

    source: "Modelový práh bankovní praxe (UX)",

    sourceUrl: null,

    sourceType: "model",

    status: "MODEL",

    confidence: 0.5,

    notes: "checkDTI warning threshold — není limit ČNB.",

    provenance: {

      title: "Modelový práh DSTI varování",

      organization: "HypotékaJasně.cz — model",

      url: null,

      reference: "Interní UX práh — není limit ČNB",

      jurisdiction: "cz",

      publishedOrEffectiveAt: null,

      lastCheckedAt: CNB_CHECKED,

      reviewedBy: null,

      reviewMethod: null,

    },

    internalStorageRef: "src/lib/data/static-regulatory.ts#dstiWarning",

  }),

  dstiDanger: makeDataRecord({

    id: "dsti.ui.danger",

    value: 0.45,

    unit: "ratio",

    country: "cz",

    source: "Modelový práh bankovní praxe (UX)",

    sourceUrl: null,

    sourceType: "model",

    status: "MODEL",

    confidence: 0.5,

    notes: "checkDTI danger threshold — není limit ČNB.",

    provenance: {

      title: "Modelový práh DSTI nebezpečí",

      organization: "HypotékaJasně.cz — model",

      url: null,

      reference: "Interní UX práh — není limit ČNB",

      jurisdiction: "cz",

      publishedOrEffectiveAt: null,

      lastCheckedAt: CNB_CHECKED,

      reviewedBy: null,

      reviewMethod: null,

    },

    internalStorageRef: "src/lib/data/static-regulatory.ts#dstiDanger",

  }),

} as const satisfies Record<string, DataRecord<number>>;


