/**
 * Komplexní Investiční Audit — datové kontrakty pro prémiový 30Y report.
 * MODEL výpočty: ne nabídka banky, ne daňové/právní poradenství.
 */

/** Identita a ekonomika nemovitosti + vstupní CAPEX. */
export type PropertyInput = {
  /** Volitelný interní / objednávkový identifikátor */
  reportId?: string;
  label?: string;
  city?: string;
  district?: string;
  propertyType?: "Byt" | "Dům" | "Komerce" | "Other";
  areaM2?: number;
  /** Kupní cena (bez CAPEX) */
  purchasePriceCzk: number;
  /** Jednorázový CAPEX při pořízení (rekonstrukce, vybavení) */
  capexCzk: number;
  /** Kolkovné, provize, právní — připočteno k „skutečné ceně dealu“ */
  closingCostsCzk: number;
  /** Hrubý měsíční nájem v roce 1 (před neobsazeností) */
  monthlyGrossRentCzk: number;
  /** Měsíční provoz rok 1: SVJ + pojištění + běžná údržba (bez splátky) */
  monthlyOperatingCostsCzk: number;
  /** Měsíční fond oprav / rezervy rok 1 */
  monthlyReserveCzk: number;
  /** Neobsazenost 0–1 (0.05 = 5 %) */
  vacancyRate: number;
};

/** Hypoteční předpoklady. Sazby vždy jako % p.a. (5 = 5 %). */
export type MortgageAssumptions = {
  /** Vlastní kapitál (equity) */
  ownFundsCzk: number;
  /** Explicitní výše úvěru; pokud chybí → purchasePrice − ownFunds */
  loanAmountCzk?: number;
  annualRatePercent: number;
  /** Celková splatnost v letech (typicky 30) */
  termYears: number;
  /** Délka fixace v letech — shock se aplikuje po jejím konci */
  fixationYears: number;
};

/** Tržní / makro předpoklady modelu. */
export type MarketAssumptions = {
  /** Růst nájemného p.a. (např. 0.03 = 3 %) */
  rentGrowthPa: number;
  /** Růst provozních nákladů p.a. (např. 0.04 = 4 %) */
  opexGrowthPa: number;
  /** Růst tržní hodnoty nemovitosti p.a. */
  propertyAppreciationPa: number;
  /** Alternativa kapitálu — S&P 500 (default 0.08) */
  sp500ReturnPa: number;
  /** Horizont reportu v letech (default 30) */
  projectionYears: number;
  /** Modelové sazby úrokového šoku po konci fixace */
  rateShockPercents: readonly number[];
};

export type PremiumRentgenAuditInput = {
  property: PropertyInput;
  mortgage: MortgageAssumptions;
  market: MarketAssumptions;
};

/** Jeden rok 30Y cash-flow smyčky. */
export type YearlyCashFlow = {
  year: number;
  /** Tržní hodnota nemovitosti na konci roku */
  propertyValueCzk: number;
  /** Zůstatek jistiny na konci roku */
  loanBalanceEndCzk: number;
  /** Anuitní měsíční splátka platná v daném roce */
  monthlyPaymentCzk: number;
  annualDebtServiceCzk: number;
  annualInterestPaidCzk: number;
  annualPrincipalPaidCzk: number;
  /** Efektivní roční nájem po vacancy */
  annualEffectiveRentCzk: number;
  annualOperatingCostsCzk: number;
  annualReserveCzk: number;
  /** Nájem − provoz − rezervy − dluhová služba */
  annualNetCashFlowCzk: number;
  /** Equity = hodnota − zůstatek úvěru */
  equityCzk: number;
  /** Modelová sazba % p.a. použitá pro anuitu v tomto roce */
  appliedRatePercent: number;
};

export type RateShockScenario = {
  shockRatePercent: number;
  /** Měsíční splátka po refixaci (rok fixationYears+1) */
  monthlyPaymentAfterShockCzk: number;
  /** Meziroční změna splátky vs. původní anuita */
  monthlyPaymentDeltaCzk: number;
  annualDebtServiceAfterShockCzk: number;
  /** Čisté CF v prvním roce po šoku (stejný nájem/opex jako base v tom roce) */
  annualNetCashFlowYearAfterShockCzk: number;
  /** Zůstatek jistiny v okamžiku šoku (konec fixace) */
  loanBalanceAtShockCzk: number;
  remainingTermYearsAtShock: number;
};

export type StressTestResults = {
  fixationYears: number;
  baseMonthlyPaymentCzk: number;
  /** Šoky modelované na začátku roku (fixationYears + 1) */
  scenarios: RateShockScenario[];
};

export type WealthCreationPoint = {
  year: number;
  propertyEquityCzk: number;
  /** Stejný počáteční equity složeně v S&P */
  sp500ValueCzk: number;
  /** propertyEquity − sp500 */
  leverageAdvantageCzk: number;
  /** (propertyEquity / initialEquity) − 1 */
  propertyEquityMultiple: number;
  sp500Multiple: number;
};

export type WealthCreationProjection = {
  initialEquityCzk: number;
  sp500ReturnPa: number;
  propertyAppreciationPa: number;
  points: WealthCreationPoint[];
  /** Shrnutí na konci horizontu */
  terminal: WealthCreationPoint;
};

export type PremiumRentgenAuditSummary = {
  purchasePriceCzk: number;
  totalDealCostCzk: number;
  loanAmountCzk: number;
  initialEquityCzk: number;
  ltvPercent: number;
  baseMonthlyPaymentCzk: number;
  year1NetCashFlowCzk: number;
  year1NetYieldOnDealPct: number;
  year1CashOnCashPct: number | null;
};

export type PremiumRentgenAuditResult = {
  generatedAt: string;
  disclaimer: string;
  input: PremiumRentgenAuditInput;
  summary: PremiumRentgenAuditSummary;
  yearlyCashFlows: YearlyCashFlow[];
  stressTests: StressTestResults;
  wealthCreation: WealthCreationProjection;
};

export const PREMIUM_RENTGEN_DISCLAIMER =
  "Komplexní Investiční Audit je modelový výstup Hypotéka Jasně. Nejde o nabídku banky, daňové ani právní poradenství ani o záruku výnosu. Finální podmínky vždy stanoví věřitel a odborní poradci.";

export const DEFAULT_MARKET_ASSUMPTIONS: MarketAssumptions = {
  rentGrowthPa: 0.03,
  opexGrowthPa: 0.04,
  propertyAppreciationPa: 0.03,
  sp500ReturnPa: 0.08,
  projectionYears: 30,
  rateShockPercents: [7, 9],
};
