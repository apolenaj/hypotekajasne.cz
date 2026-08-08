/**
 * Centrální právní konfigurace provozovatele.
 *
 * Dočasný provozovatel: HEINZKE & partneři s.r.o.
 * Sídlo je ATOMICKÉ — vždy z `legalOperator` níže.
 * Neskládat STREET/CITY/ZIP z env (historicky způsobilo Pavlovova + Krnov).
 *
 * Env smí přepsat jen neadresní údaje (jméno/IČO/e-mail/registr URL),
 * a to jen pokud neobsahují zastaralé hodnoty (Josef / 19488483 / Krnov…).
 *
 * INTERNAL (never render to users):
 * Before final commercial launch, verify the exact current regulatory
 * relationship between HEINZKE & partneři s.r.o. and INSIA in the ČNB
 * register and replace neutral cooperation wording with the exact legally
 * correct designation if appropriate.
 */

/** Strukturovaná identifikace provozovatele (zdroj pravdy pro UI). */
export const legalOperator = {
  brand: "Hypotéka Jasně",
  companyName: "HEINZKE & partneři s.r.o.",
  ico: "10880097",
  street: "Pavlovova 3048/40",
  district: "Zábřeh",
  city: "Ostrava",
  zip: "700 30",
  country: "Česká republika",
  court: "Krajský soud v Ostravě",
  registerSection: "C",
  registerInsert: "85937",
  representative: "Michal Heinzke",
  email: "info@hypotekajasne.cz",
  /** Veřejný výpis OR podle IČO (justice.cz) — bez vymyšlené ČNB licence. */
  registryUrl: "https://or.justice.cz/ias/ui/rejstrik-$firma?ico=10880097",
  registryName: "Obchodní rejstřík",
} as const;

export const projectFounder = {
  name: "Josef Apolenář",
  displayName: "Bc. Josef Apolenář BSc., MBA",
  role: "Zakladatel projektu Hypotéka Jasně",
  roleProduct: "Zakladatel a produktový tvůrce Hypotéka Jasně",
  description:
    "Josef stojí za konceptem, produktem a vývojem platformy Hypotéka Jasně. Zaměřuje se na digitální nástroje, kalkulačky, uživatelskou zkušenost a rozvoj platformy.",
} as const;

/**
 * Ensure a sentence ends with exactly one terminal punctuation mark.
 * Prevents „s.r.o..“ when `legalOperator.companyName` already ends with „.“.
 */
export function withSentencePeriod(text: string): string {
  const t = text.trim();
  if (!t) return t;
  return /[.!?…]$/.test(t) ? t : `${t}.`;
}

export const financialPartner = {
  company: legalOperator.companyName,
  representative: legalOperator.representative,
  representativeRole: `Jednatel ${legalOperator.companyName}`,
  specialistTitle: "Hypoteční specialista",
  network: "INSIA",
  /**
   * Neutrální zákaznické znění — bez konkrétního ČNB statusu,
   * dokud není ověřen (viz INTERNAL poznámka výše).
   */
  cooperationWording: `Zprostředkování hypotečních a souvisejících finančních služeb zajišťuje ${legalOperator.companyName} ve spolupráci se společností INSIA.`,
  platformWording: `Platformu ${legalOperator.brand} provozuje ${withSentencePeriod(legalOperator.companyName)} Zprostředkování hypotečních a souvisejících finančních služeb je zajišťováno ve spolupráci se společností INSIA.`,
  michalDescription: `Michal zajišťuje odbornou část související s hypotečním financováním a individuálním řešením klientských případů prostřednictvím ${legalOperator.companyName}, která spolupracuje se sítí INSIA.`,
} as const;

/** @deprecated Prefer legalOperator — retained for adapters. */
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
  /** null = neveřejňovat jako telefon provozovatele (neinventujeme číslo firmy). */
  phone: string | null;
  court: string | null;
  registerSection: string | null;
  registerInsert: string | null;
  representative: string | null;
  brand: string;
  street: string | null;
  district: string | null;
  city: string | null;
  zip: string | null;
  country: string;
  /** Interní — názvy chybějících povinných polí (ne renderovat uživateli). */
  missingRequiredFields: string[];
};

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
 * Zastaralé hodnoty předchozího provozovatele / sídla — nikdy nepoužívat ve veřejném UI,
 * ani když by je omylem obsahovalo produkční env.
 * Pozn.: „794 01 Krnov“ nesmí být kombinováno s Pavlovova 3048/40.
 */
const OBSOLETE_OPERATOR_VALUE_RE =
  /19488483|Soukenická|Hunger\s*killers|Josef\s+Apolen[aá][rř]|Krnov|794\s*01|79401/i;

