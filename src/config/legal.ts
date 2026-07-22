/**
 * Centrální právní konfigurace provozovatele (PROMPT 1).
 *
 * NEVYMÝŠLET: právní jméno, IČO, sídlo, registraci, review.
 * Doplňte ověřené hodnoty přes env (viz docs/legal-production-checklist.md).
 * Null / chybějící = ve veřejném UI neuvádět a netvrdit kompletnost.
 */

export type LegalIdentityConfig = {
  legalName: string | null;
  companyId: string | null;
  registeredOffice: string | null;
  registryName: string | null;
  registryUrl: string | null;
  contactEmail: string;
  privacyEmail: string;
  dataControllerName: string;
  dpoContact: string | null;
  lastLegalReviewDate: string | null;
  legalReviewedBy: string | null;
  phone: string;
  /** Interní — názvy chybějících povinných polí (ne renderovat uživateli). */
  missingRequiredFields: string[];
};

/** Kontaktní fallback jen pro komunikaci — NENÍ náhradou za právní identifikaci. */
const CONTACT_FALLBACK = {
  email: "info@hypotekajasne.cz",
  phone: "+420 727 814 810",
  street: "Soukenická 6",
  city: "Krnov",
  zip: "79401",
  country: "Česká republika",
} as const;

function envOrNull(...keys: string[]): string | null {
  for (const key of keys) {
    const v = process.env[key]?.trim();
    if (v && v.length > 0) return v;
  }
  return null;
}

function looksLikePlaceholder(value: string | null): boolean {
  if (!value) return false;
  return /TODO|TBD|PLACEHOLDER|doplníme|čeká na ověření|pending/i.test(value);
}

/**
 * Sestaví registrované sídlo jen z explicitních env (ne z kontaktního fallbacku).
 * Fallback adresa slouží ke komunikaci, ale nepočítá se do „kompletní identity“.
 */
function buildRegisteredOfficeFromEnv(): string | null {
  const single = envOrNull(
    "LEGAL_OPERATOR_REGISTERED_OFFICE",
    "NEXT_PUBLIC_LEGAL_OPERATOR_REGISTERED_OFFICE"
  );
  if (single && !looksLikePlaceholder(single)) return single;

  const street = envOrNull(
    "LEGAL_OPERATOR_STREET",
    "NEXT_PUBLIC_LEGAL_OPERATOR_STREET"
  );
  const city = envOrNull(
    "LEGAL_OPERATOR_CITY",
    "NEXT_PUBLIC_LEGAL_OPERATOR_CITY"
  );
  const zip = envOrNull(
    "LEGAL_OPERATOR_ZIP",
    "NEXT_PUBLIC_LEGAL_OPERATOR_ZIP"
  );
  if (!street || !city || !zip) return null;
  if (
    looksLikePlaceholder(street) ||
    looksLikePlaceholder(city) ||
    looksLikePlaceholder(zip)
  ) {
    return null;
  }
  return [street, zip, city, CONTACT_FALLBACK.country].join(", ");
}

/** Komunikační adresa — smí použít kontaktní fallback. */
export function getContactAddressLine(): string {
  const office = buildRegisteredOfficeFromEnv();
  if (office) return office;
  return [
    CONTACT_FALLBACK.street,
    CONTACT_FALLBACK.zip,
    CONTACT_FALLBACK.city,
    CONTACT_FALLBACK.country,
  ].join(", ");
}

