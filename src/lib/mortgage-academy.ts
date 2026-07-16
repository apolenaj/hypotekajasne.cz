export interface AcademyLesson {
  id: string;
  title: string;
  shortLabel: string;
  definition: string;
  realExample: string;
  bankView: string;
  commonMistake: string;
}

export const academyLessons: AcademyLesson[] = [
  {
    id: "ltv",
    title: "LTV (Loan to Value)",
    shortLabel: "LTV",
    definition:
      "Poměr mezi výší hypotéky a zástavní hodnotou nemovitosti. Říká bance (a vám), jak velkou páku na nemovitost berete — čím vyšší LTV, tím méně vlastních peněz a tím vyšší riziko.",
    realExample:
      "Kupujete byt za 5 000 000 Kč, banka vám půjčí 4 000 000 Kč. Vaše LTV je 80 %. Vlastní kapitál je tedy 1 000 000 Kč (20 %).",
    bankView:
      "Banka sleduje LTV jako limit rizika. V ČR typicky končí kolem 80–90 % podle typu klienta. Nejde jen o kupní cenu — rozhoduje odhad ceny, který udělá ocenitel banky.",
    commonMistake:
      "Klienti si pletou kupní cenu s odhadní cenou banky. Pokud odhad vyjde níž než kupní cena, LTV vyskočí a chybějící rozdíl musíte dorovnat z vlastní kapsy.",
  },
  {
    id: "rpsn",
    title: "RPSN",
    shortLabel: "RPSN",
    definition:
      "Reálná cena úvěru za rok, včetně všech povinných poplatků. Je to poctivější číslo než samotná úroková sazba — ukazuje, kolik vás úvěr skutečně stojí.",
    realExample:
      "Úrok může být 4 %, ale s poplatky za odhad, zpracování a vedení účtu je RPSN 4,3 %. U dvou nabídek se stejně výhodným úrokem často vyhraje ta s nižším RPSN.",
    bankView:
      "RPSN je povinně uváděný ukazatel. Banka i zprostředkovatel s ním pracují jako s srovnávacím nástrojem — pokud se liší od sazby o víc než pár desetin, hledejte skryté poplatky.",
    commonMistake:
      "Výběr hypotéky jen podle nejnižší úrokové sazby. Levnější úrok s drahým pojištěním, odhadem nebo poplatkem za čerpání může být dražší než nabídka s vyšším úrokem a čistým RPSN.",
  },
  {
    id: "cash-flow",
    title: "Cash-flow z pronájmu",
    shortLabel: "Cash-flow",
    definition:
      "Peníze, které vám reálně zbydou každý měsíc v kapse po odečtení splátky, provozu a rezerv. To je rozdíl mezi „vypadá to hezky“ a „funguje to jako investice“.",
    realExample:
      "Nájem je 20 000 Kč, splátka hypotéky 15 000 Kč, fond oprav 2 000 Kč. Čisté CF = +3 000 Kč. Pokud měsíc není nájemník, CF skočí do minusu — proto se počítá rezervní polštář.",
    bankView:
      "U investiční hypotéky banka nebere nájem vždy 1:1. Často započítá jen část očekávaného nájmu, kontroluje vaše příjmy (DSTI) a chce vidět, že zvládnete splátku i bez nájmu.",
    commonMistake:
      "Ignorování daní, fondu oprav a nákladů na neobsazenost. Hrubý nájem není čistý výnos. Reálné CF často sníží i správa, pojištění a 1–2 měsíce prázdného bytu ročně.",
  },
  {
    id: "fixace",
    title: "Fixace úrokové sazby",
    shortLabel: "Fixace",
    definition:
      "Období, po které máte zamčenou úrokovou sazbu. Během fixace víte, kolik platíte. Po jejím konci banka nabídne novou sazbu — a vy můžete refinancovat.",
    realExample:
      "Vezmete hypotéku se sazbou 4,5 % a fixací 5 let. Pět let splácíte stejnou anuitu. V 6. roce vám banka nabídne třeba 5,2 % — nebo odejdete ke konkurenci.",
    bankView:
      "Fixace chrání klienta i banku před krátkodobými výkyvy sazeb. Delší fixace často stojí o něco víc. Banka zároveň sleduje, kdy vám končí smlouva — je to klíčový okamžik refinancování.",
    commonMistake:
      "Vzít nejdelší možnou fixaci pro jistotu, aniž byste spočítali předčasné splátky a plán prodeje. Krátká fixace a plán refinancování bývá někdy levnější než 10letý zámek.",
  },
  {
    id: "dsti",
    title: "DSTI (Debt Service to Income)",
    shortLabel: "DSTI",
    definition:
      "Podíl měsíčních splátek všech dluhů na vašich čistých příjmech. Banka tím kontroluje, jestli vám po splátkách zbývá dost na život.",
    realExample:
      "Čistý příjem 50 000 Kč, splátka hypotéky 18 000 Kč a kreditka 2 000 Kč. DSTI = 40 %. Pokud limit banky je 45 %, ještě projdete — ale o další auto na leasing už bych se bál.",
    bankView:
      "DSTI je jeden z hlavních stres-testů u hypotečky. Limit se liší podle banky a typu klienta. Počítají se všechny závazky: hypotéka, spotřebák, leasing, minimální platba z kreditky.",
    commonMistake:
      "Zapomenout na kreditní karty a kontokorenty. I nevyužitý limit často banka započítá jako potenciální dluh a sníží vám maximální hypotéku.",
  },
  {
    id: "snowball",
    title: "Sněhová koule (Snowball efekt)",
    shortLabel: "Sněhová koule",
    definition:
      "Investiční strategie, kdy veškerý čistý zisk z nájmu neutratíte, ale okamžitě ho použijete na mimořádnou splátku dluhu nebo re-investujete. Váš majetek tak roste exponenciálně jako nabalující se sněhová koule.",
    realExample:
      "Byt vám generuje čistý nájem 5 000 Kč měsíčně. Místo abyste je utratili, pošlete je bance jako mimořádnou splátku. Vaše hypotéka díky tomu zmizí třeba o 10 let dříve a ušetříte miliony na úrocích.",
    bankView:
      "Banky umožňují vkládat mimořádné splátky zdarma (ze zákona obvykle až 25 % jistiny ročně měsíc před výročím smlouvy, nebo plně při konci fixace). Tím si snižujete celkový přeplatek banky.",
    commonMistake:
      "Nechat čistý zisk hnít na běžném účtu bez úročení, kde ho postupně znehodnocuje inflace, místo aby peníze tvrdě pracovaly na mazání vašeho dluhu.",
  },
  {
    id: "inflace",
    title: "Inflace a Kupní síla",
    shortLabel: "Inflace",
    definition:
      "Skrytý zloděj, který způsobuje, že za stejnou částku si v budoucnu koupíte méně věcí. U hypoték ale funguje jako váš spojenec, protože postupně znehodnocuje reálnou hodnotu vašeho dluhu.",
    realExample:
      "Máte hypotéku 3 miliony Kč. Za 15 let při průměrné 2,5% inflaci bude mít tento dluh reálnou kupní sílu pouze zhruba 2 miliony Kč. Půjčili jste si drahé peníze, ale bance vracíte levné peníze.",
    bankView:
      "Banka inflaci napřímo neřeší u vašeho dluhu (jistina zůstává nominálně stejná). Centrální banka ale na inflaci reaguje změnou úrokových sazeb — když inflace stoupá, rostou i úroky u nových hypoték.",
    commonMistake:
      "Držet velkou hotovost bezpečně na účtu a bát se vzít si hypotéku na aktiva (nemovitosti), jejichž hodnota s inflací naopak přirozeně roste.",
  },
  {
    id: "freehold-leasehold",
    title: "Freehold vs. Leasehold (Zahraničí)",
    shortLabel: "Freehold / Leasehold",
    definition:
      "Dva odlišné typy vlastnictví. Freehold znamená, že vlastníte nemovitost i pozemek pod ní navždy (ČR, Španělsko). Leasehold znamená dlouhodobý pronájem pozemku nebo nemovitosti na desítky let (typicky Bali nebo Anglie).",
    realExample:
      "Na Bali koupíte leasehold vilu na 25 let za 2 miliony Kč s ročním výnosem 15 %. Za 7 let se vám investice vrátí a zbylých 18 let generujete čistý zisk. Poté nemovitost vracíte majiteli pozemku (nebo leasehold za poplatek prodloužíte).",
    bankView:
      "České banky vám na leasehold v zahraničí nepůjčí (nelze ho dát do zástavy). Na leasehold potřebujete buď hotovost, nebo musíte bance ručit jinou (freehold) nemovitostí v ČR.",
    commonMistake:
      "Porovnávat cenu leaseholdu v Asii s cenou freeholdu v Evropě 1:1, aniž byste započítali fakt, že leasehold je de facto předplacený nájem a po čase jeho hodnota klesá k nule.",
  },
  {
    id: "off-plan",
    title: "Off-plan investice",
    shortLabel: "Off-plan",
    definition:
      "Koupě nemovitosti ještě před jejím dokončením (často ještě před zahájením stavby), pouze podle vizualizací a plánů. Typické pro Dubaj, Španělsko nebo developerské projekty v ČR.",
    realExample:
      "V Dubaji koupíte apartmán off-plan za 5 milionů Kč a platíte postupně podle fází stavby (Developer Payment Plan). Když je byt po 2 letech dostavěn a připraven k nastěhování, jeho tržní hodnota už může být 6,5 milionu Kč.",
    bankView:
      "Financování off-planu hypotékou u zahraničních nemovitostí bývá pro českou banku velmi složité (nelze zastavit vzduch). Naštěstí zahraniční developeři často nabízejí vlastní bezúročné splátkové kalendáře.",
    commonMistake:
      "Koupit off-plan od neprověřeného nebo zadluženého developera, který projekt nikdy nedokončí, aniž by byly vaše peníze chráněny na státem regulovaném Escrow účtu.",
  },
  {
    id: "escrow",
    title: "Escrow (Jistotní) účet",
    shortLabel: "Escrow",
    definition:
      "Bezpečný vázaný účet (často u notáře, advokáta, banky nebo chráněný státem), kam kupující pošle peníze. Prodávající je dostane až ve chvíli, kdy jsou splněny všechny podmínky smlouvy (např. byt je úspěšně přepsán v katastru).",
    realExample:
      "Kupujete dům ve Španělsku. Peníze nepošlete přímo majiteli (který by s nimi mohl zmizet), ale na Escrow účet notáře. Majitel se k penězům dostane až ve chvíli, kdy máte v ruce klíče a list vlastnictví.",
    bankView:
      "Pro banky je to absolutní standard. Jakmile čerpáte hypotéku na koupi, banka posílá peníze zásadně do úschovy (Escrow), nikdy ne přímo prodávajícímu před formálním přepisem.",
    commonMistake:
      "Poslat zálohu nebo rovnou celou kupní cenu v zahraničí přímo na osobní/firemní účet developera nebo realitní kanceláře.",
  },
];

export function getAcademyLesson(id: string): AcademyLesson | undefined {
  return academyLessons.find((lesson) => lesson.id === id);
}
