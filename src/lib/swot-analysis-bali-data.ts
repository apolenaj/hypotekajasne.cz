import type { SwotAnalysisSection } from "@/lib/swot-analysis-cz-data";

export const swotAnalysisBaliData: SwotAnalysisSection[] = [
  {
    id: "strengths",
    title: "Silné stránky (Strengths)",
    icon: "ShieldCheck",
    color: "emerald",
    items: [
      {
        subtitle: "Extrémně vysoké výnosy",
        text: "ROI z krátkodobých pronájmů (Airbnb) v turistických oblastech jako Canggu nebo Uluwatu dosahuje 10–15 % p.a.",
      },
      {
        subtitle: "Celoroční sezóna",
        text: "Na rozdíl od evropských destinací Bali profituje z přílivu turistů a digitálních nomádů po celý rok.",
      },
      {
        subtitle: "Životní styl",
        text: "Vysoká poptávka po dlouhodobém bydlení pro cizince, kteří chtějí na Bali žít a pracovat.",
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
        subtitle: "Leasehold komplikace",
        text: "Cizinci nemohou vlastnit půdu (Freehold). Vše se řeší přes Leasehold (pronájem na 25–30 let), což snižuje hodnotu majetku ke konci smlouvy.",
      },
      {
        subtitle: "Infrastruktura",
        text: "Dopravní zácpy v hlavních uzlech (Canggu) mohou komplikovat logistiku správy nemovitostí.",
      },
      {
        subtitle: "Závislost na turismu",
        text: "Jakákoliv globální pandemie nebo změna vízové politiky okamžitě dopadá na výnosnost.",
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
        subtitle: "Rozvoj jihu (Uluwatu)",
        text: "Uluwatu se stává prémiovou alternativou k přelidněnému Canggu s vyšším potenciálem růstu hodnoty.",
      },
      {
        subtitle: "Zlatá víza",
        text: "Indonéská vláda usnadňuje pobyt investorům, což zvyšuje poptávku po luxusních vilách.",
      },
      {
        subtitle: "Profesionální správa",
        text: "Vzestup firem, které kompletně spravují pronájem, umožňuje pasivní příjem i z ČR.",
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
        subtitle: "Změny v zoning-u",
        text: "Zákaz výstavby (Green zone) v místech, kde dříve bylo možné stavět, může znehodnotit zakoupené pozemky.",
      },
      {
        subtitle: "Overbuilding",
        text: "Přetlak nových projektů v populárních oblastech může vést k poklesu cen za pronájem vlivem vysoké konkurence.",
      },
      {
        subtitle: "Ekologická rizika",
        text: "Problémy s odpadem a erozí pobřeží v hustě zastavěných oblastech mohou odradit bonitní klientelu.",
      },
    ],
  },
];
