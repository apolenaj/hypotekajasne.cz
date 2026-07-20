/**
 * Prezentace country page — jedna generace (Premium Dossier).
 * Mapuje interní dossier sekce na uživatelskou strukturu 1–13.
 */

import type { DossierSectionId } from "@/lib/country-dossier/types";

export type CountryPageNavId =
  | "overview"
  | "key_figures"
  | "suitability"
  | "ownership"
  | "purchase"
  | "financing"
  | "costs"
  | "yield"
  | "risks"
  | "decision_lab"
  | "sources"
  | "cta";

export type CountryPageNavItem = {
  id: CountryPageNavId;
  /** Kotva na stránce (#…) */
  href: string;
  label: string;
  /** Interní dossier IDs, které se v této skupině vykreslí */
  dossierSectionIds: DossierSectionId[];
  /** Syntetická sekce (klíčová čísla / výnos) — není v datech dossieru */
  synthetic?: "key_figures" | "yield";
};

/**
 * Pořadí navigace country page (bez hero — to je vždy nahoře).
 * Decision Lab / kalkulačky žijí mimo dossier (InvestorGuidePage).
 */
export const COUNTRY_PAGE_NAV: CountryPageNavItem[] = [
  {
    id: "overview",
    href: "#prehled",
    label: "Rychlý přehled",
    dossierSectionIds: ["executive_summary"],
  },
  {
    id: "key_figures",
    href: "#klicova-cisla",
    label: "Klíčová čísla",
    dossierSectionIds: [],
    synthetic: "key_figures",
  },
  {
    id: "suitability",
    href: "#pro-koho",
    label: "Pro koho je trh vhodný",
    dossierSectionIds: ["suitability"],
  },
  {
    id: "ownership",
    href: "#vlastnictvi",
    label: "Vlastnictví",
    dossierSectionIds: ["ownership"],
  },
  {
    id: "purchase",
    href: "#proces-koupe",
    label: "Proces koupě",
    dossierSectionIds: ["purchase_timeline"],
  },
  {
    id: "financing",
    href: "#financovani",
    label: "Financování",
    dossierSectionIds: ["financing"],
  },
  {
    id: "costs",
    href: "#naklady-a-dane",
    label: "Náklady a daně",
    dossierSectionIds: ["transaction_costs", "holding_costs", "rental_tax"],
  },
  {
    id: "yield",
    href: "#vynos",
    label: "Výnos a investiční model",
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
    id: "decision_lab",
    href: "#decision-lab",
    label: "Decision Lab / kalkulačky",
    dossierSectionIds: [],
  },
  {
    id: "sources",
    href: "#zdroje",
    label: "Zdroje a metodika",
    dossierSectionIds: ["sources"],
  },
  {
    id: "cta",
    href: "#majetio",
    label: "Majetio",
    dossierSectionIds: ["cta"],
  },
];

/** České názvy interních podsekcí (bez EN „Executive summary“ apod.) */
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
  cta: "Další krok — Majetio",
};
