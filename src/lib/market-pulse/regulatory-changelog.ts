import { CNB_LIMITS } from "@/lib/cnb-limits";
import type { RegulatoryChangelogEntry } from "@/lib/market-pulse/types";

/**
 * Kurátorský changelog regulatorních změn — editorial VERIFIED, ne live API.
 */
export const REGULATORY_CHANGELOG: RegulatoryChangelogEntry[] = [
  {
    id: "cnb-2026-04-investment-ltv",
    countryId: "cz",
    effectiveDate: "2026-04-01",
    title: "ČNB — investiční hypotéky LTV max. 70 %",
    summary:
      "Makroobezřetnostní doporučení pro investiční úvěry: LTV maximálně 70 % a DTI limit 7. Týká typicky třetí a další obytné nemovitosti nebo nemovitosti určené k pronájmu.",
    source: "Česká národní banka",
    sourceUrl: "https://www.cnb.cz/",
    status: "VERIFIED",
    claimKind: "DATA",
  },
  {
    id: "cnb-2026-04-owner-ltv",
    countryId: "cz",
    effectiveDate: "2026-04-01",
    title: "ČNB — vlastní bydlení LTV 80 % / 90 % (do 36 let)",
    summary: CNB_LIMITS.ownerOccupied.note,
    source: "Česká národní banka",
    sourceUrl: "https://www.cnb.cz/",
    status: "VERIFIED",
    claimKind: "DATA",
  },
  {
    id: "cnb-2026-04-dti-deactivated",
    countryId: "cz",
    effectiveDate: "2026-04-01",
    title: "ČNB — DTI/DSTI u vlastního bydlení deaktivované",
    summary:
      "Ukazatele DTI a DSTI u úvěrů na vlastní bydlení zůstávají deaktivované — banky je mohou používat interně, nejsou plošně povinné.",
    source: "Česká národní banka",
    sourceUrl: "https://www.cnb.cz/",
    status: "VERIFIED",
    claimKind: "DATA",
  },
  {
    id: "es-rental-regional-2025",
    countryId: "spain",
    effectiveDate: "2025-06-01",
    title: "Španělsko — regionální regulace krátkodobých pronájmů",
    summary:
      "Municipality (Barcelona, Madrid, Málaga aj.) zpřísňují podmínky pro krátkodobé pronájmy — ověřte konkrétní lokalitu před koupí.",
    source: "Editorial review — country dossier ES",
    sourceUrl: null,
    status: "MODELLED",
    claimKind: "MODEL",
  },
  {
    id: "ae-freehold-zones",
    countryId: "dubai",
    effectiveDate: "2024-01-01",
    title: "SAE — freehold zóny pro cizince",
    summary:
      "Vlastnictví freehold je možné v designovaných zónách; mimo ně leasehold nebo jiné struktury. Financování a daňový režim individuálně.",
    source: "Editorial review — country dossier AE",
    sourceUrl: null,
    status: "MODELLED",
    claimKind: "MODEL",
  },
  {
    id: "id-foreign-ownership",
    countryId: "bali",
    effectiveDate: "2024-01-01",
    title: "Indonésie — omezení přímého vlastnictví pro cizince",
    summary:
      "Cizinci typicky využívají leasehold / strukturované holdingy — ověřte právní rámec před transakcí.",
    source: "Editorial review — country dossier ID",
    sourceUrl: null,
    status: "MODELLED",
    claimKind: "MODEL",
  },
  {
    id: "sa-vision2030",
    countryId: "saudi",
    effectiveDate: "2025-01-01",
    title: "SA — podmínky vlastnictví pro cizince (Vision 2030)",
    summary:
      "Rámec se vyvíjí v rámci Vision 2030 — individuální due diligence a lokální právník nutný.",
    source: "Editorial review — country dossier SA",
    sourceUrl: null,
    status: "MODELLED",
    claimKind: "MODEL",
  },
];

export function getRegulatoryChangelog(
  countryId?: string
): RegulatoryChangelogEntry[] {
  const sorted = [...REGULATORY_CHANGELOG].sort(
    (a, b) => Date.parse(b.effectiveDate) - Date.parse(a.effectiveDate)
  );
  if (!countryId) return sorted;
  return sorted.filter(
    (e) => e.countryId === countryId || e.countryId === "multi"
  );
}
