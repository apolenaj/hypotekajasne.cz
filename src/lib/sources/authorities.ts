/**
 * Registr autoritativních externích zdrojů (veřejná stránka /zdroje).
 * Interní cesty a DB tabulky sem nepatří.
 */

import type { AuthoritySource } from "@/lib/sources/types";

const CHECKED = "2026-07-20";

export const AUTHORITY_REGISTRY: AuthoritySource[] = [
  {
    id: "cz-cnb",
    title: "Česká národní banka — finanční stabilita",
    organization: "Česká národní banka (ČNB)",
    kind: "central_bank",
    url: "https://www.cnb.cz/cs/financni-stabilita/",
    jurisdiction: "cz",
    topics: ["macroprudential", "ltv_dti_dsti", "rates", "consumer_credit"],
    description:
      "Centrální banka a makroobezřetnostní rámec (doporučení LTV/DTI pro hypotéky).",
    lastCheckedAt: CHECKED,
  },
  {
    id: "cz-cnb-macroprudential",
    title: "Makroobezřetnostní politika ČNB",
    organization: "Česká národní banka (ČNB)",
    kind: "central_bank",
    url: "https://www.cnb.cz/cs/financni-stabilita/makroobezretnostni-politika/",
    jurisdiction: "cz",
    topics: ["macroprudential", "ltv_dti_dsti"],
    description:
      "Oficiální stránka makroobezřetnostní politiky včetně doporučení k hypotečním úvěrům.",
    lastCheckedAt: CHECKED,
  },
  {
    id: "cz-mfcr",
    title: "Ministerstvo financí ČR",
    organization: "Ministerstvo financí ČR",
    kind: "ministry",
    url: "https://www.mfcr.cz/",
    jurisdiction: "cz",
    topics: ["tax", "legal_ownership", "general"],
    description: "Daňová a rozpočtová politika; rámec pro daň z nemovitých věcí a související předpisy.",
    lastCheckedAt: CHECKED,
  },
  {
    id: "cz-financnisprava",
    title: "Finanční správa ČR",
    organization: "Finanční správa České republiky",
    kind: "tax_authority",
    url: "https://www.financnisprava.cz/",
    jurisdiction: "cz",
    topics: ["tax"],
    description: "Daňová správa — výklady a formuláře k daním z příjmů a nemovitostí.",
    lastCheckedAt: CHECKED,
  },
  {
    id: "cz-cuzk",
    title: "Český úřad zeměměřický a katastrální",
    organization: "ČÚZK",
    kind: "land_authority",
    url: "https://www.cuzk.cz/",
    jurisdiction: "cz",
    topics: ["cadastre", "legal_ownership"],
    description: "Katastr nemovitostí — zápis vlastnictví a veřejné nahlížení.",
    lastCheckedAt: CHECKED,
  },
  {
    id: "cz-czso",
    title: "Český statistický úřad",
    organization: "ČSÚ",
    kind: "official_statistics",
    url: "https://www.czso.cz/",
    jurisdiction: "cz",
    topics: ["statistics"],
    description: "Oficiální statistika — ceny, bydlení, makroekonomické ukazatele.",
    lastCheckedAt: CHECKED,
  },
  {
    id: "cz-cnb-arad",
    title: "ARAD — časové řady ČNB",
    organization: "Česká národní banka (ČNB)",
    kind: "official_statistics",
    url: "https://www.cnb.cz/cnb/STAT.ARADY_PKG.STROM_SESTAVY?p_strid=AAABA&p_lang=CS",
    jurisdiction: "cz",
    topics: ["rates", "statistics"],
    description: "Veřejné statistické řady včetně úrokových sazeb (agregáty).",
    lastCheckedAt: CHECKED,
  },
  {
    id: "eu-ecb",
    title: "European Central Bank",
    organization: "European Central Bank (ECB)",
    kind: "central_bank",
    url: "https://www.ecb.europa.eu/",
    jurisdiction: "eu",
    topics: ["rates", "macroprudential", "fx"],
    description: "Měnová politika eurozóny a související makro data.",
    lastCheckedAt: CHECKED,
  },
  {
    id: "es-bde",
    title: "Banco de España",
    organization: "Banco de España",
    kind: "central_bank",
    url: "https://www.bde.es/",
    jurisdiction: "spain",
    topics: ["rates", "macroprudential", "consumer_credit"],
    description: "Španělská centrální banka — regulace a statistiky úvěrů.",
    lastCheckedAt: CHECKED,
  },
  {
    id: "it-bancaditalia",
    title: "Banca d'Italia",
    organization: "Banca d'Italia",
    kind: "central_bank",
    url: "https://www.bancaditalia.it/",
    jurisdiction: "italy",
    topics: ["rates", "macroprudential", "consumer_credit"],
    description: "Italská centrální banka — dohled a statistiky.",
    lastCheckedAt: CHECKED,
  },
  {
    id: "hr-hnb",
    title: "Hrvatska narodna banka",
    organization: "Hrvatska narodna banka (HNB)",
    kind: "central_bank",
    url: "https://www.hnb.hr/",
    jurisdiction: "croatia",
    topics: ["rates", "macroprudential", "fx"],
    description: "Chorvatská národní banka.",
    lastCheckedAt: CHECKED,
  },
  {
    id: "ae-cbuae",
    title: "Central Bank of the UAE",
    organization: "Central Bank of the UAE",
    kind: "central_bank",
    url: "https://www.centralbank.ae/",
    jurisdiction: "dubai",
    topics: ["rates", "macroprudential", "consumer_credit"],
    description: "Centrální banka SAE — rámec pro úvěry a finanční stabilitu.",
    lastCheckedAt: CHECKED,
  },
  {
    id: "ae-dubai-land",
    title: "Dubai Land Department",
    organization: "Dubai Land Department (DLD)",
    kind: "land_authority",
    url: "https://dubailand.gov.ae/",
    jurisdiction: "dubai",
    topics: ["cadastre", "legal_ownership", "statistics"],
    description: "Katastrální a realitní autorita Dubaje (vlastnictví, transakce).",
    lastCheckedAt: CHECKED,
  },
  {
    id: "sa-sama",
    title: "Saudi Central Bank (SAMA)",
    organization: "Saudi Central Bank",
    kind: "central_bank",
    url: "https://www.sama.gov.sa/",
    jurisdiction: "saudi",
    topics: ["rates", "macroprudential", "consumer_credit"],
    description: "Centrální banka Saúdské Arábie.",
    lastCheckedAt: CHECKED,
  },
  {
    id: "sa-rega",
    title: "Real Estate General Authority (REGA)",
    organization: "REGA — Saúdská Arábie",
    kind: "regulator",
    url: "https://rega.gov.sa/",
    jurisdiction: "saudi",
    topics: ["legal_ownership", "cadastre"],
    description: "Regulátor realitního trhu v Saúdské Arábii.",
    lastCheckedAt: CHECKED,
  },
  {
    id: "id-bi",
    title: "Bank Indonesia",
    organization: "Bank Indonesia",
    kind: "central_bank",
    url: "https://www.bi.go.id/",
    jurisdiction: "bali",
    topics: ["rates", "fx", "macroprudential"],
    description: "Indonéská centrální banka (Bali / IDN rámec).",
    lastCheckedAt: CHECKED,
  },
  {
    id: "sk-nbs",
    title: "Národná banka Slovenska",
    organization: "Národná banka Slovenska (NBS)",
    kind: "central_bank",
    url: "https://nbs.sk/",
    jurisdiction: "slovakia",
    topics: ["rates", "macroprudential", "consumer_credit"],
    description: "Slovenská centrální banka.",
    lastCheckedAt: CHECKED,
  },
];

export function getAuthorityById(id: string): AuthoritySource | undefined {
  return AUTHORITY_REGISTRY.find((a) => a.id === id);
}

export function listAuthorities(filters?: {
  jurisdiction?: string | null;
  topic?: string | null;
  kind?: string | null;
}): AuthoritySource[] {
  const j = filters?.jurisdiction?.toLowerCase() || null;
  const topic = filters?.topic || null;
  const kind = filters?.kind || null;
  return AUTHORITY_REGISTRY.filter((a) => {
    if (j && j !== "all" && a.jurisdiction !== j && a.jurisdiction !== "multi") {
      return false;
    }
    if (topic && topic !== "all" && !a.topics.includes(topic as never)) {
      return false;
    }
    if (kind && kind !== "all" && a.kind !== kind) return false;
    return true;
  });
}
