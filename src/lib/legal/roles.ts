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
      "Zpracovatelé podle smlouvy o zpracování — provoz aplikace a databáze. Konkrétní seznam doplní provozovatel do konfigurace po uzavření smluv.",
  },
  {
    id: "licensed_specialist",
    label: "Licencovaný hypoteční specialista / partner",
    gdprRole: "independent_controller",
    description:
      "Po výslovném souhlasu s předáním se stává samostatným správcem údajů pro zprostředkování. Licence a IČO: /partneri (po ověření).",
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
    "Individuální zprostředkování provádí výhradně licencovaný partner; schválení vždy banka.",
  ],
} as const;

export const LAWYER_REVIEW_NOTICE =
  "Finální právní texty vyžadují review kvalifikovaným českým právníkem před produkčním spuštěním. Tento dokument je připraven jako technický / legal-readiness draft.";
