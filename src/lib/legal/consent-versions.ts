/**
 * Timestamped consent versioning — texty a verze souhlasů.
 * Při změně textu ZVYŠTE verzi; staré záznamy zůstávají auditovatelné.
 */

import { buildLeadFormIntakeDisclosure } from "@/lib/legal/regulatory-texts";
import {
  isMortgagePartnerHandoffReady,
  getPrimaryMortgagePartner,
} from "@/lib/legal/partner-config";
import {
  getLegalIdentityConfig,
  legalOperator,
  withSentencePeriod,
} from "@/config/legal";

function legalNameInline(name: string): string {
  return name.trim().replace(/[.!?…]+$/, "");
}

export const CONSENT_POLICY_VERSION = "2026-08-31.1" as const;
export const COOKIE_POLICY_VERSION = "2026-08-07.2" as const;
export const TERMS_VERSION = "2026-07-20.1" as const;
export const PAID_ANALYSIS_TERMS_VERSION = "2026-07-20.1" as const;

/** Veřejné „Poslední aktualizace: D. M. YYYY“ z verze `YYYY-MM-DD…`. */
export function formatPolicyVersionDateCs(version: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(version.trim());
  if (!m) return null;
  return `${Number(m[3])}. ${Number(m[2])}. ${m[1]}`;
}

/**
 * Central legal-basis config for enquiry processing.
 * UI shows a privacy-notice acknowledgment — NOT Art. 6(1)(a) marketing-style consent.
 *
 * INTERNAL: Confirm the exact Art. 6 basis with counsel before commercial launch.
 */
export const ENQUIRY_PROCESSING_LEGAL_BASIS = {
  publicPurposeLabel: "Vyřízení nezávazné poptávky",
  art6Status: "pending_counsel" as const,
  internalNote:
    "Initial form → Hunger killers s.r.o. as controller. Not a third-party transfer. Confirm Art. 6 basis with counsel; UI must not fake marketing consent for enquiry processing.",
} as const;

export type ConsentPurposeId =
  | "privacy_processing"
  | "partner_transfer"
  | "marketing"
  | "cookie_analytics"
  | "cookie_marketing";

export type ConsentPurposeCopy = {
  id: ConsentPurposeId;
  version: string;
  checkboxLabel: string;
  description: string;
  required: boolean;
  /** privacy_notice = acknowledgment; consent = explicit opt-in */
  uiKind: "privacy_notice" | "consent";
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
    checkboxLabel: `Odesláním formuláře potvrzujete, že jste se seznámil/a se Zásadami ochrany osobních údajů. Údaje použije ${legalOperator.companyName} k vyřízení vaší zprávy nebo poptávky v rozsahu popsaném v těchto zásadách.`,
    description: `Zpracování kontaktních a kontextových údajů správcem ${legalOperator.companyName}, IČO ${legalOperator.ico} (provozovatel platformy ${legalOperator.brand}) pro odpověď a vyřízení formuláře / poptávky. Nejde o předání třetí straně, o marketingový souhlas ani o nabídku banky. Formulář zobrazuje seznámení se zásadami — ne fiktivní marketingový souhlas se zpracováním.`,
    required: true,
    uiKind: "privacy_notice",
  },
  partner_transfer: {
    id: "partner_transfer",
    version: CONSENT_POLICY_VERSION,
    checkboxLabel:
      "Souhlasím s předáním údajů konkrétnímu třetímu příjemci za uvedeným účelem.",
    description: `Výslovný souhlas se zobrazí jen pokud ${legalOperator.companyName} skutečně předává údaje jiné nezávislé entitě (konkrétní příjemce, Majetio, realitní partner). Není univerzálním souhlasem pro všechny možné příjemce. Počáteční poptávku přijímá provozovatel ${legalOperator.companyName} — to není předání třetí straně sobě samému.`,
    required: false,
    uiKind: "consent",
  },
  marketing: {
    id: "marketing",
    version: CONSENT_POLICY_VERSION,
    checkboxLabel: `Chci dostávat e-mailem novinky a užitečné informace od ${legalOperator.brand}. Souhlas mohu kdykoli odvolat.`,
    description: `Oddělený volitelný souhlas s e-mailovými novinkami ${legalOperator.brand}. Nezahrnuje telefonický marketing. Není odvozován z odeslání poptávky ani z předání třetí straně; výchozí stav je nezaškrtnuto. Právní základ: souhlas (čl. 6 odst. 1 písm. a) GDPR).`,
    required: false,
    uiKind: "consent",
  },
  cookie_analytics: {
    id: "cookie_analytics",
    version: COOKIE_POLICY_VERSION,
    checkboxLabel: "Analytické cookies",
    description:
      "Měření návštěvnosti prostřednictvím Google Analytics (gtag), pokud je v instalaci nastaveno Measurement ID. Pouze po aktivním souhlasu — ne na základě oprávněného zájmu. Bez nastaveného ID se gtag nenačte.",
    required: false,
    uiKind: "consent",
  },
  cookie_marketing: {
    id: "cookie_marketing",
    version: COOKIE_POLICY_VERSION,
    checkboxLabel: "Marketingové cookies",
    description:
      "Kategorie pro budoucí reklamní identifikátory. V současné implementaci se nenačítá žádný marketingový skript třetí strany (včetně Meta Pixel). Pouze po aktivním souhlasu, až bude skript skutečně zapojen.",
    required: false,
    uiKind: "consent",
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
  return {
    mortgage_specialist: "Konkrétní hypoteční partner (třetí strana)",
    majetio: "Majetio — vyhledání a analýza nemovitostí",
    broker_developer: "Makléř / developer (konkrétní realitní partner)",
    none: "Bez předání třetí straně",
  };
}

