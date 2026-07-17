import type { CountryId } from "@/lib/calculators";

export interface HistoricalAnalysisSection {
  title: string;
  content: string;
}

export interface HistoricalAnalysis {
  title: string;
  intro: string;
  sections: HistoricalAnalysisSection[];
}

export const historicalAnalysisByCountry: Record<CountryId, HistoricalAnalysis> =
  {
    cz: {
      title: "Anatomie realitního cyklu: hotovost, inflace a tvrdé aktivum",
      intro:
        "Při pohledu na posledních 30 let českého realitního trhu je zjevný jeden trend: kupní síla hotovosti klesá relativně k cenám nemovitostí. Zatímco v roce 1996 jste za 1 milion korun pořídili slušný byt v širším centru Prahy, dnes tato částka často pokryje jen část akontace. Historie ale negarantuje budoucí výnos — sazby, regulace i nabídka se mění.",
      sections: [
        {
          title: "Vztah úrokových sazeb a cen (Nůžky trhu)",
          content:
            "Všimněte si křivky úrokových sazeb v hlavním grafu. Trh si prošel fázemi drahých peněz (přes 10 % v 90. letech), přes extrémně levné hypotéky pod 2 % (2015–2020) až po současný návrat k normálu. Paradoxem je, že pokles sazeb vždy akceleroval růst cen. Lidé nekupují nemovitosti, kupují si výši měsíční splátky.",
        },
        {
          title: "Neviditelný zloděj: Inflace",
          content:
            'Graf "Stroje času" jasně ukazuje, proč je šetření do matrace tou nejriskantnější investicí. Inflace funguje jako skrytá daň z hotovosti. Nemovitost funguje jako štít – cena stavebních materiálů, práce i pozemků roste s inflací, čímž se přirozeně zvyšuje tržní hodnota vašeho majetku. A co víc, pokud máte hypotéku, inflace reálně požírá váš dluh vůči bance.',
        },
        {
          title: "Nájmy jako barometr poptávky",
          content:
            "Křivka nájmů v grafu kopíruje růst cen, ale s mírným zpožděním. V letech levných hypoték (2016–2021) nájmy rostly pomaleji než ceny koupě — vlastnictví bylo dostupnější. Po zdražení úvěrů v roce 2022–2026 nájmy akcelerovaly, protože lidé bez vlastního kapitálu zůstávají v nájemním segmentu. Pro investora to znamená: vlastnictví zachytí růst cen i růst nájmů.",
        },
      ],
    },
    dubai: {
      title: "Dubaj 1996–2026: Od pouště k globálnímu investičnímu hubu",
      intro:
        "Emirátský trh prošel transformací, která nemá v regionu obdoby. Zatímco hotovost v AED drží kurz vůči USD, reálná hodnota peněz na účtu rostla pomaleji než hodnota freehold nemovitostí v top čtvrtích.",
      sections: [
        {
          title: "Nulová daň a kapitálový apreciace",
          content:
            "Na rozdíl od ČR zde růst hodnoty nemovitosti nezatěžuje daň z kapitálového zisku. Graf ukazuje exponenciální růst cen vil a bytů od roku 2006 — období masivní výstavby. Úrokové sazby v SAE jsou nižší než historické české sazby, ale LTV pro nerezidenty zůstává konzervativní.",
        },
        {
          title: "Nůžky: EIBOR a ceny off-plan",
          content:
            "Pokles sazeb po roce 2010 podpořil developer payment plány a spekulaci s off-plan projekty. Kupující nekupovali metry čtvereční, ale měsíční splátku bez úroků během výstavby. Po handoveru ceny často skokově narostly.",
        },
        {
          title: "Inflace a nájemné v AED",
          content:
            "Dirham je fixní vůči USD, což chrání před měnovým rizikem. Nájmy v prémiových lokalitách však rostou rychleji než CPI — expat poptávka a roční platby v šecích tlačí náklady nájemníků nahoru, zatímco vlastník participuje na růstu.",
        },
      ],
    },
    spain: {
      title: "Španělsko: Cyklus od krize k pobřežnímu boomu",
      intro:
        "Španělský trh zažil dramatický pád po roce 2008 a následné zotavení na Costa del Sol i v městských centrech. Euro eliminovalo měnové riziko, ale exponuje investory k EURIBORu.",
      sections: [
        {
          title: "Krize 2008 a dvojitá recovery",
          content:
            "Graf zachycuje propad cen po hypoteční bublině a pomalé zotavení od roku 2015. Úrokové sazby pod 2 % v eurozóně vytvořily novou vlnu poptávky ze strany zahraničních kupců — včetně Čechů hledajících druhý domov.",
        },
        {
          title: "EURIBOR jako motor splátek",
          content:
            "Variabilní hypotéky vázané na EURIBOR znamenají, že pokles sazeb v letech 2016–2021 snížil měsíční splátku a paradoxně zvýšil kupní sílu. Návrat sazeb po roce 2022 zpomalil růst cen, ale nájmy na pobřeží drží tempo díky turistické poptávce.",
        },
        {
          title: "Inflace v eurozóně vs. hotovost",
          content:
            "Hotovost na španělském účtu ztrácí reálnou hodnotu podobně jako v ČR, ale nemovitost na pobřeží ji kompenzuje růstem cen i sezónním nájmem. Stroj času ukazuje rozdíl mezi držení eur a vlastnictvím aktiva.",
        },
      ],
    },
    italy: {
      title: "Itálie: Trpělivost, renovace a dlouhý horizont",
      intro:
        "Italský trh neroste tak prudce jako Praha nebo Dubaj, ale za 30 let vytvořil stabilní zhodnocení v turistických centrech. Hotovost na účtu v eurech zaostává za nemovitostmi s potenciálem renovace.",
      sections: [
        {
          title: "Pomalý, ale jistý růst",
          content:
            "Graf ukazuje mírnější sklon než v ČR — italský trh je fragmentovaný. Řím, Florencie a severní jezera však sledují dlouhodobý trend růstu, který překonává inflaci v eurozóně.",
        },
        {
          title: "Úroky ECB a italské hypotéky",
          content:
            "Sazby italských bank kopírují politiku ECB. Období levných peněz 2016–2021 umožnilo koupě starších nemovitostí s následnou renovací — klasická cesta k vytvoření equity.",
        },
        {
          title: "IMU, inflace a ochrana majetku",
          content:
            "Vlastnictví není zdarma (IMU), ale stále funguje jako inflační hedge. Nájemné v historických centrech roste s turistickou poptávkou rychleji než CPI — vlastník zachytí oba proudy.",
        },
      ],
    },
    croatia: {
      title: "Chorvatsko: Jadran, euro a sezónní cyklus",
      intro:
        "Chorvatský pobřežní trh zažil transformaci od poválečného turismu po přijetí eura v roce 2023. Ceny vil a apartmánů rostou rychleji než kupní síla hotovosti na účtu.",
      sections: [
        {
          title: "Sezónní boom a růst cen",
          content:
            "Graf ukazuje akceleraci po vstupu do EU a přijetí eura. Krátkodobý pronájem v létě vytváří výnosy, které hotovost na běžném účtu nikdy negeneruje.",
        },
        {
          title: "Úrokové sazby a dostupnost",
          content:
            "Nižší sazby v eurozóně zpřístupnily hypotéky i zahraničním kupcům. Pokles sazeb v letech 2016–2021 koreluje s růstem cen na ostrovech a v Zadaru či Splitu.",
        },
        {
          title: "Inflace a nájemné v sezóně",
          content:
            "Letní nájmy rostou rychleji než roční — vlastnictví zachytí sezónní špičku. Hotovost v eurech na účtu ztrácí reálnou hodnotu vůči apartmánu u moře.",
        },
      ],
    },
    bali: {
      title: "Bali: Exotický trh s extrémním ROI",
      intro:
        "Bali je odlišný případ — růst cen vil v top lokalitách překonává inflaci v Indonésii i globální průměr. Hotovost v IDR nebo USD na účtu zaostává za investicí do pronajímatelné vily.",
      sections: [
        {
          title: "Leasehold a růst od roku 2000",
          content:
            "Graf simuluje růst trhu od expanze turismu. Vlastnictví přes leasehold nebo PT PMA umožnilo cizincům participovat na růstu, který hotovost na účtu nenabízí.",
        },
        {
          title: "Vysoké yieldy vs. bankovní úroky",
          content:
            "Lokální hypotéky pro cizince prakticky neexistují — investoři financují hotovostí. Vysoké yieldy z pronájmu (10–15 %) kompenzují absenci páky z banky.",
        },
        {
          title: "Inflace a expat poptávka",
          content:
            "Nájemné v Canggu a Ubudu rostou s přílivem digitálních nomádů. Nemovitost chrání před inflací i měnovým rizikem lépe než držení hotovosti.",
        },
      ],
    },
    saudi: {
      title: "Saúdská Arábie: Nový gigant na startovní čáře",
      intro:
        "SAE je emerging market s kratší historií srovnatelných dat. Graf simuluje trajektorii růstu od liberalizace trhu po giga-projekty NEOM a Rijád Vision 2030.",
      sections: [
        {
          title: "Vision 2030 a cenový potenciál",
          content:
            "Růst cen v nových čtvrtích odráží masivní investice státu. Vlastnictví je spekulace na dlouhodobý růst — hotovost v SAR (fixní k USD) roste pomaleji než prémiové nemovitosti.",
        },
        {
          title: "Sazby a dostupnost hypoték",
          content:
            "Sazby v GCC jsou konkurenceschopné, ale trh je mladý. Pokles sazeb podporuje koupě, nárůst sazeb testuje likviditu — podobně jako na západních trzích.",
        },
        {
          title: "Expat nájmy vs. vlastnictví",
          content:
            "Expati historicky volili nájem. Vlastnictví buduje equity v trhu, který teprve definuje svou dlouhodobou křivku — stroj času ukazuje potenciál, ale i riziko kratší historie.",
        },
      ],
    },
    slovakia: {
      title: "Slovensko: Paralelní cyklus s ČR, nižší vstupní bariéra",
      intro:
        "Slovenský trh sleduje český cyklus s mírným zpožděním a nižšími absolutními cenami. Za 30 let platí stejné pravidlo: nemovitost překonává inflaci, hotovost na účtu ne.",
      sections: [
        {
          title: "Bratislava vs. regiony",
          content:
            "Graf zachycuje konvergence s českým trhem po vstupu do EU. Bratislava roste rychleji než regiony, ale oba segmenty překonávají CPI v eurech.",
        },
        {
          title: "Úrokové sazby v eurozóně",
          content:
            "Slovenské hypotéky kopírují ECB. Období sazeb pod 2 % masivně podpořilo dostupnost bydlení a růst cen v letech 2016–2021.",
        },
        {
          title: "Inflace a blízký trh pro Čechy",
          content:
            "Pro českého investora je SR blízký trh s podobnou inflační dynamikou. Stroj času ukazuje, že i menší vstupní částka v Bratislavě překoná držení eur na účtu.",
        },
      ],
    },
  };

export function getHistoricalAnalysis(countryId: CountryId): HistoricalAnalysis {
  return historicalAnalysisByCountry[countryId];
}
