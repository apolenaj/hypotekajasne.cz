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
    "Toto je anonymní demo pro ilustraci výstupu Investičního rentgenu. Nejde o analýzu reálné nabídky. Každý údaj má typ Data / Modelový výpočet / Odhad / Neověřeno.",
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
      label: "Vhodnost financování (základ)",
      display: "LTV ~76 % při vlastním kapitálu 2 000 000 Kč",
      kind: "ODHAD",
      note: "Neposuzuje bonitu ani schválení bankou.",
    },
    {
      id: "net_yield",
      label: "Čistý výnos",
      display: "Na vyžádání v Prémiové analýze",
      kind: "NEOVERENO",
      note: "Bez ověřených nákladů nevymýšlíme čistý výnos v bezplatném demu.",
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
      display: "Prémiové scénáře",
      kind: "MODEL",
      note: "Kompletní citlivostní analýza je v placeném reportu.",
    },
  ],
  redFlags: [
    {
      text: "Demo: žádný silný rizikový signál z čísel — absence varování ≠ absence rizika.",
      kind: "ODHAD",
    },
    {
      text: "Právní a technický stav: Neověřeno (záměrně).",
      kind: "NEOVERENO",
    },
  ],
  financingFit: {
    value:
      "Při vlastním kapitálu 2 mil. Kč a ceně 8,4 mil. Kč je orientační LTV ~76 %. Odhad — finální posouzení provádí banka/licencovaný partner.",
    kind: "ODHAD",
  },
};

export const RENTGEN_FAQ: { q: string; a: string }[] = [
  {
    q: "Co je Investiční rentgen?",
    a: "Nástroj HypotékaJasně pro rychlý náhled na nemovitost a cestu ke kompletní analýze s Majetio. Bezplatná vrstva ukáže orientační výnos, cenu/m², základní vhodnost financování a rizikové faktory — vždy s označením Data, Modelový výpočet, Odhad nebo Neověřeno.",
  },
  {
    q: "Proč některé údaje říkají Neověřeno?",
    a: "Protože nevymýšlíme právní ani technická fakta bez zdroje. Dokud nemáme ověřený podklad, údaj neprodáváme jako fakt.",
  },
  {
    q: "Umíte načíst inzerát z URL?",
    a: "URL můžete vložit jako referenci. Automatické parsování obsahu inzerátu jako ověřená Data zatím neprovádíme — údaje doplňte ručně, nebo objednejte Prémiovou analýzu.",
  },
  {
    q: "Co obsahuje Prémiová analýza?",
    a: "Kompletní analýza nemovitosti za 4 990 Kč: rozšířené metriky, modelové scénáře, checklist due diligence a příprava podkladů. Neobsahuje závazné právní posouzení, technický průzkum na místě ani schválení úvěru.",
  },
  {
    q: "Je bezplatný náhled investiční doporučení?",
    a: "Ne. Jde o orientační model a odhady pro rozhodnutí, zda má smysl jít do hloubky. Finální posouzení financování provádí banka nebo licencovaný partner.",
  },
  {
    q: "Mohu nahrát dokumenty a fotky?",
    a: "Nahrávání dokumentů připravujeme. Zatím použijte ruční vstup nebo Prémiovou objednávku s předáním podkladů partnerovi.",
  },
];
