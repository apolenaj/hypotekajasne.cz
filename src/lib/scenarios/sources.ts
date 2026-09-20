import { routes } from "@/lib/routes";

export const SCENARIO_SOURCE_CHECKED_AT = "2026-09-20";

export type ScenarioSource = {
  label: string;
  url: string;
  checkedAt: string;
  note?: string;
};

export const SCENARIO_SOURCES = {
  cnbInvestmentLimits: {
    label:
      "ČNB — doporučení přísnějších limitů pro investiční hypotéky (27. 11. 2025)",
    url: "https://www.cnb.cz/cs/cnb-news/tiskove-zpravy/CNB-doporucuje-prisnejsi-limity-pro-investicni-hypoteky.-Kapitalove-rezervy-se-nemeni/",
    checkedAt: SCENARIO_SOURCE_CHECKED_AT,
    note:
      "Doporučení LTV 70 % a DTI 7 u investičních hypoték od 1. 4. 2026. Investiční hypotéka = třetí a další obytná nemovitost nebo nemovitost určená k pronájmu. Nejde o automatický přenos na právnické osoby.",
  },
  kbConstruction: {
    label: "Komerční banka — Hypotéka na stavbu domu",
    url: "https://www.kb.cz/cs/clanky/hypoteky/hypoteka-na-stavbu-domu",
    checkedAt: SCENARIO_SOURCE_CHECKED_AT,
    note:
      "Popisuje zálohové čerpání dle rozpočtu a harmonogramu, potřebu projektu a povolení. Konkrétní režim vždy stanoví smlouva.",
  },
  kbDeveloper: {
    label: "Komerční banka — Hypotéka na novostavbu od developera",
    url: "https://www.kb.cz/cs/obcane/pujcky/hypoteky/hypoteka/hypoteka-na-novostavbu-od-developera",
    checkedAt: SCENARIO_SOURCE_CHECKED_AT,
  },
  kbCorporateRe: {
    label: "Komerční banka — Financování nemovitostí (korporátní)",
    url: "https://www.kb.cz/cs/korporace-a-instituce/uvery-a-financovani/investicni-financovani/financovani-nemovitosti",
    checkedAt: SCENARIO_SOURCE_CHECKED_AT,
    note:
      "Firemní financování nemovitostí; sazba a struktura se stanovují individuálně.",
  },
  csasConstruction: {
    label: "Česká spořitelna — Jak postupovat při výstavbě",
    url: "https://www.csas.cz/cs/caste-dotazy/jak-postupovat-pri-vystavbe",
    checkedAt: SCENARIO_SOURCE_CHECKED_AT,
  },
  rbHypoteky: {
    label: "Raiffeisenbank — Hypotéky",
    url: "https://www.rb.cz/osobni/hypoteky",
    checkedAt: SCENARIO_SOURCE_CHECKED_AT,
    note: "Veřejný produktový přehled; metodiku firemního úvěru neuvádí jako univerzální sazebník.",
  },
} as const satisfies Record<string, ScenarioSource>;

export const scenarioRoutes = {
  companyTopic: `${routes.temata}/hypoteka-na-firmu`,
  companyCalc: routes.kalkulacky.hypotekaNaFirmu,
  rentTopic: `${routes.temata}/budouci-prijem-z-najmu`,
  rentCalc: routes.kalkulacky.budouciPrijemZNajmu,
  constructionTopic: `${routes.temata}/hypoteka-na-vystavbu`,
  constructionCalc: routes.kalkulacky.vystavba,
} as const;
