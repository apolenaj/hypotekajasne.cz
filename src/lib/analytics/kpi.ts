/**
 * Dashboard KPI definitions (PROMPT 19).
 * Formulas reference canonical event names — counts only, no PII.
 */

import type { AnalyticsEventName } from "@/lib/analytics/events";

export type KpiDefinition = {
  id: string;
  label: string;
  description: string;
  /** Dashboard-ready metric id (snake_case) */
  metricId: string;
  numerator: AnalyticsEventName | AnalyticsEventName[];
  denominator: AnalyticsEventName | AnalyticsEventName[];
  filters?: string;
  unit: "ratio" | "count" | "rate";
};

export const PRODUCT_KPIS: KpiDefinition[] = [
  {
    id: "calculator_completion_rate",
    metricId: "kpi_calculator_completion_rate",
    label: "Calculator completion rate",
    description:
      "calculator_completed ÷ calculator_started (by tool_id / country_id segment).",
    numerator: "calculator_completed",
    denominator: "calculator_started",
    unit: "ratio",
  },
  {
    id: "lead_conversion",
    metricId: "kpi_lead_conversion",
    label: "Lead conversion",
    description:
      "lead_form_submitted ÷ lead_form_started (consent-gated forms only).",
    numerator: "lead_form_submitted",
    denominator: "lead_form_started",
    unit: "ratio",
  },
  {
    id: "qualified_lead_rate",
    metricId: "kpi_qualified_lead_rate",
    label: "Qualified lead rate",
    description:
      "lead_form_submitted where lead_qualified=true ÷ all lead_form_submitted.",
    numerator: "lead_form_submitted",
    denominator: "lead_form_submitted",
    filters: "lead_qualified=true",
    unit: "ratio",
  },
  {
    id: "investment_xray_completion",
    metricId: "kpi_investment_xray_completion",
    label: "Investment X-Ray completion",
    description:
      "property_xray_completed ÷ property_xray_started (free preview or premium intent).",
    numerator: "property_xray_completed",
    denominator: "property_xray_started",
    unit: "ratio",
  },
  {
    id: "refinancing_activation",
    metricId: "kpi_refinancing_activation",
    label: "Refinancing activation",
    description:
      "refinance_radar_started ÷ page_view on /refinancovani-radar (or traffic segment).",
    numerator: "refinance_radar_started",
    denominator: "page_view",
    filters: "path=/refinancovani-radar",
    unit: "rate",
  },
  {
    id: "returning_users",
    metricId: "kpi_returning_users_share",
    label: "Returning users",
    description:
      "homepage_view (or page_view) where visitor_type=returning ÷ all homepage_view.",
    numerator: ["homepage_view", "page_view"],
    denominator: ["homepage_view", "page_view"],
    filters: "visitor_type=returning",
    unit: "ratio",
  },
  {
    id: "market_compare_lead_conversion",
    metricId: "kpi_market_compare_lead_conversion",
    label: "Market comparison → lead",
    description:
      "lead_form_submitted within same session after market_compare_started.",
    numerator: "lead_form_submitted",
    denominator: "market_compare_started",
    unit: "ratio",
  },
];

export const KPI_PRIVACY_NOTE =
  "All KPIs use event counts and coarse dimensions (tool_id, score_bucket, utm_*, visitor_type). Never aggregate raw incomes, debts, or contact fields.";
