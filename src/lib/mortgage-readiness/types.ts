/**
 * Hypoteční připravenost — algoritmický orientační model (ne schválení bankou).
 */

export type MortgageIntent =
  | "owner_occupied"
  | "investment"
  | "refinance"
  | "foreign_purchase";

export const INTENT_OPTIONS: {
  id: MortgageIntent;
  label: string;
  description: string;
}[] = [
  {
    id: "owner_occupied",
    label: "Vlastní bydlení",
    description: "Trvalé bydlení pro sebe / rodinu.",
  },
  {
    id: "investment",
    label: "Investiční nemovitost",
    description: "Pronájem nebo dlouhodobá investice v ČR.",
  },
  {
    id: "refinance",
    label: "Refinancování",
    description: "Převod nebo konsolidace stávající hypotéky.",
  },
  {
    id: "foreign_purchase",
    label: "Koupě v zahraničí",
    description: "Nemovitost mimo ČR — často s českým zajištěním.",
  },
];

export type IncomeTypeId =
  | "employee"
  | "osvc_pausal"
  | "osvc_evidence"
  | "sro"
  | "rental"
  | "other";

export const INCOME_TYPE_OPTIONS: { id: IncomeTypeId; label: string }[] = [
  { id: "employee", label: "Zaměstnanec (HPP)" },
  { id: "osvc_pausal", label: "OSVČ — paušál" },
  { id: "osvc_evidence", label: "OSVČ — daňová evidence" },
  { id: "sro", label: "Příjem ze S.R.O." },
  { id: "rental", label: "Příjmy z nájmu" },
  { id: "other", label: "Jiné" },
];

export type ReadinessAnswers = {
  intent: MortgageIntent | null;
  age: number | null;
  coApplicant: boolean;
  dependents: number;
  incomeType: IncomeTypeId | null;
  netIncome: number;
  otherLiabilities: number;
  creditLimitPayments: number;
  ownFunds: number;
  /** Orientační cílová cena nemovitosti */
  targetPrice: number | null;
  /** Jen foreign_purchase */
  targetCountry: string | null;
  /** Jen refinance */
  currentBalance: number | null;
  currentRate: number | null;
  yearsLeft: number | null;
  hasCzCollateral: boolean;
  czCollateralEquity: number;
  employmentMonths: number | null;
  /** Self-declared — žádná kreditní evidence */
  noRecentDefaults: boolean | null;
};

export const EMPTY_ANSWERS: ReadinessAnswers = {
  intent: null,
  age: null,
  coApplicant: false,
  dependents: 0,
  incomeType: null,
  netIncome: 0,
  otherLiabilities: 0,
  creditLimitPayments: 0,
  ownFunds: 0,
  targetPrice: null,
  targetCountry: null,
  currentBalance: null,
  currentRate: null,
  yearsLeft: null,
  hasCzCollateral: false,
  czCollateralEquity: 0,
  employmentMonths: null,
  noRecentDefaults: null,
};

export type ActionPlan = {
  days30: string[];
  months3: string[];
  months6to12: string[];
};

export type ReadinessResult = {
  score: number;
  strengths: string[];
  obstacles: string[];
  improvements: string[];
  financingRange: { low: number; high: number } | null;
  ownFundsNote: string;
  riskFactors: string[];
  nextSteps: string[];
  actionPlan: ActionPlan;
  modelDisclaimer: string;
};

export const MODEL_DISCLAIMER =
  "Algoritmický orientační model – finální posouzení provádí banka/partner.";

export const FOREIGN_COUNTRY_OPTIONS = [
  "SAE (Dubaj)",
  "Španělsko",
  "Itálie",
  "Chorvatsko",
  "Bali",
  "Saúdská Arábie",
  "Slovensko",
  "Jiné",
] as const;
