/**
 * Trust Center — kdo jsme, kdo poskytuje službu, jak vyděláváme.
 */

import {
  financialPartner,
  legalOperator,
  projectFounder,
} from "@/config/legal";

export type EcosystemActorId =
  | "hypoteka_jasne"
  | "operator"
  | "insia"
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
    name: legalOperator.brand,
    shortRole: "Digitální platforma",
    whatTheyDo:
      "Edukace, kalkulačky, Hypoteční připravenost, přiřazení trhů, magazín a modelové nástroje.",
    whatTheyDont:
      "Není banka, neschvaluje úvěry a není náhradou za individuální posouzení bankou.",
    dataYouGive:
      "Údaje z formulářů (příjem, záměr, kontakt) — pro výpočet modelu a vyřízení poptávky provozovatelem.",
  },
  {
    id: "operator",
    name: legalOperator.companyName,
    shortRole: "Provozovatel platformy a odborná hypoteční část",
    whatTheyDo: `${financialPartner.cooperationWording} Jednatelem a hypotečním specialistou je ${financialPartner.representative}.`,
    whatTheyDont:
      "Neschvaluje úvěr. Schválení úvěru vždy provádí banka po vlastním posouzení.",
    dataYouGive:
      "Kontaktní a kontextové údaje z formulářů — přímo jako správci (nejde o předání třetí straně).",
  },
  {
    id: "insia",
    name: financialPartner.network,
    shortRole: "Síť / partner pro související finanční distribuci",
    whatTheyDo:
      "Prostřednictvím spolupráce s INSIA je zajišťována související finanční distribuce.",
    whatTheyDont:
      "Není totéž co značka Hypotéka Jasně ani banka schvalující úvěr.",
    dataYouGive:
      "Z úvodního formuláře osobní údaje INSIA nedostává. Předání by vyžadovalo samostatný, výslovný souhlas pro konkrétního příjemce.",
  },
  {
    id: "bank",
    name: "Banka",
    shortRole: "Poskytovatel úvěru",
    whatTheyDo:
      "Finální scoring, sazba, zástava, smlouva. Schválení úvěru vždy provádí banka po vlastním posouzení.",
    whatTheyDont:
      "Web Hypotéka Jasně není její pobočka ani závazná nabídka.",
    dataYouGive:
      "Oficiální žádost a podklady dle interních pravidel banky — ne z úvodního formuláře webu.",
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
      "Rozpočtové parametry / attribution (llid, UTM) — bez osobních údajů z úvodního formuláře, viz /o-majetio.",
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
      "Údaje k rezervaci / koupi jen přímo jim — ne automaticky z úvodního formuláře Hypotéka Jasně.",
  },
];

export type TeamMember = {
  id: string;
  name: string;
  initials: string;
  role: string;
  /** Krátký popis role (volitelný odstavec pod rolí) */
  summary?: string;
  responsibilities: string[];
  experience: string[];
  education: string[];
  contentResponsibility: string;
  linkedInUrl: string | null;
  /** null = initials placeholder (no invented stock photo) */
  photoUrl: string | null;
  /** Intrinsic size for Next.js Image (layout shift prevention). */
  photoWidth?: number;
  photoHeight?: number;
  photoAlt: string;
};

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "josef-apolenar",
    name: projectFounder.displayName,
    initials: "JA",
    role: projectFounder.role,
    summary: projectFounder.description,
    responsibilities: [
      "Koncept a produktová vize platformy",
      "Vývoj digitálních nástrojů a kalkulaček",
      "Uživatelská zkušenost a rozvoj projektu Hypotéka Jasně",
    ],
    experience: [
      "Vedení produktu a vývoje platformy Hypotéka Jasně",
      "Propojení edukace, modelů a digitálních nástrojů",
    ],
    education: [
      "Computing Technologies — University of Roehampton (Londýn)",
      "MBA — moderní byznys",
      "Studium psychologie pro manažery",
    ],
    contentResponsibility:
      "Odpovídá za produktové znění nástrojů a za to, že modelové výstupy nejsou vydávány za závazné nabídky bank. Neposkytuje regulované hypoteční zprostředkování.",
    linkedInUrl: null,
    photoUrl: "/images/team/josef-apolenar.webp",
    photoWidth: 800,
    photoHeight: 800,
    photoAlt: `${projectFounder.name} – ${projectFounder.role}`,
  },
  {
    id: "michal-heinzke",
    name: financialPartner.representative,
    initials: "MH",
    role: `${financialPartner.representativeRole} · ${financialPartner.specialistTitle}`,
    summary: financialPartner.michalDescription,
    responsibilities: [
      "Odborná část hypotečního financování",
      "Individuální řešení klientských případů",
      "Kontrola, že webové modely odpovídají běžné bankovní praxi",
    ],
    experience: [
      "11 let praxe v oblasti hypoték, úvěrů a pojištění (uváděno jako praxe na trhu)",
      "Zkušenost s metodikami českých bank a dokládáním příjmů",
    ],
    education: ["Odborná praxe ve finančních službách"],
    contentResponsibility:
      "Spoluodpovídá za věcnou správnost hypotečních vysvětlení na webu. Nejde o slib schválení konkrétní žádosti.",
    linkedInUrl: null,
    photoUrl: "/images/team/michal-heinzke.webp",
    photoWidth: 200,
    photoHeight: 200,
    photoAlt: "Michal Heinzke – hypoteční specialista",
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
