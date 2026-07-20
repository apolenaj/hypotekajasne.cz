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
        text: "Stát investuje do infrastruktury a otevírá ekonomiku, což může podporovat poptávku — bez záruky konkrétního výnosu.",
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
        text: "Přesun firemních sídel do Rijádu zvyšuje poptávku po bydlení managementu — nejde o záruku obsazenosti konkrétní nemovitosti.",
      },
      {
        subtitle: "Premium Residency + Non-Saudi Ownership (2026)",
        text: "Premium Residency zůstává doplňkovou cestou; od ledna 2026 platí zónový režim vlastnictví nesaúdských osob — vždy ověřte Geographic Scope.",
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
