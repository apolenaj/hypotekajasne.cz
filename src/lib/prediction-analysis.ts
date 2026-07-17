import type { CountryId } from "@/lib/calculators";

export interface PredictionAnalysisSection {
  title: string;
  content: string;
}

export interface PredictionAnalysis {
  title: string;
  intro: string;
  sections: PredictionAnalysisSection[];
}

const sharedSections: PredictionAnalysisSection[] = [
  {
    title: "Neviditelný zabiják výnosů: Inflace",
    content:
      'Věnujte pozornost kartě "Sežráno inflací". Mnoho lidí se raduje, že jejich byt za 20 let vyrostl na trojnásobek hodnoty. V reálné kupní síle se však zisk drasticky snižuje, protože inflace znehodnotila samotnou měnu. Právě proto je držení nemovitosti klíčové – pokud byste stejnou částku drželi na běžném účtu, inflace by vám z ní reálně smazala více než polovinu. Nemovitost nejen generuje zisk, ale funguje jako štít, který vaše peníze převádí v čase bez ztráty jejich "váhy".',
  },
  {
    title: "Složené úročení v praxi",
    content:
      "Ať už se rozhodnete pro jakýkoliv scénář (konzervativní či optimistický), všimněte si křivky kumulativního nájmu. Díky fenoménu, kdy se nájemné každoročně mírně zvyšuje a úročí (pokud je reinvestováno), začne po 10–15 letech křivka výnosů růst exponenciálně. Koupě bytu tak po určité době zaplatí nejen sama sebe, ale vygeneruje kapitál pro nákup dalšího aktiva.",
  },
];

export const predictionAnalysisByCountry: Record<CountryId, PredictionAnalysis> =
  {
    cz: {
      title: "Dva zdroje výnosu a rozdíl mezi nominálním a reálným výsledkem",
      intro:
        "Model na 20 let odděluje kapitálové zhodnocení od kumulovaného nájmu. Při zadaných předpokladech může být výsledek příznivý — mění se ale se sazbami, neobsazeností, inflací a náklady. Historický růst není zárukou budoucího vývoje.",
      sections: sharedSections,
    },
    dubai: {
      title: "Dubaj: daňový režim a citlivost modelu na náklady",
      intro:
        "V SAE model často počítá s vyšším startovním yieldem a absencí daně z příjmu z pronájmu. Reálný výsledek ale ovlivňují service charges, volatilita nabídky off-plan projektů a měnové i regulatorní riziko. Nejde o garantovaný výnos.",
      sections: [
        {
          title: "Service charges vs. inflace",
          content:
            "Konzervativní scénář počítá s nižším růstem cen kvůli přetlaku nabídky. Service charges však rostou s inflací — vlastník musí do modelu započítat roční poplatky správy, které nájemce neplatí.",
        },
        ...sharedSections,
      ],
    },
    spain: {
      title: "Španělsko: Sezónní yield a dlouhodobá kupní síla",
      intro:
        "Na pobřeží Španělska model kombinuje růst cen a sezónní / medium-term nájem. Odděluje nominální a reálný výsledek. Inflace v eurozóně bývá nižší než v ČR, ale stále ovlivňuje kupní sílu — a regulace Airbnb může změnit cash-flow.",
      sections: sharedSections,
    },
    italy: {
      title: "Itálie: Renovace jako třetí motor zhodnocení",
      intro:
        "Italský trh přidává k dvěma standardním motorům potenciál renovace — kapitálové zhodnocení po opravě často překoná čistý růst trhu. Predikce konzervativního scénáře reflektuje pomalejší trh mimo top destinace.",
      sections: sharedSections,
    },
    croatia: {
      title: "Chorvatsko: Sezónní exponenciála nájmů",
      intro:
        "Chorvatský model silně závisí na letní sezóně — kumulativní nájem v optimistickém scénáři roste rychleji než v ČR díky vyššímu startovnímu yieldu a turistické poptávce.",
      sections: sharedSections,
    },
    bali: {
      title: "Bali: Extrémní yield a měnové riziko",
      intro:
        "Bali nabízí nejvyšší startovní yield (12 %+), ale i vyšší inflační riziko v rozvíjející se ekonomice. Predikce musí počítat s leasehold horizontem — 20letá projekce může přesahovat délku právního vlastnictví.",
      sections: [
        {
          title: "Leasehold a horizont projekce",
          content:
            "Při 20leté predikci ověřte, zda vaše leasehold smlouva pokrývá celé období. Yield z pronájmu může být vysoký, ale právní horizont omezuje kapitálové zhodnocení po roce 25–30.",
        },
        ...sharedSections,
      ],
    },
    saudi: {
      title: "SAE: Spekulativní růst a kratší historie",
      intro:
        "Saúdská Arábie je emerging market — optimistický scénář reflektuje Vision 2030, konzervativní počítá s pomalejší adopcí. Dva motory zde fungují, ale s vyšší nejistotou odhadu.",
      sections: sharedSections,
    },
    slovakia: {
      title: "Slovensko: Paralelní mechanika s nižší bariérou vstupu",
      intro:
        "Slovenský trh kopíruje českou logiku dvou motorů s nižšími absolutními cenami v eurech. Predikce ukazuje, že i menší vstupní kapitál generuje srovnatelné procentní zhodnocení.",
      sections: sharedSections,
    },
  };

export function getPredictionAnalysis(countryId: CountryId): PredictionAnalysis {
  return predictionAnalysisByCountry[countryId];
}
