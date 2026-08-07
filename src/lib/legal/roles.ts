/**
 * Role v zpracování osobních údajů (GDPR).
 * Značka Hypotéka Jasně ≠ banka; provozovatel zajišťuje zprostředkování ve spolupráci s INSIA.
 *
 * INTERNAL: Before final commercial launch, verify the exact current
 * regulatory relationship between HEINZKE & partneři s.r.o. and INSIA in
 * the ČNB register.
 */

import { financialPartner, legalOperator } from "@/config/legal";

export type ProcessingRole = {
  id: string;
  label: string;
  gdprRole: "controller" | "processor" | "independent_controller" | "not_processor";
  description: string;
};

export const PROCESSING_ROLES: ProcessingRole[] = [
  {
    id: "hypoteka_jasne",
    label: `${legalOperator.companyName} (provozovatel platformy ${legalOperator.brand})`,
    gdprRole: "controller",
    description:
      "Správce údajů z formulářů a technických logů webu. Poskytuje digitální platformu (edukace, modelové nástroje). Nejde o banku.",
  },
  {
    id: "hosting_processors",
    label: "Hosting / infrastruktura (např. Vercel, Supabase)",
    gdprRole: "processor",
    description:
      "Zpracovatelé podle smlouvy o zpracování — provoz aplikace a databáze.",
  },
  {
    id: "licensed_specialist",
    label: `Odborná hypoteční část (${legalOperator.companyName} / ${financialPartner.network})`,
    gdprRole: "independent_controller",
    description: `${financialPartner.cooperationWording} Po výslovném souhlasu s předáním se údaje zpracovávají pro účely nezávazné konzultace. Konkrétní ČNB označení vztahu k INSIA zveřejníme až po ověření.`,
  },
  {
    id: "bank",
    label: "Banka",
    gdprRole: "independent_controller",
    description:
      "Samostatný správce při žádosti o úvěr. Web Hypotéka Jasně není pobočkou banky. Schválení úvěru vždy provádí banka.",
  },
  {
    id: "majetio",
    label: "Majetio",
    gdprRole: "independent_controller",
    description:
      "Vyhledání a analýza nemovitostí — oddělená služba. Předání jen v rozsahu Finančního pasu a attribution, ne jako skrytý marketingový souhlas.",
  },
  {
    id: "broker_developer",
    label: "Makléř / developer",
    gdprRole: "independent_controller",
    description:
      "Samostatní správci při prodeji nemovitosti. Předání jen při partner-specific souhlasu, ne automaticky s každým formulářem.",
  },
];

/** Regulované hranice — jasné označení co značka / kdo zajišťuje odbornou část. */
export const REGULATED_BOUNDARIES = {
  title: "Regulované hranice",
  statements: [
    "Hypotéka Jasně je obchodní značka digitální platformy provozované společností HEINZKE & partneři s.r.o.",
    "Digitální nástroje a modelové výpočty nejsou závaznou nabídkou banky ani investičním doporučením.",
    financialPartner.cooperationWording,
    "Neposkytujeme regulované investiční poradenství ani daňové poradenství.",
    "Schválení úvěru vždy provádí banka po vlastním posouzení.",
  ],
} as const;

/**
 * Interní poznámka pro vývojáře / checklist — NIKDY nerenderovat ve veřejném UI.
 * Veřejné tvrzení „právně zkontrolováno“ jen přes isLegalTextReviewed() z config/legal.
 */
export const LEGAL_INTERNAL_REVIEW_NOTE =
  "Internal: final legal texts need a qualified Czech lawyer review before claiming legal sign-off. Set LEGAL_REVIEWED_BY + LEGAL_LAST_REVIEW_DATE after review. Before final commercial launch, verify the exact current regulatory relationship between HEINZKE & partneři s.r.o. and INSIA in the ČNB register and replace neutral cooperation wording with the exact legally correct designation if appropriate.";

/** @deprecated Use LEGAL_INTERNAL_REVIEW_NOTE — do not show to end users. */
export const LAWYER_REVIEW_NOTICE = LEGAL_INTERNAL_REVIEW_NOTE;
