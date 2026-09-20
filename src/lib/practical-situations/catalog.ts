/**
 * Praktické hypoteční situace — kurátorovaný katalog.
 * Pracovní obsah: konkrétní lhůty, limity a bankovní pravidla neuvádíme jako jistotu
 * bez odkazu na ověřený primární zdroj.
 */

import { routes } from "@/lib/routes";
import { scenarioRoutes, SCENARIO_SOURCES } from "@/lib/scenarios/sources";
import { getLandingPath } from "@/lib/seo/landings";

export const PRACTICAL_CHECKED_AT = "2026-09-20";

export type PracticalSource = {
  label: string;
  url: string;
  checkedAt: string;
  note?: string;
};

export type PracticalTopic = {
  slug: string;
  title: string;
  shortTitle: string;
  groupId: PracticalGroupId;
  lead: string;
  directAnswer: string;
  steps: string[];
  documents: string[];
  modelExample: { title: string; body: string };
  complications: string[];
  calculator?: { label: string; href: string };
  related?: Array<{ label: string; href: string }>;
  sources: PracticalSource[];
  /** When true, page extends an existing scenario rather than standing alone. */
  extendsExisting?: string;
};

export type PracticalGroupId =
  | "zadatele"
  | "rodina"
  | "nemovitost"
  | "pronajem-firmy"
  | "hranice";

export const PRACTICAL_GROUPS: Array<{
  id: PracticalGroupId;
  title: string;
  description: string;
}> = [
  {
    id: "zadatele",
    title: "Žadatelé a společné financování",
    description: "Kdo žádá, jak se skládá více osob a co banka typicky sleduje.",
  },
  {
    id: "rodina",
    title: "Rodina a rodinný rozpočet",
    description: "Jak splátka snese rodičovství, výpadek příjmu nebo vyšší sazbu.",
  },
  {
    id: "nemovitost",
    title: "Nemovitost, odhad a vlastní peníze",
    description: "Odhad banky, kupní cena a kolik hotovosti skutečně potřebujete.",
  },
  {
    id: "pronajem-firmy",
    title: "Pronájem, firmy a daně",
    description: "Investice, nájemník, firma a daňové rámce — bez zjednodušeného simulátoru.",
  },
  {
    id: "hranice",
    title: "Financování přes hranice",
    description: "Cizinci v ČR, zahraniční firma a nemovitost mimo ČR.",
  },
];

const SRC = {
  cnbLtv: {
    label: "ČNB — horní hranice úvěrových ukazatelů LTV, DSTI a DTI",
    url: "https://www.cnb.cz/cs/financni-stabilita/makroobezretnostni-politika/stanoveni-horni-hranice-uverovych-ukazatelu/index.html",
    checkedAt: PRACTICAL_CHECKED_AT,
  },
  cnbAml: {
    label: "ČNB — identifikace a kontrola klientů (AML)",
    url: "https://www.cnb.cz/cs/o_cnb/cnblog/Identifikace-a-kontrola-klientu-financnich-instituci-jako-nastroj-v-boji-proti-prani-spinavych-penez/",
    checkedAt: PRACTICAL_CHECKED_AT,
    note: "Obecný rámec KYC/AML; konkrétní doklady stanoví banka.",
  },
  cnbInvestment: SCENARIO_SOURCES.cnbInvestmentLimits,
  csszPpm: {
    label: "ČSSZ — peněžitá pomoc v mateřství",
    url: "https://www.cssz.gov.cz/penezita-pomoc-v-materstvi",
    checkedAt: PRACTICAL_CHECKED_AT,
  },
  mpsvRp: {
    label: "Úřad práce / MPSV — rodičovský příspěvek",
    url: "https://mpsv.gov.cz/up-cz/rodicovsky-prispevek",
    checkedAt: PRACTICAL_CHECKED_AT,
  },
  finančniSprava: {
    label: "Finanční správa — daně z příjmů (obecně)",
    url: "https://www.financnisprava.cz/",
    checkedAt: PRACTICAL_CHECKED_AT,
    note: "Konkrétní daňové režimy vždy ověřte u aktuálních předpisů nebo poradce.",
  },
  katastr: {
    label: "ČÚZK — katastr nemovitostí",
    url: "https://www.cuzk.gov.cz/",
    checkedAt: PRACTICAL_CHECKED_AT,
  },
  kbCorporate: SCENARIO_SOURCES.kbCorporateRe,
  foreignIncome: {
    label: "Hypotéka Jasně — příjem ze zahraničí",
    url: getLandingPath("hypoteka-ze-zahranicniho-prijmu"),
    checkedAt: PRACTICAL_CHECKED_AT,
  },
  foreignMortgage: {
    label: "Hypotéka Jasně — hypotéka v zahraničí",
    url: getLandingPath("hypoteka-v-zahranici"),
    checkedAt: PRACTICAL_CHECKED_AT,
  },
  akademieLtv: {
    label: "Akademie — LTV",
    url: `${routes.akademie}/ltv`,
    checkedAt: PRACTICAL_CHECKED_AT,
  },
} as const satisfies Record<string, PracticalSource>;

