/**
 * Jednotná premium datová struktura country pages.
 * Právní tvrzení = vždy source + date + status.
 */

import type { CountryId } from "@/lib/calculators";
import type { DataStatus } from "@/lib/data/types";
import type { FinancingOptionId } from "@/lib/financing/types";

export const DOSSIER_SECTION_IDS = [
  "executive_summary",
  "suitability",
  "ownership",
  "financing",
  "transaction_costs",
  "holding_costs",
  "rental_tax",
  "exit",
  "inheritance",
  "fx_risk",
  "developer_risk",
  "short_term_rentals",
  "purchase_timeline",
  "red_flags",
  "sources",
  "cta",
] as const;

export type DossierSectionId = (typeof DOSSIER_SECTION_IDS)[number];

export const DOSSIER_SECTION_TITLES: Record<DossierSectionId, string> = {
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

/** Právní / regulatorní tvrzení s provenance. */
export type LegalClaim = {
  text: string;
  source: string;
  sourceUrl: string | null;
  /** ISO datum platnosti / poslední kontroly */
  asOf: string;
  status: DataStatus;
  notes?: string | null;
};

export type DossierBullet = {
  text: string;
  claim?: LegalClaim;
};

export type TimelineStep = {
  order: number;
  title: string;
  detail: string;
  durationHint?: string;
  claim?: LegalClaim;
};

export type RedFlag = {
  severity: "high" | "medium" | "info";
  text: string;
  claim?: LegalClaim;
};

export type CostLine = {
  label: string;
  range: string;
  claim?: LegalClaim;
};

export type FinancingLane = {
  audience: "resident" | "non_resident" | "both";
  title: string;
  summary: string;
  /** Odkaz na FinancingOption — bez vymýšlení produktu */
  linkedOptions: FinancingOptionId[];
  claim?: LegalClaim;
};

export type DossierSectionBase = {
  id: DossierSectionId;
  title: string;
  summary: string;
};

export type NarrativeSection = DossierSectionBase & {
  kind: "narrative";
  bullets: DossierBullet[];
};

export type OwnershipSection = DossierSectionBase & {
  kind: "ownership";
  modelLabel: string;
  bullets: DossierBullet[];
};

export type FinancingSection = DossierSectionBase & {
  kind: "financing";
  lanes: FinancingLane[];
};

export type CostsSection = DossierSectionBase & {
  kind: "costs";
  lines: CostLine[];
};

export type TimelineSection = DossierSectionBase & {
  kind: "timeline";
  steps: TimelineStep[];
};

export type FlagsSection = DossierSectionBase & {
  kind: "flags";
  flags: RedFlag[];
};

export type SourcesSection = DossierSectionBase & {
  kind: "sources";
  lastLegalReview: LegalClaim;
  sources: LegalClaim[];
};

export type CtaSection = DossierSectionBase & {
  kind: "cta";
  majetioHref: string;
  majetioLabel: string;
  financingHref: string;
  financingLabel: string;
  disclaimer: string;
};

export type DossierSection =
  | NarrativeSection
  | OwnershipSection
  | FinancingSection
  | CostsSection
  | TimelineSection
  | FlagsSection
  | SourcesSection
  | CtaSection;

export type CountryDossier = {
  countryId: CountryId;
  name: string;
  tagline: string;
  /** Pořadí sekcí 1–16 */
  sections: DossierSection[];
};

export function makeClaim(
  text: string,
  opts: {
    source: string;
    sourceUrl?: string | null;
    asOf: string;
    status: DataStatus;
    notes?: string | null;
  }
): LegalClaim {
  return {
    text,
    source: opts.source,
    sourceUrl: opts.sourceUrl ?? null,
    asOf: opts.asOf,
    status: opts.status,
    notes: opts.notes ?? null,
  };
}