export function getLegalIdentityConfig(): LegalIdentityConfig {
  const legalName = envOrNull(
    "LEGAL_OPERATOR_LEGAL_NAME",
    "NEXT_PUBLIC_LEGAL_OPERATOR_LEGAL_NAME"
  );
  const companyId = envOrNull(
    "LEGAL_OPERATOR_ICO",
    "NEXT_PUBLIC_LEGAL_OPERATOR_ICO"
  );
  const registeredOffice = buildRegisteredOfficeFromEnv();
  const registryName = envOrNull(
    "LEGAL_OPERATOR_REGISTRY_NAME",
    "NEXT_PUBLIC_LEGAL_OPERATOR_REGISTRY_NAME"
  );
  const registryUrl = envOrNull(
    "LEGAL_OPERATOR_REGISTER_URL",
    "NEXT_PUBLIC_LEGAL_OPERATOR_REGISTER_URL"
  );
  const contactEmail =
    envOrNull("LEGAL_OPERATOR_EMAIL", "NEXT_PUBLIC_LEGAL_OPERATOR_EMAIL") ??
    CONTACT_FALLBACK.email;
  const privacyEmail =
    envOrNull(
      "LEGAL_OPERATOR_PRIVACY_EMAIL",
      "NEXT_PUBLIC_LEGAL_OPERATOR_PRIVACY_EMAIL"
    ) ?? contactEmail;
  const phone =
    envOrNull("LEGAL_OPERATOR_PHONE", "NEXT_PUBLIC_LEGAL_OPERATOR_PHONE") ??
    CONTACT_FALLBACK.phone;
  const dpoContact = envOrNull(
    "LEGAL_OPERATOR_DPO_CONTACT",
    "NEXT_PUBLIC_LEGAL_OPERATOR_DPO_CONTACT"
  );
  const lastLegalReviewDate = envOrNull(
    "LEGAL_LAST_REVIEW_DATE",
    "NEXT_PUBLIC_LEGAL_LAST_REVIEW_DATE"
  );
  const legalReviewedBy = envOrNull(
    "LEGAL_REVIEWED_BY",
    "NEXT_PUBLIC_LEGAL_REVIEWED_BY"
  );

  const missingRequiredFields: string[] = [];
  if (!legalName || looksLikePlaceholder(legalName)) {
    missingRequiredFields.push("LEGAL_OPERATOR_LEGAL_NAME");
  }
  if (!companyId || looksLikePlaceholder(companyId)) {
    missingRequiredFields.push("LEGAL_OPERATOR_ICO");
  }
  if (!registeredOffice) {
    missingRequiredFields.push(
      "LEGAL_OPERATOR_REGISTERED_OFFICE or STREET+CITY+ZIP"
    );
  }
  if (!registryUrl || looksLikePlaceholder(registryUrl)) {
    missingRequiredFields.push("LEGAL_OPERATOR_REGISTER_URL");
  }
  if (looksLikePlaceholder(contactEmail)) {
    missingRequiredFields.push("LEGAL_OPERATOR_EMAIL");
  }

  const cleanName =
    legalName && !looksLikePlaceholder(legalName) ? legalName : null;
  const cleanId =
    companyId && !looksLikePlaceholder(companyId) ? companyId : null;
  const cleanRegistryUrl =
    registryUrl && !looksLikePlaceholder(registryUrl) ? registryUrl : null;
  const cleanRegistryName =
    registryName && !looksLikePlaceholder(registryName) ? registryName : null;

  return {
    legalName: cleanName,
    companyId: cleanId,
    registeredOffice,
    registryName: cleanRegistryName,
    registryUrl: cleanRegistryUrl,
    contactEmail,
    privacyEmail,
    dataControllerName: cleanName ?? "Provozovatel platformy Hypotéka Jasně",
    dpoContact:
      dpoContact && !looksLikePlaceholder(dpoContact) ? dpoContact : null,
    lastLegalReviewDate:
      lastLegalReviewDate && !looksLikePlaceholder(lastLegalReviewDate)
        ? lastLegalReviewDate
        : null,
    legalReviewedBy:
      legalReviewedBy && !looksLikePlaceholder(legalReviewedBy)
        ? legalReviewedBy
        : null,
    phone,
    missingRequiredFields,
  };
}

/** Povinná právní identita pro produkční sběr leadů je kompletní. */
export function isLegalIdentityComplete(
  config: LegalIdentityConfig = getLegalIdentityConfig()
): boolean {
  return (
    Boolean(config.legalName) &&
    Boolean(config.companyId) &&
    Boolean(config.registeredOffice) &&
    Boolean(config.registryUrl) &&
    Boolean(config.contactEmail) &&
    Boolean(config.privacyEmail) &&
    config.missingRequiredFields.length === 0
  );
}

/**
 * Texty smí tvrdit „právně zkontrolováno“ jen s reviewerem + datem.
 * Bez toho: žádné falešné „legal reviewed“ ve veřejném UI.
 */
export function isLegalTextReviewed(
  config: LegalIdentityConfig = getLegalIdentityConfig()
): boolean {
  return Boolean(config.lastLegalReviewDate && config.legalReviewedBy);
}

/**
 * Produkční režim, kde se sbírají osobní/finanční leady a vyžadujeme kompletní identitu.
 * Escape hatch: LEGAL_ALLOW_INCOMPLETE_FOR_LEADS=true (jen výjimečně, dokumentovat).
 */
export function mustEnforceLegalIdentityForLeadCollection(): boolean {
  if (process.env.LEGAL_ALLOW_INCOMPLETE_FOR_LEADS === "true") {
    return false;
  }
  if (process.env.LEGAL_REQUIRE_OPERATOR_FOR_LEADS === "false") {
    return false;
  }
  if (process.env.LEGAL_STRICT_PRODUCTION === "true") return true;
  if (process.env.LEGAL_REQUIRE_OPERATOR_FOR_LEADS === "true") return true;
  if (process.env.NEXT_PUBLIC_LEGAL_REQUIRE_OPERATOR_FOR_LEADS === "true") {
    return true;
  }
  if (process.env.VERCEL_ENV === "production") return true;
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === "production") return true;
  return false;
}

/** Veřejná bezpečná zpráva — bez TODO / interních poznámek. */
export const LEGAL_IDENTITY_INCOMPLETE_PUBLIC_MESSAGE =
  "Úplná obchodní identifikace provozovatele zatím není ve veřejném configu. Kontaktní údaje slouží ke komunikaci; sběr poptávek v produkci vyžaduje doplnění ověřených údajů provozovatelem.";

export const LEGAL_LEAD_BLOCKED_PUBLIC_MESSAGE =
  "Omlouváme se — příjem poptávek je dočasně pozastaven, dokud provozovatel nedoplní ověřené právní údaje. Můžete nás kontaktovat e-mailem.";

/** Jen development — nikdy neukazovat uživateli v production UI. */
export function getLegalDevIncompleteNotice(
  config: LegalIdentityConfig = getLegalIdentityConfig()
): string | null {
  if (process.env.NODE_ENV === "production") return null;
  if (isLegalIdentityComplete(config)) return null;
  return `[DEV] Legal identity incomplete: ${config.missingRequiredFields.join(", ") || "(unknown)"}. Set LEGAL_OPERATOR_* — see docs/legal-production-checklist.md.`;
}

export { CONTACT_FALLBACK as LEGAL_CONTACT_FALLBACK };
