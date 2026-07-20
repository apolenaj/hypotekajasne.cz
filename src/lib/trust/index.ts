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
      "Edukace, kalkulačky, Hypoteční připravenost, market matching, magazín. Předává poptávku licencovanému specialistovi, pokud o to požádáte.",
    whatTheyDont:
      "Neposkytuje hypoteční úvěr, neschvaluje žádosti, není banka ani náhradou za individuální poradenství.",
    dataYouGive:
      "Údaje z formulářů (příjem, záměr, kontakt) — pro výpočet modelu a volitelné předání partnerovi.",
  },
  {
    id: "licensed_specialist",
    name: "Licencovaný specialista",
    shortRole: "Zprostředkování / poradenství dle licence",
    whatTheyDo:
      "Individuální posouzení, výběr produktů, komunikace s bankami v rozsahu své registrace (např. ČNB / JERRS).",
    whatTheyDont:
      "Není totéž co Hypotéka Jasně web. Schválení úvěru neprovádí — to dělá banka.",
    dataYouGive:
      "Kompletní úvěrová dokumentace podle požadavků banky a specialisty.",
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
      "Vyhledávání a analýza nemovitostí; handoff Finančního pasu z HJ (bez zbytečného PII).",
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
      "Produktová vize HypotékaJasně.cz",
      "Datový a technologický ekosystém",
      "Srozumitelnost modelů pro uživatele",
    ],
    experience: [
      "Vedení produktu a vývoje platformy Hypotéka Jasně",
      "Propojení edukace, kalkulaček a handoffu na licencované partnery",
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
      "Předání kvalifikované poptávky do licencovaného procesu",
    ],
    experience: [
      "11 let praxe v oblasti hypoték, úvěrů a pojištění (uváděno jako ověřitelná praxe na trhu — detaily licence viz /partneri)",
      "Zkušenost s metodikami českých bank a dokládáním příjmů",
    ],
    education: [
      "Odborná praxe ve finančních službách (doplníme formální vzdělání po potvrzení)",
    ],
    contentResponsibility:
      "Spoluodpovídá za věcnou správnost hypotečních vysvětlení na webu. Nejde o slib schválení konkrétní žádosti.",
    linkedInUrl: null,
    photoUrl: null,
    photoAlt: "Michal Heinzke",
  },
];

export type MortgagePartner = {
  id: string;
  name: string;
  ico: string | null;
  role: string;
  licenceSummary: string;
  /** Odkaz na veřejný registr (např. JERRS / ČNB) — null = dosud nezveřejněno */
  jerrsVerificationUrl: string | null;
  jerrsStatus: "LIVE" | "PENDING_VERIFICATION" | "COMING_SOON";
  scope: string;
  compensationDisclosure: string;
};

/**
 * Hypoteční partner — struktura připravena.
 * IČO a JERRS doplníme po ověření; nevymýšlíme falešné registrační údaje.
 */
export const MORTGAGE_PARTNERS: MortgagePartner[] = [
  {
    id: "primary-mortgage-partner",
    name: "Licencovaný hypoteční partner (doplnění po ověření)",
    ico: null,
    role: "Zprostředkování spotřebitelských úvěrů / hypoték dle registrace",
    licenceSummary:
      "Poskytuje službu v rozsahu své registrace u dohledového orgánu. Hypotéka Jasně není touto osobou.",
    jerrsVerificationUrl: null,
    jerrsStatus: "PENDING_VERIFICATION",
    scope:
      "Individuální konzultace, příprava podkladů, komunikace s bankami. Nezahrnuje závazné schválení úvěru.",
    compensationDisclosure:
      "Můžeme získat odměnu od partnera, pokud přes nás dojde k realizaci.",
  },
];

export const COMPENSATION_DISCLOSURE =
  "Můžeme získat odměnu od partnera, pokud přes nás dojde k realizaci.";

export const TRUST_NAV = [
  { href: "/duvera", label: "Centrum důvěry" },
  { href: "/o-nas", label: "O nás" },
  { href: "/metodika", label: "Metodika" },
  { href: "/zdroje", label: "Zdroje" },
  { href: "/editorial-policy", label: "Redakční zásady" },
  { href: "/jak-vydelavame", label: "Jak vyděláváme" },
  { href: "/partneri", label: "Partneři" },
  { href: "/opravy-a-aktualizace", label: "Opravy a aktualizace" },
] as const;
