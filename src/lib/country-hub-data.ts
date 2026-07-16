import { destinationCards } from "@/lib/mock-data";
import type { CountryId } from "@/lib/calculators";

export interface FourPillars {
  market: string;
  financing: string;
  process: string;
  risks: string;
}

export interface CountryHubData {
  heroImage: string;
  subtitle: string;
  marketOverview: string;
  fourPillars: FourPillars;
}

const placeholderFourPillars: FourPillars = {
  market:
    "Trh vykazuje stabilní poptávku po investičním bydlení s regionálními rozdíly v cenách i výnosech z nájmu.",
  financing:
    "Financování pro cizince závisí na bonitě, LTV a místních bankovních pravidlech. Doporučujeme individuální audit před podpisem.",
  process:
    "Rezervace nemovitosti → due diligence → smlouvy → registrace vlastnictví dle místní legislativy.",
  risks:
    "Riziko: Měnové a regulatorní změny. Příležitost: Diverzifikace portfolia mimo domácí trh.",
};

export const countryHubData: Record<string, CountryHubData> = {
  "Česká republika": {
    heroImage:
      "https://images.pexels.com/photos/126292/pexels-photo-126292.jpeg?auto=compress&cs=tinysrgb&w=1920",
    subtitle:
      "Domácí trh s regulací ČNB, stabilní LTV a nejširší nabídkou bankovních produktů v regionu.",
    marketOverview: `
      <h3 class="text-2xl font-bold text-gray-900 mt-0 mb-4">Proč investovat v ČR v roce 2026</h3>
      <p>Český trh je po cenové korekci a stabilizaci úrokových sazeb opět v režimu růstu. Praha a Brno fungují jako nezastavitelné lokomotivy tažené silnou poptávkou po nájemním bydlení, zatímco regiony jako Ostrava, Ústí nad Labem nebo Plzeň nabízejí nadstandardní hrubý yield (výnos) přesahující 6 % p.a.</p>
      
      <h3 class="text-2xl font-bold text-gray-900 mt-8 mb-4">Bezpečí domácího hřiště</h3>
      <p>Největší výhodou českého trhu je absolutní znalost prostředí. Máme jeden z nejtransparentnějších katastrů nemovitostí na světě (dostupný online zdarma) a bezprecedentní paletu bankovních produktů. Pokud máte stabilní příjmy v CZK, domácí hypotéka vás chrání před měnovým rizikem. Navíc, díky zákonu o spotřebitelském úvěru máte obrovskou flexibilitu při refinancování a mimořádných splátkách.</p>

      <h3 class="text-2xl font-bold text-gray-900 mt-8 mb-4">Klíčová metrika: Dostupnost bydlení</h3>
      <p>ČR má dlouhodobě jeden z nejhorších indexů dostupnosti vlastního bydlení v Evropě (poměr cen k platům). Pro běžného občana je to špatná zpráva, ale <strong>pro vás jako investora je to fundamentální výhoda</strong>. Znamená to totiž, že obrovská masa lidí nedosáhne na hypotéku a je nucena jít do nájmu. Poptávka po vašich nájemních bytech bude díky tomu v příštích 10 letech garantovaná.</p>

      <div class="mt-8 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
        <h4 class="font-bold text-emerald-900 mb-2">💡 Expertní tip z trhu</h4>
        <p class="text-emerald-800 text-sm">Při nákupu investičního bytu v ČR se vyhněte novostavbám s prémiovou cenovkou, kde se vám výnos (ROI) propadne pod 3 %. Zaměřte se na starší cihlové nebo panelové byty 2+kk před rekonstrukcí poblíž dopravních uzlů. Po řízené rekonstrukci maximalizujete jak nájemné, tak kapitálový růst hodnoty (Flipping-to-Rent).</p>
      </div>
    `,
    fourPillars: {
      market:
        "Rostoucí trh tažený nedostatečnou výstavbou a silnou poptávkou po nájemním bydlení ve velkých městech.",
      financing:
        "LTV max 80-90 % dle věku. Nutné plnit přísné limity DSTI nařízené ČNB. Široká paleta fixací (1-10 let).",
      process:
        "Rezervační smlouva -> Úschova peněz -> Kupní smlouva -> Návrh na vklad do katastru nemovitostí (přepis 21-30 dní).",
      risks:
        "Riziko: Klesající dostupnost vlastnického bydlení. Příležitost: Extrémní stabilita a růst nájemního trhu.",
    },
  },
  "SAE (Dubaj)": {
    heroImage:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80&cache=bust",
    subtitle:
      "Daňový ráj, architektonické divy a absolutní bezpečí kapitálu.",
    marketOverview: `
      <h3 class="text-2xl font-bold text-gray-900 mt-0 mb-4">Dubajský zázrak: Město, které nezná daně</h3>
      <p>Dubaj není jen město, je to globální finanční útočiště. Neplatíte zde žádnou daň z příjmu, žádnou daň z kapitálových výnosů a žádnou daň z pronájmu. Vaše hrubé ROI (které se pohybuje mezi 6–9 %) je zde de facto čistým ziskem. Růst populace exponenciálně zrychluje a město do roku 2040 plánuje zdvojnásobit počet obyvatel. Otázka nezní, zda ceny porostou, ale o kolik.</p>
      
      <h3 class="text-2xl font-bold text-gray-900 mt-8 mb-4">Off-plan projekty: Jak udělat z mála peněz milionové zisky</h3>
      <p>Nejpopulárnější formou nákupu je tzv. <strong>Off-plan</strong> (nemovitost ve výstavbě). Developeři nabízejí bezúročné platební plány, kde např. 60 % zaplatíte během 3 let výstavby a 40 % až při předání klíčů. Díky tomu nepotřebujete hypotéku. A co víc? Během výstavby tržní hodnota nemovitosti často stoupne o 20–30 %. Kontrakt pak můžete se ziskem prodat ještě předtím, než vilu vůbec dostaví (tzv. Flipping).</p>

      <h3 class="text-2xl font-bold text-gray-900 mt-8 mb-4">Golden Visa (Zlatá víza)</h3>
      <p>Nákupem nemovitosti v hodnotě nad 2 000 000 AED (cca 12,5 mil. CZK) se automaticky kvalifikujete pro 10leté Zlaté vízum pro vás i vaši rodinu. Získáváte rezidenci, možnost otevřít si bezpečné bankovní účty a stát se daňovým rezidentem SAE.</p>

      <div class="mt-8 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
        <h4 class="font-bold text-emerald-900 mb-2">💡 Expertní tip z trhu</h4>
        <p class="text-emerald-800 text-sm">Pozor na tzv. Service Charges (poplatky za údržbu budovy). Luxusní věže s bazény a posilovnami polykají tisíce dirhamů měsíčně z vašeho zisku. Vybíráme pro klienty z <strong>Majetio.cz</strong> projekty, kde je balanc mezi luxusem a provozními náklady optimální.</p>
      </div>
    `,
    fourPillars: placeholderFourPillars,
  },
  "Španělsko": {
    heroImage:
      "https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=1920",
    subtitle:
      "Evropská Florida: Stabilní právo, 300 slunečných dní a jistota.",
    marketOverview: `
      <h3 class="text-2xl font-bold text-gray-900 mt-0 mb-4">Proč Španělsko? Návrat ke konzervativní jistotě</h3>
      <p>Španělsko prošlo po krizi v roce 2008 tvrdým ozdravením. Dnešní trh je tažen stabilními hotovostními kupci ze severní Evropy. Pobřeží jako Costa del Sol nebo Costa Blanca zaznamenávají setrvalý meziroční růst cen o 6–8 %. Je to ideální trh pro uložení hodnoty peněz kombinovaný s nákupem "druhého domova".</p>
      
      <h3 class="text-2xl font-bold text-gray-900 mt-8 mb-4">Realita španělských hypoték pro Čechy</h3>
      <p>Na rozdíl od Asie nebo Dubaje, ve Španělsku <strong>funguje klasický hypoteční trh pro cizince</strong>. Španělské banky (Santander, Sabadell) vám jako českému občanovi s prokazatelnými příjmy rády půjčí. Počítejte však s tím, že jako nerezidentovi vám dají maximálně 60–70 % LTV. Zbytek (+ cca 12 % na španělské daně a notáře) musíte mít v hotovosti.</p>

      <h3 class="text-2xl font-bold text-gray-900 mt-8 mb-4">Mýtus o squatterech (Okupas)</h3>
      <p>Česká média ráda straší squattery, kteří vám "ukradnou" byt. Skutečnost? Pokud kupujete apartmán v prémiovém resortu, urbanizaci s ostrahou (gated community) a alarmem, je riziko absolutně nulové. Zákony jsou navíc čím dál přísnější. Toto riziko hrozí pouze u opuštěných ruin v nezajímavých vnitrozemských lokalitách.</p>

      <div class="mt-8 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
        <h4 class="font-bold text-emerald-900 mb-2">💡 Expertní tip z trhu</h4>
        <p class="text-emerald-800 text-sm">Nekalkulujte ROI pouze na základě srpnových příjmů z Airbnb. Městy se šíří regulace krátkodobých pronájmů. Skutečným trendem je tzv. "Medium-term" pronájem pro severské důchodce nebo digitální nomády, kteří si byt pronajmou na celou zimu (od října do března).</p>
      </div>
    `,
    fourPillars: placeholderFourPillars,
  },
  "Slovensko": {
    heroImage:
      "https://images.pexels.com/photos/3322194/pexels-photo-3322194.jpeg?auto=compress&cs=tinysrgb&w=1920",
    subtitle:
      "Zajištění v Euru bez jazykové bariéry a s identickým právním systémem.",
    marketOverview: `
      <h3 class="text-2xl font-bold text-gray-900 mt-0 mb-4">Měnový štít jménem EUR</h3>
      <p>Slovenský realitní trh je pro českého investora často přehlíženým klenotem. Hlavním argumentem pro vstup na tento trh není exotika, ale <strong>diverzifikace měnového rizika</strong>. Příjmy z pronájmu inkasujete v Eurech, čímž si vytváříte přirozený hedge (ochranu) proti případným výkyvům české koruny, aniž byste museli řešit složitou zahraniční byrokracii.</p>
      
      <h3 class="text-2xl font-bold text-gray-900 mt-8 mb-4">Právní a kulturní kontinuita</h3>
      <p>Proces nákupu je prakticky identický s Českou republikou. Katastr nemovitostí funguje na stejném principu, rezervační a kupní smlouvy mají stejnou logiku. Nečeká vás žádné vyřizování speciálních daňových čísel jako na jihu Evropy. Slovenské banky (např. VÚB, Tatra banka) navíc umí velmi flexibilně posoudit české příjmy a českou úvěrovou historii.</p>

      <div class="mt-8 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
        <h4 class="font-bold text-emerald-900 mb-2">💡 Expertní tip z trhu</h4>
        <p class="text-emerald-800 text-sm">Odpoutejte zrak od předražené Bratislavy. Skutečné "cash-flow" příležitosti leží v industriálních centrech (Žilina, Košice, Trnava). Díky masivním investicím automobilek a technologických firem je zde obrovský přetlak poptávky po korporátním ubytování pro inženýry a manažery, což žene výnosy k 5–6 % p.a.</p>
      </div>
    `,
    fourPillars: placeholderFourPillars,
  },
  "Chorvatsko": {
    heroImage:
      "https://images.pexels.com/photos/3225528/pexels-photo-3225528.jpeg?auto=compress&cs=tinysrgb&w=1920",
    subtitle:
      "Schengen, Eurozóna a prémiová transformace adriatického pobřeží.",
    marketOverview: `
      <h3 class="text-2xl font-bold text-gray-900 mt-0 mb-4">Konec levného Chorvatska: Vstup do prémiového klubu</h3>
      <p>Rok 2023 přepsal pravidla hry. Chorvatsko vstoupilo do schengenského prostoru a přijalo Euro. Z "levné destinace pro letní dovolenou" se definitivně stala prémiová evropská riviéra. Odstranění hranic a měnového rizika přilákalo institucionální investory z Německa a Rakouska, což způsobilo bezprecedentní růst hodnoty nemovitostí v první linii u moře.</p>
      
      <h3 class="text-2xl font-bold text-gray-900 mt-8 mb-4">Zákon o pobřeží a OIB</h3>
      <p>Klíčem k nákupu v Chorvatsku je získání daňového čísla <strong>OIB (Osobni identifikacijski broj)</strong>. Největším specifikem je však chorvatský stavební zákon. Výstavba v pásmu do 70 metrů od moře je dnes přísně regulována a nové projekty tam téměř nevznikají. To znamená jediné: existující vily a apartmány "první řady" se staly vzácným, neobnovitelným aktivem, jehož cena už nikdy neklesne.</p>

      <div class="mt-8 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
        <h4 class="font-bold text-emerald-900 mb-2">💡 Expertní tip z trhu</h4>
        <p class="text-emerald-800 text-sm">Rozlišujte mezi Dalmácií a Istrií. Zatímco jih trpí přísnou sezónností (květen–září), Istrie se díky blízkosti k dálniční síti EU a rozvoji gastronomie stává celoroční destinací. Pro investiční ROI je celoroční obsazenost kritická.</p>
      </div>
    `,
    fourPillars: placeholderFourPillars,
  },
  "Itálie": {
    heroImage:
      "https://images.pexels.com/photos/1701595/pexels-photo-1701595.jpeg?auto=compress&cs=tinysrgb&w=1920",
    subtitle:
      "Země dvou trhů: Alpské jistoty versus toskánský lifestyle.",
    marketOverview: `
      <h3 class="text-2xl font-bold text-gray-900 mt-0 mb-4">Mýtus domů za 1 Euro a tvrdá realita</h3>
      <p>Internet je plný virálních článků o italských vesnicích, které rozdávají domy zdarma. Jako profesionální investor musíte tuto iluzi okamžitě opustit. Italský trh se ostře dělí na bohatý sever (Lombardie, jezera, Dolomity), který funguje jako bezpečný přístav pro uložení kapitálu, a na chudší jih, kde jsou sice ceny zlomkové, ale likvidita při snaze o prodej se blíží nule.</p>
      
      <h3 class="text-2xl font-bold text-gray-900 mt-8 mb-4">Codice Fiscale a italský notář</h3>
      <p>Základním kamenem nákupu je <strong>Codice Fiscale</strong> (daňový kód). Italský systém je extrémně závislý na roli notáře (Notaio), který zde nenabízí jen ověření podpisu, ale nese plnou odpovědnost za čistotu transakce. Daňové zatížení závisí na tom, zda kupujete nemovitost jako "Prima Casa" (první domov – daň cca 2 %) nebo jako investiční "Seconda Casa" (daň 9 % z katastrální hodnoty).</p>

      <div class="mt-8 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
        <h4 class="font-bold text-emerald-900 mb-2">💡 Expertní tip z trhu</h4>
        <p class="text-emerald-800 text-sm">Absolutní zlatou žílou Itálie je momentálně oblast severních jezer (Lago di Garda, Lago di Como). Poptávka amerických a švýcarských kupců zde žene ceny raketově vzhůru. Pokud hledáte yield (výnos), zaměřte se na menší apartmány s povolením pro Airbnb v dojezdové vzdálenosti od lyžařských středisek.</p>
      </div>
    `,
    fourPillars: placeholderFourPillars,
  },
  "Saúdská Arábie": {
    heroImage:
      "https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80&cache=bust",
    subtitle:
      "Vize 2030: Otevírání bilionového trhu a příležitost desetiletí.",
    marketOverview: `
      <h3 class="text-2xl font-bold text-gray-900 mt-0 mb-4">Investujte tam, kde Dubaj byla před 20 lety</h3>
      <p>Saúdská Arábie právě prochází největší socioekonomickou transformací v historii lidstva (projekt Vision 2030). Království masivně otevírá dveře zahraničnímu kapitálu, zavádí tzv. Premium Residency (obdoba Zlatých víz) a umožňuje cizincům přímé vlastnictví prémiových nemovitostí. S absencí daně z příjmu a obrovskou vládní finanční injekcí se zde tvoří nový globální investiční hub.</p>
      
      <h3 class="text-2xl font-bold text-gray-900 mt-8 mb-4">Program HQ (Korporátní exodus)</h3>
      <p>Rijád zavedl tvrdé pravidlo: nadnárodní společnosti, které chtějí státní zakázky, musí přesunout svá regionální ředitelství (HQ) z Dubaje právě do Saúdské Arábie. Výsledek? Stovky tisíc vysoce postavených západních expatů se stěhují do Rijádu, Džiddy a NEOMu. Na trhu je absolutní nedostatek kvalitního prémiového ubytování pro tyto manažery, což vystřelilo výnosy z nájmů vysoko nad 8 % p.a.</p>

      <h3 class="text-2xl font-bold text-gray-900 mt-8 mb-4">Nákup Off-plan a Cashflow</h3>
      <p>Podobně jako v Emirátech, trh drží developerské platební plány. Zahraniční investoři využívají gigantických projektů (jako Roshn nebo Red Sea Global), kde nakupují "off-plan" byty v počátečních fázích výstavby. Potenciál kapitálového zhodnocení (Capital Appreciation) je zde aktuálně nejvyšší na světě.</p>

      <div class="mt-8 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
        <h4 class="font-bold text-emerald-900 mb-2">💡 Expertní tip z trhu</h4>
        <p class="text-emerald-800 text-sm">Zatímco megaprojekt NEOM poutá mediální pozornost, skutečné byznysové cash-flow se momentálně nachází na severu Rijádu. Kupujte v uzavřených rezidenčních komunitách (tzv. Western Compounds), za které jsou nadnárodní firmy ochotné platit astronomické roční nájmy v hotovosti předem.</p>
      </div>
    `,
    fourPillars: placeholderFourPillars,
  },
  "Bali (Indonésie)": {
    heroImage:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80&cache=bust",
    subtitle:
      "Globální hotspot s ROI 10-15 %. Ráj digitálních nomádů i tvrdý byznys.",
    marketOverview: `
      <h3 class="text-2xl font-bold text-gray-900 mt-0 mb-4">Proč Bali? Anatomie nejvyšších výnosů na světě</h3>
      <p>Zatímco evropské metropole bojují s výnosy kolem 3–4 %, Bali hraje úplně jinou ligu. Kombinace celoroční sezóny, masivního přílivu digitálních nomádů a expatů z celého světa vyhnala poptávku po prémiových vilách do extrému. Čistý roční výnos z pronájmu (Net ROI) zde standardně dosahuje <strong>10 až 15 %</strong>. Vaše investice se tak dokáže zaplatit za méně než 8 let.</p>
      
      <h3 class="text-2xl font-bold text-gray-900 mt-8 mb-4">Klíč k úspěchu: Leasehold vs. Freehold (PT PMA)</h3>
      <p>Indonéská ústava zakazuje cizincům přímo vlastnit půdu (tzv. Hak Milik / Freehold). Profesionální investoři to řeší dvěma elegantními a legálními způsoby:</p>
      <ul class="list-disc pl-6 mb-6 space-y-2 text-gray-700">
        <li><strong>Leasehold (Dlouhodobý pronájem):</strong> Kupujete právo užívat a pronajímat vilu na 25–30 let s garantovaným právem prodloužení. Jde o nejrozšířenější model. Vyžaduje mnohem nižší vstupní kapitál a díky gigantickým výnosům se vám peníze rychle vrátí. Po uplynutí doby se nemovitost vrací majiteli pozemku, vy už ale máte své peníze několikanásobně zpět.</li>
        <li><strong>Založení PT PMA (Zahraniční firma):</strong> Pokud chcete absolutní kontrolu (tzv. Hak Guna Bangunan - Právo stavby), založíte si lokální s.r.o. Tato firma může nemovitost vlastnit až na 80 let. Tento model dává smysl u investic nad 10 milionů CZK.</li>
      </ul>

      <h3 class="text-2xl font-bold text-gray-900 mt-8 mb-4">Financování: Zapomeňte na banky, hraje se v hotovosti</h3>
      <p>Indonéské banky cizincům peníze nepůjčí. Většina nákupů probíhá buď v hotovosti, nebo přes <strong>Developer Payment Plans</strong> (platíte fáze stavby tak, jak vila roste). Nejefektivnější strategií pro Čechy je americká (neúčelová) hypotéka u české banky se zástavou české nemovitosti. Získáte miliony korun za český úrok a ty pošlete do Indonésie.</p>

      <div class="mt-8 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
        <h4 class="font-bold text-emerald-900 mb-2">💡 Expertní tip z trhu</h4>
        <p class="text-emerald-800 text-sm">Vyhněte se přeplněnému centru Canggu. Chytré peníze se nyní přesouvají do oblastí jako <strong>Pererenan, Seseh, Uluwatu nebo Ubud</strong>, kde je cena pozemků stále přijatelná, ale poptávka po ubytování raketově roste.</p>
      </div>
    `,
    fourPillars: placeholderFourPillars,
  },
};

const countryNameById = Object.fromEntries(
  destinationCards.map((card) => [card.id, card.name])
) as Record<CountryId, string>;

export function getCountryHubData(countryId: CountryId): CountryHubData {
  const name = countryNameById[countryId];
  return countryHubData[name] ?? countryHubData["Španělsko"];
}

export function getCountryHubName(countryId: CountryId): string {
  return countryNameById[countryId];
}
