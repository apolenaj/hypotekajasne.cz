/**
 * Centrální právní konfigurace provozovatele.
 *
 * Provozovatel: Hunger killers s.r.o.
 * Sídlo je ATOMICKÉ — vždy z `legalOperator` níže.
 * Neskládat STREET/CITY/ZIP z env (historicky způsobilo smíchané adresy).
 *
 * Env smí přepsat jen neadresní údaje (jméno/IČO/e-mail/registr URL),
 * a to jen pokud neobsahují zastaralé hodnoty (HEINZKE / 10880097 / Pavlovova…).
 *
 * INTERNAL (never render to users):
 * Do not invent ČNB intermediary status. Lead handoff to third parties stays off
 * until a verified partner identity is configured.
 */

/** Strukturovaná identifikace provozovatele (zdroj pravdy pro UI). */
export const legalOperator = {
  brand: "Hypotéka Jasně",
  companyName: "Hunger killers s.r.o.",
  ico: "19488483",
  street: "Soukenická 82/6",
  district: "Pod Bezručovým vrchem",
  city: "Krnov",
  zip: "794 01",
  country: "Česká republika",
  court: "Krajský soud v Ostravě",
  registerSection: "C",
  registerInsert: "93063",
  representative: "Bc. Josef Apolenář BSc., MBA",
  email: "info@hypotekajasne.cz",
  phone: "+420 727 814 810",
  /** Veřejný výpis OR podle IČO (justice.cz) — bez vymyšlené ČNB licence. */
  registryUrl: "https://or.justice.cz/ias/ui/rejstrik-$firma?ico=19488483",
  registryName: "Obchodní rejstřík",
} as const;

