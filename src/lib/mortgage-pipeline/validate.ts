/**
 * VALIDATE — strukturální a doménová kontrola. Bez inventury hodnot.
 */

import { isValidMortgagePair } from "@/lib/scrape/parse-rate";
import type {
  MortgageProduct,
  ValidationIssue,
} from "@/lib/mortgage-pipeline/types";

export type ValidateResult = {
  ok: boolean;
  issues: ValidationIssue[];
};

export function validateMortgageProduct(
  product: MortgageProduct
): ValidateResult {
  const issues: ValidationIssue[] = [];

  if (!product.id) {
    issues.push({ field: "id", message: "Chybí id", severity: "error" });
  }
  if (!product.lender?.trim()) {
    issues.push({
      field: "lender",
      message: "Chybí lender",
      severity: "error",
    });
  }
  if (!product.productName?.trim()) {
    issues.push({
      field: "productName",
      message: "Chybí productName",
      severity: "error",
    });
  }
  if (!product.sourceUrl && product.sourceType === "official_bank") {
    issues.push({
      field: "sourceUrl",
      message: "Oficiální produkt bez sourceUrl",
      severity: "warning",
    });
  }

  if (product.nominalRateFrom == null) {
    issues.push({
      field: "nominalRateFrom",
      message: "Chybí ověřená nominální sazba — nelze publikovat jako LIVE",
      severity: "error",
    });
  } else if (
    product.nominalRateFrom < 0.5 ||
    product.nominalRateFrom > 25
  ) {
    issues.push({
      field: "nominalRateFrom",
      message: `Sazba mimo reálný rozsah: ${product.nominalRateFrom}`,
      severity: "error",
    });
  }

  if (
    product.representativeAPR != null &&
    !product.representativeExample
  ) {
    issues.push({
      field: "representativeAPR",
      message:
        "RPSN bez reprezentativního příkladu — zakázáno (žádné univerzální RPSN)",
      severity: "error",
    });
  }

  if (
    product.representativeAPR != null &&
    product.nominalRateFrom != null &&
    !isValidMortgagePair(product.nominalRateFrom, product.representativeAPR)
  ) {
    issues.push({
      field: "representativeAPR",
      message: "Neplatný pár sazba/RPSN",
      severity: "error",
    });
  }

  if (
    product.ltvMin != null &&
    product.ltvMax != null &&
    product.ltvMin > product.ltvMax
  ) {
    issues.push({
      field: "ltv",
      message: "ltvMin > ltvMax",
      severity: "error",
    });
  }

  if (
    product.termMin != null &&
    product.termMax != null &&
    product.termMin > product.termMax
  ) {
    issues.push({
      field: "term",
      message: "termMin > termMax",
      severity: "error",
    });
  }

  if (!product.rawSnapshotHash) {
    issues.push({
      field: "rawSnapshotHash",
      message: "Chybí rawSnapshotHash",
      severity: "error",
    });
  }

  const ok = !issues.some((i) => i.severity === "error");
  return { ok, issues };
}
