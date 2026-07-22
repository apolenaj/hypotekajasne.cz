import type {
  SampleReport,
  SampleReportSection,
  SampleReportSectionId,
  WarningSignal,
} from "@/lib/property-rentgen/types";

const DEMO_PRICE = 8_400_000;
const DEMO_AREA = 68;
const DEMO_RENT = 28_000;
const DEMO_EQUITY = 2_000_000;
const DEMO_PRICE_M2 = Math.round(DEMO_PRICE / DEMO_AREA);
const DEMO_YIELD = Math.round(((DEMO_RENT * 12) / DEMO_PRICE) * 1000) / 10;
const DEMO_LTV = Math.round(((DEMO_PRICE - DEMO_EQUITY) / DEMO_PRICE) * 100);

function section(
  id: SampleReportSectionId,
  title: string,
  tier: "free" | "premium",
  method: SampleReportSection["method"],
  methodNote: string,
  summary: string,
  bullets: string[],
  claimKind: SampleReportSection["claimKind"] = "MODEL"
): SampleReportSection {
  return {
    id,
    title,
    method,
    methodNote,
    tier,
    claimKind,
    summary,
    bullets,
  };
}

const SECTIONS: SampleReportSection[] = [
  section(
    "executive_summary",
    "Executive summary",
    "premium",
    "ai_analysis",
    "AI může syntetizovat závěr z modelových vstupů — není investiční doporučení.",
    "DEMO: Byt v anonymizované lokalitě — hrubý výnos ~4 %, LTV ~76 % při vlastním kapitálu 2 mil. Kč. Absence red flag z čísel ≠ absence rizika.",
    [
      "Orientační verdict: pokračovat v due diligence, ne rozhodnutí koupě.",
      "Právní a technický stav záměrně Neověřeno v DEMO.",
    ],
    "ODHAD"
  ),
  section(
    "property_overview",
    "Property overview",
    "free",
    "automated_calculation",
    "Vypočteno z demo vstupů uživatele.",
    "Byt · 68 m² · kupní cena 8,4 mil. Kč · nájem 28 tis. Kč/měs.",
    ["Účel: investice (DEMO)", "Vlastní kapitál: 2 000 000 Kč (DEMO)"],
    "DATA"
  ),
  section(
    "market_comparison",
    "Market comparison",
    "free",
    "automated_calculation",
    "Srovnání s modelovou referencí lokality — jen kde máme katalog.",
    "Cena/m² DEMO jednotky je blízko modelové reference Prahy (~125 000 Kč/m²).",
    [
      "Rozdíl vs. reference: orientační, ne live tržní data.",
      "Bez ověřené lokality sekce zůstane prázdná — ne vymýšlíme trh.",
    ],
    "MODEL"
  ),
  section(
    "price_analysis",
    "Price analysis",
    "free",
    "automated_calculation",
    "Cena/m² a pásmo vs. reference z katalogu nebo vstupu.",
    `DEMO cena/m²: ${DEMO_PRICE_M2.toLocaleString("cs-CZ")} Kč.`,
    ["Výrazný premium/discount signal vyžaduje ověření stavu a práva."],
    "DATA"
  ),
  section(
    "rental_model",
    "Rental model",
    "premium",
    "automated_calculation",
    "Nájem a hrubý výnos z vstupů; neobsazenost v prémiových scénářích.",
    `DEMO hrubý výnos ${DEMO_YIELD} % p.a. z nájmu ${DEMO_RENT.toLocaleString("cs-CZ")} Kč.`,
    ["Čistý výnos až po modelových nákladech v premium scénářích."],
    "DATA"
  ),
  section(
    "cash_flow_scenarios",
    "Cash-flow scenarios",
    "premium",
    "automated_calculation",
    "Měsíční tok = nájem − modelová splátka − provoz (MODEL).",
    "DEMO base case: kladný hrubý tok před rezervou a daněmi.",
    ["Scénář −10 % nájmu a +2 p.b. sazby v premium reportu."],
    "MODEL"
  ),
  section(
    "financing_scenarios",
    "Financing scenarios",
    "premium",
    "automated_calculation",
    "LTV / DSTI rámec z regulačního modelu — ne schválení banky.",
    `DEMO orientační LTV ~${DEMO_LTV} % — odhad financovatelnosti.`,
    ["Scénář vyšší akontace zlepší LTV v modelu."],
    "ODHAD"
  ),
  section(
    "stress_test",
    "Stress test",
    "premium",
    "automated_calculation",
    "Citlivost na sazbu (+2 p.b.) a neobsazenost.",
    "DEMO: při +2 p.b. modelová splátka roste — ověřte rezervu.",
    ["Není predikce budoucí sazby."],
    "MODEL"
  ),
  section(
    "liquidity_risk",
    "Liquidity risk",
    "premium",
    "automated_calculation",
    "Orientační likvidita lokality z redakčního přehledu.",
    "Praha — vyšší likvidita než periferní trhy (MODEL/ODHAD).",
    ["Ne garantuje rychlost prodeje konkrétní jednotky."],
    "ODHAD"
  ),
  section(
    "legal_document_checklist",
    "Legal / document checklist",
    "premium",
    "automated_calculation",
    "Checklist otázek — odpovědi nejsou automaticky ověřeny.",
    "SVJ, věcná břemena, plomba, energetický štítek — Neověřeno v DEMO.",
    [
      "Lidská verifikace jen po objednání partnerské služby — ne v automatickém reportu.",
    ],
    "NEOVERENO"
  ),
  section(
    "red_flags",
    "Red flags",
    "free",
    "automated_calculation",
    "Signály jen z dostupných číselných vstupů.",
    "DEMO: žádný silný numerický signál — absence varování ≠ absence rizika.",
    ["Právní/technické red flags vyžadují dokumenty nebo prohlídku."],
    "ODHAD"
  ),
  section(
    "data_quality",
    "Data quality",
    "free",
    "automated_calculation",
    "Skóre completeness vstupů — ne kvalita nemovitosti.",
    "DEMO profil: vysoká completeness (cena, plocha, nájem, kapitál).",
    ["Chybějící pole snižují spolehlivost modelu."],
    "MODEL"
  ),
  section(
    "final_decision_framework",
    "Final decision framework",
    "premium",
    "ai_analysis",
    "AI může navrhnout další kroky — vždy s disclaimerem.",
    "DEMO: pokračovat checklistem, ověřit právo/stav, teprve pak nabídka.",
    ["Finální rozhodnutí zůstává na vás a vašich poradcích."],
    "ODHAD"
  ),
];

