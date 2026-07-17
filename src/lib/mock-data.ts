import type { CountryId } from "@/lib/calculators";
import { getCountryGuidePath, routes } from "@/lib/routes";

export interface DestinationCard {
  id: CountryId;
  name: string;
  subtitle: string;
  image: string;
}

export const destinationCards: DestinationCard[] = [
  {
    id: "cz",
    name: "Česká republika",
    subtitle: "Stabilní LTV a domácí jistota",
    image:
      "https://images.unsplash.com/photo-1592906209472-a26b4f9331bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "dubai",
    name: "SAE (Dubaj)",
    subtitle: "0% daň a bezúročné splátky",
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop&q=80",
  },
  {
    id: "spain",
    name: "Španělsko",
    subtitle: "Prémiový trh pro druhý domov",
    image:
      "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&h=600&fit=crop&q=80",
  },
  {
    id: "italy",
    name: "Itálie",
    subtitle: "Vysoký potenciál růstu ROI",
    image:
      "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&h=600&fit=crop&q=80",
  },
  {
    id: "croatia",
    name: "Chorvatsko",
    subtitle: "Silný trh pro krátkodobý pronájem",
    image:
      "https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "bali",
    name: "Bali (Indonésie)",
    subtitle: "Exotický ráj s vysokým ROI",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=600&fit=crop&q=80",
  },
  {
    id: "saudi",
    name: "Saúdská Arábie",
    subtitle: "Nový gigant realitního trhu",
    image:
      "https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "slovakia",
    name: "Slovensko",
    subtitle: "Blízký trh a snadná správa",
    image:
      "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&h=600&fit=crop&q=80",
  },
];

/** @deprecated Use destinationCards */
export const countries = destinationCards.map((c) => ({
  id: c.id,
  name: c.name,
  description: c.subtitle,
}));

export const consultationCountries = [
  { value: "cz", label: "Česká republika" },
  { value: "dubai", label: "Dubaj / SAE" },
  { value: "spain", label: "Španělsko" },
  { value: "italy", label: "Itálie" },
  { value: "croatia", label: "Chorvatsko" },
  { value: "bali", label: "Bali (Indonésie)" },
  { value: "saudi", label: "Saúdská Arábie" },
  { value: "slovakia", label: "Slovensko" },
];

export type NavLinkItem = {
  href: string;
  label: string;
  external?: boolean;
};

/** Tři hlavní cesty — vždy viditelné v hlavičce */
export const primaryNavLinks: NavLinkItem[] = [
  {
    href: routes.kalkulacky.root,
    label: "Zjistit, kolik si mohu půjčit",
  },
  {
    href: routes.investicniPas,
    label: "Vybrat vhodnou zemi",
  },
  {
    href: routes.investicniRentgen,
    label: "Analyzovat nemovitost",
  },
];

/** Sekundární rozbalovací menu */
export const secondaryNavGroups: {
  id: "nastroje" | "trhy" | "akademie" | "o-nas";
  label: string;
  items: NavLinkItem[];
}[] = [
  {
    id: "nastroje",
    label: "Nástroje",
    items: [
      { href: routes.kalkulacky.root, label: "Hypoteční kalkulačka" },
      { href: routes.investicniPas, label: "Investiční pas" },
      { href: routes.investicniRentgen, label: "Investiční rentgen" },
      { href: routes.kalkulacky.koupeVsNajem, label: "Koupě × Nájem" },
      { href: routes.kalkulacky.historickyVyvoj, label: "Historický vývoj" },
      { href: routes.kalkulacky.potencialniVyvoj, label: "Potenciální vývoj" },
      {
        href: "https://majetio.cz",
        label: "Majetio.cz",
        external: true,
      },
    ],
  },
  {
    id: "trhy",
    label: "Trhy",
    items: [
      { href: getCountryGuidePath("cz"), label: "Česká republika" },
      { href: getCountryGuidePath("dubai"), label: "SAE / Dubaj" },
      { href: getCountryGuidePath("spain"), label: "Španělsko" },
      { href: getCountryGuidePath("italy"), label: "Itálie" },
      { href: getCountryGuidePath("croatia"), label: "Chorvatsko" },
      { href: getCountryGuidePath("bali"), label: "Bali (Indonésie)" },
      { href: getCountryGuidePath("saudi"), label: "Saúdská Arábie" },
      { href: getCountryGuidePath("slovakia"), label: "Slovensko" },
    ],
  },
  {
    id: "akademie",
    label: "Akademie",
    items: [
      { href: routes.hypotecniAkademie, label: "Hypoteční akademie" },
      { href: routes.clanky, label: "Články" },
      { href: routes.faq, label: "FAQ" },
    ],
  },
  {
    id: "o-nas",
    label: "O nás",
    items: [
      { href: routes.oNas, label: "O nás" },
      { href: routes.oMajetio, label: "O Majetio.cz" },
      { href: routes.kontakt, label: "Kontakt" },
    ],
  },
];

