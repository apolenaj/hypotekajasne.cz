/**
 * Jednotný model financování — nesmí zaměňovat produkty.
 * Nikdy nevymýšlí dostupnost ani sazbu bez zdroje.
 */

import type { CountryId, CurrencyCode } from "@/lib/calculators";

export const FINANCING_OPTION_IDS = [
  "LOCAL_MORTGAGE",
  "CZECH_EQUITY_LOAN",
  "DEVELOPER_PAYMENT_PLAN",
  "CASH",
  "PRIVATE_FINANCE",
  "UNAVAILABLE",
] as const;

export type FinancingOptionId = (typeof FINANCING_OPTION_IDS)[number];

export const FINANCING_OPTION_LABELS: Record<FinancingOptionId, string> = {
  LOCAL_MORTGAGE: "Lokální bankovní hypotéka",
  CZECH_EQUITY_LOAN: "České zajištěné financování (americká hypotéka)",
  DEVELOPER_PAYMENT_PLAN: "Developer payment plan",
  CASH: "Hotovost",
  PRIVATE_FINANCE: "Soukromé financování",
  UNAVAILABLE: "Financování nedostupné v datech",
};

export const LOCAL_FINANCING_UNVERIFIED_MESSAGE =
  "Lokální financování individuálně ověřujeme.";

export type DeveloperPlanPhaseId =
  | "booking"
  | "during_construction"
  | "handover"
  | "post_handover";

export type DeveloperPlanPhase = {
  id: DeveloperPlanPhaseId;
  label: string;
  /** Podíl z kupní ceny — součet fází = 100 */
  percentOfPrice: number;
  /** Počet měsíců rozložení (1 = jednorázově) */
  durationMonths: number;
};

export type RateAvailability = "LIVE" | "VERIFIED" | "UNAVAILABLE";

/**
 * Definice produktu pro zemi.
 * `calculable` = smíme spočítat splátku (máme sazbu / schedule / cash).
 * Bez ověřené sazby u LOCAL_MORTGAGE nikdy nepočítáme anuitu.
 */
export type FinancingProductDefinition = {
  option: FinancingOptionId;
  label: string;
  description: string;
  currency: CurrencyCode;
  /** Max LTV % — null = nestanovujeme (žádné generické 80 %) */
  maxLtvPercent: number | null;
  /** Ověřená sazba — null = nevymýšlíme */
  ratePercentPa: number | null;
  rateAvailability: RateAvailability;
  /** Lze spočítat peněžní výsledek bez vymýšlení */
  calculable: boolean;
  source: string | null;
  /** Jen DEVELOPER_PAYMENT_PLAN */
  developerSchedule?: DeveloperPlanPhase[];
};

export type FinancingCalculationInput = {
  country: CountryId;
  option: FinancingOptionId;
  propertyPrice: number;
  ownFunds: number;
  termYears: number;
  /** Live sazba pro CZECH_EQUITY_LOAN (CZK) — null = Na vyžádání */
  czechEquityRatePercentPa: number | null;
};

export type DeveloperPhaseResult = {
  id: DeveloperPlanPhaseId;
  label: string;
  percentOfPrice: number;
  amount: number;
  durationMonths: number;
  /** Měsíční platba ve fázi; null u jednorázové */
  monthlyPayment: number | null;
};

export type FinancingCalculationResult = {
  option: FinancingOptionId;
  label: string;
  currency: CurrencyCode;
  available: boolean;
  /** false → zobrazit LOCAL_FINANCING_UNVERIFIED_MESSAGE / Na vyžádání */
  calculable: boolean;
  message: string | null;
  propertyPrice: number;
  ownFunds: number;
  /** Částka financovaná produktem (u CASH = 0) */
  financedAmount: number;
  ltv: number | null;
  maxLtvPercent: number | null;
  ltvExceedsMax: boolean;
  ratePercentPa: number | null;
  /** Anuitní / equity splátka — null pokud nepočítáme */
  monthlyPayment: number | null;
  totalPaid: number | null;
  totalInterest: number | null;
  developerPhases: DeveloperPhaseResult[] | null;
  /** Nejvyšší měsíční zátěž ve fázích developer plánu */
  peakMonthlyPayment: number | null;
  disclaimer: string;
};