/** @deprecated Prefer getPartnerTransferScopeLabels() — static snapshot for docs. */
export const PARTNER_TRANSFER_SCOPE_LABELS: Record<
  PartnerTransferScope,
  string
> = getPartnerTransferScopeLabels();

/** Same entity as platform operator (or legacy operator) — never a “third party”. */
function looksLikePlatformOperator(name: string | null | undefined): boolean {
  if (!name?.trim()) return true;
  return /Hunger\s*killers|19488483|HEINZKE|10880097/i.test(name);
}

/**
 * Checkbox předání třetí straně — jen když provozovatel skutečně předává PII
 * jiné nezávislé entitě. Provozovatel sobě = nikdy.
 *
 * INTERNAL: Majetio / makléř = true až po zapojení reálného PII handoffu
 * (odchozí odkazy na majetio.cz nestačí).
 */
export function isThirdPartyTransferActive(
  scope: PartnerTransferScope
): boolean {
  if (scope === "none") return false;

  if (scope === "mortgage_specialist") {
    if (!isMortgagePartnerHandoffReady()) return false;
    const partner = getPrimaryMortgagePartner();
    if (!partner.legalName || looksLikePlatformOperator(partner.legalName)) {
      return false;
    }
    return true;
  }

  if (scope === "majetio") {
    return false;
  }

  if (scope === "broker_developer") {
    return false;
  }

  return false;
}

/**
 * Veřejný text u počátečního formuláře (příjemce = provozovatel / správce).
 * Není „předání“ údajů provozovateli — formulář mu jde přímo.
 */
export function buildEnquiryPrivacyNotice(): string {
  return CONSENT_PURPOSES.privacy_processing.checkboxLabel;
}

/** Dynamický checkbox text — používá centrální legal config. */
export function buildPrivacyProcessingCheckboxLabel(): string {
  return buildEnquiryPrivacyNotice();
}

/**
 * Text souhlasu s předáním — vždy jmenuje konkrétního příjemce a účel.
 * Prázdný string, pokud transfer není aktivní (UI nesmí zobrazit).
 */
export function buildPartnerTransferCheckboxLabel(
  scope: PartnerTransferScope
): string {
  if (!isThirdPartyTransferActive(scope)) return "";

  if (scope === "mortgage_specialist") {
    const name = getPrimaryMortgagePartner().legalName!;
    return `Souhlasím s předáním údajů společnosti ${name} (samostatný správce) za účelem nezávazné hypoteční konzultace.`;
  }

  if (scope === "majetio") {
    return "Souhlasím s předáním údajů společnosti Majetio (samostatný správce) za účelem vyhledání nebo analýzy nemovitostí související s mou poptávkou.";
  }

  if (scope === "broker_developer") {
    return "Souhlasím s předáním údajů realitnímu partnerovi (makléř / developer, samostatný správce) za účelem řešení mé poptávky po nemovitosti.";
  }

  return "";
}

/** Krátké shrnutí u formuláře — bez handoff / „předání provozovateli“ jazyka. */
export function buildConsentContextSummary(): string {
  const cfg = getLegalIdentityConfig();
  return [
    buildLeadFormIntakeDisclosure("cs"),
    `Správce údajů: ${withSentencePeriod(legalNameInline(cfg.dataControllerName ?? legalOperator.companyName))}`,
  ].join(" ");
}

/** Avoid „s.r.o..“ when label already ends with a period. */
function sentenceFragment(label: string, value: string): string {
  const v = value.trim();
  if (!v) return `${label}:`;
  return /[.!?…]$/.test(v) ? `${label}: ${v}` : `${label}: ${v}.`;
}
