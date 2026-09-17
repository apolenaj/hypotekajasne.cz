/**
 * Investiční rentgen — typy a provenance claimů.
 * Nevymýšlíme právní/technická fakta bez zdroje.
 */

export type ClaimKind = "DATA" | "MODEL" | "ODHAD" | "NEOVERENO";

/** Jak vznikl obsah sekce — neplést s ClaimKind. */
export type AnalysisMethod =
  | "automated_calculation"
  | "ai_analysis"
  | "human_verification";

export const ANALYSIS_METHOD_LABELS: Record<AnalysisMethod, string> = {
  automated_calculation: "Automatizovaný výpočet",
  ai_analysis: "AI analýza",
  human_verification: "Lidská verifikace",
};

export const ANALYSIS_METHOD_DESCRIPTIONS: Record<AnalysisMethod, string> = {
  automated_calculation:
    "Výpočet z vašich vstupů a zveřejněných předpokladů modelu.",
  ai_analysis:
    "Text nebo syntéza generovaná AI — vždy s limitem kvality dat.",
  human_verification:
    "Kontrola specialistou — jen pokud výstup skutečně prošel člověkem.",
};

export const CLAIM_KIND_LABELS: Record<ClaimKind, string> = {
  DATA: "Zadáno klientem",
  MODEL: "Vypočteno",
  ODHAD: "Modelový předpoklad",
  NEOVERENO: "Neověřeno",
};

export const CLAIM_KIND_DESCRIPTIONS: Record<ClaimKind, string> = {
  DATA: "Údaj, který jste zadali. Automaticky ho neoznačujeme jako ověřený ze zdroje.",
  MODEL: "Výsledek výpočtu z vašich vstupů a předpokladů modelu.",
  ODHAD: "Modelový předpoklad platformy — vyžaduje ověření na konkrétní nemovitosti.",
  NEOVERENO: "Bez doloženého zdroje — nezobrazujeme jako ověřený fakt.",
};

export type ClaimedValue<T = number | string | null> = {
  value: T;
  kind: ClaimKind;
  note?: string;
};

export type RentgenInputMode = "url" | "manual" | "upload";

export type ManualPropertyInput = {
  country: string;
  city: string;
  propertyType: "Byt" | "Dům" | "Komerce" | "";
  areaM2: number | null;
  priceCzk: number | null;
  rentMonthlyCzk: number | null;
  /** Vlastní část kupní ceny (ne celková hotovost včetně rezerv). */
  equityCzk: number | null;
  /** Volitelná sazba úvěru (% p.a.) — pokud chybí, použije se modelový předpoklad. */
  annualRatePercent: number | null;
  /** Volitelná splatnost (roky) — pokud chybí, použije se modelový předpoklad. */
  termYears: number | null;
  purpose: "investment" | "own_use" | "";
  listingUrl: string;
};

export type FreePreviewResult = {
  generatedAt: string;
  inputMode: RentgenInputMode;
  orientationalYieldPa: ClaimedValue<number | null>;
  pricePerM2: ClaimedValue<number | null>;
  marketComparison: MarketComparisonSnapshot | null;
  modelCashFlow: ModelCashFlowSnapshot | null;
  financingFit: ClaimedValue<string>;
  warningSignals: WarningSignal[];
  /** @deprecated alias — use warningSignals */
  redFlags: WarningSignal[];
  dataQuality: DataQualityIndicator;
  limitations: string[];
};

export type MarketComparisonSnapshot = {
  city: string;
  hasMarketData: boolean;
  propertyPricePerM2: ClaimedValue<number | null>;
  marketReferencePerM2: ClaimedValue<number | null>;
  deltaPercent: ClaimedValue<number | null>;
  marketYieldPa: ClaimedValue<number | null>;
  summary: string;
  kind: ClaimKind;
};

export type ModelCashFlowSnapshot = {
  monthlyRent: ClaimedValue<number | null>;
  monthlyMortgageModel: ClaimedValue<number | null>;
  monthlyOpsModel: ClaimedValue<number | null>;
  netMonthlyModel: ClaimedValue<number | null>;
  modelRatePercent: number;
  note: string;
};

export type WarningSignal = {
  id: string;
  text: string;
  kind: ClaimKind;
  severity: "info" | "watch" | "alert";
};

export type DataQualityIndicator = {
  score: number;
  band: "high" | "medium" | "low" | "insufficient";
  label: string;
  filledFields: string[];
  missingFields: string[];
  note: string;
};

export const SAMPLE_REPORT_SECTION_IDS = [
  "executive_summary",
  "property_overview",
  "market_comparison",
  "price_analysis",
  "rental_model",
  "cash_flow_scenarios",
  "financing_scenarios",
  "stress_test",
  "liquidity_risk",
  "legal_document_checklist",
  "red_flags",
  "data_quality",
  "final_decision_framework",
] as const;

export type SampleReportSectionId = (typeof SAMPLE_REPORT_SECTION_IDS)[number];

export type SampleReportSection = {
  id: SampleReportSectionId;
  title: string;
  method: AnalysisMethod;
  methodNote: string;
  tier: "free" | "premium";
  claimKind: ClaimKind;
  summary: string;
  bullets: string[];
  metrics?: DemoReportMetric[];
};

export type SampleReport = {
  id: string;
  title: string;
  subtitle: string;
  disclaimer: string;
  isDemo: true;
  sections: SampleReportSection[];
  /** Flat metrics grid for compact demo view */
  metrics: DemoReportMetric[];
  warningSignals: WarningSignal[];
  financingFit: ClaimedValue<string>;
};

export type DemoReportMetric = {
  id: string;
  label: string;
  display: string;
  kind: ClaimKind;
  note?: string;
};

export type DemoReport = SampleReport;
