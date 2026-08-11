/**
 * SEO topic landings — curated quality pages (not thin programmatic spam).
 *
 * Architecture:
 * - Hub: /temata
 * - Detail: /temata/[slug]
 * - Countries: linked from „hypotéka v zahraničí“ → existing /pruvodce-investora/{slug}
 *   (no duplicate thin country SEO pages)
 *
 * Quality bar (enforced in landings.test.ts):
 * - unique title/description
 * - real author from magazine people registry
 * - updatedAt + sources
 * - substantial body (sections + FAQ)
 * - internal links to tools / academy / articles
 */

import { routes, getCountryGuidePath } from "@/lib/routes";
import { countryOrder } from "@/lib/calculators";
import { getCountryDossier } from "@/lib/country-dossier";
import {
  WAVE1_COMMERCIAL_LANDINGS,
  type CommercialPageIntent,
} from "@/lib/seo/commercial-wave1";

export type SeoLandingLink = { label: string; href: string };

export type SeoLandingSource = {
  label: string;
  url?: string;
  note?: string;
};

export type SeoLandingSection = {
  id: string;
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type SeoLandingFaq = { question: string; answer: string };

export type SeoLanding = {
  slug: string;
  /** SEO title (unique) */
  title: string;
  description: string;
  h1: string;
  lead: string;
  audience: string;
  authorId: string;
  /** Optional real reviewer — omit if none */
  reviewerId?: string;
  publishedAt: string;
  updatedAt: string;
  sections: SeoLandingSection[];
  faqs: SeoLandingFaq[];
  sources: SeoLandingSource[];
  relatedTools: SeoLandingLink[];
  relatedArticles: SeoLandingLink[];
  relatedAcademy: SeoLandingLink[];
  /** Country dossiers — only on foreign hub */
  relatedCountries?: SeoLandingLink[];
  /** Phase 6 Wave 1 commercial intent (one winner per intent) */
  commercialIntent?: CommercialPageIntent;
  primaryCta?: SeoLandingLink;
  secondaryCta?: SeoLandingLink;
  quickAnswer?: { heading: string; bullets: string[] };
  showLeadCapture?: boolean;
};

export const SEO_LANDING_HUB = {
  path: "/temata",
  title: "Témata hypoték — přehled průvodců",
  description:
    "Průvodce hypotékou: OSVČ, refinancování, investiční a americká hypotéka, zahraniční příjem, koupě vs. nájem a hypotéka v zahraničí.",
} as const;

const CNB_MACRO =
  "https://www.cnb.cz/cs/financni-stabilita/makroobezretnostni-politika/";

const SEO_LANDINGS_BASE: SeoLanding[] = [
  {
    slug: "hypoteka-podle-prijmu",
    title: "Hypotéka podle příjmu — DSTI, splátka a reálná dostupnost",
    description:
      "Jak příjem, splátky a DSTI ovlivňují, co si můžete dovolit. Modelová kalkulace vs. bankovní posouzení — bez slibu schválení.",
    h1: "Hypotéka podle příjmu",
    lead: "Banky neposuzují jen cenu nemovitosti, ale hlavně, zda vaše příjmy unesou splátky a další závazky. Tento průvodce ukazuje, co modelovat dřív, než začnete vybírat byt.",
    audience:
      "Zaměstnanci a OSVČ, kteří chtějí odhadnout dostupnou splátku před návštěvou banky.",
    authorId: "redakce-hj",
    publishedAt: "2026-07-15",
    updatedAt: "2026-07-21",
    sections: [
      {
        id: "co-banka-vidi",
        heading: "Co banka v praxi sleduje",
        paragraphs: [
          "Kromě hrubého příjmu vstupují do hry stávající úvěry, leasingy, kreditní karty, alimenty a často i splátky partnera ve společné domácnosti. Model na webu je orientační — banka má vlastní metodiku a výjimky.",
          "DSTI (podíl splátek k příjmu) a DTI (násobek dluhu k příjmu) jsou makroobezřetnostní rámec, který se v čase mění. Aktuální doporučení ČNB ověřujte u primárního zdroje, ne z marketingových bannerů.",
        ],
        bullets: [
          "Nejdřív spočítejte čistou kapacitu splátky — teprve potom cenu nemovitosti.",
          "Zapomeňte-li na revolving a kontokorent, model podceníte.",
          "Výsledek z kalkulačky není příslib schválení konkrétní bankou.",
        ],
      },
      {
        id: "jak-modelovat",
        heading: "Jak modelovat bez falešného optimismu",
        paragraphs: [
          "Začněte konzervativní sazbou a rezervou na růst úroků po fixaci. Přidejte náklady na pojištění nemovitosti a životní rezervu (ideálně několik měsíčních splátek).",
          "Pokud jste OSVČ, banky často pracují s daňovým základem nebo specifickým přepočtem — viz téma Hypotéka OSVČ.",
        ],
      },
      {
        id: "dalsi-krok",
        heading: "Rozumný další krok",
        paragraphs: [
          "Až budete mít realistický strop splátky, ověřte připravenost dokumentů a LTV. Teprve potom dává smysl srovnávat konkrétní nabídky přes partnera.",
        ],
      },
    ],
    faqs: [
      {
        question: "Stačí hrubý příjem z výplatní pásky?",
        answer:
          "Ne. Banka hodnotí čistý příjem a závazky. U OSVČ záleží na dokládání a interních pravidlech banky — nejde o jednotný vzorec.",
      },
      {
        question: "Je výsledek z webu závazný?",
        answer:
          "Ne. Jde o model a edukaci. Schválení vždy závisí na bance, odhadu nemovitosti a kompletní dokumentaci.",
      },
    ],
    sources: [
      {
        label: "ČNB — makroobezřetnostní politika (LTV/DTI/DSTI)",
        url: CNB_MACRO,
        note: "Primární zdroj limity v čase; ověřte aktuální znění.",
      },
      { label: "Metodika dat Hypotéka Jasně", url: routes.metodika },
      { label: "Akademie: DSTI", url: `${routes.akademie}/dsti` },
    ],
    relatedTools: [
      { label: "Zjistit moje možnosti", href: routes.mojeMoznosti },
      { label: "Hypoteční připravenost", href: routes.navrhNaMiru },
    ],
    relatedArticles: [
      {
        label: "Regulace a investiční hypotéky v ČR",
        href: `${routes.clanky}/regulace-investicni-hypoteky-cr`,
      },
    ],
    relatedAcademy: [
      { label: "DSTI", href: `${routes.akademie}/dsti` },
      { label: "DTI", href: `${routes.akademie}/dti` },
    ],
  },
  {
    slug: "hypoteka-do-36-let",
    title: "Hypotéka do 36 let — věkové limity, LTV a co se mění",
    description:
      "Jak věk žadatele ovlivňuje splatnost, LTV a životní pojištění. Edukace k doporučením ČNB — bez marketingových slibů „výhody pro mladé“.",
    h1: "Hypotéka do 36 let",
    lead: "Věk žadatele ovlivňuje maximální splatnost a někdy i limity LTV. Nejprve pochopte pravidla, pak teprve srovnávejte „akce pro mladé“.",
    audience: "Žadatelé do cca 36 let a páry, kde jeden partner limity posouvá.",
    authorId: "redakce-hj",
    publishedAt: "2026-07-15",
    updatedAt: "2026-07-21",
    sections: [
      {
        id: "vek-a-splatnost",
        heading: "Věk a maximální splatnost",
        paragraphs: [
          "Banky typicky nastavují konec splatnosti tak, aby úvěr doběhl před určitým věkem klienta. Mladší žadatel má delší horizont — to samo o sobě nesnižuje úrok, ale může snížit měsíční splátku při stejném LTV.",
          "U společných žádostí rozhoduje často starší žadatel. „Do 36 let“ proto není marketingový štítek, ale praktický parametr modelu. Pokud je partnerovi 45 a vám 30, limity splatnosti se obvykle řídí starším žadatelem.",
        ],
      },
      {
        id: "ltv-ramce",
        heading: "LTV a doporučení ČNB",
        paragraphs: [
          "Makroobezřetnostní limity LTV se v čase mění a mohou rozlišovat skupiny žadatelů. Vždy ověřte aktuální doporučení ČNB a interní praxi banky — webový model je orientační.",
          "Vyšší LTV znamená vyšší riziko pro banku i pro vás: menší polštář při poklesu ceny nemovitosti a často přísnější pojištění. Nižší akontace také častěji znamená horší sazbové pásmo.",
        ],
        bullets: [
          "Nejdřív spočítejte potřebnou akontaci.",
          "Pak teprve porovnávejte sazby — LTV pásmo sazbu často ovlivní víc než „akce“.",
          "Rezerva na notáře, katastr a stěhování nepatří do „zbylé akontace“ v inzerátu.",
        ],
      },
      {
        id: "pojisteni-a-dokumenty",
        heading: "Pojištění a dokumenty",
        paragraphs: [
          "Delší splatnost zvyšuje celkový úrok zaplacený přes život úvěru — i když je měsíční splátka nižší. Pojištění schopnosti splácet nebo životní pojištění může být podmínkou banky; porovnejte, zda ho potřebujete jinde levněji.",
          "Připravenost dokumentů (příjem, závazky, odhad) zkrátí čas k nabídce víc než hledání „akce pro mladé“ bez čísel.",
        ],
      },
    ],
    faqs: [
      {
        question: "Mám automaticky nárok na vyšší LTV?",
        answer:
          "Ne. Limity a výjimky závisí na aktuálním rámci ČNB a metodice banky. Věk je jeden z faktorů, ne záruka.",
      },
      {
        question: "Vyplatí se vždy maximální splatnost?",
        answer:
          "Ne nutně. Delší splatnost snižuje splátku, ale zvyšuje celkový úrok a dobu rizika. Modelujte oba scénáře.",
      },
    ],
    sources: [
      {
        label: "ČNB — makroobezřetnostní politika",
        url: CNB_MACRO,
      },
      { label: "Akademie: LTV", url: `${routes.akademie}/ltv` },
      { label: "Metodika", url: routes.metodika },
    ],
    relatedTools: [
      { label: "Hypoteční připravenost", href: routes.navrhNaMiru },
      { label: "Zjistit moje možnosti", href: routes.mojeMoznosti },
    ],
    relatedArticles: [
      {
        label: "Úrokové sazby hypoték 2026 — kontext",
        href: `${routes.clanky}/urokove-sazby-hypotek-2026`,
      },
    ],
    relatedAcademy: [
      { label: "LTV", href: `${routes.akademie}/ltv` },
      { label: "Fixace", href: `${routes.akademie}/fixace` },
    ],
  },
  {
    slug: "koupe-vs-najem",
    title: "Koupě vs. nájem — rozhodovací model, ne ideologie",
    description:
      "Kdy dává smysl koupit a kdy zůstat v nájmu: horizont, náklady, sazby a rezerva. Orientační model s viditelnými předpoklady.",
    h1: "Koupě vs. nájem",
    lead: "Nejde o morální otázku „vlastnit = vyhrát“. Jde o cash-flow, horizont bydlení, náklady na úvěr a to, co se stane, když sazby nebo ceny půjdou proti vám.",
    audience:
      "Lidé rozhodující se mezi nájmem a první (nebo další) koupí v ČR.",
    authorId: "redakce-hj",
    publishedAt: "2026-07-15",
    updatedAt: "2026-07-21",
    sections: [
      {
        id: "promenne",
        heading: "Klíčové proměnné",
        paragraphs: [
          "Horizont bydlení, akontace, sazba, inflace nájmu, náklady na údržbu a daňové aspekty. Krátký horizont často favorizuje nájem — i když „všichni kupují“.",
          "Kalkulačka koupě vs. nájem ukazuje citlivost na předpoklady. Změňte je záměrně, ať nevidíte jen jeden příběh. Optimistic defaulty z marketingu do modelu nepatří.",
        ],
      },
      {
        id: "rizika",
        heading: "Rizika, která se v marketingu ztrácejí",
        paragraphs: [
          "Pokles ceny, růst sazeb po fixaci, výměna kotle, SVJ fond oprav. Nájem má riziko výpovědi a růstu nájmu — ale nižší vázaný kapitál.",
          "Pokud nemáte rezervu na 3–6 měsíců splátek a oprav, koupě na hraně DSTI je spekulace, ne „jistota střechy“.",
        ],
      },
      {
        id: "rozhodnuti",
        heading: "Jak rozhodnout bez ideologie",
        paragraphs: [
          "Sepište horizont, maximální komfortní splátku a alternativní výnos kapitálu (co byste dělali s akontací jinak). Teprve pak spusťte model a hypotéční připravenost.",
        ],
      },
    ],
    faqs: [
      {
        question: "Je koupě vždy lepší investice?",
        answer:
          "Ne. Záleží na horizontu, nákladech úvěru a alternativním výnosu kapitálu. Modelujte, neopakujte fráze.",
      },
      {
        question: "Kdy nájem dává větší smysl?",
        answer:
          "Typicky při krátkém horizontu, nejisté lokalitě, nízké rezervě nebo když by LTV/DSTI tlačily splátku nad komfortní strop.",
      },
    ],
    sources: [
      {
        label: "Kalkulačka koupě vs. nájem",
        url: routes.kalkulacky.koupeVsNajem,
      },
      { label: "Metodika modelů", url: routes.metodika },
    ],
    relatedTools: [
      {
        label: "Kalkulačka koupě vs. nájem",
        href: routes.kalkulacky.koupeVsNajem,
      },
      { label: "Hypoteční připravenost", href: routes.navrhNaMiru },
    ],
    relatedArticles: [
      {
        label: "Úrokové sazby hypoték — kontext",
        href: `${routes.clanky}/urokove-sazby-hypotek-2026`,
      },
    ],
    relatedAcademy: [
      { label: "RPSN", href: `${routes.akademie}/rpsn` },
    ],
  },
  {
    slug: "hypoteka-v-zahranici",
    title: "Hypotéka v zahraničí — cesty financování a rizika",
    description:
      "Jak Češi financují nákup v zahraničí: lokální hypotéka, české zajištění, hotovost. Hub na dossier zemí — bez thin duplicate stránek.",
    h1: "Hypotéka v zahraničí",
    lead: "Zahraniční nákup není „stejná hypotéka v jiné zemi“. Často rozhoduje struktura vlastnictví, měnové riziko a to, zda vůbec existuje lokální úvěr pro nerezidenty.",
    audience:
      "Češi zvažující nákup v EU, SAE, Bali nebo jinde v našem pokrytí trhů.",
    authorId: "redakce-hj",
    publishedAt: "2026-07-15",
    updatedAt: "2026-08-11",
    sections: [
      {
        id: "cesty",
        heading: "Typické cesty financování",
        paragraphs: [
          "Lokální hypotéka (pokud banka půjčí nerezidentovi), české zajištěné financování (úvěr v ČR proti české nemovitosti), platební plán developera, nebo hotovost. Každá cesta má jiné náklady a rizika.",
          "Mapa globálního financování pomáhá srovnat cesty vedle sebe — neříká, která je „nejlepší“.",
          "Pozor na záměnu záměrů: pokud kupujete v ČR a máte příjem ze zahraničí, patříte na stránku Hypotéka se zahraničním příjmem — ne sem.",
        ],
      },
      {
        id: "zeme",
        heading: "Jednotlivé země — plné dossiery, ne thin SEO kopie",
        paragraphs: [
          "Pro každou podporovanou zemi máme jeden kvalitní průvodce investora (vlastnictví, daně, financování, red flags). Nevytváříme stovky programatických stránek se stejným textem.",
          "Níže najdete odkazy na dossiery. Tvrzení o právu a daních mají status dat — NEEDS UPDATE / UNVERIFIED označujeme otevřeně.",
        ],
      },
      {
        id: "fx",
        heading: "Měnové a právní riziko",
        paragraphs: [
          "Splácíte-li v CZK a inkasujete v EUR/USD, nesete FX. Lokální právo, dědictví a exit mohou být dražší než „výnos z Airbnb“ v inzerátu.",
        ],
      },
    ],
    faqs: [
      {
        question: "Dostanu snadno hypotéku jako nerezident?",
        answer:
          "Záleží na zemi a bance. Často je snazší hotovost nebo české zajištění. Detaily jsou v dossieru konkrétní země.",
      },
    ],
    sources: [
      {
        label: "Článek: Zahraniční financování a české zajištění",
        url: `${routes.clanky}/zahranicni-financovani-ceske-zajisteni`,
      },
      { label: "Mapa globálního financování", url: routes.globalFinancing },
      { label: "Průvodce investora — hub", url: routes.pruvodceInvestora },
    ],
    relatedTools: [
      { label: "Mapa globálního financování", href: routes.globalFinancing },
      { label: "Osobní investiční průvodce", href: routes.investicniPas },
    ],
    relatedArticles: [
      {
        label: "Zahraniční financování a české zajištění",
        href: `${routes.clanky}/zahranicni-financovani-ceske-zajisteni`,
      },
      {
        label: "Hypotéka se zahraničním příjmem (jiný záměr)",
        href: `${routes.temata}/hypoteka-ze-zahranicniho-prijmu`,
      },
    ],
    relatedAcademy: [
      {
        label: "Vzdělávací cesty — zahraničí",
        href: `${routes.akademie}/cesty`,
      },
    ],
    relatedCountries: countryOrder.map((id) => {
      const d = getCountryDossier(id);
      return {
        label: d.name,
        href: getCountryGuidePath(id),
      };
    }),
  },
];

export const SEO_LANDINGS: SeoLanding[] = [
  ...SEO_LANDINGS_BASE,
  ...WAVE1_COMMERCIAL_LANDINGS,
];

export function getAllLandingSlugs(): string[] {
  return SEO_LANDINGS.map((l) => l.slug);
}

export function getLanding(slug: string): SeoLanding | undefined {
  return SEO_LANDINGS.find((l) => l.slug === slug);
}

export function getLandingPath(slug: string): string {
  return `${SEO_LANDING_HUB.path}/${slug}`;
}

/** Word-count proxy for thin-content guard. */
export function landingBodyWordCount(landing: SeoLanding): number {
  const parts = [
    landing.lead,
    landing.audience,
    ...landing.sections.flatMap((s) => [
      s.heading,
      ...s.paragraphs,
      ...(s.bullets ?? []),
    ]),
    ...landing.faqs.flatMap((f) => [f.question, f.answer]),
  ];
  return parts.join(" ").split(/\s+/).filter(Boolean).length;
}
