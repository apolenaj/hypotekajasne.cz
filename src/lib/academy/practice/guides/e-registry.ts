import type { PracticeGuide } from "@/lib/academy/practice/types";
import { routes } from "@/lib/routes";

export const GUIDE_REGISTRY: PracticeGuide = {
  slug: "registry-zamitnuti",
  title: "Registry a zamítnutá hypotéka",
  cardBlurb:
    "Co banky vidí v registrech, proč žádost neprojde a jak se připravit na bezpečný další krok.",
  sampleQuestions: [
    "Znamená každý záznam problém?",
    "Jak získat a opravit vlastní výpis?",
    "Co udělat před další žádostí?",
  ],
  tags: ["prijmy", "splacim"],
  icon: "shieldAlert",
  relatedLessonSlugs: [],
  cta: { label: "Probrat další postup", href: routes.kontakt },
  answers: [
    {
      id: "brki-nrki-solus",
      question: "Co jsou BRKI, NRKI a SOLUS?",
      directAnswer:
        "Jde o odlišné registry sdílející údaje o úvěrových vztazích či platební morálce podle vlastních pravidel. BRKI používají banky, NRKI nebankovní věřitelé a SOLUS sdružuje členy z více odvětví. Obsah, právní základ, doba uchování i způsob získání výpisu se mezi nimi liší.",
      explanation:
        "Registr není veřejný seznam „špatných dlužníků“. BRKI a NRKI obsahují pozitivní i negativní historii: závazky, žádosti a způsob splácení. SOLUS provozuje více registrů s rozdílným rozsahem. Banka kombinuje registry s vlastními daty, příjmy, výdaji a scoringem; samotný název registru tedy nevysvětluje rozhodnutí. Přístup a zpracování se řídí právními pravidly a podmínkami provozovatelů. Před žádostí používejte pouze oficiální kanály provozovatelů a neposílejte osobní údaje webům, které slibují „vyčištění registru“ bez právního důvodu.",
      example:
        "Ve výpisu může být řádně splácená hypotéka, uzavřený spotřebitelský úvěr i právě podaná žádost. Pozitivní historie není chyba. Riziko může vzniknout u opakovaného prodlení, vysokého využití limitů nebo množství čerstvých žádostí, ale váhu určuje banka.",
      commonMistake:
        "Považovat všechny registry za jednu databázi a objednat neoficiální „univerzální výpis“.",
      nextStep: { label: "Probrat registry bezpečně", href: routes.kontakt },
      searchTerms: ["BRKI", "NRKI", "SOLUS", "úvěrové registry"],
    },
    {
      id: "kazdy-zaznam",
      question: "Znamená každý záznam v registru zamítnutí?",
      directAnswer:
        "Ne. Řádně splácený úvěr je běžný pozitivní záznam. Banka hodnotí typ závazku, výši, historii splácení, četnost a délku prodlení, aktuální stav i množství nedávných žádostí. Stejný záznam může mít u různých bank odlišnou váhu podle jejich metodiky.",
      explanation:
        "Krátké ojedinělé zpoždění nemusí mít stejný dopad jako dlouhodobé opakované prodlení, ale nelze předem slíbit, že bude ignorováno. Důležité je, zda je dluh uhrazen, kdy problém nastal a jak se od té doby vyvíjí platební historie. Registry uchovávají data po dobu stanovenou provozními a právními pravidly; splacení proto obvykle neznamená okamžité zmizení historie. Banka také může žádost odmítnout i bez negativního záznamu, například kvůli příjmům, zástavě nebo internímu scoringu.",
      example:
        "Klient má pět let řádně splácený úvěr a jediné dvoudenní zpoždění vzniklé změnou inkasa. Jiný má několik měsíců opakovaná prodlení u více produktů. Oba mají „záznam“, ale rizikový obraz je zásadně jiný a stále záleží na bance.",
      commonMistake:
        "Předpokládat, že absence dluhu znamená prázdný registr, nebo že jakýkoli záznam automaticky blokuje hypotéku.",
      nextStep: { label: "Posoudit další postup", href: routes.kontakt },
      searchTerms: ["negativní záznam", "pozitivní registr", "prodlení splátky"],
    },
    {
      id: "vlastni-vypis",
      question: "Jak si získám vlastní výpis z registrů?",
      directAnswer:
        "Výpis objednávejte přímo u oficiálního provozovatele nebo jím uvedeného klientského centra. Ověřte, který registr výpis pokrývá, způsob identifikace, cenu a formát. Jeden dokument nemusí obsahovat BRKI, NRKI i SOLUS, proto název služby a rozsah zkontrolujte před platbou.",
      explanation:
        "Použijte odkazy zveřejněné samotnými registry, nikoli reklamní zprostředkovatele. Budete muset bezpečně prokázat totožnost; konkrétní možnosti mohou zahrnovat elektronickou identifikaci, datovou schránku, poštu nebo osobní žádost. Po doručení kontrolujte osobní údaje, seznam smluv, zůstatky, limity, historii splácení a žádosti. Výpis je citlivý dokument, neposílejte jej nezašifrovaným kanálem neověřené osobě. Výpis před hypotékou dává smysl hlavně tehdy, když si nejste jistí starými závazky nebo jste řešili prodlení či podvod.",
      example:
        "Klient předpokládá, že zrušená kreditní karta je uzavřená, ale výpis ukáže stále aktivní limit. Nejdřív kontaktuje vydavatele, ověří stav a nechá produkt řádně ukončit. Až poté plánuje žádost a počítá s časem na aktualizaci dat.",
      commonMistake:
        "Nahrát občanský průkaz a rodné číslo na první web, který se ve vyhledávači označí za kontrolu dlužníků.",
      nextStep: { label: "Konzultovat zjištěný výpis", href: routes.kontakt },
      searchTerms: ["výpis BRKI", "výpis NRKI", "výpis SOLUS", "kontrola registru"],
    },
    {
      id: "oprava-udaje",
      question: "Jak opravit chybný údaj v registru?",
      directAnswer:
        "Podejte konkrétní žádost o opravu u instituce, která údaj předala, nebo postupem daného registru. Přiložte smlouvu, potvrzení o úhradě, výpis a označte přesně sporný záznam. Pravdivou negativní historii nelze legálně smazat jen proto, že komplikuje novou žádost.",
      explanation:
        "Nejdřív odlište chybu od správně evidovaného starého prodlení. U chyby žádejte písemné potvrzení přijetí reklamace, uchovejte podklady a sledujte výsledek. Provozovatel může požádat datového poskytovatele o ověření; aktualizace nemusí být okamžitá. Pokud nejste spokojeni, využijte reklamační a právní prostředky popsané provozovatelem a pravidly ochrany osobních údajů. Služby slibující garantovaný výmaz oprávněného záznamu jsou varovným signálem. Do nové žádosti vstupujte až s opraveným stavem nebo s jasným vysvětlením a důkazy.",
      example:
        "Výpis uvádí nesplacený zůstatek, ale klient má potvrzení věřitele o úplném doplacení. Zašle číslo smlouvy, potvrzení a příslušnou část výpisu. Než banka registr aktualizuje, nepodává několik žádostí s předpokladem, že vysvětlení vždy postačí.",
      commonMistake:
        "Platit třetí straně za údajné okamžité smazání správně zaznamenaného prodlení.",
      nextStep: { label: "Probrat doložení opravy", href: routes.kontakt },
      searchTerms: ["oprava registru", "chybný záznam", "výmaz registru"],
    },
    {
      id: "kreditni-limity",
      question: "Vadí nevyužité kreditní karty a kontokorenty?",
      directAnswer:
        "Mohou snižovat bonitu, i když z nich právě nic nedlužíte. Banka může z celého schváleného limitu počítat modelovou měsíční splátku, protože limit lze kdykoli vyčerpat. Dopad závisí na výši limitu a metodice banky; pouhá nulová částka na výpisu nemusí stačit.",
      explanation:
        "Kreditní karta, kontokorent a revolvingový úvěr představují dostupný dluhový rámec. Pokud je nepotřebujete, lze požádat poskytovatele o snížení limitu nebo úplné ukončení. Produkt musí být skutečně uzavřen, ne jen fyzicky zničená karta; vyžádejte si potvrzení a nechte čas na propsání do registru. Nerušte však bez rozmyslu všechny produkty těsně před žádostí, pokud by tím vznikly poplatky či provozní problém. Nejprve spočítejte, který limit reálně omezuje dostupnou splátku.",
      example:
        "Dvě nepoužívané karty mají dohromady limit 200 000 Kč. Banka z nich podle své metodiky odvodí modelové zatížení několika tisíc měsíčně. Po řádném zrušení a aktualizaci registru může být prostor pro hypotéku vyšší, nikoli však automaticky schválený.",
      commonMistake:
        "Prohlásit limit za nulový dluh a v žádosti jej neuvést, přestože je produkt aktivní.",
      nextStep: { label: "Spočítat rozpočet a závazky", href: routes.kalkulacky.rodinnyRozpocet },
      searchTerms: ["kreditní karta hypotéka", "kontokorent bonita", "úvěrový limit"],
    },
    {
      id: "priciny-zamitnuti",
      question: "Jaké jsou běžné příčiny zamítnutí hypotéky?",
      directAnswer:
        "Důvodem může být nedostatečný či nestabilní příjem, vysoké závazky, registry, interní scoring, nízký odhad, právní nebo technická vada nemovitosti, neúplné doklady či nesoulad údajů. Zamítnutí proto automaticky neznamená „špatný registr“ a jiná banka není vždy okamžité řešení.",
      explanation:
        "Rozdělte diagnózu na žadatele, obchod a zajištění. U žadatele prověřte uznaný příjem, výdaje, limity, věk a platební historii. U obchodu účel, cenu, smluvní termíny a původ vlastních zdrojů. U zástavy odhad, právní stav, užívání a prodejnost. Banka nemusí odhalit celý scoringový model, ale lze požádat o kategorii problému a seznam chybějících podkladů. Pokud šlo o automatizované zpracování či osobní údaje, mohou existovat další práva, jejichž uplatnění je vhodné řešit podle konkrétní situace. Opakovat identickou žádost bez změny vstupů obvykle nepomůže.",
      example:
        "Příjmy i registry jsou v pořádku, ale banka odmítne zástavu, protože přístavba není doložená v dokumentaci. Žádost u pěti dalších bank neřeší stavebně-právní nesoulad. Nejprve je třeba zjistit možnost nápravy nebo zvolit jinou nemovitost.",
      commonMistake:
        "Připsat vše registrům a přehlédnout, že problém je v odhadu či právním stavu nemovitosti.",
      nextStep: { label: "Prověřit nemovitost", href: routes.dueDiligence },
      vizId: "rejection-flow",
      searchTerms: ["zamítnutí hypotéky", "scoring banky", "proč banka odmítla"],
    },
    {
      id: "pred-dalsi-zadosti",
      question: "Co udělat před další žádostí po zamítnutí?",
      directAnswer:
        "Nejdřív určete pravděpodobnou příčinu a opravte ji nebo změňte strukturu financování. Zkontrolujte registry, závazky, doklady, uznané příjmy a nemovitost. Teprve potom vyberte banku, jejíž metodika situaci umí. Sériové žádosti naslepo mohou přidat další dotazy a nepřinášejí diagnózu.",
      explanation:
        "Vyžádejte si od první banky srozumitelné sdělení, co lze sdělit, a ověřte, zda šlo o dočasný stav, chybu nebo trvalejší překážku. Doplacení dluhu doložte a vyčkejte na aktualizaci; u příjmu může být potřeba delší historie; u nemovitosti právní náprava nebo nový odhad. Připravte pravdivý jednotný soubor podkladů a nevytvářejte mezi žádostmi rozpory. Jiná banka dává smysl, když se liší relevantní metodika, ne jen značka. Zároveň chraňte rezervační lhůty a neslibujte prodávajícímu výsledek bez potvrzení.",
      example:
        "První banka neuzná krátkou podnikatelskou historii. Místo čtyř dalších žádostí klient zjistí, které banky přijímají jedno uzavřené období, doplní aktuální výpisy a sníží nepotřebný kreditní limit. Nová žádost pak reaguje na konkrétní překážku.",
      commonMistake:
        "Podat tentýž týden stejné podklady do mnoha bank a doufat v náhodný souhlas.",
      nextStep: { label: "Připravit další žádost", href: routes.navrhNaMiru },
      searchTerms: ["opakovaná žádost", "co po zamítnutí", "nová banka"],
    },
    {
      id: "prodleni-exekuce-insolvence",
      question: "Co když mám prodlení, exekuci nebo insolvenci?",
      directAnswer:
        "Aktivní exekuce, probíhající insolvence nebo závažné aktuální prodlení jsou zásadní překážky pro standardní hypotéku. Nejdřív řešte dluhovou a právní situaci, nikoli další úvěr. Po skončení problému banka posuzuje časový odstup, historii, příčinu a úplné doložení podle své metodiky.",
      explanation:
        "Tyto pojmy nejsou zaměnitelné. Prodlení je opožděná platba, exekuce způsob nuceného vymáhání a insolvence soudní řízení řešící úpadek. Každé má jiné právní důsledky a veřejné či neveřejné zdroje informací. Splacení závazku nevymaže automaticky veškerou historii a nelze slíbit konkrétní dobu do schválení. Prioritou je získat úplný přehled dluhů, komunikovat s věřiteli a využít kvalifikovanou dluhovou či právní pomoc. Vyhněte se drahým „předhypotečním“ půjčkám a převodům majetku slibujícím obejití banky.",
      example:
        "Klient doplatí exekučně vymáhaný závazek, ale předpokládá, že příští den získá hypotéku. Nejprve potřebuje potvrzení o skončení, aktualizované evidence, stabilní rozpočet a časovou historii řádného placení. Ani potom není schválení nárokové.",
      commonMistake:
        "Řešit staré dluhy novým drahým úvěrem od subjektu, který slibuje jistou budoucí hypotéku.",
      nextStep: { label: "Najít bezpečný kontakt", href: routes.kontakt },
      searchTerms: ["exekuce hypotéka", "insolvence hypotéka", "prodlení úvěr"],
    },
  ],
  updatedAt: "2026-09-21",
};
