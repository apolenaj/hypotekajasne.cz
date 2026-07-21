/**
 * Sjednocený výsledek „Vaše možnosti“ — skládá existující enginy.
 * Žádný nový persistentní data model; SoT = FinancialProfileAnswers.
 */

import type { ClaimKind } from "@/lib/financial-passport/types";
import type { MarketMatchResult } from "@/lib/market-matching/types";

export type MojeMoznostiNextAction = {
  id: string;
  label: string;
  description: string;
  href: string;
};

export type MojeMoznostiFinancePanel = {
  modelMaxBudget: number | null;
  saferBudget: number | null;
  recommendedBudget: number | null;
  ownFundsNeeded: number | null;
  ownFundsHave: number;
  maxLoanModel: number | null;
  claimKind: ClaimKind;
  claimNote: string;
};

export type MojeMoznostiReadinessPanel = {
  score: number;
  band: string;
  obstacles: string[];
  strengths: string[];
  nextStep: string | null;
  claimKind: ClaimKind;
  disclaimer: string;
};

export type MojeMoznostiMarketPanel = {
  markets: Array<{
    id: string;
    name: string;
    overallMatch: number;
    whyMatch: string[];
    topRisks: string[];
    dataStatus: string;
  }>;
  profileLabel: string;
  claimKind: ClaimKind;
  note: string;
};

export type MojeMoznostiResult = {
  finance: MojeMoznostiFinancePanel;
  readiness: MojeMoznostiReadinessPanel;
  markets: MojeMoznostiMarketPanel;
  nextActions: MojeMoznostiNextAction[];
  ratePercentUsed: number;
  rateUiKind: "LIVE" | "OVĚŘENO" | "MODEL";
};

/** Volitelné preference jen pro market matching (nepersistují se do profilu). */
export type MatchingPreferences = {
  financing: "max_leverage" | "partial" | "cash" | "";
  purpose: "yield_max" | "partial_use" | "conservative" | "flipping" | "";
  horizon: "3_months" | "6_months" | "1_year" | "just_looking" | "";
  region: "exotic_high_yield" | "eu_stability" | "czech_slovak" | "";
};

export const EMPTY_MATCHING_PREFS: MatchingPreferences = {
  financing: "",
  purpose: "",
  horizon: "",
  region: "",
};

export type { MarketMatchResult };
