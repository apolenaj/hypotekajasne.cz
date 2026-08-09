/**
 * History-preserving manual rate updates.
 * Never overwrite an active row's rate in place — deactivate + insert.
 *
 * Does not write to the database; returns a plan for a future admin/API path.
 */

import type {
  MortgagePurpose,
  MortgageRateKind,
  MortgageRateRecord,
} from "@/lib/mortgage-rates/types";

export type SupersedeMortgageRateInput = {
  previous: MortgageRateRecord;
  rate: number;
  checkedAt: string;
  validFrom?: string;
  providerName?: string | null;
  sourceName?: string | null;
  sourceUrl?: string | null;
  notes?: string | null;
  /** Defaults to previous identity fields. */
  purpose?: MortgagePurpose;
  fixationYears?: number;
  ltvMin?: number;
  ltvMax?: number;
  ltvMinExclusive?: boolean;
  ltvMaxExclusive?: boolean;
  rateKind?: MortgageRateKind;
  countryCode?: string;
};

export type SupersedeMortgageRatePlan = {
  deactivate: {
    id: string;
    isActive: false;
    validTo: string;
  };
  insert: Omit<MortgageRateRecord, "id"> & { id?: undefined };
};

/**
 * Build the deactivate + insert plan for a weekly owner update.
 * Callers must apply both steps (preferably in one DB transaction).
 */
export function planMortgageRateSupersede(
  input: SupersedeMortgageRateInput
): SupersedeMortgageRatePlan {
  const { previous } = input;
  if (!previous.isActive) {
    throw new Error("Can only supersede an active mortgage rate record.");
  }
  if (!(input.rate > 0 && input.rate < 30)) {
    throw new Error("Replacement rate must satisfy 0 < rate < 30.");
  }

  const at = input.validFrom ?? input.checkedAt;
  const ltvMin = input.ltvMin ?? previous.ltvMin;
  const ltvMax = input.ltvMax ?? previous.ltvMax;
  if (!(ltvMin >= 0 && ltvMax <= 100 && ltvMin < ltvMax)) {
    throw new Error("Replacement LTV band must satisfy 0 ≤ min < max ≤ 100.");
  }

  return {
    deactivate: {
      id: previous.id,
      isActive: false,
      validTo: at,
    },
    insert: {
      countryCode: (input.countryCode ?? previous.countryCode).toUpperCase(),
      purpose: input.purpose ?? previous.purpose,
      fixationYears: input.fixationYears ?? previous.fixationYears,
      ltvMin,
      ltvMax,
      ltvMinExclusive:
        input.ltvMinExclusive ?? previous.ltvMinExclusive ?? false,
      ltvMaxExclusive:
        input.ltvMaxExclusive ?? previous.ltvMaxExclusive ?? false,
      rate: input.rate,
      rateKind: input.rateKind ?? previous.rateKind,
      providerName: input.providerName ?? previous.providerName ?? null,
      sourceName: input.sourceName ?? previous.sourceName ?? null,
      sourceUrl: input.sourceUrl ?? previous.sourceUrl ?? null,
      checkedAt: input.checkedAt,
      validFrom: at,
      validTo: null,
      isActive: true,
      notes: input.notes ?? previous.notes ?? null,
    },
  };
}
