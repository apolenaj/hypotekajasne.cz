import type { CountryId } from "@/lib/calculators";
import { countryConfigs } from "@/lib/calculators";
import { destinationCards } from "@/lib/mock-data";

export type CountryDetailTabId = "market" | "financing" | "process" | "risks";

export interface CountryDetailStat {
  label: string;
  value: string;
  priceCzkEquivalent?: string | null;
}

export interface CountryDetailStep {
  title: string;
  description: string;
}

export interface CountryDetailWarning {
  title: string;
  description: string;
}

export interface CountryDetailFinancingOption {
  title: string;
  description: string;
}

export interface CountryDetailTabs {
  market: {
    overview: string;
    stats: CountryDetailStat[];
    highlights: string[];
  };
  financing: {
    intro: string;
    options: CountryDetailFinancingOption[];
  };
  process: {
    intro: string;
    steps: CountryDetailStep[];
  };
  risks: {
    intro: string;
    warnings: CountryDetailWarning[];
    opportunities: string[];
  };
}

export interface CountryDetailContent {
  title: string;
  subtitle: string;
  tabs: CountryDetailTabs;
}

const countryDetailData: Partial<Record<CountryId, CountryDetailContent>> = {
  cz: {
    title: "Investice a financování: Česká republika",
    subtitle: "Stabilní trh s předvídatelným LTV, domácí bankami a jasnou legislativou",
    tabs: {
      market: {
        overview:
          "Český realitní trh kombinuje stabilní poptávku po bydlení s rostoucím zájmem o investiční pronájem. Praha a Brno vedou v likviditě, regionální města nabízejí vyšší výnos z nájmu vůči ceně.",
        stats: [
          { label: "Průměrná cena bytu (Praha)", value: "145 000 Kč/m²" },
          { label: "Roční zhodnocení", value: "4–7 %" },
          { label: "Průměrný výnos z nájmu", value: "3,5–5,5 %" },
        ],
        highlights: [
          "Vysoká likvidita větších měst a silná poptávka po nájmu",
          "Transparentní katastr a notářské ověření převodu",
          "Možnost financovat i investiční byt standardní hypotékou",
        ],
      },
      financing: {
        intro:
          "V ČR máte na výběr z široké nabídky bankovních produktů. Pro investory jsou klíčové LTV, bonita a typ nemovitosti.",
        options: [
          {
            title: "Standardní hypotéka",
            description:
              "Nejčastější cesta pro vlastní bydlení i investiční byt. LTV typicky do 80–90 %, fixace 3–10 let.",
          },
          {
            title: "Americká hypotéka",
            description:
              "Úvěr zajištěný nemovitostí bez účelového vázání. Vhodná pro rychlé financování nebo refinancování.",
          },
          {
            title: "Stavební spoření + úvěr",
            description:
              "Kombinace státní podpory a úvěru pro mladší klienty nebo konzervativní profily.",
          },
        ],
      },
      process: {
        intro:
          "Koupě nemovitosti v ČR je strukturovaný proces s jasnými právními kroky a kontrolou katastru.",
        steps: [
          {
            title: "1. Rezervace a due diligence",
            description:
              "Ověření vlastnictví, zástav, plomby a technického stavu. Rezervační smlouva s jasnými podmínkami.",
          },
          {
            title: "2. Hypotéka a schválení",
            description:
              "Podání žádosti, odhad banky, schválení úvěru a podpis úvěrové smlouvy.",
          },
          {
            title: "3. Kupní smlouva a převod",
            description:
              "Podpis u notáře nebo advokáta, vklad na katastr, předání nemovitosti a přepis energií.",
          },
        ],
      },
      risks: {
        intro:
          "Český trh je relativně stabilní, ale i zde platí pravidla rizikového managementu.",
        warnings: [
          {
            title: "Daň z příjmu z nájmu",
            description:
              "Příjmy z pronájmu podléhají zdanění. Zvažte paušální výdaje nebo skutečné náklady.",
          },
          {
            title: "Úrokové riziko",
            description:
              "Po skončení fixace může splátka výrazně vzrůst. Plánujte rezervu a refinancování včas.",
          },
        ],
        opportunities: [
          "Regenerace brownfieldů a nová výstavba v blízkosti MHD",
          "Růst hodnoty v regionech s infrastrukturními projekty",
          "Dlouhodobě stabilní poptávka po nájemním bydlení",
        ],
      },
    },
  },
  dubai: {
    title: "Investice a financování: Dubaj",
    subtitle: "0% daň z příjmu, silný developer segment a atraktivní platební plány",
    tabs: {
      market: {
        overview:
          "Dubaj je jedním z nejaktivnějších trhů Blízkého východu. Off-plan projekty, prémiové lokality (Marina, Downtown, JVC) a rostoucí expat komunita tvoří silnou poptávku.",
        stats: [
          {
            label: "Průměrná cena bytu",
            value: "1 400–2 200 AED/ft²",
            priceCzkEquivalent: "(cca 95 000 – 145 000 Kč / m²)",
          },
          { label: "Roční zhodnocení", value: "6–12 %" },
          { label: "Výnos z krátkodobého pronájmu", value: "6–9 %" },
        ],
        highlights: [
          "Nulová daň z příjmu z pronájmu pro fyzické osoby",
          "Freehold zóny otevřené zahraničním investorům",
          "Vysoká likvidita off-plan projektů u tier-1 developerů",
        ],
      },
      financing: {
        intro:
          "Financování v Dubaji kombinuje lokální banky, developer plány a české zajištění nemovitostí.",
        options: [
          {
            title: "Developer payment plan",
            description:
              "Platba po etapách výstavby (např. 20/40/40). Nižší vstupní kapitál, ale nutná due diligence developera.",
          },
          {
            title: "Hypotéka pro non-residenta",
            description:
              "Lokální banky financují až cca 50–75 % hodnoty. Vyžaduje vyšší akontaci a doložení příjmů.",
          },
          {
            title: "Americká hypotéka v ČR",
            description:
              "Úvěr zajištěný českou nemovitostí pro financování akontace nebo celé investice v SAE.",
          },
        ],
      },
      process: {
        intro:
          "Koupě v Dubaji je rychlejší než v EU, ale vyžaduje pečlivou kontrolu dokumentace a escrow účtů.",
        steps: [
          {
            title: "1. Výběr projektu a rezervace",
            description:
              "Ověření developera (RERA), rezervační poplatek a podpis SPA (Sales & Purchase Agreement).",
          },
          {
            title: "2. Escrow a platby",
            description:
              "Platby jdou na escrow účet projektu. U off-plan sledujte milníky výstavby.",
          },
          {
            title: "3. Title deed a předání",
            description:
              "Po dokončení výstavby registrace vlastnictví u Dubai Land Department a předání klíčů.",
          },
        ],
      },
      risks: {
        intro:
          "Dubaj nabízí vysoký potenciál, ale investor musí počítat s měnovým a tržním rizikem.",
        warnings: [
          {
            title: "Kurzové riziko (AED/CZK)",
            description:
              "Dirham je vázán na USD. Při financování z ČR sledujte dopad kurzu na splátky a výnos.",
          },
          {
            title: "Off-plan a developer risk",
            description:
              "Zpoždění výstavby nebo slabší developer mohou ovlivnit likviditu. Preferujte ověřené značky.",
          },
        ],
        opportunities: [
          "Silný růst populace a expat poptávky po nájmu",
          "Nulová daň z příjmu pro fyzické osoby",
          "Prestižní trh s globální viditelností a krátkodobým pronájmem",
        ],
      },
    },
  },
  spain: {
    title: "Investice a financování: Španělsko",
    subtitle: "Prémiový trh pro druhý domov s atraktivním výnosem z pronájmu",
    tabs: {
      market: {
        overview:
          "Španělsko nabízí kombinaci životního stylu a investičního potenciálu. Costa del Sol, Barcelona a Madrid přitahují expaty i krátkodobé pronájmy.",
        stats: [
          {
            label: "Průměrná cena bytu",
            value: "3 000–4 500 EUR/m²",
            priceCzkEquivalent: "(cca 75 000 – 113 000 Kč / m²)",
          },
          { label: "Roční zhodnocení", value: "4–8 %" },
          { label: "Průměrný výnos z nájmu", value: "4–6 %" },
        ],
        highlights: [
          "Silná poptávka po pronájmu v turistických oblastech",
          "Možnost financování přes španělské i české banky",
          "Stabilní právní rámec pro zahraniční kupující z EU",
        ],
      },
      financing: {
        intro:
          "Financování ve Španělsku zahrnuje lokální hypotéky, developer plány a české zajištění.",
        options: [
          {
            title: "Španělská hypotéka",
            description:
              "Standardní úvěr u lokálních bank. Pro nerezidenty typicky LTV do 60–70 %.",
          },
          {
            title: "Americká hypotéka v ČR",
            description:
              "Úvěr zajištěný českou nemovitostí pro financování nákupu ve Španělsku.",
          },
          {
            title: "Hotovostní nákup + refinancování",
            description:
              "Koupě za hotovost s následným refinancováním po registraci vlastnictví.",
          },
        ],
      },
      process: {
        intro:
          "Koupě ve Španělsku zahrnuje rezervaci, due diligence, smlouvu a registraci u notáře.",
        steps: [
          {
            title: "1. Rezervace a prověrka",
            description:
              "Rezervační smlouva, ověření vlastnictví a technického stavu nemovitosti.",
          },
          {
            title: "2. Financování a smlouvy",
            description:
              "Schválení úvěru, podpis kupní smlouvy u notáře nebo advokáta.",
          },
          {
            title: "3. Registrace a předání",
            description:
              "Zápis do katastru nemovitostí, předání klíčů a nastavení pronájmu.",
          },
        ],
      },
      risks: {
        intro:
          "Investice ve Španělsku přináší měnové a legislativní specifika.",
        warnings: [
          {
            title: "Daň z příjmu z pronájmu",
            description:
              "Příjmy z pronájmu podléhají španělské dani. Zvažte daňovou optimalizaci.",
          },
          {
            title: "Kurzové riziko (EUR/CZK)",
            description:
              "Kolísání kurzu ovlivňuje celkovou návratnost investice z české perspektivy.",
          },
        ],
        opportunities: [
          "Silný turistický segment pro krátkodobý pronájem",
          "Růst hodnoty v oblastech s infrastrukturními projekty",
          "Diverzifikace portfolia v rámci EU",
        ],
      },
    },
  },
  italy: {
    title: "Investice a financování: Itálie",
    subtitle: "Vysoký potenciál výnosu v turistických a prémiových lokalitách",
    tabs: {
      market: {
        overview:
          "Itálie kombinuje silný turistický segment s prémiovými byznysovými centry. Severní regiony a jezerní oblasti vedou v likviditě, jih nabízí vyšší výnos z pronájmu.",
        stats: [
          {
            label: "Průměrná cena bytu",
            value: "2 800 – 4 500 EUR/m²",
            priceCzkEquivalent: "(cca 70 000 – 113 000 Kč / m²)",
          },
          { label: "Roční zhodnocení", value: "3 – 6 %" },
          { label: "Průměrný výnos z nájmu", value: "4 – 6.5 %" },
        ],
        highlights: [
          "Stabilní poptávka v turistických a byznysových centrech (Milán, Řím, severní jezera)",
          "Možnost zajímavého výnosu u krátkodobých pronájmů v historických lokalitách",
          "Specifické právní prostředí vyžadující důkladnou prověrku (due diligence) nemovitosti",
        ],
      },
      financing: {
        intro:
          "Financování v Itálii zahrnuje lokální hypotéky, české zajištění a hotovostní nákupy s následným refinancováním.",
        options: [
          {
            title: "Italská hypotéka pro cizince",
            description:
              "Úvěr u italských bank (Intesa, UniCredit). Pro nerezidenty typicky LTV do 60 %.",
          },
          {
            title: "Americká hypotéka v ČR",
            description:
              "Úvěr zajištěný českou nemovitostí pro nákup italské vily nebo bytu za hotovost.",
          },
          {
            title: "Hotovostní nákup",
            description:
              "Častá volba u historických nemovitostí kvůli složité byrokracii bank.",
          },
        ],
      },
      process: {
        intro:
          "Koupě v Itálii vyžaduje notáře, prověrku vlastnické historie a registraci u katastru.",
        steps: [
          {
            title: "1. Due diligence",
            description:
              "Prověření vlastnictví, zástav, urbanistického plánu a dědických vazeb.",
          },
          {
            title: "2. Rezervace a smlouva",
            description:
              "Compromesso (předběžná smlouva), notářský poplatek a podpis kupní smlouvy.",
          },
          {
            title: "3. Registrace a převod",
            description:
              "Zápis do katastru, zaplacení daně z převodu a předání nemovitosti.",
          },
        ],
      },
      risks: {
        intro:
          "Italský trh nabízí atraktivní výnosy, ale vyžaduje pečlivou právní prověrku.",
        warnings: [
          {
            title: "Restriktivní stavební povolení",
            description:
              "U historických budov jsou rekonstrukce výrazně omezeny. Ověřte urbanistický plán před koupí.",
          },
          {
            title: "Dědictví a spoluvlastnictví",
            description:
              "Italské dědické řízení může trvat roky. Prověřte vlastnickou historii nemovitosti.",
          },
        ],
        opportunities: [
          "Prémiové lokality severní Itálie s rostoucí poptávkou",
          "Vysoký výnos z krátkodobého pronájmu u jezer a pobřeží",
          "Daňové pobídky pro rezidenty (flat tax programy)",
        ],
      },
    },
  },
  croatia: {
    title: "Investice a financování: Chorvatsko",
    subtitle: "Nemovitosti u moře s vysokým turistickým potenciálem",
    tabs: {
      market: {
        overview:
          "Chorvatsko po vstupu do Eurozóny a Schengenu zažívá silný zájem investorů. Pobřežní trh nabízí vysoké výnosy z krátkodobého pronájmu s výraznou sezónností.",
        stats: [
          {
            label: "Průměrná cena bytu",
            value: "2 900 – 4 200 EUR/m²",
            priceCzkEquivalent: "(cca 73 000 – 105 000 Kč / m²)",
          },
          { label: "Roční zhodnocení", value: "4 – 7 %" },
          { label: "Průměrný výnos z nájmu", value: "5 – 6.5 %" },
        ],
        highlights: [
          "Extrémní turistická poptávka podpořená plným začleněním do Eurozóny a Schengenu",
          "Výnosy z krátkodobých pronájmů koncentrované do intenzivní letní sezóny (červen–září)",
          "Snadná logistická dostupnost pro české investory (možnost vlastní správy nemovitosti)",
        ],
      },
      financing: {
        intro:
          "Financování chorvatské nemovitosti zahrnuje lokální hypotéky, české zajištění a hotovostní nákupy.",
        options: [
          {
            title: "Chorvatská hypotéka pro EU občany",
            description:
              "Úvěr u místních bank (Zagrebačka, PBZ). Pro nerezidenty typicky LTV do 70 %.",
          },
          {
            title: "Americká hypotéka v ČR",
            description:
              "Úvěr zajištěný českou nemovitostí pro nákup apartmánu u Jadranu.",
          },
          {
            title: "Hotovostní nákup",
            description:
              "Častá volba u menších apartmánů kvůli rychlosti transakce a jednodušší byrokracii.",
          },
        ],
      },
      process: {
        intro:
          "Koupě v Chorvatsku vyžaduje prověrku zemské knihy, notáře a registraci u katastru.",
        steps: [
          {
            title: "1. Due diligence",
            description:
              "Prověření zápisu v zemské knize, nelegálních staveb a přístupových práv.",
          },
          {
            title: "2. Rezervace a smlouva",
            description:
              "Předběžná smlouva, notářský poplatek a podpis kupní smlouvy.",
          },
          {
            title: "3. Registrace a převod",
            description:
              "Zápis do katastru, zaplacení daně z převodu a předání nemovitosti.",
          },
        ],
      },
      risks: {
        intro:
          "Chorvatský trh nabízí atraktivní výnosy, ale vyžaduje pečlivou prověrku nemovitosti.",
        warnings: [
          {
            title: "Nelegální stavby",
            description:
              "Častý problém u starších domů. Bez legalizačního souhlasu nelze nemovitost prodat.",
          },
          {
            title: "Přístupová práva",
            description:
              "Ověřte, zda nemovitost má legální přístupovou cestu – jinak může být nedosažitelná.",
          },
        ],
        opportunities: [
          "Silný turistický segment po vstupu do Eurozóny",
          "Vysoký výnos z krátkodobého pronájmu v letní sezóně",
          "Snadná dostupnost pro české investory a vlastní správu",
        ],
      },
    },
  },
  bali: {
    title: "Investice a financování: Bali (Indonésie)",
    subtitle: "Tropický trh s extrémním ROI a specifickou legislativou",
    tabs: {
      market: {
        overview:
          "Bali patří mezi nejatraktivnější investiční destinace v Asii. Vysoké výnosy z pronájmu kompenzují složitější právní rámec — cizinci nemohou vlastnit půdu přímo a spoléhají na leasehold nebo strukturu PT PMA.",
        stats: [
          {
            label: "Průměrná cena (vily)",
            value: "1 800 – 3 000 USD/m²",
            priceCzkEquivalent: "(cca 42 000 – 70 000 Kč / m²)",
          },
          { label: "Roční zhodnocení", value: "8 – 15 %" },
          { label: "Průměrný výnos z nájmu", value: "10 – 15 %" },
        ],
        highlights: [
          "Cizinec nemůže vlastnit půdu (Freehold). Využívá se Leasehold (dlouhodobý pronájem na 25–30 let s opcí) nebo založení firmy PT PMA.",
          "Extrémně vysoké ROI z krátkodobých pronájmů díky celoroční sezóně a digitálním nomádům.",
          "Neexistuje standardní bankovní financování pro cizince, platí se hotově nebo ve splátkách developerovi během výstavby.",
        ],
      },
      financing: {
        intro:
          "Na Bali neexistuje standardní bankovní hypotéka pro zahraniční investory. Financování probíhá hotovostně nebo přes splátkový plán developera.",
        options: [
          {
            title: "Hotovostní nákup",
            description:
              "Nejčastější varianta — plná platba při podpisu leasehold smlouvy nebo přes PT PMA strukturu.",
          },
          {
            title: "Fázované platby u developera",
            description:
              "Splátky po dobu výstavby vily (typicky 12–18 měsíců) bez bankovního úvěru.",
          },
          {
            title: "Americká hypotéka v ČR",
            description:
              "Úvěr zajištěný českou nemovitostí pro financování nákupu na Bali z domovské země.",
          },
        ],
      },
      process: {
        intro:
          "Koupě na Bali vyžaduje právní strukturu (leasehold nebo PT PMA), due diligence a ověření stavebního povolení.",
        steps: [
          {
            title: "1. Výběr struktury vlastnictví",
            description:
              "Leasehold (25–30 let s opcí prodloužení) nebo založení firmy PT PMA pro freehold strukturu.",
          },
          {
            title: "2. Due diligence a smlouva",
            description:
              "Prověření vlastnických práv, stavebního povolení a podpis smlouvy s escrow účtem.",
          },
          {
            title: "3. Předání a správa pronájmu",
            description:
              "Dokončení vily, nastavení krátkodobého pronájmu a správy nemovitosti.",
          },
        ],
      },
      risks: {
        intro:
          "Bali nabízí vysoké výnosy, ale vyžaduje důkladnou znalost indonéské legislativy a prověrku developera.",
        warnings: [
          {
            title: "Leasehold místo freehold",
            description:
              "Cizinci nemohou vlastnit půdu přímo. Ověřte délku leaseholdu a možnost prodloužení.",
          },
          {
            title: "Nelegální stavby v zónách",
            description:
              "Některé vily stojí v chráněných oblastech bez stavebního povolení.",
          },
        ],
        opportunities: [
          "Extrémně vysoké ROI (10–15 %) z celoročního pronájmu",
          "Rostoucí poptávka digitálních nomádů a zlatých víz",
          "Přesun investic do nových zón (Uluwatu, Lovina)",
        ],
      },
    },
  },
  saudi: {
    title: "Investice a financování: Saúdská Arábie",
    subtitle: "Vision 2030 a nový realitní trh otevřený zahraničním investorům",
    tabs: {
      market: {
        overview:
          "Saúdská Arábie prochází transformací realitního trhu v rámci programu Vision 2030. Masivní přesun firem do Rijádu a nová legislativa pro zahraniční vlastnictví vytváří jedinečné investiční příležitosti.",
        stats: [
          {
            label: "Průměrná cena bytu",
            value: "7 000 – 12 000 SAR/m²",
            priceCzkEquivalent: "(cca 44 000 – 75 000 Kč / m²)",
          },
          { label: "Roční zhodnocení", value: "6 – 10 %" },
          { label: "Průměrný výnos z nájmu", value: "6.5 – 8.5 %" },
        ],
        highlights: [
          "Extrémní růst tažený vládním programem Vision 2030 a otevíráním trhu zahraničním investorům.",
          "Nová legislativa umožňující 100% zahraniční vlastnictví v prémiových zónách (Premium Residency).",
          "Masivní přesun centrál nadnárodních firem do Rijádu vytváří obrovskou poptávku po rezidenčním bydlení.",
        ],
      },
      financing: {
        intro:
          "Financování v Saúdské Arábii zahrnuje lokální hypotéky pro expaty, hotovostní nákupy a developerské splátkové plány.",
        options: [
          {
            title: "Saúdská hypotéka pro expaty",
            description:
              "Úvěr u místních bank pro zahraniční pracovníky s pracovním povolením. LTV typicky do 70 %.",
          },
          {
            title: "Hotovostní nákup / Off-plan",
            description:
              "Častá volba u nových projektů Vision 2030 s platbou po etapách výstavby.",
          },
          {
            title: "Americká hypotéka v ČR",
            description:
              "Úvěr zajištěný českou nemovitostí pro financování investice v prémiových zónách.",
          },
        ],
      },
      process: {
        intro:
          "Koupě v Saúdské Arábii vyžaduje ověření eligibility zóny pro cizince, due diligence a registraci u místního katastru.",
        steps: [
          {
            title: "1. Ověření eligibility",
            description:
              "Kontrola, zda nemovitost leží ve zóně povolené pro zahraniční vlastnictví (Premium Residency).",
          },
          {
            title: "2. Rezervace a smlouva",
            description:
              "Rezervační poplatek, due diligence developera a podpis kupní smlouvy.",
          },
          {
            title: "3. Registrace a převod",
            description:
              "Zápis do katastru, zaplacení transfer tax a předání nemovitosti.",
          },
        ],
      },
      risks: {
        intro:
          "Saúdský trh nabízí vysoký růstový potenciál, ale je relativně mladý a vyžaduje pečlivou prověrku.",
        warnings: [
          {
            title: "Omezení vlastnictví pro cizince",
            description:
              "Vlastnictví je povoleno jen ve vyjmenovaných zónách. Ověřte eligibilitu nemovitosti.",
          },
          {
            title: "Raná fáze trhu",
            description:
              "Trh je relativně mladý – důkladně prověřte developera a stav projektu.",
          },
        ],
        opportunities: [
          "Vision 2030 a masivní infrastrukturní investice",
          "Rostoucí poptávka po bydlení pro expaty v Rijádu",
          "Prémiové zóny s 100% zahraničním vlastnictvím",
        ],
      },
    },
  },
  slovakia: {
    title: "Investice a financování: Slovensko",
    subtitle: "Blízký trh s českou legislativní podobností a eurovými hypotékami",
    tabs: {
      market: {
        overview:
          "Slovensko je pro české investory nejbližší zahraniční trh. Bratislava těží z blízkosti Vídně, regionální města nabízejí vyšší výnosy a Tatry prémiový rekreační segment.",
        stats: [
          {
            label: "Průměrná cena bytu",
            value: "2 500 – 4 000 EUR/m²",
            priceCzkEquivalent: "(cca 62 500 – 100 000 Kč / m²)",
          },
          { label: "Roční zhodnocení", value: "3 – 6 %" },
          { label: "Průměrný výnos z nájmu", value: "4 – 5.5 %" },
        ],
        highlights: [
          "Geografická i kulturní blízkost pro české investory, absence jazykové bariéry.",
          "Bratislava těží z blízkosti Vídně, Vysoké Tatry nabízejí prémiové rekreační apartmány s celoročním výnosem.",
          "Snadné financování přes slovenské pobočky českých bank s využitím eurových hypoték a sazeb ECB.",
        ],
      },
      financing: {
        intro:
          "Financování na Slovensku je pro české investory dostupné přes slovenské banky i české zajištění.",
        options: [
          {
            title: "Slovenská hypotéka",
            description:
              "Úvěr u slovenských bank (ČSOB SK, Tatra banka, VÚB). Pro občany EU typicky LTV do 80 %.",
          },
          {
            title: "Hypotéka přes českou banku",
            description:
              "Některé české banky financují nemovitosti na Slovensku pro své klienty.",
          },
          {
            title: "Americká hypotéka v ČR",
            description:
              "Úvěr zajištěný českou nemovitostí pro nákup bytu nebo apartmánu na Slovensku.",
          },
        ],
      },
      process: {
        intro:
          "Koupě na Slovensku je pro Čechy jednoduchá díky podobné legislativě a blízkosti trhu.",
        steps: [
          {
            title: "1. Výběr nemovitosti",
            description:
              "Definice lokality (Bratislava, regionální města, Tatry) a ověření v katastru.",
          },
          {
            title: "2. Financování a smlouva",
            description:
              "Schválení hypotéky, rezervační a kupní smlouva u notáře.",
          },
          {
            title: "3. Převod a správa",
            description:
              "Zápis do katastra, předání nemovitosti a nastavení pronájmu.",
          },
        ],
      },
      risks: {
        intro:
          "Slovenský trh je stabilní, ale nese specifická rizika spojená s kurzem a lokální ekonomikou.",
        warnings: [
          {
            title: "Rozdíly v katastru a zápisech",
            description:
              "Slovenský katastr má odlišnou strukturu. Ověřte zástavní práva a věcná břemena.",
          },
          {
            title: "Kurzové riziko EUR/CZK",
            description:
              "Pokud příjem máte v CZK, splátky v EUR vás vystavují kurzovému riziku.",
          },
        ],
        opportunities: [
          "Geografická blízkost a snadná správa nemovitosti",
          "Eurové hypotéky se sazbami ECB",
          "Rostoucí poptávka v Bratislavě a turistických oblastech",
        ],
      },
    },
  },
};

