export {
  ANONYMOUS_SAMPLE_REPORT,
  ANONYMOUS_DEMO_REPORT,
  SAMPLE_REPORT_SECTION_TITLES,
} from "@/lib/property-rentgen/sample-report";

/** Krátké nákupní FAQ — ne metodická dokumentace. */
export const RENTGEN_FAQ: { q: string; a: string }[] = [
  {
    q: "Co potřebuji k analýze?",
    a: "Základ: lokalita, typ nemovitosti, kupní cena, plocha, nájem a vlastní kapitál. URL inzerátu je volitelná reference — obsah automaticky neověřujeme.",
  },
  {
    q: "Jaký je rozdíl mezi Rentgenem za {{DIGITAL_PRICE}} a analýzou za {{PRICE}}?",
    a: "Rentgen je digitální modelový dashboard během několika minut. Kompletní analýza za {{PRICE}} je hloubkový elektronický report konkrétní investice (ekonomika, scénáře, rizika, checklist) — ne investiční verdikt kupte/nekupte.",
  },
  {
    q: "Jaké údaje jsou ověřené?",
    a: "Ověřené jsou jen údaje, které zadáte vy, nebo které máme z katalogu s uvedeným zdrojem. Modelové výpočty a odhady vždy označujeme. Neověřená fakta nevydáváme za jistotu.",
  },
  {
    q: "Umíte analyzovat inzerát pouze z URL?",
    a: "URL můžete uložit jako odkaz. Automatické stažení a ověření všech dat z inzerátu zatím neprovádíme — klíčové údaje doplňte ručně.",
  },
  {
    q: "Je výstup investiční doporučení?",
    a: "Ne. Jde o modelový analytický nástroj. Finální rozhodnutí a posouzení financování je na vás a případně na bance / poradci.",
  },
  {
    q: "Jak rychle dostanu kompletní report?",
    a: "Bezplatný náhled ihned. Digitální Rentgen po aktivaci checkoutu. Kompletní analýza za {{PRICE}} se dodává elektronicky — termín potvrdíme při objednávce (bez hardcoded slibu, dokud není SLA nastavené v konfiguraci).",
  },
];
