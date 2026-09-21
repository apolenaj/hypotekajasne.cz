import type { PracticeGuide } from "@/lib/academy/practice/types";
import { routes } from "@/lib/routes";

const cnbInsuranceSource = {
  label: "ČNB — deset věcí při sjednávání pojištění",
  url: "https://www.cnb.cz/cs/dohled-financni-trh/ochrana-spotrebitele/deset-veci-na-ktere-si-dat-pozor-pri-sjednavani-pojisteni/",
  notes: "Oficiální doporučení k rozsahu krytí, výlukám a dokumentaci pojištění.",
};

export const pojisteniVypadekPrijmuGuide = {
  slug: "pojisteni-vypadek-prijmu",
  title: "Pojištění a výpadek příjmu",
  cardBlurb:
    "Jak chránit nemovitost, příjem i rodinný rozpočet a co dělat, když splátka začíná být problém.",
  sampleQuestions: [
    "Jaké pojištění banka skutečně vyžaduje?",
    "Na které výluky si dát pozor?",
    "Co dělat při hrozícím výpadku příjmu?",
  ],
  tags: ["rodina", "splacim"],
  icon: "heartPulse",
  relatedLessonSlugs: [],
  cta: { label: "Probrat ochranu domácnosti", href: routes.navrhNaMiru },
  answers: [
    {
      id: "nemovitost-vs-domacnost",
      question: "Jaký je rozdíl mezi pojištěním nemovitosti a domácnosti?",
      directAnswer:
        "Pojištění nemovitosti kryje stavbu a její pevné součásti, například střechu, okna nebo zabudovanou kuchyň podle pojistných podmínek. Pojištění domácnosti chrání movité vybavení, například nábytek, elektroniku či osobní věci. Hypoteční banka zpravidla požaduje pojištění zastavené nemovitosti, nikoli tím automaticky celé domácnosti.",
      explanation:
        "Hranice mezi stavbou a vybavením se u jednotlivých pojistitelů liší, proto kontrolujte definice a limity. Prověřte rizika vody, povodně, vichřice, požáru, krádeže i odpovědnosti a vztah krytí ke konkrétní lokalitě. U bytu zjistěte, co už pojišťuje SVJ a co musíte pojistit sami; společná pojistka domu nemusí pokrýt vaši jednotku, stavební úpravy ani vybavení v potřebném rozsahu. Pojistná částka má odpovídat nákladům na obnovu, ne zůstatku hypotéky.",
      example:
        "Prasklé potrubí poškodí podlahu, vestavěnou kuchyň a volně stojící elektroniku. Jedna událost se může řešit z více krytí a podle smlouvy také z pojištění odpovědnosti souseda.",
      commonMistake:
        "Pojistit stavbu jen na výši úvěru nebo předpokládat, že pojistka SVJ automaticky chrání vše uvnitř bytu.",
      nextStep: { label: "Nastavit ochranu na míru", href: routes.navrhNaMiru },
      sources: [cnbInsuranceSource],
      searchTerms: ["pojištění nemovitosti", "pojištění domácnosti", "SVJ", "zástava"],
    },
    {
      id: "zivotni-vs-schopnost-splacet",
      question: "Životní pojištění, nebo pojištění schopnosti splácet?",
      directAnswer:
        "Životní pojištění lze nastavit na vybraná rizika a potřeby celé domácnosti, zatímco pojištění schopnosti splácet bývá navázané na konkrétní úvěr a balíček událostí. Ani jeden produkt není automaticky lepší. Porovnejte definice pracovní neschopnosti, invalidity, úmrtí, ztráty zaměstnání, limity a komu se plnění vyplácí.",
      explanation:
        "Nejdřív určete finanční dopad každého rizika: jak dlouho vystačí rezerva, jaké jsou státní dávky, další příjmy a nezbytné výdaje. Potom kontrolujte čekací a karenční doby, výluky, délku plnění a změny pojistného. U bankovního produktu zjistěte, zda zánik úvěru ukončí pojištění a zda plnění pokrývá splátky nebo zůstatek. U samostatné smlouvy prověřte, zda částky s časem odpovídají klesajícímu dluhu i potřebám rodiny.",
      example:
        "Krátká pracovní neschopnost může být pokryta rezervou, zatímco dlouhodobá invalidita vyžaduje vyšší a delší ochranu. Jediný balíček nemusí obě situace řešit stejně dobře.",
      commonMistake:
        "Porovnávat jen měsíční pojistné bez kontroly definice pojistné události a délky plnění.",
      nextStep: { label: "Probrat vhodné krytí", href: routes.kontakt },
      sources: [cnbInsuranceSource],
      searchTerms: ["životní pojištění", "schopnost splácet", "invalidita", "pracovní neschopnost"],
    },
    {
      id: "banka-sleva",
      question: "Má smysl bankovní pojištění kvůli slevě na hypotéce?",
      directAnswer:
        "Posuzujte současně cenu úvěru a kvalitu pojištění. Sleva na sazbě může snížit splátku, ale pojistné může být vyšší než úspora a krytí nemusí odpovídat vašim rizikům. Vyžádejte si nabídku s pojištěním i bez něj a písemně ověřte, co se sazbou nastane po zrušení produktu.",
      explanation:
        "Spočítejte čistý rozdíl plateb za stejné období fixace, ale ekonomiku neoddělujte od obsahu smlouvy. Prověřte výluky, čekací doby, maximální počet hrazených splátek a způsob změny pojistného. U skupinového pojištění může být pojistníkem banka a klient pojištěným; práva a proces hlášení se mohou lišit od individuální smlouvy. Jestli pojištění potřebujete, porovnejte bankovní produkt se samostatnou variantou se stejnými riziky, ne s nulovým krytím.",
      example:
        "Sleva ušetří část splátky, pojistné stojí více, ale kryje dlouhodobou invaliditu. Rozhodnutí nelze udělat jen odečtením cen; zvažte, zda limit skutečně stabilizuje rodinný rozpočet.",
      commonMistake:
        "Přijmout pojištění při podpisu a nikdy nezkontrolovat, zda krytí a oprávněné osoby odpovídají nové rodinné situaci.",
      nextStep: { label: "Porovnat ochranu a hypotéku", href: routes.navrhNaMiru },
      sources: [cnbInsuranceSource],
      vizId: "reserve-runway",
      searchTerms: ["sleva za pojištění", "bankovní pojištění", "pojistné", "úrok"],
    },
    {
      id: "vyluky",
      question: "Které výluky a omezení mám kontrolovat?",
      directAnswer:
        "Kontrolujte zejména dřívější onemocnění, riziková povolání a sporty, psychická onemocnění, bolesti zad, alkohol či jiné látky, úmyslné jednání a podmínky ztráty zaměstnání. Důležité jsou také čekací a karenční doby, minimální trvání události, maximální délka plnění a limity opakovaných událostí.",
      explanation:
        "Výluka znamená, že jinak podobná událost nemusí být kryta; definice pojistné události zase určuje, zda nárok vůbec vznikne. Čtěte pojistné podmínky spolu se záznamem z jednání a zdravotním dotazníkem. Odpovídejte pravdivě a úplně, protože neúplné údaje mohou komplikovat plnění. U ztráty zaměstnání prověřte, zda jsou kryty dohody, ukončení ve zkušební době, výpověď zaměstnancem nebo OSVČ. Nejasnosti si nechte potvrdit písemně před uzavřením.",
      example:
        "Produkt inzeruje krytí pracovní neschopnosti, ale plní až po stanovené karenční době a jen po omezený počet měsíců. Rezerva musí překlenout období před prvním plněním i dobu po jeho skončení.",
      commonMistake:
        "Spoléhat na název balíčku nebo prodejní leták místo smluvní definice a úplného seznamu výluk.",
      nextStep: { label: "Nechat zkontrolovat krytí", href: routes.kontakt },
      sources: [cnbInsuranceSource],
      searchTerms: ["výluky", "čekací doba", "karenční doba", "pojistné podmínky"],
    },
    {
      id: "osvc-pojisteni",
      question: "Jak má pojištění řešit OSVČ?",
      directAnswer:
        "OSVČ potřebuje plán založený na skutečném cash flow, protože výpadek práce může současně snížit osobní příjem i provoz firmy. Některá krytí ztráty zaměstnání se na podnikatele nevztahují. Důležitá bývá delší likvidní rezerva, vhodně definovaná pracovní neschopnost, invalidita a podle situace také pojištění provozních rizik.",
      explanation:
        "Sečtěte osobní nezbytné výdaje, splátky, firemní fixní náklady a odvody. Odečtěte příjmy, které pokračují i bez aktivní práce, a realistické dávky. U pojistky ověřte, z jakého základu se určuje plnění, zda pojistitel požaduje daňová přiznání a jak definuje neschopnost vykonávat konkrétní profesi. Sezónní příjmy modelujte po měsících. Rezerva a pojištění se doplňují: pojistka nemusí plnit okamžitě ani při každém obchodním výpadku.",
      example:
        "OSVČ s hypotékou potřebuje pokrýt domácnost i nájem provozovny. Tříměsíční osobní rezerva proto nemusí znamenat tříměsíční odolnost, pokud firma dál spotřebovává hotovost.",
      commonMistake:
        "Použít stejný plán jako zaměstnanec a předpokládat, že pokles zakázek je pojistnou událostí.",
      nextStep: { label: "Navrhnout rezervu a krytí", href: routes.navrhNaMiru },
      sources: [cnbInsuranceSource],
      vizId: "reserve-runway",
      searchTerms: ["OSVČ", "pojištění příjmu", "rezerva", "pracovní neschopnost"],
    },
    {
      id: "vinkulace-podpojisteni",
      question: "Co je vinkulace a proč hlídat podpojištění?",
      directAnswer:
        "Vinkulace omezuje výplatu pojistného plnění ve prospěch banky podle sjednaných podmínek, aby byla chráněna zastavená nemovitost a úvěr. Podpojištění vzniká, když je pojistná částka nebo limit příliš nízký vůči hodnotě, podle které se má majetek pojistit. Pojistitel pak může plnění přiměřeně snížit podle smlouvy a zákona.",
      explanation:
        "Pojistná částka stavby se obvykle nemá odvíjet od tržní kupní ceny ani zůstatku hypotéky, ale od nákladů na obnovu v rozsahu smlouvy. Po rekonstrukci, přístavbě nebo růstu stavebních cen ji aktualizujte. Zkontrolujte limity vedlejších staveb, technologií a odklízecích prací. U vinkulace zjistěte, kdy banka uvolní plnění přímo vám na opravu a kdy jej použije na dluh. Potvrzení o pojištění a vinkulaci doručte v termínu stanoveném bankou.",
      example:
        "Dům má vysokou tržní cenu kvůli pozemku, ale obnovovací náklad stavby je jiný. Naopak stará pojistná částka po rozsáhlé rekonstrukci může být nízká a vytvořit podpojištění.",
      commonMistake:
        "Nastavit pojistnou částku přesně na zůstatek hypotéky a po celou dobu ji nerevidovat.",
      nextStep: { label: "Zkontrolovat nastavení ochrany", href: routes.kontakt },
      sources: [cnbInsuranceSource],
      searchTerms: ["vinkulace", "podpojištění", "pojistná částka", "obnovovací hodnota"],
    },
    {
      id: "skoda",
      question: "Co dělat, když na zastavené nemovitosti vznikne škoda?",
      directAnswer:
        "Nejdřív zajistěte bezpečí osob a zabraňte dalším škodám, pokud je to možné bez rizika. Událost zdokumentujte fotografiemi, seznamem poškození a doklady, oznamte ji pojistiteli a u závažné škody také bance. S rozsáhlými opravami počkejte na pokyny, kromě nutných zabezpečovacích zásahů.",
      explanation:
        "Dodržte oznamovací povinnosti a uchovejte poškozené věci, dokud pojistitel nepovolí jejich likvidaci. Sepište časovou osu a náklady na nouzová opatření. Pokud je plnění vinkulováno, banka může požadovat rozpočet, faktury nebo kontrolu oprav před uvolněním peněz. U škody způsobené třetí osobou si zaznamenejte její údaje a případné svědky; podle situace volejte hasiče či policii. Nadále plaťte hypotéku, dokud se s bankou písemně nedohodnete jinak.",
      example:
        "Po havárii vody uzavřete přívod, nafotíte stav před úklidem, zavoláte asistenční službu a uschováte účty. Pojistitel a banka následně určí, jak doložit opravu a uvolnit vinkulované plnění.",
      commonMistake:
        "Kompletně uklidit a vyhodit poškozené věci před dokumentací nebo automaticky zastavit splátky úvěru.",
      nextStep: { label: "Probrat dopad škody", href: routes.kontakt },
      sources: [cnbInsuranceSource],
      searchTerms: ["pojistná událost", "škoda", "vinkulované plnění", "banka"],
    },
    {
      id: "hrozici-vypadek",
      question: "Co dělat, když hrozí výpadek příjmu a nezvládnu splátku?",
      directAnswer:
        "Jednejte ještě před prodlením. Sestavte krátkodobý rozpočet, zastavte zbytné výdaje, ověřte rezervu, dávky a pojistné nároky a kontaktujte banku. Banka může podle situace nabídnout individuální úpravu, ale odklad ani snížení splátky nejsou automatickým právem a mohou zvýšit celkové náklady.",
      explanation:
        "Připravte přehled příjmů, výdajů, dalších dluhů a očekávaného trvání výpadku. Bance popište problém realisticky a žádejte písemné varianty včetně dopadu na úroky, splatnost, registry a poplatky. Současně včas nahlaste pojistnou událost; čekání na plnění není důvod ignorovat splátku. Pokud je problém dlouhodobý, zvažte pronájem, dobrovolný prodej nebo restrukturalizaci dříve, než narostou sankce a možnosti se zúží.",
      example:
        "Při oznámené ztrátě práce spočítáte počet měsíců do vyčerpání rezervy. Okamžitě doložíte událost pojišťovně a ještě před první chybějící splátkou projednáte s bankou dvě písemné varianty.",
      commonMistake:
        "Čekat na upomínku nebo si vzít drahý krátkodobý úvěr bez posouzení celého dluhového zatížení.",
      nextStep: { label: "Řešit situaci včas", href: routes.kontakt },
      sources: [cnbInsuranceSource],
      vizId: "reserve-runway",
      searchTerms: ["výpadek příjmu", "nezvládám splátku", "odklad splátek", "rezerva"],
    },
  ],
  checklist: [
    "Znám počet měsíců, které pokryje likvidní rezerva.",
    "Rozumím výlukám, čekacím dobám a limitům plnění.",
    "Pojistná částka nemovitosti odpovídá nákladům na obnovu.",
    "Po změně rodiny, práce nebo rekonstrukci pojistky reviduji.",
    "Při hrozícím problému kontaktuji banku ještě před prodlením.",
  ],
  updatedAt: "2026-09-21",
} satisfies PracticeGuide;

export default pojisteniVypadekPrijmuGuide;
