/**
 * OBVIOUSLY SYNTHETIC fixtures for unit tests ONLY.
 * Never import into production seed/migration paths.
 * Rates use distinctive test values (e.g. 9.11) — not live market quotes.
 */

import type { MortgageRateRow } from "@/lib/mortgage-rates/types";
import { CZ_LTV_BANDS } from "@/lib/mortgage-rates/cz-rate-structure";

const SYNTHETIC_PREFIX = "SYNTHETIC_TEST_ONLY";

export function syntheticMortgageRateRow(
  overrides: Partial<MortgageRateRow> = {}
): MortgageRateRow {
  return {
    id: "00000000-0000-4000-8000-000000000001",
    country_code: "CZ",
    purpose: "purchase",
    fixation_years: 3,
    ltv_min: CZ_LTV_BANDS.to_80.ltvMin,
    ltv_max: CZ_LTV_BANDS.to_80.ltvMax,
    ltv_min_exclusive: CZ_LTV_BANDS.to_80.ltvMinExclusive,
    ltv_max_exclusive: false,
    // Distinctive non-market test rate
    rate: 9.11,
    rate_kind: "illustrative",
    provider_name: null,
    source_name: SYNTHETIC_PREFIX,
    source_url: null,
    checked_at: "2026-08-08T12:00:00.000Z",
    valid_from: "2026-08-01T00:00:00.000Z",
    valid_to: null,
    is_active: true,
    notes: `${SYNTHETIC_PREFIX} — never use in production`,
    ...overrides,
  };
}

/** Minimal active matrix for selection tests (synthetic rates only). */
export function syntheticPurchaseMatrix(checkedAt: string): MortgageRateRow[] {
  const bands = [
    {
      ...CZ_LTV_BANDS.to_80,
      rateFor: (f: number) => 9.1 + f / 100,
    },
    {
      ...CZ_LTV_BANDS.to_90,
      rateFor: (f: number) => 9.2 + f / 100,
    },
  ];
  const fixations = [1, 3, 5];
  const rows: MortgageRateRow[] = [];
  let n = 1;
  for (const band of bands) {
    for (const fixation of fixations) {
      rows.push(
        syntheticMortgageRateRow({
          id: `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`,
          fixation_years: fixation,
          ltv_min: band.ltvMin,
          ltv_max: band.ltvMax,
          ltv_min_exclusive: band.ltvMinExclusive,
          ltv_max_exclusive: false,
          rate: Number(band.rateFor(fixation).toFixed(3)),
          checked_at: checkedAt,
        })
      );
      n += 1;
    }
  }
  return rows;
}
