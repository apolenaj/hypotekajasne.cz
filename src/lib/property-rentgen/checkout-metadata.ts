/**
 * Stripe metadata for Komplexní Investiční Audit checkout.
 * Stripe limit: each metadata value ≤ 500 characters.
 */

import { randomUUID } from "node:crypto";
import {
  DEFAULT_MARKET_ASSUMPTIONS,
  type MarketAssumptions,
  type MortgageAssumptions,
  type PremiumRentgenAuditInput,
  type PropertyInput,
} from "@/lib/property-rentgen/audit-types";

export const RENTGEN_PREMIUM_PRODUCT_CODE = "rentgen_premium" as const;

/** Compact payload persisted across Checkout → webhook (fits Stripe 500-char values). */
export type RentgenCheckoutPropertySnapshot = {
  label?: string;
  address?: string;
  city?: string;
  areaM2?: number;
  purchasePriceCzk: number;
  monthlyGrossRentCzk: number;
  capexCzk?: number;
  closingCostsCzk?: number;
  monthlyOperatingCostsCzk?: number;
  monthlyReserveCzk?: number;
  vacancyRate?: number;
  ownFundsCzk: number;
  loanAmountCzk?: number;
  annualRatePercent: number;
  termYears?: number;
  fixationYears?: number;
  rentGrowthPa?: number;
  opexGrowthPa?: number;
  propertyAppreciationPa?: number;
  sp500ReturnPa?: number;
};

export type RentgenCheckoutSessionMeta = {
  product: typeof RENTGEN_PREMIUM_PRODUCT_CODE;
  reportId: string;
  /** Human-readable fields for Stripe Dashboard */
  purchasePriceCzk: string;
  areaM2: string;
  address: string;
  monthlyRentCzk: string;
  /** Compact JSON ≤ 500 chars */
  auditJson: string;
};

export type CreateRentgenCheckoutInput = {
  customerEmail?: string;
  successUrl?: string;
  cancelUrl?: string;
  property: RentgenCheckoutPropertySnapshot;
  reportId?: string;
};

