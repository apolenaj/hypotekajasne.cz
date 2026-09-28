/**
 * Build an in-memory MortgageMarketCatalog from IMPORT_READY manifest rows.
 * Mirrors production SQL generator selection (HOLD rates never included).
 * Used for deterministic service tests — not a production write path.
 */

import { CZ_2026_08_09_MANIFEST } from "@/lib/mortgage-market/import/data/cz-2026-08-09";
import type {
  ImportCondition,
  ImportEvidence,
  ImportRateRecord,
  MortgageMarketImportManifest,
} from "@/lib/mortgage-market/import/types";
import type {
  CatalogCondition,
  CatalogEvidence,
  CatalogFee,
  CatalogLender,
  CatalogProduct,
  CatalogRateVariant,
  CatalogRepresentativeExample,
  MortgageMarketCatalog,
} from "@/lib/mortgage-market/offers";
import type { MortgageMarketRateType } from "@/lib/mortgage-market/types";
import {
  isPartnerOfferBankSlug,
  isPartnerOfferPublicRate,
  PARTNER_OFFER_BANKS,
  partnerOfferSortOrder,
} from "@/lib/mortgage-market/partner-offer-banks";
import {
  PARTNER_OFFER_EXT_CHECKED_AT,
  PARTNER_OFFER_EXT_EVIDENCE,
  PARTNER_OFFER_EXT_LENDERS,
  PARTNER_OFFER_EXT_PRODUCTS,
  PARTNER_OFFER_EXT_RATES,
} from "@/lib/mortgage-market/partner-offer-extension";

function mapLtv(rate: ImportRateRecord): {
  ltvMin: number | null;
  ltvMax: number | null;
  ltvMinExclusive: boolean;
  ltvMaxExclusive: boolean;
} {
  if (rate.ltv.kind === "unspecified") {
    return {
      ltvMin: null,
      ltvMax: null,
      ltvMinExclusive: false,
      ltvMaxExclusive: false,
    };
  }
  return {
    ltvMin: rate.ltv.ltvMin,
    ltvMax: rate.ltv.ltvMax,
    ltvMinExclusive: rate.ltv.ltvMinExclusive,
    ltvMaxExclusive: rate.ltv.ltvMaxExclusive,
  };
}

function toEvidence(e: ImportEvidence): CatalogEvidence {
  return {
    id: e.evidenceId,
    sourceType: e.sourceType,
    sourceName: e.sourceName,
    sourceUrl: e.sourceUrl ?? null,
    checkedAt: e.checkedAt,
    reliabilityTier: e.reliabilityTier ?? null,
  };
}

function toConditions(
  rateId: string,
  conditions: ImportCondition[] | undefined
): CatalogCondition[] {
  return (conditions ?? []).map((c, index) => ({
    id: `${rateId}:cond:${index}`,
    rateVariantId: rateId,
    conditionType: c.conditionType,
    conditionRole: c.conditionRole,
    insuranceKind: c.insuranceKind ?? null,
    requirementMode: c.requirementMode ?? null,
    rateEffectBp: c.rateEffectBp ?? null,
    description: c.description,
    isRequired: c.isRequired,
    isOptional: c.isOptional,
    isActive: true,
  }));
}

/**
 * Catalog snapshot equivalent to what production import emits:
 * - all lenders
 * - all products (including CSOB HOLD / RB products with zero rates)
 * - IMPORT_READY rate variants only
 */
