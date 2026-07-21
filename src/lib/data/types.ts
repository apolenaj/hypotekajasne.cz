/**
 * Jednotný Source of Truth — schema dynamických údajů.
 * Nikdy nevymýšlej chybějící value: null + status STALE / chybějící → UI „Na vyžádání“ / „Data ověřujeme“.
 *
 * Statusy důvěryhodnosti (veřejné):
 * LIVE | VERIFIED | MODEL | ESTIMATE | UNVERIFIED
 * Operační: PARTNER_QUOTE | STALE
 *
 * Interní soubor / tabulka NENÍ důkaz správnosti — viz ExternalProvenance.
 */

export type DataStatus =
  | "LIVE"
  | "VERIFIED"
  | "MODEL"
  | "ESTIMATE"
  | "UNVERIFIED"
  | "PARTNER_QUOTE"
  | "STALE";

/** Typ zdroje (odkud údaj pochází), oddělený od důvěryhodnostního statusu. */
export type DataSourceType =
  | "official_bank"
  | "aggregator"
  | "supabase"
  | "cnb"
  | "editorial"
  | "model"
  | "insider"
  | "partner"
  | "unknown";

export type DataUnit =
  | "percent"
  | "percent_pa"
  | "ratio"
  | "czk"
  | "eur"
  | "usd"
  | "aed"
  | "sar"
  | "years"
  | "months"
  | "index"
  | "score"
  | "text"
  | "boolean"
  | "ltv_percent"
  | "other";

export type DataCountryCode =
  | "cz"
  | "dubai"
  | "spain"
  | "italy"
  | "croatia"
  | "bali"
  | "saudi"
  | "slovakia"
  | "multi"
  | null;

/**
 * Externí provenance pro VERIFIED (a doporučeně i LIVE).
 * Nikdy sem nedávej cestu k internímu souboru ani název Supabase tabulky.
 */
export type ExternalProvenance = {
  title: string;
  organization: string;
  url: string | null;
  reference: string | null;
  jurisdiction: string;
  publishedOrEffectiveAt: string | null;
  lastCheckedAt: string;
  reviewedBy: string | null;
  reviewMethod: string | null;
};

/**
 * Každý dynamický údaj v aplikaci — jednotný kontrakt.
 * value = null znamená „nemáme ověřená data“ (nezobrazovat 0 ani vymyšlené číslo).
 */
export type DataRecord<T = number | string | boolean | null> = {
  /** Stabilní klíč v katalogu (např. rate.cz.market.with_insurance). */
  id: string;
  value: T;
  unit: DataUnit;
  country: DataCountryCode;
  /** Veřejný popis zdroje (organizace / dokument) — ne interní cesta. */
  source: string;
  sourceUrl: string | null;
  sourceType: DataSourceType;
  validFrom: string | null;
  lastFetchedAt: string | null;
  lastVerifiedAt: string | null;
  status: DataStatus;
  /** 0–1; u MODEL/ESTIMATE typicky ≤ 0.6 */
  confidence: number;
  notes: string | null;
  /**
   * Externí provenance — povinné pro status VERIFIED.
   * Musí odkazovat na autoritu (URL nebo reference), ne na interní storage.
   */
  provenance: ExternalProvenance | null;
  /**
   * Interní audit (soubor / tabulka) — pouze pro vývojáře.
   * Nikdy nezobrazovat jako veřejný „zdroj“.
   */
  internalStorageRef: string | null;
};

export type DataDomain =
  | "rates"
  | "rpsn"
  | "ltv"
  | "dti_dsti"
  | "yields"
  | "prices"
  | "historical"
  | "tax"
  | "legal"
  | "investment"
  | "banks"
  | "calculator_defaults";

export type DataCatalogEntry = {
  id: string;
  domain: DataDomain;
  label: string;
  /** Kde se v kódu dnes bere / používá */
  usedIn: string[];
  /** Primární modul se zdrojem pravdy (po migraci) */
  canonicalModule: string;
  /** Popis původu před sjednocením */
  legacyOrigin: string;
  defaultStatus: DataStatus;
  unit: DataUnit;
  country: DataCountryCode;
};
