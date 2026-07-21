/**
 * MortgageProduct — kanonický produktový model.
 * Nevymýšlej sazby ani RPSN; null = chybí ověřený údaj.
 */

export type MortgageProductStatus =
  | "LIVE"
  | "VERIFIED"
  | "MODEL"
  | "PARTNER_QUOTE"
  | "STALE";

export type MortgageSourceType =
  | "official_bank"
  | "aggregator"
  | "insider"
  | "partner"
  | "unknown";

export type MortgageProductType =
  | "classic"
  | "american"
  | "refi"
  | "other";

export type MortgagePurpose =
  | "owner_occupied"
  | "investment"
  | "any"
  | "unsecured_equity";

export type MortgageFee = {
  code: string;
  label: string;
  amount: number | null;
  currency: string | null;
  unit: "fixed" | "percent" | "unknown";
  notes: string | null;
};

export type MortgageProduct = {
  id: string;
  country: string;
  lender: string;
  productName: string;
  productType: MortgageProductType;
  purpose: MortgagePurpose;
  residency: string;
  currency: string;
  rateType: "fixed" | "variable" | "mixed" | "unknown";
  fixation: number | null;
  ltvMin: number | null;
  ltvMax: number | null;
  loanAmountMin: number | null;
  loanAmountMax: number | null;
  termMin: number | null;
  termMax: number | null;
  /** Nominální sazba od (% p.a.) — null pokud neověřeno */
  nominalRateFrom: number | null;
  /**
   * Reprezentativní RPSN banky — jen se representativeExample,
   * nebo null. Nikdy univerzální RPSN pro všechny klienty.
   */
  representativeAPR: number | null;
  representativeExample: string | null;
  requiredAccount: boolean | null;
  requiredInsurance: boolean | null;
  fees: MortgageFee[];
  sourceUrl: string | null;
  sourceType: MortgageSourceType;
  validFrom: string | null;
  scrapedAt: string | null;
  verifiedAt: string | null;
  status: MortgageProductStatus;
  confidence: number;
  rawSnapshotHash: string;
};

export type RawMortgageIngest = {
  lender: string;
  sourceUrl: string | null;
  sourceType: MortgageSourceType;
  scrapedAt: string;
  /** Původní scrapovaná data — žádná inventura */
  payload: Record<string, unknown>;
};

export type AnomalyFlag = {
  code:
    | "RATE_JUMP"
    | "RATE_DROP"
    | "APR_WITHOUT_EXAMPLE"
    | "APR_BELOW_NOMINAL"
    | "MISSING_RATE"
    | "PRODUCT_DISAPPEARED"
    | "INVALID_RANGE"
    | "HASH_UNCHANGED";
  severity: "info" | "warning" | "critical";
  message: string;
  details?: Record<string, unknown>;
};

export type ValidationIssue = {
  field: string;
  message: string;
  severity: "error" | "warning";
};

export type StagingReviewStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "auto_published"
  | "blocked";

export type PipelineStage =
  | "RAW_INGEST"
  | "NORMALIZE"
  | "VALIDATE"
  | "ANOMALY_CHECK"
  | "STAGING"
  | "PUBLISH"
  | "HISTORY";

export type PipelineRunStats = {
  rawCount: number;
  normalizedCount: number;
  validCount: number;
  invalidCount: number;
  anomalyBlocked: number;
  autoPublished: number;
  stagedForReview: number;
  disappeared: number;
  historyWritten: number;
};

export const EMPTY_PIPELINE_STATS: PipelineRunStats = {
  rawCount: 0,
  normalizedCount: 0,
  validCount: 0,
  invalidCount: 0,
  anomalyBlocked: 0,
  autoPublished: 0,
  stagedForReview: 0,
  disappeared: 0,
  historyWritten: 0,
};

/** Absolutní změna sazby (p.b.), nad kterou blokujeme auto-publish. */
export const RATE_JUMP_ABS_PP = 0.5;
/** Relativní změna sazby, nad kterou blokujeme auto-publish. */
export const RATE_JUMP_REL = 0.15;
