import { routes } from "@/lib/routes";
import {
  DEFAULT_DERIVATIVES,
  EMPTY_MEDIA_PLANNED,
  type AcademyLesson,
} from "@/lib/academy/types";

function lesson(
  partial: Omit<AcademyLesson, "media" | "derivatives" | "updatedAt"> & {
    media?: AcademyLesson["media"];
    derivatives?: AcademyLesson["derivatives"];
    updatedAt?: string;
  }
): AcademyLesson {
  return {
    ...partial,
    media: partial.media ?? EMPTY_MEDIA_PLANNED(),
    derivatives: partial.derivatives ?? DEFAULT_DERIVATIVES(partial.slug),
    updatedAt: partial.updatedAt ?? "2026-07-19",
  };
}

export const ACADEMY_LESSONS: AcademyLesson[] = [
  lesson({
    slug: "ltv",
    title: "LTV (Loan to Value)",
    shortLabel: "LTV",
    description:
      "Poměr úvěru k hodnotě nemovitosti — klíčový limit hypotečního rizika.",
    simplySaid:
      "LTV říká, jak velkou část ceny (nebo odhadu) platíte úvěrem a kolik vlastními penězi. Vyšší LTV = méně vlastních peněz a vyšší páka.",
    realExample:
      "Kupujete byt za 5 000 000 Kč, banka půjčí 4 000 000 Kč. LTV = 80 %. Vlastní kapitál je 1 000 000 Kč (20 %).",
    howCalculated:
      "LTV (%) = (výše úvěru ÷ zástavní / odhadní hodnota) × 100. Banka počítá z odhadu, ne nutně z kupní ceny.",
    bankOrInvestor:
      "Banka sleduje LTV jako limit rizika. U vlastního bydlení bývá horní rámec kolem 80 % (u mladších žadatelů někdy výše dle interních pravidel). U investic bývá přísnější. Investor LTV používá i jako měřítko páky a cushion při poklesu cen.",
    commonMistake:
      "Zaměnit kupní cenu za odhadní. Když odhad vyjde níž, LTV vyskočí a rozdíl doplácíte z vlastních zdrojů.",
    calculator: "ltv",
    quiz: [
      {
        id: "ltv-q1",
        prompt: "Úvěr 4 mil. Kč, odhad 5 mil. Kč. Jaké je LTV?",
        options: ["70 %", "80 %", "90 %", "125 %"],
        correctIndex: 1,
        explain: "4 ÷ 5 = 0,8 → 80 %.",
      },
      {
        id: "ltv-q2",
        prompt: "Co banka typicky použije ve jmenovateli LTV?",
        options: [
          "Jen kupní cenu z inzerátu",
          "Odhadní / zástavní hodnotu",
          "Cenu z Majetio skóre",
          "Cenu po 10 letech",
        ],
        correctIndex: 1,
        explain: "Rozhoduje odhad banky (zástavní hodnota), ne marketingová cena.",
      },
    ],
    faq: [
      {
        q: "Je LTV 80 % schválení hypotéky?",
        a: "Ne. LTV je jen jeden parametr. Banka posuzuje i příjmy, závazky a účel.",
      },
      {
        q: "Počítá se LTV z kupní nebo odhadní ceny?",
        a: "Z odhadní / zástavní hodnoty. Kupní cena může být vyšší — rozdíl jdete cash.",
      },
    ],
    sources: [
      {
        label: "Metodika dat HypotékaJasně (LTV)",
        url: routes.metodika,
      },
      {
        label: "Makroobezřetnostní rámec ČNB (editorial / VERIFIED dle katalogu)",
        note: "Konkrétní limity ověřujte u aktuálních doporučení ČNB a banky.",
      },
    ],
    relatedTools: [
      { label: "Hypoteční připravenost", href: routes.navrhNaMiru },
      { label: "Kalkulačky", href: routes.kalkulacky.root },
    ],
    cta: {
      label: "Spočítat orientační připravenost",
      href: routes.navrhNaMiru,
    },
  }),

  lesson({
    slug: "rpsn",
    title: "RPSN",
    shortLabel: "RPSN",
    description:
      "Roční procentní sazba nákladů — srovnávací cena úvěru včetně poplatků.",
    simplySaid:
      "RPSN je poctivější číslo než samotný úrok. Říká, kolik vás úvěr stojí za rok včetně povinných poplatků.",
    realExample:
      "Úrok 4 %, ale s odhadem, zpracováním a vedením účtu je RPSN 4,3 %. U dvou nabídek se stejným úrokem často vyhraje nižší RPSN.",
    howCalculated:
      "RPSN je zákonný ukazatel zahrnující úrok i povinné náklady spojené s úvěrem. Přesný vzorec je regulovaný — na portálu RPSN nevymýšlíme, bereme ze zdroje banky, nebo zobrazíme „Na vyžádání“.",
    bankOrInvestor:
      "Banka i zprostředkovatel RPSN používají ke srovnání nabídek. Velký odstup RPSN od sazby = hledejte poplatky. Investor porovnává RPSN s očekávaným výnosem aktiva.",
    commonMistake:
      "Vybrat hypotéku jen podle nejnižší sazby a ignorovat pojištění, odhad a poplatky za čerpání.",
    calculator: "none",
    quiz: [
      {
        id: "rpsn-q1",
        prompt: "Co RPSN typicky zahrnuje navíc oproti úrokové sazbě?",
        options: [
          "Jen inflaci",
          "Povinné poplatky a náklady úvěru",
          "Daň z nemovitosti",
          "Service charges v Dubaji",
        ],
        correctIndex: 1,
        explain: "RPSN = sazba + povinné náklady úvěru dle regulace.",
      },
    ],
    faq: [
      {
        q: "Proč někdy RPSN neukazujeme?",
        a: "Když není ve zdroji banky, nevymýšlíme ho — status „Na vyžádání“ / MODEL.",
      },
    ],
    sources: [
      { label: "Metodika RPSN", url: routes.metodika },
    ],
    relatedTools: [
      { label: "Hypoteční kalkulačka", href: routes.kalkulacky.root },
    ],
    cta: {
      label: "Porovnat nabídky v kalkulačce",
      href: routes.kalkulacky.root,
    },
  }),

  lesson({
    slug: "fixace",
    title: "Fixace úrokové sazby",
    shortLabel: "Fixace",
    description: "Období, po které máte zamčenou sazbu a splátku.",
    simplySaid:
      "Fixace je zámek sazby na domluvenou dobu. Víte, kolik platíte — po konci přijde nová nabídka nebo refinancování.",
    realExample:
      "Sazba 4,5 % a fixace 5 let. Pět let stejná anuita. V 6. roce banka nabídne novou sazbu — nebo odejdete ke konkurenci.",
    howCalculated:
      "Během fixace je sazba smluvně daná. Splátku počítá anuita z jistiny, sazby a splatnosti. Po fixaci se sazba přeceňuje — modelujte citlivost +1 / +2 p.b.",
    bankOrInvestor:
      "Delší fixace často stojí o něco víc. Banka sleduje konec fixace jako moment refinancování. Investor volí fixaci podle horizontu držení aktiva.",
    commonMistake:
      "Vzít nejdelší fixaci „pro jistotu“ bez plánu prodeje a mimořádných splátek.",
    calculator: "none",
    quiz: [
      {
        id: "fix-q1",
        prompt: "Co se stane po konci fixace?",
        options: [
          "Úvěr automaticky zanikne",
          "Banka nabídne novou sazbu / můžete refinancovat",
          "LTV se vynuluje",
          "RPSN zmizí",
        ],
        correctIndex: 1,
        explain: "Konec fixace = repricing nebo odchod ke konkurenci.",
      },
    ],
    faq: [
      {
        q: "Je delší fixace vždy lepší?",
        a: "Ne. Záleží na plánu prodeje, refinancování a ceně delší jistoty.",
      },
    ],
    sources: [{ label: "Metodika sazeb", url: routes.metodika }],
    relatedTools: [
      { label: "Hypoteční připravenost", href: routes.navrhNaMiru },
    ],
    cta: {
      label: "Připravit se na refinancování",
      href: routes.navrhNaMiru,
    },
  }),

  lesson({
    slug: "dti",
    title: "DTI (Debt to Income)",
    shortLabel: "DTI",
    description: "Poměr celkového dluhu k ročnímu příjmu.",
    simplySaid:
      "DTI říká, kolikrát je váš celkový dluh větší než váš roční příjem. Je to pohled „jak velký batoh dluhů nesete“.",
    realExample:
      "Roční čistý příjem 600 000 Kč, celkové dluhy 3 600 000 Kč. DTI = 6.",
    howCalculated:
      "DTI = celkový zůstatek dluhů ÷ roční čistý příjem. (Někdy banky používají hrubý příjem — vždy ověřte metodiku konkrétní banky.)",
    bankOrInvestor:
      "ČNB může DTI používat jako makroobezřetnostní ukazatel; aktivace se mění v čase. Banky mají i interní limity. U investic bývají doporučení přísnější. Investor DTI čte jako leverage domácnosti.",
    commonMistake:
      "Počítat jen hypotéku a zapomenout spotřebáky, leasing a limity karet.",
    calculator: "dti",
    quiz: [
      {
        id: "dti-q1",
        prompt: "Dluhy 3,6 mil., roční příjem 0,6 mil. DTI je:",
        options: ["0,6", "3", "6", "60 %"],
        correctIndex: 2,
        explain: "3,6 ÷ 0,6 = 6.",
      },
    ],
    faq: [
      {
        q: "Je DTI totéž co DSTI?",
        a: "Ne. DTI = stav dluhu k ročnímu příjmu. DSTI = měsíční splátky k měsíčnímu příjmu.",
      },
    ],
    sources: [
      {
        label: "Metodika LTV/DTI",
        url: routes.metodika,
        note: "Aktuální aktivaci limitů ČNB ověřujte u primárního zdroje.",
      },
    ],
    relatedTools: [
      { label: "Hypoteční připravenost", href: routes.navrhNaMiru },
    ],
    cta: {
      label: "Ověřit orientační závazky",
      href: routes.navrhNaMiru,
    },
  }),

  lesson({
    slug: "dsti",
    title: "DSTI (Debt Service to Income)",
    shortLabel: "DSTI",
    description: "Podíl měsíčních splátek na čistých příjmech.",
    simplySaid:
      "DSTI říká, kolik procent z výplaty padne na splátky všech dluhů. Banka kontroluje, jestli vám zbývá na život.",
    realExample:
      "Čistý příjem 50 000 Kč, hypotéka 18 000 Kč + kreditka 2 000 Kč. DSTI = 40 %.",
    howCalculated:
      "DSTI (%) = (součet měsíčních splátek ÷ čistý měsíční příjem) × 100. Počítají se hypotéka, spotřebák, leasing, často i minimum z kreditky.",
    bankOrInvestor:
      "DSTI je běžný interní stres-test. Makro limity ČNB se v čase mění; banky ukazatel sledují i bez plošné aktivace. Investor DSTI používá i u cash-flow scénářů bez nájmu.",
    commonMistake:
      "Zapomenout na kreditky a kontokorenty — nevyužitý limit může snížit max. úvěr.",
    calculator: "dsti",
    quiz: [
      {
        id: "dsti-q1",
        prompt: "Příjem 50 tis., splátky 20 tis. DSTI je:",
        options: ["20 %", "40 %", "50 %", "2,5"],
        correctIndex: 1,
        explain: "20 / 50 = 0,4 → 40 %.",
      },
    ],
    faq: [
      {
        q: "Jaký DSTI je „bezpečný“?",
        a: "Záleží na bance a účelu. Orientačně se často pracuje s pásmem kolem 40–45 % — ne jako slib schválení.",
      },
    ],
    sources: [{ label: "Metodika", url: routes.metodika }],
    relatedTools: [
      { label: "Hypoteční připravenost", href: routes.navrhNaMiru },
      { label: "Kolik si mohu dovolit (homepage widget)", href: "/#kolik-si-mohu-dovolit" },
    ],
    cta: {
      label: "Spočítat připravenost",
      href: routes.navrhNaMiru,
    },
  }),

  lesson({
    slug: "americka-hypoteka",
    title: "Americká hypotéka",
    shortLabel: "Americká hypotéka",
    description:
      "Úvěr zajištěný nemovitostí v ČR — prostředky nemusí jít jen na koupi téže nemovitosti.",
    simplySaid:
      "Americká hypotéka je úvěr, kde bance ručíte nemovitostí v ČR, ale peníze můžete použít šířeji (konsolidace, investice, zahraniční koupě — dle podmínek banky).",
    realExample:
      "Máte byt v Praze s equity 2 mil. Kč. Banka vám proti zástavě půjčí část hodnoty — peníze použijete například na akontaci v zahraničí (produkt a účel vždy dle smlouvy).",
    howCalculated:
      "Orientačně: max. úvěr ≈ LTV rámec × odhad nemovitosti − stávající zástavy. Sazba bereme ze živých dat bank (american_*), pokud jsou LIVE.",
    bankOrInvestor:
      "Banka zkoumá účel, LTV na zajištění a bonitu stejně pečlivě jako u klasické hypotéky. Investor ji často používá jako most k zahraničnímu aktivu bez lokální hypotéky.",
    commonMistake:
      "Předpokládat, že „americká“ automaticky financuje 80 % zahraniční nemovitosti. Zajištění je v ČR; zahraniční aktivum banka typicky nezastaví 1:1.",
    calculator: "ltv",
    quiz: [
      {
        id: "am-q1",
        prompt: "Čím je typicky zajištěná americká hypotéka v ČR?",
        options: [
          "Akciemi",
          "Nemovitostí v ČR",
          "Leaseholdem na Bali",
          "Pouze příjmem",
        ],
        correctIndex: 1,
        explain: "Zástava je na nemovitost v ČR.",
      },
    ],
    faq: [
      {
        q: "Je to totéž co developer payment plan v Dubaji?",
        a: "Ne. Payment plan je splátkový kalendář developera. Americká hypotéka je bankovní úvěr se zástavou v ČR.",
      },
    ],
    sources: [
      { label: "Katalog sazeb american_*", url: routes.metodika },
      { label: "Financování v zahraničí", url: routes.pruvodceInvestora },
    ],
    relatedTools: [
      { label: "Průvodce investora", href: routes.pruvodceInvestora },
      { label: "Kalkulačky", href: routes.kalkulacky.root },
    ],
    cta: {
      label: "Prozkoumat financování zahraničí",
      href: routes.pruvodceInvestora,
    },
  }),

  lesson({
    slug: "cash-flow",
    title: "Cash-flow z pronájmu",
    shortLabel: "Cash-flow",
    description: "Co vám reálně zbude po splátce a nákladech.",
    simplySaid:
      "Cash-flow je peníz v kapse po nájmu minus splátka, provoz a rezervy. Rozdíl mezi „vypadá to hezky“ a „funguje to“.",
    realExample:
      "Nájem 20 000 Kč, splátka 15 000 Kč, fond oprav 2 000 Kč → CF +3 000 Kč. Bez nájemníka jdete do minusu.",
    howCalculated:
      "CF ≈ nájem − splátka − provoz − daně/rezerva − neobsazenost. Hrubý yield ≠ čisté CF.",
    bankOrInvestor:
      "Banka nebere nájem vždy 1:1. Investor modeluje Bear/Base/Bull a stress bez nájmu.",
    commonMistake:
      "Ignorovat daně, správu a 1–2 měsíce neobsazenosti.",
    calculator: "cash_flow",
    quiz: [
      {
        id: "cf-q1",
        prompt: "Nájem 20k, splátka 15k, náklady 2k. CF je:",
        options: ["+3k", "+5k", "−3k", "20k"],
        correctIndex: 0,
        explain: "20 − 15 − 2 = 3.",
      },
    ],
    faq: [
      {
        q: "Je kladné CF záruka dobré investice?",
        a: "Ne. Záleží i na kapitálovém růstu, riziku a nákladech na výstup.",
      },
    ],
    sources: [{ label: "Investment engine / metodika", url: routes.metodika }],
    relatedTools: [
      { label: "Investiční rentgen", href: routes.investicniRentgen },
      { label: "Modelář 30 let", href: routes.investicniRentgenModelar },
    ],
    cta: {
      label: "Spustit investiční rentgen",
      href: routes.investicniRentgen,
    },
  }),

  lesson({
    slug: "snowball",
    title: "Sněhová koule (Snowball)",
    shortLabel: "Sněhová koule",
    description: "Reinvestice CF do mimořádných splátek nebo dalšího aktiva.",
    simplySaid:
      "Zisk z nájmu neutratíte — hned ho použijete na splátku dluhu nebo další investici. Majetek roste nabalováním.",
    realExample:
      "Čistý nájem 5 000 Kč měsíčně posíláte jako mimořádnou splátku. Dluh zmizí dřív, ušetříte úroky.",
    howCalculated:
      "Modelujte anuitu + extra platbu. Každá mimořádná splátka snižuje jistinu a budoucí úrok (dle podmínek smlouvy).",
    bankOrInvestor:
      "Ze zákona bývají limity na bezplatné mimořádné splátky; plná flexibilita často na konci fixace. Investor volí mezi deleveraging a reinvesticí.",
    commonMistake:
      "Nechat CF ležet na běžném účtu bez úroku a plánu.",
    calculator: "none",
    quiz: [
      {
        id: "sb-q1",
        prompt: "Snowball v hypotečním kontextu typicky znamená:",
        options: [
          "Koupi sněhu",
          "Reinvestici CF do splátek / dalšího aktiva",
          "Vyšší LTV",
          "Nižší RPSN automaticky",
        ],
        correctIndex: 1,
        explain: "Jde o reinvestici přebytku do růstu majetku / snížení dluhu.",
      },
    ],
    faq: [
      {
        q: "Je mimořádná splátka vždy zdarma?",
        a: "Ne. Závisí na smlouvě, výročí a limitech. Ověřte podmínky banky.",
      },
    ],
    sources: [{ label: "Modelář / Decision Lab", url: routes.kalkulacky.root }],
    relatedTools: [
      { label: "Investiční modelář", href: routes.investicniRentgenModelar },
    ],
    cta: {
      label: "Nasimulovat 30 let",
      href: routes.investicniRentgenModelar,
    },
  }),

  lesson({
    slug: "inflace",
    title: "Inflace a kupní síla",
    shortLabel: "Inflace",
    description: "Jak inflace mění reálnou hodnotu dluhu i hotovosti.",
    simplySaid:
      "Inflace zlevňuje kupní sílu peněz. Hotovost ztrácí, dlouhodobý fixní dluh v reálném vyjádření „lehkne“ — pokud držíte výnosné aktivum.",
    realExample:
      "Hypotéka 3 mil. Kč. Za 15 let při 2,5 % p.a. inflaci je reálná kupní síla dluhu výrazně nižší — model, ne záruka.",
    howCalculated:
      "Reálná hodnota ≈ nominál / (1 + inflace)^roky. U modelů oddělujte nominální a reálné scénáře.",
    bankOrInvestor:
      "Banka jistinu vede nominálně. ČNB reaguje sazbami. Investor porovnává výnos aktiva s inflací (reálný výnos).",
    commonMistake:
      "Držet velkou hotovost z obavy z dluhu, zatímco inflace ji tiše ukrajuje.",
    calculator: "none",
    quiz: [
      {
        id: "inf-q1",
        prompt: "Inflace typicky:",
        options: [
          "Zvyšuje reálnou hodnotu hotovosti",
          "Snižuje reálnou kupní sílu hotovosti",
          "Maže nominální jistinu hypotéky",
          "Nahrazuje RPSN",
        ],
        correctIndex: 1,
        explain: "Hotovost ztrácí kupní sílu; nominální dluh zůstává.",
      },
    ],
    faq: [
      {
        q: "Je hypotéka vždy hedge proti inflaci?",
        a: "Ne automaticky. Záleží na sazbě, aktivu a vašich příjmech.",
      },
    ],
    sources: [
      { label: "Decision Lab — historické / budoucí scénáře", url: routes.kalkulacky.historickyVyvoj },
    ],
    relatedTools: [
      { label: "Historický vývoj", href: routes.kalkulacky.historickyVyvoj },
    ],
    cta: {
      label: "Otevřít Decision Lab",
      href: routes.kalkulacky.historickyVyvoj,
    },
  }),

  lesson({
    slug: "freehold-vs-leasehold",
    title: "Freehold vs. Leasehold",
    shortLabel: "Freehold / Leasehold",
    description: "Dva odlišné typy vlastnictví — zejména v zahraničí.",
    simplySaid:
      "Freehold = vlastníte nemovitost i pozemek „napořád“ (v rámci práva země). Leasehold = dlouhodobý pronájem práv na desítky let.",
    realExample:
      "Bali: leasehold na 25 let. Po čase práva končí nebo se prodlužují — nejde o freehold jako v ČR.",
    howCalculated:
      "U leaseholdu modelujte zbývající roky, náklady prolongace a exit. Porovnání ceny freehold vs leasehold 1:1 je chybné.",
    bankOrInvestor:
      "České banky leasehold v zahraničí typicky nezastaví. Často cash nebo české zajištění. Investor požaduje právní due diligence.",
    commonMistake:
      "Srovnávat cenu asijského leaseholdu s evropským freeholdem bez horizontu práv.",
    calculator: "none",
    quiz: [
      {
        id: "fh-q1",
        prompt: "Leasehold typicky znamená:",
        options: [
          "Vlastnictví pozemku navždy",
          "Časově omezená práva",
          "Stejné jako SVJ",
          "Jen offline plán",
        ],
        correctIndex: 1,
        explain: "Leasehold = časově omezená práva / nájemní struktura.",
      },
    ],
    faq: [
      {
        q: "Dostanu v ČR hypotéku na bali leasehold?",
        a: "Lokální zástava leaseholdu v zahraničí u české banky je prakticky nedostupná. Řeší se cash nebo české zajištění.",
      },
    ],
    sources: [
      { label: "Country dossier Bali / zahraničí", url: routes.pruvodceInvestora },
    ],
    relatedTools: [
      { label: "Průvodce investora", href: routes.pruvodceInvestora },
    ],
    cta: {
      label: "Otevřít dossier země",
      href: routes.pruvodceInvestora,
    },
  }),

  lesson({
    slug: "off-plan",
    title: "Off-plan investice",
    shortLabel: "Off-plan",
    description: "Koupě před dokončením — podle plánů a fází výstavby.",
    simplySaid:
      "Kupujete nemovitost, která ještě nestojí (nebo není hotová). Platíte podle fází; riziko developera a zpoždění je reálné.",
    realExample:
      "Dubaj: payment plan 10/50/20/20. Tržní hodnota po handoveru se může lišit — model, ne slib.",
    howCalculated:
      "Sčítejte cash-flow fází, opportunity cost a riziko nedokončení. Developer schedule ≠ bankovní hypotéka.",
    bankOrInvestor:
      "Česká banka vzduch nezastaví. Developer plány a escrow jsou klíč. Investor požaduje track record a ochranu peněz.",
    commonMistake:
      "Poslat peníze developérovi mimo regulovaný escrow / bez due diligence.",
    calculator: "none",
    quiz: [
      {
        id: "op-q1",
        prompt: "Off-plan typicky financujete:",
        options: [
          "Vždy 80% LTV českou hypotékou na projekt",
          "Často payment planem developera / cash / české zajištění",
          "Jen leasingem auta",
          "Pouze RPSN",
        ],
        correctIndex: 1,
        explain: "Lokální CZ hypotéka na zahraniční off-plan je omezená.",
      },
    ],
    faq: [
      {
        q: "Je payment plan hypotéka?",
        a: "Ne. Jde o smluvní splátky developérovi, ne o bankovní úvěr.",
      },
    ],
    sources: [
      { label: "Financing catalog — developer plans", url: routes.metodika },
    ],
    relatedTools: [
      { label: "Investiční rentgen", href: routes.investicniRentgen },
    ],
    cta: {
      label: "Analyzovat konkrétní nabídku",
      href: routes.investicniRentgen,
    },
  }),

  lesson({
    slug: "escrow",
    title: "Escrow (jistotní účet)",
    shortLabel: "Escrow",
    description: "Vázaný účet — peníze až po splnění podmínek.",
    simplySaid:
      "Peníze nejdou rovnou prodávajícímu. Čekají na účtu, dokud nejsou splněné podmínky (přepis, handover…).",
    realExample:
      "Koupě ve Španělsku: úschova u notáře. Prodávající dostane peníze až s listem vlastnictví.",
    howCalculated:
      "Nejde o výnosový vzorec — jde o právní/procesní ochranu cash-flow transakce.",
    bankOrInvestor:
      "Hypoteční čerpání standardně míří do úschovy. Investor v zahraničí vyžaduje regulovaný escrow u developera.",
    commonMistake:
      "Poslat zálohu na osobní účet makléře / developera mimo úschovu.",
    calculator: "none",
    quiz: [
      {
        id: "esc-q1",
        prompt: "Escrow slouží především k:",
        options: [
          "Zvýšení LTV",
          "Ochraně peněz do splnění podmínek",
          "Výpočtu RPSN",
          "Snížení inflace",
        ],
        correctIndex: 1,
        explain: "Jde o vázání prostředků do splnění podmínek.",
      },
    ],
    faq: [
      {
        q: "Je escrow povinný?",
        a: "V praxi u hypotečních převodů ano jako standard. V zahraničí vždy ověřte lokální regulaci.",
      },
    ],
    sources: [
      { label: "Právní / transakční praxe (editorial)", url: routes.metodika },
    ],
    relatedTools: [
      { label: "FAQ", href: routes.faq },
    ],
    cta: {
      label: "Přečíst FAQ",
      href: routes.faq,
    },
  }),
];

export function getAcademyLesson(slug: string): AcademyLesson | undefined {
  return ACADEMY_LESSONS.find((l) => l.slug === slug);
}

export function getAllAcademySlugs(): string[] {
  return ACADEMY_LESSONS.map((l) => l.slug);
}