export function catalogFromImportManifest(
  manifest: MortgageMarketImportManifest = CZ_2026_08_09_MANIFEST
): MortgageMarketCatalog {
  const readyRates = manifest.rates.filter(
    (r) => r.auditStatus === "IMPORT_READY"
  );

  const lenders: CatalogLender[] = (manifest.lenders ?? []).map((l) => ({
    id: l.recordId,
    slug: l.slug,
    name: l.name,
    countryCode: l.countryCode,
    isActive: true,
  }));

  const lenderIdBySlug = new Map(lenders.map((l) => [l.slug, l.id]));

  const products: CatalogProduct[] = (manifest.products ?? []).map((p) => ({
    id: p.recordId,
    lenderId: lenderIdBySlug.get(p.lenderSlug) ?? `lender-${p.lenderSlug}`,
    slug: p.slug,
    name: p.name,
    productType: p.productType,
    borrowerScope: p.borrowerScope ?? "natural_person",
    maxLtv: p.maxLtv ?? null,
    isActive: true,
  }));

  const productIdByKey = new Map(
    products.map((p) => {
      const lender = lenders.find((l) => l.id === p.lenderId);
      return [`${lender?.slug ?? "?"}:${p.slug}`, p.id];
    })
  );

  const rates: CatalogRateVariant[] = [];
  const conditions: CatalogCondition[] = [];
  const evidenceById = new Map<string, CatalogEvidence>();

  for (const r of readyRates) {
    const productId =
      productIdByKey.get(`${r.lenderSlug}:${r.productSlug}`) ??
      `product-${r.lenderSlug}-${r.productSlug}`;
    const ltv = mapLtv(r);
    const rateId = r.recordId;
    rates.push({
      id: rateId,
      productId,
      pricingScenarioKey: r.pricingScenarioKey,
      pricingScenarioLabel: r.pricingScenarioLabel ?? null,
      financingPurpose: r.financingPurpose ?? null,
      fixationMonths: r.fixationMonths ?? null,
      ltvMin: ltv.ltvMin,
      ltvMax: ltv.ltvMax,
      ltvMinExclusive: ltv.ltvMinExclusive,
      ltvMaxExclusive: ltv.ltvMaxExclusive,
      nominalInterestRate: r.nominalInterestRate,
      rateType: r.rateType as MortgageMarketRateType,
      validFrom: r.validFrom ?? r.checkedAt,
      validTo:
        r.validTo == null || r.validTo.trim() === "" ? null : r.validTo.trim(),
      checkedAt: r.checkedAt,
      isActive: true,
      sourceEvidenceId: r.evidence.evidenceId,
      notes: r.notes ?? null,
    });
    conditions.push(...toConditions(rateId, r.conditions));
    evidenceById.set(r.evidence.evidenceId, toEvidence(r.evidence));
  }

  for (const e of manifest.evidence ?? []) {
    if (!evidenceById.has(e.evidenceId)) {
      // Keep primary evidence used by products/fees even if not on a rate.
      evidenceById.set(e.evidenceId, toEvidence(e));
    }
  }
  // Campaign HOLD evidence must never back an active offer path.
  evidenceById.delete("ev-cs-web-campaign-od-5-09-hold");
  evidenceById.delete("ev-cs-web-campaign-od-4-94-hold");

  const fees: CatalogFee[] = (manifest.fees ?? [])
    .filter((f) => f.auditStatus === "IMPORT_READY")
    .map((f) => ({
      id: f.recordId,
      productId:
        productIdByKey.get(`${f.lenderSlug}:${f.productSlug}`) ??
        `product-${f.lenderSlug}-${f.productSlug}`,
      feeType: f.feeType,
      amount: f.amount ?? null,
      currency: f.currency ?? "CZK",
      frequency: f.frequency ?? "monthly",
      description: f.description,
      isMandatory: f.isMandatory,
      isActive: true,
    }));

  const examples: CatalogRepresentativeExample[] = (
    manifest.representativeExamples ?? []
  )
    .filter((x) => x.auditStatus === "IMPORT_READY")
    .map((x) => ({
      id: x.recordId,
      productId:
        productIdByKey.get(`${x.lenderSlug}:${x.productSlug}`) ??
        `product-${x.lenderSlug}-${x.productSlug}`,
      rateVariantId: x.linkedRateRecordId ?? null,
      loanAmount: x.loanAmount,
      termYears: x.termYears,
      fixationMonths: x.fixationMonths ?? null,
      nominalRate: x.nominalRate ?? null,
      rpsn: x.rpsn ?? null,
      monthlyPayment: x.monthlyPayment ?? null,
      totalAmountPayable: x.totalAmountPayable ?? null,
      insuranceIncluded: x.insuranceIncluded ?? null,
      insuranceCost: x.insuranceCost ?? null,
      representativeExampleText: null,
      isActive: true,
    }));

  for (const x of manifest.representativeExamples ?? []) {
    if (x.auditStatus === "IMPORT_READY") {
      evidenceById.set(x.evidence.evidenceId, toEvidence(x.evidence));
    }
  }

  return {
    lenders,
    products,
    rates,
    conditions,
    fees,
    evidence: [...evidenceById.values()],
    examples,
  };
}

