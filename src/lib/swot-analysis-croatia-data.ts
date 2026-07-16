import type { SwotAnalysisSection } from "@/lib/swot-analysis-cz-data";

export const swotAnalysisCroatiaData: SwotAnalysisSection[] = [
  {
    id: "strengths",
    title: "Silné stránky (Strengths)",
    icon: "ShieldCheck",
    color: "emerald",
    items: [
      {
        subtitle: "Členství v Eurozóně a Schengenu",
        text: "Integrace odstranila bariéry pro investory, zjednodušila transakce a zvýšila prestiž trhu.",
      },
      {
        subtitle: "Poloha a dostupnost",
        text: "Pro investory z ČR, Rakouska a Německa je Chorvatsko ideální destinací na dojezd autem, což zvyšuje hodnotu rekreačních nemovitostí.",
      },
      {
        subtitle: "Boom turismu",
        text: "Trvale vysoký zájem o pobřeží Jadranu zajišťuje velmi vysokou obsazenost v letní sezóně.",
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
        subtitle: "Historické chyby v katastru",
        text: "Chorvatský katastr (Zemljišne knjige) může obsahovat historické nejasnosti ohledně vlastnictví, které vyžadují právní prověrku.",
      },
      {
        subtitle: "Silná sezónnost",
        text: "Příjmy z pronájmu jsou koncentrovány do úzkého okna 3–4 měsíců. Mimo sezónu je výnos minimální.",
      },
      {
        subtitle: "Omezená nabídka na pobřeží",
        text: "Poptávka v prémiových lokalitách (Dubrovník, Split) dramaticky převyšuje nabídku nových staveb.",
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
        subtitle: "Prodloužení sezóny",
        text: "Investice do objektů s celoročním provozem (wellness, ohřívané bazény, internet pro nomády) umožňují výnos mimo hlavní sezónu.",
      },
      {
        subtitle: "Infrastrukturní rozvoj",
        text: "Modernizace silnic a přístavů otevírá nové oblasti (např. vnitrozemí Istrie) pro masový turismus.",
      },
      {
        subtitle: "Zvýšení standardu",
        text: "Moderní apartmány s vysokým standardem v tradičních vesnicích mají obrovský potenciál růstu ceny.",
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
        subtitle: "Regulace nájemného",
        text: "Existuje riziko, že místní samosprávy zavedou přísnější regulace krátkodobých pronájmů kvůli přetlaku turistů.",
      },
      {
        subtitle: "Cenová bublina",
        text: "Rychlý růst cen po vstupu do Eurozóny může v některých lokalitách vést k dočasné stagnaci cen.",
      },
      {
        subtitle: "Právní spory",
        text: "Nedostatečná prověrka vlastnictví může vést ke komplikovaným právním sporům o pozemky.",
      },
    ],
  },
];
