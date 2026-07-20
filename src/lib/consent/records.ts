/**
 * Form + cookie consent records (client + API).
 */

import type { LeadSource } from "@/lib/leads";
import {
  CONSENT_POLICY_VERSION,
  COOKIE_POLICY_VERSION,
  type PartnerTransferScope,
} from "@/lib/legal/consent-versions";

export type FormConsentRecord = {
  policyVersion: typeof CONSENT_POLICY_VERSION | string;
  privacyAccepted: boolean;
  partnerTransferAccepted: boolean;
  partnerTransferScope: PartnerTransferScope;
  marketingAccepted: boolean;
  /** ISO-8601 — kdy uživatel potvrdil */
  consentedAt: string;
  /** UI locale / page path optional */
  sourcePath?: string;
};

export type CookieConsentCategories = {
  necessary: true; // always
  analytics: boolean;
  marketing: boolean;
};

export type CookieConsentRecord = {
  policyVersion: typeof COOKIE_POLICY_VERSION | string;
  categories: CookieConsentCategories;
  decidedAt: string;
};

export const COOKIE_STORAGE_KEY = "hj_cookie_consent_v1";

/** Zdroje, u kterých je partner transfer povinný (handoff). */
export function requiresPartnerTransfer(source: LeadSource): boolean {
  return (
    source === "lead_gen" ||
    source === "navrh_na_miru" ||
    source === "investment_passport" ||
    source === "mortgage_calculator" ||
    source === "property_analysis" ||
    source === "country_hub"
  );
}

/** Newsletter = výslovný marketing; bez marketingAccepted neukládat. */
export function requiresMarketingConsent(source: LeadSource): boolean {
  return source === "newsletter";
}

export function defaultPartnerScope(
  source: LeadSource
): PartnerTransferScope {
  if (source === "property_analysis") return "majetio";
  if (requiresPartnerTransfer(source)) return "mortgage_specialist";
  return "none";
}

export function validateFormConsent(
  source: LeadSource,
  consent: FormConsentRecord | undefined | null
): { ok: true; consent: FormConsentRecord } | { ok: false; error: string } {
  if (!consent) {
    return {
      ok: false,
      error: "Chybí záznam souhlasů (consent record).",
    };
  }
  if (!consent.privacyAccepted) {
    return {
      ok: false,
      error: "Je nutný souhlas se zpracováním údajů pro vyřízení žádosti.",
    };
  }
  if (requiresPartnerTransfer(source) && !consent.partnerTransferAccepted) {
    return {
      ok: false,
      error:
        "Pro předání partnerovi je nutný výslovný partner-specific souhlas.",
    };
  }
  if (requiresMarketingConsent(source) && !consent.marketingAccepted) {
    return {
      ok: false,
      error: "Pro newsletter je nutný výslovný marketingový souhlas.",
    };
  }
  // Nikdy neodvozovat marketing z pouhého odeslání
  return {
    ok: true,
    consent: {
      ...consent,
      policyVersion: consent.policyVersion || CONSENT_POLICY_VERSION,
      marketingAccepted: Boolean(consent.marketingAccepted),
      consentedAt: consent.consentedAt || new Date().toISOString(),
    },
  };
}

export function buildFormConsentRecord(input: {
  privacyAccepted: boolean;
  partnerTransferAccepted: boolean;
  partnerTransferScope: PartnerTransferScope;
  marketingAccepted: boolean;
  sourcePath?: string;
}): FormConsentRecord {
  return {
    policyVersion: CONSENT_POLICY_VERSION,
    privacyAccepted: input.privacyAccepted,
    partnerTransferAccepted: input.partnerTransferAccepted,
    partnerTransferScope: input.partnerTransferScope,
    marketingAccepted: input.marketingAccepted,
    consentedAt: new Date().toISOString(),
    sourcePath: input.sourcePath,
  };
}
