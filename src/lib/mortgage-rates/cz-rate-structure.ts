/**
 * Initial CZ reference-rate SLOT architecture (Phase 2).
 *
 * Defines which active identities the product expects — NOT market values.
 * Do NOT invent production rates here. Owner inserts verified rates in Supabase.
 *
 * LTV boundary semantics (no numerical gap, no overlap at 80):
 *   ≤ 80%     → ltv_min=0,  ltv_max=80, ltv_min_exclusive=false  →  ltv >= 0 && ltv <= 80
 *   > 80–90%  → ltv_min=80, ltv_max=90, ltv_min_exclusive=true   →  ltv > 80 && ltv <= 90
 */

import { matchesLtvBand } from "@/lib/mortgage-rates/ltv-band";
import type { MortgagePurpose, MortgageRateKind } from "@/lib/mortgage-rates/types";

export type CzLtvBandId = "to_80" | "to_90";

export type CzLtvBand = {
  id: CzLtvBandId;
  ltvMin: number;
  ltvMax: number;
  /** When true: LTV must be strictly greater than ltvMin. */
  ltvMinExclusive: boolean;
};

export type CzRateSlot = {
  countryCode: "CZ";
  purpose: MortgagePurpose;
  fixationYears: 1 | 3 | 5;
  ltvBandId: CzLtvBandId;
  ltvMin: number;
  ltvMax: number;
  ltvMinExclusive: boolean;
  /** Expected rate_kind when seeded by owner (never a fabricated value here). */
  rateKind: MortgageRateKind;
  /** false = structure reserved; do not invent values. */
  valuesRequiredForMvp: boolean;
};

export const CZ_LTV_BANDS: Record<CzLtvBandId, CzLtvBand> = {
  to_80: {
    id: "to_80",
    ltvMin: 0,
    ltvMax: 80,
    ltvMinExclusive: false,
  },
  to_90: {
    id: "to_90",
    ltvMin: 80,
    ltvMax: 90,
    ltvMinExclusive: true,
  },
};

const FIXATIONS = [1, 3, 5] as const;

function slotFromBand(
  purpose: MortgagePurpose,
  fixationYears: 1 | 3 | 5,
  band: CzLtvBand,
  valuesRequiredForMvp: boolean
): CzRateSlot {
  return {
    countryCode: "CZ",
    purpose,
    fixationYears,
    ltvBandId: band.id,
    ltvMin: band.ltvMin,
    ltvMax: band.ltvMax,
    ltvMinExclusive: band.ltvMinExclusive,
    rateKind: "illustrative",
    valuesRequiredForMvp,
  };
}

function purchaseSlots(): CzRateSlot[] {
  return FIXATIONS.flatMap((fixationYears) =>
    (["to_80", "to_90"] as const).map((bandId) =>
      slotFromBand("purchase", fixationYears, CZ_LTV_BANDS[bandId], true)
    )
  );
}

function refinanceSlots(): CzRateSlot[] {
  return FIXATIONS.map((fixationYears) =>
    slotFromBand("refinance", fixationYears, CZ_LTV_BANDS.to_80, true)
  );
}

/** Investment structure reserved — no invented values. */
function investmentSlots(): CzRateSlot[] {
  return FIXATIONS.map((fixationYears) =>
    slotFromBand("investment", fixationYears, CZ_LTV_BANDS.to_80, false)
  );
}

/** All CZ slots the architecture supports. */
export const CZ_MORTGAGE_RATE_SLOTS: readonly CzRateSlot[] = [
  ...purchaseSlots(),
  ...refinanceSlots(),
  ...investmentSlots(),
];

/** Slots the owner should fill with verified rates for MVP (still no invented values). */
export const CZ_MORTGAGE_RATE_SLOTS_MVP: readonly CzRateSlot[] =
  CZ_MORTGAGE_RATE_SLOTS.filter((s) => s.valuesRequiredForMvp);

export function findCzRateSlot(input: {
  purpose: MortgagePurpose;
  fixationYears: number;
  ltv: number;
}): CzRateSlot | null {
  return (
    CZ_MORTGAGE_RATE_SLOTS.find(
      (slot) =>
        slot.purpose === input.purpose &&
        slot.fixationYears === input.fixationYears &&
        matchesLtvBand(slot.ltvMin, slot.ltvMax, input.ltv, {
          ltvMinExclusive: slot.ltvMinExclusive,
        })
    ) ?? null
  );
}