function buildFallbackContent(country: CountryId): CountryDetailContent {
  const config = countryConfigs[country];
  const card = destinationCards.find((c) => c.id === country);

  return {
    title: `Investice a financování: ${card?.name ?? config.label}`,
    subtitle:
      card?.subtitle ??
      "Komplexní přehled trhu, financování a rizik pro vaši investici",
    tabs: {
      market: {
        overview: `Trh v destinaci ${card?.name ?? config.label} nabízí investiční příležitosti s lokálními specifiky. Připravujeme pro vás detailní analýzu cen, výnosů a likvidity.`,
        stats: [
          { label: "Měna trhu", value: config.currency },
          { label: "Referenční cena", value: `od ${config.defaultPrice.toLocaleString("cs-CZ")} ${config.currency}` },
          { label: "Typická sazba", value: `${config.defaultRate} % p.a.` },
        ],
        highlights: [
          "Dynamický segment investičních nemovitostí",
          "Možnosti financování přes české i lokální banky",
          "Růstový potenciál pro střednědobý horizont",
        ],
      },
      financing: {
        intro: "Financování se liší podle rezidence, typu nemovitosti a bonity klienta.",
        options: [
          {
            title: "Lokální hypotéka",
            description: "Standardní úvěr u bank v cílové zemi pro rezidenty i nerezidenty.",
          },
          {
            title: "Americká hypotéka v ČR",
            description: "Flexibilní úvěr zajištěný nemovitostí v ČR pro financování zahraniční investice.",
          },
          {
            title: "Developer payment plan",
            description: "Platba po etapách u vybraných projektů – vhodné pro off-plan nákupy.",
          },
        ],
      },
      process: {
        intro: "Proces koupě zahrnuje právní due diligence, financování a registraci vlastnictví.",
        steps: [
          {
            title: "1. Výběr nemovitosti",
            description: "Definice cíle investice, lokality a rozpočtu.",
          },
          {
            title: "2. Financování a smlouvy",
            description: "Schválení úvěru, rezervační a kupní smlouva.",
          },
          {
            title: "3. Převod a správa",
            description: "Registrace vlastnictví, předání a nastavení pronájmu.",
          },
        ],
      },
      risks: {
        intro: "Každý zahraniční trh nese specifická rizika – kurzy, daně a legislativu.",
        warnings: [
          {
            title: "Legislativní specifika",
            description: "Ověřte podmínky vlastnictví pro cizince a místní poplatky.",
          },
          {
            title: "Měnové riziko",
            description: "Kolísání kurzu může ovlivnit výnos i splátky úvěru z ČR.",
          },
        ],
        opportunities: [
          "Diverzifikace portfolia mimo český trh",
          "Potenciál vyššího výnosu v růstových destinacích",
          "Kombinace pronájmu a kapitálového zhodnocení",
        ],
      },
    },
  };
}

export function getCountryDetail(country: CountryId): CountryDetailContent {
  return countryDetailData[country] ?? buildFallbackContent(country);
}

export const countryDetailTabLabels: Record<
  CountryDetailTabId,
  { label: string; icon: string }
> = {
  market: { label: "Realitní trh", icon: "Building2" },
  financing: { label: "Možnosti financování", icon: "Landmark" },
  process: { label: "Proces koupě", icon: "ListChecks" },
  risks: { label: "Rizika a příležitosti", icon: "AlertTriangle" },
};
