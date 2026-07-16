import type { CountryId } from "@/lib/calculators";

export interface GuideArticle {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
}

export interface RedFlag {
  id: string;
  title: string;
  description: string;
}

export interface CountryGuideContent {
  title: string;
  subtitle: string;
  articles: GuideArticle[];
  redFlags: RedFlag[];
}

export const countryGuides: Record<CountryId, CountryGuideContent> = {
  cz: {
    title: "Průvodce hypotékou v ČR",
    subtitle: "Vše, co potřebujete vědět před podpisem smlouvy",
    articles: [
      {
        id: "cz-ltv",
        title: "Jak funguje LTV a vlastní zdroje",
        excerpt:
          "LTV až 90 % je standard, ale nižší poměr úvěru znamená lepší sazbu a vyšší šanci na schválení.",
        image:
          "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop",
        category: "Základy",
      },
      {
        id: "cz-fix",
        title: "Fixace vs. variabilní sazba",
        excerpt:
          "Kdy se vyplatí fixace na 5 nebo 10 let a jak se připravit na refixaci.",
        image:
          "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=400&fit=crop",
        category: "Sazby",
      },
      {
        id: "cz-cnb",
        title: "Limity ČNB a DSTI",
        excerpt:
          "Jak centrální banka omezuje maximální splátku a co to znamená pro vaši bonitu.",
        image:
          "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=400&fit=crop",
        category: "Regulace",
      },
    ],
    redFlags: [
      {
        id: "cz-1",
        title: "Skryté poplatky za vedení účtu",
        description:
          "Některé banky účtují měsíční poplatek za hypoteční účet – započítejte ho do celkových nákladů.",
      },
      {
        id: "cz-2",
        title: "Předčasné splacení",
        description:
          "U fixace může banka účtovat sankci za předčasné splacení. Ověřte podmínky před podpisem.",
      },
    ],
  },
  dubai: {
    title: "Průvodce investicí v Dubaji",
    subtitle: "Off-plan, non-resident hypotéky a česká zástava",
    articles: [
      {
        id: "dubai-foreign",
        title: "Jak funguje hypotéka v Dubaji pro cizince",
        excerpt:
          "Non-resident hypotéky, požadavky na příjem a maximální LTV pro zahraniční investory.",
        image:
          "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&h=400&fit=crop",
        category: "Dubaj",
      },
      {
        id: "dubai-offplan",
        title: "Developer Payment Plans",
        excerpt:
          "Jak fungují splátky během výstavby a co se děje po předání klíčů.",
        image:
          "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=600&h=400&fit=crop",
        category: "Off-plan",
      },
      {
        id: "dubai-cz",
        title: "Americká hypotéka se zástavou v ČR",
        excerpt:
          "Financujte dubajskou nemovitost úvěrem z české banky s ručením českým majetkem.",
        image:
          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop",
        category: "Strategie",
      },
    ],
    redFlags: [
      {
        id: "dubai-1",
        title: "Poplatek DLD 4 %",
        description:
          "Dubai Land Department účtuje 4 % z kupní ceny při převodu. Zapomeňte ho nezahrnout do rozpočtu.",
      },
      {
        id: "dubai-2",
        title: "Off-plan bez escrow",
        description:
          "Nikdy neplaťte developerovi mimo chráněný escrow účet. Ověřte registraci projektu u RERA.",
      },
      {
        id: "dubai-3",
        title: "Kurzové riziko AED/CZK",
        description:
          "Pokud příjem máte v CZK a splátky v AED, kurzové výkyvy výrazně ovlivní reálnou zátěž.",
      },
    ],
  },
  spain: {
    title: "Průvodce financováním ve Španělsku",
    subtitle: "Americká hypotéka, daně a španělská legislativa",
    articles: [
      {
        id: "spain-american",
        title: "Jak funguje americká hypotéka",
        excerpt:
          "Úvěr vázaný na nemovitost ve Španělsku s českou nebo evropskou zástavou.",
        image:
          "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop",
        category: "Financování",
      },
      {
        id: "spain-tax",
        title: "Daně z nemovitosti v Andalusii",
        excerpt:
          "IBI, převodová daň a specifika regionální legislativy pro zahraniční kupce.",
        image:
          "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=400&fit=crop",
        category: "Daně",
      },
      {
        id: "spain-buy",
        title: "Proces koupě španělské vily",
        excerpt:
          "Od rezervační smlouvy po zápis v katastru – krok za krokem pro české investory.",
        image:
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop",
        category: "Průvodce",
      },
    ],
    redFlags: [
      {
        id: "spain-1",
        title: "Pozor na squattery (okupas)",
        description:
          "Ve Španělsku je obtížné vystěhovat nelegální nájemníky. Vždy ověřte stav nemovitosti a nájemní smlouvy.",
      },
      {
        id: "spain-2",
        title: "Nezaplacené poplatky společenství",
        description:
          "Dluhy na společných poplatcích (comunidad) přecházejí na nového vlastníka.",
      },
    ],
  },
  italy: {
    title: "Průvodce investicí v Itálii",
    subtitle: "Vysoký výnos, ale specifická pravidla",
    articles: [
      {
        id: "italy-lake",
        title: "Financování vily u jezera",
        excerpt:
          "Specifika italského trhu, notářské poplatky a daň z převodu nemovitosti.",
        image:
          "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=600&h=400&fit=crop",
        category: "Itálie",
      },
      {
        id: "italy-roi",
        title: "Výnos z pronájmu v Toskánsku",
        excerpt:
          "Reálné ROI, sezónnost a náklady na správu italské nemovitosti.",
        image:
          "https://images.unsplash.com/photo-1498307832095-e0baa8c4a4be?w=600&h=400&fit=crop",
        category: "ROI",
      },
      {
        id: "italy-tax",
        title: "Italská daň z nemovitosti (IMU)",
        excerpt:
          "Kdo platí IMU, jaké jsou sazby a kdy vzniká daňová povinnost pro cizince.",
        image:
          "https://images.unsplash.com/photo-1516483638261-f4dbafecf978?w=600&h=400&fit=crop",
        category: "Daně",
      },
    ],
    redFlags: [
      {
        id: "italy-1",
        title: "Restriktivní stavební povolení",
        description:
          "U historických budov jsou rekonstrukce výrazně omezeny. Ověřte urbanistický plán před koupí.",
      },
      {
        id: "italy-2",
        title: "Dědictví a spoluvlastnictví",
        description:
          "Italské dědické řízení může trvat roky. Prověřte vlastnickou historii nemovitosti.",
      },
    ],
  },
  croatia: {
    title: "Průvodce investicí v Chorvatsku",
    subtitle: "Nemovitosti u moře pro české investory",
    articles: [
      {
        id: "croatia-coast",
        title: "Koupě domu u Jadranu",
        excerpt:
          "Právní rámec pro EU občany, kupní smlouva a zápis v zemské knize.",
        image:
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop",
        category: "Chorvatsko",
      },
      {
        id: "croatia-rent",
        title: "Pronájem turistické nemovitosti",
        excerpt:
          "Sezónní výnosy, registrace k pronájmu a místní poplatky pro hostitele.",
        image:
          "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop",
        category: "Pronájem",
      },
      {
        id: "croatia-eu",
        title: "EU občané vs. třetí země",
        excerpt:
          "Rozdíly v možnosti koupě nemovitosti podle daňové rezidence kupujícího.",
        image:
          "https://images.unsplash.com/photo-1530521954074-e64f2470ce2e?w=600&h=400&fit=crop",
        category: "Právo",
      },
    ],
    redFlags: [
      {
        id: "croatia-1",
        title: "Nelegální stavby",
        description:
          "Častý problém u starších domů. Bez legalizačního souhlasu nelze nemovitost prodat.",
      },
      {
        id: "croatia-2",
        title: "Přístupová práva",
        description:
          "Ověřte, zda nemovitost má legální přístupovou cestu – jinak může být nedosažitelná.",
      },
    ],
  },
  bali: {
    title: "Průvodce investicí na Bali",
    subtitle: "Tropický trh s rostoucím potenciálem pronájmu",
    articles: [
      {
        id: "bali-villa",
        title: "Koupě luxusní vily na Bali",
        excerpt:
          "Freehold vs. leasehold, právní struktura pro cizince a bezpečný převod.",
        image:
          "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&h=400&fit=crop",
        category: "Bali",
      },
      {
        id: "bali-roi",
        title: "ROI z krátkodobého pronájmu",
        excerpt:
          "Sezónnost, Airbnb regulace a reálné výnosy v oblastech Seminyak a Ubud.",
        image:
          "https://images.unsplash.com/photo-1555400038-63f5a51702b6?w=600&h=400&fit=crop",
        category: "Výnos",
      },
      {
        id: "bali-legal",
        title: "Právní rámec pro zahraniční investory",
        excerpt:
          "PT PMA struktura, daňové povinnosti a rizika neověřených developerů.",
        image:
          "https://images.unsplash.com/photo-1518548419970-58e985b343ae?w=600&h=400&fit=crop",
        category: "Právo",
      },
    ],
    redFlags: [
      {
        id: "bali-1",
        title: "Leasehold místo freehold",
        description:
          "Cizinci nemohou vlastnit půdu přímo. Ověřte délku leaseholdu a možnost prodloužení.",
      },
      {
        id: "bali-2",
        title: "Nelegální stavby v zónách",
        description:
          "Některé vily stojí v chráněných oblastech bez stavebního povolení.",
      },
    ],
  },
  saudi: {
    title: "Průvodce investicí v Saúdské Arábii",
    subtitle: "Vision 2030 a nový realitní trh",
    articles: [
      {
        id: "saudi-market",
        title: "Saúdský realitní trh pro cizince",
        excerpt:
          "Nové regulace, zóny pro zahraniční vlastnictví a perspektivní lokality.",
        image:
          "https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=600&h=400&fit=crop",
        category: "SA",
      },
      {
        id: "saudi-neom",
        title: "Mega projekty: NEOM a Rijád",
        excerpt:
          "Investiční příležitosti v rámci největších stavebních projektů na světě.",
        image:
          "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&h=400&fit=crop",
        category: "Projekty",
      },
      {
        id: "saudi-tax",
        title: "Daně a poplatky při koupi",
        excerpt:
          "Transfer tax, poplatky za registraci a daňové aspekty pro nerezidenty.",
        image:
          "https://images.unsplash.com/photo-1581020088033-685b882eb75b?w=600&h=400&fit=crop",
        category: "Daně",
      },
    ],
    redFlags: [
      {
        id: "saudi-1",
        title: "Omezení vlastnictví pro cizince",
        description:
          "Vlastnictví je povoleno jen ve vyjmenovaných zónách. Ověřte eligibilitu nemovitosti.",
      },
      {
        id: "saudi-2",
        title: "Raná fáze trhu",
        description:
          "Trh je relativně mladý – důkladně prověřte developera a stav projektu.",
      },
    ],
  },
  slovakia: {
    title: "Průvodce investicí na Slovensku",
    subtitle: "Blízký trh s českou legislativní podobností",
    articles: [
      {
        id: "sk-bratislava",
        title: "Investice v Bratislavě",
        excerpt:
          "Rostoucí poptávka po nájmu, nová výstavba a dostupnost pro české investory.",
        image:
          "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=600&h=400&fit=crop",
        category: "Slovensko",
      },
      {
        id: "sk-tatry",
        title: "Chalupy a apartmány v Tatranské oblasti",
        excerpt:
          "Sezónní pronájem, správa na dálku a daňové aspekty pro české majitele.",
        image:
          "https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=600&h=400&fit=crop",
        category: "Turistika",
      },
      {
        id: "sk-mortgage",
        title: "Hypotéka na Slovensku pro Čechy",
        excerpt:
          "Podmínky slovenských bank, LTV limity a co připravit k žádosti.",
        image:
          "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop",
        category: "Financování",
      },
    ],
    redFlags: [
      {
        id: "sk-1",
        title: "Rozdíly v katastru a zápisech",
        description:
          "Slovenský katastr má odlišnou strukturu. Ověřte zástavní práva a věcná břemena.",
      },
      {
        id: "sk-2",
        title: "Kurzové riziko EUR/CZK",
        description:
          "Pokud příjem máte v CZK, splátky v EUR vás vystavují kurzovému riziku.",
      },
    ],
  },
};
