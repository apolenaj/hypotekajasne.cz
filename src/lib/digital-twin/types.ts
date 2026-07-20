/**
 * Property Digital Twin — architecture-first type system.
 *
 * Long-lived digital profile for owned OR watched properties.
 * Never persist “current market value” without a ValueObservation with
 * source + method + confidence + date.
 */

import type { ClaimKind } from "@/lib/property-rentgen/types";

export const DIGITAL_TWIN_FEATURE_STATUS = "COMING_SOON" as const;
export const DIGITAL_TWIN_STORAGE_KEY = "hj-digital-twin-v1";
export const MAX_TWINS = 25;
export const MAX_VALUE_OBSERVATIONS = 120;
export const MAX_TIMELINE_EVENTS = 200;

/** owned = user marked as holding; watched = Smart Watchlist only */
export type TwinRelationship = "owned" | "watched" | "under_contract" | "sold";

export type ValueObservationSource =
  | "user_entered"
  | "purchase_deed"
  | "bank_appraisal"
  | "majetio_listing"
  | "cnb_index"
  | "tax_assessment"
  | "partner_feed";

export type ValueObservationMethod =
  | "manual"
  | "comparable_sales"
  | "hedonic_model"
  | "index_rebase"
  | "listing_ask"
  | "bank_valuation";

export type ConfidenceLevel = "high" | "medium" | "low" | "unverified";

/**
 * Every estimated value MUST carry provenance.
 * UI must not collapse this into a single “aktuální cena” without showing meta.
 */
export type EstimatedValueObservation = {
  id: string;
  /** When the estimate was valid / observed (ISO) */
  observedAt: string;
  valueCzk: number;
  source: ValueObservationSource;
  method: ValueObservationMethod;
  confidence: ConfidenceLevel;
  claimKind: ClaimKind;
  note?: string;
  /** External ref — Majetio listing id, appraisal id, … */
  externalRef?: string | null;
};

export type PurchaseData = {
  purchasePriceCzk: number | null;
  purchaseDate: string | null;
  acquisitionCostsCzk: number | null;
  currency: "CZK";
  claimKind: ClaimKind;
};

export type FinancingSnapshot = {
  loanAmountCzk: number | null;
  ratePercent: number | null;
  termYears: number | null;
  fixationEnd: string | null;
  lenderLabel: string | null;
  monthlyPaymentCzk: number | null;
  claimKind: ClaimKind;
  updatedAt: string | null;
};

export type MortgageBalanceObservation = {
  id: string;
  asOf: string;
  balanceCzk: number;
  source: "user_entered" | "bank_statement" | "amortization_model";
  claimKind: ClaimKind;
};

export type RentObservation = {
  id: string;
  effectiveFrom: string;
  rentMonthlyCzk: number;
  /** ISO 4217 — příjem v jiné měně pro exposure */
  currencyCode?: string | null;
  tenantLabel?: string | null;
  claimKind: ClaimKind;
};

export type OccupancyPeriod = {
  id: string;
  from: string;
  to: string | null;
  occupancyRate: number;
  claimKind: ClaimKind;
};

export type ExpenseRecord = {
  id: string;
  date: string;
  category:
    | "management"
    | "insurance"
    | "tax"
    | "utilities"
    | "hoa"
    | "other";
  amountCzk: number;
  note?: string;
  claimKind: ClaimKind;
};

export type RepairEvent = {
  id: string;
  date: string;
  description: string;
  costCzk: number;
  claimKind: ClaimKind;
};

export type RenovationProject = {
  id: string;
  startedAt: string | null;
  completedAt: string | null;
  budgetCzk: number | null;
  spentCzk: number | null;
  scope: string;
  claimKind: ClaimKind;
};

export type DocumentRef = {
  id: string;
  label: string;
  category: "legal" | "technical" | "financial" | "insurance" | "other";
  /** URI or local ref — no fabricated document contents */
  ref: string | null;
  uploadedAt: string | null;
  claimKind: ClaimKind;
};

export type InsurancePolicy = {
  id: string;
  provider: string | null;
  premiumAnnualCzk: number | null;
  renewalDate: string | null;
  claimKind: ClaimKind;
};

export type TaxReminder = {
  id: string;
  label: string;
  dueDate: string;
  status: "upcoming" | "done" | "skipped";
  claimKind: ClaimKind;
};

export type EnergyDataPoint = {
  id: string;
  period: string;
  kwh: number | null;
  costCzk: number | null;
  claimKind: ClaimKind;
};

export type PropertyManagerRef = {
  name: string | null;
  contact: string | null;
  claimKind: ClaimKind;
};

export type KeyDate = {
  id: string;
  kind:
    | "fixation_end"
    | "lease_end"
    | "insurance_renewal"
    | "tax_deadline"
    | "inspection"
    | "custom";
  date: string;
  label: string;
  claimKind: ClaimKind;
};