function isObsoleteOperatorValue(value: string | null): boolean {
  if (!value) return false;
  return OBSOLETE_OPERATOR_VALUE_RE.test(value);
}

/** Detekce smíchané adresy (např. Pavlovova + Krnov). */
function isMixedOrInvalidOperatorAddress(value: string | null): boolean {
  if (!value) return false;
  if (isObsoleteOperatorValue(value)) return true;
  const hasPavlovova = /Pavlovova/i.test(value);
  const hasKrnovOrOldZip = /Krnov|794\s*01|79401/i.test(value);
  if (hasPavlovova && hasKrnovOrOldZip) return true;
  return false;
}

function cleanEnvOrDefault(envKeys: string[], fallback: string): string {
  const fromEnv = envOrNull(...envKeys);
  if (
    fromEnv &&
    !looksLikePlaceholder(fromEnv) &&
    !isObsoleteOperatorValue(fromEnv)
  ) {
    return fromEnv;
  }
  return fallback;
}

function formatRegisteredOffice(parts: {
  street: string;
  district?: string;
  zip: string;
  city: string;
  country: string;
}): string {
  const locality = parts.district
    ? `${parts.district}, ${parts.zip} ${parts.city}`
    : `${parts.zip} ${parts.city}`;
  return `${parts.street}, ${locality}, ${parts.country}`;
}

/** Kompaktní adresa bez země (patička / kontakt). */
export function formatCompactOfficeAddress(parts: {
  street: string;
  district?: string | null;
  zip: string;
  city: string;
}): string {
  if (parts.district) {
    return `${parts.street}, ${parts.district}, ${parts.zip} ${parts.city}`;
  }
  return `${parts.street}, ${parts.zip} ${parts.city}`;
}

/** Atomické sídlo HEINZKE — vždy z `legalOperator`, nikdy z env částí. */
function heinzkeRegisteredOfficeParts() {
  return {
    street: legalOperator.street,
    district: legalOperator.district,
    zip: legalOperator.zip,
    city: legalOperator.city,
    country: legalOperator.country,
  } as const;
}

/**
 * Sídlo provozovatele = výhradně `legalOperator`.
 * LEGAL_OPERATOR_STREET / CITY / ZIP / DISTRICT / REGISTERED_OFFICE se
 * pro HEINZKE záměrně nepoužívají (zdroj smíchaných adres s Krnov).
 */
function resolveHeinzkeRegisteredOffice(): {
  street: string;
  district: string;
  zip: string;
  city: string;
  country: string;
  registeredOffice: string;
} {
  const defaults = heinzkeRegisteredOfficeParts();
  return {
    ...defaults,
    registeredOffice: formatRegisteredOffice(defaults),
  };
}

/** Komunikační / sídlení adresa z centrální konfigurace. */
export function getContactAddressLine(): string {
  return (
    getLegalIdentityConfig().registeredOffice ??
    formatRegisteredOffice(heinzkeRegisteredOfficeParts())
  );
}

/** Nominative court name → instrumental for „vedeném …“. */
function courtNameInstrumental(court: string): string {
  const trimmed = court.trim();
  if (/soudem\b/i.test(trimmed)) return trimmed;
  if (trimmed === "Krajský soud v Ostravě") {
    return "Krajským soudem v Ostravě";
  }
  return trimmed.replace(/^Krajský soud\b/i, "Krajským soudem");
}

export function formatCommercialRegisterLine(cfg: {
  court: string;
  registerSection: string;
  registerInsert: string;
}): string {
  return `Společnost je zapsána v obchodním rejstříku vedeném ${courtNameInstrumental(cfg.court)}, oddíl ${cfg.registerSection}, vložka ${cfg.registerInsert}.`;
}

