import type { CountryId } from "@/lib/calculators";
import type { DataRecord, DataStatus } from "@/lib/data/types";
import type { ClaimKind } from "@/lib/property-rentgen/types";

export const MARKET_PULSE_STORAGE_KEY = "hj-market-pulse-v1";
export const MARKET_PULSE_FEATURE_STATUS = "BETA" as const;

export const PULSE_TIMEFRAMES = ["1M", "3M", "1Y", "3Y"] as const;
export type PulseTimeframe = (typeof PULSE_TIMEFRAMES)[number];

export const PULSE_TIMEFRAME_LABELS: Record<PulseTimeframe, string> = {
  "1M": "1 měsíc",
  "3M": "3 měsíce",
  "1Y": "12 měsíců",
  "3Y": "3 roky",
};

export const PULSE_METRIC_KINDS = [
  "mortgage_rate",
  "property_price",
  "rent",
  "yield",
  "supply",
  "demand_proxy",
  "days_on_market",
  "fx",
  "regulatory",
  "risk_events",
] as const;

export type PulseMetricKind = (typeof PULSE_METRIC_KINDS)[number];

export const PULSE_METRIC_LABELS: Record<PulseMetricKind, string> = {
  mortgage_rate: "Hypoteční sazby",
  property_price: "Ceny nemovitostí",
  rent: "Nájemné",
  yield: "Výnos (yield)",
  supply: "Nabídka (supply)",
  demand_proxy: "Poptávka (proxy)",
  days_on_market: "Dny v inzerci (DOM)",
  fx: "Měnové riziko / FX",
  regulatory: "Regulace",
  risk_events: "Riziková témata",
};

export type PulseTrendDirection = "up" | "down" | "flat";

export type PulseTrend = {
  timeframe: PulseTimeframe;
  available: boolean;
  direction: PulseTrendDirection | null;
  changePercent: number | null;
  changeAbsolute: number | null;
  startValue: number | null;
  endValue: number | null;
  unit: string;
  claimKind: ClaimKind;
  status: DataStatus;
  unavailableReason: string | null;
};

export type PulseInsight = {
  id: string;
  metricKind: PulseMetricKind;
  timeframe: PulseTimeframe;
  text: string;
  claimKind: ClaimKind;
  status: DataStatus;
};

export type PulseMetricCard = {
  kind: PulseMetricKind;
  label: string;
  currentValue: number | null;
  currentLabel: string | null;
  record: DataRecord | null;
  trends: PulseTrend[];
  insights: PulseInsight[];
  reliabilityNote: string | null;
};

export type RegulatoryChangelogEntry = {
  id: string;
  countryId: CountryId | "multi";
  effectiveDate: string;
  title: string;
  summary: string;
  source: string;
  sourceUrl: string | null;
  status: DataStatus;
  claimKind: ClaimKind;
};

export type OpportunityRadarCriteria = {
  minYieldPercent: number;
  minPriceDropPercent: number;
  maxMarketRiskScore: number;
  maxCashRequiredCzk: number;
};

export type OpportunityRadarAlert = {
  id: string;
  countryId: CountryId;
  marketName: string;
  matchedCriteria: string[];
  headline: string;
  body: string;
  claimKind: ClaimKind;
  /** Explicit disclaimer — not an investment recommendation */
  disclaimer: string;
};

export type MarketPulseMarket = {
  countryId: CountryId;
  name: string;
  dataStatus: DataStatus;
  metrics: PulseMetricCard[];
  topInsights: PulseInsight[];
};

export type MarketPulseDashboard = {
  generatedAt: string;
  selectedMarket: CountryId;
  markets: MarketPulseMarket[];
  regulatoryChangelog: RegulatoryChangelogEntry[];
  opportunityRadar: {
    criteria: OpportunityRadarCriteria;
    alerts: OpportunityRadarAlert[];
    disclaimer: string;
  };
  methodology: string[];
};

export const DEFAULT_OPPORTUNITY_CRITERIA: OpportunityRadarCriteria = {
  minYieldPercent: 5,
  minPriceDropPercent: 0,
  maxMarketRiskScore: 60,
  maxCashRequiredCzk: 1_500_000,
};

export function defaultOpportunityCriteria(
  partial?: Partial<OpportunityRadarCriteria>
): OpportunityRadarCriteria {
  return { ...DEFAULT_OPPORTUNITY_CRITERIA, ...partial };
}
