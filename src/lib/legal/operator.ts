/**
 * Identita provozovatele — tenký adapter nad `src/config/legal.ts`.
 *
 * INTERNAL: Before final commercial launch, verify the exact current
 * regulatory relationship between HEINZKE & partneři s.r.o. and INSIA in
 * the ČNB register.
 */

import {
  formatCommercialRegisterLine,
  formatCompactOfficeAddress,
  getContactAddressLine,
  getLegalIdentityConfig,
  legalOperator,
  type LegalIdentityConfig,
} from "@/config/legal";

export type OperatorIdentity = {
  legalName: string | null;
  ico: string | null;
  dic: string | null;
  street: string | null;
  district: string | null;
  city: string | null;
  zip: string | null;
  country: string;
  email: string;
  /** null = neveřejňovat jako telefon provozovatele */
  phone: string | null;
  publicRegisterUrl: string | null;
  registryName: string | null;
  privacyEmail: string;
  dataControllerName: string;
  dpoContact: string | null;
  lastLegalReviewDate: string | null;
  legalReviewedBy: string | null;
  registeredOffice: string | null;
  court: string | null;
  registerSection: string | null;
  registerInsert: string | null;
  representative: string | null;
  brand: string;
  isProductionReady: boolean;
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
  return {
    legalName: config.legalName,
    ico: config.companyId,
    dic: envOrNull("LEGAL_OPERATOR_DIC", "NEXT_PUBLIC_LEGAL_OPERATOR_DIC"),
    street: config.street,
    district: config.district,
    city: config.city,
    zip: config.zip,
    country: config.country,
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
    court: config.court,
    registerSection: config.registerSection,
    registerInsert: config.registerInsert,
    representative: config.representative,
    brand: config.brand,
    isProductionReady: Boolean(
      config.legalName &&
        config.companyId &&
        config.registeredOffice &&
        config.registryUrl &&
        config.missingRequiredFields.length === 0
    ),
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

/** Kompaktní adresa pro patičku / kontakt (bez země). */
export function formatOperatorAddressCompact(op: OperatorIdentity): string {
  if (op.street && op.city && op.zip) {
    return formatCompactOfficeAddress({
      street: op.street,
      district: op.district,
      zip: op.zip,
      city: op.city,
    });
  }
  return formatOperatorAddress(op);
}

export function formatOperatorRegisterLine(op: OperatorIdentity): string | null {
  if (!op.court || !op.registerSection || !op.registerInsert) return null;
  return formatCommercialRegisterLine({
    court: op.court,
    registerSection: op.registerSection,
    registerInsert: op.registerInsert,
  });
}

export function operatorDisplayName(op: OperatorIdentity): string {
  return op.dataControllerName || legalOperator.companyName;
}

/** Placená analýza ke koupi — jen když je provozovatel i checkout připraven. */
export function isPaidAnalysisCommerciallyAvailable(): boolean {
  const op = getOperatorIdentity();
  const checkoutLive =
    process.env.PAID_ANALYSIS_CHECKOUT_LIVE === "true" ||
    process.env.NEXT_PUBLIC_PAID_ANALYSIS_CHECKOUT_LIVE === "true";
  return op.isProductionReady && checkoutLive;
}
