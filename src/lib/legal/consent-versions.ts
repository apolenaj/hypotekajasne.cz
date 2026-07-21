/**
 * Timestamped consent versioning — texty a verze souhlasů.
 * Při změně textu ZVYŠTE verzi; staré záznamy zůstávají auditovatelné.
 */

import {
  isMortgagePartnerHandoffReady,
  partnerPublicDisplayName,
  getPrimaryMortgagePartner,
} from "@/lib/legal/partner-config";
import {
  getOperatorIdentity,
  operatorDisplayName,
} from "@/lib/legal/operator";

export const CONSENT_POLICY_VERSION = "2026-07-20.1" as const;
export const COOKIE_POLICY_VERSION = "2026-07-20.1" as const;
export const TERMS_VERSION = "2026-07-20.1" as const;
export const PAID_ANALYSIS_TERMS_VERSION = "2026-07-20.1" as const;

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
      "Souhlasím se zpracováním údajů provozovatelem webu Hypotéka Jasně (správce) za účelem vyřízení mé nezávazné poptávky / konzultace (viz Zásady ochrany osobních údajů). Hypotéka Jasně není banka.",
    description:
      "Zpracování kontaktních a kontextových údajů správcem (provozovatel Hypotéka Jasně) pro odpověď a vyřízení formuláře. Nejde o univerzální marketingový souhlas ani o nabídku banky.",
    required: true,
  },
  partner_transfer: {
    id: "partner_transfer",
    version: CONSENT_POLICY_VERSION,
    checkboxLabel:
      "Souhlasím s předáním údajů licencovanému hypotečnímu specialistovi (samostatný správce) za účelem nezávazné konzultace hypotéky — v uvedeném rozsahu.",
    description:
      "Výslovný souhlas s předáním konkrétnímu typu partnera. Partner jedná ve vlastní licenci; Hypotéka Jasně není banka ani zprostředkovatel dle z. č. 257/2016 Sb. Odeslání formuláře samo o sobě není marketingový souhlas.",
    required: false,
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
  mortgage_specialist: "Licencovaný hypoteční specialista",
  majetio: "Majetio — vyhledání a analýza nemovitostí / Finanční pas",
  broker_developer: "Makléř / developer (pouze pokud výslovně zvoleno)",
  none: "Bez předání třetí straně",
};

/** Dynamický checkbox text — bez odkazu na /partneri, pokud identita není zveřejněna. */
export function buildPartnerTransferCheckboxLabel(
  scope: PartnerTransferScope
): string {
  const base = CONSENT_PURPOSES.partner_transfer.checkboxLabel;
  const scopeLabel = PARTNER_TRANSFER_SCOPE_LABELS[scope];

  if (scope === "mortgage_specialist" && isMortgagePartnerHandoffReady()) {
    const name = partnerPublicDisplayName(getPrimaryMortgagePartner());
    return `${base} Příjemce: ${name}. Rozsah: ${scopeLabel}.`;
  }

  if (scope === "mortgage_specialist") {
    return `${base} Rozsah: ${scopeLabel}. Identita konkrétního specialisty bude uvedena až po zveřejnění ověřených registračních údajů — do té doby údaje přijímá provozovatel webu.`;
  }

  return `${base} Rozsah: ${scopeLabel}.`;
}

/** Krátké shrnutí u formuláře (správce / účel / role). */
export function buildConsentContextSummary(): string {
  const op = getOperatorIdentity();
  const spravce = operatorDisplayName(op);
  const handoff = isMortgagePartnerHandoffReady();
  return [
    `Správce údajů z formuláře: ${spravce}.`,
    "Účel: vyřízení nezávazné poptávky / konzultace.",
    "Hypotéka Jasně není banka a neschvaluje úvěry.",
    handoff
      ? "Při souhlasu s předáním se stává samostatným správcem licencovaný hypoteční specialista (viz Partneři)."
      : "Předání licencovanému specialistovi není produkčně aktivní, dokud není zveřejněna ověřená identita partnera.",
  ].join(" ");
}
