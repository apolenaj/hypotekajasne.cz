import type { PracticeGuide } from "@/lib/academy/practice/types";
import { routes } from "@/lib/routes";

const civilCodeSource = {
  label: "e-Sbírka — zákon č. 89/2012 Sb., občanský zákoník",
  url: "https://www.e-sbirka.cz/sb/2012/89",
  notes: "Pravidla spoluvlastnictví, společného jmění, závazků a dědění.",
};

const creditActSource = {
  label: "e-Sbírka — zákon č. 257/2016 Sb., o spotřebitelském úvěru",
  url: "https://www.e-sbirka.cz/sb/2016/257",
  notes: "Práva a povinnosti u spotřebitelského úvěru na bydlení.",
};

export const hypotekaRozchodRozvodGuide = {
  slug: "hypoteka-rozchod-rozvod",
  title: "Hypotéka při rozchodu, rozvodu a úmrtí",
  cardBlurb:
    "Co se stane s dluhem a nemovitostí a proč dohoda mezi partnery sama nestačí vůči bance.",
  sampleQuestions: [
    "Může jeden partner převzít hypotéku?",
    "Jak funguje vyvázání spoludlužníka?",
    "Co když druhý přestane platit?",
  ],
  tags: ["rodina"],
  icon: "users",
  relatedLessonSlugs: [],
  cta: { label: "Projít praktické situace", href: routes.pruvodce.praktickeSituace },
  answers: [
    {
      id: "nesezdani",
      question: "Co platí pro hypotéku nesezdaného páru?",
      directAnswer:
        "U nesezdaného páru nevzniká společné jmění manželů. Vlastnictví nemovitosti určuje zápis v katastru a nabývací smlouva, zatímco odpovědnost za hypotéku určuje úvěrová smlouva. Partner může být spoluvlastníkem bez postavení dlužníka nebo dlužníkem bez odpovídajícího vlastnického podílu; tato dvě postavení se nesmějí zaměňovat.",
      explanation:
        "Před koupí si písemně nastavte podíly, zdroje vlastních peněz, rozdělení splátek, investice do rekonstrukce a postup při rozchodu, prodeji či úmrtí. Dohoda mezi vámi však nemění práva banky. Pokud jste oba spoludlužníci, banka může podle smlouvy požadovat plnění bez ohledu na interní poměr. Změna vlastníka nebo dlužníka obvykle vyžaduje souhlas banky. Individuální dohodu nechte připravit právníkem a slaďte ji s úvěrovou i zástavní dokumentací.",
      example:
        "Jeden partner vloží většinu vlastních prostředků, ale v katastru jsou podíly stejné a splátky odcházejí z účtu druhého. Bez předchozí dohody se později obtížně dokazuje, co mělo být darem, vkladem nebo půjčkou.",
      commonMistake:
        "Předpokládat, že placení poloviny splátek automaticky vytváří poloviční vlastnický podíl.",
      nextStep: { label: "Probrat konkrétní uspořádání", href: routes.kontakt },
      sources: [civilCodeSource],
      searchTerms: ["nesezdaný pár", "spoluvlastnictví", "hypotéka partnerů"],
    },
    {
      id: "podil-vs-zavazek",
      question: "Jaký je rozdíl mezi podílem na nemovitosti a závazkem z hypotéky?",
      directAnswer:
        "Vlastnický podíl říká, jaká část nemovitosti vám právně patří. Závazek z hypotéky říká, kdo a v jakém rozsahu dluží bance. Zástavní právo je třetí vrstva: umožňuje bance uspokojit dluh ze zastavené nemovitosti. Tyto vztahy mohou mít odlišné osoby i poměry.",
      explanation:
        "Katastrální výpis neukazuje kompletní osobní dluh a úvěrová smlouva sama neurčuje vlastnické podíly. Při rozchodu proto pracujte současně s listem vlastnictví, kupní či darovací smlouvou, úvěrovou smlouvou a dohodami mezi partnery. Převod podílu bez řešení úvěru může ponechat převodce jako dlužníka. Naopak vyvázání z úvěru bez převodu podílu může ponechat spoluvlastnictví. Banka obvykle musí schválit změnu, která zasahuje její dlužníky nebo zajištění.",
      example:
        "Partner převede svůj podíl na druhého, ale banka jej nevyváže z úvěru. Už nemá nemovitost, přesto může dál odpovídat za celý dluh podle úvěrové smlouvy.",
      commonMistake:
        "Podepsat převod vlastnictví a považovat tím bankovní závazek za automaticky ukončený.",
      nextStep: { label: "Zmapovat praktické možnosti", href: routes.pruvodce.praktickeSituace },
      sources: [civilCodeSource],
      vizId: "divorce-options",
      searchTerms: ["vlastnický podíl", "dlužník", "zástavní právo", "katastr"],
    },
    {
      id: "solidarni-dluh",
      question: "Co znamená, že jsme solidární spoludlužníci?",
      directAnswer:
        "U solidárního dluhu může banka požadovat celé splnění po kterémkoli ze spoludlužníků, nikoli jen jeho „polovinu“. Interní dohoda, že každý platí část, omezuje vztah mezi partnery, ne nárok banky. Kdo zaplatí více, může mít vůči druhému vypořádací nárok, jeho vymahatelnost je však samostatná otázka.",
      explanation:
        "Rozchod ani odstěhování solidaritu neruší. Dokud banka písemně nepotvrdí vyvázání nebo není úvěr splacen, oba zůstávají v režimu smlouvy a prodlení může zasáhnout oba. Nastavte dočasný způsob úhrad, přístup k výpisům a termín konečného řešení. Evidujte všechny platby, náklady na nemovitost a její užívání. Při sporu řešte právní radu včas; přestat platit jako forma nátlaku obvykle zhorší pozici obou a ohrozí zástavu.",
      example:
        "Jeden partner přestane posílat dohodnutou polovinu. Druhý může muset bance zaplatit celou splátku, aby zabránil prodlení, a teprve následně řešit vzájemné vypořádání.",
      commonMistake:
        "Poslat bance jen svou polovinu a očekávat, že zbytek bude výhradně problém bývalého partnera.",
      nextStep: { label: "Řešit dohodu dříve", href: routes.kontakt },
      sources: [civilCodeSource],
      searchTerms: ["solidární dluh", "spoludlužník", "celá splátka", "regres"],
    },
    {
      id: "sjm",
      question: "Jak hypotéku ovlivňuje společné jmění manželů?",
      directAnswer:
        "U manželů je třeba oddělit rozsah společného jmění, osobní závazky vůči bance a zástavu. Nemovitost i dluh mohou za splnění zákonných podmínek spadat do SJM, ale konkrétní výsledek závisí na době a způsobu nabytí, smluvním režimu manželů, účelu dluhu a bankovní dokumentaci.",
      explanation:
        "Rozsah SJM může měnit předmanželská či manželská smlouva nebo rozhodnutí soudu. Banka se řídí úvěrovou smlouvou a právními pravidly ochrany věřitele; rozsudek o rozvodu sám nevyváže dlužníka. Při vypořádání se oceňuje majetek i závazky a řeší se vnosy, ale dohoda mezi manžely nemusí být vůči bance účinná bez jejího souhlasu. Shromážděte nabývací tituly, smlouvy o režimu SJM, výpis úvěru a doklady o zdrojích financování.",
      example:
        "Manželé se dohodnou, že dům i hypotéku převezme jeden z nich. Mezi nimi může dohoda upravit vypořádání, ale pro banku zůstávají dlužníci stejní, dokud změnu neschválí.",
      commonMistake:
        "Považovat rozsudek o rozvodu nebo dohodu o SJM za automatický souhlas banky s převzetím dluhu.",
      nextStep: { label: "Projít varianty vypořádání", href: routes.pruvodce.praktickeSituace },
      sources: [civilCodeSource],
      vizId: "divorce-options",
      searchTerms: ["SJM", "společné jmění", "rozvod", "vypořádání"],
    },
    {
      id: "prevzeti",
      question: "Může jeden partner převzít nemovitost i hypotéku?",
      directAnswer:
        "Může, pokud se partneři dohodnou a banka schválí, že zbývající dlužník zvládne úvěr sám. Banka znovu posoudí jeho příjem, výdaje, další závazky, hodnotu zástavy a případné vyplacení druhého partnera. Bez souhlasu banky lze upravit vlastnictví, ale nelze jednostranně přepsat osobní dluh.",
      explanation:
        "Nechte si nejprve předběžně posoudit bonitu a vyčíslete majetkové vyrovnání. Vyplacení partnera může vyžadovat navýšení úvěru, což zvyšuje LTV i splátku a podléhá novému schválení. Připravte návrh převodní či vypořádací smlouvy, odhad, příjmové doklady a návaznost podání na katastr. Peníze a podpisy koordinujte přes bezpečný mechanismus, aby nikdo nepřevedl podíl bez jistoty vyplacení nebo vyvázání.",
      example:
        "Zůstatek hypotéky je nižší než hodnota domu, ale partner nemá hotovost na vypořádání. Banka posoudí, zda může úvěr navýšit a zda příjem jednoho dlužníka unese novou splátku.",
      commonMistake:
        "Dohodnout částku k vyplacení dříve, než banka prověří samostatnou bonitu a možné navýšení.",
      nextStep: { label: "Prověřit možnost převzetí", href: routes.kontakt },
      sources: [civilCodeSource, creditActSource],
      vizId: "divorce-options",
      searchTerms: ["převzetí hypotéky", "vyplacení partnera", "bonita", "navýšení"],
    },
    {
      id: "vyvazani",
      question: "Jak probíhá vyvázání spoludlužníka?",
      directAnswer:
        "Vyvázání je změna úvěrové smlouvy, kterou musí banka schválit. Zbývající dlužník doloží schopnost splácet sám; banka může požadovat nové ocenění, dokumenty k vlastnictví a návrh vypořádání. Spoludlužník je skutečně volný až po účinnosti bankovního dodatku, nikoli po ústní dohodě nebo podání na katastr.",
      explanation:
        "Postupujte v pořadí, které banka a právník sladí: předběžné posouzení, dohoda o hodnotě a vyplacení, schválení banky, podpis bankovních i převodních dokumentů a zápisy v katastru. Ověřte podmínky čerpání případného navýšení a okamžik, kdy se mění vlastnictví a odpovědnost. Pokud banka vyvázání neschválí, zvažte refinancování jedním partnerem, prodej nebo dočasnou dohodu s jasným termínem. Dočasná dohoda však solidaritu vůči bance neruší.",
      example:
        "Partner už v bytě nebydlí a druhý platí všechny splátky. Dokud banka nepodepíše dodatek, odstěhovaný partner zůstává dlužníkem a závazek mu může ovlivňovat další financování.",
      commonMistake:
        "Spoléhat na e-mail partnera, že úvěr přebírá, místo na účinný dodatek podepsaný bankou.",
      nextStep: { label: "Naplánovat vyvázání", href: routes.kontakt },
      sources: [civilCodeSource],
      searchTerms: ["vyvázání spoludlužníka", "dodatek", "samostatná bonita"],
    },
    {
      id: "prodej",
      question: "Jak prodat nemovitost zatíženou společnou hypotékou?",
      directAnswer:
        "Prodej je možný, ale musí se koordinovat kupní smlouva, banka, úschova, splacení úvěru a výmaz zástavy. Nejdřív si vyžádejte bankovní vyčíslení k plánovanému datu a podmínky pro vydání souhlasu s výmazem. Teprve podle nich nastavte tok kupní ceny a termíny.",
      explanation:
        "Kupní cena obvykle míří do úschovy, z níž se část použije na splacení banky a zbytek se uvolní prodávajícím po splnění podmínek. Ověřte případnou náhradu nákladů za předčasné splacení podle právního režimu a skutečného vyčíslení banky; zákonný limit není automatická účtovaná částka. Partneři si musí určit, jak rozdělí čistý výnos po splacení dluhu, daních a nákladech. Spor o rozdělení řešte dříve, než se zavážete kupujícímu k termínům.",
      example:
        "Kupující financuje nákup vlastní hypotékou. Jeho banka, vaše banka a úschova potřebují navazující dokumenty a pořadí zástav, takže jednoduchý převod celé ceny přímo prodávajícím není vhodný.",
      commonMistake:
        "Podepsat krátký termín předání bez předchozího vyčíslení a bez koordinace dvou bank.",
      nextStep: { label: "Připravit bezpečný postup", href: routes.kontakt },
      sources: [creditActSource, civilCodeSource],
      vizId: "divorce-options",
      searchTerms: ["prodej s hypotékou", "výmaz zástavy", "úschova", "vyčíslení"],
    },
    {
      id: "neplaceni",
      question: "Co když bývalý partner přestane splácet?",
      directAnswer:
        "Pokud jste vůči bance spoludlužníci, chybějící platbu řešte okamžitě, i když ji měl podle vaší dohody poslat druhý. Prodlení může zvýšit náklady, poškodit úvěrovou historii obou a ohrozit zastavenou nemovitost. Kontaktujte banku před splatností nebo ihned po zjištění problému a současně dokumentujte porušení dohody.",
      explanation:
        "Zjistěte přesnou dlužnou částku, datum a možnosti nápravy. Pokud můžete, zabraňte eskalaci úhradou bance, aniž byste tím opustili případný nárok vůči partnerovi; právní dopad konzultujte. Navrhněte konečné řešení: vyvázání, refinancování, prodej nebo soudní vypořádání. Nesnažte se spor vyrovnat zadržováním jiné splátky. Pokud hrozí násilí nebo zneužití přístupu k účtům, prioritou je bezpečí, oddělení oprávnění a odborná pomoc.",
      example:
        "Splátka odejde ze společného účtu, ale partner na něj nepřevede svůj díl. Bance je splátka uhrazena; mezi partnery vzniká spor o vyrovnání, který je třeba evidovat a řešit odděleně.",
      commonMistake:
        "Ignorovat výzvy banky s argumentem, že podle rozvodové dohody měl platit někdo jiný.",
      nextStep: { label: "Řešit prodlení včas", href: routes.kontakt },
      sources: [civilCodeSource],
      searchTerms: ["neplacení hypotéky", "bývalý partner", "prodlení", "spoludlužník"],
    },
    {
      id: "umrti",
      question: "Co se stane s hypotékou při úmrtí partnera?",
      directAnswer:
        "Úmrtím hypotéka automaticky nezaniká. Dluh a vlastnictví se řeší v dědickém řízení, zatímco přeživší spoludlužník zůstává vázán úvěrovou smlouvou. Banku a případnou pojišťovnu informujte bez odkladu a pokračujte v dohodnutých splátkách, pokud banka písemně neurčí jiný postup.",
      explanation:
        "Notáři doložte smlouvy, zůstatek úvěru, vlastnictví a případné životní pojištění. U nesezdaných partnerů nelze automaticky předpokládat stejné dědické postavení jako u manželů; význam má závěť, dědická smlouva a zákonné dědické třídy. Pojistné plnění závisí na oprávněné osobě, vinkulaci, rozsahu krytí a výlukách. Po skončení dědictví může banka posoudit změnu dlužníků. Do té doby chraňte likviditu domácnosti a evidujte platby.",
      example:
        "Zesnulý vlastnil podíl na domě a byl spoludlužníkem. Podíl vstoupí do pozůstalosti, ale banka může dál požadovat řádné splátky od žijícího solidárního dlužníka.",
      commonMistake:
        "Spoléhat, že pojištění vždy doplatí celý zůstatek, nebo že partner automaticky zdědí celý podíl.",
      nextStep: { label: "Připravit rodinný plán", href: routes.pruvodce.praktickeSituace },
      sources: [civilCodeSource],
      searchTerms: ["úmrtí", "dědictví", "hypotéka", "životní pojištění"],
    },
  ],
  checklist: [
    "Odděluji vlastnictví, osobní dluh a zástavní právo.",
    "Mám kopie úvěrových, nabývacích a majetkových smluv.",
    "Každou změnu dlužníků předem schválí banka.",
    "Převod podílu a vyplacení jsou bezpečně koordinované.",
    "Do konečného řešení zůstávají splátky řádně hrazené.",
  ],
  updatedAt: "2026-09-21",
} satisfies PracticeGuide;

export default hypotekaRozchodRozvodGuide;
