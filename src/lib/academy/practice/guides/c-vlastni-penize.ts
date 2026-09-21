import type { PracticeGuide } from "@/lib/academy/practice/types";
import { routes } from "@/lib/routes";

export const GUIDE_VLASTNI_PENIZE: PracticeGuide = {
  slug: "vlastni-penize-odhad",
  title: "Vlastní peníze, odhad a další zástava",
  cardBlurb:
    "Jak spočítat vlastní zdroje, řešit rozdíl kupní a odhadní ceny a bezpečně pracovat s další zástavou.",
  sampleQuestions: [
    "Kolik vlastních peněz opravdu potřebuji?",
    "Co dělat při nízkém odhadu?",
    "Lze ručit nemovitostí rodičů?",
  ],
  tags: ["vlastni-penize"],
  icon: "landmark",
  relatedLessonSlugs: ["ltv"],
  cta: {
    label: "Porovnat kupní cenu a odhad",
    href: routes.kalkulacky.odhadVersusKupniCena,
  },
  answers: [
    {
      id: "kolik-vlastnich",
      question: "Kolik vlastních peněz potřebuji k hypotéce?",
      directAnswer:
        "Potřebná částka není jen pevné procento kupní ceny. Závisí na bankou uznané hodnotě zástavy, povoleném LTV, kupní ceně a vedlejších nákladech. Vlastními penězi obvykle hradíte rozdíl mezi úvěrem a cenou, poplatky, právní služby, vybavení a rezervu po koupi.",
      explanation:
        "LTV se počítá proti zástavní hodnotě stanovené pro banku, která může být nižší než cena sjednaná s prodávajícím. Aktuální regulatorní limit a případné věkové či účelové výjimky je třeba ověřit k datu žádosti; banka může mít přísnější pravidlo. Do plánu zahrňte také náklady na odhad, katastrální podání, úschovu, pojištění a první opravy, i když některé položky mohou být v nabídce zdarma. Vlastní zdroje musí být doložitelné a banka může požadovat jejich použití před čerpáním. Není bezpečné vložit do koupě úplně vše a zůstat bez likvidní rezervy.",
      example:
        "Kupní cena činí 5 000 000 Kč, bankovní hodnota 4 800 000 Kč a uvažované LTV 80 %. Úvěrový strop je 3 840 000 Kč, takže na cenu chybí 1 160 000 Kč. K tomu přidejte transakční výdaje a rezervu; pouhý milion, tedy 20 % kupní ceny, nestačí.",
      commonMistake:
        "Počítat vlastní zdroje jen jako procento inzerované ceny a ignorovat odhad i náklady po podpisu.",
      nextStep: { label: "Spočítat potřebné zdroje", href: routes.kalkulacky.odhadVersusKupniCena },
      sources: [
        {
          label: "Česká národní banka",
          url: "https://www.cnb.cz/cs/dohled-financni-trh/ochrana-spotrebitele/spotrebitelsky-uver/",
          checkedAt: "2026-09-21",
          notes: "Aktuální informace k LTV a obezřetnostnímu rámci.",
        },
      ],
      searchTerms: ["vlastní zdroje", "akontace hypotéka", "kolik hotovosti"],
    },
    {
      id: "kupni-vs-odhad",
      question: "Jaký je rozdíl mezi kupní cenou a bankovním odhadem?",
      directAnswer:
        "Kupní cena je částka dohodnutá mezi kupujícím a prodávajícím. Bankovní odhad, přesněji hodnota přijatá bankou pro zajištění, slouží k řízení úvěrového rizika. Nemusí být stejný: zohledňuje stav, lokalitu, srovnatelné prodeje, právní vlastnosti a prodejnost nemovitosti.",
      explanation:
        "Banka nefinancuje automaticky určité procento kupní ceny. Pro LTV vychází z hodnoty, kterou podle své metodiky přijme; v praxi bývá rozhodující konzervativnější základ. Odhadce neposuzuje, zda se vám byt líbí nebo zda má pro vás zvláštní hodnotu. Výsledek může ovlivnit nebytové užívání, věcné břemeno, horší technický stav, černá stavba nebo nedostatek srovnatelných transakcí. Online odhad je orientační a konečnou hodnotu negarantuje. Před rezervací lze riziko snížit kontrolou dokumentů a realistickým srovnáním trhu.",
      example:
        "Prodávající žádá 7 milionů Kč, protože byt prošel designovou rekonstrukcí. Bankovní ocenění je 6,4 milionu Kč: část vybavení nepovažuje za trvalou hodnotu a srovnatelné prodeje jsou nižší. Při 80% LTV vychází úvěr nejvýše 5,12 milionu Kč, ne 5,6 milionu.",
      commonMistake:
        "Považovat nabídkovou cenu nebo odhad realitního makléře za závaznou zástavní hodnotu banky.",
      nextStep: { label: "Modelovat odhadní mezeru", href: routes.kalkulacky.odhadVersusKupniCena },
      vizId: "estimate-gap",
      searchTerms: ["kupní cena odhad", "zástavní hodnota", "bankovní ocenění"],
    },
    {
      id: "nizky-odhad",
      question: "Co mohu dělat, když odhad vyjde nízko?",
      directAnswer:
        "Ověřte, zda odhad obsahuje správné údaje, a zjistěte přesný dopad na LTV. Potom lze doložit věcnou chybu, vyjednat nižší cenu, přidat vlastní peníze, nabídnout další zástavu nebo prověřit jinou banku. Žádná varianta ale nezaručuje vyšší ocenění.",
      explanation:
        "Nejdřív oddělte chybu od odborného názoru. Chybějící plocha, zaměněné příslušenství nebo opomenutá dokončená rekonstrukce se dají doložit. Nesouhlas s použitými srovnáními sám o sobě nestačí, ale lze požádat banku o přezkum podle jejího procesu. Jiná banka používá jiného odhadce či model a může dojít k jiné hodnotě, zároveň však jinak posoudí příjmy a sazbu. Další zástava snižuje LTV celé zajištěné expozice, ale vystavuje riziku další majetek. Volbu řešte před uplynutím rezervačních a kupních termínů.",
      example:
        "Chybí 400 000 Kč proti plánovanému úvěru. Kupující doloží, že odhad nezahrnul garáž evidovanou na samostatném listu vlastnictví. Banka nechá podklad doplnit; pokud se hodnota nezmění dostatečně, zbývá dohoda o ceně, více zdrojů nebo jiné zajištění.",
      commonMistake:
        "Tlačit odhadce k požadované částce místo doložení konkrétních faktů a přípravy záložního scénáře.",
      nextStep: { label: "Prověřit varianty financování", href: routes.navrhNaMiru },
      searchTerms: ["nízký odhad nemovitosti", "odhad nestačí", "doplatek ceny"],
    },
    {
      id: "prezkum-odhadu",
      question: "Lze požádat o přezkum bankovního odhadu?",
      directAnswer:
        "Ano, banky obvykle mají postup pro námitku nebo doplnění ocenění, ale nejde o nárok na vámi požadovanou částku. Přezkum má smysl hlavně při věcné chybě, neúplných podkladech nebo nové relevantní informaci. Žádost se podává přes banku s konkrétními důkazy.",
      explanation:
        "Zkontrolujte adresu, jednotku, plochu, pozemky, příslušenství, technický stav, právní omezení a fotografie. Přiložte katastrální dokumenty, kolaudaci, půdorysy, rozpočet dokončených prací nebo relevantní srovnatelné prodeje; samotné inzeráty nemusí dokládat realizovanou cenu. Banka může odhad potvrdit, upravit nebo objednat nové ocenění, případně za poplatek. Lhůta na přezkum se musí vejít do transakčního harmonogramu. Metodika ocenění je oddělená od regulatorního LTV: i po zvýšení odhadu musí žádost splnit ostatní podmínky.",
      example:
        "Ocenění rodinného domu nezahrnulo 300 m² navazujícího stavebního pozemku, protože podklad obsahoval jen jednu parcelu. Kupující dodá úplný list vlastnictví a geometrické údaje. To je konkrétní důvod k revizi, na rozdíl od argumentu, že prodávající očekává vyšší cenu.",
      commonMistake:
        "Poslat obecný nesouhlas bez označení chyby a bez dokumentů, které ji dokazují.",
      nextStep: { label: "Prověřit podklady nemovitosti", href: routes.dueDiligence },
      sources: [
        {
          label: "Český úřad zeměměřický a katastrální",
          url: "https://www.cuzk.cz/",
          checkedAt: "2026-09-21",
          notes: "Údaje k parcelám, jednotkám a právům evidovaným v katastru.",
        },
      ],
      searchTerms: ["reklamace odhadu", "přezkum ocenění", "chyba v odhadu"],
    },
    {
      id: "zastava-rodicu",
      question: "Mohu ručit nemovitostí rodičů?",
      directAnswer:
        "Ano, pokud banka nemovitost přijme a její vlastníci dobrovolně podepíší zástavní dokumentaci. Rodiče nemusí být vždy spolužadateli, ale jejich majetek zajišťuje váš dluh. Při dlouhodobém nesplácení může banka zástavu realizovat, proto nejde o formální pomoc bez rizika.",
      explanation:
        "Další zástava může zvýšit celkovou hodnotu zajištění a snížit LTV, nenahrazuje však vaši schopnost splácet. Banka prověří právní stav i hodnotu rodičovské nemovitosti a může požadovat souhlasy podle vlastnictví či společného jmění. Rodina by měla mít písemně ujasněno, kdo splácí, co se stane při rozchodu, úmrtí či výpadku příjmu a kdy se má zástava uvolnit. Vlastníci zástavy mají před podpisem rozumět smlouvě a mohou využít nezávislou právní radu. Případné omezení nakládání s nemovitostí může komplikovat její prodej nebo další úvěr.",
      example:
        "Kupovaný byt má hodnotu 4,5 milionu Kč a úvěr má být 4 miliony Kč. Přidáním rodičovského bytu banka posuzuje zajištění v širším souboru. Pokud však žadatel příjmově zvládne jen 3,5 milionu Kč, další zástava chybějící bonitu nevyřeší.",
      commonMistake:
        "Prezentovat rodičům zástavu jako pouhý podpis bez vysvětlení možnosti nuceného prodeje.",
      nextStep: { label: "Navrhnout bezpečnou strukturu", href: routes.navrhNaMiru },
      searchTerms: ["ručení rodičů", "druhá zástava", "nemovitost rodičů"],
    },
    {
      id: "cele-kupni-ceny",
      question: "Lze hypotékou zaplatit celou kupní cenu?",
      directAnswer:
        "Z jediné kupované nemovitosti obvykle nelze bez dalšího financovat 100 % ceny, pokud by tím LTV překročilo aktuálně přípustnou úroveň banky. Celou cenu však může pokrýt úvěr při dostatečné hodnotě další zástavy. Vedlejší náklady a rezerva přesto zůstávají.",
      explanation:
        "Rozhodující je poměr celkového úvěru k bankou uznané hodnotě všech zastavených nemovitostí, nikoli marketingové označení „bez vlastních zdrojů“. Další zástava přesouvá riziko na další majetek a musí být právně i hodnotově přijatelná. Kombinace hypotéky se spotřebitelským úvěrem může výrazně zhoršit bonitu, zvýšit měsíční zatížení a musí být bance pravdivě uvedena. Dar od rodiny nebo prodej jiného majetku může být vlastní zdroj, banka ale může chtít původ peněz doložit. Aktuální LTV pravidla ověřte u banky a ČNB.",
      example:
        "Kupní cena i odhad bytu jsou 5 milionů Kč. Samotný byt nestačí pro pěti­milionový úvěr při LTV pod 100 %. Pokud se přidá další přijatelná nemovitost s dostatečnou hodnotou, celkové LTV může vyjít, ale oba objekty budou zatížené zástavou.",
      commonMistake:
        "Dofinancovat chybějící část drahým úvěrem a neuvést jej v žádosti o hypotéku.",
      nextStep: { label: "Spočítat LTV scénář", href: routes.kalkulacky.odhadVersusKupniCena },
      sources: [
        {
          label: "Česká národní banka",
          url: "https://www.cnb.cz/cs/dohled-financni-trh/ochrana-spotrebitele/spotrebitelsky-uver/",
          checkedAt: "2026-09-21",
          notes: "Ověření aktuálního regulatorního nastavení LTV.",
        },
      ],
      searchTerms: ["100 procent hypotéka", "bez vlastních zdrojů", "celá kupní cena"],
    },
    {
      id: "uvolneni-zastavy",
      question: "Kdy lze rodičovskou nebo další zástavu uvolnit?",
      directAnswer:
        "Další zástavu lze uvolnit jen se souhlasem banky, když zbývající zajištění samo splňuje její požadované LTV a další podmínky. Pomoci může splacená jistina, růst hodnoty kupované nemovitosti nebo mimořádná splátka. Uvolnění není automatické k předem odhadnutému datu.",
      explanation:
        "Banka obvykle vyžádá aktuální ocenění zbývající nemovitosti a zkontroluje stav úvěru. Hodnota může růst i klesat a interní hranice pro vyvázání nemusí být totožná s maximem pro nový úvěr. Po souhlasu banky následují dokumenty pro výmaz zástavního práva v katastru; teprve dokončený výmaz obnoví nezatížený právní stav. Před zřízením druhé zástavy si vyžádejte popis procesu, možné poplatky a podmínky přecenění, ale počítejte s tím, že budoucí rozhodnutí se bude řídit smlouvou a tehdejší situací.",
      example:
        "Po pěti letech klesne jistina na 3,5 milionu Kč a kupovaný byt banka nově ocení na 5 milionů Kč. Orientační LTV samotného bytu je 70 %. Banka může po kontrole souhlasit s vyvázáním rodičovského domu; žádost a katastrální výmaz však musí proběhnout formálně.",
      commonMistake:
        "Slíbit rodičům přesný rok uvolnění zástavy bez smluvního podkladu a budoucího ocenění.",
      nextStep: { label: "Probrat plán uvolnění zástavy", href: routes.kontakt },
      sources: [
        {
          label: "Český úřad zeměměřický a katastrální",
          url: "https://www.cuzk.cz/",
          checkedAt: "2026-09-21",
          notes: "Informace k zápisům a výmazům práv v katastru.",
        },
      ],
      searchTerms: ["vyvázání zástavy", "výmaz zástavního práva", "uvolnění nemovitosti"],
    },
    {
      id: "hotovost-rezerva",
      question: "Kolik hotovosti si nechat jako rezervu po koupi?",
      directAnswer:
        "Rezervu neurčuje jeden správný násobek pro všechny. Měla by pokrýt několik měsíců nezbytných výdajů a realistické jednorázové náklady domu či bytu. Vyšší polštář potřebuje domácnost s jedním proměnlivým příjmem, starší nemovitostí nebo blížící se změnou rodinné situace.",
      explanation:
        "Oddělte transakční rezervu, provozní rezervu a peníze na plánované opravy. První kryje katastr, právní služby, stěhování a vybavení; druhá výpadek příjmu či mimořádnou splátku nákladů; třetí vychází z technického stavu nemovitosti a plánu společenství vlastníků. Peníze na krátkodobé havárie mají zůstat likvidní, nikoli v kolísavé investici. Banka může schválit použití téměř všech úspor jako vlastních zdrojů, ale to neznamená, že je takové rozhodnutí pro domácnost bezpečné. Rozpočet testujte i při vyšší sazbě po fixaci.",
      example:
        "Po zaplacení ceny zbývá domácnosti 120 000 Kč. Jen stěhování, spotřebiče a první opravy mohou stát 80 000 Kč, takže provozní polštář je fakticky 40 000 Kč. Bezpečnější může být levnější nemovitost, odklad části rekonstrukce nebo vyšší počáteční úspora.",
      commonMistake:
        "Použít všechny úspory na akontaci a plánovat, že případné opravy zaplatí nová kreditní karta.",
      nextStep: { label: "Sestavit rozpočet domácnosti", href: routes.kalkulacky.rodinnyRozpocet },
      searchTerms: ["rezerva po koupi", "hotovostní polštář", "náklady na bydlení"],
    },
  ],
  updatedAt: "2026-09-21",
};
