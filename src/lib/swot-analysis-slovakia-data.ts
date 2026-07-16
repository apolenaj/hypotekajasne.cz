import type { SwotAnalysisSection } from "@/lib/swot-analysis-cz-data";

export const swotAnalysisSlovakiaData: SwotAnalysisSection[] = [
  {
    id: "strengths",
    title: "Silné stránky (Strengths)",
    icon: "ShieldCheck",
    color: "emerald",
    items: [
      {
        subtitle: "Eurozóna",
        text: "Používání eura eliminuje kurzové riziko a zjednodušuje financování pro investory z celé EU.",
      },
      {
        subtitle: "Kulturní blízkost",
        text: "Pro české investory je slovenský trh naprosto transparentní, srozumitelný a legislativně podobný.",
      },
      {
        subtitle: "Dostupnost",
        text: "Vynikající napojení na dopravní infrastrukturu a blízkost Vídně/Bratislavy zvyšuje likviditu nemovitostí.",
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
        subtitle: "Regionální rozdíly",
        text: "Velké rozdíly v cenách i likviditě mezi Bratislavou a zbytkem země (např. východní Slovensko).",
      },
      {
        subtitle: "Administrativa",
        text: "Úřední procesy na katastru a stavebních úřadech mohou být zdlouhavé.",
      },
      {
        subtitle: "Odolnost ekonomiky",
        text: "Ekonomika je silně závislá na automobilovém průmyslu, což může vést k lokálním výkyvům.",
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
        subtitle: "Rekreační apartmány",
        text: "Vysoký potenciál ve Vysokých a Nízkých Tatrách, kde roste poptávka po celoročním ubytování.",
      },
      {
        subtitle: "Průmyslové investice",
        text: "Nové závody (např. Volvo) vytvářejí poptávku po nájemním bydlení pro zaměstnance v regionech.",
      },
      {
        subtitle: "Eurový výnos",
        text: "Investice do nemovitostí v eurech slouží jako přirozený zajišťovací nástroj pro české investory.",
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
        subtitle: "Politická nestabilita",
        text: "Politický vývoj může ovlivnit investiční klima a daňové zákony, což zvyšuje dlouhodobou nejistotu.",
      },
      {
        subtitle: "Cenová dostupnost",
        text: "Vysoké ceny v Bratislavě ve vztahu k mzdám mohou vést k poklesu poptávky po koupi vlastního bydlení.",
      },
      {
        subtitle: "Úrokové zatížení",
        text: "Podobně jako v ČR, i na Slovensku refixace hypoték při vyšších sazbách ovlivňuje ochotu kupovat investiční byty.",
      },
    ],
  },
];
