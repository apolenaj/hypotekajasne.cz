/**
 * Prezentace country page — progressive disclosure.
 * Snapshot + fit CTA vždy viditelné; hloubka v accordion / deep research.
 * Decision Lab se vkládá slotem (správné pořadí v DOM i TOC).
 */

import type { DossierSectionId } from "@/lib/country-dossier/types";

export type CountryPageNavId =
  | "snapshot"
  | "fit"
  | "financing"
  | "purchase_costs"
  | "tax"
  | "ownership"
  | "yield"
  | "risks"
  | "purchase"
  | "sources"
  | "decision_lab"
  | "deep_research"
  | "cta";

export type CountryPageNavItem = {
  id: CountryPageNavId;
  href: string;
  label: string;
  dossierSectionIds: DossierSectionId[];
  synthetic?:
    | "snapshot"
    | "fit"
    | "yield"
    | "decision_lab"
    | "deep_research";
  /** Vždy viditelné (ne accordion) */
  alwaysVisible?: boolean;
};

/**
 * Pořadí: Snapshot → Fit → témata → kalkulačky → deep research → CTA.
 */
export const COUNTRY_PAGE_NAV: CountryPageNavItem[] = [
  {
    id: "snapshot",
    href: "#snapshot",
    label: "Přehled trhu",
    dossierSectionIds: [],
    synthetic: "snapshot",
    alwaysVisible: true,
  },
  {
    id: "fit",
    href: "#sedi-mi-trh",
    label: "Sedí mi trh?",
    dossierSectionIds: [],
    synthetic: "fit",
    alwaysVisible: true,
  },
  {
    id: "financing",
    href: "#financovani",
    label: "Financování",
    dossierSectionIds: ["financing"],
  },
  {
    id: "purchase_costs",
    href: "#koupe-a-naklady",
    label: "Koupě a náklady",
    dossierSectionIds: ["transaction_costs", "holding_costs"],
  },
  {
    id: "tax",
    href: "#dane",
    label: "Daně",
    dossierSectionIds: ["rental_tax"],
  },
  {
    id: "ownership",
    href: "#vlastnictvi",
    label: "Vlastnictví a právo",
    dossierSectionIds: ["ownership"],
  },
  {
    id: "yield",
    href: "#vynos",
    label: "Výnos a cash flow",
    dossierSectionIds: [],
    synthetic: "yield",
  },
  {
    id: "risks",
    href: "#rizika",
    label: "Rizika",
    dossierSectionIds: [
      "fx_risk",
      "developer_risk",
      "short_term_rentals",
      "exit",
      "inheritance",
      "red_flags",
    ],
  },
  {
    id: "purchase",
    href: "#proces-nakupu",
    label: "Proces nákupu",
    dossierSectionIds: ["purchase_timeline"],
  },
  {
    id: "sources",
    href: "#data-a-zdroje",
    label: "Data a zdroje",
    dossierSectionIds: ["sources"],
  },
  {
    id: "decision_lab",
    href: "#decision-lab",
    label: "Scénáře a kalkulačky",
    dossierSectionIds: [],
    synthetic: "decision_lab",
  },
  {
    id: "deep_research",
    href: "#kompletni-profil",
    label: "Kompletní profil",
    dossierSectionIds: ["executive_summary", "suitability"],
    synthetic: "deep_research",
  },
  {
    id: "cta",
    href: "#dalsi-krok",
    label: "Další krok",
    dossierSectionIds: ["cta"],
  },
];

/** České názvy interních podsekcí */
export const DOSSIER_SUBSECTION_LABELS_CS: Partial<
  Record<DossierSectionId, string>
> = {
  executive_summary: "Rychlý přehled",
  suitability: "Pro koho je trh vhodný",
  ownership: "Vlastnictví",
  financing: "Financování",
  transaction_costs: "Transakční náklady",
  holding_costs: "Průběžné roční náklady",
  rental_tax: "Zdanění nájmu",
  exit: "Prodej a ukončení investice",
  inheritance: "Dědictví",
  fx_risk: "Měnové riziko",
  developer_risk: "Riziko developera",
  short_term_rentals: "Regulace krátkodobých nájmů",
  purchase_timeline: "Proces koupě",
  red_flags: "Rizikové faktory",
  sources: "Zdroje a metodika",
  cta: "Další krok",
};
