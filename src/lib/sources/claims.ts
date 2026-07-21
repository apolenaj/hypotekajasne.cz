/**
 * Kritická tvrzení s externí provenance (pro /zdroje a testy).
 * internalStorageRef = audit only — nikdy veřejný „zdroj“.
 */

import type { ProvenanceClaimLink } from "@/lib/sources/types";

const CHECKED = "2026-07-20";
const CNB_EFFECTIVE = "2026-04-01";

const CNB_MACRO_PROVENANCE = {
  title: "Makroobezřetnostní doporučení ČNB k hypotečním úvěrům",
  organization: "Česká národní banka (ČNB)",
  url: "https://www.cnb.cz/cs/financni-stabilita/makroobezretnostni-politika/",
  reference: null as string | null,
  jurisdiction: "cz",
  publishedOrEffectiveAt: CNB_EFFECTIVE,
  lastCheckedAt: CHECKED,
  reviewedBy: "redakce HypotékaJasně",
  reviewMethod: "Manuální kontrola oficiální stránky ČNB",
};

export const CRITICAL_PROVENANCE_CLAIMS: ProvenanceClaimLink[] = [
  {
    id: "claim.ltv.cnb.owner_occupied.standard",
    claimLabel: "LTV vlastní bydlení — standard (80 %)",
    domain: "ltv",
    country: "cz",
    status: "VERIFIED",
    authorityIds: ["cz-cnb-macroprudential", "cz-cnb"],
    provenance: {
      ...CNB_MACRO_PROVENANCE,
      title: "ČNB — LTV pro vlastní bydlení (standard)",
    },
    internalStorageRef: "src/lib/data/static-regulatory.ts#ltvOwnerStandard",
    notes: "Doporučení ČNB, ne automatické schválení bankou.",
  },
  {
    id: "claim.ltv.cnb.owner_occupied.young",
    claimLabel: "LTV vlastní bydlení — žadatelé do 36 let (90 %)",
    domain: "ltv",
    country: "cz",
    status: "VERIFIED",
    authorityIds: ["cz-cnb-macroprudential"],
    provenance: {
      ...CNB_MACRO_PROVENANCE,
      title: "ČNB — LTV pro žadatele do 36 let",
    },
    internalStorageRef: "src/lib/data/static-regulatory.ts#ltvOwnerYoung",
    notes: null,
  },
  {
    id: "claim.ltv.cnb.investment",
    claimLabel: "LTV investiční hypotéky (70 %)",
    domain: "ltv",
    country: "cz",
    status: "VERIFIED",
    authorityIds: ["cz-cnb-macroprudential"],
    provenance: {
      ...CNB_MACRO_PROVENANCE,
      title: "ČNB — LTV investiční / další obytné nemovitosti",
    },
    internalStorageRef: "src/lib/data/static-regulatory.ts#ltvInvestment",
    notes: null,
  },
  {
    id: "claim.dti.cnb.investment",
    claimLabel: "DTI investiční hypotéky (7)",
    domain: "dti_dsti",
    country: "cz",
    status: "VERIFIED",
    authorityIds: ["cz-cnb-macroprudential"],
    provenance: {
      ...CNB_MACRO_PROVENANCE,
      title: "ČNB — DTI investiční hypotéky",
    },
    internalStorageRef: "src/lib/data/static-regulatory.ts#dtiInvestment",
    notes: null,
  },
  {
    id: "claim.dsti.ui.warning",
    claimLabel: "DSTI UX práh varování (40 %)",
    domain: "dti_dsti",
    country: "cz",
    status: "MODEL",
    authorityIds: [],
    provenance: {
      title: "Modelový práh bankovní praxe (UX)",
      organization: "HypotékaJasně.cz — model",
      url: null,
      reference: "Interní model DSTI warning — není limit ČNB",
      jurisdiction: "cz",
      publishedOrEffectiveAt: null,
      lastCheckedAt: CHECKED,
      reviewedBy: null,
      reviewMethod: null,
    },
    internalStorageRef: "src/lib/data/static-regulatory.ts#dstiWarning",
    notes: "Model — není plošný limit ČNB.",
  },
  {
    id: "claim.cadastre.cz.title_transfer",
    claimLabel: "Převod vlastnictví — zápis do katastru (ČR)",
    domain: "legal",
    country: "cz",
    status: "VERIFIED",
    authorityIds: ["cz-cuzk"],
    provenance: {
      title: "Katastr nemovitostí — veřejné informace ČÚZK",
      organization: "Český úřad zeměměřický a katastrální (ČÚZK)",
      url: "https://www.cuzk.cz/",
      reference: null,
      jurisdiction: "cz",
      publishedOrEffectiveAt: null,
      lastCheckedAt: CHECKED,
      reviewedBy: "redakce HypotékaJasně",
      reviewMethod: "Manuální kontrola oficiálního webu ČÚZK",
    },
    internalStorageRef: "src/lib/country-dossier/shared.ts#TITLE_TRANSFER_CZ_CLAIM",
    notes: "Obecný rámec převodu — ne individuální právní rada.",
  },
];

export function getClaimById(id: string): ProvenanceClaimLink | undefined {
  return CRITICAL_PROVENANCE_CLAIMS.find((c) => c.id === id);
}

export function listClaims(filters?: {
  country?: string | null;
  domain?: string | null;
}): ProvenanceClaimLink[] {
  const country = filters?.country || null;
  const domain = filters?.domain || null;
  return CRITICAL_PROVENANCE_CLAIMS.filter((c) => {
    if (country && country !== "all" && c.country !== country) return false;
    if (domain && domain !== "all" && c.domain !== domain) return false;
    return true;
  });
}
