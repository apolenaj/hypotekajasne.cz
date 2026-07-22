/**
 * Trust Center — kdo jsme, kdo poskytuje službu, jak vyděláváme.
 */

export type EcosystemActorId =
  | "hypoteka_jasne"
  | "licensed_specialist"
  | "bank"
  | "majetio"
  | "broker_developer";

export type EcosystemActor = {
  id: EcosystemActorId;
  name: string;
  shortRole: string;
  whatTheyDo: string;
  whatTheyDont: string;
  dataYouGive: string;
};

export const ECOSYSTEM_ACTORS: EcosystemActor[] = [
  {
    id: "hypoteka_jasne",
    name: "Hypotéka Jasně",
    shortRole: "Informační a technologická platforma",
    whatTheyDo:
      "Edukace, kalkulačky, Hypoteční připravenost, přiřazení trhů, magazín. Předává poptávku partnerovi jen se souhlasem a jen pokud je jeho identita ověřena a zveřejněna.",
    whatTheyDont:
      "Neposkytuje hypoteční úvěr, neschvaluje žádosti, není banka ani náhradou za individuální poradenství.",
    dataYouGive:
      "Údaje z formulářů (příjem, záměr, kontakt) — pro výpočet modelu a volitelné předání partnerovi.",
  },
  {
    id: "licensed_specialist",
    name: "Hypoteční partner",
    shortRole: "Zprostředkování po ověření identity",
    whatTheyDo:
      "Individuální posouzení a komunikace s bankami v rozsahu své registrace — teprve když je na /partneri zveřejněna ověřená identifikace.",
    whatTheyDont:
      "Není totéž co Hypotéka Jasně web. Schválení úvěru neprovádí — to dělá banka. Bez zveřejněné identity neuvádíme „licencovaný“ / „ověřený“.",
    dataYouGive:
      "Kompletní úvěrová dokumentace podle požadavků banky a partnera.",
  },
  {
    id: "bank",
    name: "Banka",
    shortRole: "Poskytovatel úvěru",
    whatTheyDo:
      "Finální scoring, schválení nebo zamítnutí, sazba, zástava, smlouva.",
    whatTheyDont:
      "Web Hypotéka Jasně není její pobočka ani závazná nabídka.",
    dataYouGive:
      "Oficiální žádost a podklady dle interních pravidel banky.",
  },
  {
    id: "majetio",
    name: "Majetio",
    shortRole: "Property discovery & analýza",
    whatTheyDo:
      "Vyhledávání a analýza nemovitostí; předání Finančního pasu z HJ (bez zbytečného PII).",
    whatTheyDont:
      "Není hypoteční banka. Počet listingů neuvádíme bez ověřených dat.",
    dataYouGive:
      "Rozpočtové parametry / attribution (llid, UTM) — viz /o-majetio.",
  },
  {
    id: "broker_developer",
    name: "Makléř / developer",
    shortRole: "Prodej a development",
    whatTheyDo:
      "Nabídka konkrétních nemovitostí, prohlídky, smlouvy o koupi, platební plány.",
    whatTheyDont:
      "Nejsou Hypotéka Jasně. Jejich marketing ≠ náš model ani schválení banky.",
    dataYouGive:
      "Údaje potřebné k rezervaci / koupi — přímo jim, ne automaticky přes HJ.",
  },
];

export type TeamMember = {
  id: string;
  name: string;
  initials: string;
  role: string;
  responsibilities: string[];
  experience: string[];
  education: string[];
  contentResponsibility: string;
  linkedInUrl: string | null;
  /** null = zobrazit placeholder */
  photoUrl: string | null;
  photoAlt: string;
};

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "josef-apolenar",
    name: "Bc. Josef Apolenář BSc., MBA",
    initials: "JA",
    role: "Zakladatel & CEO — produkt a technologie",
    responsibilities: [
      "Produktová vize Hypotéka Jasně",
      "Datový a technologický ekosystém",
      "Srozumitelnost modelů pro uživatele",
    ],
    experience: [
      "Vedení produktu a vývoje platformy Hypotéka Jasně",
      "Propojení edukace, kalkulaček a předání ověřenému partnerovi (pokud je zveřejněn)",
    ],
    education: [
      "Computing Technologies — University of Roehampton (Londýn)",
      "MBA — moderní byznys",
      "Studium psychologie pro manažery",
    ],
    contentResponsibility:
      "Odpovídá za produktové znění nástrojů a za to, že modelové výstupy nejsou vydávány za závazné nabídky bank.",
    linkedInUrl: null,
    photoUrl: null,
    photoAlt: "Josef Apolenář",
  },
  {
    id: "michal-heinzke",
    name: "Michal Heinzke",
    initials: "MH",
    role: "Hypoteční specialista — praxe a metodiky bank",
    responsibilities: [
      "Kontrola, že webové modely odpovídají běžné bankovní praxi",
      "Vysvětlení limitů LTV/DSTI a nestandardních příjmů",
      "Předání kvalifikované poptávky partnerovi po ověření identity",
    ],
    experience: [
      "11 let praxe v oblasti hypoték, úvěrů a pojištění (uváděno jako praxe na trhu — veřejná registrační identifikace partnera jen pokud je zveřejněna)",
      "Zkušenost s metodikami českých bank a dokládáním příjmů",
    ],
    education: [
      "Odborná praxe ve finančních službách",
    ],
    contentResponsibility:
      "Spoluodpovídá za věcnou správnost hypotečních vysvětlení na webu. Nejde o slib schválení konkrétní žádosti.",
    linkedInUrl: null,
    photoUrl: null,
    photoAlt: "Michal Heinzke",
  },
];

/** Re-export SoT — jediný zdroj partner identity: `src/lib/legal/partner-config.ts`. */
export {
  getMortgagePartners,
  getPrimaryMortgagePartner,
  partnerPublicDisplayName,
  isMortgagePartnerIdentityVerified,
  isMortgagePartnerHandoffReady,
  partnerJerrsPublicLabel,
  COMPENSATION_DISCLOSURE,
  type MortgagePartner,
  type MortgagePartnerJerrsStatus,
} from "@/lib/legal/partner-config";

export const TRUST_NAV = [
  { href: "/duvera", label: "Centrum důvěry" },
  { href: "/o-nas", label: "O nás" },
  { href: "/metodika", label: "Metodika" },
  { href: "/zdroje", label: "Zdroje" },
  { href: "/editorial-policy", label: "Redakční zásady" },
  { href: "/jak-vydelavame", label: "Jak vyděláváme" },
  { href: "/partneri", label: "Partneři" },
  { href: "/opravy-a-aktualizace", label: "Co jsme aktualizovali" },
] as const;

export { listPublicChangelog, PUBLIC_CHANGELOG } from "@/lib/trust/public-changelog";
export {
  NUMBER_PIPELINE_STEPS,
  EDITORIAL_LEGAL_SOURCES_LABEL,
  editorialLegalSourcesReviewText,
} from "@/lib/trust/number-pipeline";
