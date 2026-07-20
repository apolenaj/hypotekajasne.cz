/**
 * ANOMALY CHECK — blokuje auto-publish při nepřirozené změně.
 */

import {
  RATE_JUMP_ABS_PP,
  RATE_JUMP_REL,
  type AnomalyFlag,
  type MortgageProduct,
} from "@/lib/mortgage-pipeline/types";

export type AnomalyResult = {
  flags: AnomalyFlag[];
  /** true = nesmí auto-publish do produkce */
  blockAutoPublish: boolean;
};

export function detectAnomalies(
  next: MortgageProduct,
  previous: MortgageProduct | null
): AnomalyResult {
  const flags: AnomalyFlag[] = [];

  if (next.nominalRateFrom == null) {
    flags.push({
      code: "MISSING_RATE",
      severity: "critical",
      message: "Chybí nominální sazba",
    });
  }

  if (next.representativeAPR != null && !next.representativeExample) {
    flags.push({
      code: "APR_WITHOUT_EXAMPLE",
      severity: "critical",
      message: "RPSN bez reprezentativního příkladu",
    });
  }

  if (
    next.representativeAPR != null &&
    next.nominalRateFrom != null &&
    next.representativeAPR + 0.001 < next.nominalRateFrom
  ) {
    flags.push({
      code: "APR_BELOW_NOMINAL",
      severity: "critical",
      message: "RPSN nižší než nominální sazba",
      details: {
        apr: next.representativeAPR,
        nominal: next.nominalRateFrom,
      },
    });
  }

  if (
    previous?.nominalRateFrom != null &&
    next.nominalRateFrom != null
  ) {
    const prev = previous.nominalRateFrom;
    const curr = next.nominalRateFrom;
    const abs = Math.abs(curr - prev);
    const rel = prev > 0 ? abs / prev : abs;

    if (abs >= RATE_JUMP_ABS_PP || rel >= RATE_JUMP_REL) {
      flags.push({
        code: curr > prev ? "RATE_JUMP" : "RATE_DROP",
        severity: "critical",
        message: `Nepřirozená změna sazby ${prev.toFixed(2)} → ${curr.toFixed(2)} p.a. (Δ ${abs.toFixed(2)} p.b.) — vyžaduje manuální schválení`,
        details: { previous: prev, next: curr, abs, rel },
      });
    }
  }

  if (
    previous &&
    previous.rawSnapshotHash === next.rawSnapshotHash
  ) {
    flags.push({
      code: "HASH_UNCHANGED",
      severity: "info",
      message: "Snapshot hash beze změny",
    });
  }

  const blockAutoPublish = flags.some((f) => f.severity === "critical");
  return { flags, blockAutoPublish };
}

export function detectDisappearedProducts(
  publishedIds: string[],
  incomingIds: string[]
): AnomalyFlag[] {
  const incoming = new Set(incomingIds);
  return publishedIds
    .filter((id) => !incoming.has(id))
    .map((id) => ({
      code: "PRODUCT_DISAPPEARED" as const,
      severity: "warning" as const,
      message: `Produkt ${id} nebyl v dnešním scrape — ponechán v produkci jako STALE`,
      details: { productId: id },
    }));
}
