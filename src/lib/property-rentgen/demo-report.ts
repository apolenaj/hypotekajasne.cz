/** FAQ — krátké nákupní otázky, bez interního žargonu. */
export const RENTGEN_FAQ: { q: string; a: string }[] = [
  {
    q: "Co potřebuji k výpočtu?",
    a: "Kupní cena, plocha, nájem, vlastní kapitál a základní předpoklady financování. URL inzerátu je volitelná reference — obsah automaticky neověřujeme.",
  },
  {
    q: "Co když nemám všechny podklady?",
    a: "Náhled spočítá to, co zadáte, a chybějící fakta neoznačí jako ověřená. Podrobný rozbor bez dokumentů nepotvrdí vlastnictví, technický stav ani absenci omezení.",
  },
  {
    q: "Jaký je rozdíl mezi modelem za {{DIGITAL_PRICE}} a rozborem za {{PRICE}}?",
    a: "Model dodá rozpočet, cash flow, scénáře a PDF z vašich vstupů. Rozbor navíc dohledá místní nabídky (s datem), projde dodané dokumenty v zajištěném rozsahu a doplní individuální závěr — bez automatického verdiktu kupte/nekupte.",
  },
  {
    q: "Jak rychle dostanu výsledek?",
    a: "Náhled ihned. Model po úhradě a kompletních vstupech — až bude prodej aktivní. Podrobný rozbor navrhovaně do 3 pracovních dnů od kompletních podkladů a úhrady; veřejný termín uvádíme jen pokud provoz toto plnění skutečně drží.",
  },
  {
    q: "Odkud berete srovnání nabídek?",
    a: "Jen z dohledaných veřejných zdrojů s odkazem a datem. Přiznáme, když dat není dost. Nabídkové ceny nejsou realizované prodeje.",
  },
  {
    q: "Je výstup investiční doporučení?",
    a: "Ne. Jde o model a doložené výpočty. Finální rozhodnutí a schválení úvěru je na vás a bance.",
  },
];

export {
  ANONYMOUS_SAMPLE_REPORT,
  ANONYMOUS_DEMO_REPORT,
  SAMPLE_REPORT_SECTION_TITLES,
} from "@/lib/property-rentgen/sample-report";
