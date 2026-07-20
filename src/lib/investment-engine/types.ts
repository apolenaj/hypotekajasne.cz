/**
 * Společný investment calculation engine — čistá matematika, bez UI.
 */

export type ScenarioId = "bear" | "base" | "bull" | "custom";

export type InvestmentEngineInput = {
  purchasePrice: number;
  downPayment: number;
  /** Pokud null, odvodí se jako purchasePrice − downPayment */
  loan: number | null;
  /** Nominální sazba % p.a. — null = bez dluhu / nepočítat anuitu */
  rate: number | null;
  termYears: number;
  /** Hrubý měsíční nájem */
  rentMonthly: number;
  /** Neobsazenost 0–1 (např. 0.05 = 5 %) */
  vacancyRate: number;
  /** Správa jako podíl z efektivního nájmu 0–1 */
  managementFeeRate: number;
  /** Roční service charges */
  serviceChargesAnnual: number;
  insuranceAnnual: number;
  propertyTaxAnnual: number;
  /**
   * Daň z příjmu z nájmu — podíl z (EGI − provoz − správa), 0–1.
   * Aplikuje se před dluhovou službou ve waterfall (zjednodušený assumption).
   */
  incomeTaxRate: number;
  maintenanceAnnual: number;
  capexReserveAnnual: number;
  /** Jednorázové vybavení — součást počátečního equity */
  furnishing: number;
  /** Jednorázové pořizovací náklady (daně, právní, …) */
  acquisitionCosts: number;
  /** Prodejní náklady jako podíl z prodejní ceny 0–1 */
  sellingCostRate: number;
  annualRentGrowth: number;
  annualPropertyGrowth: number;
  /**
   * Roční FX efekt na hodnotu aktiva v domácí měně (např. −0.02 = −2 % p.a.).
   * Aplikuje se na exit cenu: (1+propGrowth)^n × (1+fx)^n
   */
  annualFxReturn: number;
  holdingPeriodYears: number;
};

export type ScenarioAdjustments = {
  vacancyRateDelta: number;
  annualRentGrowthDelta: number;
  annualPropertyGrowthDelta: number;
  annualFxReturnDelta: number;
};

export type WaterfallLine = {
  id:
    | "gross_rent"
    | "vacancy"
    | "effective_rent"
    | "operating"
    | "management"
    | "noi"
    | "income_tax"
    | "debt_service"
    | "net_cash_flow";
  label: string;
  /** Kladné = příjem, záporné = odpočet */
  amount: number;
  runningTotal: number;
};

export type InvestmentEngineResult = {
  scenario: ScenarioId;
  inputApplied: InvestmentEngineInput;
  loanAmount: number;
  initialEquity: number;
  annualDebtService: number;
  monthlyDebtService: number | null;

  /** Year-1 metriky — výnosy jako decimal (0.06 = 6 %) */
  grossYield: number;
  noi: number;
  netYield: number;
  monthlyCashFlow: number;
  annualCashFlow: number;
  /** Annual CF / initial equity (decimal) — null pokud equity = 0 */
  cashOnCashReturn: number | null;
  /** ROE rok 1 = stejný základ jako Cash-on-Cash (decimal) */
  roeYear1: number | null;
  /** DSCR = NOI / annual debt service (např. 1.25) */
  dscr: number | null;
  /** Break-even occupancy 0–1 */
  breakEvenOccupancy: number | null;

  waterfall: WaterfallLine[];

  /** Holding period */
  equityBuildUp: number;
  remainingDebt: number;
  exitSalePrice: number;
  exitProceeds: number;
  totalCashFlowsReceived: number;
  totalReturn: number;
  /** IRR roční (Newton) — null pokud nekonverguje */
  irr: number | null;
  /** XIRR s ročními daty od T0 — null pokud nekonverguje */
  xirr: number | null;

  methodologyNotes: string[];
};

export const SCENARIO_PRESETS: Record<
  Exclude<ScenarioId, "custom">,
  ScenarioAdjustments
> = {
  bear: {
    vacancyRateDelta: 0.03,
    annualRentGrowthDelta: -0.01,
    annualPropertyGrowthDelta: -0.02,
    annualFxReturnDelta: -0.01,
  },
  base: {
    vacancyRateDelta: 0,
    annualRentGrowthDelta: 0,
    annualPropertyGrowthDelta: 0,
    annualFxReturnDelta: 0,
  },
  bull: {
    vacancyRateDelta: -0.02,
    annualRentGrowthDelta: 0.01,
    annualPropertyGrowthDelta: 0.02,
    annualFxReturnDelta: 0.01,
  },
};

export const INVESTMENT_METRIC_TOOLTIPS = {
  grossYield:
    "Hrubý výnos = roční hrubý nájem (12× měsíční) / kupní cena. Neodečítá neobsazenost, provoz ani dluh.",
  noi: "NOI (provozní výsledek, Net Operating Income) = efektivní nájem po neobsazenosti − provozní náklady − správa. Před daní z příjmu a před splátkou úvěru.",
  netYield:
    "Čistý výnos (cap rate styl) = NOI / kupní cena. Nezahrnuje financování.",
  monthlyCashFlow:
    "Měsíční peněžní tok = roční čistý peněžní tok po předpokladu daně a dluhové službě / 12.",
  annualCashFlow:
    "Roční čistý peněžní tok: po neobsazenosti, provozu, správě, dani a dluhové službě.",
  cashOnCashReturn:
    "Výnos vloženého vlastního kapitálu = roční čistý peněžní tok / počáteční vlastní kapitál (akontace + pořizovací náklady + vybavení). Nejde o „ROI“ z hrubého nájmu.",
  roe: "ROE (rok 1) = roční čistý peněžní tok / počáteční vlastní kapitál. Stejný základ jako výnos vloženého kapitálu v roce 1.",
  dscr: "DSCR (krytí dluhové služby) = NOI / roční dluhová služba. Pod 1,0 znamená, že provozní výsledek nepokrývá splátky.",
  breakEvenOccupancy:
    "Minimální potřebná obsazenost = (provoz + správa + dluhová služba) / hrubý roční nájem. Minimální obsazenost k pokrytí těchto položek (před daní z příjmu).",
  irr: "IRR (vnitřní výnosové procento) = výnos z počátečního vlastního kapitálu, ročních peněžních toků a výnosu z prodeje za dobu držení.",
  xirr: "XIRR = IRR s explicitními ročními daty peněžních toků (stejný model, jiná numerická cesta).",
  equityBuildUp:
    "Nárůst vlastního kapitálu = jistina splacená během doby držení (počáteční úvěr − zůstatek).",
  remainingDebt: "Zůstatek úvěru po době držení při anuitním splácení.",
  exitProceeds:
    "Výnos z prodeje = prodejní cena po nákladech prodeje − zůstatek dluhu. Prodejní cena = cena × (1+růst)^n × (1+FX)^n.",
  totalReturn:
    "Celkový výnos = součet ročních peněžních toků za dobu držení + výnos z prodeje − počáteční vlastní kapitál.",
} as const;
