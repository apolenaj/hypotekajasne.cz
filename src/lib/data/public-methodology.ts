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
    label: "Aktuální data (LIVE)",
    description:
      "Údaj právě načtený z definovaného živého zdroje (např. sazby z webů bank). Stále nejde o závaznou nabídku — banka schvaluje individuálně.",
  },
  VERIFIED: {
    label: "Ověřeno (VERIFIED)",
    description:
      "Ověřeno proti primárnímu nebo autoritativnímu externímu zdroji (regulátor, centrální banka, katastr, daňová správa). Interní soubor nebo databázová tabulka sama o sobě není důkazem.",
  },
  MODEL: {
    label: "Model (MODEL)",
    description:
      "Výsledek modelu nebo kalkulace založené na explicitních předpokladech. Není živá kotace banky ani nabídka konkrétní nemovitosti.",
  },
  ESTIMATE: {
    label: "Odhad (ESTIMATE)",
    description:
      "Odborný nebo datový odhad s nižší jistotou. Užitečný pro orientaci, ne jako oficiální údaj.",
  },
  UNVERIFIED: {
    label: "Neověřeno (UNVERIFIED)",
    description:
      "Informace, kterou nemáme dostatečně podloženou externí autoritou. Zobrazujeme ji jen s jasným varováním — nebo vůbec.",
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
    "Limity LTV a DTI vycházejí z makroobezřetnostních doporučení ČNB (ověřeno proti oficiální stránce ČNB). Orientační prahy DSTI v nástrojích jsou model bankovní praxe, ne plošný limit ČNB.",
  yields:
    "Hrubé výnosy na webu a v kalkulačkách jsou modelové výchozí hodnoty pro srovnání. Nejsou živou kotací z nabídky. Čistý výnos závisí na daních, správě a obsazenosti.",
  prices:
    "Referenční ceny a cena za m² jsou orientační modelové hodnoty pro UX a srovnání — ne aktuální nabídka konkrétní nemovitosti.",
  historical:
    "Historické řady jsou editorial snapshoty (u zahraničí často ilustrativní). Vždy jako modelový výpočet, ne oficiální statistika.",
  predictions:
    "Scénáře růstu (konzervativní / střední / dynamický) jsou modelové projekce, ne předpověď budoucnosti ani investiční doporučení.",
  legal:
    "Právní a daňové přehledy zemí označíme jako Ověřeno jen tehdy, když máme odkaz na autoritu. Jinak Odhad nebo Neověřeno. Nejsou individuální právní radou.",
  scoring:
    "Osobní investiční průvodce počítá organické skóre 0–100 jako vážený součet shody napříč dimenzemi (kapitál, financování, výnos, riziko, vlastnictví, likvidita, měna, regulace, horizont, účel). Placené partnerství organické skóre nemění — sponzoring musí být označen mimo žebříček.",
  general:
    "Každé důležité číslo má status (LIVE / Ověřeno / Model / Odhad / Neověřeno), veřejný zdroj a datum. Interní soubor není důkazem. Model nikdy nevydáváme za aktuální data.",
  updateFrequency:
    "Sazby českých bank kontrolujeme automaticky; pokud dlouho nepřijdou nová data, označíme je jako „Čeká na aktualizaci“. Limity ČNB kontrolujeme manuálně proti oficiální stránce. Modelové hodnoty zůstávají modelem — stárnutím se nestanou „aktuálními daty“.",
  qualityGuide:
    "Jak poznat kvalitu údaje: LIVE = právě ze živého zdroje; Ověřeno = proti autoritě (ČNB, ministerstvo, katastr…); Model = kalkulace z předpokladů; Odhad = nižší jistota; Neověřeno = chybí podklad. Partner a „čeká na aktualizaci“ jsou provozní stavy.",
} as const;

/** Lidský popis zdroje podle domény — veřejné stránky. */
export const PUBLIC_DOMAIN_SOURCE: Record<DataDomain, string> = {
  rates: "Oficiální weby českých bank / ověřené agregátory",
  rpsn: "Stejný zdroj jako sazba, pokud RPSN uvádí",
  ltv: "ČNB — makroobezřetnostní rámec",
  dti_dsti: "ČNB a model bankovní praxe",
  yields: "Modelové výchozí hodnoty pro srovnání",
  prices: "Orientační referenční ceny (model)",
  historical: "Historické řady / ilustrativní model",
  tax: "Daňová správa / MF — pokud je odkaz; jinak odhad",
  legal: "Autoritativní právní / katastrální zdroj, pokud je k dispozici",
  investment: "Modelové investiční metriky",
  banks: "Veřejné informace o bankách",
  calculator_defaults: "Výchozí hodnoty kalkulaček (model)",
};

export function publicFreshnessHint(status: DataStatus): string {
  switch (status) {
    case "LIVE":
      return "Kontrola: pravidelně (řádově dny). Po delší neaktualizaci → „Čeká na aktualizaci“.";
    case "VERIFIED":
      return "Kontrola: manuální revize proti externí autoritě (řádově měsíce).";
    case "PARTNER_QUOTE":
      return "Kontrola: manuálně (řádově dny až týdny).";
    case "MODEL":
      return "Zůstává modelem — nepřepíná se na aktuální data stárnutím.";
    case "ESTIMATE":
      return "Odhad zůstává odhadem — bez externí autority se nestane Ověřeno.";
    case "UNVERIFIED":
      return "Doplňujeme podklad; mezitím neinventujeme jistotu.";
    case "STALE":
      return "Doplňujeme ze zdroje; mezitím neinventujeme čísla.";
    default:
      return "";
  }
}
