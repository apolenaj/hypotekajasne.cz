import type { PracticeGuide } from "@/lib/academy/practice/types";
import { routes } from "@/lib/routes";

export const GUIDE_PRVNI_HYPOTEKA: PracticeGuide = {
  slug: "prvni-hypoteka",
  title: "První hypotéka krok za krokem",
  cardBlurb:
    "Od prvního rozpočtu přes rezervaci a schválení až po čerpání, úschovu a zápis do katastru.",
  sampleQuestions: [
    "Co banka schvaluje dřív: mě, nebo nemovitost?",
    "Jaké doklady budu potřebovat?",
    "Kdy se hypotéka skutečně čerpá?",
  ],
  tags: ["prvni-bydleni"],
  icon: "route",
  relatedLessonSlugs: ["ltv", "fixace"],
  cta: {
    label: "Spočítat orientační splátku",
    href: routes.kalkulacky.hypotecniKalkulacka,
  },
  answers: [
    {
      id: "co-je-hypoteka",
      question: "Co je hypotéka a jak celý proces funguje?",
      directAnswer:
        "Hypotéka je dlouhodobý úvěr zajištěný zástavním právem k nemovitosti. Banka neposuzuje jen cenu bytu či domu: prověřuje žadatele, účel, hodnotu a právní stav zástavy i podmínky čerpání. Podpis úvěrové smlouvy proto ještě neznamená, že peníze odešly prodávajícímu.",
      explanation:
        "Prakticky jde o několik navazujících rozhodnutí. Nejdřív si stanovíte bezpečný rozpočet a ověříte příjmy a závazky. Potom banka posoudí bonitu, nechá určit zástavní hodnotu nemovitosti a zkontroluje dokumenty. Po schválení podepíšete úvěrovou a zástavní dokumentaci. Čerpání nastane až po splnění podmínek uvedených ve smlouvě, například po doložení vlastních peněz, pojištění nebo podání návrhu na vklad zástavy. Zákon vymezuje spotřebitelský úvěr a informační povinnosti, ČNB nastavuje či doporučuje obezřetnostní limity a každá banka používá vlastní úvěrovou metodiku. Kalkulačka na webu je pouze model, nikoli příslib úvěru.",
      example:
        "Kupujete byt za 5 000 000 Kč a žádáte 4 000 000 Kč. I když příjem na splátku stačí, banka může stanovit zástavní hodnotu jen 4 700 000 Kč. Poměr úvěru k hodnotě se pak počítá z nižšího bankovního odhadu, nikoli automaticky z kupní ceny. Rozdíl musíte pokrýt jinak nebo upravit obchod.",
      commonMistake:
        "Zaměnit orientační kalkulaci za schválený úvěr a podepsat nevratnou rezervaci bez podmínek financování.",
      nextStep: {
        label: "Otevřít hypoteční kalkulačku",
        href: routes.kalkulacky.hypotecniKalkulacka,
      },
      sources: [
        {
          label: "Česká národní banka",
          url: "https://www.cnb.cz/cs/dohled-financni-trh/ochrana-spotrebitele/spotrebitelsky-uver/",
          checkedAt: "2026-09-21",
          notes:
            "Dohled nad poskytovateli spotřebitelských úvěrů a informace k limitům hypotečních úvěrů.",
        },
      ],
      vizId: "purchase-flow",
      searchTerms: ["jak funguje hypotéka", "postup hypotéky", "úvěr na bydlení"],
    },
    {
      id: "banka-nebo-nemovitost",
      question: "Schvaluje banka nejdřív mě, nebo nemovitost?",
      directAnswer:
        "Banka musí schválit obojí, ale části procesu mohou běžet souběžně. Předběžně lze prověřit vaše příjmy, výdaje a registry ještě bez vybrané nemovitosti. Konečné rozhodnutí však zpravidla vyžaduje konkrétní zástavu, její odhad, právní stav a dokumenty k účelu úvěru.",
      explanation:
        "Prověření žadatele odpovídá na otázku, zda je splácení podle bankovní metodiky přijatelné. Prověření nemovitosti řeší, zda ji banka přijme jako zajištění a v jaké hodnotě. Byt s právní vadou, nevhodným způsobem užívání nebo obtížnou prodejností může být problém i pro bonitního klienta. Naopak kvalitní zástava nenahradí nedostatečný či neprokazatelný příjem. Výsledek předběžného posouzení má omezenou platnost a může se změnit po novém výpisu z registrů, změně zaměstnání, sazby nebo metodiky banky. Proto je rozumné v rezervační smlouvě řešit možnost odstoupení či vrácení poplatku, pokud financování nebo odhad nevyjde.",
      example:
        "Pár předběžně projde na úvěr 4,5 milionu Kč. Vybere však ateliér evidovaný jako nebytová jednotka. Některá banka jej nemusí přijmout, jiná nabídne nižší LTV nebo odlišné podmínky. Schválení klientů tedy samo o sobě obchod nezajišťuje.",
      commonMistake:
        "Spoléhat na ústní sdělení o bonitě a nechat kontrolu nemovitosti až na dobu po propadnutí rezervační lhůty.",
      nextStep: { label: "Nechat posoudit situaci", href: routes.navrhNaMiru },
      searchTerms: ["schválení klienta", "schválení nemovitosti", "předschválení"],
    },
    {
      id: "kalkulace-predschvaleni-schvaleni",
      question: "Jaký je rozdíl mezi kalkulací, předschválením a schválením?",
      directAnswer:
        "Kalkulace je nezávazný model splátky a možného úvěru. Předschválení obvykle znamená, že banka předběžně prověřila část údajů o žadateli, ale ještě nemusí znát nemovitost ani všechny doklady. Schválení je konkrétní úvěrové rozhodnutí s parametry a podmínkami, ani to však není totéž co čerpání.",
      explanation:
        "Názvy nejsou mezi bankami dokonale sjednocené, proto se ptejte, co přesně daný dokument potvrzuje, dokdy platí a jaké podmínky zbývají. Online kalkulačka pracuje se zadanými čísly a typicky nezohlední interní uznání příjmů, registry nebo právní stav zástavy. Předschválení může být založeno jen na prohlášení, nebo na doložených datech; jeho váha se proto liší. Konečné schválení bývá časově omezené a banka může požadovat aktualizaci dokumentů. Teprve po podpisu smluv a splnění podmínek čerpání vznikne možnost peníze odeslat. Přesný právní význam vždy plyne z dokumentace, nikoli z obchodního názvu fáze.",
      example:
        "Kalkulačka ukáže 4 miliony Kč, předběžné posouzení potvrdí příjmový prostor 3,8 milionu Kč a po odhadu banka schválí 3,6 milionu Kč. Smlouva navíc stanoví, že před čerpáním musíte vložit vlastní zdroje a podat návrh na vklad zástavního práva.",
      commonMistake:
        "Považovat e-mail s orientační nabídkou za bezpodmínečný závazek banky.",
      nextStep: { label: "Porovnat aktuální sazby", href: routes.sazby },
      searchTerms: ["kalkulace hypotéky", "předschválení", "schválená hypotéka"],
    },
    {
      id: "doklady",
      question: "Jaké doklady budu k hypotéce potřebovat?",
      directAnswer:
        "Obvykle doložíte totožnost, příjmy a závazky, účel úvěru a dokumenty k nemovitosti. Konkrétní seznam závisí na zaměstnání, bance a typu obchodu. Zaměstnanec často dokládá potvrzení o příjmu a výpisy, OSVČ daňové podklady; ke koupi se přidává smluvní dokumentace a odhad.",
      explanation:
        "Banka si může část údajů ověřit elektronicky, ale nelze předpokládat stejný postup všude. Připravte občanský průkaz, přehled existujících úvěrů a limitů, doklady o vlastních zdrojích a historii příchozích plateb. K nemovitosti bývá potřeba návrh nebo podepsaná kupní smlouva, rezervační smlouva, list vlastnictví, nabývací titul, půdorys či další technické podklady. U výstavby se dokládá rozpočet, harmonogram a povolení. U nestandardních příjmů banka může chtít pracovní smlouvu, daňová přiznání, účetní výkazy nebo smlouvy dokládající trvání příjmu. Požadavky jsou bankovní metodika, ne univerzální zákonný seznam.",
      example:
        "Zaměstnanec s pravidelnou mzdou může projít s potvrzením zaměstnavatele a výpisy. Společník společnosti, který kombinuje mzdu, odměnu jednatele a dividendu, zpravidla doloží více dokumentů a banka jednotlivé složky nemusí uznat stejně.",
      commonMistake:
        "Posílat neaktuální či neúplné dokumenty a zamlčet kreditní kartu, kontokorent nebo spolužadatelovy závazky.",
      nextStep: { label: "Probrat potřebné podklady", href: routes.kontakt },
      searchTerms: ["doklady k hypotéce", "potvrzení příjmu", "dokumenty banka"],
    },
    {
      id: "rezervace",
      question: "Na co si dát pozor v rezervační smlouvě?",
      directAnswer:
        "Rezervační smlouva by měla přesně určit nemovitost, cenu, lhůty, navazující smlouvy, osud rezervačního poplatku a podmínky vrácení. Pro kupujícího na hypotéku je zásadní výslovně upravit situaci, kdy banka úvěr neschválí, odhad vyjde nízko nebo se objeví právní vada.",
      explanation:
        "Nejde o bankovní formulář, ale o soukromoprávní závazek, jehož dopady závisí na konkrétním textu a stranách. Formulace „kupující si zajistí financování“ sama o sobě nemusí chránit před ztrátou poplatku. Vyjednejte realistickou lhůtu pro odhad a schválení, možnost dodat připomínky ke kupní smlouvě a jasné podmínky odstoupení. Ověřte, komu se poplatek platí, zda se započítává na kupní cenu a kdy může být zadržen. Před podpisem má smysl právní kontrola nezávislá na zprostředkovateli obchodu. Hypoteční specialista řeší financování, nikoli automaticky úplné právní posouzení smlouvy.",
      example:
        "Rezervace stanoví 14 dní na podpis kupní smlouvy, ale banka potřebuje doplnit dokumentaci stavby. Bez prodlužovacího mechanismu může kupující porušit termín. Bezpečnější text váže lhůtu na dodání podkladů a obsahuje scénář pro zamítnutí či nízký odhad.",
      commonMistake:
        "Zaplatit vysoký poplatek ještě před kontrolou listu vlastnictví, rozpočtu a finanční podmínky.",
      nextStep: { label: "Prověřit nemovitost", href: routes.dueDiligence },
      sources: [
        {
          label: "Český úřad zeměměřický a katastrální",
          url: "https://www.cuzk.cz/",
          checkedAt: "2026-09-21",
          notes: "Veřejné informace a služby katastru nemovitostí.",
        },
      ],
      searchTerms: ["rezervační smlouva", "rezervační poplatek", "podmínka hypotéky"],
    },
    {
      id: "zamitnuti-nebo-nizky-odhad",
      question: "Co když banka hypotéku zamítne nebo odhad vyjde nízko?",
      directAnswer:
        "Nejdřív zjistěte, zda je problém v bonitě, registrech, dokumentech, nemovitosti, nebo výši zástavní hodnoty. Řešení může být doplnění podkladů, nižší úvěr, více vlastních peněz, jiná zástava či banka. Novou žádost ale neposílejte naslepo do více institucí.",
      explanation:
        "Zamítnutí není jednotná diagnóza. Banka nemusí zveřejnit celý interní scoring, měla by však být schopna sdělit, zda chybí dokument nebo nesplňujete základní podmínku. U nízkého odhadu porovnejte popis a použité údaje se skutečností; věcnou chybu lze doložit a požádat o přezkum, nikoli si vynutit konkrétní cenu. Jiná banka může dojít k odlišnému výsledku, ale opakované žádosti bez odstranění příčiny mohou přidat další dotazy do registrů. Současně hlídejte smluvní termíny a písemně komunikujte s prodávajícím.",
      example:
        "Kupní cena je 6 milionů Kč, odhad 5,5 milionu Kč a banka připustí úvěr do 80 % své hodnoty. Maximum podle tohoto limitu je 4,4 milionu Kč. Rozdíl proti ceně činí 1,6 milionu Kč plus vedlejší náklady; pouhých 20 % kupní ceny nestačí.",
      commonMistake:
        "Okamžitě podat několik dalších žádostí bez kontroly registrů, rozpočtu a důvodu prvního zamítnutí.",
      nextStep: { label: "Modelovat rozdíl ceny a odhadu", href: routes.kalkulacky.odhadVersusKupniCena },
      searchTerms: ["zamítnutá hypotéka", "nízký odhad", "banka neschválila"],
    },
    {
      id: "kupni-uschova-zastava-katastr",
      question: "Jak spolu souvisí kupní smlouva, úschova, zástava a katastr?",
      directAnswer:
        "Kupní smlouva převádí vlastnictví, úschova řídí bezpečné vydání kupní ceny a zástavní smlouva zajišťuje úvěr ve prospěch banky. Vlastnické i zástavní právo se zapisují do katastru. Dokumenty a pořadí kroků musí být vzájemně sladěné s podmínkami čerpání.",
      explanation:
        "Peníze se často posílají do advokátní, notářské nebo bankovní úschovy a uvolní se až po splnění sjednaných podmínek. Banka může čerpat po podání návrhu na vklad zástavy, nebo až po jejím zápisu; rozhoduje úvěrová smlouva. Katastrální řízení má vlastní zákonné postupy a ochranné lhůty, takže harmonogram musí mít rezervu. Pokud na nemovitosti váznou staré zástavy, smlouvy musí řešit jejich splacení a výmaz. Právník připravující transakci a banka sledují odlišná rizika, proto nestačí, že dokument přijal jen jeden z nich.",
      example:
        "Část kupní ceny tvoří vlastní zdroje, část hypotéka a prodávající má starý úvěr. Úschovní podmínky mohou určit, že část peněz jde jeho bance na doplacení, zbytek se uvolní po zápisu kupujícího a zajištění výmazu původní zástavy.",
      commonMistake:
        "Stanovit pevný den výplaty prodávajícímu bez návaznosti na stav katastru a podmínky banky.",
      nextStep: { label: "Ověřit údaje katastru", href: routes.dueDiligence },
      sources: [
        {
          label: "Český úřad zeměměřický a katastrální",
          url: "https://www.cuzk.cz/",
          checkedAt: "2026-09-21",
          notes: "Postupy vkladového řízení a nahlížení do katastru.",
        },
      ],
      searchTerms: ["úschova kupní ceny", "zástavní smlouva", "vklad katastr"],
    },
    {
      id: "schvaleni-vs-cerpani",
      question: "Proč schválení hypotéky ještě neznamená čerpání?",
      directAnswer:
        "Schválení říká, že banka souhlasí s úvěrem za určených parametrů. Čerpání je až skutečné odeslání peněz po podpisu smluv a splnění všech podmínek. Mezi oběma okamžiky mohou být zástavní dokumenty, vlastní zdroje, pojištění, katastr i časový limit.",
      explanation:
        "Seznam podmínek čerpání je součástí úvěrové dokumentace a je nutné jej číst před podpisem. Banka může požadovat doložení návrhu na vklad zástavního práva, vinkulaci pojistného plnění, úhradu vlastních prostředků, účet úschovy nebo potvrzení o splacení starého úvěru. U výstavby bývá čerpání postupné a navázané na rozpočet či stav stavby. Nesplnění podmínek do konečného termínu může vést k dodatku, poplatku nebo nemožnosti čerpat; přesný důsledek stanoví smlouva. Úrok se zpravidla počítá z vyčerpané částky, ale další ceny a závazky se řídí konkrétní nabídkou.",
      example:
        "Banka schválí úvěr 10. dubna, smlouvy podepíšete 15. dubna a návrh na vklad zástavy podáte 18. dubna. Peníze může banka poslat do úschovy až 22. dubna, jakmile obdrží požadované potvrzení a doklad o vložení vlastních zdrojů.",
      commonMistake:
        "Sjednat datum úhrady kupní ceny bez rezervy na podpisy, katastrální podání a kontrolu podmínek bankou.",
      nextStep: { label: "Připravit návrh financování", href: routes.navrhNaMiru },
      searchTerms: ["čerpání hypotéky", "podmínky čerpání", "schválený úvěr"],
    },
  ],
  checklist: [
    "Stanovit bezpečný rozpočet, rezervu a maximální splátku.",
    "Prověřit příjmy, závazky, registry a orientační dosažitelnou výši.",
    "Před rezervací zkontrolovat právní a technický stav nemovitosti.",
    "Vyjednat v rezervaci podmínku financování a realistické lhůty.",
    "Dodat bance kompletní podklady k žadatelům i nemovitosti.",
    "Zkontrolovat odhad, nabídku, úvěrovou smlouvu a podmínky čerpání.",
    "Sladit kupní smlouvu, úschovu, zástavu a katastrální návrhy.",
    "Vložit vlastní zdroje a splnit pojištění či další podmínky.",
    "Ověřit čerpání, zápis vlastnictví a zástavy i předání nemovitosti.",
    "Po koupi uchovat dokumenty a dál držet provozní finanční rezervu.",
  ],
  updatedAt: "2026-09-21",
};
