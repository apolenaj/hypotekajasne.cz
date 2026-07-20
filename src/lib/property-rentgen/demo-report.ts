import type { DemoReport } from "@/lib/property-rentgen/types";

/**
 * Anonymní demo report pro SSR / SEO.
 * Jasně označen jako ukázka — hodnoty jsou ilustrativní MODEL/ODHAD.
 */
export const ANONYMOUS_DEMO_REPORT: DemoReport = {
  id: "demo-praha-byt-anonymni-v1",
  title: "Ukázkový report (anonymní demo)",
  subtitle: "Byt · Praha · ilustrativní vstup — ne konkrétní inzerát",
  disclaimer:
    "Toto je anonymní demo pro ilustraci výstupu Investičního rentgenu. Nejde o analýzu reálné nabídky. Každý údaj má typ DATA / MODEL / ODHAD / NEOVĚŘENO.",
  metrics: [
    {
      id: "price",
      label: "Kupní cena",
      display: "8 400 000 Kč",
      kind: "DATA",
      note: "Ilustrativní vstup dema (jako by zadal uživatel).",
    },
    {
      id: "area",
      label: "Užitná plocha",
      display: "68 m²",
      kind: "DATA",
      note: "Ilustrativní vstup dema.",
    },
    {
      id: "price_m2",
      label: "Cena / m²",
      display: "123 529 Kč",
      kind: "DATA",
      note: "Spočteno z dema: cena ÷ plocha.",
    },
    {
      id: "market_m2",
      label: "Modelová reference lokality / m²",
      display: "125 000 Kč",
      kind: "MODEL",
      note: "Referenční model Praha — ne live nabídka.",
    },
    {
      id: "rent",
      label: "Měsíční nájem (vstup)",
      display: "28 000 Kč",
      kind: "DATA",
      note: "Ilustrativní vstup dema.",
    },
    {
      id: "gross_yield",
      label: "Orientační hrubý výnos",
      display: "4,0 % p.a.",
      kind: "DATA",
      note: "28 000 × 12 / 8 400 000 — bez nákladů a daní.",
    },
    {
      id: "financing",
      label: "Financing fit (základ)",
      display: "LTV ~76 % při equity 2 000 000 Kč",
      kind: "ODHAD",
      note: "Neposuzuje bonitu ani schválení bankou.",
    },
    {
      id: "net_yield",
      label: "Čistý výnos",
      display: "Na vyžádání v Premium",
      kind: "NEOVERENO",
      note: "Bez ověřených nákladů nevymýšlíme čistý výnos ve free/demo.",
    },
    {
      id: "legal",
      label: "Právní vady / SVJ",
      display: "Neověřeno",
      kind: "NEOVERENO",
      note: "Bez dokumenty a kontroly nevydáváme právní závěr.",
    },
    {
      id: "tech",
      label: "Technický stav",
      display: "Neověřeno",
      kind: "NEOVERENO",
      note: "Vyžaduje prohlídku / posudek — není v automatickém preview.",
    },
    {
      id: "liquidity",
      label: "Likvidita lokality",
      display: "Orientačně vyšší (centrum města)",
      kind: "ODHAD",
      note: "Hrubý editorial odhad pro demo — ne statistika prodeje.",
    },
    {
      id: "sensitivity",
      label: "Citlivost na sazbu",
      display: "Premium scénáře",
      kind: "MODEL",
      note: "Kompletní citlivostní analýza je v placeném reportu.",
    },
  ],
  redFlags: [
    {
      text: "Demo: žádný silný red flag z čísel — absence flagu ≠ absence rizika.",
      kind: "ODHAD",
    },
    {
      text: "Právní a technický stav: NEOVĚŘENO (záměrně).",
      kind: "NEOVERENO",
    },
  ],
  financingFit: {
    value:
      "Při equity 2 mil. Kč a ceně 8,4 mil. Kč je orientační LTV ~76 %. ODHAD — finální posouzení provádí banka/licencovaný partner.",
    kind: "ODHAD",
  },
};

export const RENTGEN_FAQ: { q: string; a: string }[] = [
  {
    q: "Co je Investiční rentgen?",
    a: "Nástroj HypotékaJasně / Majetio ekosystému pro rychlý preview nemovitosti a cestu ke kompletní Majetio Property Analysis. Free vrstva ukáže orientační výnos, cenu/m², základní financing fit a red flags — vždy s označením DATA, MODEL, ODHAD nebo NEOVĚŘENO.",
  },
  {
    q: "Proč některé údaje říkají NEOVĚŘENO?",
    a: "Protože nevymýšlíme právní ani technická fakta bez zdroje. Dokud nemáme ověřený podklad, údaj neprodáváme jako fakt.",
  },
  {
    q: "Umíte načíst inzerát z URL?",
    a: "URL můžete vložit jako referenci. Automatické parsování obsahu inzerátu jako ověřená DATA zatím neprovádíme — údaje doplňte manuálně, nebo objednejte Premium analýzu.",
  },
  {
    q: "Co obsahuje Premium?",
    a: "Kompletní Majetio Property Analysis (cena konfigurovatelná v produktové konfiguraci, výchozí 4 990/5 000 Kč): rozšířené metriky, modelové scénáře, checklist due diligence a příprava podkladů. Neobsahuje závazné právní posouzení, technický průzkum na místě ani schválení úvěru.",
  },
  {
    q: "Je free preview investiční doporučení?",
    a: "Ne. Jde o orientační model a odhady pro rozhodnutí, zda má smysl jít do hloubky. Finální posouzení financování provádí banka nebo licencovaný partner.",
  },
  {
    q: "Mohu nahrát dokumenty a fotky?",
    a: "Upload je v architektuře produktu připravený a postupně se zapíná. Zatím použijte manuální vstup nebo Premium objednávku s předáním podkladů partnerovi.",
  },
];
