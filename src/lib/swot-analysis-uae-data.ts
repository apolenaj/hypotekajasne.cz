import type { SwotAnalysisSection } from "@/lib/swot-analysis-cz-data";

export const swotAnalysisUaeData: SwotAnalysisSection[] = [
  {
    id: "strengths",
    title: "Silné stránky (Strengths)",
    icon: "ShieldCheck",
    color: "emerald",
    items: [
      {
        subtitle: "Daňový ráj",
        text: "Žádná daň z příjmu fyzických osob ani z kapitálových výnosů při prodeji nemovitosti. Maximální zhodnocení čistého zisku.",
      },
      {
        subtitle: "Strategická poloha",
        text: "Dubaj jako globální hub mezi východem a západem s prvotřídní infrastrukturou a letišti.",
      },
      {
        subtitle: "Golden Visa",
        text: "Program zlatých víz výrazně usnadňuje dlouhodobý pobyt a podnikání pro zahraniční investory.",
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
        subtitle: "Vysoké servisní poplatky",
        text: "Poplatky za správu budov (service charges) mohou výrazně ukrojit z čistého výnosu z nájmu.",
      },
      {
        subtitle: "Cykličnost trhu",
        text: "Trh je silně závislý na přílivu expatů a turistů. V době globální recese bývá volatilnější než evropské trhy.",
      },
      {
        subtitle: "Extrémní klima",
        text: "Letní měsíce s teplotami přes 40 °C omezují venkovní aktivity a mohou snižovat obsazenost v mimosezóně.",
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
        subtitle: "Vision 2030 (Saudi spillover)",
        text: "Ekonomický boom v Saúdské Arábii táhne poptávku po rezidenčních nemovitostech v Dubaji jakožto 'druhém domově' pro tamní management.",
      },
      {
        subtitle: "Krátkodobé pronájmy",
        text: "Vysoká poptávka po dovolenkových apartmánech v komunitách jako JVC nebo Marina umožňuje násobně vyšší výnosy než dlouhodobý nájem.",
      },
      {
        subtitle: "Off-plan flipping",
        text: "Možnost koupě nemovitosti ve výstavbě s nízkou akontací a následný prodej (flipping) před dokončením při růstu trhu.",
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
        subtitle: "Oversupply (Přetlak výstavby)",
        text: "Obrovské množství projektů ve výstavbě může v budoucnu vést k poklesu cen nájmů v důsledku saturace trhu.",
      },
      {
        subtitle: "Geopolitická nestabilita",
        text: "Jakákoliv eskalace napětí v regionu Blízkého východu okamžitě ovlivňuje důvěru investorů.",
      },
      {
        subtitle: "Měnové riziko (USD peg)",
        text: "Dirham (AED) je fixován na dolar. Pokud dolar posílí k ostatním měnám, nemovitosti se stávají pro cizince dražšími.",
      },
    ],
  },
];
