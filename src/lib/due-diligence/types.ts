import type { ClaimKind } from "@/lib/property-rentgen/types";

export const DUE_DILIGENCE_STORAGE_KEY = "hj-due-diligence-v1";
export const DUE_DILIGENCE_FEATURE_STATUS = "BETA" as const;

export const PROPERTY_TYPES = [
  "apartment",
  "house",
  "land",
  "commercial",
  "off_plan",
  "foreign_property",
] as const;

export type PropertyType = (typeof PROPERTY_TYPES)[number];

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  apartment: "Byt",
  house: "Rodinný dům",
  land: "Pozemek",
  commercial: "Komerční nemovitost",
  off_plan: "Off-plan / ve výstavbě",
  foreign_property: "Zahraniční nemovitost",
};

export const DD_CATEGORIES = [
  "LEGAL",
  "OWNERSHIP",
  "ENCUMBRANCES",
  "BUILDING",
  "TECHNICAL",
  "SVJ_HOA",
  "FINANCIAL",
  "RENTAL",
  "LOCATION",
  "DEVELOPER",
  "TAX",
  "INSURANCE",
  "EXIT",
] as const;

export type DDCategory = (typeof DD_CATEGORIES)[number];

export const DD_CATEGORY_LABELS: Record<DDCategory, string> = {
  LEGAL: "Právní",
  OWNERSHIP: "Vlastnictví",
  ENCUMBRANCES: "Břemena a věcná práva",
  BUILDING: "Stavba",
  TECHNICAL: "Technický stav",
  SVJ_HOA: "SVJ / HOA",
  FINANCIAL: "Finanční",
  RENTAL: "Nájem",
  LOCATION: "Lokalita",
  DEVELOPER: "Developer",
  TAX: "Daně",
  INSURANCE: "Pojištění",
  EXIT: "Exit",
};

export type TrafficLight = "GREEN" | "AMBER" | "RED" | "GREY";

export const TRAFFIC_LIGHT_LABELS: Record<TrafficLight, string> = {
  GREEN: "Ověřeno — evidence k dispozici",
  AMBER: "Vyžaduje kontrolu",
  RED: "Potenciálně zásadní problém",
  GREY: "Neznámé — absence dat neznamená absenci rizika",
};

export type ResponsibleParty =
  | "user"
  | "lawyer"
  | "hypoteka_jasne"
  | "mortgage_specialist"
  | "agent_developer"
  | "surveyor"
  | "tax_advisor";

export const RESPONSIBLE_PARTY_LABELS: Record<ResponsibleParty, string> = {
  user: "Kupující",
  lawyer: "Právník",
  hypoteka_jasne: "Hypotéka Jasně (edukace)",
  mortgage_specialist: "Hypoteční specialista",
  agent_developer: "Makléř / developer",
  surveyor: "Technický posudek / znalec",
  tax_advisor: "Daňový poradce",
};

export type Severity = "low" | "medium" | "high" | "critical";

export type DDChecklistItemTemplate = {
  id: string;
  category: DDCategory;
  label: string;
  description: string;
  responsibleParty: ResponsibleParty;
  defaultSeverity: Severity;
  /** Typy nemovitostí, pro které položka platí — prázdné = všechny */
  appliesTo: PropertyType[] | "all";
};

export type DDChecklistItem = {
  id: string;
  category: DDCategory;
  label: string;
  description: string;
  status: TrafficLight;
  evidence: string | null;
  source: string | null;
  responsibleParty: ResponsibleParty;
  severity: Severity;
  claimKind: ClaimKind;
  updatedAt: string | null;
};

export type DDSummary = {
  verifiedCount: number;
  checkRequiredCount: number;
  materialIssueCount: number;
  unknownCount: number;
  summaryLine: string;
};

export type ExpertEscalation = {
  recommended: boolean;
  reason: string;
  urgency: "standard" | "high";
  ctaLabel: string;
  ctaHref: string;
};

export type DueDiligenceInput = {
  propertyType: PropertyType;
  propertyLabel: string;
  country: string;
  /** User-provided status overrides by item id */
  itemOverrides: Record<
    string,
    Partial<Pick<DDChecklistItem, "status" | "evidence" | "source">>
  >;
};

export type DueDiligenceModel = {
  generatedAt: string;
  input: DueDiligenceInput;
  items: DDChecklistItem[];
  summary: DDSummary;
  escalation: ExpertEscalation;
  methodology: string[];
};

export function defaultDueDiligenceInput(
  partial?: Partial<DueDiligenceInput>
): DueDiligenceInput {
  return {
    propertyType: partial?.propertyType ?? "apartment",
    propertyLabel: partial?.propertyLabel ?? "Nemovitost",
    country: partial?.country ?? "cz",
    itemOverrides: partial?.itemOverrides ?? {},
  };
}

/** Unknown is never treated as verified */
export function isVerifiedStatus(status: TrafficLight): boolean {
  return status === "GREEN";
}

export function assertNotGreenFromUnknown(
  previous: TrafficLight,
  next: TrafficLight,
  hasEvidence: boolean
): TrafficLight {
  if (next === "GREEN" && !hasEvidence) {
    return "GREY";
  }
  if (next === "GREEN" && previous === "GREY" && !hasEvidence) {
    return "GREY";
  }
  return next;
}
