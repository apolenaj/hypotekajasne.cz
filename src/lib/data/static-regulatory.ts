/**
 * Regulatorní limity jako DataRecord (Source of Truth metadata).
 * Numerické konstanty zůstávají v cnb-limits.ts / banking.ts kvůli kompatibilitě;
 * tento modul je kanonický popis statusu a zdroje.
 */

import { CNB_LIMITS } from "@/lib/cnb-limits";
import { makeDataRecord } from "@/lib/data/records";
import type { DataRecord } from "@/lib/data/types";

const CNB_VALID_FROM = "2026-04-01";
const CNB_VERIFIED_AT = "2026-04-01";

export const REGULATORY_RECORDS = {
  ltvOwnerStandard: makeDataRecord({
    id: "ltv.cnb.owner_occupied.standard",
    value: CNB_LIMITS.ownerOccupied.ltvStandard,
    unit: "ltv_percent",
    country: "cz",
    source: "ČNB — makroobezřetnostní doporučení",
    sourceUrl: "https://www.cnb.cz/",
    sourceType: "cnb",
    status: "VERIFIED",
    confidence: 0.95,
    validFrom: CNB_VALID_FROM,
    lastVerifiedAt: CNB_VERIFIED_AT,
    notes: CNB_LIMITS.ownerOccupied.note,
  }),
  ltvOwnerYoung: makeDataRecord({
    id: "ltv.cnb.owner_occupied.young",
    value: CNB_LIMITS.ownerOccupied.ltvYoungUnder36,
    unit: "ltv_percent",
    country: "cz",
    source: "ČNB — žadatelé do 36 let",
    sourceUrl: "https://www.cnb.cz/",
    sourceType: "cnb",
    status: "VERIFIED",
    confidence: 0.95,
    validFrom: CNB_VALID_FROM,
    lastVerifiedAt: CNB_VERIFIED_AT,
    notes: null,
  }),
  ltvInvestment: makeDataRecord({
    id: "ltv.cnb.investment",
    value: CNB_LIMITS.investment.ltvMax,
    unit: "ltv_percent",
    country: "cz",
    source: "ČNB — investiční hypotéky",
    sourceUrl: "https://www.cnb.cz/",
    sourceType: "cnb",
    status: "VERIFIED",
    confidence: 0.95,
    validFrom: CNB_VALID_FROM,
    lastVerifiedAt: CNB_VERIFIED_AT,
    notes: CNB_LIMITS.investment.note,
  }),
  dtiInvestment: makeDataRecord({
    id: "dti.cnb.investment",
    value: CNB_LIMITS.investment.dtiMax,
    unit: "ratio",
    country: "cz",
    source: "ČNB — DTI investiční",
    sourceUrl: "https://www.cnb.cz/",
    sourceType: "cnb",
    status: "VERIFIED",
    confidence: 0.95,
    validFrom: CNB_VALID_FROM,
    lastVerifiedAt: CNB_VERIFIED_AT,
    notes: null,
  }),
  dstiWarning: makeDataRecord({
    id: "dsti.ui.warning",
    value: 0.4,
    unit: "ratio",
    country: "cz",
    source: "Interní UX práh (bankovní praxe)",
    sourceUrl: null,
    sourceType: "model",
    status: "MODELLED",
    confidence: 0.5,
    notes: "checkDTI warning threshold — není limit ČNB.",
  }),
  dstiDanger: makeDataRecord({
    id: "dsti.ui.danger",
    value: 0.45,
    unit: "ratio",
    country: "cz",
    source: "Interní UX práh (bankovní praxe)",
    sourceUrl: null,
    sourceType: "model",
    status: "MODELLED",
    confidence: 0.5,
    notes: "checkDTI danger threshold — není limit ČNB.",
  }),
} as const satisfies Record<string, DataRecord<number>>;
