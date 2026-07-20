/**
 * Financial Passport — centrální digitální finančně-realitní profil.
 * Žádné PII. Čísla = MODEL / ODHAD, ne schválení banky.
 */

export type ClaimKind = "DATA" | "MODEL" | "ODHAD" | "NEOVERENO";

export type HouseholdType =
  | "single"
  | "couple"
  | "family"
  | "other"
  | "unknown";

export type ResidencyStatus =
  | "cz_resident"
  | "cz_non_resident"
  | "eu_other"
  | "other"
  | "unknown";

export type AgeRangeId =
  | "18-29"
  | "30-39"
  | "40-49"
  | "50-59"
  | "60+"
  | "unknown";

export const SCORE_DIMENSIONS = [
  "income_stability",
  "liquidity",
  "debt_load",
  "equity",
  "affordability",
  "resilience",
  "documentation_readiness",
] as const;

export type ScoreDimensionId = (typeof SCORE_DIMENSIONS)[number];

export const SCORE_DIMENSION_LABELS: Record<ScoreDimensionId, string> = {
  income_stability: "Stabilita příjmu",
  liquidity: "Likvidita",
  debt_load: "Dluhová zátěž",
  equity: "Vlastní kapitál",
  affordability: "Dostupnost",
  resilience: "Odolnost",
  documentation_readiness: "Připravenost dokumentace",
};

/** Váhy dimenzí — součet 1.0 */
export const SCORE_DIMENSION_WEIGHTS: Record<ScoreDimensionId, number> = {
  income_stability: 0.16,
  liquidity: 0.12,
  debt_load: 0.14,
  equity: 0.16,
  affordability: 0.18,
  resilience: 0.12,
  documentation_readiness: 0.12,
};

export type DimensionScore = {
  id: ScoreDimensionId;
  label: string;
  score: number;
  weight: number;
  weighted: number;
  explanation: string;
  claimKind: ClaimKind;
};

export type PassportIdentity = {
  householdType: HouseholdType;
  ageRange: AgeRangeId;
  age: number | null;
  residency: ResidencyStatus;
  country: string | null;
  goals: string[];
  coApplicant: boolean;
  dependents: number;
};

export type PassportIncome = {
  primaryType: string | null;
  netIncome: number;
  secondaryIncome: number;
  totalNetIncome: number;
  stabilityLabel: string;
  stabilityScore: number;
  employmentMonths: number | null;
  claimKind: ClaimKind;
};

export type PassportLiabilities = {
  mortgagePayment: number;
  consumerLoans: number;
  creditCardLimits: number;
  leases: number;
  other: number;
  totalMonthly: number;
  claimKind: ClaimKind;
};

export type PassportAssets = {
  cash: number;
  investments: number;
  existingPropertyEquity: number;
  availableCollateral: number;
  totalLiquidish: number;
  totalOwnFundsModel: number;
  claimKind: ClaimKind;
};

export type PassportPropertyGoals = {
  purpose:
    | "owner_occupied"
    | "investment"
    | "refinance"
    | "foreign_purchase"
    | "unknown";
  purposeLabel: string;
  targetPrice: number | null;
  targetCountry: string | null;
};

export type PassportFinancing = {
  estimatedMaximum: number | null;
  recommendedMaximum: number | null;
  conservativeMaximum: number | null;
  safeMonthlyPayment: number | null;
  ownFundsRequirement: number | null;
  modelRatePercent: number;
  claimKind: ClaimKind;
  disclaimer: string;
};

export type PassportRisk = {
  liquidityReserveMonths: number | null;
  debtBurdenRatio: number | null;
  rateSensitivityDelta: number | null;
  incomeConcentration: "low" | "medium" | "high" | "unknown";
  currencyRisk: "low" | "medium" | "high" | "n/a";
  flags: string[];
  claimKind: ClaimKind;
};

