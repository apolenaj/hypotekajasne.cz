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
      <h3 class="text-2xl font-bold text-gray-900 mt-0 mb-4">Český trh v datech (2026)</h3>
      <p>Po korekci cen a stabilizaci sazeb se trh opět pohybuje v mírném růstovém režimu. Praha a Brno zůstávají tahouny poptávky po nájemním bydlení; některé regiony nabízejí vyšší hrubý yield, ale často i nižší likviditu. Při zadaných předpokladech může investiční byt vycházet příznivě — výsledek se mění se sazbami, neobsazeností a náklady.</p>
      
      <h3 class="text-2xl font-bold text-gray-900 mt-8 mb-4">Domácí prostředí a měnové riziko</h3>
      <p>Výhodou je známé právní prostředí a transparentní katastr. Příjmy v CZK a hypotéka v CZK snižují měnové riziko oproti zahraničním aktivům. Flexibilita refinancování vyplývá ze zákona o spotřebitelském úvěru — nejde však o záruku schválení konkrétní nabídky bankou.</p>

      <h3 class="text-2xl font-bold text-gray-900 mt-8 mb-4">Dostupnost bydlení a nájemní poptávka</h3>
      <p>ČR patří k zemím s horší dostupností vlastního bydlení (poměr cen k příjmům). To historicky podporovalo nájemní segment ve velkých městech. Poptávka ale není garantovaná: závisí na regulaci, migraci, sazbách a nové výstavbě. Modelujte i scénář delší neobsazenosti.</p>

      <div class="mt-8 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
        <h4 class="font-bold text-emerald-900 mb-2">Analytická poznámka</h4>
        <p class="text-emerald-800 text-sm">U novostaveb s prémiovou cenou často klesá hrubý výnos pod 3 %. Starší byty u dopravních uzlů mohou po rekonstrukci nabízet lepší poměr nájmu k ceně — vždy ověřte náklady, daně a likviditu lokality.</p>
      </div>
    `,
    fourPillars: {
      market:
        "Trh tažený omezenou výstavbou a poptávkou po nájmu ve velkých městech; regionální rozdíly ve výnosech i likviditě.",
      financing:
        "Vlastní bydlení: LTV obvykle do 80 % (do 36 let až 90 %). Investiční hypotéky: ČNB od 4/2026 doporučuje LTV max. 70 % a DTI 7. DTI/DSTI nejsou plošně povinné — banky je často sledují interně.",
      process:
        "Rezervační smlouva → úschova → kupní smlouva → návrh na vklad do katastru (obvykle jednotky týdnů).",
      risks:
        "Rizika: sazby, neobsazenost, regulace nájmů, pokles likvidity. Příležitost: diverzifikace v domácí měně.",
    },
  },
  "SAE (Dubaj)": {
    heroImage:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80&cache=bust",
    subtitle:
      "Bez daně z příjmu FO, dynamický development a vyšší provozní i regulatorní riziko.",
    marketOverview: `
      <h3 class="text-2xl font-bold text-gray-900 mt-0 mb-4">Dubaj: daňový režim a tržní realita</h3>
      <p>V SAE obvykle neplatíte daň z příjmu fyzických osob ani daň z kapitálových výnosů z nemovitostí — hrubý yield se proto může blížit čistému výnosu. Zároveň ale rostou service charges, volatilita nabídky (zejména off-plan) a závislost na mezinárodním kapitálu. Otázka není „zda ceny porostou“, ale jak citlivý je model na náklady a cyklus trhu.</p>
      
      <h3 class="text-2xl font-bold text-gray-900 mt-8 mb-4">Off-plan a platební plány developera</h3>
      <p>Častou formou nákupu je <strong>off-plan</strong> s bezúročným platebním plánem developera. To snižuje potřebu klasické hypotéky, ale zvyšuje riziko zpoždění výstavby, změny podmínek a likvidity při prodeji před dokončením. Historický růst hodnoty během výstavby není zárukou budoucího výsledku.</p>

      <h3 class="text-2xl font-bold text-gray-900 mt-8 mb-4">Golden Visa</h3>
      <p>Nákup nad stanovený práh (typicky od 2 000 000 AED) může kvalifikovat k dlouhodobému vízu. Jde o imigrační benefit, nikoli o investiční garanci výnosu. Podmínky se mění — vždy ověřte aktuální limity a daňovou rezidenci.</p>

      <div class="mt-8 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
        <h4 class="font-bold text-emerald-900 mb-2">Analytická poznámka</h4>
        <p class="text-emerald-800 text-sm">Service charges u luxusních věží mohou významně snížit čistý výnos. Do modelu vždy započítejte roční poplatky správy, neobsazenost a kurz AED/CZK.</p>
      </div>
    `,
    fourPillars: placeholderFourPillars,
  },
  "Španělsko": {
    heroImage:
      "https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=1920",
    subtitle:
      "Trh v EU s dostupným financováním pro nerezidenty; výnos závisí na lokalitě a regulaci pronájmů.",
    marketOverview: `
      <h3 class="text-2xl font-bold text-gray-900 mt-0 mb-4">Španělsko: stabilita práva, ne garance výnosu</h3>
      <p>Po krizi 2008 prošel trh ozdravením. Pobřežní lokality často vykazují růst cen tažený poptávkou ze severní Evropy, ale meziroční tempo se liší region od regionu. Jde o vhodný trh pro dlouhodobé držení v eurech — ne o jistotu zhodnocení.</p>
      
      <h3 class="text-2xl font-bold text-gray-900 mt-8 mb-4">Hypotéky pro nerezidenty</h3>
      <p>Na rozdíl od některých asijských trhů zde funguje klasické bankovní financování pro cizince. Typické LTV pro nerezidenty bývá nižší (často kolem 60–70 %). K ceně přičtěte daně a transakční náklady (řádově desítky procent dle typu a regionu).</p>

      <h3 class="text-2xl font-bold text-gray-900 mt-8 mb-4">Okupas a právní riziko</h3>
      <p>Riziko neoprávněného obsazení není nulové, ale liší se lokalitou a typem nemovitosti. U spravovaných apartmánů v rezidenčních komplexech bývá nižší než u dlouhodobě opuštěných objektů. Legislativa se vyvíjí — počítejte s právní due diligence, ne s absolutní jistotou.</p>

      <div class="mt-8 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
        <h4 class="font-bold text-emerald-900 mb-2">Analytická poznámka</h4>
        <p class="text-emerald-800 text-sm">Nekalkulujte ROI jen ze špičkové sezóny Airbnb. Regulace krátkodobých pronájmů se zpřísňují. Medium-term nájem (měsíce) může být stabilnější, ale často s nižším hrubým výnosem.</p>
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
      <h3 class="text-2xl font-bold text-gray-900 mt-0 mb-4">Slovensko: euro a podobné právní prostředí</h3>
      <p>Pro českého investora je Slovensko často přehlížené, ale praktické: příjmy z pronájmu v eurech snižují měnové riziko vůči CZK a právní proces je blízký domácímu. Nejde o „klenot s garantovaným výnosem“, ale o diverzifikaci v EU s nižší jazykovou bariérou.</p>
      
      <h3 class="text-2xl font-bold text-gray-900 mt-8 mb-4">Právní a bankovní kontinuita</h3>
      <p>Katastr a smluvní praxe jsou podobné ČR. Slovenské banky často umí posoudit české příjmy — schválení však závisí na individuální bonitě. Bratislava bývá dražší; regionální města mohou nabízet vyšší yield při nižší likviditě.</p>

      <div class="mt-8 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
        <h4 class="font-bold text-emerald-900 mb-2">Analytická poznámka</h4>
        <p class="text-emerald-800 text-sm">Mimo Bratislavu (např. Žilina, Košice, Trnava) může korporátní poptávka podporovat nájmy. Vždy ověřte lokalitu, správu a scénář delší neobsazenosti.</p>
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
      <h3 class="text-2xl font-bold text-gray-900 mt-0 mb-4">Chorvatsko po vstupu do Schengenu a eurozóny</h3>
      <p>Vstup do Schengenu a přijetí eura zvýšily atraktivitu trhu pro investory z EU a snížily část měnového i cestovního tření. Zároveň rostly ceny v atraktivních lokalitách. Prémiový segment u moře není „neobnovitelné aktivum, jehož cena už nikdy neklesne“ — likvidita a sezónnost zůstávají klíčovými riziky.</p>
      
      <h3 class="text-2xl font-bold text-gray-900 mt-8 mb-4">OIB a regulace pobřeží</h3>
      <p>Pro nákup je potřeba <strong>OIB</strong>. Výstavba v blízkosti moře je regulovaná, což omezuje novou nabídku v první linii — to může podporovat ceny, ale neeliminuje riziko poklesu poptávky nebo změn legislativy.</p>

      <div class="mt-8 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
        <h4 class="font-bold text-emerald-900 mb-2">Analytická poznámka</h4>
        <p class="text-emerald-800 text-sm">Rozlišujte Dalmácii a Istrii. Jih bývá sezónnější; Istrie má větší šanci na delší obsazenost. Pro ROI je kritická celoroční (ne jen letní) poptávka a náklady správy.</p>
      </div>
    `,
    fourPillars: placeholderFourPillars,
  },
  "Itálie": {
    heroImage:
      "https://images.pexels.com/photos/1701595/pexels-photo-1701595.jpeg?auto=compress&cs=tinysrgb&w=1920",
    subtitle:
      "Rozdílné regionální trhy: likvidní sever vs. levnější jih s nižší likviditou.",
    marketOverview: `
      <h3 class="text-2xl font-bold text-gray-900 mt-0 mb-4">Mýtus domů za 1 euro vs. reálná data</h3>
      <p>Virální nabídky „domů za euro“ často skrývají vysoké náklady rekonstrukce a nízkou likviditu. Sever (Lombardie, jezera, Alpy) historicky lépe drží poptávku zahraničních kupců; jih nabízí nižší ceny, ale delší dobu prodeje. Volba regionu je o riziku a likviditě, ne o jistotě výnosu.</p>
      
      <h3 class="text-2xl font-bold text-gray-900 mt-8 mb-4">Codice Fiscale a role notáře</h3>
      <p>Základem je <strong>Codice Fiscale</strong>. Notář (Notaio) má v Itálii silnou roli při převodu. Daňové zatížení se liší u Prima Casa vs. Seconda Casa — vždy modelujte transakční náklady před rozhodnutím.</p>

      <div class="mt-8 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
        <h4 class="font-bold text-emerald-900 mb-2">Analytická poznámka</h4>
        <p class="text-emerald-800 text-sm">Oblast severních jezer vykazuje silnou poptávku zahraničních kupců a vyšší ceny. U výnosových apartmánů ověřte povolení ke krátkodobému pronájmu — regulace se mění.</p>
      </div>
    `,
    fourPillars: placeholderFourPillars,
  },
  "Saúdská Arábie": {
    heroImage:
      "https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80&cache=bust",
    subtitle:
      "Vision 2030 otevírá trh cizincům; vysoký růstový potenciál i politická a realizační rizika.",
    marketOverview: `
      <h3 class="text-2xl font-bold text-gray-900 mt-0 mb-4">Saúdská Arábie: transformace, ne hotový výnos</h3>
      <p>Vision 2030 otevírá ekonomiku a rezidenční trh zahraničnímu kapitálu (včetně programů dlouhodobého pobytu). Jde o ranější fázi otevřeného trhu než Dubaj — příležitosti i rizika jsou vyšší. Absenci daně z příjmu vždy vyvažte geopolitickým, regulatorním a realizačním rizikem projektů.</p>
      
      <h3 class="text-2xl font-bold text-gray-900 mt-8 mb-4">Program HQ a poptávka expatů</h3>
      <p>Přesun regionálních ředitelství do Rijádu zvyšuje poptávku po kvalitním bydlení. To může podporovat nájmy, ale nabídka se také rozšiřuje. Výnosy nad 8 % p.a. jsou možné v některých segmentech — nejsou však zaručené a vyžadují pečlivý výběr lokality a správy.</p>

      <h3 class="text-2xl font-bold text-gray-900 mt-8 mb-4">Off-plan a cash-flow</h3>
      <p>Developerské platební plány snižují vstupní hotovost, ale přenášejí riziko výstavby a termínů na kupujícího. Kapitálové zhodnocení v rané fázi projektu je spekulativní složka modelu.</p>

      <div class="mt-8 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
        <h4 class="font-bold text-emerald-900 mb-2">Analytická poznámka</h4>
        <p class="text-emerald-800 text-sm">Mediální projekty (např. NEOM) nemusí být nejlikvidnějším cash-flow. U rezidenčních komunit ověřte smlouvu o správě, typ nájemců a měnové riziko SAR.</p>
      </div>
    `,
    fourPillars: placeholderFourPillars,
  },
  "Bali (Indonésie)": {
    heroImage:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80&cache=bust",
    subtitle:
      "Vysoké modelové výnosy z short-term pronájmu; leasehold legislativa a provozní riziko.",
    marketOverview: `
      <h3 class="text-2xl font-bold text-gray-900 mt-0 mb-4">Bali: vysoký yield, vysoká citlivost modelu</h3>
      <p>Hrubé výnosy 10–15 % se v marketingu často objevují u dobře spravovaných vil. Reálně závisí na obsazenosti, sezóně, správcovských poplatcích a stavu leaseholdu. Návratnost „do 8 let“ platí jen při udržení předpokladů — ne jako garance.</p>
      
      <h3 class="text-2xl font-bold text-gray-900 mt-8 mb-4">Leasehold vs. struktura přes PT PMA</h3>
      <p>Cizinci obvykle nemohou přímo vlastnit půdu (Hak Milik). Časté jsou:</p>
      <ul class="list-disc pl-6 mb-6 space-y-2 text-gray-700">
        <li><strong>Leasehold:</strong> právo užívání na desítky let, často s možností prodloužení — smluvní podmínky a právní čistota jsou kritické. Po skončení leaseholdu právo zaniká.</li>
        <li><strong>PT PMA:</strong> zahraniční firma s právem stavby (HGB) na delší horizont; vyšší náklady založení a compliance. Vhodné spíše u větších investic.</li>
      </ul>

      <h3 class="text-2xl font-bold text-gray-900 mt-8 mb-4">Financování</h3>
      <p>Lokální banky cizincům typicky nepůjčí. Častá je hotovost, developer plán, nebo neúčelový úvěr v ČR se zástavou české nemovitosti. Měnové riziko IDR/USD/CZK a právní riziko leaseholdu patří do každého modelu.</p>

      <div class="mt-8 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
        <h4 class="font-bold text-emerald-900 mb-2">Analytická poznámka</h4>
        <p class="text-emerald-800 text-sm">Canggu je saturovanější; novější lokality mohou mít nižší vstupní cenu, ale i vyšší nejistotu poptávky. Due diligence titulu a délky leaseholdu je povinný krok.</p>
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
  const data = name ? countryHubData[name] : undefined;
  if (!data) {
    throw new Error(
      `Missing hub data for countryId=${countryId} (name=${name ?? "unknown"}). Cross-country fallback is forbidden.`
    );
  }
  return data;
}

export function getCountryHubName(countryId: CountryId): string {
  return countryNameById[countryId];
}