export const PRACTICAL_TOPICS: PracticalTopic[] = [
  {
    slug: "hypoteka-pro-cizince",
    title: "Hypotéka pro cizince v ČR",
    shortTitle: "Cizinci v ČR",
    groupId: "hranice",
    lead: "Jak postupovat, když nejste občan ČR a chcete financovat nemovitost v Česku.",
    directAnswer:
      "Cizinec může v ČR žádat o hypoteční úvěr, ale banka posuzuje individuálně pobytový status, doložitelnost příjmu, identifikaci a původ vlastních prostředků. Neexistuje jedna veřejná sazba ani jednotný seznam „povolených“ států — rozhoduje produktová metodika konkrétní banky.",
    steps: [
      "Upřesněte účel (vlastní bydlení vs. investice) a zemi daňové rezidence.",
      "Ověřte, jaký typ pobytu a identifikace banka vyžaduje — podmínky se liší.",
      "Připravte doklady o příjmu (české i zahraniční) a o původu hotovosti (AML/KYC).",
      "Spočítejte orientační splátku a vlastní zdroje; počítejte s odhadem banky, ne jen s kupní cenou.",
      "Až poté srovnejte nabídky — bez kompletních dokladů je srovnání sazeb předčasné.",
    ],
    documents: [
      "Doklad totožnosti a pobytový status (dle požadavku banky)",
      "Doklady o příjmu a daňové rezidenci",
      "Doklady o původu vlastních prostředků",
      "Podklady k nemovitosti a kupní dokumentaci",
    ],
    modelExample: {
      title: "Modelový příklad",
      body: "Žadatel s povolením k pobytu a stabilním příjmem v ČR připraví stejný balík příjmových dokladů jako rezident, plus potvrzení k pobytu a k původu akontace. Konkrétní akceptaci zahraničního příjmu banka potvrdí až po posouzení — veřejný web to obvykle nezaručí.",
    },
    complications: [
      "Příjem v cizí měně a převod do Kč — kurzové riziko i metodika přepočtu.",
      "Krátká historie v ČR nebo omezený kreditní profil.",
      "Nesoulad mezi daňovou rezidencí, místem práce a zástavou.",
    ],
    calculator: {
      label: "Hypoteční kalkulačka",
      href: routes.kalkulacky.hypotecniKalkulacka,
    },
    related: [
      { label: "Příjem ze zahraničí", href: getLandingPath("hypoteka-ze-zahranicniho-prijmu") },
      { label: "Odhad versus kupní cena", href: `${routes.temata}/bankovni-odhad-versus-kupni-cena` },
    ],
    sources: [SRC.cnbAml, SRC.cnbLtv, SRC.foreignIncome],
  },
  {
    slug: "nemovitost-pres-zahranicni-firmu",
    title: "Nemovitost v ČR přes zahraniční firmu",
    shortTitle: "Zahraniční firma",
    groupId: "hranice",
    lead: "Když kupuje nebo zajišťuje českou nemovitost zahraniční právnická osoba.",
    directAnswer:
      "Financování přes zahraniční firmu není klasická spotřebitelská hypotéka. Banka obvykle posuzuje strukturu vlastnictví, účetnictví, daňový status a zajištění individuálně — často blíže podnikatelskému nebo investičnímu úvěru. Podrobnosti patří do scénáře financování firmy.",
    steps: [
      "Zmapujte, kdo je kupující a kdo bude dlužník (česká vs. zahraniční entita).",
      "Připravte vlastnickou strukturu (UBO) a účetní podklady podle požadavku banky.",
      "Oddělte účel: provoz, investice, holding — ovlivní produkt i limity.",
      "Spočítejte orientační anuitu a LTV; sazba u firem často není veřejná „od“.",
      "Daňové a účetní dopady řešte s poradcem — webový model je nenahradí.",
    ],
    documents: [
      "Výpis z obchodního rejstříku / zahraniční ekvivalent",
      "Doklady o skutečných majitelích",
      "Účetní závěrky a cash-flow",
      "Podklady k zástavě a účelu koupě",
    ],
    modelExample: {
      title: "Modelový příklad",
      body: "Zahraniční holding chce koupit byt v Praze přes českou dceřinou s.r.o. Banka typicky hodnotí českou entitu i skupinu, ne jen „sazbu hypotéky z webu“. Orientační splátku spočítáte v kalkulačce financování firmy.",
    },
    complications: [
      "Delší KYC a přeshraniční doložení příjmů skupiny.",
      "Osobní ručení společníků nemusí být vyloučené.",
      "Daňové dopady (DPH, daň z nemovitých věcí, transfer pricing) nejsou automatickou výhodou.",
    ],
    calculator: {
      label: "Kalkulačka financování firmy",
      href: scenarioRoutes.companyCalc,
    },
    related: [
      { label: "Hypotéka na firmu", href: scenarioRoutes.companyTopic },
      { label: "Praktické situace", href: routes.pruvodce.praktickeSituace },
    ],
    sources: [SRC.kbCorporate, SRC.cnbAml, SRC.finančniSprava],
    extendsExisting: scenarioRoutes.companyTopic,
  },
  {
    slug: "financovani-nemovitosti-v-zahranici",
    title: "Financování nemovitosti v zahraničí",
    shortTitle: "Nemovitost v zahraničí",
    groupId: "hranice",
    lead: "Jak přemýšlet o úvěru, když je zástava nebo koupě mimo ČR.",
    directAnswer:
      "Česká hypotéka obvykle stojí na zástavě a právním rámci v ČR. U zahraniční nemovitosti je častější lokální financování, hotovost, nebo specifické produkty — podmínky se liší podle země a banky. Nejdřív zmapujte jurisdikci, pak teprve splátku.",
    steps: [
      "Určete zemi koupě, typ vlastnictví a měnu nákladů i případného úvěru.",
      "Zjistěte, zda existuje lokální hypoteční trh pro nerezidenty.",
      "Spočítejte celkovou hotovostní potřebu včetně poplatků a daní v dané zemi.",
      "Oddělte kurzové riziko (příjem vs. splátka v jiné měně).",
      "Použijte průvodce trhem a globální financování jako mapu možností, ne jako nabídku.",
    ],
    documents: [
      "Podklady k vlastnictví v dané zemi",
      "Doklady o příjmu a daňové rezidenci",
      "Orientační rozpočet vedlejších nákladů",
    ],
    modelExample: {
      title: "Modelový příklad",
      body: "Koupě apartmánu ve Španělsku: lokální banka může vyžadovat vyšší vlastní zdroje než jste zvyklí z ČR. Modelová splátka v EUR musí sedět na váš příjem v Kč — kurzový polštář je součást rezervy, ne „detail“.",
    },
    complications: [
      "Jiná pravidla zástavy a dědění.",
      "Daňové povinnosti v zemi nemovitosti i v ČR.",
      "Omezená přenositelnost české metodiky LTV/DSTI.",
    ],
    calculator: {
      label: "Globální financování",
      href: routes.globalFinancing,
    },
    related: [
      { label: "Hypotéka v zahraničí", href: getLandingPath("hypoteka-v-zahranici") },
      { label: "Průvodce investora", href: routes.pruvodceInvestora },
    ],
    sources: [SRC.foreignMortgage, SRC.cnbLtv],
  },
  {
    slug: "investicni-nemovitost-a-dane",
    title: "Investiční nemovitost a daně",
    shortTitle: "Investice a daně",
    groupId: "pronajem-firmy",
    lead: "Co si ujasnit dřív, než spočítáte „výnos“ z pronájmu.",
    directAnswer:
      "Investiční financování a zdanění nájmu jsou dvě vrstvy: banka posuzuje úvěr a zajištění; daňový režim určují předpisy a vaše situace. Webová kalkulačka nesimuluje kompletní daň FO vs. firma — k tomu patří odborná konzultace.",
    steps: [
      "Oddělte cash-flow nemovitosti od osobního rozpočtu domácnosti.",
      "Zohledněte doporučení ČNB k investičním hypotékám (přísnější limity u relevantních úvěrů).",
      "Spočítejte nájem po nákladech a splátce — ne jen hrubý výnos.",
      "Daň z příjmu z nájmu, odpisy a výdaje řešte podle aktuálních pravidel Finanční správy / poradce.",
      "Až potom porovnávejte FO vs. firmu — ne na základě jedné sazby z článku.",
    ],
    documents: [
      "Rozpočet výnosů a nákladů",
      "Doklady k vlastnictví a nájmu",
      "Přehled dalších nemovitostí (pro posouzení investičního charakteru)",
    ],
    modelExample: {
      title: "Modelový příklad",
      body: "Byt k pronájmu: model ukáže měsíční tok po nákladech. Zda a jak se nájem zdaní, závisí na režimu poplatníka — kalkulačka to nepotvrzuje.",
    },
    complications: [
      "Záměna hrubého výnosu za disponibilní cash-flow.",
      "Přísnější LTV/DTI u investičních úvěrů dle doporučení ČNB.",
      "Souběh osobní hypotéky a investiční zátěže v jedné domácnosti.",
    ],
    calculator: {
      label: "Budoucí příjem z nájmu",
      href: scenarioRoutes.rentCalc,
    },
    related: [
      { label: "Investiční hypotéka", href: getLandingPath("investicni-hypoteka") },
      { label: "Investiční rentgen", href: routes.investicniRentgen },
    ],
    sources: [SRC.cnbInvestment, SRC.finančniSprava],
  },
  {
    slug: "nemovitost-na-firmu-a-odpisy",
    title: "Nemovitost na firmu a odpisy",
    shortTitle: "Firma a odpisy",
    groupId: "pronajem-firmy",
    lead: "Proč „koupit na s.r.o. kvůli odpisům“ není automatická výhra.",
    directAnswer:
      "Firma může nemovitost odepisovat podle účetních a daňových pravidel, ale odpisy nesnižují hypoteční splátku ani negarantují výhodnější úvěr. Finanční rozhodnutí stojí na cash-flow, riziku ručení a celkových nákladech vlastnictví — ne na jedné odpisové sazbě.",
    steps: [
      "Nejdřív rozhodněte účel a dlužníka (FO vs. firma).",
      "Spočítejte orientační úvěr a provozní cash-flow.",
      "Daňové odpisy a účetní odpisy oddělte — nejsou totéž.",
      "Zvažte osobní ručení, dividendy a výplata peněz ven z firmy.",
      "Konkrétní odpisový plán nechte potvrdit účetním / daňovým poradcem.",
    ],
    documents: [
      "Účetní a daňové podklady firmy",
      "Rozpočet pořízení a provozu",
      "Návrh zajištění a ručení",
    ],
    modelExample: {
      title: "Modelový příklad",
      body: "s.r.o. koupí sklad: anuitní model ukáže splátku. Odpisy ovlivní hospodářský výsledek, ale peníze na účtu musí stačit na splátku a provoz — to kalkulačka firmy modeluje jako cash, ne jako daňovou optimalizaci.",
    },
    complications: [
      "Záměna účetního zisku za volné peníze.",
      "Osobní ručení společníků.",
      "Náklady na vedení firmy a compliance.",
    ],
    calculator: {
      label: "Kalkulačka financování firmy",
      href: scenarioRoutes.companyCalc,
    },
    related: [
      { label: "Hypotéka na firmu", href: scenarioRoutes.companyTopic },
      { label: "Zahraniční firma", href: `${routes.temata}/nemovitost-pres-zahranicni-firmu` },
    ],
    sources: [SRC.kbCorporate, SRC.finančniSprava],
    extendsExisting: scenarioRoutes.companyTopic,
  },
  {
    slug: "koupe-bytu-s-najemnikem",
    title: "Koupě bytu s nájemníkem",
    shortTitle: "Byt s nájemníkem",
    groupId: "pronajem-firmy",
    lead: "Co řešit, když kupujete obsazený byt a chcete hypotéku.",
    directAnswer:
      "Nájemní vztah přechází s nemovitostí — nekupujete „prázdný“ byt, dokud nájem neskončí nebo se nedohodnete jinak. Banka může nájem zohlednit v příjmu nebo naopak v riziku; konkrétní uznání je individuální.",
    steps: [
      "Získejte nájemní smlouvu, výši nájmu, jistotu a stav úhrad.",
      "Ověřte v katastru vlastnictví a případná omezení.",
      "Rozhodněte záměr: pokračovat v pronájmu, nebo byt uvolnit.",
      "Do modelu vložte nájemní tok dostupný domácnosti (po nákladech), ne „bankou uznaný“ nájem.",
      "Spočítejte financování a rezervu na souběh splátky a případného výpadku nájmu.",
    ],
    documents: [
      "Nájemní smlouva a doklady o platbách",
      "List vlastnictví",
      "Přehled nákladů domu / SVJ",
    ],
    modelExample: {
      title: "Modelový příklad",
      body: "Koupě bytu s nájemníkem za tržní nájem: do rodinného rozpočtu dáte čistý tok po fondu oprav a případné splátce. Bankovní uznání nájmu může být nižší — pro váš životní rozpočet platí skutečný tok.",
    },
    complications: [
      "Výpovědní podmínky a ochrana nájemce.",
      "Skryté nedoplatky nebo spory.",
      "Rozdíl mezi smluvním a tržním nájmem.",
    ],
    calculator: {
      label: "Budoucí příjem z nájmu",
      href: scenarioRoutes.rentCalc,
    },
    related: [
      { label: "Rodinný rozpočet", href: routes.kalkulacky.rodinnyRozpocet },
      { label: "Katastr", href: "https://www.cuzk.gov.cz/" },
    ],
    sources: [SRC.katastr, SRC.cnbInvestment],
  },
  {
    slug: "spolecna-hypoteka",
    title: "Společná hypotéka více osob",
    shortTitle: "Společná hypotéka",
    groupId: "zadatele",
    lead: "Když žádá více dospělých — partneři, rodina nebo jiná konstelace.",
    directAnswer:
      "Společná žádost sčítá příjmy i závazky žadatelů a obvykle znamená společnou odpovědnost za splácení. Banka nastavuje, kdo musí být v úvěru a v zástavě — není to jen „připsat druhý příjem“ bez důsledků.",
    steps: [
      "Sepište, kdo bude dlužník, kdo vlastník a kdo ručitel.",
      "Sečtěte čisté příjmy a všechny splátky všech žadatelů.",
      "Ověřte, zda všichni dodají stejnou kvalitu dokladů.",
      "Spočítejte, zda rozpočet domácnosti unese splátku i při výpadku jednoho příjmu.",
      "Dohodněte si dopředu pravidla při rozchodu nebo prodeji — právně, nejen ústně.",
    ],
    documents: [
      "Doklady o příjmu všech žadatelů",
      "Přehled závazků všech žadatelů",
      "Doklady k vlastnickému uspořádání",
    ],
    modelExample: {
      title: "Modelový příklad",
      body: "Dva dospělí se spojí v žádosti: vyšší příjem může zlepšit DSTI, ale závazky druhého žadatele ho stejně zatíží. V kalkulačce rodinného rozpočtu proto modelujte výpadek kteréhokoli z nich — neutrálně, bez předpokladu „kdo zůstane doma“.",
    },
    complications: [
      "Nesoulad vlastnictví a dlužníků.",
      "Negativní záznam u jednoho žadatele.",
      "Rozchod bez dohody o vypořádání.",
    ],
    calculator: {
      label: "Rodinný rozpočet",
      href: routes.kalkulacky.rodinnyRozpocet,
    },
    related: [
      { label: "Hypotéka a rodina", href: `${routes.temata}/hypoteka-a-rodina` },
      { label: "Hypoteční kalkulačka", href: routes.kalkulacky.hypotecniKalkulacka },
    ],
    sources: [SRC.cnbLtv],
  },
  {
    slug: "bankovni-odhad-versus-kupni-cena",
    title: "Bankovní odhad versus kupní cena",
    shortTitle: "Odhad vs. cena",
    groupId: "nemovitost",
    lead: "Proč rozhoduje odhad banky a co dělat, když je nižší než kupní cena.",
    directAnswer:
      "LTV se typicky počítá z hodnoty, kterou banka uzná (odhad / zástavní hodnota), ne z marketingové kupní ceny. Když je odhad nižší, rozdíl obvykle doplácíte z vlastních zdrojů. Vyšší odhad automaticky neznamená výplatu hotovosti navíc.",
    steps: [
      "Oddělte kupní cenu, odhad banky a vedlejší náklady.",
      "Zadejte modelový limit LTV a spočítejte strop úvěru z uznané hodnoty.",
      "Dopočítejte chybějící kapitál a rezervu.",
      "Další zástavu zvažujte jen jako nezatíženou a bankou akceptovatelnou — jinak ne sčítejte naslepo.",
      "Až pak finalizujte nabídku a termíny podpisu.",
    ],
    documents: [
      "Kupní smlouva / rezervační smlouva",
      "Podklady pro odhad",
      "Doklad o vlastních prostředcích",
    ],
    modelExample: {
      title: "Modelový příklad",
      body: "Kupní cena 5 mil. Kč, odhad 4,5 mil. Kč, modelové LTV 80 % → strop úvěru z odhadu je 3,6 mil. Kč. Rozdíl k doplacení kupní ceny a vedlejších nákladů musí krýt hotovost — viz kalkulačka odhadu.",
    },
    complications: [
      "Tlak na termín podpisu před výsledkem odhadu.",
      "Rekonstrukce / atypická nemovitost snižující odhad.",
      "Záměna LTV stropu za schválenou hypotéku.",
    ],
    calculator: {
      label: "Odhad versus kupní cena",
      href: routes.kalkulacky.odhadVersusKupniCena,
    },
    related: [
      { label: "Akademie: LTV", href: `${routes.akademie}/ltv` },
      { label: "Hypoteční kalkulačka", href: routes.kalkulacky.hypotecniKalkulacka },
    ],
    sources: [SRC.akademieLtv, SRC.cnbLtv],
  },
  {
    slug: "hypoteka-a-rodina",
    title: "Hypotéka a plánování rodiny",
    shortTitle: "Hypotéka a rodina",
    groupId: "rodina",
    lead: "Jak splátka snese rodičovství, výpadek příjmu nebo refixaci.",
    directAnswer:
      "Hypotéka je dlouhodobý závazek — rodinný rozpočet musí unést období nižšího příjmu a vyšších výdajů. Spočítejte disponibilní zůstatek a rezervu podle vašich čísel; dávky zadávejte jako očekávané částky a ověřte je na ČSSZ/MPSV. Nejde o schvalovací kalkulačku banky.",
    steps: [
      "Zadejte příjmy všech přispívajících dospělých (pravidelné i nepravidelné odděleně).",
      "Doplňte skutečné výdaje a splátku hypotéky.",
      "Naplánujte rodičovství nebo jiné změny — kdo omezí práci zvolte neutrálně.",
      "Porovnejte scénáře: současný plán, výpadek příjmu, +2 p. b. při refixaci, +10 % výdajů.",
      "Zjistěte nejhorší měsíc, deficitní měsíce a kapitál potřebný pro minimální rezervu.",
    ],
    documents: [
      "Přehled čistých příjmů domácnosti",
      "Výdaje a splátky",
      "Orientační očekávání dávek (PPM, rodičovský příspěvek) z oficiálních kalkulaček",
    ],
    modelExample: {
      title: "Modelový příklad",
      body: "Dva příjmy 45 + 35 tis. Kč, výdaje 35 tis., splátka 25 tis. → přebytek 20 tis. Po nahrazení druhého příjmu testovací částkou 12 tis. a růstu výdajů na 40 tis. vzniká schodek 8 tis. měsíčně — rezervu to postupně snižuje. Částky dávek jsou uživatelský předpoklad.",
    },
    complications: [
      "Souběh dávek a mzdy bez kontroly pravidel nároku.",
      "Konec nájmu a začátek provozu vlastního bydlení ve špatném měsíci.",
      "Refixace bez rezervy na vyšší splátku.",
    ],
    calculator: {
      label: "Zvládneme hypotéku i s rodinou?",
      href: routes.kalkulacky.rodinnyRozpocet,
    },
    related: [
      { label: "Společná hypotéka", href: `${routes.temata}/spolecna-hypoteka` },
      { label: "ČSSZ — PPM", href: "https://www.cssz.gov.cz/penezita-pomoc-v-materstvi" },
      { label: "MPSV — rodičovský příspěvek", href: "https://mpsv.gov.cz/up-cz/rodicovsky-prispevek" },
    ],
    sources: [SRC.csszPpm, SRC.mpsvRp, SRC.cnbLtv],
  },
];

export function getPracticalTopic(slug: string): PracticalTopic | undefined {
  return PRACTICAL_TOPICS.find((t) => t.slug === slug);
}

export function topicsInGroup(groupId: PracticalGroupId): PracticalTopic[] {
  return PRACTICAL_TOPICS.filter((t) => t.groupId === groupId);
}
