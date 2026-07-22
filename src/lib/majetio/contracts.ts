/**
 * API contract pro Majetio property detail.
 * Implementace na straně Majetio + tenké proxy/handoff na Hypotéka Jasně.
 */

import type { FeatureStatus } from "@/lib/majetio/types";

/** „Mohu si to dovolit?“ — request z property detail */
export type AffordabilityCheckRequest = {
  propertyId: string;
  priceCzk: number;
  currency?: "CZK" | "EUR" | "USD" | "AED";
  country?: string;
  /** Volitelně z Financial Passport query (bez PII) */
  passport?: {
    safePropertyBudget?: number | null;
    maxEstimatedBankBudget?: number | null;
    ownFunds?: number | null;
    safeMonthlyPayment?: number | null;
    purpose?: string | null;
  };
  attribution?: {
    llid?: string;
    ref?: string;
    utm_source?: string;
    utm_campaign?: string;
  };
};

export type AffordabilityCheckResponse = {
  status: FeatureStatus;
  /** Orientační verdikt — ne schválení banky */
  verdict: "within_safe_budget" | "within_max_estimate" | "above_budget" | "insufficient_data";
  claimKind: "MODEL" | "ODHAD" | "NEOVERENO";
  summary: string;
  comparedTo?: {
    safePropertyBudget?: number | null;
    maxEstimatedBankBudget?: number | null;
  };
  cta: {
    label: string;
    href: string;
  };
  disclaimer: string;
};

/** „Spočítat financování na Hypotéka Jasně“ */
export type FinancingHandoffRequest = {
  propertyId: string;
  priceCzk: number;
  country?: string;
  purpose?: string;
  attribution?: AffordabilityCheckRequest["attribution"];
};

export type FinancingHandoffResponse = {
  status: FeatureStatus;
  handoffUrl: string;
  safeParamsPassed: string[];
  disclaimer: string;
};

export const AFFORDABILITY_CONTRACT_VERSION = "2026-07-majetio-affordability-v1";
export const FINANCING_HANDOFF_CONTRACT_VERSION =
  "2026-07-majetio-financing-handoff-v1";

export const PROPERTY_DETAIL_WIDGETS = {
  canIAfford: {
    id: "majetio.can_i_afford",
    label: "Mohu si to dovolit?",
    status: "COMING_SOON" as FeatureStatus,
    contractVersion: AFFORDABILITY_CONTRACT_VERSION,
    hjEndpoint: "/api/bridge/majetio/affordability",
  },
  calculateFinancing: {
    id: "majetio.calculate_financing",
    label: "Spočítat financování na Hypotéka Jasně",
    status: "BETA" as FeatureStatus,
    contractVersion: FINANCING_HANDOFF_CONTRACT_VERSION,
    hjEndpoint: "/api/bridge/majetio/financing-handoff",
  },
} as const;
