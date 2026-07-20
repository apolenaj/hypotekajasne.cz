export type DeepAnalysisIcon =
  | "PiggyBank"
  | "TrendingUp"
  | "ShieldAlert"
  | "Building";

export interface DeepAnalysisSection {
  icon: DeepAnalysisIcon;
  title: string;
  content: string;
}

export interface BuyVsRentDeepAnalysis {
  title: string;
  intro: string;
  sections: DeepAnalysisSection[];
  thumbRule: string;
}

export const DEFAULT_THUMB_RULE =
  "Pokud je váš časový horizont v dané lokalitě kratší než 5 let, transakční náklady (daně, provize, úroky) často převýší zisk z růstu ceny a nájem bývá za daných předpokladů výhodnější. Při horizontu 10+ let může vlastnictví díky pákovému efektu a budování equity vycházet příznivěji — výsledek se však mění podle sazeb, ceny, nájmu, měny a nákladů. Nemovitosti nesou rizika včetně neobsazenosti, legislativních změn a kurzových výkyvů.";

export const buyVsRentDeepAnalysis: Record<string, BuyVsRentDeepAnalysis> = {
  "Česká republika": {
    title: "Koupě vs. nájem v ČR: co říkají dlouhodobá data",
    intro:
      "Při prostém srovnání měsíčních nákladů může nájem často působit výhodněji. Rozdíl ale závisí na horizontu, sazbách a růstu cen — nejde o univerzální doporučení, ale o model za zadaných předpokladů.",
    sections: [
      {
        icon: "PiggyBank",
        title: "1. Splátka vs. nájem: struktura cash-flow",
        content:
          "Nájem je provozní náklad. Hypoteční splátka se dělí na úrok a jistinu — část platby tedy snižuje zůstatek dluhu. To neznamená automatický zisk: likvidita je nižší, transakční náklady vyšší a výsledek závisí na vývoji sazeb i ceny nemovitosti.",
      },
      {
        icon: "TrendingUp",
        title: "2. Pákový efekt (Leverage) — příležitost i riziko",
        content:
          "Při koupi nemovitosti za 5 000 000 Kč s 20% akontací kontrolujete aktivum v plné hodnotě. Růst trhu o 5 % pak ovlivní celou cenu, ne jen vlastní kapitál. Stejná páka ale funguje i dolů: pokles cen nebo vyšší sazby mohou model výrazně zhoršit. Nájemce se růstu kapitálu neúčastní, ale nese nižší fixní riziko.",
      },
      {
        icon: "ShieldAlert",
        title: "3. Ochrana proti inflaci (Hedge)",
        content:
          "V prostředí s kladnou inflací se kupní síla hotovosti a fixního dluhu vyvíjí odlišně. Nájemné často historicky rostlo spolu s cenovou hladinou, ale nejde o zákon — záleží na lokalitě, kontraktech a cyklu. Hypotéka s fixací může reálně zlevnit splátku vůči mzdám, pokud mzdy rostou; není to záruka.",
      },
      {
        icon: "Building",
        title: "4. Kolaterál, škálování a únikové varianty",
        content:
          "Vlastnictví otevírá dveře k dalšímu financování. Splacená část nemovitosti může sloužit jako ručení (zástava) pro nákup další, investiční nemovitosti bez nutnosti šetřit novou hotovost. Zároveň poskytuje životní flexibilitu – pokud se potřebujete přestěhovat, nemovitost lze pronajmout a příjmem pokrýt původní hypotéku, zatímco vy si najmete bydlení jinde, nebo zisk z prodeje reinvestujete.",
      },
    ],
    thumbRule: DEFAULT_THUMB_RULE,
  },
  "SAE (Dubaj)": {
    title: "Dubaj: Když daňová nulová zóna mění pravidla hry",
    intro:
      "V SAE lineární srovnání nákladů nepostihuje klíčové výhody vlastnictví — nulovou daň z příjmu, vysoký capital appreciation a možnost pronájmu v AED. Nájem dává smysl pro expaty s krátkým horizontem, koupě pro ty, kdo chtějí kapitál pracovat bez daně.",
    sections: [
      {
        icon: "PiggyBank",
        title: "1. Equity bez daně z kapitálového zisku",
        content:
          "Každá splátka hypotéky nebo developer payment planu buduje podíl na freehold aktivu. Na rozdíl od ČR zde neplatíte daň z příjmu z pronájmu ani z prodeje (při splnění podmínek). Nájem je čistý výdaj bez návratnosti; vlastnictví převádí měsíční cash-flow do aktiva, které lze kdykoli prodat nebo refinancovat.",
      },
      {
        icon: "TrendingUp",
        title: "2. Leverage v trhu s vysokým růstem",
        content:
          "Při nákupu bytu za 2,5 mil. AED s 40% akontací (1 mil. AED) ovládáte celé aktivum. Historický růst cen v top lokalitách překračuje 5–8 % ročně — na váš vložený kapitál to znamená násobné zhodnocení. Nájemce v Dubaji platí prémiové roční částky (často 1–4 šeky dopředu) bez podílu na růstu.",
      },
      {
        icon: "ShieldAlert",
        title: "3. AED jako hedge a fixní splátka",
        content:
          "Dirham je navázaný na USD, což chrání před volatilitou lokálních měn. Fixní splátka hypotéky v AED při růstu nájmů a servisních poplatků znamená, že náklady vlastnictví jsou předvídatelnější než roční obnova nájemní smlouvy s 5–10% navýšením.",
      },
      {
        icon: "Building",
        title: "4. Equity release a portfolio v SAE",
        content:
          "Vlastněná nemovitost s title deed lze použít jako kolaterál pro další nákup (equity release u Emirates NBD a dalších). Pro investory z ČR navíc otevírá cestu k americké hypotéce se zástavou v domovině — vlastnictví v Dubaji a v ČR lze strategicky kombinovat.",
      },
    ],
    thumbRule:
      "V Dubaji platí: horizont pod 5 let → nájem (mobilita, žádné DLD poplatky 4 %). Horizont 10+ let nebo investiční záměr → koupě s využitím pákového efektu a nulové daně. Servisní poplatky (service charges) započítejte do ročního TCO.",
  },
  "Španělsko": {
    title: "Španělsko: Druhý domov vs. matematika ITP daně",
    intro:
      "Španělský trh láká nižšími úroky v EUR a životním stylem. Lineární graf nákladů ale ignoruje jednorázovou ITP daň (6–10 %), náklady na správu na dálku a sezónní výnos z pronájmu — klíčové faktory pro správné rozhodnutí.",
    sections: [
      {
        icon: "PiggyBank",
        title: "1. Budování equity v eurech",
        content:
          "Splátka španělské hypotéky buduje vlastní kapitál v měně, ve které případný nájem z pobřežní vily také plyne. Nájemce platí majiteli za užívání; vlastník každým rokem splácení snižuje dluh vůči bance a zvyšuje čistou hodnotu majetku (equity).",
      },
      {
        icon: "TrendingUp",
        title: "2. Leverage na pobřeží Costa del Sol",
        content:
          "Při koupi za 350 000 EUR s 30% akontací (105 000 EUR) kontrolujete celé aktivum. Růst cen na pobřeží historicky 3–6 % ročně znamená na váš kapitál dvojnásobný efekt. Krátkodobý nájem v sezóně může pokrýt část splátek — nájemce tuto páku nemá.",
      },
      {
        icon: "ShieldAlert",
        title: "3. Inflace a EURIBOR — dvě strany mince",
        content:
          "Fixní sazba chrání před růstem EURIBORu; variabilní hypotéka naopak. Nájemné na španělském pobřeží roste s turistickou poptávkou rychleji než inflace v eurozóně. Vlastnictví s fixní sazbou vám dává cost certainty na desítky let.",
      },
      {
        icon: "Building",
        title: "4. Zástava české nemovitosti pro španělský nákup",
        content:
          "Mnoho Čechů volí americkou hypotéku v CZK se zástavou doma a ve Španělsku jedná jako cash-buyer. Vlastnictví v ČR tak slouží jako kolaterál pro španělské portfolio — nájemní strategie bez vlastního majetku tuto možnost vylučuje.",
      },
    ],
    thumbRule:
      "Španělsko: užívání do 6 týdnů ročně → nájem. Trvalé vlastnictví nebo pronájem 20+ týdnů v sezóně s horizontem 10+ let → koupě. ITP a poplatky notáře (cca 10–12 % celkem) amortizujte přes čas, ne přes jeden rok.",
  },
  "Itálie": {
    title: "Itálie: Renovace, historie a dlouhý horizont equity",
    intro:
      "Italský trh odměňuje trpělivost. Zdánlivě levný nájem v centru Florencie nebo Říma nezohledňuje zhodnocení po rekonstrukci, omezenou nabídku a dlouhodobý build-up equity v eurech.",
    sections: [
      {
        icon: "PiggyBank",
        title: "1. Equity skrytá v rekonstrukci",
        content:
          "Koupě starší nemovitosti s následnou renovací je v Itálii klasická cesta k equity. Nájem je čistý odtok; vlastnictví umožňuje vložit kapitál do assetu, jehož hodnota po rekonstrukci často převyšuje součet nákupu a oprav.",
      },
      {
        icon: "TrendingUp",
        title: "2. Leverage v turistických centrech",
        content:
          "Při koupi za 400 000 EUR s 25% akontací růst hodnoty o 4 % ročně představuje 16 000 EUR na celém aktivu — ale 64 % návrat na váš vložený kapitál v prvním roce. Krátkodobý pronájem v historických centrech doplňuje cash-flow.",
      },
      {
        icon: "ShieldAlert",
        title: "3. IMU a inflace: nájem roste, dluh ne",
        content:
          "Vlastníci platí IMU z nemovitosti, nájemci ne — ale nájemci nesou riziko skokového zvýšení nájmu při obnově smlouvy. Fixní hypotéka v EUR při inflaci v Itálii historicky snižuje reálnou hodnotu dluhu, zatímco nájemné ji kopíruje.",
      },
      {
        icon: "Building",
        title: "4. Kolaterál pro další italské nebo české investice",
        content:
          "Zástava nemovitosti (v Itálii nebo přes českou americkou hypotéku) umožňuje škálovat portfolio. Vlastník může po předání pronajmout a financovat další jednotku; nájemce nemá tuto finanční páku.",
      },
    ],
    thumbRule:
      "Itálie: horizont pod 7 let nebo bez plánu renovace → nájem. Kupě s renovací a pronájmem 10+ let → vlastnictví. Zapněte do modelu IMU, právní due diligence a stavební omezení (vincolo).",
  },
  "Chorvatsko": {
    title: "Chorvatsko: Sezónní yield vs. celoroční náklady vlastnictví",
    intro:
      "Chorvatsko je paradigma sezónního investičního myšlení. Graf lineárních nákladů neukáže, že 3 měsíce vysokého nájmu v létě může pokrýt celoroční hypotéku — ani že nájemce z tohoto yieldu nemá podíl.",
    sections: [
      {
        icon: "PiggyBank",
        title: "1. Equity z apartmánu u moře",
        content:
          "Vlastník buduje kapitál v eurech na rostoucím pobřežním trhu. Nájem je výdaj bez návratnosti. Při silném obsazení v červenci–září příjmy z Airbnb mohou převýšit roční splátku — ale pouze vlastník, ne nájemce.",
      },
      {
        icon: "TrendingUp",
        title: "2. Leverage a turistický růst",
        content:
          "Nákup za 300 000 EUR s 20% akontací při růstu cen a silném yieldu z krátkodobého pronájmu (5–7 %) dává pákový efekt na celý trh. Nájemce platí prémiové letní sazby bez účasti na růstu hodnoty nemovitosti.",
      },
      {
        icon: "ShieldAlert",
        title: "3. Euro a sezónní inflace nájmů",
        content:
          "Od přijetí eura je měnové riziko minimální. Letní nájmy na Jadranu rostou rychleji než celoroční — fixní hypotéka vám dává stabilní nákladovou bázi, zatímco nájemce čelí ročnímu přecenění.",
      },
      {
        icon: "Building",
        title: "4. Správa na dálku a refinancování",
        content:
          "Vlastnictví umožňuje profesionální správu mimo sezónu a později refinancování pro další jednotku. Český investor může použít zástavu doma pro chorvatský nákup v hotovosti — nájemní strategie tuto páku neumožňuje.",
      },
    ],
    thumbRule:
      "Chorvatsko: osobní dovolená 2–3 měsíce → nájem. Investiční pronájem s obsazeností 20+ týdnů a horizontem 8+ let → koupě. Regulace krátkodobého pronájmu v centrech měst sledujte průběžně.",
  },
  "Bali (Indonésie)": {
    title: "Bali: Leasehold, extrémní yield a hotovostní koupě",
    intro:
      "Na Bali nelze srovnávat koupě a nájem čistě přes hypotéku — cizinci financují hotovostí. Hloubková analýza proto stojí na leasehold equity, extrémním ROI z pronájmu a legislativní struktuře (PT PMA).",
    sections: [
      {
        icon: "PiggyBank",
        title: "1. Equity v leasehold struktuře",
        content:
          "Vlastnictví přes leasehold (25–30 let) nebo PT PMA buduje podíl na výnosném aktivu. Nájem u luxusní vily v Canggu nebo Ubudu je čistý náklad. Pronájem vil s yieldem 10–15 % může splátky developer plánu nebo návratnost kapitálu pokrýt během několika let.",
      },
      {
        icon: "TrendingUp",
        title: "2. Leverage bez banky — cash a fáze",
        content:
          "Bez lokální hypotéky je leverage omezený, ale nákup za 350 000 USD s fázovanými platbami developerovi stále znamená kontrolu nad aktivem s vysokým růstem cen a obsazenosti. Nájemce neparticipuje na capital appreciation ani na cash-flow z pronájmu.",
      },
      {
        icon: "ShieldAlert",
        title: "3. IDR, USD a inflace na rozvíjejícím se trhu",
        content:
          "Transakce často v USD nebo IDR. Vlastnictví fixuje nákladovou bázi v době nákupu; nájemné v top lokalitách roste s expat poptávkou rychleji než lokální inflace. Dlouhodobý nájem bez equity je expozicí vůči těmto skokům.",
      },
      {
        icon: "Building",
        title: "4. PT PMA a škálování portfolia",
        content:
          "Vlastnictví přes PT PMA otevírá cestu k dalším vilám a legálnímu pronájmu. Český investor často financuje z americké hypotéky doma. Nájemní model tuto strukturu a kolaterál nenabízí.",
      },
    ],
    thumbRule:
      "Bali: dlouhodobý pobyt digitálního nomáda bez investičního záměru → nájem. Hotovostní koupě s pronájmem a horizontem 7+ let → vlastnictví. Vždy ověřte leasehold délku a PT PMA náklady.",
  },
  "Saúdská Arábie": {
    title: "SAE: Emerging market — spekulace vs. expat nájem",
    intro:
      "Saúdská Arábie je trh v definici. Lineární náklady neodhalí potenciál giga-projektů ani riziko předčasného vstupu. Analýza equity a leverage zde musí počítat s kratší historií a vyšší nejistotou.",
    sections: [
      {
        icon: "PiggyBank",
        title: "1. Equity v giga-projektech",
        content:
          "Vlastnictví v Rijádu nebo projektech jako NEOM buduje podíl na trhu, který teprve vzniká. Nájem je standardní volba expatů na 2–3leté kontrakty — čistý výdaj bez účasti na případném růstu hodnoty.",
      },
      {
        icon: "TrendingUp",
        title: "2. Leverage a SAR (USD peg)",
        content:
          "Hypotéky pro kvalifikované kupce umožňují páku na aktivum v SAR navázaném na USD. Konzervativní scénář růstu v nových čtvrtích může násobit návratnost vloženého kapitálu — nájemce z toho nemá benefit.",
      },
      {
        icon: "ShieldAlert",
        title: "3. Inflace a roční nájmy v prémiových čtvrtích",
        content:
          "V prémiových projektech se často platí ročně dopředu. Vlastnictví s fixní splátkou hypotéky stabilizuje náklady; nájemní smlouvy reflektují poptávku expatů a mohou skokově růst při obnově.",
      },
      {
        icon: "Building",
        title: "4. Kolaterál a diversifikace regionu",
        content:
          "Vlastnictví v SAE může být součástí broader GCC strategie spolu s Dubají. Refinancování a zástava jsou možné u etablovaných bank (Al Rajhi, SNB). Nájemní strategie nebuduje kolaterál pro další expanzi.",
      },
    ],
    thumbRule:
      "SAE: expat na krátký kontrakt → nájem. Dlouhodobá spekulace na růst nových čtvrtí s akceptací rizika → koupě. Break-even datově nejistý — počítejte horizont 12+ let.",
  },
  "Slovensko": {
    title: "Slovensko: Nižší vstupní cena, podobná mechanika jako v ČR",
    intro:
      "Slovenský trh nabízí nižší vstupní bariéru než Praha nebo Brno. Stejně jako v ČR platí, že nájem vypadá levněji na první pohled — dokud nezapočítáte equity, páku a inflační hedge fixní hypotéky.",
    sections: [
      {
        icon: "PiggyBank",
        title: "1. Budování equity v EUR",
        content:
          "Splátka hypotéky na byt v Bratislavě nebo v Tatrách buduje vlastní kapitál v eurech. Nájem je nenávratný. Pro českého investora je SR blízký trh se snadnou správou — equity zůstává v podobné měnové zóně.",
      },
      {
        icon: "TrendingUp",
        title: "2. Leverage při nižší ceně nemovitosti",
        content:
          "Nákup za 220 000 EUR s 20% akontací (44 000 EUR) při růstu 4–5 % ročně dává na malý kapitál disproporčně vysoký procentní výnos. Nájemce v Bratislavě platí rostoucí nájmy bez podílu na zhodnocení.",
      },
      {
        icon: "ShieldAlert",
        title: "3. Inflace a fixní sazba v eurozóně",
        content:
          "Fixní hypotéka v EUR chrání před růstem nájmů, které v Bratislavě kopírují silnou poptávku. Reálná hodnota dluhu klesá s inflací v eurozóně — nájemní smlouva tuto výhodu vlastníkovi nepřenáší na nájemce, ale nájemce ji nemá vůbec.",
      },
      {
        icon: "Building",
        title: "4. Kolaterál pro české a slovenské portfolio",
        content:
          "Vlastnictví na SR lze kombinovat se zástavou v ČR pro další nákupy. Pronájem nemovitosti pokrývá splátky při přestěhování. Nájemní model neumožňuje refinancování ani škálování bez vlastního majetku.",
      },
    ],
    thumbRule:
      "Slovensko: horizont pod 5 let nebo testování lokality → nájem. Vlastnictví s horizontem 8+ let a případným pronájmem → koupě. Nižší ceny zkracují break-even oproti ČR.",
  },
};
