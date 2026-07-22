/**
 * North-star product funnel + legacy funnel stages.
 *
 * North-star:
 * Landing → Zjistit moje možnosti → Výsledek → decision action → lead / premium
 */

import type { AnalyticsEventName } from "@/lib/analytics/events";
import { PRODUCT_KPIS, KPI_PRIVACY_NOTE } from "@/lib/analytics/kpi";

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
  entryEvents: AnalyticsEventName[];
  offlineAttribution?: boolean;
};

/** Canonical product funnel stages (dashboard). */
export const FUNNEL_STAGES: FunnelStage[] = [
  {
    id: "traffic",
    label: "Traffic / Landing",
    description: "Landings after analytics consent (page_view).",
    entryEvents: ["page_view"],
  },
  {
    id: "tool_start",
    label: "Tool / onboarding start",
    description: "User begins Moje možnosti, calc, passport, rentgen, copilot.",
    entryEvents: [
      "primary_cta_clicked",
      "homepage_intent_selected",
      "intent_selected",
      "homepage_view",
      "onboarding_started",
      "moznosti_started",
      "calculator_started",
      "prescore_started",
      "passport_started",
      "investment_pass_started",
      "rentgen_started",
      "property_xray_started",
      "analysis_started",
      "refinance_radar_started",
      "copilot_opened",
      "market_viewed",
      "market_compare_started",
      "country_viewed",
      "country_calculator_started",
    ],
  },
  {
    id: "tool_completion",
    label: "Result / completion",
    description: "User reaches a modelled result or completes a tool.",
    entryEvents: [
      "onboarding_completed",
      "moznosti_completed",
      "calculator_completed",
      "result_viewed",
      "prescore_completed",
      "passport_completed",
      "financial_passport_created",
      "investment_pass_completed",
      "investment_passport_completed",
      "free_result_viewed",
      "property_xray_completed",
      "financing_option_selected",
      "market_compared",
    ],
  },
  {
    id: "qualified_lead",
    label: "Lead / premium conversion",
    description: "Consenting lead success or premium checkout intent.",
    entryEvents: [
      "lead_form_submitted_success",
      "lead_form_submitted",
      "lead_submitted",
      "premium_cta_clicked",
      "analysis_checkout_started",
      "specialist_cta_clicked",
      "passport_shared_intent",
    ],
  },
  {
    id: "partner_handoff",
    label: "Partner handoff",
    description: "Explicit transfer to licensed partner or Majetio.",
    entryEvents: ["partner_handoff", "partner_handoff_requested", "majetio_clicked"],
  },
  {
    id: "mortgage_completed",
    label: "Mortgage completed",
    description: "Offline / partner CRM — not claimed by HJ web alone.",
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
    description: "Paid Premium analysis confirmed.",
    entryEvents: ["conversion_confirmed"],
  },
];

/** North-star funnel — primary product path to measure weekly. */
export const NORTH_STAR_FUNNEL = {
  id: "moje_moznosti_north_star",
  label: "Zjistit moje možnosti → lead / premium",
  steps: [
    {
      id: "landing",
      label: "Landing",
      events: ["page_view"] as AnalyticsEventName[],
    },
    {
      id: "cta",
      label: "Zjistit moje možnosti",
      events: ["primary_cta_clicked", "onboarding_started"] as AnalyticsEventName[],
    },
    {
      id: "result",
      label: "Výsledek",
      events: [
        "onboarding_completed",
        "result_viewed",
      ] as AnalyticsEventName[],
    },
    {
      id: "decision_action",
      label: "Decision action",
      events: [
        "specialist_cta_clicked",
        "premium_cta_clicked",
        "passport_shared_intent",
        "majetio_clicked",
      ] as AnalyticsEventName[],
    },
    {
      id: "conversion",
      label: "Lead / premium conversion",
      events: [
        "lead_form_submitted_success",
        "lead_submitted",
        "analysis_checkout_started",
        "partner_handoff",
      ] as AnalyticsEventName[],
    },
  ],
} as const;

export type FunnelDashboardSpec = {
  version: string;
  currencyDisplay: "CZK";
  privacyNote: string;
  northStar: typeof NORTH_STAR_FUNNEL;
  stages: FunnelStage[];
  kpis: typeof PRODUCT_KPIS;
  recommendedWidgets: string[];
};

export const FUNNEL_DASHBOARD_SPEC: FunnelDashboardSpec = {
  version: "2026-07-22.19M",
  currencyDisplay: "CZK",
  privacyNote: KPI_PRIVACY_NOTE,
  northStar: NORTH_STAR_FUNNEL,
  stages: FUNNEL_STAGES,
  kpis: PRODUCT_KPIS,
  recommendedWidgets: [
    "North-star: homepage_view → primary_cta_clicked → onboarding_completed → lead_form_submitted",
    "KPI: kpi_calculator_completion_rate (calculator_completed / calculator_started)",
    "KPI: kpi_lead_conversion (lead_form_submitted / lead_form_started)",
    "KPI: kpi_qualified_lead_rate (lead_qualified on lead_form_submitted)",
    "KPI: kpi_investment_xray_completion (property_xray_completed / property_xray_started)",
    "KPI: kpi_refinancing_activation (refinance_radar_started / page_view on radar)",
    "KPI: kpi_returning_users_share (visitor_type=returning)",
    "KPI: kpi_market_compare_lead_conversion (after market_compare_started)",
    "Onboarding step drop-off (onboarding_step_completed by step)",
    "Rentgen: property_xray_started → property_xray_completed → premium_cta_clicked",
    "Attribution: events by utm_source / utm_medium / utm_campaign (consent only)",
    "Experiment uplift (hero / CTA / form / preview / majetio)",
  ],
};