const DEMO_WARNINGS: WarningSignal[] = [
  {
    id: "demo_no_strong",
    text: "DEMO: žádný silný rizikový signál z čísel — absence varování ≠ absence rizika.",
    kind: "ODHAD",
    severity: "info",
  },
  {
    id: "demo_legal",
    text: "Právní a technický stav: Neověřeno (záměrně v DEMO).",
    kind: "NEOVERENO",
    severity: "watch",
  },
];

export const ANONYMOUS_SAMPLE_REPORT: SampleReport = {
  id: "demo-praha-byt-anonymni-v2",
  title: "DEMO — ukázková struktura reportu (Investiční rentgen)",
  subtitle:
    "Byt · anonymizovaná lokalita · ilustrativní vstupy — ne konkrétní inzerát",
  disclaimer:
    "DEMO data. Toto není analýza reálné nemovitosti ani investiční doporučení. Sekce označují typ obsahu (automatizovaný výpočet / AI / lidská verifikace) a claim Data / Model / Odhad / Neověřeno. Lidská verifikace v DEMO neproběhla.",
  isDemo: true,
  sections: SECTIONS,
  metrics: [
    {
      id: "price",
      label: "Kupní cena (DEMO vstup)",
      display: "8 400 000 Kč",
      kind: "DATA",
      note: "Ilustrativní vstup dema.",
    },
    {
      id: "area",
      label: "Užitná plocha (DEMO vstup)",
      display: "68 m²",
      kind: "DATA",
    },
    {
      id: "price_m2",
      label: "Cena / m²",
      display: `${DEMO_PRICE_M2.toLocaleString("cs-CZ")} Kč`,
      kind: "DATA",
      note: "Spočteno z dema: cena ÷ plocha.",
    },
    {
      id: "market_m2",
      label: "Modelová reference lokality / m²",
      display: "125 000 Kč",
      kind: "MODEL",
      note: "Referenční model — ne live nabídka.",
    },
    {
      id: "gross_yield",
      label: "Orientační hrubý výnos",
      display: `${DEMO_YIELD} % p.a.`,
      kind: "DATA",
    },
    {
      id: "cash_flow",
      label: "Modelové cash flow (free snapshot)",
      display: "V náhledu po vyplnění",
      kind: "MODEL",
    },
    {
      id: "financing",
      label: "Financing fit",
      display: `LTV ~${DEMO_LTV} % při vlastním kapitálu 2 000 000 Kč`,
      kind: "ODHAD",
    },
    {
      id: "data_quality",
      label: "Data quality indicator",
      display: "Completeness profilu (DEMO: vysoká)",
      kind: "MODEL",
    },
  ],
  warningSignals: DEMO_WARNINGS,
  financingFit: {
    value: `DEMO: Při vlastním kapitálu 2 mil. Kč a ceně 8,4 mil. Kč je orientační LTV ~${DEMO_LTV} %. Odhad — finální posouzení provádí banka / partner.`,
    kind: "ODHAD",
  },
};

/** @deprecated alias */
export const ANONYMOUS_DEMO_REPORT = ANONYMOUS_SAMPLE_REPORT;

export const SAMPLE_REPORT_SECTION_TITLES: Record<SampleReportSectionId, string> =
  Object.fromEntries(
    SECTIONS.map((s) => [s.id, s.title])
  ) as Record<SampleReportSectionId, string>;
