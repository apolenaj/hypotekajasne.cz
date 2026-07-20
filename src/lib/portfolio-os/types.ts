import type { ClaimKind } from "@/lib/property-rentgen/types";
import type { ComputedMetric } from "@/lib/digital-twin/types";

export const PORTFOLIO_OS_FEATURE_STATUS = "BETA" as const;

export type PortfolioSummaryMetric = {
  label: string;
  value: number | string | null;
  unit?: string;
  claimKind: ClaimKind;
  blockers: string[];
  formula?: string;
};

export type ExposureSlice = {
  key: string;
  label: string;
  valueCzk: number;
  sharePct: number;
  claimKind: ClaimKind;
};

export type PortfolioSummary = {
  propertyCount: number;
  propertiesWithValidValue: number;
  totalPropertyValue: PortfolioSummaryMetric;
  totalEquity: PortfolioSummaryMetric;
  totalDebt: PortfolioSummaryMetric;
  portfolioLtv: PortfolioSummaryMetric;
  monthlyGrossRent: PortfolioSummaryMetric;
  monthlyNetCashFlow: PortfolioSummaryMetric;
  weightedYield: PortfolioSummaryMetric;
  debtService: PortfolioSummaryMetric;
  liquidityReserve: PortfolioSummaryMetric;
  currencyExposure: ExposureSlice[];
  countryExposure: ExposureSlice[];
  propertyTypeExposure: ExposureSlice[];
  blockers: string[];
};

export type ConcentrationSeverity = "info" | "notable" | "high";

export type ConcentrationAlert = {
  id: string;
  dimension:
    | "city"
    | "country"
    | "property_type"
    | "refixation"
    | "currency_income"
    | "cash_flow_single";
  severity: ConcentrationSeverity;
  headline: string;
  explanation: string;
  metricPct: number;
  claimKind: ClaimKind;
};

export type StressScenarioId =
  | "rates_plus_2pp"
  | "values_minus_15pct"
  | "rent_minus_10pct"
  | "vacancy_3_months"
  | "fx_minus_15pct"
  | "combined_recession";

export type StressScenarioResult = {
  id: StressScenarioId;
  label: string;
  description: string;
  baseline: {
    equityCzk: number | null;
    portfolioLtv: number | null;
    monthlyNetCashFlowCzk: number | null;
  };
  stressed: {
    equityCzk: number | null;
    portfolioLtv: number | null;
    monthlyNetCashFlowCzk: number | null;
  };
  deltaSummary: string;
  claimKind: ClaimKind;
};

export type PortfolioScenarioOption = {
  id: string;
  label: string;
  description: string;
};

export type PortfolioRecommendation = {
  id: string;
  priority: number;
  headline: string;
  explanation: string;
  relatedPropertyIds: string[];
  scenarios: PortfolioScenarioOption[];
  sourceData: {
    keys: string[];
    snapshot: Record<string, string | number | null>;
  };
  claimKind: ClaimKind;
  /** Never direct sell advice */
  disclaimer: string;
};

export type PortfolioPropertyRow = {
  twinId: string;
  label: string;
  city: string | null;
  country: string | null;
  propertyType: string | null;
  valueCzk: number | null;
  equityCzk: number | null;
  debtCzk: number | null;
  monthlyGrossRentCzk: number | null;
  monthlyNetCashFlowCzk: number | null;
  monthlyDebtServiceCzk: number | null;
  grossYieldPct: number | null;
  fixationEnd: string | null;
  riskScore: number | null;
  valueBlockers: string[];
};

export type PortfolioOsResult = {
  generatedAt: string;
  summary: PortfolioSummary;
  properties: PortfolioPropertyRow[];
  concentrationAlerts: ConcentrationAlert[];
  stressTests: StressScenarioResult[];
  recommendations: PortfolioRecommendation[];
  methodology: string[];
};

export function summaryMetric(
  label: string,
  value: number | string | null,
  claimKind: ClaimKind,
  blockers: string[] = [],
  opts?: { unit?: string; formula?: string }
): PortfolioSummaryMetric {
  return {
    label,
    value,
    unit: opts?.unit,
    claimKind: blockers.length > 0 && value == null ? "NEOVERENO" : claimKind,
    blockers,
    formula: opts?.formula,
  };
}

export function fromComputedMetric(
  label: string,
  m: ComputedMetric,
  format?: (v: number) => number | string
): PortfolioSummaryMetric {
  const val =
    m.value != null && format ? format(m.value) : m.value;
  return {
    label,
    value: val,
    claimKind: m.claimKind,
    blockers: m.blockers,
    formula: m.formula,
  };
}
