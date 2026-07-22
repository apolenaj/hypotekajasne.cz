/**
 * Role v zpracování osobních údajů (GDPR).
 * Hypotéka Jasně ≠ licencovaný zprostředkovatel ≠ banka.
 */

export type ProcessingRole = {
  id: string;
  label: string;
  gdprRole: "controller" | "processor" | "independent_controller" | "not_processor";
  description: string;
};

export const PROCESSING_ROLES: ProcessingRole[] = [
  {
    id: "hypoteka_jasne",
    label: "Hypotéka Jasně (provozovatel webu)",
    gdprRole: "controller",
    description:
      "Správce údajů z formulářů a technických logů webu. Poskytuje edukaci a modelové nástroje. Nepředstavuje se jako banka ani licencovaný zprostředkovatel.",
  },
  {
    id: "hosting_processors",
    label: "Hosting / infrastruktura (např. Vercel, Supabase)",
    gdprRole: "processor",
    description:
      "Zpracovatelé podle smlouvy o zpracování — provoz aplikace a databáze. Konkrétní seznam subjektů zveřejní provozovatel po uzavření smluv.",
  },
  {
    id: "licensed_specialist",
    label: "Hypoteční partner (samostatný správce po předání)",
    gdprRole: "independent_controller",
    description:
      "Po výslovném souhlasu s předáním se stává samostatným správcem údajů pro zprostředkování. Ověřená identifikace (právní jméno, IČO, registr) se zveřejňuje na /partneri — jen pokud je skutečně dostupná. Bez ověření nepředáváme kontakt třetí straně jako „licencovanému specialistovi“.",
  },
  {
    id: "bank",
    label: "Banka",
    gdprRole: "independent_controller",
    description:
      "Samostatný správce při žádosti o úvěr. Web Hypotéka Jasně není pobočkou banky.",
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

/** Regulované hranice — jasné označení co HJ není. */
export const REGULATED_BOUNDARIES = {
  title: "Regulované hranice",
  statements: [
    "Hypotéka Jasně nevykonává činnost podle zákona č. 257/2016 Sb., o spotřebitelském úvěru.",
    "Neposkytuje spotřebitelský úvěr, nenabízí zprostředkování jako licencovaný subjekt a neschvaluje úvěry.",
    "Neposkytuje regulované investiční poradenství ani daňové poradenství.",
    "Modelové výpočty a skóre nejsou závaznou nabídkou banky ani investičním doporučením.",
    "Individuální zprostředkování provádí výhradně ověřený partner (po zveřejnění identity); schválení vždy banka.",
  ],
} as const;

/**
 * Interní poznámka pro vývojáře / checklist — NIKDY nerenderovat ve veřejném UI.
 * Veřejné tvrzení „právně zkontrolováno“ jen přes isLegalTextReviewed() z config/legal.
 */
export const LEGAL_INTERNAL_REVIEW_NOTE =
  "Internal: final legal texts need a qualified Czech lawyer review before claiming legal sign-off. Set LEGAL_REVIEWED_BY + LEGAL_LAST_REVIEW_DATE after review.";

/** @deprecated Use LEGAL_INTERNAL_REVIEW_NOTE — do not show to end users. */
export const LAWYER_REVIEW_NOTICE = LEGAL_INTERNAL_REVIEW_NOTE;