export type PassportReadiness = {
  overall: number;
  dimensions: DimensionScore[];
  band: string;
  financingStatus:
    | "exploratory"
    | "needs_work"
    | "ready_to_explore"
    | "ready_to_apply_prep"
    | "unknown";
  topLevers: ScoreLever[];
  claimKind: ClaimKind;
};

export type ScoreLever = {
  id: string;
  title: string;
  estimatedGain: number;
  rationale: string;
  simulationId: SimulationId | null;
};

export type SimulationId =
  | "pay_off_loan"
  | "increase_equity"
  | "increase_income"
  | "cut_credit_limit"
  | "cheaper_property";

export type SimulationDef = {
  id: SimulationId;
  label: string;
  description: string;
  /** Default delta for UI slider / button */
  defaultAmount: number;
};

export const SIMULATIONS: SimulationDef[] = [
  {
    id: "pay_off_loan",
    label: "Splatím půjčku",
    description: "Odstraní modelové měsíční splátky spotřebitelských úvěrů.",
    defaultAmount: 0,
  },
  {
    id: "increase_equity",
    label: "Zvýším vlastní zdroje",
    description: "Přidá hotovost / akontaci do modelu.",
    defaultAmount: 300_000,
  },
  {
    id: "increase_income",
    label: "Zvýší se příjem",
    description: "Navýší čistý měsíční příjem v modelu.",
    defaultAmount: 5_000,
  },
  {
    id: "cut_credit_limit",
    label: "Snížím kreditní limit",
    description: "Sníží modelovou zátěž z kreditních limitů.",
    defaultAmount: 2_000,
  },
  {
    id: "cheaper_property",
    label: "Koupím levnější nemovitost",
    description: "Sníží cílovou cenu v modelu.",
    defaultAmount: 500_000,
  },
];

export type TimelineEntry = {
  id: string;
  at: string;
  scoreFrom: number;
  scoreTo: number;
  reasons: string[];
  dimensionDeltas: Partial<Record<ScoreDimensionId, number>>;
};

/**
 * Rozšířený profil — zpětně kompatibilní s ReadinessAnswers.
 * Nová pole jsou volitelná (default 0 / unknown).
 */
export type FinancialProfileAnswers = {
  intent:
    | "owner_occupied"
    | "investment"
    | "refinance"
    | "foreign_purchase"
    | null;
  age: number | null;
  coApplicant: boolean;
  dependents: number;
  incomeType:
    | "employee"
    | "osvc_pausal"
    | "osvc_evidence"
    | "sro"
    | "rental"
    | "other"
    | null;
  netIncome: number;
  secondaryIncome: number;
  otherLiabilities: number;
  /** Měsíční splátky spotřebitelských úvěrů */
  consumerLoanPayments: number;
  /** Měsíční leasingy */
  leasePayments: number;
  /** Měsíční splátka stávající hypotéky (např. při refinance / druhé) */
  mortgagePayment: number;
  creditLimitPayments: number;
  ownFunds: number;
  investmentAssets: number;
  existingPropertyEquity: number;
  targetPrice: number | null;
  targetCountry: string | null;
  currentBalance: number | null;
  currentRate: number | null;
  yearsLeft: number | null;
  hasCzCollateral: boolean;
  czCollateralEquity: number;
  employmentMonths: number | null;
  noRecentDefaults: boolean | null;
  householdType: HouseholdType;
  residency: ResidencyStatus;
};

export type FinancialPassportDocument = {
  version: 2;
  updatedAt: string;
  identity: PassportIdentity;
  income: PassportIncome;
  liabilities: PassportLiabilities;
  assets: PassportAssets;
  propertyGoals: PassportPropertyGoals;
  financing: PassportFinancing;
  risk: PassportRisk;
  readiness: PassportReadiness;
  strengths: string[];
  obstacles: string[];
  improvements: string[];
  claimNote: string;
};

export const PASSPORT_CLAIM_NOTE =
  "Financial Passport je algoritmický orientační model HypotékaJasně — ne schválení úvěru ani regulované osobní doporučení. Finální posouzení provádí banka / licencovaný partner.";
