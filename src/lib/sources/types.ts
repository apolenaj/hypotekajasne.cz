/**
 * Externí provenance a autoritativní zdroje.
 * Interní soubor / tabulka NENÍ veřejný zdroj informace.
 */

import type {
  DataCountryCode,
  DataDomain,
  DataStatus,
  ExternalProvenance,
} from "@/lib/data/types";

export type { ExternalProvenance };

/** Veřejné statusy důvěryhodnosti (SoT). */
export const PUBLIC_TRUST_STATUSES = [
  "LIVE",
  "VERIFIED",
  "MODEL",
  "ESTIMATE",
  "UNVERIFIED",
] as const;

export type PublicTrustStatus = (typeof PUBLIC_TRUST_STATUSES)[number];

/** Operační statusy nad rámec veřejné škály (partner / stáří). */
export type OperationalDataStatus = "PARTNER_QUOTE" | "STALE";

export type AuthorityKind =
  | "regulator"
  | "ministry"
  | "central_bank"
  | "land_authority"
  | "tax_authority"
  | "official_statistics"
  | "court"
  | "other_official";

/** Typ zdroje pro FactClaim (PROMPT 3). */
export type FactSourceType =
  | AuthorityKind
  | "model"
  | "market_practice"
  | "other";

/**
 * Jednotný faktický claim — UI nesmí hardcodovat silnější znění mimo tuto vrstvu.
 */
export type FactClaimStatus =
  | "VERIFIED"
  | "UNVERIFIED"
  | "NEEDS_UPDATE"
  | "MODEL"
  | "ESTIMATE";

export type FactClaim = {
  id: string;
  /** Veřejné znění tvrzení */
  claim: string;
  /** Hodnota / shrnutí (číslo, %, text) */
  value: string | number | null;
  jurisdiction: string;
  sourceName: string;
  sourceUrl: string | null;
  sourceType: FactSourceType;
  verifiedAt: string | null;
  validFrom?: string | null;
  validTo?: string | null;
  status: FactClaimStatus;
  notes?: string | null;
  /** Tematická skupina pro audit */
  topic:
    | "ltv_dti_dsti"
    | "tax"
    | "cadastre"
    | "fees"
    | "ownership"
    | "foreign_mortgage"
    | "purchase_costs"
    | "regulatory"
    | "other";
};

/** Když chybí automatický research / ověřený deep-link. */
export const MANUAL_VERIFICATION_NOTE =
  "Vyžaduje ruční ověření proti primárnímu předpisu. Projekt nemá automatický web research — konkrétní URL nevymýšlíme.";


export type SourceTopic =
  | "rates"
  | "macroprudential"
  | "ltv_dti_dsti"
  | "tax"
  | "legal_ownership"
  | "cadastre"
  | "statistics"
  | "consumer_credit"
  | "fx"
  | "general";

/** Autoritativní organizace v registru /zdroje. */
export type AuthoritySource = {
  id: string;
  title: string;
  organization: string;
  kind: AuthorityKind;
  url: string;
  /** ISO country / multi */
  jurisdiction: DataCountryCode | "eu" | "multi";
  topics: SourceTopic[];
  /** Krátký veřejný popis role */
  description: string;
  lastCheckedAt: string;
};

/** Propojení autority ↔ konkrétní tvrzení / katalogový údaj. */
export type ProvenanceClaimLink = {
  id: string;
  /** Veřejný název tvrzení */
  claimLabel: string;
  domain: DataDomain;
  country: DataCountryCode;
  status: DataStatus;
  authorityIds: string[];
  provenance: ExternalProvenance;
  /** Interní audit — nesmí se zobrazit jako „zdroj“ */
  internalStorageRef: string | null;
  notes: string | null;
};
