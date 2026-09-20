/** FAQ — krátké nákupní otázky, bez interního žargonu. */
export const RENTGEN_FAQ: { q: string; a: string }[] = [
  {
    q: "Co potřebuji k výpočtu?",
    a: "Kupní cena, plocha, nájem bez přeúčtovaných záloh a vlastní část kupní ceny. Volitelně sazbu a splatnost úvěru. Odkaz na inzerát je jen reference — obsah automaticky nenačítáme.",
  },
  {
    q: "Co když nemám všechny podklady?",
    a: "Náhled spočítá to, co zadáte, a chybějící fakta neoznačí jako ověřená. Individuální rozbor bez dokumentů nepotvrdí vlastnictví, technický stav ani absenci omezení.",
  },
  {
    q: "Jaký je rozdíl mezi Rentgenem za {{DIGITAL_PRICE}} a rozborem za {{PRICE}}?",
    a: "Rentgen dodá rozpočet, cash flow, scénáře a PDF z vašich vstupů. Rozbor navíc dohledá místní nabídky (se zdrojem a datem), projde dodané dokumenty v dohodnutém rozsahu a doplní individuální závěr — bez verdiktu kupte/nekupte.",
  },
  {
    q: "Jak rychle dostanu výsledek?",
    a: "Náhled ihned. Placené balíčky objednáte online přes Stripe. Po úhradě a kompletních vstupech získáte výstup; u individuálního rozboru termín potvrdíme podle rozsahu podkladů.",
  },
  {
    q: "Odkud berete srovnání nabídek?",
    a: "Jen z dohledaných veřejných zdrojů s odkazem a datem. Přiznáme, když dat není dost. Nabídkové ceny nejsou realizované prodeje.",
  },
  {
    q: "Je výstup investiční doporučení?",
    a: "Ne. Jde o model podle vstupů a předpokladů. Nenahrazuje technickou ani právní prověrku. Schválení úvěru je na bance.",
  },
];

export {
  ANONYMOUS_SAMPLE_REPORT,
  ANONYMOUS_DEMO_REPORT,
  SAMPLE_REPORT_SECTION_TITLES,
} from "@/lib/property-rentgen/sample-report";
