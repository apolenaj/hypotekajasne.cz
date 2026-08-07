/**
 * Form + cookie consent records (client + API).
 */

import type { LeadSource } from "@/lib/leads";
import {
  CONSENT_POLICY_VERSION,
  COOKIE_POLICY_VERSION,
  isThirdPartyTransferActive,
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

/**
 * Lead sources that *could* involve a third-party transfer when that transfer
 * is product-activated (never HEINZKE → HEINZKE).
 */
export function isPartnerHandoffLeadSource(source: LeadSource): boolean {
  return (
    source === "lead_gen" ||
    source === "expert_request" ||
    source === "navrh_na_miru" ||
    source === "investment_passport" ||
    source === "mortgage_calculator" ||
    source === "property_analysis" ||
    source === "country_hub"
  );
}

/** True only when a named third-party PII transfer is active for this lead source. */
export function requiresPartnerTransfer(source: LeadSource): boolean {
  return isThirdPartyTransferActive(defaultPartnerScope(source));
}

/** Newsletter = výslovný marketing; bez marketingAccepted neukládat. */
export function requiresMarketingConsent(source: LeadSource): boolean {
  return source === "newsletter";
}

export function defaultPartnerScope(
  source: LeadSource
): PartnerTransferScope {
  if (source === "property_analysis") {
    return isThirdPartyTransferActive("majetio") ? "majetio" : "none";
  }
  if (
    source === "lead_gen" ||
    source === "expert_request" ||
    source === "navrh_na_miru" ||
    source === "investment_passport" ||
    source === "mortgage_calculator" ||
    source === "country_hub"
  ) {
    return isThirdPartyTransferActive("mortgage_specialist")
      ? "mortgage_specialist"
      : "none";
  }
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
      error:
        "Potvrďte, že jste se seznámil/a se Zásadami ochrany osobních údajů.",
    };
  }
  if (requiresPartnerTransfer(source) && !consent.partnerTransferAccepted) {
    return {
      ok: false,
      error:
        "Pro předání třetí straně je nutný výslovný souhlas pro konkrétního příjemce.",
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
      partnerTransferScope:
        consent.partnerTransferScope || defaultPartnerScope(source),
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
