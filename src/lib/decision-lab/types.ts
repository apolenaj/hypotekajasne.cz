/**
 * Decision Lab — společná rodina nástrojů (Buy vs Rent, Historie, Future).
 */

export type DecisionLabToolId =
  | "buy_vs_rent"
  | "historical"
  | "future";

export type ChartMeta = {
  title: string;
  methodology: string;
  source: string;
  sourceUrl: string | null;
  statusNote: string;
};

export type HistoricalAssetId =
  | "cash"
  | "savings"
  | "term_deposit"
  | "equity_benchmark"
  | "property_cash"
  | "property_leveraged";

export const HISTORICAL_ASSET_LABELS: Record<HistoricalAssetId, string> = {
  cash: "Hotovost (bez úroku)",
  savings: "Spořicí produkt",
  term_deposit: "Termínovaný vklad",
  equity_benchmark: "Široký akciový benchmark",
  property_cash: "Nemovitost — cash",
  property_leveraged: "Nemovitost — s pákou",
};

/** Modelované výchozí výnosy historického stroje (ne live sazby). */
export const HISTORICAL_ASSET_DEFAULT_RETURNS: Record<
  Exclude<HistoricalAssetId, "cash" | "property_cash" | "property_leveraged">,
  number
> = {
  savings: 0.02,
  term_deposit: 0.025,
  equity_benchmark: 0.07,
};

export type FutureScenarioId = "bear" | "base" | "bull" | "custom";
