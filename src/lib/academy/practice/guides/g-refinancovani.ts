import type { PracticeGuide } from "@/lib/academy/practice/types";
import { routes } from "@/lib/routes";

const creditActSource = {
  label: "e-Sbírka — zákon č. 257/2016 Sb., o spotřebitelském úvěru",
  url: "https://www.e-sbirka.cz/sb/2016/257",
  notes: "Pravidla předčasného splacení a náhrady nákladů v aktuálním znění.",
};

const cnbSource = {
  label: "ČNB — spotřebitelský úvěr",
  url: "https://www.cnb.cz/cs/dohled-financni-trh/ochrana-spotrebitele/spotrebitelsky-uver/",
  notes: "Spotřebitelské informace k úvěrové smlouvě a právům klienta.",
};

export const mimoradneSplatkyRefinancovaniGuide = {
  slug: "mimoradne-splatky-refinancovani",
  title: "Mimořádné splátky a refinancování",
  cardBlurb:
    "Kdy úvěr měnit, jak číst vyčíslení banky a co prověřit před mimořádnou splátkou.",
  sampleQuestions: [
    "Kdy mohu hypotéku splatit bez náhrady nákladů?",
    "Je lepší snížit splátku, nebo zkrátit splatnost?",
    "Co zařídit před koncem fixace?",
  ],
  tags: ["splacim"],
  icon: "refreshCw",
  relatedLessonSlugs: ["fixace"],
  cta: { label: "Prověřit refinancování", href: routes.refinanceRadar },
  answers: [
    {
      id: "refixace-vs-refinancovani",
      question: "Jaký je rozdíl mezi refixací a refinancováním?",
      directAnswer:
        "Refixace znamená, že po konci fixace pokračujete u stejné banky s novou sazbou a podmínkami. Refinancování znamená splacení dosavadní hypotéky novým úvěrem od jiné banky. V obou případech porovnávejte nejen sazbu, ale také zůstatek, délku splatnosti, vedlejší produkty, náklady převodu a smluvní flexibilitu.",
      explanation:
        "Nabídka stávající banky bývá administrativně jednodušší, ale nemusí být nejlepší. Nová banka znovu posoudí příjmy, závazky, nemovitost a dokumentaci; schválení proto není jisté. Refinancování může vyžadovat nový odhad, zástavní dokumenty a koordinaci výmazu a zápisu zástavy. U každé varianty si vyžádejte splátku, RPSN, celkový náklad během srovnávané fixace a zůstatek po ní. Prodloužení splatnosti může splátku snížit, ale samo o sobě neznamená úsporu.",
      example:
        "Stávající banka nabídne vyšší sazbu bez poplatků, konkurence nižší sazbu s placeným pojištěním a delší splatností. Srovnání musí sjednotit splatnost a zahrnout povinné náklady, jinak zvýhodní jednu variantu jen účetně.",
      commonMistake:
        "Porovnávat jen novou měsíční splátku a přehlédnout, že se dluh bude splácet déle.",
      nextStep: { label: "Porovnat varianty refinancování", href: routes.refinanceRadar },
      sources: [cnbSource],
      vizId: "refinance-compare",
      searchTerms: ["refixace", "refinancování", "změna banky", "konec fixace"],
    },
    {
      id: "konec-fixace",
      question: "Co mám udělat před koncem fixace?",
      directAnswer:
        "Začněte s předstihem: zjistěte přesné datum konce fixace, očekávaný zůstatek a termín, do kdy můžete přijmout nabídku stávající banky. Současně si připravte doklady a oslovte konkurenci. Cílem není podepsat co nejdřív, ale mít včas schválenou alternativu a prostor pro vyjednávání.",
      explanation:
        "Zkontrolujte, zda se od sjednání změnil příjem, vlastnictví, účel nemovitosti nebo zápisy na listu vlastnictví. Vyžádejte si podmínky nové sazby písemně a porovnejte stejnou fixaci i splatnost. Ověřte platnost nabídky a způsob rezervace sazby; trh se může do data refixace změnit. Pokud chcete přejít, nová banka musí stihnout schválení, podpis, zástavu i odeslání peněz podle vyčíslení původní banky. Předčasné splacení k datu konce fixace koordinujte přesnými instrukcemi bank.",
      example:
        "Máte-li konec fixace za několik měsíců, připravíte příjmové doklady a nabídky nyní, ale u každé banky ověříte, zda garantovaná sazba skutečně pokryje plánované datum čerpání.",
      commonMistake:
        "Začít řešit změnu až po automatickém přijetí nové sazby nebo několik dní před rozhodným datem.",
      nextStep: { label: "Spustit kontrolu refinancování", href: routes.refinanceRadar },
      sources: [cnbSource, creditActSource],
      vizId: "refinance-compare",
      searchTerms: ["konec fixace", "nová sazba", "nabídka banky", "vyčíslení"],
    },
    {
      id: "kdy-prejit",
      question: "Kdy se vyplatí přejít k jiné bance?",
      directAnswer:
        "Přechod dává smysl, když čistá úspora a lepší podmínky převáží náklady, administrativu a rizika změny. Neexistuje univerzální rozdíl sazeb, od kterého se refinancování vždy vyplatí. Rozhodují zůstatek, zbývající splatnost, délka nové fixace, povinné služby, náklady na přechod a vaše budoucí plány.",
      explanation:
        "Modelujte obě varianty ke stejnému datu a na stejném horizontu. Zahrňte splátky, jednorázové náklady, povinné produkty a zůstatek jistiny na konci horizontu. Zvlášť posuďte poplatek či náhradu za předčasné splacení podle konkrétního právního režimu a vyčíslení banky. Kvalitativně zvažte možnost mimořádných splátek, změn zástavy nebo prodeje. Pokud plánujete brzký prodej, dlouhá fixace s lepší sazbou nemusí být nejpraktičtější.",
      example:
        "Nižší sazba přinese měsíční úsporu, ale nový odhad, placený účet a pojištění část výhody smažou. Konečný rozdíl získáte až po započtení všech plateb a zůstatku, nikoli násobením rozdílu splátek.",
      commonMistake:
        "Přičíst celé nové splátky jako náklad, ale ignorovat, že jejich část splácí jistinu a snižuje zůstatek.",
      nextStep: { label: "Spočítat refinancování", href: routes.refinanceRadar },
      sources: [cnbSource, creditActSource],
      vizId: "refinance-compare",
      searchTerms: ["vyplatí se refinancování", "úspora", "změna banky"],
    },
    {
      id: "splatit-bez-nahrady",
      question: "Kdy lze hypotéku splatit bez náhrady nákladů?",
      directAnswer:
        "Zákon stanoví situace, kdy věřitel nemá právo na náhradu nákladů za předčasné splacení, ale podmínky je nutné ověřit podle aktuálního znění zákona a vaší smlouvy. Typicky je zásadní konec fixace, zákonné časové okno po oznámení nové sazby a některé životní či majetkové situace.",
      explanation:
        "Nezaměňujte zákonný strop náhrady s částkou, kterou banka skutečně požaduje. Skutečná částka může být nižší nebo nulová a banka ji musí vyčíslit pro konkrétní datum a důvod. Pravidla se navíc mohou lišit podle data uzavření smlouvy, refixace a přechodných ustanovení. Před odesláním peněz požádejte banku o písemné vyčíslení jistiny, úroku, případné náhrady a platebních instrukcí. Uveďte důvod i zamýšlené datum splacení.",
      example:
        "Jestliže zákon pro váš případ připouští náhradu do určitého stropu, neznamená to automaticky, že banka strop naúčtuje. Rozhodující je její doložené vyčíslení podle použitelného režimu.",
      commonMistake:
        "Vzít zákonný limit jako pevný poplatek nebo použít pravidlo z internetu bez kontroly data smlouvy.",
      nextStep: { label: "Prověřit možnosti refinancování", href: routes.refinanceRadar },
      sources: [creditActSource, cnbSource],
      searchTerms: ["předčasné splacení zdarma", "náhrada nákladů", "konec fixace"],
    },
    {
      id: "pravni-rezim",
      question: "Proč záleží na právním režimu mojí smlouvy?",
      directAnswer:
        "Pravidla předčasného splacení se v čase měnila a novelizace mohou mít přechodná ustanovení. Nestačí znát jen datum podpisu; relevantní může být také datum, kdy začalo nové fixační období. Správný režim určuje, jaké výjimky, způsob výpočtu a zákonné omezení náhrady se na úvěr použijí.",
      explanation:
        "Najděte smlouvu, dodatky a oznámení o poslední změně sazby. Bance položte konkrétní dotaz s datem zamýšleného splacení a požádejte o rozpis výpočtu. Pokud je částka významná nebo je právní režim sporný, nespoléhejte na obecnou kalkulačku; nechte dokumenty posoudit odborníkem. Zákonný strop pouze omezuje možný požadavek banky. Skutečné vyčíslení závisí na smlouvě, důvodu, datu a zákonném výpočtu a může být nižší.",
      example:
        "Dva úvěry sjednané v různých letech mohou být ve stejný den spláceny podle odlišných přechodných pravidel. Rozdíl může způsobit i refixace, která aktivovala novější režim.",
      commonMistake:
        "Použít dnešní pravidla automaticky na každou starší hypotéku bez kontroly přechodných ustanovení.",
      nextStep: { label: "Připravit varianty refinancování", href: routes.refinanceRadar },
      sources: [creditActSource],
      searchTerms: ["právní režim", "přechodná ustanovení", "datum smlouvy", "refixace"],
    },
    {
      id: "vyrocni-splatka",
      question: "Jak funguje výroční mimořádná splátka?",
      directAnswer:
        "Zákon umožňuje v určeném období před výročím uzavření smlouvy splatit stanovenou část celkové výše spotřebitelského úvěru na bydlení bez náhrady nákladů. Přesný rozsah a načasování ověřte v aktuálním zákoně a u banky, protože rozhoduje typ úvěru, výroční datum a použitelné znění pravidel.",
      explanation:
        "Nejdřív si nechte potvrdit rozhodné výročí a lhůtu pro oznámení či provedení splátky. Banka vám sdělí účet, variabilní symbol a datum připsání. Současně si zvolte, zda po splátce chcete snížit pravidelnou splátku, nebo zkrátit splatnost, pokud banka obě možnosti nabízí. Peníze neposílejte jako běžný převod bez instrukcí: mohly by zůstat na technickém účtu nebo se nezaúčtovat zamýšleným způsobem.",
      example:
        "Máte volné prostředky a blíží se výročí smlouvy. Než je odešlete, banka písemně potvrdí beznákladové okno, maximální část v tomto režimu a nový splátkový plán.",
      commonMistake:
        "Zaměnit výročí podpisu smlouvy s výročím čerpání, fixace nebo kalendářním rokem.",
      nextStep: { label: "Porovnat dopad mimořádné splátky", href: routes.kalkulacky.root },
      sources: [creditActSource],
      searchTerms: ["výroční splátka", "mimořádná splátka", "výročí smlouvy"],
    },
    {
      id: "prodej-nemoc-sjm",
      question: "Co platí při prodeji, vážné nemoci nebo vypořádání SJM?",
      directAnswer:
        "Zákon zná zvláštní situace, v nichž může být předčasné splacení bez náhrady nebo s jiným režimem, například při některých životních událostech či prodeji financované nebo zastavené nemovitosti po splnění podmínek. Nejde však o automatickou výjimku pro každý prodej, nemoc nebo rozchod.",
      explanation:
        "Podmínky mohou zahrnovat minimální dobu od uzavření smlouvy, konkrétní důvod a dokumenty prokazující dopad na schopnost splácet. U vypořádání společného jmění navíc samotná dohoda mezi partnery neodstraňuje závazek vůči bance. Před podpisem kupní či majetkové dohody požádejte banku o vyčíslení a seznam podkladů. Rozlišujte zákonný strop náhrady od skutečné bankovní částky; až písemné vyčíslení ukáže, co banka pro dané datum požaduje.",
      example:
        "Při prodeji banka může chtít kupní smlouvu a naplánovat splacení z úschovy. U nemoci může požadovat dokumentaci prokazující zákonné podmínky. Postup proto řešte před nastavením termínů transakce.",
      commonMistake:
        "Předpokládat, že prodej zástavy vždy znamená bezplatné splacení bez časových a dokumentačních podmínek.",
      nextStep: { label: "Probrat konkrétní situaci", href: routes.kontakt },
      sources: [creditActSource],
      searchTerms: ["prodej nemovitosti", "vážná nemoc", "SJM", "předčasné splacení"],
    },
    {
      id: "zkratit-nebo-snizit",
      question: "Po mimořádné splátce zkrátit dobu, nebo snížit splátku?",
      directAnswer:
        "Zkrácení splatnosti obvykle více omezí budoucí úroky, protože zachová vyšší měsíční tempo splácení. Snížení splátky naopak zlepší měsíční cash flow a odolnost rozpočtu. Nejlepší volba závisí na rezervě, stabilitě příjmů, sazbě a na tom, zda rozdíl skutečně odkládáte nebo investujete.",
      explanation:
        "Vyžádejte si od banky oba nové splátkové kalendáře; některé banky mohou změnu řešit odlišně nebo účtovat administrativní úkon. Porovnejte celkové budoucí úroky, datum doplacení a minimální rezervu po odeslání mimořádné splátky. Neposílejte všechny úspory do nelikvidního bydlení, pokud by vás běžný výpadek příjmu donutil k drahému úvěru. U investiční alternativy pracujte s výnosem po daních, poplatcích a riziku, nikoli s garantovaným číslem.",
      example:
        "Domácnost s kolísavým příjmem může zvolit nižší povinnou splátku a dobrovolně posílat přebytky. Stabilní domácnost s dostatečnou rezervou může preferovat kratší splatnost a rychlejší pokles úroků.",
      commonMistake:
        "Zkrátit splatnost za cenu vyčerpání rezervy nebo snížit splátku a celý rozdíl nepozorovaně spotřebovat.",
      nextStep: { label: "Otevřít hypoteční kalkulačku", href: routes.kalkulacky.hypotecniKalkulacka },
      sources: [cnbSource],
      vizId: "refinance-compare",
      searchTerms: ["zkrácení splatnosti", "snížení splátky", "mimořádná splátka"],
    },
    {
      id: "refinancovani-navyseni",
      question: "Lze při refinancování hypotéku navýšit?",
      directAnswer:
        "Ano, nová banka může při refinancování schválit vyšší úvěr, ale navýšení posuzuje jako nové financování. Znovu prověří příjmy, závazky, hodnotu zástavy a účel dodatečných peněz. Schválení původního zůstatku neznamená automatické schválení navýšení ani stejné cenové podmínky pro celou částku.",
      explanation:
        "Připravte rozpočet účelu, doklady o příjmu a aktuální ocenění nemovitosti. U rekonstrukce se může lišit způsob čerpání a požadované faktury či kontroly. Neúčelová část může mít jinou sazbu, splatnost nebo limit. Posuďte také, zda navýšení nezvedne LTV do dražšího pásma. Nabídku porovnávejte s alternativou ponechat hypotéku a dodatečnou potřebu financovat zvlášť; sjednocená nižší splátka může skrývat delší splácení spotřeby.",
      example:
        "Při převodu zůstatku chcete získat prostředky na rekonstrukci. Banka může schválit účelovou část po etapách a požadovat doložení použití, takže harmonogram stavby musí odpovídat čerpání.",
      commonMistake:
        "Rozložit krátkodobý výdaj do celé zbývající splatnosti hypotéky a hodnotit jen nízkou měsíční splátku.",
      nextStep: { label: "Prověřit refinancování s navýšením", href: routes.refinanceRadar },
      sources: [cnbSource],
      vizId: "refinance-compare",
      searchTerms: ["navýšení hypotéky", "rekonstrukce", "refinancování", "LTV"],
    },
  ],
  checklist: [
    "Znám datum konce fixace a očekávaný zůstatek.",
    "Mám písemné vyčíslení banky pro konkrétní datum.",
    "Ověřil jsem právní režim smlouvy a refixace.",
    "Porovnávám stejnou splatnost, fixaci a povinné služby.",
    "Po mimořádné splátce mi zůstane bezpečná rezerva.",
  ],
  updatedAt: "2026-09-21",
} satisfies PracticeGuide;

export default mimoradneSplatkyRefinancovaniGuide;