/** @deprecated Prefer primaryNavLinks / secondaryNavGroups */
export const mainNavLinks = primaryNavLinks;
/** @deprecated Prefer secondaryNavGroups */
export const expertNavLinks = secondaryNavGroups.flatMap((g) => g.items);
/** @deprecated Prefer primaryNavLinks / secondaryNavGroups */
export const navLinks = [
  ...primaryNavLinks,
  { href: routes.oNas, label: "O nás" },
];

export const footerLinks = {
  legal: [
    { href: routes.legal.gdpr, label: "GDPR" },
    { href: routes.legal.smlouvy, label: "Smlouvy" },
    { href: routes.legal.zasady, label: "Zásady" },
  ],
  company: [
    { href: routes.kontakt, label: "Kontakt" },
    { href: routes.faq, label: "FAQ" },
    { href: routes.oNas, label: "O nás" },
  ],
};

export const siteContact = {
  email: "info@hypotekajasne.cz",
  phone: "+420 727 814 810",
  phoneHref: "tel:+420727814810",
  emailHref: "mailto:info@hypotekajasne.cz",
  address: "Soukenická 6, Krnov, 79401 Česká Republika",
} as const;

export type FinancingEligibility = {
  residency: string[];
  income: string[];
};

export type FinancingDetail = {
  id: string;
  title: string;
  shortDesc: string;
  rates: string;
  howItWorks: string;
  idealFor: string;
  setup?: string;
  advantages: string[];
  risks: string[];
  requirements?: string[];
  eligibility?: FinancingEligibility;
};

