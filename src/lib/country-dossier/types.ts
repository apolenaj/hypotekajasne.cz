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
  executive_summary: "1. Executive summary",
  suitability: "2. Pro koho je trh vhodný",
  ownership: "3. Ownership model",
  financing: "4. Financování — rezident / nerezident",
  transaction_costs: "5. Transakční náklady",
  holding_costs: "6. Roční holding costs",
  rental_tax: "7. Zdanění nájmu",
  exit: "8. Exit / prodej",
  inheritance: "9. Dědictví",
  fx_risk: "10. Měnové riziko",
  developer_risk: "11. Riziko developera",
  short_term_rentals: "12. Regulace krátkodobých nájmů",
  purchase_timeline: "13. Proces koupě — timeline",
  red_flags: "14. Red flags",
  sources: "15. Sources & last legal review",
  cta: "16. CTA — Majetio / financování",
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
