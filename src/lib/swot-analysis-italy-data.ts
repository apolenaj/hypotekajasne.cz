import type { SwotAnalysisSection } from "@/lib/swot-analysis-cz-data";

export const swotAnalysisItalyData: SwotAnalysisSection[] = [
  {
    id: "strengths",
    title: "Silné stránky (Strengths)",
    icon: "ShieldCheck",
    color: "emerald",
    items: [
      {
        subtitle: "Kulturní a historické dědictví",
        text: "Nemovitosti v Itálii jsou unikátní aktivum s obrovskou mezinárodní prestiží, které si drží hodnotu i v dobách krize.",
      },
      {
        subtitle: "Silný cestovní ruch",
        text: "Itálie je globálně nejžádanější destinací, což zajišťuje stabilní poptávku po rekreačních pronájmech.",
      },
      {
        subtitle: "Právní rámec EU",
        text: "Působení v rámci EU garantuje ochranu vlastnických práv a transparentní systém zápisů.",
      },
    ],
  },
  {
    id: "weaknesses",
    title: "Slabé stránky (Weaknesses)",
    icon: "TrendingDown",
    color: "orange",
    items: [
      {
        subtitle: "Byrokracie a pomalost",
        text: "Administrativní procesy, včetně zápisů v katastru, jsou v Itálii notoricky pomalé a vyžadují místního notáře.",
      },
      {
        subtitle: "Stagnující ekonomika",
        text: "Nízký hospodářský růst celé země limituje rychlost zhodnocení nemovitostí v méně prestižních oblastech.",
      },
      {
        subtitle: "Vysoké daně",
        text: "Daňová zátěž při nákupu (imposta di registro) a následném držení nemovitosti snižuje čistý výnos.",
      },
    ],
  },
  {
    id: "opportunities",
    title: "Příležitosti (Opportunities)",
    icon: "Lightbulb",
    color: "blue",
    items: [
      {
        subtitle: "Daňové paušály",
        text: "Itálie nabízí atraktivní daňové programy pro cizince (např. 'flat tax' pro nové rezidenty), které motivují k nákupu.",
      },
      {
        subtitle: "Rekonstrukce historických objektů",
        text: "Využití státních pobídek pro renovace historických center (tzv. 'borghi') oživuje dříve zapomenuté lokality.",
      },
      {
        subtitle: "Digitální nomádi",
        text: "Nové programy a víza pro nomády zvyšují poptávku po střednědobém bydlení v městech jako Milán nebo Florencie.",
      },
    ],
  },
  {
    id: "threats",
    title: "Rizika (Threats)",
    icon: "AlertOctagon",
    color: "red",
    items: [
      {
        subtitle: "Abuso edilizio (Černé stavby)",
        text: "Riziko nákupu nemovitosti s nepovolenými úpravami, které mohou vést k soudním sporům nebo nařízenému odstranění.",
      },
      {
        subtitle: "Právní náročnost",
        text: "Notářský proces je striktní. Jakákoliv nejasnost v dokumentaci může nákup zablokovat na měsíce.",
      },
      {
        subtitle: "Teritoriální rozdíly",
        text: "Koupě nemovitosti mimo hlavní turistické nebo byznysové tepny může znamenat velmi nízkou likviditu (nemovitost nelze prodat).",
      },
    ],
  },
];
