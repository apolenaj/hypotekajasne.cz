/**
 * Personalized Home Dashboard — progressive personalization.
 * No account auth yet: “signed-in” = local Financial Passport / dashboard preference.
 */

export type DashboardPersona =
  | "onboarding"
  | "buyer"
  | "investor"
  | "refinance";

export type DashboardWidgetId =
  | "financial_readiness"
  | "safe_buying_power"
  | "mortgage_market"
  | "saved_properties"
  | "next_best_action"
  | "watchlist_alerts"
  | "portfolio_snapshot"
  | "majetio_matches"
  | "document_status"
  | "education"
  | "onboarding_progress";

export type DashboardWidget = {
  id: DashboardWidgetId;
  title: string;
  relevance: number;
  reason: string;
};

export type NextBestAction = {
  id: string;
  title: string;
  detail: string;
  href: string;
  urgency: "high" | "medium" | "low";
};

/** Re-export NBA shape for dashboard consumers */
export type { NbaRecommendation } from "@/lib/nba/types";

export type WatchlistItem = {
  id: string;
  label: string;
  priceCzk: number;
  /** Optional prior price for change % */
  previousPriceCzk?: number | null;
  countryHint?: string | null;
  status: "watching" | "in_budget" | "over_budget" | "sold" | "archived";
  addedAt: string;
  notes?: string;
};

export type PropertyDashboardRow = {
  item: WatchlistItem;
  currentValue: number;
  priceChangePct: number | null;
  affordabilityFit: "safe" | "stretch" | "over" | "unknown";
  investmentScore: number | null;
  statusLabel: string;
};

export type MarketRateCard = {
  id: string;
  label: string;
  ratePercent: number | null;
  claimKind: "DATA" | "MODEL" | "ODHAD" | "NEOVERENO";
  relevanceNote: string;
  updatedAt: string | null;
};

export type DocumentChecklistItem = {
  id: string;
  label: string;
  done: boolean;
  priority: number;
};

export type EducationRec = {
  slug: string;
  title: string;
  reason: string;
  href: string;
};

export type PortfolioSnapshot = {
  propertyCount: number;
  totalWatchValue: number;
  inBudgetCount: number;
  overBudgetCount: number;
  claimKind: "MODEL" | "ODHAD";
};

export type MajetioMatchTeaser = {
  budgetMax: number | null;
  safeBudget: number | null;
  purpose: string;
  country: string | null;
  discoveryUrl: string;
  summary: string;
};

export type ReadinessPanel = {
  score: number;
  previousScore: number | null;
  trend: "up" | "down" | "flat" | "new";
  mainChange: string;
  band: string;
  href: string;
};

export type BuyingPowerPanel = {
  max: number | null;
  recommended: number | null;
  safe: number | null;
  claimNote: string;
};

export type DashboardModel = {
  persona: DashboardPersona;
  isPersonalized: boolean;
  readiness: ReadinessPanel | null;
  buyingPower: BuyingPowerPanel | null;
  marketRates: MarketRateCard[];
  properties: PropertyDashboardRow[];
  /** @deprecated prefer recommendations[0] */
  nextAction: NextBestAction;
  /** 1–3 rule-based recommendations from NBA engine */
  recommendations: import("@/lib/nba/types").NbaRecommendation[];
  alerts: string[];
  portfolio: PortfolioSnapshot | null;
  majetio: MajetioMatchTeaser | null;
  documents: DocumentChecklistItem[];
  education: EducationRec[];
  /** Ordered by relevance — render only these */
  visibleWidgets: DashboardWidget[];
};
