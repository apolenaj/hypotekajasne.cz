/**
 * Timestamped consent versioning — texty a verze souhlasů.
 * Při změně textu ZVYŠTE verzi; staré záznamy zůstávají auditovatelné.
 */

export const CONSENT_POLICY_VERSION = "2026-07-19.1" as const;
export const COOKIE_POLICY_VERSION = "2026-07-19.1" as const;
export const TERMS_VERSION = "2026-07-19.1" as const;
export const PAID_ANALYSIS_TERMS_VERSION = "2026-07-19.1" as const;

export type ConsentPurposeId =
  | "privacy_processing"
  | "partner_transfer"
  | "marketing"
  | "cookie_analytics"
  | "cookie_marketing";

export type ConsentPurposeCopy = {
  id: ConsentPurposeId;
  version: string;
  /** Krátký label u checkboxu */
  checkboxLabel: string;
  /** Delší popis pro policy */
  description: string;
  required: boolean;
};

/**
 * Jednotná politika analytiky:
 * Technické řešení i právní texty: analytika a marketing cookies POUZE se souhlasem.
 * Žádný „legitimate interest“ pro analytics cookies.
 */
export const ANALYTICS_LEGAL_BASIS = "consent" as const;

export const CONSENT_PURPOSES: Record<ConsentPurposeId, ConsentPurposeCopy> = {
  privacy_processing: {
    id: "privacy_processing",
    version: CONSENT_POLICY_VERSION,
    checkboxLabel:
      "Souhlasím se zpracováním údajů za účelem vyřízení mé žádosti (viz Zásady ochrany osobních údajů).",
    description:
      "Zpracování kontaktních a kontextových údajů pro odpověď / vyřízení formuláře provozovatelem. Nejde o univerzální marketingový souhlas.",
    required: true,
  },
  partner_transfer: {
    id: "partner_transfer",
    version: CONSENT_POLICY_VERSION,
    checkboxLabel:
      "Souhlasím s předáním údajů licencovanému partnerovi v uvedeném rozsahu (partner-specific).",
    description:
      "Výslovný souhlas s předáním konkrétnímu typu partnera. Odeslání formuláře samo o sobě není marketingový souhlas ani blanket transfer všem partnerům.",
    required: false, // required dynamicky podle zdroje
  },
  marketing: {
    id: "marketing",
    version: CONSENT_POLICY_VERSION,
    checkboxLabel:
      "Souhlasím se zasíláním obchodních sdělení e-mailem / telefonem (volitelné).",
    description:
      "Oddělený marketingový souhlas. Není odvozován z odeslání poptávky ani z partner transfer.",
    required: false,
  },
  cookie_analytics: {
    id: "cookie_analytics",
    version: COOKIE_POLICY_VERSION,
    checkboxLabel: "Analytické cookies",
    description:
      "Měření návštěvnosti (např. anonymizovaná analytika). Pouze po aktivním souhlasu — ne na základě oprávněného zájmu.",
    required: false,
  },
  cookie_marketing: {
    id: "cookie_marketing",
    version: COOKIE_POLICY_VERSION,
    checkboxLabel: "Marketingové cookies",
    description:
      "Remarketing / reklamní identifikátory. Pouze po aktivním souhlasu.",
    required: false,
  },
};

export type PartnerTransferScope =
  | "mortgage_specialist"
  | "majetio"
  | "broker_developer"
  | "none";

export const PARTNER_TRANSFER_SCOPE_LABELS: Record<
  PartnerTransferScope,
  string
> = {
  mortgage_specialist:
    "Licencovaný hypoteční specialista (viz /partneri)",
  majetio: "Majetio — property discovery / Financial Passport",
  broker_developer: "Makléř / developer (pouze pokud výslovně zvoleno)",
  none: "Bez předání třetí straně",
};
