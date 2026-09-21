import type { PracticeGuide } from "@/lib/academy/practice/types";
import { routes } from "@/lib/routes";

export const GUIDE_PRIJMY: PracticeGuide = {
  slug: "prijmy-osvc-zkusebni",
  title: "Příjmy, OSVČ a zkušební doba",
  cardBlurb:
    "Jak banky posuzují zaměstnání, podnikání, rodičovskou, zahraniční mzdu i méně běžné příjmy.",
  sampleQuestions: [
    "Dostanu hypotéku ve zkušební době?",
    "Jak banka počítá příjem OSVČ?",
    "Uzná nájem, bonusy nebo zahraniční mzdu?",
  ],
  tags: ["prijmy"],
  icon: "briefcase",
  relatedLessonSlugs: ["dsti"],
  cta: { label: "Posoudit příjmy na míru", href: routes.navrhNaMiru },
  answers: [
    {
      id: "zkusebni-doba",
      question: "Mohu získat hypotéku ve zkušební době?",
      directAnswer:
        "Je to obtížnější a záleží na metodice banky. Některá žádost odloží do skončení zkušební doby, jiná posoudí kontinuitu oboru, předchozí zaměstnání a dalšího žadatele. Rozhodující je stav při schválení nebo čerpání podle podmínek banky, ne pouze den podání.",
      explanation:
        "Zkušební doba zvyšuje nejistotu, protože pracovní poměr lze snáze ukončit. Banka může chtít pracovní smlouvu, výpisy, potvrzení zaměstnavatele a několik přijatých mezd. Plynulý přechod mezi zaměstnavateli ve stejném oboru pomáhá vysvětlit stabilitu, ale nezakládá nárok na uznání příjmu. Pokud již běží rezervace, slaďte termíny s koncem zkušební doby a nepočítejte s výjimkou. Změnu zaměstnání během procesu bance oznamte; zamlčení může ohrozit schválení i čerpání. Jde o interní úvěrovou metodiku, nikoli obecný zákonný zákaz hypotéky.",
      example:
        "Žadatel nastoupil před měsícem na lépe placené místo a zkušební doba končí za dva měsíce. Banka může příjem zatím neuznat. Řešením může být delší rezervační lhůta, doložení příjmu spolužadatele nebo odklad žádosti, nikoli upravené datum v potvrzení.",
      commonMistake:
        "Podepsat rezervaci s krátkou lhůtou a teprve potom zjistit, že banka čeká na konec zkušební doby.",
      nextStep: { label: "Prověřit pracovní situaci", href: routes.navrhNaMiru },
      vizId: "income-switcher",
      searchTerms: ["hypotéka zkušební doba", "nové zaměstnání", "změna práce"],
    },
    {
      id: "doba-urcita",
      question: "Vadí pracovní smlouva na dobu určitou?",
      directAnswer:
        "Nemusí být překážkou, ale banka zkoumá konec smlouvy, délku dosavadního zaměstnání, opakovaná prodloužení a obor. Čím dříve smlouva končí a čím kratší je historie, tím větší nejistota. Některé banky požadují potvrzení o plánovaném pokračování, jiné mají vlastní minimální podmínky.",
      explanation:
        "Doba určitá není totéž co zkušební doba. Banka může akceptovat dlouhodobě obnovovanou smlouvu ve stabilním odvětví, zatímco první tříměsíční kontrakt vyhodnotí opatrněji. Potvrzení zaměstnavatele o záměru prodloužit pomáhá, ale není právní garancí budoucího zaměstnání. Posuzuje se také, zda smlouva neskončí před plánovaným čerpáním. Rozdíly jsou bankovní metodika; jednoduchá online kalkulačka je neumí zachytit. Při společné žádosti může stabilnější druhý příjem snížit riziko, ale započtou se i závazky druhé osoby.",
      example:
        "Učitel má třetí navazující roční smlouvu a doloží pravidelné mzdy. Jiný žadatel nastoupil na šest měsíců do zcela nového oboru. Přestože mají stejný příjem, banka může stabilitu hodnotit odlišně a vyžádat jiné podklady.",
      commonMistake:
        "Uvést pouze měsíční mzdu a přehlédnout, že pracovní smlouva končí před čerpáním.",
      nextStep: { label: "Posoudit doložitelnost příjmu", href: routes.navrhNaMiru },
      searchTerms: ["doba určitá hypotéka", "pracovní smlouva", "prodloužení smlouvy"],
    },
    {
      id: "bonusy-dpp",
      question: "Uzná banka bonusy, přesčasy, DPP nebo DPČ?",
      directAnswer:
        "Pravidelné a doložené bonusy či přesčasy může banka průměrovat, jednorázové částky často krátí nebo vynechá. Příjem z DPP či DPČ lze někdy uznat, pokud má dostatečnou historii a pokračování, ale pravidla se liší. Samotný poslední vysoký měsíc obvykle nestačí.",
      explanation:
        "Banka porovnává potvrzení zaměstnavatele, pracovní dokumenty a pohyby na účtu za více měsíců. Rozlišuje pevnou mzdu, pohyblivou složku a náhrady, které nemusí být příjmem použitelným pro splácení. U dohod se zkoumá délka, pravidelnost, limity a vztah k hlavnímu zaměstnání. Daňové a odvodové zacházení stanoví právní předpisy, ale míru uznání pro hypotéku určuje banka. Příjem uvádějte tak, jak jej lze doložit; před podáním žádosti má smysl spočítat konzervativní průměr a scénář bez bonusů.",
      example:
        "Základní čistá mzda je 38 000 Kč, čtvrtletní bonusy v průměru 6 000 Kč měsíčně a DPP 5 000 Kč běží teprve dva měsíce. Banka může uznat základ, část bonusů a dohodu zatím vynechat. Výsledek tedy nebude 49 000 Kč.",
      commonMistake:
        "Považovat všechny příchozí platby na účet za plně uznatelnou čistou mzdu.",
      nextStep: { label: "Spočítat bezpečnou splátku", href: routes.kalkulacky.rodinnyRozpocet },
      searchTerms: ["bonus hypotéka", "DPP příjem", "DPČ banka", "přesčasy"],
    },
    {
      id: "osvc-delka",
      question: "Jak dlouho musím podnikat, aby banka uznala příjem OSVČ?",
      directAnswer:
        "Univerzální zákonná lhůta neexistuje. Banky běžně chtějí alespoň uzavřené zdaňovací období, často více, ale některé umějí posoudit kratší historii za stanovených podmínek. Rozhoduje kontinuita podnikání, obor, doložené výsledky, bezdlužnost a konkrétní bankovní metodika.",
      explanation:
        "Banka obvykle požaduje daňová přiznání a potvrzení o podání či zaplacení daně, někdy také výpisy, účetní výkazy, přehledy pro správu sociálního zabezpečení a zdravotní pojišťovnu nebo potvrzení bezdlužnosti. Přerušení živnosti, výrazný propad výsledků či změna oboru vyžadují vysvětlení. Nově založené podnikání nelze automaticky nahradit předchozí zaměstnaneckou mzdou, i když zkušenost v oboru může být podpůrným faktem. Daňové povinnosti určuje stát; převod daňových dat na uznaný příjem je model banky.",
      example:
        "Grafik podniká 14 měsíců a má jedno podané přiznání, zatímco řemeslník podniká čtyři roky s rostoucími výsledky. První může najít banku s kratší požadovanou historií, ale výběr bude užší a bude třeba doložit aktuální obrat.",
      commonMistake:
        "Začít řešit hypotéku až po podání přiznání, které bylo optimalizováno bez ohledu na plánované financování.",
      nextStep: { label: "Prověřit variantu pro OSVČ", href: routes.navrhNaMiru },
      sources: [
        {
          label: "Finanční správa",
          url: "https://www.financnisprava.cz/",
          checkedAt: "2026-09-21",
          notes: "Oficiální informace k daňovým přiznáním a daňovým povinnostem.",
        },
      ],
      searchTerms: ["OSVČ hypotéka", "délka podnikání", "daňové přiznání banka"],
    },
    {
      id: "pausal-vs-pausalni-dan",
      question: "Jaký je rozdíl mezi výdajovým paušálem a paušální daní pro banku?",
      directAnswer:
        "Výdajový paušál je způsob stanovení výdajů v daňovém přiznání. Paušální režim je zvláštní daňový režim s jednou pravidelnou platbou a zpravidla bez standardního přiznání při splnění podmínek. Banka proto u každé varianty získává jiné podklady a používá jiný výpočet příjmu.",
      explanation:
        "U výdajového paušálu banka vidí příjmy a základ daně v přiznání, ale může použít vlastní procento či obratový model. U paušálního režimu si často vyžádá výpisy z podnikatelského účtu, evidenci faktur, potvrzení o režimu a délku historie. Jednotný bankovní vzorec neexistuje. Daňově výhodná volba nemusí být nejvýhodnější pro bonitu, ale režim neměňte pouze podle orientačního slibu o úvěru; zvažte daně, administrativu a dlouhodobý podnikatelský plán s daňovým odborníkem.",
      example:
        "Dva živnostníci mají obrat 1,2 milionu Kč. Jeden podává přiznání s výdajovým paušálem, druhý je v paušálním režimu. Banka může u prvního vycházet z řádků přiznání a u druhého z pohybů na účtu, takže uznaný příjem se může lišit.",
      commonMistake:
        "Zaměňovat oba pojmy a poslat bance dokumenty, které v daném daňovém režimu nevysvětlují skutečný obrat.",
      nextStep: { label: "Posoudit bankovní metodiky", href: routes.navrhNaMiru },
      sources: [
        {
          label: "Finanční správa",
          url: "https://www.financnisprava.cz/",
          checkedAt: "2026-09-21",
          notes: "Oficiální podmínky paušálního režimu a daňových přiznání.",
        },
      ],
      searchTerms: ["paušální daň hypotéka", "výdajový paušál", "OSVČ příjem"],
    },
    {
      id: "obrat",
      question: "Může banka počítat příjem OSVČ z obratu?",
      directAnswer:
        "Některé banky používají u vybraných profesí a režimů obratový model: z doložených tržeb uznají určitou část jako příjem. Není to totéž co skutečný zisk ani obecné právo žadatele. Procento, minimální historie, uznávané obory a stropy jsou interní metodika banky.",
      explanation:
        "Obratový výpočet může pomoci podnikateli s vysokým daňovým paušálem, ale ne každý příchozí převod je tržba a ne každý obrat je stabilní. Banka může vycházet z daňového přiznání, účetních výkazů, fakturace nebo výpisů a odečíst vratky či jednorázové položky. Sezónnost, závislost na jednom odběrateli a meziroční pokles mohou vést ke krácení. Porovnání bank musí používat stejná vstupní data a zároveň zohlednit sazbu, poplatky i požadované zajištění; vyšší uznaný příjem sám o sobě neznamená lepší úvěr.",
      example:
        "Konzultant fakturuje 2 miliony Kč ročně, ale jeho daňový základ je po paušálu výrazně nižší. Jedna banka použije základ daně, druhá za splnění podmínek část obratu. Výsledné úvěrové možnosti se liší, přestože daňové dokumenty jsou totožné.",
      commonMistake:
        "Dosadit celý roční obrat jako čistý příjem a podle něj rezervovat nemovitost.",
      nextStep: { label: "Porovnat varianty OSVČ", href: routes.navrhNaMiru },
      sources: [
        {
          label: "Finanční správa",
          url: "https://www.financnisprava.cz/",
          checkedAt: "2026-09-21",
          notes: "Daňové pojmy a podklady; konkrétní uznání obratu je metodika banky.",
        },
      ],
      searchTerms: ["hypotéka z obratu", "obratový model", "příjem podnikatele"],
    },
    {
      id: "materska-rodicovska",
      question: "Uzná banka mateřskou nebo rodičovský příspěvek?",
      directAnswer:
        "Některé banky tyto příjmy uznávají celé nebo částečně, často jako doplňkové. Současně zohlední dítě v nákladech domácnosti a může chtít informace o návratu do práce. Výsledek závisí na druhém příjmu, délce čerpání, předchozím zaměstnání a metodice banky.",
      explanation:
        "Peněžitá pomoc v mateřství a rodičovský příspěvek jsou odlišné dávky s jiným trváním a doložením. Banka může pracovat s aktuální částkou, potvrzením příslušného orgánu, pracovní smlouvou a plánem návratu. Budoucí mzdu bez jistého a doložitelného návratu nemusí započítat. Při modelování rozpočtu počítejte také s náklady na péči o dítě a možností, že se návrat či rozsah úvazku změní. Úvěr by měl být zvládnutelný v období nižšího příjmu, ne pouze po plánovaném návratu.",
      example:
        "Jeden partner vydělává 55 000 Kč, druhý pobírá rodičovský příspěvek a za rok se chce vrátit na částečný úvazek. Banka může uznat současnou dávku podle své metodiky, ale očekávanou budoucí mzdu bez dodatku či potvrzení nezahrne.",
      commonMistake:
        "Počítat současně plnou dávku i budoucí plnou mzdu, přestože se časově nepřekrývají.",
      nextStep: { label: "Nastavit rodinný rozpočet", href: routes.kalkulacky.rodinnyRozpocet },
      searchTerms: ["mateřská hypotéka", "rodičovský příspěvek", "návrat do práce"],
    },
    {
      id: "zahranicni-mzda",
      question: "Lze získat hypotéku se zahraniční mzdou?",
      directAnswer:
        "Ano, ale výběr bank bývá užší a příjem může být krácen kvůli měnovému, právnímu či dokumentačnímu riziku. Banka zkoumá zemi zaměstnavatele, měnu, daňovou rezidenci, pracovní smlouvu, historii výplat a pobytový status. Překlady nebo další doklady mohou proces prodloužit.",
      explanation:
        "Příjem v eurech z dlouhodobého pracovního poměru v EU může být posouzen jinak než příjem v kolísavé měně nebo od vzdáleného zaměstnavatele. Banka převádí částky vlastním kurzem a může použít rezervu proti oslabení měny. Řeší také, zda úvěr a příjem nevytvářejí cizoměnové riziko podle příslušných pravidel. Daňové přiznání, výplatní pásky a výpisy musí být vzájemně konzistentní. Nabídku porovnávejte až po ověření akceptace konkrétní země a měny, nikoli jen podle veřejné sazby.",
      example:
        "Žadatel bydlí v Česku a dostává 3 000 EUR měsíčně od německého zaměstnavatele. Banka nemusí převést celý příjem aktuálním kurzem; použije vlastní kurz a bezpečnostní krácení. Jiná banka může cizí příjem nepřijmout vůbec.",
      commonMistake:
        "Přepočítat mzdu nejvýhodnějším denním kurzem a očekávat, že banka uzná stejnou korunovou částku.",
      nextStep: { label: "Prověřit zahraniční příjem", href: routes.navrhNaMiru },
      searchTerms: ["zahraniční příjem", "mzda v eurech", "hypotéka cizinec"],
    },
    {
      id: "najem-dividendy-jednatel",
      question: "Jak banka počítá nájem, dividendy a odměnu jednatele?",
      directAnswer:
        "Nájemné banka často krátí o náklady a riziko neobsazenosti. Dividendy obvykle vyžadují delší historii a nemusí být považovány za pravidelný příjem. Odměnu jednatele posuzuje podle smlouvy, výplat a výsledků společnosti. Každá složka má vlastní doklady a metodiku.",
      explanation:
        "U nájmu se dokládá nájemní smlouva, vlastnictví, příchozí platby a někdy daňové přiznání; budoucí nájem z kupované nemovitosti přijímají jen některé produkty a s krácením. Dividenda závisí na rozhodnutí o rozdělení zisku, takže jedna mimořádná výplata není totéž co mzda. U jednatele banka zkoumá vztah ke společnosti, pravidelnost odměny i finanční zdraví firmy a může propojit posouzení s podnikatelskými výsledky. Daňové zacházení dokládají oficiální dokumenty, avšak uznání do bonity zůstává rozhodnutím banky.",
      example:
        "Žadatel má 20 000 Kč nájemného, 25 000 Kč odměnu jednatele a jednou ročně dividendu. Banka může nájem krátit, odměnu uznat po ověření společnosti a dividendu zprůměrovat jen při víceleté historii. Součet příchozích plateb tedy není automaticky uznaný příjem.",
      commonMistake:
        "Sečíst hrubé nájemné, jednorázovou dividendu a odměnu bez zohlednění historie a nákladů.",
      nextStep: { label: "Analyzovat složený příjem", href: routes.navrhNaMiru },
      sources: [
        {
          label: "Finanční správa",
          url: "https://www.financnisprava.cz/",
          checkedAt: "2026-09-21",
          notes: "Oficiální daňové informace; bankovní uznání příjmů se liší.",
        },
      ],
      searchTerms: ["příjem z nájmu", "dividenda hypotéka", "odměna jednatele"],
    },
  ],
  updatedAt: "2026-09-21",
};
