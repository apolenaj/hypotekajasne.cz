import type { DemoReport } from "@/lib/property-rentgen/types";

/**
 * Anonymní DEMO struktura reportu pro SSR / SEO.
 * Jasně označená jako DEMO — ne analýza reálné nabídky, žádná fake „schválená“ čísla.
 */
export const ANONYMOUS_DEMO_REPORT: DemoReport = {
  id: "demo-praha-byt-anonymni-v1",
  title: "DEMO — ukázková struktura reportu",
  subtitle:
    "Byt · anonymizovaná lokalita · ilustrativní vstupy — ne konkrétní inzerát",
  disclaimer:
    "DEMO data. Toto není analýza reálné nemovitosti ani investiční doporučení. Každý údaj má typ Data / Model / Odhad / Neověřeno. Prémiový report má stejnou strukturu s vašimi vstupy a hlubšími scénáři.",
  metrics: [
    {
      id: "price",
      label: "Kupní cena (DEMO vstup)",
      display: "8 400 000 Kč",
      kind: "DATA",
      note: "Ilustrativní vstup dema (jako by zadal uživatel).",
    },
    {
      id: "area",
      label: "Užitná plocha (DEMO vstup)",
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
      note: "Referenční model — ne live nabídka.",
    },
    {
      id: "rent",
      label: "Měsíční nájem (DEMO vstup)",
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
      label: "Čistý výnos (prémiová sekce)",
      display: "V detailní analýze",
      kind: "NEOVERENO",
      note: "DEMO free vrstva nevymýšlí čistý výnos bez ověřených nákladů.",
    },
    {
      id: "cash_flow",
      label: "Cash flow scénáře (prémiová sekce)",
      display: "V detailní analýze",
      kind: "MODEL",
      note: "DEMO ukazuje strukturu — ne vyplněné prémiové scénáře.",
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
      id: "sensitivity",
      label: "Citlivost na sazbu / neobsazenost",
      display: "V detailní analýze",
      kind: "MODEL",
      note: "Kompletní citlivost je v placeném reportu — ne garantovaný výnos.",
    },
  ],
  redFlags: [
    {
      text: "DEMO: žádný silný rizikový signál z čísel — absence varování ≠ absence rizika.",
      kind: "ODHAD",
    },
    {
      text: "Právní a technický stav: Neověřeno (záměrně v DEMO).",
      kind: "NEOVERENO",
    },
  ],
  financingFit: {
    value:
      "DEMO: Při vlastním kapitálu 2 mil. Kč a ceně 8,4 mil. Kč je orientační LTV ~76 %. Odhad — finální posouzení provádí banka / licencovaný partner.",
    kind: "ODHAD",
  },
};

/** FAQ — cena vždy přes {{PRICE}} / withAnalysisPrice(), nikoli hardcode 5 000. */
export const RENTGEN_FAQ: { q: string; a: string }[] = [
  {
    q: "Co je Investiční rentgen?",
    a: "Nástroj HypotékaJasně: bezplatný snapshot nemovitosti a cesta k detailní analýze. Free vrstva ukáže orientační výnos, cenu/m², fit financování a red flags — vždy s označením Data / Model / Odhad / Neověřeno.",
  },
  {
    q: "Co dostanu zdarma a za co platím?",
    a: "Zdarma: základní snapshot, klíčové metriky, red flags a financing fit. Za {{PRICE}} detailní cash flow, scénáře, výnos, náklady, rizika, lokální kontext, závěry a elektronický report. Pokročilá due diligence je jen na individuální poptávku — není samoobslužný e-shop produkt.",
  },
  {
    q: "Co detailní analýza NENÍ?",
    a: "Není garantovaný výnos, není právní due diligence bez právníka, není technická inspekce bez partnera a není schválení banky.",
  },
  {
    q: "Proč některé údaje říkají Neověřeno?",
    a: "Protože nevymýšlíme právní ani technická fakta bez zdroje. Dokud nemáme ověřený podklad, údaj neprodáváme jako fakt.",
  },
  {
    q: "Umíte načíst inzerát z URL?",
    a: "URL můžete vložit jako referenci. Automatické parsování obsahu inzerátu jako ověřená Data zatím neprovádíme — údaje doplňte ručně, nebo požádejte o detailní analýzu.",
  },
  {
    q: "Co obsahuje detailní analýza za {{PRICE}}?",
    a: "Modelové cash flow a scénáře, výnos, financování, náklady, rizika, lokální kontext, závěry a checklist otázek. Elektronický report. Neobsahuje závazné právní posouzení, technický průzkum na místě ani schválení úvěru.",
  },
  {
    q: "Co se stane po kliknutí na „Získat detailní analýzu“?",
    a: "Zanecháte kontakt a souhlas. Ozveme se s potvrzením rozsahu a postupem dodání. Dokud není spuštěná platební brána, jde o evidenci zájmu — ne o okamžitou platbu v e-shopu.",
  },
  {
    q: "Je bezplatný náhled investiční doporučení?",
    a: "Ne. Jde o orientační model a odhady pro rozhodnutí, zda má smysl jít do hloubky. Finální posouzení financování provádí banka nebo licencovaný partner.",
  },
];
