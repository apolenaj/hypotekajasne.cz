import type { SwotAnalysisSection } from "@/lib/swot-analysis-cz-data";

export const swotAnalysisSpainData: SwotAnalysisSection[] = [
  {
    id: "strengths",
    title: "Silné stránky (Strengths)",
    icon: "ShieldCheck",
    color: "emerald",
    items: [
      {
        subtitle: "Lifestyle a podnebí",
        text: "Středomořské klima a životní styl jsou hlavním magnetem, který zajišťuje stabilní poptávku po druhém domově (second home).",
      },
      {
        subtitle: "EU právní rámec",
        text: "Bezpečné prostředí v rámci Evropské unie s jasnými pravidly ochrany vlastnictví a zápisu v katastru.",
      },
      {
        subtitle: "Dostupná letecká síť",
        text: "Vynikající propojení nízkonákladovými aerolinkami s celou Evropou, což podporuje krátkodobé pronájmy.",
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
        subtitle: "Byrokracie (NIE)",
        text: "Procesy spojené s nákupem (získání NIE, bankovní účet, notář) jsou pomalé a administrativně náročné.",
      },
      {
        subtitle: "Regionální rozdíly",
        text: "Trh je velmi fragmentovaný. Zatímco pobřeží roste, vnitrozemí (vyjma Madridu) může stagnovat a mít nízkou likviditu.",
      },
      {
        subtitle: "Vysoké daně",
        text: "Daňové zatížení při nákupu (ITP/IVA) a následně při pronájmu není zanedbatelné a snižuje čistý výnos.",
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
        subtitle: "Renovace (Flipping)",
        text: "Nákup starších bytů na pobřeží, které vyžadují modernizaci, a jejich následný prodej za prémiovou cenu.",
      },
      {
        subtitle: "Digitální nomádi",
        text: "Rostoucí popularita Španělska jako destinace pro práci na dálku zvyšuje poptávku po střednědobých pronájmech (1–3 měsíce).",
      },
      {
        subtitle: "Infrastrukturní rozvoj",
        text: "Rozšiřování sítě vysokorychlostních vlaků (AVE) zpřístupňuje dříve okrajové lokality a zvyšuje jejich hodnotu.",
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
        subtitle: "Regulace nájemného (Ley de Vivienda)",
        text: "Nová legislativa zavádí cenové stropy nájemného v 'napjatých zónách', což může znehodnotit investiční kalkulace.",
      },
      {
        subtitle: "Zákazy turistických licencí",
        text: "Města jako Barcelona nebo Málaga aktivně bojují proti Airbnb a omezují udělování licencí pro krátkodobý pronájem.",
      },
      {
        subtitle: "Okupační práva (Okupas)",
        text: "Specifické španělské riziko, kde neoprávnění nájemníci mohou v určitých případech blokovat nemovitost i po delší dobu.",
      },
    ],
  },
];
