import type { PracticeGuide } from "@/lib/academy/practice/types";
import { routes } from "@/lib/routes";

const cnbSource = {
  label: "ČNB — spotřebitelský úvěr",
  url: "https://www.cnb.cz/cs/dohled-financni-trh/ochrana-spotrebitele/spotrebitelsky-uver/",
  notes: "Základní informace k nákladům, smlouvě a právům spotřebitele.",
};

export const urokRpsnNakladyGuide = {
  slug: "urok-rpsn-naklady",
  title: "Úrok, RPSN a skutečné náklady hypotéky",
  cardBlurb:
    "Jak číst sazbu, RPSN, splátkový kalendář a vedlejší náklady tak, aby šly nabídky férově porovnat.",
  sampleQuestions: [
    "Co všechno banka započítá do RPSN?",
    "Proč sazba „od“ nemusí být moje sazba?",
    "Kolik ze splátky jde na jistinu?",
  ],
  tags: ["splacim", "prvni-bydleni"],
  icon: "percent",
  relatedLessonSlugs: ["rpsn", "fixace"],
  cta: { label: "Porovnat aktuální sazby", href: routes.sazby },
  answers: [
    {
      id: "stanoveni-sazby",
      question: "Podle čeho banka stanoví moji úrokovou sazbu?",
      directAnswer:
        "Výsledná sazba není jen číslo z ceníku. Banka ji obvykle odvozuje od délky fixace, poměru úvěru k hodnotě zástavy, výše a účelu úvěru, rizikovosti klienta a obchodních slev. Roli mohou hrát účet, pojištění nebo energetická náročnost nemovitosti. Rozhodující je až konkrétní písemná nabídka se všemi podmínkami.",
      explanation:
        "Dvě domácnosti se stejným příjmem mohou dostat odlišnou sazbu, protože mají jiné LTV, rezervy, závazky nebo typ nemovitosti. Sleva také nemusí být zdarma: účet či pojištění přidají pravidelný náklad. Ptejte se, jak dlouho nabídka platí, co je podmínkou slevy a co se stane při jejím nesplnění. Vedle nominální sazby porovnejte RPSN a celkovou částku splatnou spotřebitelem; u proměnlivých budoucích nákladů počítejte se scénářem, ne s jistotou.",
      example:
        "Nabídka A může mít nižší sazbu, ale vyžadovat placené pojištění. Nabídka B může mít sazbu o něco vyšší, zato bez doplňkové služby. Sečtěte splátky a povinné náklady za stejné období fixace a zohledněte jednorázové poplatky.",
      commonMistake:
        "Porovnat reklamní sazbu jedné banky s individuálně schválenou sazbou jiné banky.",
      nextStep: { label: "Ověřit sazby bank", href: routes.sazby },
      sources: [cnbSource],
      vizId: "offer-compare",
      searchTerms: ["úroková sazba", "LTV", "sleva za pojištění", "ceník banky"],
    },
    {
      id: "sazba-od",
      question: "Co znamená sazba „od“ v reklamě?",
      directAnswer:
        "Sazba „od“ je nejnižší sazba dostupná jen při splnění vybraných podmínek. Sama o sobě neslibuje, že ji banka nabídne právě vám. Může předpokládat určité LTV, konkrétní fixaci, aktivní účet, pojištění nebo velmi dobrý rizikový profil. Pro rozhodnutí potřebujete individuální nabídku, ne reklamní minimum.",
      explanation:
        "Zjistěte, pro jaký modelový případ je sazba uvedena a které podmínky musíte plnit po celou dobu. Ptejte se také, zda zrušení účtu nebo pojištění zvýší sazbu a od kdy. Nabídky porovnávejte ke stejnému dni, protože ceny zdrojů i obchodní kampaně se mění. Nechte si uvést nominální sazbu, RPSN, měsíční splátku, všechny povinné produkty a jednorázové náklady. RPSN vždy převezměte z bankovní nabídky; vlastní orientační výpočet nenahrazuje zákonný bankovní údaj.",
      example:
        "Reklama uvádí sazbu „od“, ale vaše nabídka má vyšší LTV a nepočítá s pojištěním. Výsledná sazba proto může být vyšší. Smysluplné je srovnat až dvě nabídky vypočtené na stejnou částku, splatnost a fixaci.",
      commonMistake:
        "Naplánovat rozpočet podle reklamního minima ještě před oceněním nemovitosti a posouzením bonity.",
      nextStep: { label: "Porovnat ověřené sazby", href: routes.sazby },
      sources: [cnbSource],
      vizId: "offer-compare",
      searchTerms: ["sazba od", "reklamní sazba", "individuální nabídka"],
    },
    {
      id: "co-je-rpsn",
      question: "Co je RPSN a k čemu je dobré?",
      directAnswer:
        "RPSN je roční procentní sazba nákladů. Převádí úroky a zákonem zahrnované náklady úvěru na roční procentní ukazatel, aby šly lépe porovnat nabídky se stejnými parametry. Nejde o další poplatek ani o totéž co úroková sazba. Používejte vždy RPSN uvedené bankou v konkrétní nabídce.",
      explanation:
        "Do RPSN vstupují platby známé věřiteli, které musí spotřebitel v souvislosti s úvěrem zaplatit, včetně nákladů některých povinných doplňkových služeb. Výsledek závisí na částce, harmonogramu čerpání a splácení i předpokladech výpočtu. Proto neporovnávejte RPSN u různých částek, splatností nebo konstrukcí úvěru bez dalšího rozboru. U dlouhé hypotéky navíc neříká, jaká sazba bude po skončení fixace; budoucí refixace není dnes známá.",
      example:
        "Dvě nabídky se stejnou sazbou mohou mít různé RPSN kvůli povinným poplatkům či pojištění. Naopak malý jednorázový poplatek se u vysokého dlouhodobého úvěru projeví jinak než u krátkého úvěru.",
      commonMistake:
        "Pokusit se dopočítat „přesnější RPSN“ z reklamních údajů. Pro smluvní porovnání použijte číslo banky a ověřte jeho vstupy.",
      nextStep: { label: "Srovnat nabídky", href: routes.sazby },
      sources: [cnbSource],
      vizId: "offer-compare",
      searchTerms: ["RPSN", "roční procentní sazba nákladů", "celkové náklady"],
    },
    {
      id: "co-rpsn-neri",
      question: "Co mi RPSN o hypotéce neřekne?",
      directAnswer:
        "RPSN není úplná předpověď ceny hypotéky. Neřekne budoucí sazbu po konci fixace, dopad mimořádných splátek ani cenu služeb, které nejsou povinnou podmínkou úvěru. Také nehodnotí kvalitu obsluhy, flexibilitu banky, rychlost čerpání nebo riziko, že nesplníte podmínky slevy.",
      explanation:
        "Ukazatel funguje nejlépe při porovnání konkrétních nabídek se stejnou výší úvěru, splatností, čerpáním a fixací. U hypoték je budoucnost za první fixací nejistá, proto vedle RPSN sledujte náklad během fixace, zůstatek jistiny na jejím konci a pravidla změn. Oddělte povinné náklady od dobrovolných služeb a prověřte poplatky mimo běžný scénář, například za změnu smlouvy. RPSN nepoužívejte jako jediné pořadí „nejlepší banky“.",
      example:
        "Nabídka s nižším RPSN může mít méně vhodné podmínky čerpání při výstavbě. Pokud kvůli nim potřebujete drahé přechodné financování, ekonomický výsledek domácnosti bude jiný, i když tento externí náklad v RPSN není.",
      commonMistake:
        "Považovat rozdíl několika setin RPSN za rozhodující bez kontroly zůstatku, fixace a podmínek čerpání.",
      nextStep: { label: "Zkontrolovat aktuální nabídky", href: routes.sazby },
      sources: [cnbSource],
      vizId: "offer-compare",
      searchTerms: ["omezení RPSN", "náklady mimo RPSN", "porovnání hypoték"],
    },
    {
      id: "pojisteni-ano-ne",
      question: "Vyplatí se pojištění kvůli slevě na sazbě?",
      directAnswer:
        "Sleva na sazbě sama neprokazuje, že se pojištění vyplatí. Porovnejte úsporu na úrocích s pojistným a hlavně s rozsahem krytí, výlukami a čekacími dobami. Pojištění může být užitečné, ale má řešit konkrétní riziko domácnosti; nemělo by být jen drahou vstupenkou k nižší sazbě.",
      explanation:
        "Vyžádejte si variantu se službou i bez ní a spočítejte peněžní toky za stejné období fixace. U varianty s pojištěním ověřte, zda pojistné zůstává stejné, co se stane při zrušení a zda banka sazbu zvýší. Samostatné životní pojištění může mít jiné krytí než pojištění schopnosti splácet. Ekonomické srovnání proto rozdělte na cenu financování a hodnotu ochrany; levnější hypotéka nemusí znamenat vhodnější pojištění.",
      example:
        "Sleva sníží měsíční splátku, ale pojistné může být vyšší než úspora. Přesto může produkt dávat smysl, pokud dobře kryje relevantní rizika. Rozhodnutí vyžaduje obě části, ne jen čistý rozdíl plateb.",
      commonMistake:
        "Odečíst pojistné od úspory, ale neověřit výluky, limity plnění a dopad zrušení na sazbu.",
      nextStep: { label: "Porovnat sazby se slevou", href: routes.sazby },
      sources: [cnbSource],
      vizId: "offer-compare",
      searchTerms: ["pojištění schopnosti splácet", "sleva na sazbě", "pojistné"],
    },
    {
      id: "poplatky",
      question: "Které poplatky a vedlejší náklady mám hlídat?",
      directAnswer:
        "Sledujte poplatek za posouzení či zpracování, ocenění zástavy, čerpání, vedení povinného účtu, pojištění a případné změny smlouvy. Mimo banku počítejte s katastrem, právními službami, úschovou a pojištěním nemovitosti. Ne všechny položky musí vstoupit do RPSN, zejména když nejde o povinnou službu známou bance.",
      explanation:
        "Rozdělte náklady na jednorázové, pravidelné a podmíněné. U každého si poznamenejte, kdo jej účtuje, kdy vznikne a zda je nutný pro získání nabízených podmínek. Bankovní sazebník čtěte spolu s návrhem smlouvy a předsmluvními informacemi; obecný ceník nemusí zachytit individuální slevu. Zvlášť prověřte náklady při postupném čerpání, nedočerpání, prodloužení rezervace zdrojů a změně zástavy. Pro porovnání nabídek použijte stejný realistický scénář.",
      example:
        "U koupě může být bankovní odhad zdarma, ale vznikne poplatek katastru a náklad úschovy. U výstavby může přibýt více čerpání nebo průběžných kontrol. Jediný univerzální seznam částek proto neexistuje.",
      commonMistake:
        "Sečíst pouze poplatky uvedené vedle sazby a zapomenout na transakční náklady mimo banku.",
      nextStep: { label: "Prověřit bankovní nabídky", href: routes.sazby },
      sources: [cnbSource],
      vizId: "offer-compare",
      searchTerms: ["poplatek za hypotéku", "odhad", "katastr", "čerpání"],
    },
    {
      id: "jistina-urok",
      question: "Kolik ze splátky jde na jistinu a kolik na úrok?",
      directAnswer:
        "U běžné anuitní hypotéky je splátka při stejné sazbě zpravidla konstantní, ale její složení se mění. Úrok se počítá z aktuálního nesplaceného zůstatku, takže zpočátku tvoří větší část splátky. Jak jistina klesá, klesá i úroková část a větší díl platby umořuje dluh.",
      explanation:
        "Přesný rozpad závisí na sazbě, zůstatku, termínech a metodice banky. Sledujte proto bankovní splátkový kalendář, nikoli jen obecnou kalkulačku. Mimořádná splátka sníží jistinu a tím i budoucí úrok, ale její dopad závisí na okamžiku, zvoleném novém nastavení a případné náhradě nákladů. Po změně sazby nebo splatnosti banka vytvoří nový harmonogram. Součet dosavadních splátek proto není totéž jako splacená jistina.",
      example:
        "Když odešlete běžnou splátku, banka nejprve podle harmonogramu zúčtuje úrok za období a zbytek proti jistině. V pozdějších letech jde při stejné sazbě proti jistině větší podíl než na začátku.",
      commonMistake:
        "Odhadovat zůstatek jako původní úvěr minus počet splátek krát měsíční splátka.",
      nextStep: { label: "Ověřit sazbu a splátku", href: routes.sazby },
      sources: [cnbSource],
      vizId: "payment-split",
      searchTerms: ["anuitní splátka", "jistina", "úrok", "splátkový kalendář"],
    },
    {
      id: "splatnost-vs-fixace",
      question: "Jaký je rozdíl mezi splatností a fixací?",
      directAnswer:
        "Splatnost je plánovaná doba, za kterou máte splatit celý úvěr. Fixace je kratší období, po které banka drží sjednanou úrokovou sazbu podle smlouvy. Třicetiletá splatnost tedy neznamená třicet let stejného úroku. Po konci fixace se sjednávají podmínky pro další období.",
      explanation:
        "Delší splatnost obvykle sníží povinnou měsíční splátku, ale při jinak stejných podmínkách prodlouží úročení a zvýší celkové úroky. Délka fixace naopak řídí, jak dlouho máte cenovou jistotu a kdy budete řešit novou sazbu nebo refinancování. Kratší fixace není automaticky levnější ani rizikovější pro každého; záleží na rezervě, plánech s nemovitostí a citlivosti rozpočtu. Před podpisem si nechte ukázat zůstatek jistiny na konci fixace a stresový scénář vyšší sazby.",
      example:
        "Hypotéka může mít splatnost 30 let a fixaci 5 let. Po pěti letech úvěr nekončí: zůstává nesplacená jistina a nová sazba ovlivní splátky v dalším fixačním období.",
      commonMistake:
        "Vybrat délku fixace jen podle nejnižší dnešní sazby bez ohledu na plán prodeje a finanční rezervu.",
      nextStep: { label: "Porovnat sazby podle fixace", href: routes.sazby },
      sources: [cnbSource],
      vizId: "payment-split",
      searchTerms: ["splatnost", "fixace", "refixace", "délka hypotéky"],
    },
  ],
  checklist: [
    "Mám nabídky se stejnou částkou, splatností, fixací a způsobem čerpání.",
    "Znám RPSN přímo z každé bankovní nabídky.",
    "Oddělil jsem povinné služby od dobrovolných.",
    "Vidím zůstatek jistiny na konci fixace.",
    "Rozpočet zvládne i scénář vyšší sazby.",
  ],
  updatedAt: "2026-09-21",
} satisfies PracticeGuide;

export default urokRpsnNakladyGuide;
