/**
 * Mortgage market import readiness (Phase 2 Step 2.0).
 * No real bank data. Not wired to production UI.
 */

export {
  isOneSidedLtvRejected,
  mapImportLtvToStorage,
  summarizeMortgageMarketImport,
  validateImportRateRecord,
  validateImportRepresentativeExample,
  validateMortgageMarketImport,
} from "@/lib/mortgage-market/import/validate";
export {
  countRateVariantsByStatus,
  detectSourceCollisions,
  formatEvidenceIntegrityReport,
  verifyEvidenceIntegrity,
} from "@/lib/mortgage-market/import/evidence-integrity";
export {
  CZ_2026_08_09_MANIFEST,
  CZ_2026_08_09_RB_LOWER_PAYMENT_ANNUITY,
  CZ_MANIFEST_CHECKED_AT,
} from "@/lib/mortgage-market/import/data/cz-2026-08-09";
export * from "@/lib/mortgage-market/import/types";
