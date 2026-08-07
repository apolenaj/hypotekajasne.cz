/**
 * Role v zpracování osobních údajů (GDPR).
 *
 * Počáteční formulář → HEINZKE & partneři s.r.o. (správce).
 * To NENÍ předání třetí straně.
 *
 * INTERNAL: Before final commercial launch, verify the exact current
 * regulatory relationship between HEINZKE & partneři s.r.o. and INSIA in
 * the ČNB register. Do not invent ČNB status in public copy.
 */

import { financialPartner, legalOperator } from "@/config/legal";
import { getPrimaryMortgagePartner } from "@/lib/legal/partner-config";
import { isThirdPartyTransferActive } from "@/lib/legal/consent-versions";

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
 * Do not merge HEINZKE and INSIA into one privacy entity.
 */
export const PROCESSING_ROLES: ProcessingRole[] = [
  {
    id: "heinzke_operator",
    label: legalOperator.companyName,
    roleLabelCs: "správce platformy a údajů z úvodních formulářů",
    gdprRole: "controller",
    description:
      "Přijímá poptávky z webu Hypotéka Jasně. Odeslání úvodního formuláře tomuto subjektu není předáním třetí straně. Nejde o banku.",
  },
  {
    id: "hosting_processors",
    label: "Technologičtí poskytovatelé (např. hosting, databáze)",
    roleLabelCs: "zpracovatelé (tam, kde to vyplývá ze smlouvy)",
    gdprRole: "processor",
    description:
      "Provoz aplikace, úložiště a infrastruktura — jen v rozsahu smlouvy o zpracování osobních údajů.",
  },
];

/**
 * Independent recipients — listed only when enquiry PII is actually transmitted.
 * INSIA / bank / other financial entities are not listed here unless transfer is active.
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

/** Regulované hranice — bez smíchání HEINZKE a INSIA do jedné privacy role. */
export const REGULATED_BOUNDARIES = {
  title: "Regulované hranice",
  statements: [
    `${legalOperator.brand} je obchodní značka digitální platformy provozované společností ${legalOperator.companyName}.`,
    "Digitální nástroje a modelové výpočty nejsou závaznou nabídkou banky ani investičním doporučením.",
    financialPartner.cooperationWording,
    "INSIA, banka ani jiný finanční subjekt nejsou příjemci údajů z úvodního formuláře, dokud nedojde k samostatnému, výslovně odsouhlasenému předání.",
    "Neposkytujeme regulované investiční poradenství ani daňové poradenství.",
    "Schválení úvěru vždy provádí banka po vlastním posouzení.",
  ],
} as const;

/**
 * Interní poznámka pro vývojáře / checklist — NIKDY nerenderovat ve veřejném UI.
 * Veřejné tvrzení „právně zkontrolováno“ jen přes isLegalTextReviewed() z config/legal.
 */
export const LEGAL_INTERNAL_REVIEW_NOTE =
  "Internal: Final legal review required before commercial launch. Do not claim legal sign-off until LEGAL_REVIEWED_BY + LEGAL_LAST_REVIEW_DATE are set after a qualified Czech lawyer review. Before final commercial launch, verify the exact current regulatory relationship between HEINZKE & partneři s.r.o. and INSIA in the ČNB register and replace neutral cooperation wording with the exact legally correct designation if appropriate.";

/** @deprecated Use LEGAL_INTERNAL_REVIEW_NOTE — do not show to end users. */
export const LAWYER_REVIEW_NOTICE = LEGAL_INTERNAL_REVIEW_NOTE;