export const projectFounder = {
  name: "Josef Apolenář",
  displayName: "Bc. Josef Apolenář BSc., MBA",
  role: "Jednatel společnosti Hunger killers s.r.o. a zakladatel projektu Hypotéka Jasně",
  roleProduct: "Jednatel společnosti Hunger killers s.r.o. a zakladatel projektu Hypotéka Jasně",
  description:
    "Josef stojí za konceptem, produktem a vývojem platformy Hypotéka Jasně. Zaměřuje se na digitální nástroje, kalkulačky, uživatelskou zkušenost a rozvoj platformy. Není hypotečním specialistou, finančním poradcem ani regulovaným hypotečním zprostředkovatelem.",
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

const COOPERATION_NEUTRAL_CS = `${legalOperator.companyName.replace(/[.!?…]+$/, "")} provozuje platformu ${legalOperator.brand}. V oblasti hypoteček může spolupracovat s dalšími subjekty — podrobnosti uvádíme po ověření.`;

/**
 * Veřejné role kolem provozovatele — bez tvrzení o hypotečním zprostředkování.
 * `representative` = jednatel Hunger killers (Josef).
 */
export const financialPartner = {
  company: legalOperator.companyName,
  representative: legalOperator.representative,
  representativeRole: `Jednatel společnosti ${legalOperator.companyName}`,
  cooperationWording: COOPERATION_NEUTRAL_CS,
  platformWording: `${legalOperator.brand} je technologická a informační platforma provozovaná společností ${withSentencePeriod(legalOperator.companyName)} ${COOPERATION_NEUTRAL_CS}`,
} as const;

/** Regulatorně bezpečný popis platformy (CS). */
export const PLATFORM_SAFE_DESCRIPTION_CS =
  "Hypotéka Jasně je technologická a informační platforma provozovaná společností Hunger killers s.r.o. Není bankou a neposkytuje závazné nabídky úvěrů. Kalkulace a další výstupy jsou orientační. Schválení úvěru a jeho konečné podmínky vždy určuje příslušná banka.";

/** Intro věta pro Kontakt / O nás. */
export function getPlatformOperatorIntroCs(): string {
  const office = formatCompactOfficeAddress({
    street: legalOperator.street,
    district: legalOperator.district,
    zip: legalOperator.zip,
    city: legalOperator.city,
  });
  return `Provozovatelem platformy ${legalOperator.brand} je ${legalOperator.companyName}, IČO ${legalOperator.ico}, se sídlem ${office}.`;
}

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
 * Zastaralé hodnoty předchozího provozovatele — nikdy nepoužívat ve veřejném UI,
 * ani když by je omylem obsahovalo produkční env.
 */
const OBSOLETE_OPERATOR_VALUE_RE =
  /10880097|Pavlovova|HEINZKE|Heinzke|Michal\s+Heinzke|Zábřeh|700\s*30|85937|INSIA|heinzke\.cz/i;

function isObsoleteOperatorValue(value: string | null): boolean {
  if (!value) return false;
  return OBSOLETE_OPERATOR_VALUE_RE.test(value);
}

/** Env nesmí nahradit firmu jménem fyzické osoby. */
function isNonCompanyLegalName(value: string | null): boolean {
  if (!value) return false;
  if (/Hunger\s*killers/i.test(value)) return false;
  if (
    /Josef|Michal|Apolen[aá][rř]/i.test(value) &&
    !/s\.?\s*r\.?\s*o\.?/i.test(value)
  ) {
    return true;
  }
  if (!/s\.?\s*r\.?\s*o\.?/i.test(value) && !/\ba\.?\s*s\.?\b/i.test(value)) {
    return true;
  }
  return false;
}

/** Detekce smíchané nebo zastaralé adresy (např. Pavlovova + Krnov). */
function isMixedOrInvalidOperatorAddress(value: string | null): boolean {
  if (!value) return false;
  if (isObsoleteOperatorValue(value)) return true;
  const hasPavlovova = /Pavlovova/i.test(value);
  const hasKrnov = /Krnov|794\s*01|79401/i.test(value);
  if (hasPavlovova && hasKrnov) return true;
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

function cleanLegalNameOrDefault(fallback: string): string {
  const fromEnv = envOrNull(
    "LEGAL_OPERATOR_LEGAL_NAME",
    "NEXT_PUBLIC_LEGAL_OPERATOR_LEGAL_NAME"
  );
  if (
    fromEnv &&
    !looksLikePlaceholder(fromEnv) &&
    !isObsoleteOperatorValue(fromEnv) &&
    !isNonCompanyLegalName(fromEnv)
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

/** Atomické sídlo provozovatele — vždy z `legalOperator`, nikdy z env částí. */
function operatorRegisteredOfficeParts() {
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
 * záměrně nepoužívají (zdroj smíchaných / zastaralých adres).
 */
function resolveOperatorRegisteredOffice(): {
  street: string;
  district: string;
  zip: string;
  city: string;
  country: string;
  registeredOffice: string;
} {
  const defaults = operatorRegisteredOfficeParts();
  return {
    ...defaults,
    registeredOffice: formatRegisteredOffice(defaults),
  };
}

/** Komunikační / sídlení adresa z centrální konfigurace. */
export function getContactAddressLine(): string {
  return (
    getLegalIdentityConfig().registeredOffice ??
    formatRegisteredOffice(operatorRegisteredOfficeParts())
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
  const legalName = cleanLegalNameOrDefault(legalOperator.companyName);
  const companyId = cleanEnvOrDefault(
    ["LEGAL_OPERATOR_ICO", "NEXT_PUBLIC_LEGAL_OPERATOR_ICO"],
    legalOperator.ico
  );

  const office = resolveOperatorRegisteredOffice();
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

  const phoneRaw = envOrNull(
    "LEGAL_OPERATOR_PHONE",
    "NEXT_PUBLIC_LEGAL_OPERATOR_PHONE"
  );
  const phone =
    phoneRaw &&
    !looksLikePlaceholder(phoneRaw) &&
    !isObsoleteOperatorValue(phoneRaw)
      ? phoneRaw
      : legalOperator.phone;

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

/** Komunikační fallback — adresa/e-mail provozovatele. */
export const LEGAL_CONTACT_FALLBACK = {
  email: legalOperator.email,
  street: legalOperator.street,
  district: legalOperator.district,
  city: legalOperator.city,
  zip: legalOperator.zip,
  country: legalOperator.country,
} as const;
