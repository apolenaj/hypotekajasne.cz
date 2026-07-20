/**
 * RPSN pravidla — žádné univerzální RPSN.
 */

import type { MortgageProduct } from "@/lib/mortgage-pipeline/types";

export type AprResolution = {
  representativeAPR: number | null;
  representativeExample: string | null;
  reason: string;
};

/**
 * Povolí RPSN jen s reprezentativním příkladem banky,
 * nebo pokud máme kompletní fee set (zatím vyžadujeme explicitní example).
 * Nikdy nevrací vymyšlené APR.
 */
export function resolveRepresentativeApr(input: {
  apr: number | null | undefined;
  example: string | null | undefined;
  feesComplete?: boolean;
  computedApr?: number | null;
}): AprResolution {
  const apr =
    input.apr != null && Number.isFinite(input.apr) ? input.apr : null;
  const example =
    typeof input.example === "string" && input.example.trim().length > 0
      ? input.example.trim()
      : null;

  if (apr != null && example) {
    return {
      representativeAPR: apr,
      representativeExample: example,
      reason: "bank_representative_example",
    };
  }

  if (
    input.feesComplete === true &&
    input.computedApr != null &&
    Number.isFinite(input.computedApr)
  ) {
    return {
      representativeAPR: input.computedApr,
      representativeExample:
        example ??
        "Vypočteno z kompletní sady nákladů (ne univerzální RPSN).",
      reason: "computed_from_complete_costs",
    };
  }

  // APR bez příkladu = nepublikovat jako reprezentativní
  return {
    representativeAPR: null,
    representativeExample: null,
    reason:
      apr != null
        ? "apr_without_example_dropped"
        : "apr_missing",
  };
}

export function stripInvalidApr(product: MortgageProduct): MortgageProduct {
  const resolved = resolveRepresentativeApr({
    apr: product.representativeAPR,
    example: product.representativeExample,
    feesComplete: false,
  });
  return {
    ...product,
    representativeAPR: resolved.representativeAPR,
    representativeExample: resolved.representativeExample,
  };
}
