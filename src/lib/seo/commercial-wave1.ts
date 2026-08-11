/**
 * Wave 1 commercial intent landings — canonical winners per Phase 6 map.
 * Imported by landings.ts (values); type-only import from landings is safe here.
 */

import type { SeoLanding } from "./landings";
import { routes } from "@/lib/routes";

export type CommercialPageIntent =
  | "refinance"
  | "osvc"
  | "foreign_income"
  | "investment"
  | "american";

export const WAVE1_COMMERCIAL_SLUGS = [
  "refinancovani",
  "hypoteka-osvc",
  "hypoteka-ze-zahranicniho-prijmu",
  "investicni-hypoteka",
  "americka-hypoteka",
] as const;

export type Wave1CommercialSlug = (typeof WAVE1_COMMERCIAL_SLUGS)[number];

const CNB_MACRO =
  "https://www.cnb.cz/cs/financni-stabilita/makroobezretnostni-politika/";

const CNB_INVESTMENT_PRESS =
  "https://www.cnb.cz/cs/cnb-news/tiskove-zpravy/CNB-doporucuje-prisnejsi-limity-pro-investicni-hypoteky.-Kapitalove-rezervy-se-nemeni/";

const KB_HYPOTHEKA_APPLICATION =
  "https://www.kb.cz/cs/podpora/pujcky-a-hypoteky/zadost-o-hypoteku";
const KB_MORTGAGE_METHODOLOGY =
  "https://www.kb.cz/getmedia/0be647a9-681a-435a-936a-4644c09357fa/KB-Metodika-produkty-HU.pdf";
const KB_AMERICAN_PRODUCT =
  "https://www.kb.cz/cs/obcane/pujcky/hypoteky/americka-hypoteka";
const CS_AMERICAN_PRODUCT =
  "https://www.csas.cz/cs/osobni-finance/hypoteky/americka-hypoteka";
const MONETA_AMERICAN_PRODUCT =
  "https://www.moneta.cz/hypoteky/americka-hypoteka";
const UC_RATE_SHEET =
  "https://www.unicreditbank.cz/cs/ostatni/urokove-sazby.html";

const CNB_INVESTMENT_DEFINITION =
  "Investiční hypotékou se rozumí hypoteční úvěr poskytnutý za účelem pořízení třetí a další obytné nemovitosti anebo za účelem pořízení obytné nemovitosti určené k pronájmu.";

/** Extended landing shape — SeoLanding in landings.ts will gain these fields. */
export type Wave1CommercialLanding = SeoLanding & {
  commercialIntent: CommercialPageIntent;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  quickAnswer: { heading: string; bullets: string[] };
  showLeadCapture: true;
};

