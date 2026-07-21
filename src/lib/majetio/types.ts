/**
 * Propojení HypotékaJasně ↔ Majetio — společné typy.
 */

export type FeatureStatus = "LIVE" | "BETA" | "COMING_SOON";

export const FEATURE_STATUS_LABELS: Record<FeatureStatus, string> = {
  LIVE: "Dostupné",
  BETA: "Veřejná zkušební verze",
  COMING_SOON: "Připravujeme",
};

/** Jednotný Financial Passport — jen financní / kvalifikační signály, ne PII. */
export type FinancialPassport = {
  version: 1;
  /** Orientační max. úvěr (model) — ne schválení banky */
  maxEstimatedBankBudget: number | null;
  /** Konzervativnější rozpočet na nemovitost (ownFunds + low loan range) */
  safePropertyBudget: number | null;
  ownFunds: number;
  /** Orientační max. měsíční splátka (DSTI model) */
  safeMonthlyPayment: number | null;
  purpose:
    | "owner_occupied"
    | "investment"
    | "refinance"
    | "foreign_purchase"
    | "unknown";
  country: string | null;
  /** Lidský / kódový profil (např. readiness_band) */
  investmentProfile: string;
  financingStatus:
    | "exploratory"
    | "needs_work"
    | "ready_to_explore"
    | "ready_to_apply_prep"
    | "unknown";
  /** Claim: vždy MODEL/ODHAD na HJ straně */
  claimNote: string;
};

export type AttributionPayload = {
  /** Stabilní anonymní ID životního cyklu leadu (localStorage) */
  lifecycleId: string;
  /** Jednorázové ID odchozího kliknutí / handoffu */
  referralId: string;
  /** Zdroj platformy */
  source: "hypoteka-jasne" | "majetio";
  medium: string;
  campaign: string;
  content?: string;
  /** Konverzní kontext (kde vznikla akce) */
  conversion: {
    event: string;
    product: string;
    at: string;
  };
  utm: {
    utm_source: string;
    utm_medium: string;
    utm_campaign: string;
    utm_content?: string;
    utm_term?: string;
  };
};

/** Whitelist query keys předávaných na Majetio discovery */
export const MAJETIO_SAFE_QUERY_KEYS = [
  "budget_max",
  "safe_budget",
  "equity",
  "purpose",
  "country",
  "profile",
  "financing_status",
  "fp_v",
  "llid",
  "ref",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

export type MajetioSafeQueryKey = (typeof MAJETIO_SAFE_QUERY_KEYS)[number];