function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, Math.max(0, max - 1))}…`;
}

export function buildRentgenCheckoutMetadata(
  property: RentgenCheckoutPropertySnapshot,
  reportId: string = randomUUID()
): RentgenCheckoutSessionMeta {
  const address =
    property.address?.trim() ||
    property.label?.trim() ||
    property.city?.trim() ||
    "Nemovitost";

  const compact: RentgenCheckoutPropertySnapshot = {
    label: property.label,
    address: property.address,
    city: property.city,
    areaM2: property.areaM2,
    purchasePriceCzk: property.purchasePriceCzk,
    monthlyGrossRentCzk: property.monthlyGrossRentCzk,
    capexCzk: property.capexCzk ?? 0,
    closingCostsCzk: property.closingCostsCzk ?? 0,
    monthlyOperatingCostsCzk: property.monthlyOperatingCostsCzk ?? 0,
    monthlyReserveCzk: property.monthlyReserveCzk ?? 0,
    vacancyRate: property.vacancyRate ?? 0.05,
    ownFundsCzk: property.ownFundsCzk,
    loanAmountCzk: property.loanAmountCzk,
    annualRatePercent: property.annualRatePercent,
    termYears: property.termYears ?? 30,
    fixationYears: property.fixationYears ?? 5,
    rentGrowthPa: property.rentGrowthPa,
    opexGrowthPa: property.opexGrowthPa,
    propertyAppreciationPa: property.propertyAppreciationPa,
    sp500ReturnPa: property.sp500ReturnPa,
  };

  let auditJson = JSON.stringify(compact);
  if (auditJson.length > 500) {
    // Drop optional narrative fields first, keep engine-critical numbers.
    const minimal: RentgenCheckoutPropertySnapshot = {
      purchasePriceCzk: compact.purchasePriceCzk,
      monthlyGrossRentCzk: compact.monthlyGrossRentCzk,
      ownFundsCzk: compact.ownFundsCzk,
      annualRatePercent: compact.annualRatePercent,
      areaM2: compact.areaM2,
      capexCzk: compact.capexCzk,
      closingCostsCzk: compact.closingCostsCzk,
      monthlyOperatingCostsCzk: compact.monthlyOperatingCostsCzk,
      monthlyReserveCzk: compact.monthlyReserveCzk,
      vacancyRate: compact.vacancyRate,
      loanAmountCzk: compact.loanAmountCzk,
      termYears: compact.termYears,
      fixationYears: compact.fixationYears,
      city: compact.city ? truncate(compact.city, 40) : undefined,
    };
    auditJson = JSON.stringify(minimal);
  }
  if (auditJson.length > 500) {
    throw new Error(
      "Metadata auditJson přesahuje Stripe limit 500 znaků — zjednodušte vstupy."
    );
  }

  return {
    product: RENTGEN_PREMIUM_PRODUCT_CODE,
    reportId,
    purchasePriceCzk: String(Math.round(property.purchasePriceCzk)),
    areaM2:
      property.areaM2 != null && Number.isFinite(property.areaM2)
        ? String(property.areaM2)
        : "",
    address: truncate(address, 500),
    monthlyRentCzk: String(Math.round(property.monthlyGrossRentCzk)),
    auditJson,
  };
}

export function parseRentgenCheckoutMetadata(
  metadata: Record<string, string> | null | undefined
): {
  reportId: string;
  snapshot: RentgenCheckoutPropertySnapshot;
  address: string;
} {
  if (!metadata || metadata.product !== RENTGEN_PREMIUM_PRODUCT_CODE) {
    throw new Error("Session metadata nepatří k produktu rentgen_premium.");
  }
  if (!metadata.reportId?.trim()) {
    throw new Error("Chybí reportId v metadata.");
  }
  const jsonPayload =
    metadata.auditJson?.trim() || metadata.propertyData?.trim() || "";
  if (!jsonPayload) {
    throw new Error("Chybí auditJson / propertyData v metadata.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonPayload);
  } catch {
    throw new Error("Neplatný JSON v metadata (auditJson/propertyData).");
  }
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Metadata JSON musí být objekt.");
  }

  const snap = parsed as Partial<RentgenCheckoutPropertySnapshot>;
  const purchasePriceCzk = Number(snap.purchasePriceCzk);
  const monthlyGrossRentCzk = Number(snap.monthlyGrossRentCzk);
  const ownFundsCzk = Number(snap.ownFundsCzk);
  const annualRatePercent = Number(snap.annualRatePercent);

  if (
    ![purchasePriceCzk, monthlyGrossRentCzk, ownFundsCzk, annualRatePercent].every(
      (n) => Number.isFinite(n) && n >= 0
    ) ||
    purchasePriceCzk <= 0
  ) {
    throw new Error("auditJson neobsahuje platné číselné vstupy auditu.");
  }

  return {
    reportId: metadata.reportId.trim(),
    address: metadata.address?.trim() || snap.address || snap.label || "Nemovitost",
    snapshot: {
      ...snap,
      purchasePriceCzk,
      monthlyGrossRentCzk,
      ownFundsCzk,
      annualRatePercent,
      areaM2:
        snap.areaM2 != null && Number.isFinite(Number(snap.areaM2))
          ? Number(snap.areaM2)
          : metadata.areaM2
            ? Number(metadata.areaM2)
            : undefined,
    },
  };
}

export function snapshotToAuditInput(
  snapshot: RentgenCheckoutPropertySnapshot,
  reportId: string
): PremiumRentgenAuditInput {
  const property: PropertyInput = {
    reportId,
    label: snapshot.label ?? snapshot.address ?? snapshot.city,
    city: snapshot.city,
    areaM2: snapshot.areaM2,
    purchasePriceCzk: snapshot.purchasePriceCzk,
    capexCzk: snapshot.capexCzk ?? 0,
    closingCostsCzk: snapshot.closingCostsCzk ?? 0,
    monthlyGrossRentCzk: snapshot.monthlyGrossRentCzk,
    monthlyOperatingCostsCzk: snapshot.monthlyOperatingCostsCzk ?? 0,
    monthlyReserveCzk: snapshot.monthlyReserveCzk ?? 0,
    vacancyRate: snapshot.vacancyRate ?? 0.05,
  };

  const mortgage: MortgageAssumptions = {
    ownFundsCzk: snapshot.ownFundsCzk,
    loanAmountCzk: snapshot.loanAmountCzk,
    annualRatePercent: snapshot.annualRatePercent,
    termYears: snapshot.termYears ?? 30,
    fixationYears: snapshot.fixationYears ?? 5,
  };

  const market: MarketAssumptions = {
    ...DEFAULT_MARKET_ASSUMPTIONS,
    rentGrowthPa: snapshot.rentGrowthPa ?? DEFAULT_MARKET_ASSUMPTIONS.rentGrowthPa,
    opexGrowthPa: snapshot.opexGrowthPa ?? DEFAULT_MARKET_ASSUMPTIONS.opexGrowthPa,
    propertyAppreciationPa:
      snapshot.propertyAppreciationPa ??
      DEFAULT_MARKET_ASSUMPTIONS.propertyAppreciationPa,
    sp500ReturnPa:
      snapshot.sp500ReturnPa ?? DEFAULT_MARKET_ASSUMPTIONS.sp500ReturnPa,
  };

  return { property, mortgage, market };
}
