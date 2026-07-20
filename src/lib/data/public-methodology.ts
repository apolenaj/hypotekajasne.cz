/**
 * Veřejná metodika — texty bez implementačních detailů.
 * Interní SoT (tabulky, scrapery, cesty v kódu): docs/internal/metodika.md
 */

import type { DataDomain, DataStatus } from "@/lib/data/types";

/** Veřejné vysvětlení statusů (bez scraper/API/threshold jargon). */
export const PUBLIC_STATUS_MEANINGS: Record<
  DataStatus,
  { label: string; description: string }
> = {
  LIVE: {
    label: "Aktuální data",
    description:
      "Údaj ze zdroje, který pravidelně kontrolujeme (např. sazby z webů bank). Stále nejde o závaznou nabídku — banka schvaluje individuálně.",
  },
  VERIFIED: {
    label: "Ověřeno",
    description:
      "Manuálně ověřený editorial nebo oficiální rámec (např. limity ČNB). Platí do další kontroly.",
  },
  MODELLED: {
    label: "Modelový výpočet",
    description:
      "Orientační výpočet platformy. Není živá kotace banky ani nabídka konkrétní nemovitosti.",
  },
  PARTNER_QUOTE: {
    label: "Nabídka partnera",
    description:
      "Údaj od partnera, ověřený provozovatelem. Nejde o veřejný ceník všech bank.",
  },
  STALE: {
    label: "Čeká na aktualizaci",
    description:
      "Údaj je starší nebo chybí. Zobrazíme upozornění — čísla si nevymýšlíme.",
  },
};

/**
 * Veřejné blurby metodiky — odkud data jsou a jak počítáme.
 * Žádné názvy tabulek, souborů ani API.
 */
export const PUBLIC_METHODOLOGY_BLURBS = {
  rates:
    "Sazby českých bank bereme z oficiálních webů bank (a ověřených agregátorů). Kontrolujeme je pravidelně. Chybí-li sazba bez pojištění, doplníme ji jen jako orientační modelový výpočet (+0,3 p. b.) — nikdy jako aktuální data.",
  rpsn:
    "RPSN zobrazíme, jen když je ve zdroji uvedené. Jinak „Na vyžádání“ — RPSN si nevymýšlíme.",
  ltv:
    "Limity LTV a DTI vycházejí z makroobezřetnostních doporučení ČNB (ověřeno). Orientační prahy DSTI v nástrojích jsou model bankovní praxe, ne plošný limit ČNB.",
  yields:
    "Hrubé výnosy na webu a v kalkulačkách jsou modelové výchozí hodnoty pro srovnání. Nejsou živou kotací z nabídky. Čistý výnos závisí na daních, správě a obsazenosti.",
  prices:
    "Referenční ceny a cena za m² jsou orientační modelové hodnoty pro UX a srovnání — ne aktuální nabídka konkrétní nemovitosti.",
  historical:
    "Historické řady jsou editorial snapshoty (u zahraničí často ilustrativní). Vždy jako modelový výpočet, ne oficiální statistika.",
  predictions:
    "Scénáře růstu (konzervativní / střední / dynamický) jsou modelové projekce, ne předpověď budoucnosti ani investiční doporučení.",
  legal:
    "Právní a daňové přehledy zemí jsou editorial po kontrole. Nejsou individuální právní radou — před koupí ověřte lokálního právníka.",
  scoring:
    "Osobní investiční průvodce počítá organické skóre 0–100 jako vážený součet shody napříč dimenzemi (kapitál, financování, výnos, riziko, vlastnictví, likvidita, měna, regulace, horizont, účel). Placené partnerství organické skóre nemění — sponzoring musí být označen mimo žebříček.",
  general:
    "Každé důležité číslo má status (aktuální data / ověřeno / modelový výpočet / nabídka partnera / čeká na aktualizaci), zdroj a datum. Modelový výpočet nikdy nevydáváme za aktuální data.",
  updateFrequency:
    "Sazby českých bank kontrolujeme automaticky; pokud dlouho nepřijdou nová data, označíme je jako „Čeká na aktualizaci“. Nabídky partnerů a limity ČNB kontrolujeme manuálně. Modelové hodnoty zůstávají modelem — stárnutím se nestanou „aktuálními daty“.",
} as const;

/** Lidský popis zdroje podle domény — veřejné stránky. */
export const PUBLIC_DOMAIN_SOURCE: Record<DataDomain, string> = {
  rates: "Oficiální weby českých bank / ověřené agregátory",
  rpsn: "Stejný zdroj jako sazba, pokud RPSN uvádí",
  ltv: "ČNB — makroobezřetnostní rámec",
  dti_dsti: "ČNB a model bankovní praxe",
  yields: "Modelové výchozí hodnoty pro srovnání",
  prices: "Orientační referenční ceny (model)",
  historical: "Editorial historické řady / ilustrativní model",
  tax: "Editorial daňový přehled",
  legal: "Editorial právní přehled zemí",
  investment: "Modelové investiční metriky",
  banks: "Veřejné informace o bankách",
  calculator_defaults: "Výchozí hodnoty kalkulaček (model)",
};

export function publicFreshnessHint(status: DataStatus): string {
  switch (status) {
    case "LIVE":
      return "Kontrola: pravidelně (řádově dny). Po delší neaktualizaci → „Čeká na aktualizaci“.";
    case "VERIFIED":
      return "Kontrola: manuální revize (řádově měsíce).";
    case "PARTNER_QUOTE":
      return "Kontrola: manuálně (řádově dny až týdny).";
    case "MODELLED":
      return "Zůstává modelovým výpočtem — nepřepíná se na aktuální data stárnutím.";
    case "STALE":
      return "Doplňujeme ze zdroje; mezitím neinventujeme čísla.";
    default:
      return "";
  }
}