export function getLegalIdentityConfig(): LegalIdentityConfig {
  const legalName = cleanEnvOrDefault(
    ["LEGAL_OPERATOR_LEGAL_NAME", "NEXT_PUBLIC_LEGAL_OPERATOR_LEGAL_NAME"],
    legalOperator.companyName
  );
  const companyId = cleanEnvOrDefault(
    ["LEGAL_OPERATOR_ICO", "NEXT_PUBLIC_LEGAL_OPERATOR_ICO"],
    legalOperator.ico
  );

  const office = resolveHeinzkeRegisteredOffice();
  const { street, district, zip, city, country, registeredOffice } = office;

  const registryName = cleanEnvOrDefault(
    ["LEGAL_OPERATOR_REGISTRY_NAME", "NEXT_PUBLIC_LEGAL_OPERATOR_REGISTRY_NAME"],
    legalOperator.registryName
  );
  const registryUrl = cleanEnvOrDefault(
    ["LEGAL_OPERATOR_REGISTER_URL", "NEXT_PUBLIC_LEGAL_OPERATOR_REGISTER_URL"],
    legalOperator.registryUrl
  );
  const contactEmail = cleanEnvOrDefault(
    ["LEGAL_OPERATOR_EMAIL", "NEXT_PUBLIC_LEGAL_OPERATOR_EMAIL"],
    legalOperator.email
  );
  const privacyEmail =
    envOrNull(
      "LEGAL_OPERATOR_PRIVACY_EMAIL",
      "NEXT_PUBLIC_LEGAL_OPERATOR_PRIVACY_EMAIL"
    ) ?? contactEmail;

  // Telefon firmy neuvádíme, dokud není explicitně nastaven v env.
  const phoneRaw = envOrNull(
    "LEGAL_OPERATOR_PHONE",
    "NEXT_PUBLIC_LEGAL_OPERATOR_PHONE"
  );
  const phone =
    phoneRaw && !looksLikePlaceholder(phoneRaw) ? phoneRaw : null;

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

  const court = cleanEnvOrDefault(
    ["LEGAL_OPERATOR_COURT", "NEXT_PUBLIC_LEGAL_OPERATOR_COURT"],
    legalOperator.court
  );
  const registerSection = cleanEnvOrDefault(
    [
      "LEGAL_OPERATOR_REGISTER_SECTION",
      "NEXT_PUBLIC_LEGAL_OPERATOR_REGISTER_SECTION",
    ],
    legalOperator.registerSection
  );
  const registerInsert = cleanEnvOrDefault(
    [
      "LEGAL_OPERATOR_REGISTER_INSERT",
      "NEXT_PUBLIC_LEGAL_OPERATOR_REGISTER_INSERT",
    ],
    legalOperator.registerInsert
  );
  const representative = cleanEnvOrDefault(
    [
      "LEGAL_OPERATOR_REPRESENTATIVE",
      "NEXT_PUBLIC_LEGAL_OPERATOR_REPRESENTATIVE",
    ],
    legalOperator.representative
  );

  const missingRequiredFields: string[] = [];
  if (!legalName || looksLikePlaceholder(legalName)) {
    missingRequiredFields.push("LEGAL_OPERATOR_LEGAL_NAME");
  }
  if (!companyId || looksLikePlaceholder(companyId)) {
    missingRequiredFields.push("LEGAL_OPERATOR_ICO");
  }
  if (!registeredOffice || isMixedOrInvalidOperatorAddress(registeredOffice)) {
    missingRequiredFields.push("legalOperator registered office (canonical)");
  }
  if (!registryUrl || looksLikePlaceholder(registryUrl)) {
    missingRequiredFields.push("LEGAL_OPERATOR_REGISTER_URL");
  }
  if (looksLikePlaceholder(contactEmail)) {
    missingRequiredFields.push("LEGAL_OPERATOR_EMAIL");
  }

  return {
    legalName,
    companyId,
    registeredOffice,
    registryName,
    registryUrl,
    contactEmail,
    privacyEmail,
    dataControllerName: legalName,
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
    court,
    registerSection,
    registerInsert,
    representative,
    brand: legalOperator.brand,
    street,
    district,
    city,
    zip,
    country,
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
  "Kontaktní údaje slouží ke komunikaci. Pro úplnou obchodní identifikaci provozovatele viz právní stránky.";

export const LEGAL_LEAD_BLOCKED_PUBLIC_MESSAGE =
  "Omlouváme se — příjem poptávek je dočasně pozastaven. Můžete nás kontaktovat e-mailem.";

/** Jen development — nikdy neukazovat uživateli v production UI. */
export function getLegalDevIncompleteNotice(
  config: LegalIdentityConfig = getLegalIdentityConfig()
): string | null {
  if (process.env.NODE_ENV === "production") return null;
  if (isLegalIdentityComplete(config)) return null;
  return `[DEV] Legal identity incomplete: ${config.missingRequiredFields.join(", ") || "(unknown)"}. Set LEGAL_OPERATOR_* — see docs/legal-production-checklist.md.`;
}

/** Komunikační fallback — adresa/e-mail provozovatele (bez telefonu firmy). */
export const LEGAL_CONTACT_FALLBACK = {
  email: legalOperator.email,
  street: legalOperator.street,
  district: legalOperator.district,
  city: legalOperator.city,
  zip: legalOperator.zip,
  country: legalOperator.country,
} as const;