/** Production-mirror catalog from the verified 2026-08-09 manifest. */
export function getCz20260809Catalog(): MortgageMarketCatalog {
  return catalogFromImportManifest(CZ_2026_08_09_MANIFEST);
}

/**
 * Public partner-offer catalog: historical manifest + mBank/Oberbank extension,
 * filtered to the seven banks in our mortgage partner's offer.
 */
export function getPartnerOfferCatalog(): MortgageMarketCatalog {
  const base = catalogFromImportManifest(CZ_2026_08_09_MANIFEST);
  const ext = catalogFromImportManifest({
    manifestId: "partner-offer-extension-2026-09-28",
    countryCode: "CZ",
    checkedAt: PARTNER_OFFER_EXT_CHECKED_AT,
    lenders: PARTNER_OFFER_EXT_LENDERS,
    products: PARTNER_OFFER_EXT_PRODUCTS,
    rates: PARTNER_OFFER_EXT_RATES,
    fees: [],
    representativeExamples: [],
    eligibilityRules: [],
    evidence: PARTNER_OFFER_EXT_EVIDENCE,
    holdRows: [],
  });

  const lenderIds = new Set(
    [...base.lenders, ...ext.lenders]
      .filter((l) => isPartnerOfferBankSlug(l.slug))
      .map((l) => l.id)
  );

  // Prefer extension lender row when slug duplicates (should not happen).
  const lendersBySlug = new Map<string, (typeof base.lenders)[number]>();
  for (const l of base.lenders) {
    if (isPartnerOfferBankSlug(l.slug)) lendersBySlug.set(l.slug, l);
  }
  for (const l of ext.lenders) {
    if (isPartnerOfferBankSlug(l.slug)) lendersBySlug.set(l.slug, l);
  }
  const lenders = [...lendersBySlug.values()].sort(
    (a, b) => partnerOfferSortOrder(a.slug) - partnerOfferSortOrder(b.slug)
  );

  const products = [...base.products, ...ext.products].filter((p) =>
    lenderIds.has(p.lenderId)
  );
  const productIds = new Set(products.map((p) => p.id));
  const productById = new Map(products.map((p) => [p.id, p]));
  const lenderIdToSlug = new Map(
    [...lendersBySlug.values()].map((l) => [l.id, l.slug])
  );

  const rates = [...base.rates, ...ext.rates].filter((r) => {
    if (!productIds.has(r.productId)) return false;
    const product = productById.get(r.productId);
    const lenderSlug = product
      ? lenderIdToSlug.get(product.lenderId)
      : undefined;
    if (!lenderSlug) return false;
    return isPartnerOfferPublicRate({
      lenderSlug,
      pricingScenarioKey: r.pricingScenarioKey,
    });
  });
  const rateIds = new Set(rates.map((r) => r.id));
  const conditions = [...base.conditions, ...ext.conditions].filter((c) =>
    rateIds.has(c.rateVariantId)
  );
  const evidenceById = new Map(
    [...base.evidence, ...ext.evidence].map((e) => [e.id, e])
  );
  const fees = [...base.fees, ...ext.fees].filter((f) =>
    productIds.has(f.productId)
  );
  const examples = [...(base.examples ?? []), ...(ext.examples ?? [])].filter(
    (x) => productIds.has(x.productId)
  );

  // Ensure every partner bank appears even without rates (inquiry cards).
  for (const bank of PARTNER_OFFER_BANKS) {
    if (!lendersBySlug.has(bank.slug)) {
      const id = `lender-${bank.slug}`;
      lenders.push({
        id,
        slug: bank.slug,
        name: bank.name,
        countryCode: "CZ",
        isActive: true,
      });
      lendersBySlug.set(bank.slug, lenders[lenders.length - 1]!);
    }
  }

  return {
    lenders: [...lendersBySlug.values()].sort(
      (a, b) => partnerOfferSortOrder(a.slug) - partnerOfferSortOrder(b.slug)
    ),
    products,
    rates,
    conditions,
    fees,
    evidence: [...evidenceById.values()],
    examples,
  };
}