export type TwinTimelineEventKind =
  | "purchased"
  | "renovated"
  | "tenant_changed"
  | "rent_increased"
  | "refinanced"
  | "value_estimated"
  | "expense_recorded"
  | "document_added"
  | "insurance_renewed"
  | "occupancy_changed"
  | "relationship_changed";

export type TwinTimelineEvent = {
  id: string;
  at: string;
  kind: TwinTimelineEventKind;
  title: string;
  summary: string;
  claimKind: ClaimKind;
  /** Link to domain record that caused the event */
  refId?: string | null;
  payload?: Record<string, string | number | null>;
};

export type PropertyDigitalTwin = {
  version: 1;
  id: string;
  label: string;
  relationship: TwinRelationship;
  createdAt: string;
  updatedAt: string;

  /** Links — at least one should exist when integrated */
  watchTargetId: string | null;
  majetioListingId: string | null;

  location: {
    country: string | null;
    city: string | null;
    areaM2: number | null;
    propertyType: string | null;
    /** ISO 4217 — pro currency exposure (default CZK) */
    currencyCode: string | null;
  };

  purchase: PurchaseData;
  financing: FinancingSnapshot;
  mortgageBalanceHistory: MortgageBalanceObservation[];
  valueHistory: EstimatedValueObservation[];
  rentHistory: RentObservation[];
  occupancy: OccupancyPeriod[];
  expenses: ExpenseRecord[];
  repairs: RepairEvent[];
  renovations: RenovationProject[];
  documents: DocumentRef[];
  insurance: InsurancePolicy[];
  taxReminders: TaxReminder[];
  energy: EnergyDataPoint[];
  propertyManager: PropertyManagerRef | null;
  keyDates: KeyDate[];
  timeline: TwinTimelineEvent[];
};

/** Derived metrics — recalculated on read, never stored as ground truth */
export type ComputedMetric<T = number> = {
  value: T | null;
  claimKind: ClaimKind;
  computedAt: string;
  formula: string;
  inputsUsed: string[];
  blockers: string[];
};

export type RefinanceOpportunitySignal = {
  eligible: boolean;
  claimKind: ClaimKind;
  summary: string;
  fixationEnd: string | null;
  rateDeltaPp: number | null;
  estimatedMonthlySavingCzk: number | null;
  blockers: string[];
};

export type TwinComputedSnapshot = {
  twinId: string;
  computedAt: string;
  currentEquity: ComputedMetric;
  estimatedLtv: ComputedMetric;
  cashOnCashReturn: ComputedMetric;
  annualizedReturn: ComputedMetric;
  rentGrowthYoy: ComputedMetric;
  maintenanceBurden: ComputedMetric;
  refinanceOpportunity: RefinanceOpportunitySignal;
  /** Latest value observation used — null if none valid */
  latestValueObservation: EstimatedValueObservation | null;
};

export type DigitalTwinStore = {
  version: 1;
  twins: PropertyDigitalTwin[];
};

export function emptyTwin(
  partial: Pick<PropertyDigitalTwin, "id" | "label" | "relationship"> &
    Partial<PropertyDigitalTwin>
): PropertyDigitalTwin {
  const now = new Date().toISOString();
  return {
    version: 1,
    id: partial.id,
    label: partial.label,
    relationship: partial.relationship,
    createdAt: partial.createdAt ?? now,
    updatedAt: partial.updatedAt ?? now,
    watchTargetId: partial.watchTargetId ?? null,
    majetioListingId: partial.majetioListingId ?? null,
    location: partial.location ?? {
      country: null,
      city: null,
      areaM2: null,
      propertyType: null,
      currencyCode: "CZK",
    },
    purchase: partial.purchase ?? {
      purchasePriceCzk: null,
      purchaseDate: null,
      acquisitionCostsCzk: null,
      currency: "CZK",
      claimKind: "NEOVERENO",
    },
    financing: partial.financing ?? {
      loanAmountCzk: null,
      ratePercent: null,
      termYears: null,
      fixationEnd: null,
      lenderLabel: null,
      monthlyPaymentCzk: null,
      claimKind: "NEOVERENO",
      updatedAt: null,
    },
    mortgageBalanceHistory: partial.mortgageBalanceHistory ?? [],
    valueHistory: partial.valueHistory ?? [],
    rentHistory: partial.rentHistory ?? [],
    occupancy: partial.occupancy ?? [],
    expenses: partial.expenses ?? [],
    repairs: partial.repairs ?? [],
    renovations: partial.renovations ?? [],
    documents: partial.documents ?? [],
    insurance: partial.insurance ?? [],
    taxReminders: partial.taxReminders ?? [],
    energy: partial.energy ?? [],
    propertyManager: partial.propertyManager ?? null,
    keyDates: partial.keyDates ?? [],
    timeline: partial.timeline ?? [],
  };
}
