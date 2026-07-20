/**
 * Property Digital Twin — architecture blueprint.
 * Status COMING_SOON: types + compute rules only; no live sync or auto-valuation.
 */

import { DIGITAL_TWIN_FEATURE_STATUS } from "@/lib/digital-twin/types";

export { DIGITAL_TWIN_FEATURE_STATUS };

export type DigitalTwinIntegrationStatus = "COMING_SOON" | "BETA" | "LIVE";

export type DigitalTwinArchitectureBlueprint = {
  status: DigitalTwinIntegrationStatus;
  goal: string;
  principles: string[];
  dataDomains: string[];
  computedMetrics: string[];
  timelineEvents: string[];
  valueObservationPolicy: {
    requiredFields: string[];
    forbiddenWithoutSource: string[];
    validSourcesForCurrentDisplay: string[];
  };
  storage: {
    localKey: string;
    maxTwins: number;
    serverSync: DigitalTwinIntegrationStatus;
  };
  integrations: {
    watchlist: IntegrationContract;
    portfolioDashboard: IntegrationContract;
    copilot: IntegrationContract;
    majetio: IntegrationContract;
    financialPassport: IntegrationContract;
  };
  pipeline: string[];
  nonGoals: string[];
  envPlaceholders: string[];
};

export type IntegrationContract = {
  status: DigitalTwinIntegrationStatus;
  description: string;
  touchpoints: string[];
};

export const DIGITAL_TWIN_BLUEPRINT: DigitalTwinArchitectureBlueprint = {
  status: DIGITAL_TWIN_FEATURE_STATUS,
  goal:
    "Dlouhodobý digitální profil každé vlastněné nebo sledované nemovitosti — jeden zdroj pravdy pro portfolio, refinance a Copilot.",
  principles: [
    "Observations append-only; computed metrics derived on read.",
    "No automatic “aktuální odhad ceny” without ValueObservation (source, method, confidence, date).",
    "Market index / hedonic models are COMING_SOON — never backfill silently.",
    "Claim kinds (DATA / MODEL / ODHAD / NEOVERENO) on every surfaced number.",
    "Twin can exist in watched mode before ownership; upgrade relationship without data loss.",
    "Timeline events are audit trail — user-visible and Copilot-citable.",
  ],
  dataDomains: [
    "purchase",
    "financing",
    "mortgageBalanceHistory",
    "valueHistory",
    "rentHistory",
    "occupancy",
    "expenses",
    "repairs",
    "renovations",
    "documents",
    "insurance",
    "taxReminders",
    "energy",
    "propertyManager",
    "keyDates",
    "timeline",
  ],
  computedMetrics: [
    "currentEquity",
    "estimatedLtv",
    "cashOnCashReturn",
    "annualizedReturn",
    "rentGrowthYoy",
    "maintenanceBurden",
    "refinanceOpportunity",
  ],
  timelineEvents: [
    "purchased",
    "renovated",
    "tenant_changed",
    "rent_increased",
    "refinanced",
    "value_estimated",
    "occupancy_changed",
    "relationship_changed",
  ],
  valueObservationPolicy: {
    requiredFields: ["observedAt", "valueCzk", "source", "method", "confidence", "claimKind"],
    forbiddenWithoutSource: [
      "current_market_value_banner",
      "portfolio_total_equity_from_guess",
      "ltv_from_market_default",
    ],
    validSourcesForCurrentDisplay: [
      "user_entered",
      "purchase_deed",
      "bank_appraisal",
      "majetio_listing",
      "tax_assessment",
      "partner_feed",
      "cnb_index",
    ],
  },
  storage: {
    localKey: "hj-digital-twin-v1",
    maxTwins: 25,
    serverSync: "COMING_SOON",
  },
  integrations: {
    watchlist: {
      status: "COMING_SOON",
      description: "Watch target spawns watched twin; price observations → valueHistory entries.",
      touchpoints: [
        "watchlist.mutations.addPropertyWatch → twin.bootstrapFromWatch",
        "recordPriceObservation → valueHistory if user confirms",
        "applyMajetioObservation → valueHistory with source majetio_listing",
      ],
    },
    portfolioDashboard: {
      status: "COMING_SOON",
      description: "Owned twins aggregate into portfolio widget — equity/LTV only with valid observations.",
      touchpoints: [
        "dashboard.widget portfolio_twin_detail",
        "buildDashboardModel → twinComputedSnapshots[]",
        "relevance: show when relationship=owned count > 0",
      ],
    },
    copilot: {
      status: "COMING_SOON",
      description: "Copilot reads twin snapshot + timeline; never invents missing fields.",
      touchpoints: [
        "tools: twin.getSnapshot, twin.listTimeline, twin.refinanceHint",
        "intents: twin_status, refinance_property",
        "citations: twin.valueHistory[].source",
      ],
    },
    majetio: {
      status: "COMING_SOON",
      description: "Inbound listing/valuation feed only — outbound twin registration without PII.",
      touchpoints: [
        "POST /api/bridge/majetio/twin-sync",
        "ValueObservation source=majetio_listing",
      ],
    },
    financialPassport: {
      status: "COMING_SOON",
      description: "Passport supplies refinance rate context and affordability — not property value.",
      touchpoints: [
        "refinanceOpportunity.rateDelta vs useCurrentRates",
        "passport.financing → twin.financing cross-check",
      ],
    },
  },
  pipeline: [
    "1. Mutation on domain (rent, balance, value observation, …)",
    "2. Append observation + emit TwinTimelineEvent",
    "3. computeTwinSnapshot(twin, context) — pure, no side effects",
    "4. UI / Dashboard / Copilot consume snapshot + blockers",
    "5. (Future) sync worker batches observations to server",
  ],
  nonGoals: [
    "Scraping Sreality/inzerát HTML for auto value",
    "Daily CMA without licensed data partner",
    "Storing document binary in localStorage",
    "Single headline “aktuální hodnota” hiding provenance",
    "Replacing Financial Passport or Watchlist stores",
  ],
  envPlaceholders: [
    "TWIN_SYNC_SECRET",
    "TWIN_MAJETIO_HMAC",
    "CNB_INDEX_API_KEY",
  ],
};

/** Majetio inbound contract sketch */
export type MajetioTwinObservation = {
  majetioListingId: string;
  twinId?: string;
  valueObservation?: {
    valueCzk: number;
    observedAt: string;
    method: "listing_ask" | "comparable_sales";
    confidence: "medium" | "low";
  };
  rentMonthlyCzk?: number;
  occupancyRate?: number;
};

export const MAJETIO_TWIN_SYNC_PATH = "/api/bridge/majetio/twin-sync" as const;