const wave1CommercialLandings: Wave1CommercialLanding[] = [
  {
    slug: "refinancovani",
    title:
      "Refinancování hypotéky: sazby, výpočet a postup | Hypotéka Jasně",
    description:
      "Průvodce refinancováním: rozdíl oproti refixaci, načasování konce fixace, náklady převodu a srovnání scénářů. Zveřejněné sazby pro refinancování bez slibu úspory.",
    h1: "Refinancování hypotéky",
    lead: "Refinancování znamená převod hypotéky k jiné bance nebo novou smlouvu u stávající — ne vždy je to lepší než refixace. Tento průvodce vás provede čísly, náklady a načasováním bez slibů „nejlevnější sazby“.",
    audience:
      "Klienti s běžící hypotékou blízko konce fixace nebo s výrazně vyšší sazbou než aktuální trh.",
    authorId: "redakce-hj",
    publishedAt: "2026-07-15",
    updatedAt: "2026-08-11",
    commercialIntent: "refinance",
    primaryCta: {
      label: "Porovnat zveřejněné sazby pro refinancování",
      href: `${routes.sazby}?purpose=refinance`,
    },
    secondaryCta: {
      label: "Spočítat splátku",
      href: routes.kalkulacky.hypotecniKalkulacka,
    },
    quickAnswer: {
      heading: "Refinancování v kostce",
      bullets: [
        "Refinancování = převod úvěru; refixace = nová sazba u stejné banky.",
        "Začněte řešit 3–6 měsíců před koncem fixace — odhad a dokumenty trvají.",
        "Porovnávejte RPSN, pojištění a poplatky, ne jen nominální sazbu.",
        "Zveřejněné sazby pro refinancování najdete na /sazby — nejsou závazná nabídka.",
      ],
    },
    showLeadCapture: true,
    sections: [
      {
        id: "refinancovani-vs-refixace",
        heading: "Co je refinancování vs. refixace",
        paragraphs: [
          "Refixace je změna úrokové sazby (a často podmínek) u stávající banky na základě stávající smlouvy. Refinancování znamená převod zůstatku dluhu k jiné instituci — nebo někdy novou smlouvu u stejné banky s jiným produktem.",
          "Marketing často míchá oba pojmy. Pro vás rozhoduje, zda zůstat u stávající smlouvy s novou fixací, nebo nést náklady převodu výměnou za lepší podmínky. Obě cesty mohou být rozumné — záleží na číslech, ne na sloganu.",
        ],
      },
      {
        id: "kdy-zacit",
        heading: "Kdy začít řešit konec fixace",
        paragraphs: [
          "Ideálně 3–6 měsíců před koncem fixace. Banka potřebuje odhad nemovitosti, výpisy, potvrzení příjmu a čas na schválení. Tlak v posledních týdnech často vede k první nabídce bez srovnání.",
          "Některé smlouvy umožňují předčasnou změnu — vždy ověřte sankce za předčasné splacení mimo konec fixace v konkrétní smlouvě, ne v obecném článku.",
        ],
        bullets: [
          "Zapište si datum konce fixace do kalendáře.",
          "Požádejte stávající banku o nabídku refixace písemně.",
          "Paralelně modelujte scénář převodu — až pak rozhodujte.",
        ],
      },
      {
        id: "co-potrebujete-znat",
        heading: "Co potřebujete znát před rozhodnutím",
        paragraphs: [
          "Zůstatek jistiny, aktuální sazba a zbývající fixace, původní splatnost a zbývající roky, měsíční splátka včetně pojištění a poplatků vázaných na úvěr.",
          "Bez těchto čísel nelze férově porovnat „zůstat“ vs. „refinancovat“. Banka vám je poskytne na vyžádání; některé údaje najdete v internetovém bankovnictví nebo ročním přehledu.",
        ],
      },
      {
        id: "sazba-a-splatka",
        heading: "Jak změna sazby mění splátku",
        paragraphs: [
          "Při stejné splatnosti a zůstatku snížení sazby o 0,5 p.b. typicky sníží splátku — ale ne vždy to pokryje náklady převodu v prvních letech. Orientační model najdete v hypoteční kalkulačce; výsledek není nabídka banky.",
          "Modelujte i scénář růstu sazby po nové fixaci. Krátká fixace s nejnižší sazbou může být dražší strategie, pokud očekáváte volatilitu úroků.",
        ],
        bullets: [
          "Spočítejte splátku při současném zůstatku a nové sazbě.",
          "Přidejte náklady převodu a rozdělte je po měsících fixace.",
          "Porovnejte s nabídkou refixace u stávající banky.",
        ],
      },
      {
        id: "naklady-a-podminky",
        heading: "Náklady a podmínky převodu",
        paragraphs: [
          "Typicky vstupují odhad nemovitosti, poplatek za vklad zástavního práva v katastru, notář (pokud je potřeba), případně poplatek za předčasné splacení u stávající banky mimo konec fixace.",
          "Nová smlouva může vyžadovat jiné pojištění nemovitosti nebo schopnosti splácet — porovnejte roční náklady, ne jen jednorázové poplatky.",
        ],
      },
      {
        id: "proc-nestaci-sazba",
        heading: "Proč nestačí nominální sazba",
        paragraphs: [
          "RPSN zahrnuje poplatky a některé vedlejší náklady — u refinancování rozhoduje o skutečné drahotě úvěru. Pojištění vázané na úvěr může rozdíl mezi dvěma nabídkami zcela smazat.",
          "Srovnávejte stejnou délku fixace a stejný zůstatek. Nižší sazba při kratší fixaci není automaticky lepší volba pro každého.",
        ],
      },
      {
        id: "postup-prevodu",
        heading: "Postup převodu krok za krokem",
        paragraphs: [
          "1) Seberte čísla ze stávající smlouvy. 2) Požádejte o refixaci u stávající banky. 3) Paralelně získejte orientační sazby pro refinancování na /sazby. 4) Spočítejte scénáře v kalkulačce. 5) Teprve pak žádejte o závaznou nabídku u vybrané banky.",
          "Převod obvykle vyžaduje nový odhad, schválení a vklad zástavního práva. Plánujte čas — není to záležitost jednoho týdne.",
        ],
      },
      {
        id: "kdy-zustat",
        heading: "Kdy zůstat u stávající banky",
        paragraphs: [
          "Refixace může být levnější než převod, pokud náklady katastru a odhadu se nevrátí během plánované fixace. Některé banky nabídnou konkurenceschopnou sazbu klientům, kteří mají srovnání od jinde.",
          "Zůstat dává smysl i při krátkém horizontu prodeje nemovitosti nebo když nová banka neuzná váš příjem stejně příznivě. Rozhodnutí není ideologické — je aritmetické.",
        ],
      },
      {
        id: "data-a-transparentnost",
        heading: "Data a transparentnost sazeb",
        paragraphs: [
          "Na stránce /sazby zveřejňujeme sazby bank pro účel refinancování (purpose=refinance), kde máme ověřený primární zdroj. Ne všechny banky mají veřejně stejně detailní ceník — u části scénářů pracujeme s ověřenými, ale omezenými daty a to uvádíme.",
          "Zveřejněná sazba není závazná nabídka pro vaši nemovitost. Finální podmínky závisí na LTV, příjmu, scoringu a interní metodice banky.",
        ],
      },
    ],
    faqs: [
      {
        question: "Musím refinancovat hned po konci fixace?",
        answer:
          "Ne. Můžete refixovat u stávající banky nebo refinancovat později — záleží na smlouvě a nákladech. Rozhodujte podle scénářů, ne podle reklam.",
      },
      {
        question: "Kolik ušetřím refinancováním?",
        answer:
          "Nelze slíbit univerzální úsporu. Záleží na rozdílu sazeb, zůstatku, nákladech převodu a pojištění. Spočítejte si oba scénáře v kalkulačce.",
      },
      {
        question: "Stačí porovnat jen úrokovou sazbu?",
        answer:
          "Ne. RPSN, pojištění, poplatky a délka fixace často rozhodnou víc než desetina procenta na sazbě.",
      },
      {
        question: "Jsou sazby na /sazby závazné?",
        answer:
          "Ne. Jde o zveřejněné informace z primárních zdrojů bank. Vaše nabídka může být jiná podle profilu a nemovitosti.",
      },
    ],
    sources: [
      {
        label: "Článek: Refinancování po fixaci — checklist",
        url: `${routes.clanky}/refinancovani-po-fixaci-checklist`,
      },
      { label: "Akademie: Fixace", url: `${routes.akademie}/fixace` },
      {
        label: "ČNB — makroobezřetnostní politika",
        url: CNB_MACRO,
        note: "Rámec LTV/DTI/DSTI v čase; ověřte aktuální znění.",
      },
      {
        label: "Zveřejněné sazby pro refinancování",
        url: `${routes.sazby}?purpose=refinance`,
      },
      { label: "Metodika dat Hypotéka Jasně", url: routes.metodika },
    ],
    relatedTools: [
      {
        label: "Sazby pro refinancování",
        href: `${routes.sazby}?purpose=refinance`,
      },
      {
        label: "Hypoteční kalkulačka",
        href: routes.kalkulacky.hypotecniKalkulacka,
      },
      { label: "Zjistit moje možnosti", href: routes.mojeMoznosti },
    ],
    relatedArticles: [
      {
        label: "Refinancování po fixaci — checklist",
        href: `${routes.clanky}/refinancovani-po-fixaci-checklist`,
      },
    ],
    relatedAcademy: [
      { label: "Fixace", href: `${routes.akademie}/fixace` },
      { label: "RPSN", href: `${routes.akademie}/rpsn` },
    ],
  },
  {
    slug: "hypoteka-osvc",
    title: "Hypotéka pro OSVČ: příjmy, doklady a možnosti | Hypotéka Jasně",
    description:
      "Jak OSVČ dokládají příjem k hypotéce: daňové přiznání, paušální výdaje i paušální daň. Metodiky bank se liší — bez vymyšlených koeficientů.",
    h1: "Hypotéka pro OSVČ",
    lead: "Banky používají vlastní underwriting. Uznaný příjem OSVČ může vycházet z daňového základu / zisku, daňové historie, historie podnikání, nebo — pokud to banka výslovně umožňuje — z obratové metodiky. Připravte dokumenty a realistický strop splátky dřív, než rezervujete nemovitost.",
    audience:
      "OSVČ, freelancery a majitelé jednoosobových živností v ČR s příjmem z podnikání.",
    authorId: "redakce-hj",
    publishedAt: "2026-07-15",
    updatedAt: "2026-08-11",
    commercialIntent: "osvc",
    primaryCta: {
      label: "Spustit diagnostiku",
      href: `${routes.mojeMoznosti}?income=osvc_pausal`,
    },
    secondaryCta: { label: "Ověřené sazby", href: routes.sazby },
    quickAnswer: {
      heading: "OSVČ a hypotéka v kostce",
      bullets: [
        "Metodika uznání příjmu se liší banka od banky — neexistuje jedna univerzální formule.",
        "Často vstupuje daňová historie; u některých produktů i obratová / transakční metoda.",
        "Požadované doklady (počet daňových přiznání, výpisy) se liší — ověřte u konkrétní banky.",
        "Diagnostika na /moje-moznosti pomůže s orientací, ne se schválením.",
      ],
    },
    showLeadCapture: true,
    sections: [
      {
        id: "kdo-je-to-pro",
        heading: "Pro koho je tento průvodce",
        paragraphs: [
          "Pro žadatele s příjmem z OSVČ v ČR — ať už jste na vedlejší činnost, na hlavní živnost, nebo přecházíte ze zaměstnání. Společná žádost s partnerem se zaměstnaneckým příjmem mění kapacitu úvěru.",
          "Průvodce neřeší firemní úvěry s.r.o. — tam platí jiná pravidla a účetnictví. Zaměřujeme se na fyzické osoby podnikající.",
        ],
      },
      {
        id: "jak-dokladat-prijem",
        heading: "Jak se dokládá a uznává příjem",
        paragraphs: [
          "Banky používají vlastní underwriting. Podle banky a doložené situace může uznaný příjem OSVČ vycházet z daňového základu / zisku, daňové historie, historie podnikání, obratové / transakční metodiky tam, kde ji banka výslovně umožňuje, nebo z jiné zveřejněné metodiky.",
          "Hrubý obrat na fakturách proto není automaticky „příjem pro splátky“. Zároveň ale neplatí absolutní tvrzení, že banka obrat nikdy neposuzuje — záleží na produktu a metodice.",
        ],
      },
      {
        id: "priklady-bank",
        heading: "Příklady zveřejněných požadavků bank",
        paragraphs: [
          "Komerční banka na stránce Žádost o hypotéku uvádí, že podnikatel dokládá daňové přiznání za poslední 2 roky (zaměstnanec formulářem Potvrzení o příjmu). Jde o požadavek konkrétní banky — ne o univerzální pravidlo trhu.",
          "Ve veřejné Metodice hypotečních úvěrů KB banka popisuje výpočet čistého příjmu z podnikání (kalkulačka DP / paušální daň) a ve vybraných případech i obratovou metodu s výpisy z podnikatelského účtu (např. výpisy za poslední 3 měsíce plus výpis za 6. měsíc před žádostí u paušální daně). Koeficienty a přesné přepočty bez aktuálního ověření u banky neuvádíme.",
        ],
        bullets: [
          "KB (veřejná podpora): daňové přiznání podnikatele za poslední 2 roky.",
          "KB (metodika): daňový základ / paušální daň; ve vybraných případech obratová metoda.",
          "Jiná banka může chtít jiný počet let DP nebo jiné výpisy — ověřte primární zdroj.",
        ],
      },
      {
        id: "danove-rezimy",
        heading: "Daňové přiznání vs. výdajový paušál vs. paušální daň",
        paragraphs: [
          "U skutečných výdajů banka často pracuje s účetním ziskem. U výdajového paušálu se daňový základ snižuje podle zákonných paušálních sazeb — uznaný příjem pak může být výrazně nižší než cash-flow.",
          "U paušální daně mají banky specifická pravidla. Konkrétní koeficienty a přepočty se liší banka od banky — bez aktuálního ověřeného primárního důkazu je neuvádíme.",
        ],
        bullets: [
          "Nejdřív zjistěte, co konkrétní banka uzná z vašeho daňového režimu.",
          "Modelujte konzervativně — ne podle nejlepšího měsíce.",
          "Společná žádost může změnit kapacitu splátek (interní test banky).",
        ],
      },
      {
        id: "historie-podnikani",
        heading: "Historie podnikání a stabilita",
        paragraphs: [
          "Banky často preferují uzavřené daňové období; počet let a přísnost se liší produkt od produktu. Výkyvy tržeb, nová živnost nebo přechod z zaměstnání zvyšují nejistotu posouzení.",
          "Pokud plánujete hypotéku, stabilizujte cash-flow a dokumentaci dřív, než podáte žádost. Náhlý nárůst fakturace těsně před žádostí nemusí banku přesvědčit.",
        ],
      },
      {
        id: "typicke-doklady",
        heading: "Doklady — obecně, ne univerzálně",
        paragraphs: [
          "Často se objevují daňová přiznání včetně příloh, doklad o zaplacení daně / bezdlužnosti, přehledy pojistného, výpisy z podnikatelského účtu a standardní dokumenty k nemovitosti. Přesný seznam a délka historie výpisů se liší podle banky — neplatí jedno univerzální „6–12 měsíců výpisů“ ani „vždy dvě přiznání“ pro celý trh.",
          "Banka může požadovat i smlouvy s hlavními odběrateli nebo potvrzení o délce spolupráce — záleží na oboru a riziku. Seznam si ověřte u konkrétní banky.",
        ],
      },
      {
        id: "spoluzadatel",
        heading: "Spolužadatel a kombinace příjmů",
        paragraphs: [
          "Partner se zaměstnaneckým příjmem často zvýší kapacitu úvěru — banka posuzuje domácnost dohromady. Naopak závazky partnera snižují kapacitu stejně jako vaše.",
          "Společná žádost není automatická výhra: oba musíte projít scoringem a dokumentací.",
        ],
      },
      {
        id: "co-banky-posuzuji",
        heading: "Co banky posuzují — ověřená fakta vs. nejistota",
        paragraphs: [
          "Fakt: banka pracuje s doloženým příjmem dle své metodiky, závazky, LTV a scoringem. Makroobezřetnostní rámec ČNB (LTV; DTI/DSTI dle aktuálního nastavení) se vztahuje na standardní hypotéky stejně jako u zaměstnanců — stav DTI/DSTI ověřte u ČNB.",
          "Bez konkrétní banky nejisté: přesný přepočet paušálních výdajů, podmínky obratové metody, výjimky pro mladé podnikatele nebo specifická odvětví. Tyto parametry se mění a liší produkt od produktu.",
        ],
      },
      {
        id: "dalsi-krok",
        heading: "Další krok: diagnostika",
        paragraphs: [
          "Orientační diagnostika na /moje-moznosti s parametrem income=osvc_pausal vám pomůže seřadit priority — dokumenty, rezervu splátky, LTV. Výsledek není schválení úvěru.",
          "Až budete mít realistický strop splátky, dává smysl porovnat ověřené sazby na /sazby a připravit se na konkrétní banku.",
        ],
      },
    ],
    faqs: [
      {
        question: "Stačí výpis z účtu za tři měsíce?",
        answer:
          "Záleží na bance a metodice. Některé produkty vyžadují daňovou historii; jinde výpisy doplňují nebo v omezených případech podporují obratovou metodu. Výpisy obvykle nenahrazují daňová přiznání, pokud je banka vyžaduje.",
      },
      {
        question: "Banka uzná celý můj obrat?",
        answer:
          "Neautomaticky. Uznávaný příjem závisí na metodice banky — daňový základ / zisk, historie, případně obratová metoda tam, kde ji banka výslovně umožňuje. Obrat na faktuře není totéž co uznaný příjem.",
      },
      {
        question: "Pomůže paušální daň?",
        answer:
          "Záleží na pásmu a bance. Některé banky mají specifické přepočty, jiné posuzují přísněji. Bez ověření u konkrétní banky neplánujte optimisticky.",
      },
      {
        question: "Kolik let podnikání banka chce?",
        answer:
          "Liší se produkt od produktu. Některé banky uvádějí konkrétní počet daňových přiznání (např. KB veřejně uvádí 2 roky u podnikatele); jinde stačí jiné nastavení. U nové živnosti bývá kapacita nižší nebo banka žádost odmítne.",
      },
    ],
    sources: [
      {
        label: "KB — Žádost o hypotéku (doklady podnikatele)",
        url: KB_HYPOTHEKA_APPLICATION,
      },
      {
        label: "KB — Metodika hypotečních úvěrů (PDF)",
        url: KB_MORTGAGE_METHODOLOGY,
      },
      {
        label: "ČNB — makroobezřetnostní politika",
        url: CNB_MACRO,
      },
      { label: "Metodika dat Hypotéka Jasně", url: routes.metodika },
      {
        label: "Akademie: cesta OSVČ",
        url: `${routes.akademie}/cesty`,
      },
      { label: "Redakční zásady", url: routes.editorialPolicy },
    ],
    relatedTools: [
      {
        label: "Diagnostika OSVČ",
        href: `${routes.mojeMoznosti}?income=osvc_pausal`,
      },
      { label: "Ověřené sazby", href: routes.sazby },
      { label: "Hypoteční kalkulačka", href: routes.kalkulacky.hypotecniKalkulacka },
    ],
    relatedArticles: [
      {
        label: "Hypotéka podle příjmu",
        href: `${routes.temata}/hypoteka-podle-prijmu`,
      },
    ],
    relatedAcademy: [
      { label: "DSTI", href: `${routes.akademie}/dsti` },
      { label: "Cesta OSVČ", href: `${routes.akademie}/cesty` },
    ],
  },
  {
    slug: "hypoteka-ze-zahranicniho-prijmu",
    title: "Hypotéka se zahraničním příjmem | Hypotéka Jasně",
    description:
      "Financování české nemovitosti při příjmu ze zahraničí: dokumentace, měna, stabilita zaměstnání a proč se banky liší. Jiný záměr než koupě nemovitosti v zahraničí.",
    h1: "Hypotéka se zahraničním příjmem",
    lead: "Máte příjem mimo ČR a kupujete nebo refinancujete nemovitost v Česku? Banky posuzují měnu, stabilitu zaměstnavatele a dokumentaci jinak než u čistě českého příjmu. Tento průvodce vysvětluje obecné principy — ne slib schválení.",
    audience:
      "Zaměstnanci a podnikatelé s příjmem ze zahraničí financující bydlení v ČR.",
    authorId: "redakce-hj",
    publishedAt: "2026-07-15",
    updatedAt: "2026-08-11",
    commercialIntent: "foreign_income",
    primaryCta: {
      label: "Zjistit možnosti pro moji situaci",
      href: "#poptavka",
    },
    secondaryCta: {
      label: "Orientační diagnostika",
      href: routes.mojeMoznosti,
    },
    quickAnswer: {
      heading: "Zahraniční příjem v kostce",
      bullets: [
        "Jde o financování nemovitosti v ČR — ne o koupi v zahraničí (viz /temata/hypoteka-v-zahranici).",
        "Konkrétní doklady se liší podle banky, země, měny a typu příjmu.",
        "Pravidla pro rezidence a občanství se liší — bez konkrétní banky je neobecňujeme.",
        "Individuální posouzení je normální; webový model je jen orientační.",
      ],
    },
    showLeadCapture: true,
    sections: [
      {
        id: "prijem-mimo-cr",
        heading: "Příjem mimo ČR a zahraniční zaměstnavatel",
        paragraphs: [
          "Typický scénář: pracujete pro firmu se sídlem v EU, UK, USA nebo jinde, ale kupujete byt v Česku. Banka musí ověřit, že příjem je trvalý, legální a dostupný pro splátky v CZK.",
          "Některé banky financují zahraniční příjem běžně, jiné ho neberou vůbec nebo jen u vybraných zemí a měn. Není jednotný seznam „schválených zemí“ platný pro všechny — liší se produkt od produktu.",
        ],
      },
      {
        id: "mena-a-fx",
        heading: "Měna příjmu a kurzové riziko",
        paragraphs: [
          "Příjem v EUR, USD nebo jiné měně banka obvykle přepočte kurzem — často konzervativním. Nesete riziko, že posílení koruny sníží uznanou kapacitu, i když vám „v kapse“ nic nechybí.",
          "Modelujte rezervu na výkyvy kurzu. Banka může požadovat splácení v CZK z českého účtu i při příjmu v cizí měně.",
        ],
      },
      {
        id: "dokumentace",
        heading: "Dokumentace — bankově specifická",
        paragraphs: [
          "Konkrétní doklady se liší podle banky, země, měny a typu příjmu. Neexistuje jeden univerzální seznam „povinný překlad + 6–12 měsíců výpisů + ověření zaměstnavatele + potvrzení o bezdlužnosti“ pro všechny banky.",
          "Připravte se na delší schvalovací proces a ověřte seznam u konkrétní instituce dřív, než složíte rezervaci.",
        ],
      },
      {
        id: "priklady-bank-zahranicni",
        heading: "Příklady zveřejněných požadavků bank",
        paragraphs: [
          "Komerční banka ve veřejné Metodice hypotečních úvěrů popisuje zvláštní pravidla pro občany ČR s příjmem ze zahraničí. U „pendlerů“ ze sousedních zemí i u příjmu z ostatních států metodika uvádí např. potvrzení o výši pracovního příjmu, pracovní smlouvu a výpisy z účtu, kam je mzda zasílána, za posledních 6 uplynulých měsíců. U cizojazyčné smlouvy KB uvádí, že nemusí jít o úřední překlad certifikovaným překladatelem — kontrolují se vybrané údaje.",
          "Stejná metodika také omezuje akceptaci: podnikatelská činnost se zdrojem v zahraničí a další zahraniční příjmy (např. pronájem) standardně neakceptuje. Jde o pravidla KB — jiné banky mohou mít jiné seznamy dokladů i jiné omezení.",
        ],
        bullets: [
          "KB: specifická kapitola pro příjem ze zahraničí (pendler vs. ostatní státy).",
          "KB příklad: výpisy 6 měsíců u mzdy ze zahraničí — ne univerzální tržní norma.",
          "UniCredit veřejně popisuje cizoměnovou hypotéku (příjem v cizí měně / bydliště mimo ČR) a právo na předčasné splacení při výrazném posílení CZK — podmínky ověřte na stránce banky.",
        ],
      },
      {
        id: "stabilita-zamestnani",
        heading: "Stabilita zaměstnání a historie",
        paragraphs: [
          "Banka hodnotí délku pracovního poměru, zkušební dobu, typ smlouvy (dočasná vs. na dobu neurčitou) a stabilitu odvětví zaměstnavatele. Časté job-hopping nebo nové zaměstnání zvyšuje riziko odmítnutí.",
          "U OSVČ se zahraničními klienty platí podobná logika jako u české OSVČ — daňová historie a ověřitelnost příjmů rozhodují, pokud banka takový příjem vůbec akceptuje.",
        ],
      },
      {
        id: "financovani-v-cr",
        heading: "Financování české nemovitosti",
        paragraphs: [
          "Hypotéka v ČR se řídí českým právem, LTV limity ČNB a metodikou banky. Zahraniční příjem nemění samotný produkt — mění posouzení bonity.",
          "LTV pro vlastní bydlení zůstává v rámci makroobezřetnostních doporučení ČNB (typicky až 80 %, u žadatelů do 36 let za určitých podmínek až 90 %). DTI/DSTI pro standardní vlastní bydlení zůstávají deaktivovaná — ověřte aktuální stav u ČNB.",
        ],
      },
      {
        id: "proc-se-banky-lisi",
        heading: "Proč se banky liší",
        paragraphs: [
          "Každá banka má jiný apetit k riziku, seznam akceptovaných zemí, měn a typů smluv. Co projde u jedné banky, nemusí projít u druhé — není to diskriminace klienta, ale interní pravidla.",
          "Hypoteční specialista s přístupem k více bankám pomáhá zúžit hledání — webová diagnostika jen orientuje, kam směřovat otázky.",
        ],
      },
      {
        id: "rezidence-a-obcanstvi",
        heading: "Rezidence a občanství — opatrně",
        paragraphs: [
          "Bez konkrétní banky neobecňujeme: některé produkty vyžadují trvalý pobyt v ČR, jiné akceptují cizince s povolením k pobytu. Občanství EU může být výhoda u některých bank, u jiných irelevantní.",
          "Individuální posouzení je zde norma. Pokud nemáte trvalý pobyt v ČR, kapacita bank může být omezená — ověřte dřív, než složíte rezervaci.",
        ],
      },
      {
        id: "jiny-zamer-nez-zahranici",
        heading: "Jiný záměr než hypotéka v zahraničí",
        paragraphs: [
          "Tato stránka řeší **příjem ze zahraničí pro nemovitost v ČR**. Chcete-li koupit byt v Dubaji, Španělsku nebo jinde, jde o jiný záměr — viz hub Hypotéka v zahraničí na /temata/hypoteka-v-zahranici s dossier jednotlivých zemí.",
          "Nemíchejte oba záměry v jedné žádosti ani v SEO dotazech — banka i vy potřebujete jinou dokumentaci a strukturu.",
        ],
      },
    ],
    faqs: [
      {
        question: "Financuje každá banka příjem v EUR?",
        answer:
          "Ne. Akceptace měny a země závisí na bance a produktu. Ověřte u konkrétní instituce, ne obecně na internetu.",
      },
      {
        question: "Potřebuji trvalý pobyt v ČR?",
        answer:
          "Záleží na bance a produktu. Některé hypotéky vyžadují trvalý pobyt nebo povolení k dlouhodobému pobytu. Bez konkrétní banky neplánujte optimisticky.",
      },
      {
        question: "Je to totéž jako koupě bytu v zahraničí?",
        answer:
          "Ne. Tato stránka je pro příjem ze zahraničí a nemovitost v ČR. Pro nákup v zahraničí viz /temata/hypoteka-v-zahranici.",
      },
      {
        question: "Musím vždy úřední překlad a 6–12 měsíců výpisů?",
        answer:
          "Ne univerzálně. Požadavky se liší banka od banky. Např. KB u cizojazyčné smlouvy uvádí kontrolu vybraných údajů bez nutnosti úředního překladu; u mzdy ze zahraničí v metodice uvádí výpisy za 6 měsíců. Jinde platí jiný seznam.",
      },
      {
        question: "Může web slíbit schválení?",
        answer:
          "Ne. Diagnostika a průvodce jsou edukace. Schválení vždy závisí na bance, dokumentaci a scoringu.",
      },
    ],
    sources: [
      {
        label: "KB — Metodika hypotečních úvěrů (příjem ze zahraničí)",
        url: KB_MORTGAGE_METHODOLOGY,
      },
      {
        label: "UniCredit — hypotéka (cizoměnová hypotéka)",
        url: "https://www.unicreditbank.cz/cs/obcane/hypoteky/hypoteka-nove-penize.html",
      },
      {
        label: "ČNB — makroobezřetnostní politika",
        url: CNB_MACRO,
      },
      { label: "Metodika dat Hypotéka Jasně", url: routes.metodika },
      {
        label: "Hypotéka v zahraničí (jiný záměr)",
        url: `${routes.temata}/hypoteka-v-zahranici`,
      },
    ],
    relatedTools: [
      { label: "Orientační diagnostika", href: routes.mojeMoznosti },
      { label: "Ověřené sazby", href: routes.sazby },
      { label: "Hypoteční kalkulačka", href: routes.kalkulacky.hypotecniKalkulacka },
    ],
    relatedArticles: [
      {
        label: "Zahraniční financování a české zajištění",
        href: `${routes.clanky}/zahranicni-financovani-ceske-zajisteni`,
      },
    ],
    relatedAcademy: [
      { label: "LTV", href: `${routes.akademie}/ltv` },
      { label: "DSTI", href: `${routes.akademie}/dsti` },
    ],
  },
  {
    slug: "investicni-hypoteka",
    title: "Investiční hypotéka: pravidla, LTV a výpočet | Hypotéka Jasně",
    description:
      "Co je investiční hypotéka podle ČNB, limity LTV 70 % a DTI 7 od dubna 2026 a jak modelovat investici. Vazba na Investiční rentgen — bez slibů schválení.",
    h1: "Investiční hypotéka",
    lead: "Investiční hypotéka není „stejný úvěr s jiným účelem“. ČNB od 1. dubna 2026 doporučuje přísnější limity pro definované investiční úvěry — a banky posuzují nájemní příjem konzervativněji než plat ze zaměstnání.",
    audience:
      "Investoři do nájemního bydlení v ČR a lidé pořizující třetí a další obytnou nemovitost.",
    authorId: "redakce-hj",
    publishedAt: "2026-07-15",
    updatedAt: "2026-08-11",
    commercialIntent: "investment",
    primaryCta: {
      label: "Spustit Investiční rentgen",
      href: routes.investicniRentgen,
    },
    secondaryCta: {
      label: "Zjistit možnosti",
      href: "#poptavka",
    },
    quickAnswer: {
      heading: "Investiční hypotéka v kostce",
      bullets: [
        `ČNB definice: „${CNB_INVESTMENT_DEFINITION}"`,
        "Od 1. 4. 2026: LTV max. 70 % a DTI max. 7 u investičních hypoték dle definice ČNB.",
        "Vlastní bydlení: LTV 80 % (do 36 let za podmínek 90 %) — DTI/DSTI pro standardní FO deaktivovaná.",
        "Investiční rentgen pomáhá modelovat scénář — ne garantuje úvěr.",
      ],
    },
    showLeadCapture: true,
    sections: [
      {
        id: "definice-cnb",
        heading: "Definice investiční hypotéky podle ČNB",
        paragraphs: [
          `Česká národní banka v tiskové zprávě uvádí: „${CNB_INVESTMENT_DEFINITION}"`,
          "Nejde tedy automaticky o „druhou nemovitost“ obecně — rozhoduje účel (třetí a další obytná nemovitost nebo nemovitost určená k pronájmu). Druhý byt k vlastnímu bydlení nemusí spadat pod investiční definici — posoudí banka a účel úvěru.",
        ],
      },
      {
        id: "limity-2026",
        heading: "LTV 70 % a DTI 7 od 1. dubna 2026",
        paragraphs: [
          "Od 1. dubna 2026 ČNB doporučuje u investičních hypoték podle výše uvedené definice maximální LTV 70 % a DTI 7. Kapitalové rezervy bank se podle tiskové zprávy nemění.",
          "Pro standardní hypotéku na vlastní bydlení zůstávají doporučené limity LTV 80 % (u žadatelů do 36 let za určitých podmínek až 90 %). Makroobezřetnostní limity DTI a DSTI pro běžné hypotéky fyzických osob na vlastní bydlení zůstávají deaktivované — stav ověřte u primárního zdroje ČNB.",
        ],
        bullets: [
          "Investiční účel dle ČNB → LTV 70 %, DTI 7 (od 4/2026).",
          "Vlastní bydlení → jiný rámec LTV; DTI/DSTI deaktivovaná pro standardní FO.",
          "Primární zdroj: tisková zpráva a makroobezřetnostní politika ČNB.",
        ],
      },
      {
        id: "rozdil-vuci-bydleni",
        heading: "Rozdíl oproti hypotéce na vlastní bydlení",
        paragraphs: [
          "U investice banka používá vlastní interní test schopnosti splácet a může nájemní příjem započítávat konzervativně (částečně / s haircutem). Často vyžaduje vyšší akontaci. Marketing „cash-flow od prvního dne“ ignoruje neobsazenost, správu, daň a růst sazeb po fixaci.",
          "Plošný regulační limit DSTI ČNB pro běžné hypotéky na vlastní bydlení zůstává deaktivovaný — u investice se proto nespoléhejte na „aktuální DSTI limit ČNB“, ale na interní praxi banky a doporučené LTV/DTI pro investiční úvěry. Každá další investiční nemovitost snižuje zbývající kapacitu — plánujte equity dopředu.",
        ],
      },
      {
        id: "investicni-rentgen",
        heading: "Investiční rentgen jako modelovací nástroj",
        paragraphs: [
          "Investiční rentgen na /investicni-rentgen pomáhá srovnat scénáře, trhy a citlivost na sazby — není náhradou bankovního posouzení ani slibem schválení.",
          "Pro rozhodnutí „koupit / nekoupit“ potřebujete konzervativní model včetně neobsazenosti a režijních nákladů, ne nejlepší měsíc z inzerátu.",
        ],
      },
      {
        id: "regulace-clanek",
        heading: "Regulace a podpůrný článek",
        paragraphs: [
          "Podrobnější kontext k doporučením ČNB a praxi bank najdete v článku Regulace a investiční hypotéky v ČR. Článek doplňuje tiskovou zprávu, nenahrazuje ji.",
          "Pravidla se vyvíjejí — vždy ověřte aktuální znění u ČNB před závazným rozhodnutím.",
        ],
      },
      {
        id: "co-banka-posuzuje",
        heading: "Co banka posuzuje u investičního úvěru",
        paragraphs: [
          "Kromě LTV a DTI vstupuje příjem z nájmu (s haircutem), stávající portfolio nemovitostí, závazky domácnosti a bonita ručitele. Firemní struktura (s.r.o.) může otevřít jiný produkt, ale není automatickým obcházením limitů FO.",
          "Webový odhad kapacity není nabídka. Banka má interní výjimky a scoring.",
        ],
      },
      {
        id: "dalsi-krok",
        heading: "Další krok",
        paragraphs: [
          "Spusťte Investiční rentgen pro orientační model, pak diagnostiku možností. Teprve s čísly v ruce dává smysl jednat s bankou nebo hypotečním specialistou.",
        ],
      },
    ],
    faqs: [
      {
        question: "Platí LTV 70 % pro každou druhou nemovitost?",
        answer:
          "Ne automaticky. ČNB vázat limity na investiční hypotéku dle definice (třetí a další obytná nemovitost nebo účel pronájmu). Druhý byt k vlastnímu bydlení nemusí spadat pod investiční rámec — posoudí banka.",
      },
      {
        question: "Zaplatí nájem celou splátku?",
        answer:
          "Ne vždy. Modelujte neobsazenost, daň a správu. Banka navíc nemusí započítat nájem 1:1.",
      },
      {
        question: "Kdy vstoupí limity DTI 7?",
        answer:
          "Dle tiskové zprávy ČNB od 1. dubna 2026 u investičních hypoték podle definice ČNB. Ověřte aktuální stav u primárního zdroje.",
      },
      {
        question: "Nahradí rentgen návštěvu banky?",
        answer:
          "Ne. Rentgen je edukační model. Schválení a podmínky vždy určuje banka.",
      },
    ],
    sources: [
      {
        label: "ČNB — tisková zpráva k investičním hypotékám",
        url: CNB_INVESTMENT_PRESS,
      },
      {
        label: "ČNB — makroobezřetnostní politika",
        url: CNB_MACRO,
      },
      {
        label: "Regulace a investiční hypotéky v ČR",
        url: `${routes.clanky}/regulace-investicni-hypoteky-cr`,
      },
      { label: "Investiční rentgen", url: routes.investicniRentgen },
    ],
    relatedTools: [
      { label: "Investiční rentgen", href: routes.investicniRentgen },
      { label: "Osobní investiční průvodce", href: routes.investicniPas },
      { label: "Ověřené sazby", href: routes.sazby },
    ],
    relatedArticles: [
      {
        label: "Regulace a investiční hypotéky v ČR",
        href: `${routes.clanky}/regulace-investicni-hypoteky-cr`,
      },
    ],
    relatedAcademy: [
      { label: "LTV", href: `${routes.akademie}/ltv` },
      { label: "DTI", href: `${routes.akademie}/dti` },
    ],
  },
  {
    slug: "americka-hypoteka",
    title: "Americká hypotéka: jak funguje a co stojí | Hypotéka Jasně",
    description:
      "Neúčelový úvěr zajištěný nemovitostí vs. klasická hypotéka: rizika zástavy, LTV a sazby. Produktově specifická data z oficiálních zdrojů bank — bez záměny se sazbami na koupi bydlení.",
    h1: "Americká hypotéka",
    lead: "Americká hypotéka v českém prostředí znamená neúčelový úvěr zajištěný nemovitostí — peníze nemusíte prokazatě investovat do bydlení. Jiné riziko, jiné sazby, jiná pravidla než u klasické hypotéky.",
    audience:
      "Vlastníci nemovitosti hledající neúčelové financování zajištěné bytem nebo domem.",
    authorId: "redakce-hj",
    publishedAt: "2026-07-15",
    updatedAt: "2026-08-11",
    commercialIntent: "american",
    primaryCta: {
      label: "Zjistit možnosti pro moji situaci",
      href: "#poptavka",
    },
    secondaryCta: {
      label: "Hypoteční kalkulačka (orientační)",
      href: routes.kalkulacky.hypotecniKalkulacka,
    },
    quickAnswer: {
      heading: "Americká hypotéka v kostce",
      bullets: [
        "Neúčelový úvěr zajištěný nemovitostí — jiný produkt než klasická hypotéka.",
        "Při nesplácení hrozí realizace zástavy — riziko je vyšší než u běžné spotřebitelské půjčky.",
        "LTV a sazby jsou produktově specifické; neplést se sazbami na koupi bydlení.",
        "U části bank sazbu právě ověřujeme — neuvádíme nepodložené srovnání.",
      ],
    },
    showLeadCapture: true,
    sections: [
      {
        id: "co-je-americka",
        heading: "Co je americká hypotéka",
        paragraphs: [
          "V ČR se pod tímto názvem obvykle rozumí neúčelový úvěr zajištěný zástavním právem k nemovitosti. Prostředky nemusíte prokazatě použít na koupi bytu — na rozdíl od klasické hypotéky na bydlení.",
          "Název evokuje americký model mortgage, ale produktové podmínky jsou české. Srovnávejte smlouvu, ne marketingový název.",
        ],
      },
      {
        id: "vs-klasicka",
        heading: "Rozdíl oproti klasické hypotéce",
        paragraphs: [
          "Klasická hypotéka na bydlení je účelově vázaná — banka sleduje účel a často přísněji posuzuje LTV i příjem. Americká / neúčelová hypotéka může mít vyšší sazbu, nižší LTV nebo kratší splatnost.",
          "Sazby zveřejněné pro koupi bydlení na /sazby nejsou sazby americké hypotéky. Produkt je jiný — neporovnávejte je.",
        ],
      },
      {
        id: "rizika-zastavy",
        heading: "Rizika zástavy nemovitosti",
        paragraphs: [
          "Nesplácíte-li úvěr, banka může realizovat zástavu. Riziko ztráty nemovitosti je reálné — neúčelový úvěr proto nesmí být brán jako „levnější kontokorent“.",
          "Modelujte splátku včetně růstu sazby po fixaci a mějte rezervu. Kalkulačka na webu je orientační — americká hypotéka může mít jiné parametry.",
        ],
        bullets: [
          "Zástava = vážné riziko, ne formalita.",
          "Splatnost a fixace ovlivňují celkovou cenu.",
          "Předčasné splacení může mít sankce — čtěte smlouvu.",
        ],
      },
      {
        id: "priklady-bank-americka",
        heading: "Příklady zveřejněných podmínek bank",
        paragraphs: [
          "Níže jsou ověřené údaje z oficiálních stránek bank (stav kontroly 11. 8. 2026). Nejde o individuální nabídku ani o kompletní srovnávač — jen o to, co banka veřejně uvádí.",
          "Komerční banka (produktová stránka Americká hypotéka): sazba od 5,59 % p. a., LTV až 70 % ceny nemovitosti, splatnost až 20 let. Reprezentativní příklad na stránce používá pevnou sazbu 5,59 % p. a. s fixací 3 roky.",
          "MONETA Money Bank (produktová stránka): neúčelový úvěr zajištěný nemovitostí, LTV až 70 % odhadní ceny, výše od 300 000 Kč, splatnost až 20 let; stránka uvádí sazbu od 4,79 % ročně. Konkrétní sazbu dle fixace ověřte v aktuálním úrokovém lístku banky.",
          "UniCredit Bank na oficiálním sazebníku zveřejňuje samostatný sloupec Hypotéka neúčelová (odlišný od účelové hypotéky): např. fixace 2 roky od 5,09 %, 3 roky od 5,19 %, 5 let od 5,59 % — sazby platí při pojištění schopnosti splácet a aktivitě na účtu dle podmínek banky.",
          "Česká spořitelna na produktové stránce uvádí LTV až 70 % odhadní ceny a splatnost až 20 let. Konkrétní zveřejněnou sazbu této banky pro americkou hypotéku právě ověřujeme — neuvádíme ji jako srovnatelnou nabídku.",
        ],
        bullets: [
          "KB: od 5,59 % p. a.; LTV až 70 %; splatnost až 20 let.",
          "MONETA: od 4,79 % p. a. (headline); LTV až 70 %; splatnost až 20 let.",
          "UniCredit: samostatná neúčelová sazba dle fixace (viz sazebník).",
          "ČS: LTV/splatnost zveřejněny; sazbu právě ověřujeme.",
        ],
      },
      {
        id: "ltv-a-sazby",
        heading: "LTV a sazby — produktově specifické",
        paragraphs: [
          "LTV u americké / neúčelové hypotéky bývá nižší než u standardní hypotéky na bydlení. Konkrétní limity bereme jen z oficiálního zdroje banky — neinferujeme je ze sazeb na koupi.",
          "U části bank sazbu právě ověřujeme. Dokud nemáme dostatečně doloženou produktově specifickou sazbu, neuveřejňujeme falešné srovnání ani sazby z klasické hypotéky na bydlení.",
        ],
      },
      {
        id: "kdy-dava-smysl",
        heading: "Kdy může dávat smysl — a kdy ne",
        paragraphs: [
          "Typické scénáře: konsolidace dražších úvěrů při dostatečné equity, podnikatelská potřeba s jasným plánem splácení, krátkodobé překlenutí s exit strategií.",
          "Nevhodné: financovat spotřebu bez plánu splácení, maximalizovat LTV na hranici, spoléhat na prodej nemovitosti „až to bude nutné“.",
        ],
      },
      {
        id: "co-banka-chce",
        heading: "Co banka typicky posuzuje",
        paragraphs: [
          "Odhad nemovitosti, LTV, příjem a závazky, stávající zástavy, bonita a účel (i u neúčelového úvěru banka může ptát na plán). Scoring americké hypotéky může být přísnější než u hypotéky na bydlení.",
          "Dokumentace se blíží standardní hypotéce — rozdíl je v produktu a ceně peněz.",
        ],
      },
      {
        id: "vzdelani-akademie",
        heading: "Vzdělání v akademii",
        paragraphs: [
          "Pro hlubší vysvětlení produktu navštivte lekci Americká hypotéka v akademii. Edukace nenahrazuje individuální nabídku banky.",
          "Sazby koupě bydlení na /sazby sem nepatří — americká hypotéka je samostatný produkt.",
        ],
      },
      {
        id: "dalsi-krok",
        heading: "Další krok",
        paragraphs: [
          "Spočítejte orientační splátku v kalkulačce, pak projděte diagnostiku možností. U americké hypotéky je individuální posouzení banky obzvlášť důležité — web vám pomůže s rámcem, ne se smlouvou.",
        ],
      },
    ],
    faqs: [
      {
        question: "Je americká hypotéka totéž co hypotéka na bydlení?",
        answer:
          "Ne. Jde o neúčelový úvěr zajištěný nemovitostí s jinými podmínkami a obvykle jinou sazbou.",
      },
      {
        question: "Mohu použít sazby z /sazby pro koupi?",
        answer:
          "Ne pro americkou hypotéku. Sazby na /sazby jsou pro standardní hypotéky; americká hypotéka je jiný produkt.",
      },
      {
        question: "Jaké LTV banka poskytne?",
        answer:
          "Záleží na bance, nemovitosti a bonitě. Některé banky veřejně uvádějí např. až 70 % (KB, MONETA, ČS) — bez individuální nabídky neplánujte optimisticky.",
      },
      {
        question: "Máte sazby všech bank?",
        answer:
          "Ne. U části bank sazbu právě ověřujeme. Zveřejňujeme jen to, co je doložené oficiálním zdrojem konkrétní banky — nikdy sazby z klasické hypotéky na bydlení.",
      },
    ],
    sources: [
      {
        label: "KB — Americká hypotéka (produktová stránka)",
        url: KB_AMERICAN_PRODUCT,
      },
      {
        label: "MONETA — Americká hypotéka",
        url: MONETA_AMERICAN_PRODUCT,
      },
      {
        label: "UniCredit — úrokové sazby (Hypotéka neúčelová)",
        url: UC_RATE_SHEET,
      },
      {
        label: "ČS — Americká hypotéka",
        url: CS_AMERICAN_PRODUCT,
      },
      {
        label: "Akademie: Americká hypotéka",
        url: `${routes.akademie}/americka-hypoteka`,
      },
      { label: "Metodika dat Hypotéka Jasně", url: routes.metodika },
      {
        label: "ČNB — makroobezřetnostní politika",
        url: CNB_MACRO,
        note: "Obecný rámec; americká hypotéka je produktově specifická.",
      },
    ],
    relatedTools: [
      {
        label: "Hypoteční kalkulačka",
        href: routes.kalkulacky.hypotecniKalkulacka,
      },
      { label: "Zjistit moje možnosti", href: routes.mojeMoznosti },
    ],
    relatedArticles: [
      {
        label: "Úrokové sazby hypoték 2026 — kontext",
        href: `${routes.clanky}/urokove-sazby-hypotek-2026`,
      },
    ],
    relatedAcademy: [
      {
        label: "Americká hypotéka",
        href: `${routes.akademie}/americka-hypoteka`,
      },
      { label: "RPSN", href: `${routes.akademie}/rpsn` },
    ],
  },
];

/** Assignable to SeoLanding[] until landings.ts extends the base type. */
export const WAVE1_COMMERCIAL_LANDINGS: SeoLanding[] = wave1CommercialLandings;

export function isWave1CommercialSlug(slug: string): slug is Wave1CommercialSlug {
  return (WAVE1_COMMERCIAL_SLUGS as readonly string[]).includes(slug);
}
