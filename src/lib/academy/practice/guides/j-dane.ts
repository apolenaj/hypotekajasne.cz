import type { PracticeGuide } from "@/lib/academy/practice/types";
import { routes } from "@/lib/routes";

const taxSource = {
  label: "Finanční správa — daň z příjmů fyzických osob",
  url: "https://financnisprava.gov.cz/cs/dane/dane/dan-z-prijmu/fyzicke-osoby",
  notes: "Oficiální informace, formuláře a metodické materiály k dani z příjmů fyzických osob.",
};

const incomeTaxActSource = {
  label: "e-Sbírka — zákon č. 586/1992 Sb., o daních z příjmů",
  url: "https://www.e-sbirka.cz/sb/1992/586",
  notes: "Aktuální znění podmínek odpočtu úroků, příjmů z nájmu a daňových výdajů.",
};

export const daneBydleniInvesticeGuide = {
  slug: "dane-bydleni-investice",
  title: "Daně u vlastního bydlení a investiční nemovitosti",
  cardBlurb:
    "Jak odlišit odpočet úroků pro bydlení od nákladů pronájmu a kde se často chybuje.",
  sampleQuestions: [
    "Kolik úroků si mohu odečíst?",
    "Jak fungují úroky u pronajímaného bytu?",
    "Je lepší nemovitost držet jako fyzická osoba, nebo ve firmě?",
  ],
  tags: ["investice", "prvni-bydleni"],
  icon: "receipt",
  relatedLessonSlugs: [],
  cta: { label: "Otevřít investiční Rentgen", href: routes.investicniRentgen },
  answers: [
    {
      id: "odpocet-uroku",
      question: "Kdy lze odečíst úroky z hypotéky na vlastní bydlení?",
      directAnswer:
        "Od základu daně lze při splnění zákonných podmínek odečíst zaplacené úroky z úvěru použitého na financování bytové potřeby. Neodečítá se celá splátka ani jistina. Rozhoduje účel a skutečné použití úvěru, vztah poplatníka k bytové potřebě a další podmínky zákona, nikoli samotný název produktu „hypotéka“.",
      explanation:
        "Podmínky se liší podle konkrétní situace: koupě, výstavba, rekonstrukce, splacení dřívějšího úvěru nebo financování podílu. U některých titulů je nutné vlastnictví a užívání k trvalému bydlení poplatníka či vymezených blízkých osob. Čistě investiční pronájem nesplňuje režim odpočtu pro vlastní bytovou potřebu, ale úroky mohou za jiných podmínek vstupovat do výdajů z nájmu. Vždy pracujte s potvrzením věřitele a doklady o účelu peněz.",
      example:
        "Banka za rok potvrdí zaplacené úroky. Do odpočtu nevstoupí splacená jistina a ani potvrzená částka se nepoužije automaticky, pokud část úvěru financovala účel, který zákonné podmínky nesplňuje.",
      commonMistake:
        "Uplatnit celou roční sumu splátek nebo považovat bankovní potvrzení samo o sobě za důkaz splnění všech podmínek.",
      nextStep: { label: "Prověřit ekonomiku nemovitosti", href: routes.investicniRentgen },
      sources: [taxSource, incomeTaxActSource],
      vizId: "tax-deduction",
      searchTerms: ["odpočet úroků", "bytová potřeba", "základ daně", "potvrzení banky"],
    },
    {
      id: "rozhodne-datum-limit",
      question: "Jak rozhodné datum ovlivňuje roční limit odpočtu?",
      directAnswer:
        "Zákon používá rozdílné roční limity podle toho, kdy byla bytová potřeba obstarána. Starší bytové potřeby mohou spadat pod vyšší limit, novější pod nižší. Nestačí tedy vzít jeden současný limit pro všechny hypotéky. Rozhodné není vždy jen datum podpisu úvěru a refinancování samo nemusí založit novou bytovou potřebu.",
      explanation:
        "Určete právní titul bytové potřeby, okamžik jejího obstarání a návaznost případného refinancování. Limit se vztahuje na zákonem vymezenou domácnost a úhrn způsobilých úroků, nikoli automaticky na každý úvěr zvlášť. Přesné částky a přechodná pravidla ověřte pro konkrétní zdaňovací období v aktuálním zákoně nebo u daňového poradce. Pokud se původní úvěr navýšil, může být nutné oddělit část použitou na původní bytovou potřebu od nového účelu.",
      example:
        "Domácnost refinancuje starší úvěr a současně si půjčí na další účel. Pro daňový odpočet se sleduje kontinuita původní bytové potřeby a použití navýšené části, ne jen datum nové smlouvy.",
      commonMistake:
        "Při každém refinancování automaticky použít limit pro nové úvěry nebo naopak starý limit rozšířit i na nové navýšení.",
      nextStep: { label: "Modelovat čistý dopad", href: routes.investicniRentgen },
      sources: [taxSource, incomeTaxActSource],
      vizId: "tax-deduction",
      searchTerms: ["limit odpočtu", "rozhodné datum", "stará hypotéka", "nová hypotéka"],
    },
    {
      id: "domacnost-vs-jednotlivec",
      question: "Je limit odpočtu na osobu, úvěr, nebo domácnost?",
      directAnswer:
        "Zákonný limit se neuplatňuje jednoduše pro každou osobu nebo každou hypotéku zvlášť. Pravidla pracují s poplatníky v téže hospodařící domácnosti a s úhrnem úroků z úvěrů použitých na jejich bytové potřeby. Úroky může za splnění podmínek uplatnit jeden oprávněný účastník, případně více z nich podle zákonného rozdělení.",
      explanation:
        "Nejdřív ověřte, kdo je účastníkem úvěrové smlouvy, kdo splňuje podmínky k bytové potřebě a kdo úroky skutečně uplatní. Stejnou částku nelze odečíst dvakrát. Při rozchodu, sňatku, změně domácnosti nebo vlastnictví může být rozdělení složitější a musí odpovídat stavu v daném období. Potvrzení banky může uvádět více dlužníků, ale nerozhoduje samo o tom, kdo splňuje všechny daňové podmínky.",
      example:
        "Manželé jsou oba účastníky úvěru. Mohou podle podmínek zvolit uplatnění jedním z nich nebo zákonné rozdělení, avšak součet nesmí překročit způsobilé zaplacené úroky ani použitelný limit.",
      commonMistake:
        "Vynásobit roční limit počtem spoludlužníků nebo vložit stejné potvrzení do dvou přiznání v plné výši.",
      nextStep: { label: "Prověřit domácí scénář", href: routes.investicniRentgen },
      sources: [incomeTaxActSource, taxSource],
      vizId: "tax-deduction",
      searchTerms: ["hospodařící domácnost", "spoludlužník", "limit úroků", "manželé"],
    },
    {
      id: "uspora-na-dani",
      question: "Jak spočítat skutečnou úsporu na dani?",
      directAnswer:
        "Odpočet úroků snižuje základ daně, nikoli daň přímo. Orientační úspora proto závisí na uznatelné částce, dostupném základu daně a mezní sazbě, která se na poslední odečítanou korunu skutečně vztahuje. Nepoužívejte jednu pevnou sazbu pro každého; sazbu i využitelnou část odpočtu zadávejte podle situace poplatníka.",
      explanation:
        "Začněte částkou zaplacených a způsobilých úroků, omezte ji příslušným ročním limitem a zohledněte ostatní nezdanitelné části. Teprve potom modelujte změnu vypočtené daně podle pásem a konkrétního daňového základu. Výsledek mohou ovlivnit další pravidla přiznání, nikoli však způsobem, který by z odpočtu dělal vratku celé částky. U zaměstnance porovnejte roční zúčtování před a po odpočtu; u složitějších příjmů celé přiznání.",
      example:
        "Model vezme uznatelný odpočet a uživatelem zadanou mezní sazbu jako scénář. Pokud část odpočtu sníží základ v jiném pásmu nebo není plně využitelná, přesný výsledek upraví daňové přiznání.",
      commonMistake:
        "Považovat 50 000 Kč zaplacených úroků za 50 000 Kč vrácené daně nebo automaticky násobit jedinou sazbou.",
      nextStep: { label: "Spočítat čistý scénář", href: routes.investicniRentgen },
      sources: [taxSource, incomeTaxActSource],
      vizId: "tax-deduction",
      searchTerms: ["úspora na dani", "mezní sazba", "základ daně", "daňový odpočet"],
    },
    {
      id: "doklady-refinancovani",
      question: "Jaké doklady uchovat a co doložit po refinancování?",
      directAnswer:
        "Uchovejte úvěrové smlouvy a dodatky, potvrzení věřitelů o zaplacených úrocích, kupní či stavební doklady, list vlastnictví a důkazy o použití peněz na bytovou potřebu. Při refinancování potřebujete doložit také návaznost nového úvěru na splacený původní úvěr a oddělit případné navýšení použité na jiný účel.",
      explanation:
        "V prvním roce uplatnění může zaměstnavatel nebo správce daně požadovat širší soubor podkladů než v dalších letech. Roční potvrzení banky dokládá úroky, ne vždy však účel a splnění vlastnických či užívacích podmínek. Pokud refinancujete v průběhu roku, můžete mít potvrzení od dvou věřitelů; zabraňte překryvu období a duplicitě. U smíšeného účelu si vytvořte průkazný klíč rozdělení úroků a uchovejte výpisy čerpání.",
      example:
        "Nová banka splatí původní zůstatek a poskytne další prostředky na vybavení. Dokumentace musí ukázat, která část navazuje na kvalifikovanou bytovou potřebu a jak se k ní přiřadily úroky.",
      commonMistake:
        "Uchovat pouze poslední potvrzení o úrocích a zahodit původní smlouvu, kupní dokumentaci a vyčíslení refinancování.",
      nextStep: { label: "Prověřit podklady investice", href: routes.investicniRentgen },
      sources: [taxSource, incomeTaxActSource],
      searchTerms: ["potvrzení o úrocích", "refinancování", "doklady", "účel úvěru"],
    },
    {
      id: "smisene-uzivani",
      question: "Co když nemovitost zčásti obývám a zčásti pronajímám?",
      directAnswer:
        "U smíšeného užívání je nutné oddělit část sloužící vlastní bytové potřebě od části vytvářející příjem z nájmu. Stejné úroky nelze současně v plné výši použít jako nezdanitelnou část základu daně a jako výdaj proti nájmu. Rozdělení musí být věcně odůvodněné, konzistentní a doložitelné.",
      explanation:
        "Vhodný klíč může vycházet z podlahové plochy, času nebo jiného vztahu ke skutečnému použití, ale musí odpovídat konkrétním okolnostem. Společné prostory, krátkodobé změny užívání a úvěr financující více účelů výpočet komplikují. U nájemní části navíc záleží, zda uplatňujete skutečné výdaje, nebo výdajový paušál. Předem si vytvořte evidenci ploch, smluv, období pronájmu, úroků a souvisejících nákladů a postup potvrďte s daňovým poradcem.",
      example:
        "Majitel bydlí v části domu a samostatnou jednotku dlouhodobě pronajímá. Úroky rozdělí průkazným klíčem; část pro bydlení posoudí pro odpočet a část pro nájem jen v režimu skutečných výdajů.",
      commonMistake:
        "Uplatnit celé bankovní potvrzení jako odpočet a stejné úroky znovu zahrnout mezi výdaje z pronájmu.",
      nextStep: { label: "Namodelovat smíšené využití", href: routes.investicniRentgen },
      sources: [incomeTaxActSource, taxSource],
      searchTerms: ["smíšené užívání", "část pronájmu", "dvojí uplatnění", "poměr výdajů"],
    },
    {
      id: "pausal-najem",
      question: "Mohu při výdajovém paušálu k nájmu odečíst ještě úroky?",
      directAnswer:
        "Pokud u příjmů z nájmu použijete zákonný výdajový paušál, nahrazuje výdaje související s těmito příjmy. Úroky z úvěru, odpisy, opravy ani další skutečné výdaje proto nelze k paušálu přidat zvlášť. Alternativou jsou prokazatelné skutečné výdaje při splnění daňových podmínek.",
      explanation:
        "Volbu porovnávejte za celé zdaňovací období a s ohledem na zákonný strop paušálních výdajů. U skutečných výdajů potřebujete evidenci, správné časové přiřazení a vazbu na dosažení, zajištění a udržení příjmů. Ne každá platba související s bytem je okamžitým daňovým výdajem; technické zhodnocení se může projevit prostřednictvím odpisů. Paušál je jednodušší, ale u financované nebo opravované nemovitosti nemusí být ekonomicky nejlepší.",
      example:
        "Pronajímatel má vysoké úroky a opravy. Porovná daňový základ při paušálu se scénářem skutečných uznatelných výdajů; nesmí vytvořit třetí variantu „paušál plus úroky“.",
      commonMistake:
        "Přičíst úroky, odpisy nebo pojištění nad rámec výdajového paušálu.",
      nextStep: { label: "Porovnat daňové varianty", href: routes.investicniRentgen },
      sources: [incomeTaxActSource, taxSource],
      searchTerms: ["výdajový paušál", "příjmy z nájmu", "skutečné výdaje", "úroky"],
    },
    {
      id: "jistina-urok-odpis",
      question: "Jak se daňově liší jistina, úrok a odpis?",
      directAnswer:
        "Splátka jistiny je vrácení půjčených peněz a sama není daňovým výdajem. Úrok je cena financování a u pronájmu může při splnění podmínek souviset se zdanitelným příjmem. Odpis je postupné daňové uplatnění vstupní ceny odpisovaného majetku; není to bankovní platba ani automaticky skutečný pokles tržní hodnoty.",
      explanation:
        "U nemovitosti se odděluje odpisovatelná stavba či jednotka od pozemku, který se daňově neodepisuje. Vstupní cenu mohou ovlivnit pořizovací vedlejší náklady a technické zhodnocení. Úrok musí mít prokazatelnou vazbu k financované pronajímané nemovitosti a jeho režim se liší od osobního odpočtu úroků na vlastní bydlení. Uplatňujete-li paušální výdaje, samostatné úroky ani odpisy už nepřidáváte. Evidence musí zabránit dvojímu započtení.",
      example:
        "Měsíční splátka obsahuje jistinu i úrok. Do modelu cash flow patří celá splátka, ale do modelu skutečných daňových výdajů může vstupovat jen způsobilý úrok a samostatně vypočtený odpis.",
      commonMistake:
        "Považovat celou splátku hypotéky za daňový výdaj nebo odepisovat také cenu pozemku.",
      nextStep: { label: "Rozebrat cash flow investice", href: routes.investicniRentgen },
      sources: [incomeTaxActSource, taxSource],
      vizId: "tax-deduction",
      searchTerms: ["jistina", "úrok", "odpis", "pozemek", "daňový výdaj"],
    },
    {
      id: "fo-vs-firma",
      question: "Držet investiční nemovitost jako fyzická osoba, nebo ve firmě?",
      directAnswer:
        "Univerzálně výhodnější varianta neexistuje. Fyzická osoba a společnost mají odlišné zdanění provozního zisku, financování, administrativu, odpovědnost i způsob, jak peníze dostanete pro osobní potřebu. Rozhodnutí musí zahrnout nákup, roční provoz, případný prodej a výplatu prostředků, ne jen sazbu daně v jednom kroku.",
      explanation:
        "Porovnejte dostupnost a cenu úvěru, vlastní kapitál, účetnictví, odpisy, související osoby, DPH u relevantních transakcí, rizika a plán držby. U fyzické osoby může být za zákonných podmínek významné osvobození příjmu při budoucím prodeji; u společnosti se prodej majetku a následné vyvedení peněz posuzují jinak. Převod již vlastněné nemovitosti do firmy není pouhé administrativní přepsání a může vytvořit daňové, právní i bankovní důsledky.",
      example:
        "Firma může lépe oddělit podnikatelská rizika, ale financování bývá jiné a peníze po prodeji zůstávají ve společnosti. Pokud je chce vlastník spotřebovat osobně, model musí zahrnout i tento další krok.",
      commonMistake:
        "Porovnat jen nominální sazbu daně fyzické a právnické osoby a ignorovat financování, prodej a distribuci zisku.",
      nextStep: { label: "Porovnat vlastnické struktury", href: routes.investicniRentgen },
      sources: [incomeTaxActSource, taxSource],
      searchTerms: ["fyzická osoba", "s.r.o.", "investiční nemovitost", "prodej", "zdanění"],
    },
  ],
  checklist: [
    "Odděluji jistinu, úrok, odpis a peněžní tok.",
    "Znám rozhodné datum bytové potřeby a použitelný limit.",
    "Mám bankovní potvrzení i doklady o účelu úvěru.",
    "Stejný náklad neuplatňuji dvakrát.",
    "U významné investice ověřím model s daňovým poradcem.",
  ],
  updatedAt: "2026-09-21",
} satisfies PracticeGuide;

export default daneBydleniInvesticeGuide;
