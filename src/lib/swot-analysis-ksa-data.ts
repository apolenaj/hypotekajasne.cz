import type { SwotAnalysisSection } from "@/lib/swot-analysis-cz-data";

export const swotAnalysisKsaData: SwotAnalysisSection[] = [
  {
    id: "strengths",
    title: "Silné stránky (Strengths)",
    icon: "ShieldCheck",
    color: "emerald",
    items: [
      {
        subtitle: "Vládní podpora (Vision 2030)",
        text: "Stát masivně investuje do infrastruktury a otevírá ekonomiku, což garantuje poptávku.",
      },
      {
        subtitle: "Expat ekonomika",
        text: "Stovky tisíc kvalifikovaných expatů se stěhují do Rijádu, což vytváří tlak na luxusní rezidenční bydlení.",
      },
      {
        subtitle: "Stabilní měna",
        text: "Rijál je pevně vázán na USD, což eliminuje měnové riziko pro dolarové investory.",
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
        subtitle: "Vysoká byrokracie",
        text: "Procesy nákupu, registrace a povolení jsou složité a často vyžadují lokální právní zastoupení.",
      },
      {
        subtitle: "Nákladný vstup",
        text: "Vysoké počáteční náklady na pořízení prémiových nemovitostí v top lokalitách.",
      },
      {
        subtitle: "Kulturní specifika",
        text: "Investiční prostředí se řídí místními zvyklostmi a právem, které je pro cizince méně předvídatelné.",
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
        subtitle: "NEOM a gigaprojekty",
        text: "Možnost participace na projektech budoucnosti, které nemají ve světě obdoby.",
      },
      {
        subtitle: "Relokace centrál",
        text: "Společnosti se povinně stěhují do Rijádu, což zaručuje dlouhodobé nájemce z řad managementu.",
      },
      {
        subtitle: "Zlatá víza (Premium Residency)",
        text: "Programy umožňující cizincům bezpečně vlastnit majetek a dlouhodobě v zemi podnikat.",
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
        subtitle: "Geopolitika",
        text: "Regionální napětí na Blízkém východě může mít okamžitý dopad na náladu investorů.",
      },
      {
        subtitle: "Volatilita ropné ekonomiky",
        text: "I když se země snaží diverzifikovat, rozpočty jsou stále citlivé na cenu ropy.",
      },
      {
        subtitle: "Nabídkový šok",
        text: "Pokud se dokončí všechny ohlášené gigaprojekty najednou, může dojít k dočasnému přebytku bytů.",
      },
    ],
  },
];
