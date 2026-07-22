export {
  ANONYMOUS_SAMPLE_REPORT,
  ANONYMOUS_DEMO_REPORT,
  SAMPLE_REPORT_SECTION_TITLES,
} from "@/lib/property-rentgen/sample-report";

/** FAQ — cena vždy přes {{PRICE}} / withAnalysisPrice(), nikoli hardcode 5 000. */
export const RENTGEN_FAQ: { q: string; a: string }[] = [
  {
    q: "Co je Investiční rentgen?",
    a: "Nástroj Hypotéka Jasně: bezplatný snapshot nemovitosti a cesta k detailní analýze. Free vrstva ukáže cenu/m², porovnání trhu (kde máme data), hrubý výnos, modelové cash flow, financing fit, varovné signály a data quality — vždy s označením Data / Model / Odhad / Neověřeno.",
  },
  {
    q: "Co dostanu zdarma a za co platím?",
    a: "Zdarma: snapshot, klíčové metriky, market comparison (pokud existují katalogová data), model cash flow, red flags a financing fit. Za {{PRICE}} kompletní report se scénáři (cash flow, financing, stress test, checklist, decision framework). Pokročilá due diligence je jen na individuální poptávku.",
  },
  {
    q: "Co detailní analýza NENÍ?",
    a: "Není garantovaný výnos, není právní due diligence bez právníka, není technická inspekce bez partnera a není schválení banky. Nepoužíváme „human verified“, pokud report reálně nekontroloval člověk.",
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
    a: "Report se sekcemi: executive summary, property overview, market comparison, price analysis, rental model, cash-flow a financing scénáře, stress test, liquidity risk, legal checklist, red flags, data quality a final decision framework. Elektronický export. Neobsahuje závazné právní posouzení ani schválení úvěru.",
  },
  {
    q: "Co se stane po kliknutí na „Získat detailní analýzu“?",
    a: "Pokud produkt není aktivní: zobrazíme „Připravujeme“ a můžete zanechat zájem — ne fake checkout. Po spuštění: kontakt, potvrzení rozsahu a dodání dle konfigurovaného SLA (pokud je nastaveno).",
  },
  {
    q: "Je bezplatný náhled investiční doporučení?",
    a: "Ne. Jde o orientační model a odhady pro rozhodnutí, zda má smysl jít do hloubky. Finální posouzení financování provádí banka nebo partner.",
  },
];
