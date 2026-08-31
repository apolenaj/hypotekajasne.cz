/**
 * Role v zpracování osobních údajů (GDPR).
 *
 * Počáteční formulář → Hunger killers s.r.o. (správce).
 * To NENÍ předání třetí straně.
 *
 * INTERNAL: Do not invent ČNB intermediary status in public copy.
 */

import { legalOperator } from "@/config/legal";
import { getPrimaryMortgagePartner } from "@/lib/legal/partner-config";
import { isThirdPartyTransferActive } from "@/lib/legal/consent-versions";
import { getRegulatedBoundaryStatements } from "@/lib/legal/regulatory-texts";

export type ProcessingRole = {
  id: string;
  label: string;
  /** Czech role line shown on the GDPR page (more precise than gdprRole alone). */
  roleLabelCs: string;
  gdprRole:
    | "controller"
    | "processor"
    | "independent_controller"
    | "not_processor";
  description: string;
};

/**
 * Always-public architecture: operator as controller + tech processors.
 * Do not merge the platform operator with an unverified third-party intermediary.
 */
export const PROCESSING_ROLES: ProcessingRole[] = [
  {
    id: "platform_operator",
    label: legalOperator.companyName,
    roleLabelCs: "správce platformy a údajů z úvodních formulářů",
    gdprRole: "controller",
    description:
      "Přijímá poptávky z webu Hypotéka Jasně. Odeslání úvodního formuláře tomuto subjektu není předáním třetí straně. Nejde o banku.",
  },
  {
    id: "hosting_processors",
    label: "Technologičtí poskytovatelé (hosting, databáze)",
    roleLabelCs: "zpracovatelé (tam, kde to vyplývá ze smlouvy)",
    gdprRole: "processor",
    description:
      "Provoz aplikace, úložiště a infrastruktura — jen v rozsahu smlouvy o zpracování osobních údajů.",
  },
];

/**
 * Independent recipients — listed only when enquiry PII is actually transmitted.
 * External financial entities are not listed here unless transfer is active.
 */
export function getConditionalProcessingRoles(): ProcessingRole[] {
  const roles: ProcessingRole[] = [];

  if (isThirdPartyTransferActive("mortgage_specialist")) {
    const name =
      getPrimaryMortgagePartner().legalName ?? "Konkrétní hypoteční partner";
    roles.push({
      id: "mortgage_third_party",
      label: name,
      roleLabelCs: "samostatný správce (jen při skutečném předání údajů)",
      gdprRole: "independent_controller",
      description:
        "Příjemce kontaktních údajů za účelem nezávazné hypoteční konzultace — jen po výslovném souhlasu s předáním této konkrétní společnosti. Není sloučen s provozovatelem platformy.",
    });
  }

  if (isThirdPartyTransferActive("majetio")) {
    roles.push({
      id: "majetio",
      label: "Majetio",
      roleLabelCs: "samostatný správce (jen při skutečném předání údajů)",
      gdprRole: "independent_controller",
      description:
        "Příjemce údajů za účelem vyhledání nebo analýzy nemovitostí — jen po výslovném souhlasu s předáním Majetiu.",
    });
  }

  if (isThirdPartyTransferActive("broker_developer")) {
    roles.push({
      id: "broker_developer",
      label: "Makléř / developer",
      roleLabelCs: "samostatný správce (jen při skutečném předání údajů)",
      gdprRole: "independent_controller",
      description:
        "Příjemce údajů za účelem řešení poptávky po nemovitosti — jen po výslovném souhlasu s předáním konkrétnímu realitnímu partnerovi.",
    });
  }

  return roles;
}

/** Roles shown on the public GDPR page. */
export function getPublicProcessingRoles(): ProcessingRole[] {
  return [...PROCESSING_ROLES, ...getConditionalProcessingRoles()];
}

/** Regulované hranice — provozovatel není směšován s neověřeným zprostředkovatelem. */
export const REGULATED_BOUNDARIES = {
  title: "Regulované hranice",
  statements: getRegulatedBoundaryStatements("cs"),
} as const;

/**
 * Interní poznámka pro vývojáře / checklist — NIKDY nerenderovat ve veřejném UI.
 * Veřejné tvrzení „právně zkontrolováno“ jen přes isLegalTextReviewed() z config/legal.
 */
export const LEGAL_INTERNAL_REVIEW_NOTE =
  "Internal: Final legal review required before commercial launch. Do not claim legal sign-off until LEGAL_REVIEWED_BY + LEGAL_LAST_REVIEW_DATE are set after a qualified Czech lawyer review. Do not invent ČNB intermediary status; keep partner handoff off until verified.";

/** @deprecated Use LEGAL_INTERNAL_REVIEW_NOTE — do not show to end users. */
export const LAWYER_REVIEW_NOTICE = LEGAL_INTERNAL_REVIEW_NOTE;
