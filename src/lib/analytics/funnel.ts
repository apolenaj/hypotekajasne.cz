/**
 * Funnel dashboard specification — stages for product analytics.
 * Maps taxonomy events → funnel steps. No PII.
 */

import type { AnalyticsEventName } from "@/lib/analytics/events";

export type FunnelStageId =
  | "traffic"
  | "tool_start"
  | "tool_completion"
  | "qualified_lead"
  | "partner_handoff"
  | "mortgage_completed"
  | "property_purchased"
  | "analysis_purchased";

export type FunnelStage = {
  id: FunnelStageId;
  label: string;
  description: string;
  /** Events that advance a user into this stage */
  entryEvents: AnalyticsEventName[];
  /** Downstream conversion events owned by partners / offline — may be rare on-site */
  offlineAttribution?: boolean;
};

/**
 * Canonical funnel:
 * Traffic → Tool start → Tool completion → Qualified lead → Partner handoff
 * → Mortgage completed → Property purchased → Analysis purchased
 */
export const FUNNEL_STAGES: FunnelStage[] = [
  {
    id: "traffic",
    label: "Traffic",
    description: "Sessions / landings (page_view via GA; not custom taxonomy).",
    entryEvents: [],
  },
  {
    id: "tool_start",
    label: "Tool start",
    description: "User begins a primary tool.",
    entryEvents: [
      "homepage_intent_selected",
      "calculator_started",
      "prescore_started",
      "investment_pass_started",
      "analysis_started",
      "country_viewed",
    ],
  },
  {
    id: "tool_completion",
    label: "Tool completion",
    description: "User finishes a model / result screen.",
    entryEvents: [
      "calculator_completed",
      "prescore_completed",
      "investment_pass_completed",
      "financing_option_selected",
    ],
  },
  {
    id: "qualified_lead",
    label: "Qualified lead",
    description: "Consenting lead submit with privacy + partner consents recorded.",
    entryEvents: ["lead_submitted", "analysis_checkout_started"],
  },
  {
    id: "partner_handoff",
    label: "Partner handoff",
    description: "Explicit transfer to licensed partner or Majetio discovery.",
    entryEvents: ["partner_handoff", "majetio_clicked"],
  },
  {
    id: "mortgage_completed",
    label: "Mortgage completed",
    description:
      "Offline / partner CRM confirmation — not claimed by HJ web alone.",
    entryEvents: ["conversion_confirmed"],
    offlineAttribution: true,
  },
  {
    id: "property_purchased",
    label: "Property purchased",
    description: "Offline / Majetio / broker confirmation.",
    entryEvents: ["conversion_confirmed"],
    offlineAttribution: true,
  },
  {
    id: "analysis_purchased",
    label: "Analysis purchased",
    description: "Paid Premium analysis checkout confirmed.",
    entryEvents: ["conversion_confirmed"],
  },
];

export type FunnelDashboardSpec = {
  version: string;
  currencyDisplay: "CZK";
  privacyNote: string;
  stages: FunnelStage[];
  recommendedWidgets: string[];
};

export const FUNNEL_DASHBOARD_SPEC: FunnelDashboardSpec = {
  version: "2026-07-19.1",
  currencyDisplay: "CZK",
  privacyNote:
    "Dashboard metrics use event counts and coarse buckets only — no incomes, loan amounts, emails, or phones.",
  stages: FUNNEL_STAGES,
  recommendedWidgets: [
    "Session → tool_start conversion rate",
    "Tool start → tool_completion rate by tool_id",
    "Tool completion → lead_submitted rate",
    "Lead → partner_handoff rate by partner_scope",
    "majetio_clicked rate from readiness / passport",
    "analysis_checkout_started → conversion_confirmed (analysis_purchased)",
    "Experiment uplift table (hero / CTA / form / preview / majetio)",
  ],
};
