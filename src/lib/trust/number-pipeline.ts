/**
 * Jak vzniká číslo, které vidíte — veřejný flow metodiky (PROMPT 13).
 */

export const NUMBER_PIPELINE_STEPS = [
  {
    id: "source",
    title: "Zdroj",
    text: "Vezmeme primární nebo autoritativní vstup (web banky, ČNB, katastr, daňová správa). Interní soubor sám o sobě nestačí.",
  },
  {
    id: "validation",
    title: "Validace",
    text: "Zkontrolujeme, že údaj dává smysl, má datum a neporušuje pravidla (žádné vymyšlené URL ani čísla).",
  },
  {
    id: "compute",
    title: "Výpočet / model",
    text: "Kde je potřeba, spočítáme anuitu, LTV, scénář. Výsledek modelu vždy zůstane označený jako MODEL — ne jako LIVE nabídka.",
  },
  {
    id: "verifiedAt",
    title: "Datum ověření",
    text: "Uložíme, kdy jsme údaj naposledy ověřili. Po překročení freshness okna přejde LIVE na NEEDS UPDATE.",
  },
  {
    id: "display",
    title: "Zobrazení klientovi",
    text: "Ukážeme číslo se statusem, zdrojem a možností otevřít evidenci. Model nikdy nevydáváme za aktuální bankovní nabídku.",
  },
] as const;

export const EDITORIAL_LEGAL_SOURCES_LABEL =
  "redakční kontrola právních zdrojů";

/**
 * Text u dossieru, když není evidován odborník (legalReviewedBy).
 */
export function editorialLegalSourcesReviewText(
  scope: string,
  asOf: string
): string {
  return `Poslední ${EDITORIAL_LEGAL_SOURCES_LABEL} (${scope}): ${asOf}`;
}
