/**
 * Identita provozovatele — tenký adapter nad `src/config/legal.ts`.
 * NEVYMÝŠLET údaje. Null = nezveřejňovat.
 */

import {
  getContactAddressLine,
  getLegalIdentityConfig,
  isLegalIdentityComplete,
  LEGAL_CONTACT_FALLBACK,
  type LegalIdentityConfig,
} from "@/config/legal";

export type OperatorIdentity = {
  legalName: string | null;
  ico: string | null;
  dic: string | null;
  street: string | null;
  city: string | null;
  zip: string | null;
  country: string;
  email: string;
  phone: string;
  publicRegisterUrl: string | null;
  registryName: string | null;
  privacyEmail: string;
  dataControllerName: string;
  dpoContact: string | null;
  lastLegalReviewDate: string | null;
  legalReviewedBy: string | null;
  registeredOffice: string | null;
  /**
   * true = provozovatel je vyplněn dostatečně pro produkční zveřejnění IČO.
   * false = IČO a registr ve veřejném UI neuvádíme (žádné TODO texty).
   */
  isProductionReady: boolean;
  /** Interní — názvy chybějících env (ne renderovat klientovi) */
  missingFields: string[];
};

function envOrNull(...keys: string[]): string | null {
  for (const key of keys) {
    const v = process.env[key]?.trim();
    if (v && v.length > 0) return v;
  }
  return null;
}

function toOperator(config: LegalIdentityConfig): OperatorIdentity {
  const street =
    envOrNull("LEGAL_OPERATOR_STREET", "NEXT_PUBLIC_LEGAL_OPERATOR_STREET") ??
    (config.registeredOffice ? null : LEGAL_CONTACT_FALLBACK.street);
  const city =
    envOrNull("LEGAL_OPERATOR_CITY", "NEXT_PUBLIC_LEGAL_OPERATOR_CITY") ??
    (config.registeredOffice ? null : LEGAL_CONTACT_FALLBACK.city);
  const zip =
    envOrNull("LEGAL_OPERATOR_ZIP", "NEXT_PUBLIC_LEGAL_OPERATOR_ZIP") ??
    (config.registeredOffice ? null : LEGAL_CONTACT_FALLBACK.zip);

  return {
    legalName: config.legalName,
    ico: config.companyId,
    dic: envOrNull("LEGAL_OPERATOR_DIC", "NEXT_PUBLIC_LEGAL_OPERATOR_DIC"),
    street: street ?? LEGAL_CONTACT_FALLBACK.street,
    city: city ?? LEGAL_CONTACT_FALLBACK.city,
    zip: zip ?? LEGAL_CONTACT_FALLBACK.zip,
    country: LEGAL_CONTACT_FALLBACK.country,
    email: config.contactEmail,
    phone: config.phone,
    publicRegisterUrl: config.registryUrl,
    registryName: config.registryName,
    privacyEmail: config.privacyEmail,
    dataControllerName: config.dataControllerName,
    dpoContact: config.dpoContact,
    lastLegalReviewDate: config.lastLegalReviewDate,
    legalReviewedBy: config.legalReviewedBy,
    registeredOffice: config.registeredOffice,
    isProductionReady: isLegalIdentityComplete(config),
    missingFields: config.missingRequiredFields,
  };
}

export function getOperatorIdentity(): OperatorIdentity {
  return toOperator(getLegalIdentityConfig());
}

export function formatOperatorAddress(op: OperatorIdentity): string {
  if (op.registeredOffice) return op.registeredOffice;
  return getContactAddressLine();
}

export function operatorDisplayName(op: OperatorIdentity): string {
  return op.dataControllerName;
}

/** Placená analýza ke koupi — jen když je provozovatel i checkout připraven. */
export function isPaidAnalysisCommerciallyAvailable(): boolean {
  const op = getOperatorIdentity();
  const checkoutLive =
    process.env.PAID_ANALYSIS_CHECKOUT_LIVE === "true" ||
    process.env.NEXT_PUBLIC_PAID_ANALYSIS_CHECKOUT_LIVE === "true";
  return op.isProductionReady && checkoutLive;
}
