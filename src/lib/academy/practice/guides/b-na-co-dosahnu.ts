import type { PracticeGuide } from "@/lib/academy/practice/types";
import { routes } from "@/lib/routes";

export const GUIDE_NA_CO_DOSAHNU: PracticeGuide = {
  slug: "na-co-dosahnu",
  title: "Na jakou hypotéku dosáhnu",
  cardBlurb:
    "Jak příjmy, výdaje, vlastní peníze, věk a bankovní metodika určují reálný rozpočet.",
  sampleQuestions: [
    "Kolik mi banka může půjčit?",
    "Co všechno banka odečítá od příjmu?",
    "Jak nastavit splátku, kterou zvládnu?",
  ],
  tags: ["prijmy", "prvni-bydleni"],
  icon: "wallet",
  relatedLessonSlugs: ["dsti", "dti", "ltv"],
  cta: { label: "Získat návrh na míru", href: routes.navrhNaMiru },
  answers: [
    {
      id: "dostupna-vyse",
      question: "Podle čeho se určuje dostupná výše hypotéky?",
      directAnswer:
        "Výši omezuje současně vaše schopnost splácet, hodnota zástavy, vlastní zdroje, délka splatnosti a pravidla banky. Rozhoduje nejnižší z těchto stropů. Vysoký příjem nepomůže, když chybí vlastní peníze; vysoká hodnota nemovitosti zase nenahradí nedostatečný disponibilní příjem.",
      explanation:
        "Banka ověřuje příjmy a odečítá životní náklady, jiné splátky i možné zatížení úvěrových limitů. Zkoumá stabilitu příjmu, věk, počet členů domácnosti a scénář růstu sazby podle své metodiky. Vedle toho sleduje LTV, tedy poměr úvěru k uznané zástavní hodnotě. ČNB stanovuje regulatorní rámec a může limity aktivovat, doporučovat či měnit; konkrétní banka může být přísnější. Model na webu používá zjednodušené předpoklady a nemůže předvídat scoring ani odhad. Reálný rozpočet má být nižší než technické maximum, pokud by po splátce nezbývala rezerva.",
      example:
        "Příjmový test dovolí 5 milionů Kč, ale při odhadu 5,5 milionu a bankou uvažovaném LTV 80 % vychází strop 4,4 milionu Kč. Pokud máte jen 700 000 Kč vlastních peněz a potřebujete zaplatit i vedlejší náklady, může být bezpečný kupní rozpočet ještě nižší.",
      commonMistake:
        "Ptát se pouze na maximální úvěr a neřešit celkovou kupní cenu, vedlejší náklady a rezervu.",
      nextStep: { label: "Získat individuální návrh", href: routes.navrhNaMiru },
      sources: [
        {
          label: "Česká národní banka",
          url: "https://www.cnb.cz/cs/dohled-financni-trh/ochrana-spotrebitele/spotrebitelsky-uver/",
          checkedAt: "2026-09-21",
          notes: "Aktuální rámec a informace k limitům hypotečních úvěrů.",
        },
      ],
      searchTerms: ["maximální hypotéka", "kolik mi půjčí", "dostupnost úvěru"],
    },
    {
      id: "uznany-prijem",
      question: "Co je uznaný příjem a proč se liší od výplaty?",
      directAnswer:
        "Uznaný příjem je část příjmu, kterou banka započítá do posouzení schopnosti splácet. Nemusí odpovídat čisté částce na účtu. Banka hodnotí pravidelnost, doložitelnost, zdroj a očekávané trvání; bonusy, nájem, podnikání nebo zahraniční mzdu může krátit či počítat odlišně.",
      explanation:
        "U zaměstnance banka často vychází z potvrzení zaměstnavatele a historie účtu, přičemž jednorázové odměny nemusí zprůměrovat celé. U OSVČ může použít základ daně, obratový model nebo vlastní výpočet podle odvětví a délky podnikání. Příjem z nájmu bývá snížen o rezervu na výpadky a náklady. Metodiky nejsou zákonně jednotné a mění se mezi bankami i produkty. Proto dvě banky mohou ze stejných dokladů odvodit jinou bonitu, aniž by jedna počítala „špatně“. Důležitá je konzistence dokladů s výpisy a daňovými údaji.",
      example:
        "Na účet chodí 52 000 Kč včetně nepravidelných prémií. Základní mzda je 42 000 Kč a roční bonus není smluvně garantovaný. Banka může uznat základ a jen průměrnou část doložených bonusů, případně bonus nezapočítat vůbec.",
      commonMistake:
        "Dosadit do kalkulačky nejlepší měsíc nebo součet všech příjmů bez ohledu na jejich stabilitu.",
      nextStep: { label: "Posoudit skladbu příjmů", href: routes.navrhNaMiru },
      searchTerms: ["uznatelný příjem", "čistý příjem banka", "bonusy hypotéka"],
    },
    {
      id: "vydaje-dluhy",
      question: "Jak výdaje a jiné dluhy snižují hypotéku?",
      directAnswer:
        "Banka od uznaných příjmů odečítá běžné životní náklady domácnosti, splátky úvěrů, výživné a další pravidelné závazky. Zohlednit může i nevyužité limity kreditních karet a kontokorentů. Každá měsíční povinnost proto snižuje prostor pro novou splátku a dostupný úvěr.",
      explanation:
        "Nejde jen o skutečné výdaje uvedené žadatelem. Banka používá vlastní minimální náklady podle velikosti domácnosti a může testovat splátku při vyšší sazbě. Leasing, spotřebitelský úvěr nebo nákup na splátky se projeví přímo; kreditní limit může být započten modelovou splátkou, i když kartu právě nepoužíváte. Konsolidace či doplacení závazku může pomoci, ale musí být skutečně dokončené a doložené. Není rozumné vyčerpat rezervu jen proto, abyste před žádostí splatili levný dluh; porovnejte dopad na bonitu s potřebou hotovosti po koupi.",
      example:
        "Domácnosti zbývá podle bankovního výpočtu 28 000 Kč na novou splátku. Spotřebitelský úvěr se splátkou 5 000 Kč a kreditní limit započtený částkou 1 500 Kč prostor sníží na 21 500 Kč. To může ubrat z dosažitelného úvěru stovky tisíc korun.",
      commonMistake:
        "Neuvést kontokorent nebo kreditní kartu, protože na nich není aktuální dluh.",
      nextStep: { label: "Sestavit rodinný rozpočet", href: routes.kalkulacky.rodinnyRozpocet },
      searchTerms: ["závazky hypotéka", "kreditní karta bonita", "výdaje domácnosti"],
    },
    {
      id: "ltv-dti-dsti",
      question: "Jakou roli hrají LTV, DTI a DSTI?",
      directAnswer:
        "LTV porovnává úvěr s hodnotou zastavené nemovitosti, DTI celkový dluh s ročním čistým příjmem a DSTI měsíční dluhové splátky s měsíčním čistým příjmem. Jsou to různé brzdy: můžete splnit jednu a narazit na jinou nebo na přísnější interní test banky.",
      explanation:
        "LTV ovlivňuje potřebné vlastní zdroje a často i cenu úvěru. DTI sleduje celkové zadlužení, DSTI zatížení průběžnými splátkami. Aktivní závazné limity, výjimky a doporučení je nutné ověřovat k datu žádosti přímo u ČNB a banky; nelze mechanicky používat historické hodnoty. Banky navíc musejí posoudit úvěruschopnost a mají interní pravidla, která mohou být přísnější než veřejný regulatorní strop. Kalkulačka těchto ukazatelů je orientační, protože nezná uznaný příjem ani stresový scénář konkrétní banky.",
      example:
        "Úvěr 4 miliony Kč na nemovitost oceněnou na 5 milionů má LTV 80 %. Pokud má domácnost čistý roční příjem 900 000 Kč, samotný nový úvěr odpovídá DTI přibližně 4,44; do výpočtu však patří i další dluhy. DSTI dále závisí na všech měsíčních splátkách.",
      commonMistake:
        "Použít kupní cenu místo bankovní zástavní hodnoty nebo do DTI nezahrnout další úvěry.",
      nextStep: { label: "Přečíst lekci o LTV", href: `${routes.akademie}/ltv` },
      sources: [
        {
          label: "Česká národní banka",
          url: "https://www.cnb.cz/cs/dohled-financni-trh/ochrana-spotrebitele/spotrebitelsky-uver/",
          checkedAt: "2026-09-21",
          notes: "Definice a aktuální nastavení úvěrových ukazatelů.",
        },
      ],
      searchTerms: ["LTV", "DTI", "DSTI", "limity ČNB"],
    },
    {
      id: "vek-splatnost",
      question: "Jak věk ovlivňuje splatnost a výši hypotéky?",
      directAnswer:
        "Vyšší věk může zkrátit dostupnou splatnost, protože banka stanovuje vlastní maximální věk při doplacení nebo požaduje doložení příjmu v důchodu. Kratší splatnost zvyšuje měsíční splátku, a tím může snížit dosažitelnou částku. Neexistuje jeden univerzální věkový limit pro všechny banky.",
      explanation:
        "Banka sleduje věk všech žadatelů, délku fixace, plánovaný odchod do důchodu i stabilitu budoucích příjmů. U společné žádosti nemusí automaticky rozhodovat věk mladší osoby; záleží na vlastnictví, příjmové roli a metodice. Delší splatnost snižuje pravidelnou splátku, ale obvykle zvyšuje celkové zaplacené úroky a prodlužuje riziko změn sazeb. Smyslem není maximalizovat dobu za každou cenu, nýbrž sladit splátku s rozpočtem a plánem mimořádných splátek. Konkrétní pravidlo je obchodní a riziková metodika banky, nikoli obecná garance.",
      example:
        "Úvěr, který by při splatnosti 30 let měl zvládnutelnou splátku, může být při povolených 18 letech výrazně dražší měsíčně. Přidání mladšího spolužadatele nemusí pomoci, pokud jeho příjem nestačí nebo se nemá stát účastníkem zamýšlené struktury.",
      commonMistake:
        "Počítat automaticky s třicetiletou splatností bez ověření věku při doplacení.",
      nextStep: { label: "Spočítat varianty splatnosti", href: routes.kalkulacky.hypotecniKalkulacka },
      searchTerms: ["věk žadatele", "maximální splatnost", "hypotéka v důchodu"],
    },
    {
      id: "spolecna-zadost",
      question: "Pomůže společná žádost o hypotéku?",
      directAnswer:
        "Může pomoci, pokud druhý žadatel přidá stabilní uznatelný příjem. Zároveň se však započtou jeho dluhy, výdaje, registry a věk. Spolužadatel se stává dlužníkem se smluvní odpovědností, nejde jen o formální připsání příjmu pro lepší výsledek.",
      explanation:
        "Banka obvykle hodnotí domácnost jako celek a může požadovat účast manžela či manželky podle vlastnictví, společného jmění a účelu. Negativní registr, vysoké limity nebo nejistý příjem druhé osoby mohou výsledek zhoršit. Vztah mezi dlužníky je vhodné řešit i právně: vlastnické podíly, příspěvky vlastních peněz, vypořádání při rozchodu a pojištění rizik nejsou vyřešeny samotnou úvěrovou smlouvou. Pozdější vyvázání spolužadatele vyžaduje souhlas banky a nové posouzení zbývajícího dlužníka.",
      example:
        "První žadatel má příjem 55 000 Kč, druhý 25 000 Kč, ale také spotřebitelské splátky 12 000 Kč a kreditní limity. Společná žádost nemusí přinést očekávaný nárůst. Po doplacení závazku a aktualizaci registru může výpočet vypadat jinak.",
      commonMistake:
        "Přibrat rodiče či partnera bez dohody o vlastnictví, splácení a možnosti budoucího vyvázání.",
      nextStep: { label: "Navrhnout strukturu žádosti", href: routes.navrhNaMiru },
      searchTerms: ["spolužadatel", "společná hypotéka", "vyvázání dlužníka"],
    },
    {
      id: "kalkulacka-vs-banka",
      question: "Proč kalkulačka ukazuje víc než banka?",
      directAnswer:
        "Kalkulačka počítá z několika zadaných veličin, zatímco banka ověřuje doklady, registry, uznané příjmy, životní náklady, další dluhy, zástavu a interní rizikový model. Výsledek kalkulačky je scénář, ne nabídka ani schválení. Rozdíl často vznikne v tom, co banka skutečně uzná.",
      explanation:
        "Model může předpokládat stálou sazbu a celou čistou mzdu, ale banka může krátit bonus, nájem či podnikatelský příjem, zohlednit kreditní limit a testovat vyšší splátku. Kalkulačka také nemusí znát věkové omezení, požadované minimum domácnosti ani výsledek odhadu. Opačný rozdíl je možný rovněž: banka může použít produktovou výjimku nebo příjem, který jednoduchý model neumí. Kvalitní kalkulace proto ukazuje vstupy, předpoklady a citlivost, ne jedno „jisté“ číslo.",
      example:
        "Model vezme čistý příjem 70 000 Kč a nulové dluhy. Banka však z 15 000 Kč bonusů uzná jen část, připočte modelovou splátku kreditní karty a použije vyšší testovací sazbu. Dostupný úvěr se sníží, přestože běžná měsíční splátka nabídky vypadá stejně.",
      commonMistake:
        "Přizpůsobit kupní cenu nejvyššímu číslu z anonymní kalkulačky.",
      nextStep: { label: "Otestovat orientační splátku", href: routes.kalkulacky.hypotecniKalkulacka },
      searchTerms: ["hypoteční kalkulačka přesnost", "banka půjčí méně", "model bonity"],
    },
    {
      id: "zvladatelna-splatka",
      question: "Jak určit zvládnutelnou splátku, ne jen bankovní maximum?",
      directAnswer:
        "Za zvládnutelnou považujte splátku, po které zůstane prostor na běžné výdaje, nepravidelné náklady, údržbu nemovitosti, pojištění, tvorbu rezervy a případný růst sazby. Bankovní schválení potvrzuje přijatelnost podle metodiky banky, nikoli osobní komfort nebo odolnost vašeho rozpočtu.",
      explanation:
        "Sestavte rozpočet z delšího období, započtěte roční platby a náklady nového bydlení. Vytvořte krizový scénář pro výpadek části příjmu, rodičovskou, opravu nebo vyšší splátku po fixaci. Rozumná hotovostní rezerva závisí na stabilitě příjmů, počtu živitelů a stavu nemovitosti; univerzální procento není zákon. Nezapomeňte, že vlastnické bydlení přináší fond oprav, energie, daň z nemovitých věcí a vybavení. Rozdíl mezi bankovním maximem a osobním limitem je bezpečnostní polštář, nikoli nevyužitá příležitost.",
      example:
        "Banka dovolí splátku 32 000 Kč, ale domácnost po započtení školky, auta, oprav a pravidelného spoření bezpečně unese 26 000 Kč. Model rozpočtu proto pracuje s nižším úvěrem nebo delším hledáním levnější nemovitosti a testuje i sazbu vyšší o několik bodů.",
      commonMistake:
        "Počítat pouze současný nájem proti splátce a vynechat náklady vlastníka i budoucí změny příjmů.",
      nextStep: { label: "Rozdělit rodinný rozpočet", href: routes.kalkulacky.rodinnyRozpocet },
      vizId: "budget-split",
      searchTerms: ["bezpečná splátka", "rezerva hypotéka", "rodinný rozpočet"],
    },
  ],
  updatedAt: "2026-09-21",
};
