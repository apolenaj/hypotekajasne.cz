import { createHash } from "crypto";
import type { MortgageProduct } from "@/lib/mortgage-pipeline/types";

export function hashPayload(payload: unknown): string {
  return createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex")
    .slice(0, 32);
}

export function buildProductId(parts: {
  country: string;
  lender: string;
  productName: string;
  productType: string;
  purpose: string;
  fixation: number | null;
  requiredInsurance: boolean | null;
}): string {
  const key = [
    parts.country,
    parts.lender,
    parts.productName,
    parts.productType,
    parts.purpose,
    parts.fixation ?? "na",
    parts.requiredInsurance === true
      ? "ins"
      : parts.requiredInsurance === false
        ? "noins"
        : "insuk",
  ]
    .join("|")
    .toLowerCase()
    .replace(/\s+/g, "-");
  return createHash("sha1").update(key).digest("hex").slice(0, 24);
}

export function productToRow(p: MortgageProduct) {
  return {
    id: p.id,
    country: p.country,
    lender: p.lender,
    product_name: p.productName,
    product_type: p.productType,
    purpose: p.purpose,
    residency: p.residency,
    currency: p.currency,
    rate_type: p.rateType,
    fixation: p.fixation,
    ltv_min: p.ltvMin,
    ltv_max: p.ltvMax,
    loan_amount_min: p.loanAmountMin,
    loan_amount_max: p.loanAmountMax,
    term_min: p.termMin,
    term_max: p.termMax,
    nominal_rate_from: p.nominalRateFrom,
    representative_apr: p.representativeAPR,
    representative_example: p.representativeExample,
    required_account: p.requiredAccount,
    required_insurance: p.requiredInsurance,
    fees: p.fees,
    source_url: p.sourceUrl,
    source_type: p.sourceType,
    valid_from: p.validFrom,
    scraped_at: p.scrapedAt,
    verified_at: p.verifiedAt,
    status: p.status,
    confidence: p.confidence,
    raw_snapshot_hash: p.rawSnapshotHash,
  };
}

export function rowToProduct(row: Record<string, unknown>): MortgageProduct {
  return {
    id: String(row.id),
    country: String(row.country ?? "cz"),
    lender: String(row.lender),
    productName: String(row.product_name ?? row.productName),
    productType: (row.product_type ?? row.productType ?? "classic") as MortgageProduct["productType"],
    purpose: (row.purpose ?? "any") as MortgageProduct["purpose"],
    residency: String(row.residency ?? "resident"),
    currency: String(row.currency ?? "CZK"),
    rateType: (row.rate_type ?? row.rateType ?? "fixed") as MortgageProduct["rateType"],
    fixation: toNumOrNull(row.fixation),
    ltvMin: toNumOrNull(row.ltv_min ?? row.ltvMin),
    ltvMax: toNumOrNull(row.ltv_max ?? row.ltvMax),
    loanAmountMin: toNumOrNull(row.loan_amount_min ?? row.loanAmountMin),
    loanAmountMax: toNumOrNull(row.loan_amount_max ?? row.loanAmountMax),
    termMin: toNumOrNull(row.term_min ?? row.termMin),
    termMax: toNumOrNull(row.term_max ?? row.termMax),
    nominalRateFrom: toNumOrNull(row.nominal_rate_from ?? row.nominalRateFrom),
    representativeAPR: toNumOrNull(
      row.representative_apr ?? row.representativeAPR
    ),
    representativeExample:
      (row.representative_example as string | null) ??
      (row.representativeExample as string | null) ??
      null,
    requiredAccount:
      typeof row.required_account === "boolean"
        ? row.required_account
        : typeof row.requiredAccount === "boolean"
          ? row.requiredAccount
          : null,
    requiredInsurance:
      typeof row.required_insurance === "boolean"
        ? row.required_insurance
        : typeof row.requiredInsurance === "boolean"
          ? row.requiredInsurance
          : null,
    fees: Array.isArray(row.fees) ? (row.fees as MortgageProduct["fees"]) : [],
    sourceUrl: (row.source_url as string | null) ?? (row.sourceUrl as string | null) ?? null,
    sourceType: (row.source_type ??
      row.sourceType ??
      "unknown") as MortgageProduct["sourceType"],
    validFrom: (row.valid_from as string | null) ?? (row.validFrom as string | null) ?? null,
    scrapedAt: (row.scraped_at as string | null) ?? (row.scrapedAt as string | null) ?? null,
    verifiedAt:
      (row.verified_at as string | null) ?? (row.verifiedAt as string | null) ?? null,
    status: (row.status ?? "STALE") as MortgageProduct["status"],
    confidence: Number(row.confidence ?? 0),
    rawSnapshotHash: String(row.raw_snapshot_hash ?? row.rawSnapshotHash ?? ""),
  };
}

function toNumOrNull(v: unknown): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