export const financingDetailsData: Record<string, FinancingDetail[]> = {
  "SAE (Dubaj)": [
    {
      id: "americka-hypoteka-cr",
      title: "Americká hypotéka v ČR (Financování z domova)",
      shortDesc:
        "Získání hotovosti v ČR zástavou české nemovitosti. V UAE vystupujete jako cash-buyer.",
      rates: "Kolem 5.5 % p.a. v CZK",
      howItWorks:
        "Zastavíte svou nezatíženou nemovitost (nebo nemovitost rodičů) v ČR. Banka vám vyplatí až 70 % její hodnoty v hotovosti. Peníze převedete do UAE a kupujete nemovitost bez emirátské byrokracie.",
      idealFor:
        "České investory, kteří mají volnou nemovitost v ČR a nechtějí řešit dokládání příjmů emirátským bankám.",
      advantages: [
        "V UAE jednáte jako hotovostní kupec (můžete vyjednat lepší cenu/podmínky).",
        "Vyhnete se složitému dokládání příjmů a překladům dokumentů do arabštiny/angličtiny.",
        "Splatnost v ČR až 20-30 let podle typu úvěru.",
      ],
      risks: [
        "Zatěžujete svůj majetek v České republice.",
        "Kurzové riziko při převodu CZK na AED/USD.",
      ],
      eligibility: {
        residency: ["cz_citizen"],
        income: ["employee_cz", "osvc_cz", "sro_cz"],
      },
    },
    {
      id: "dev-plan-uae",
      title: "Developer Payment Plan (Off-plan)",
      shortDesc:
        "Přímé splátky developerovi bez banky během výstavby (např. 20/40/40 nebo post-handover).",
      rates: "0 % p.a. (Bezúročné)",
      howItWorks:
        "Kupujete nemovitost ve výstavbě. Část platíte průběžně a zbytek při předání (handover), případně i několik let po předání (post-handover plan). Platby musí jít na registrovaný escrow účet projektu u DLD.",
      idealFor:
        "Investory s průběžným cash-flow, kteří nechtějí nebo nemohou žádat o hypotéku v bance.",
      advantages: [
        "Žádné prokazování bonity a doložení příjmů jako v bance.",
        "Bezúročné financování.",
        "Nemovitost z post-handover plánu již můžete pronajímat a splátky hradit z nájmu.",
      ],
      risks: [
        "Riziko zpoždění výstavby ze strany developera.",
        "Při výpadku splátek hrozí propadnutí dosud zaplacených peněz.",
        "Vyšší kupní cena nemovitosti než při okamžité platbě v hotovosti.",
      ],
      eligibility: {
        residency: ["cz_citizen", "foreigner_in_cz", "foreigner"],
        income: [
          "employee_cz",
          "employee_foreign",
          "osvc_cz",
          "osvc_foreign",
          "sro_cz",
          "sro_foreign",
          "rent",
        ],
      },
    },
    {
      id: "non-resident-uae",
      title: "Nerezidentní hypotéka v UAE",
      shortDesc: "Financování emirátskou bankou pro cizince (LTV 50-60 %).",
      rates: "Kolem 4.5 % – 5.5 % p.a.",
      howItWorks:
        "Emirátské banky (např. Mashreq s LTV až 60 % či ADCB s LTV 50 %) půjčí cizincům na dokončené nemovitosti s title deed. Splatnost bývá 15 až 25 let.",
      idealFor:
        "Investory žijící v ČR, kteří chtějí využít pákový efekt, ale nechtějí ručit českým majetkem.",
      advantages: [
        "Ručí se výhradně kupovanou nemovitostí v UAE.",
        "Příjem z nájmu v AED přímo pokrývá splátky v téže měně.",
      ],
      risks: [
        "Banky vyžadují doložení pasu, výpisů za 6 měsíců, daňových přiznání a úvěrového reportu z ČR (CBCB).",
        "Je nutné mít připraveno 40-50 % ceny z vlastních zdrojů + cca 7-8 % na doprovodné poplatky (DLD 4 %, makléř, bankovní poplatky).",
      ],
      eligibility: {
        residency: ["cz_citizen", "foreigner"],
        income: [
          "employee_cz",
          "employee_foreign",
          "osvc_cz",
          "osvc_foreign",
          "sro_cz",
          "sro_foreign",
        ],
      },
    },
    {
      id: "resident-mortgage-uae",
      title: "Rezidentní hypotéka (Pro expaty v UAE)",
      shortDesc:
        "Hypotéka pro držitele UAE rezidence a Emirates ID s LTV až 80 %.",
      rates: "Kolem 4.5 % – 5.5 % p.a. (či variabilní dle EIBOR)",
      howItWorks:
        "Pro lidi s platným vízem a příjmem v UAE. U první nemovitosti do 5 mil. AED banka profinancuje až 80 %. Maximální splatnost je 25 let a splátky všech úvěrů nesmí přesáhnout 50 % hrubého příjmu (DBR).",
      idealFor:
        "Čechy, kteří se přestěhovali do UAE za prací nebo tam mají aktivní firmu.",
      advantages: [
        "Nejvyšší možné LTV (stačí jen 20 % akontace).",
        "Možnost využít programy jako Dubai First-Time Home Buyer pro výhody u partnerských bank.",
      ],
      risks: [
        "Kreditní karty drasticky snižují bonitu (do DBR se počítá 5 % celkového limitu karet, i když jsou nevyužité).",
        "Při ztrátě rezidentského víza se podmínky mohou změnit.",
      ],
      eligibility: {
        residency: ["foreigner_in_cz"],
        income: ["employee_cz", "osvc_cz", "sro_cz"],
      },
    },
    {
      id: "islamic-finance-uae",
      title: "Islámské financování (Ijarah / Murabaha)",
      shortDesc:
        "Bezúročné financování splňující pravidla Šaría. Dostupné i pro cizince.",
      rates: "Profit rate srovnatelná s běžným úrokem (vázaná na EIBOR)",
      howItWorks:
        "U struktury Ijarah banka koupí nemovitost a pronajímá vám ji. S každou splátkou získáváte větší podíl, dokud se vlastnictví nepřepíše na vás. Dubai Islamic Bank (DIB) nabízí tyto programy i pro nerezidenty.",
      idealFor:
        "Investory vyžadující striktní etické financování, nebo ty, kteří chtějí využít specifické low-document programy islámských bank.",
      advantages: [
        "Často flexibilnější posuzování u specifických developerských projektů.",
        "Záruka transparentnosti a pevně stanoveného zisku banky předem.",
      ],
      risks: [
        "Poplatky za předčasné splacení nebo převod mohou být smluvně komplikovanější.",
        "Není automaticky levnější než klasická hypotéka – je nutné porovnat celkovou přeplacenost.",
      ],
      eligibility: {
        residency: ["cz_citizen", "foreigner_in_cz", "foreigner"],
        income: [
          "employee_cz",
          "employee_foreign",
          "osvc_cz",
          "osvc_foreign",
          "sro_cz",
          "sro_foreign",
        ],
      },
    },
    {
      id: "equity-release-uae",
      title: "Zástava UAE nemovitosti (Equity Release)",
      shortDesc: "Získání hotovosti zástavou již vlastněné nemovitosti v UAE.",
      rates: "Kolem 5.0 % p.a.",
      howItWorks:
        "Pokud již v Dubaji nebo Abu Dhabi vlastníte splacenou nemovitost (freehold), můžete proti ní získat úvěr (např. u Emirates NBD až do 25 mil. AED) a použít peníze na nákup dalšího bytu.",
      idealFor:
        "Investory, kteří chtějí diverzifikovat své emirátské portfolio a využít kapitál uzamčený v hotové nemovitosti.",
      advantages: [
        "Získání levného kapitálu bez nutnosti prodávat stávající výnosné aktivum.",
        "Dlouhá splatnost až 25 let.",
      ],
      risks: [
        "Při nesplácení riskujete ztrátu zavedené nemovitosti v UAE.",
        "Nutnost doložit aktuální bonitu a projít oceněním nemovitosti.",
      ],
      eligibility: {
        residency: ["cz_citizen", "foreigner_in_cz"],
        income: [
          "employee_cz",
          "employee_foreign",
          "osvc_cz",
          "osvc_foreign",
          "sro_cz",
          "sro_foreign",
          "rent",
        ],
      },
    },
  ],
  "Česká republika": [
    {
      id: "standard-cz",
      title: "Klasická hypotéka na vlastní bydlení",
      shortDesc:
        "Standardně do 80 % LTV, pro žadatele mladší 36 let až 90 % LTV.",
      rates: "Kolem 4.5 % p.a.",
      howItWorks:
        "Banka standardně půjčí 80 % hodnoty nemovitosti (do 36 let často až 90 %). Ukazatele DTI a DSTI ČNB aktuálně plošně neaktivuje — banky je však mohou používat interně při hodnocení bonity.",
      idealFor: "Zaměstnance na dobu neurčitou s ukončenou zkušební dobou.",
      advantages: [
        "Možnost přidat spolužadatele (např. partnera či rodiče) a spojit tak příjmy.",
        "Lze prodloužit splatnost pro snížení měsíční splátky.",
      ],
      risks: [
        "Nutnost zrušit nepoužívané kreditní karty, protože banka počítá i nevyčerpaný limit, což snižuje bonitu.",
      ],
      eligibility: {
        residency: ["cz_citizen", "foreigner_in_cz"],
        income: ["employee_cz", "osvc_cz", "sro_cz"],
      },
    },
    {
      id: "invest-cz",
      title: "Investiční hypotéka (Koupě na pronájem)",
      shortDesc:
        "Od 1. 4. 2026 ČNB doporučuje u investičních hypoték LTV max. 70 % a DTI 7.",
      rates: "Kolem 4.8 % p.a.",
      howItWorks:
        "Pro investiční hypotéky (typicky třetí a další obytná nemovitost nebo koupě na pronájem) ČNB doporučuje LTV maximálně 70 % a limit DTI 7. Banky obvykle chtějí alespoň 30 % vlastních zdrojů. U vlastního bydlení zůstávají DTI a DSTI deaktivované.",
      idealFor:
        "Investory, kterým banka umí započítat budoucí očekávané nájemné do bonity.",
      advantages: ["Lze využít k nákupu činžovních domů či portfolia bytů."],
      risks: [
        "Banka nezapočítá 100 % nájemného kvůli rezervám na opravy a neobsazenost.",
      ],
      eligibility: {
        residency: ["cz_citizen", "foreigner_in_cz"],
        income: ["employee_cz", "osvc_cz", "sro_cz", "rent", "employee_foreign"],
      },
    },
    {
      id: "double-collateral",
      title: "Trik 100% financování (Zástava 2 nemovitostí)",
      shortDesc: "Využití zástavy rodičů umožní financovat celou kupní cenu.",
      rates: "Kolem 4.5 % p.a.",
      howItWorks:
        "Při koupi bytu za 5 milionů bez vlastních peněz se zastaví kupovaný byt a dům rodičů. Pokud je celková zástava například 9 milionů, hypotéka 5 milionů představuje LTV jen 55,6 %.",
      idealFor:
        "Zájemce bez našetřené hotovosti (10–20 %), ale s dostatečným příjmem.",
      advantages: [
        "Obejmutí nutnosti vlastních hotovostních prostředků.",
        "Po růstu hodnoty bytu lze rodičovskou nemovitost vyvázat.",
      ],
      risks: ["Rodiče riskují svou nemovitost."],
      eligibility: {
        residency: ["cz_citizen"],
        income: ["employee_cz", "osvc_cz", "sro_cz", "employee_foreign"],
      },
    },
    {
      id: "pre-approved",
      title: "Hypotéka bez vybrané nemovitosti",
      shortDesc:
        "Schválení peněz předem. ČSOB Hypoteční banka například dává až devět měsíců na výběr.",
      rates: "Kolem 4.7 % p.a.",
      howItWorks:
        "Banka nejdříve schválí váš příjem a úvěrový limit. Znáte přesný rozpočet před podpisem rezervační smlouvy.",
      idealFor:
        "Zájemce na přehřátém trhu, kteří potřebují jistotu, že banka úvěr po zaplacení rezervace neodmítne.",
      advantages: ["Rychlost při jednání s prodávajícím."],
      risks: ["Sankce či poplatky, pokud nemovitost v limitu nenajdete."],
      eligibility: {
        residency: ["cz_citizen", "foreigner_in_cz"],
        income: ["employee_cz", "osvc_cz", "sro_cz"],
      },
    },
    {
      id: "coop-cz",
      title: "Financování družstevního bytu",
      shortDesc:
        "Využití nezajištěného úvěru ze stavebního spoření (až 3,5 mil. Kč).",
      rates: "Kolem 5.5 % p.a.",
      howItWorks:
        "Protože družstevní byt nelze klasicky zastavit, řešením je nezajištěný úvěr nebo předhypoteční úvěr (pokud dojde k převodu do OV). ČSOB Stavební spořitelna nabízí až 3,5 milionu Kč bez zástavy.",
      idealFor:
        "Lidi kupující družstevní podíly, kteří nemohou ručit jinou nemovitostí.",
      advantages: [
        "Od roku 2026 lze uplatnit odpočet úroků i na podíl člena bytového družstva (limit 150 000 Kč ročně).",
      ],
      risks: ["Nezajištěné úvěry mívají vyšší sazbu a kratší splatnost."],
      eligibility: {
        residency: ["cz_citizen", "foreigner_in_cz"],
        income: ["employee_cz", "osvc_cz", "sro_cz", "foreign_income"],
      },
    },
    {
      id: "nzu-2026",
      title: "Hypotéka + Nová zelená úsporám 2026+",
      shortDesc: "Kombinace klasické hypotéky a bezúročného úvěru od státu.",
      rates: "0 % na renovaci / 4.5 % na koupi",
      howItWorks:
        "Program NZÚ 2026+ nabízí bezúročné úvěry na komplexní renovace domů až do 2 milionů Kč. Úvěry poskytují banky a stavební spořitelny.",
      idealFor:
        "Kupce starších domů. Hypotéku využijete na koupi a bezúročný úvěr na energetickou renovaci.",
      advantages: [
        "Výrazné snížení dražší části financování.",
        "Zvýhodnění obvykle na 10–15 let.",
      ],
      risks: [
        "Stále je nutné projít standardním posouzením úvěruschopnosti v bance.",
      ],
      eligibility: {
        residency: ["cz_citizen"],
        income: ["employee_cz", "osvc_cz", "sro_cz"],
      },
    },
    {
      id: "rent-to-own",
      title: "Rent-to-own (Nájem s budoucím odkupem)",
      shortDesc:
        "Služby jako Ownest požadují na začátku přibližně 3 % ceny nemovitosti.",
      rates: "Dle individuálních poplatků",
      howItWorks:
        "Nemáš dost vlastních zdrojů, takže společnost koupí byt a ty jej užíváš jako nájemce s možností pozdějšího odkupu.",
      idealFor:
        "Zájemce bez našetřených 10–20 %, nebo ty, kteří aktuálně nedosáhnou na hypotéku.",
      advantages: ["Extrémně nízký počáteční vklad."],
      risks: [
        "Je nutné bedlivě porovnat cenu budoucího odkupu a poplatky v případě neuskutečnění odkupu.",
      ],
      eligibility: {
        residency: ["cz_citizen", "foreigner_in_cz", "foreigner"],
        income: [
          "employee_cz",
          "osvc_cz",
          "sro_cz",
          "foreign_income",
          "employee_foreign",
        ],
      },
    },
    {
      id: "osvc-strategy",
      title: "Strategie pro OSVČ a S.R.O.",
      shortDesc:
        "Základem je vybrat banku podle správné metodiky výpočtu (zisk vs. obrat).",
      rates: "Kolem 4.5 % p.a.",
      howItWorks:
        "Banka může u OSVČ bonitu počítat ze základu daně, ze zisku, z obratu, nebo z pohybů na účtu. Stejný podnikatel může mít ve dvou bankách zcela rozdílný limit.",
      idealFor: "Živnostníky a majitele firem.",
      advantages: [
        "Majitel s.r.o. může využít mzdu, podíl na zisku, ale i úvěr přímo na s.r.o. (podnikatelský úvěr).",
      ],
      risks: [
        "Krátkodobě uměle zvýšená mzda jednatele před žádostí obvykle nefunguje.",
        "Vyplatí se nesnižovat si agresivně základ daně rok před hypotékou.",
      ],
      eligibility: {
        residency: ["cz_citizen", "foreigner_in_cz"],
        income: ["osvc_cz", "sro_cz"],
      },
    },
  ],
  "Španělsko": [
    {
      id: "spain-mortgage",
      title: "Španělská hypotéka pro cizince",
      shortDesc:
        "Financování španělskou bankou do výše 60-70 % pro non-residenty.",
      rates: "Od 3.5 % p.a. (často variabilní sazba EURIBOR)",
      howItWorks:
        "Lokální španělská banka financuje nákup. Úrokové sazby jsou často navázané na EURIBOR. Zástava je přímo na španělské nemovitosti.",
      idealFor:
        "Evropské investory, kteří chtějí nakupovat v Eurech a využít nižší španělské úroky.",
      setup:
        "Získání NIE (identifikační číslo cizince), otevření španělského účtu, doložení překladů českých daňových přiznání (Apostille).",
      advantages: [
        "Úrokové sazby často nižší než v ČR",
        "Měnové spárování (příjem z nájmu v EUR pokrývá splátku v EUR)",
      ],
      risks: [
        "Zdlouhavý bankovní proces a silná byrokracie",
        "Při variabilní sazbě riziko růstu EURIBORu",
      ],
      requirements: [
        "NIE číslo",
        "Oficiální překlady příjmů do španělštiny",
        "Vlastní zdroje min. 30-40 % + 10 % na daně (ITP)",
      ],
    },
    {
      id: "american-es",
      title: "Americká hypotéka z ČR",
      shortDesc:
        "Nejčastější volba Čechů – ručení českým bytem pro nákup španělské vily.",
      rates: "Kolem 5.5 % p.a. v CZK",
      howItWorks:
        "Zatížíte svou českou nemovitost, získáte CZK, převedete na EUR přes devizovou společnost a ve Španělsku kupujete za hotovost.",
      idealFor:
        "Čechy, kteří se chtějí vyhnout pekelné španělské byrokracii.",
      setup:
        "Běžný proces české hypotéky, následný směnný obchod přes služby typu Roklen/Citfin.",
      advantages: [
        "Rychlost (ve Španělsku jste cash-buyer)",
        "Žádné překlady dokumentů do španělštiny",
        "Česká zákaznická podpora v bance",
      ],
      risks: [
        "Kurzové riziko (pokud CZK oslabí, nemovitost vás v eurech stála více)",
        "Zatížení majetku v domovině",
      ],
      requirements: ["Nezatížená nemovitost v ČR"],
    },
  ],
  "Bali (Indonésie)": [
    {
      id: "bali-cash",
      title: "Hotovost / Fázované platby",
      shortDesc: "Lokální hypotéky pro cizince prakticky neexistují.",
      rates: "N/A",
      howItWorks:
        "V Indonésii cizinec (bez KITAS a příjmů) nedostane bankovní hypotéku. Nakupuje se za hotové, případně developer povolí splátky po dobu výstavby vily (typicky 12-18 měsíců).",
      idealFor:
        "Investory s vysokým cash-flow nebo ty, kteří si půjčili v domovské zemi.",
      setup:
        "Podpis Leasehold (nebo přes PT PMA firmu Freehold) smlouvy, postupné splácení notáři do escrow.",
      advantages: [
        "Žádné úrokové zatížení na místě",
        "Extrémně vysoké ROI (až 15 %) díky absenci finančních nákladů",
      ],
      risks: [
        "Nutnost mít 100 % kapitálu během krátké doby výstavby",
        "Specifická legislativa (Leasehold na 25-30 let)",
      ],
      requirements: ["Hotovostní prostředky převoditelné do IDR / USD"],
    },
  ],
};

export type { CountryId };
