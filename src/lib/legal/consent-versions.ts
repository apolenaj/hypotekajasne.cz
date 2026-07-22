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
  canUseStrongPartnerTrustClaims,
  getPartnerClaimLabels,
  getPrimaryPartnerVerification,
} from "@/lib/partners/verification";
import { getLegalIdentityConfig } from "@/config/legal";

export const CONSENT_POLICY_VERSION = "2026-07-21.1" as const;
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
      "Souhlasím s předáním údajů ověřenému hypotečnímu partnerovi (samostatný správce) za účelem nezávazné konzultace hypotéky — v uvedeném rozsahu.",
    description:
      "Výslovný souhlas s předáním konkrétnímu partnerovi. Partner jedná ve vlastní registraci; Hypotéka Jasně není banka ani zprostředkovatel dle z. č. 257/2016 Sb. Odeslání formuláře samo o sobě není marketingový souhlas. Checkbox se nabízí jen pokud je partner ověřen.",
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

export function getPartnerTransferScopeLabels(): Record<
  PartnerTransferScope,
  string
> {
  const verified = canUseStrongPartnerTrustClaims();
  return {
    mortgage_specialist: verified
      ? "Ověřený hypoteční partner"
      : "Hypoteční partner (předání až po ověření identity)",
    majetio: "Majetio — vyhledání a analýza nemovitostí / Finanční pas",
    broker_developer: "Makléř / developer (pouze pokud výslovně zvoleno)",
    none: "Bez předání třetí straně",
  };
}

/** @deprecated Prefer getPartnerTransferScopeLabels() — static snapshot for docs. */
export const PARTNER_TRANSFER_SCOPE_LABELS: Record<
  PartnerTransferScope,
  string
> = {
  mortgage_specialist: "Hypoteční partner (předání až po ověření identity)",
  majetio: "Majetio — vyhledání a analýza nemovitostí / Finanční pas",
  broker_developer: "Makléř / developer (pouze pokud výslovně zvoleno)",
  none: "Bez předání třetí straně",
};

/** Dynamický checkbox text — používá centrální legal config (bez TODO stringů). */
export function buildPrivacyProcessingCheckboxLabel(): string {
  const cfg = getLegalIdentityConfig();
  const spravce = cfg.dataControllerName;
  return `Souhlasím se zpracováním údajů správcem (${spravce}) za účelem vyřízení mé nezávazné poptávky / konzultace (viz Zásady ochrany osobních údajů). Hypotéka Jasně není banka.`;
}

/** Dynamický checkbox text — bez odkazu na /partneri, pokud identita není zveřejněna. */
export function buildPartnerTransferCheckboxLabel(
  scope: PartnerTransferScope
): string {
  const scopeLabel = getPartnerTransferScopeLabels()[scope];

  if (scope === "mortgage_specialist" && isMortgagePartnerHandoffReady()) {
    const name = partnerPublicDisplayName(getPrimaryMortgagePartner());
    return `Souhlasím s předáním údajů ověřenému hypotečnímu partnerovi (samostatný správce) za účelem nezávazné konzultace hypotéky. Příjemce: ${name}. Rozsah: ${scopeLabel}.`;
  }

  if (scope === "mortgage_specialist") {
    return `Souhlasím se zpracováním údajů provozovatelem webu pro nezávaznou konzultaci. Předání třetímu partnerovi zatím není aktivní. Rozsah: ${scopeLabel}.`;
  }

  return `Souhlasím s předáním údajů partnerovi (samostatný správce) v uvedeném rozsahu. Rozsah: ${scopeLabel}.`;
}

/** Krátké shrnutí u formuláře (správce / účel / role). */
export function buildConsentContextSummary(): string {
  const cfg = getLegalIdentityConfig();
  const spravce = cfg.dataControllerName;
  const privacy = cfg.privacyEmail;
  const labels = getPartnerClaimLabels(getPrimaryPartnerVerification());
  return [
    `Správce údajů z formuláře: ${spravce}.`,
    `Kontakt pro ochranu údajů: ${privacy}.`,
    "Účel: vyřízení nezávazné poptávky / konzultace.",
    "Hypotéka Jasně není banka a neschvaluje úvěry.",
    labels.leadIntakeDisclosure,
  ].join(" ");
}
