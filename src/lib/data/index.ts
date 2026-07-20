/**
 * Source of Truth — veřejné API datové vrstvy HypotékaJasně.cz.
 *
 * Pravidla:
 * - Žádné vymyšlené hodnoty (value = null → UI „Na vyžádání“ / „Data ověřujeme“).
 * - Katalog (DATA_CATALOG) mapuje domény → kanonické moduly.
 * - Legacy numerické konstanty zůstávají v původních modulech do postupné migrace.
 */

export type {
  DataCatalogEntry,
  DataCountryCode,
  DataDomain,
  DataRecord,
  DataSourceType,
  DataStatus,
  DataUnit,
} from "@/lib/data/types";

export {
  DATA_CATALOG,
  getCatalogByDomain,
  getCatalogEntry,
} from "@/lib/data/catalog";

export {
  formatDataValue,
  isMissingData,
  missingDataLabel,
  statusBadgeLabel,
  statusDescription,
} from "@/lib/data/display";

export { makeDataRecord, missingDataRecord } from "@/lib/data/records";

export {
  FRESHNESS_THRESHOLD_MS,
  formatAgeLabel,
  formatCzechDate,
  formatCzechDateTime,
  getFreshnessReferenceAt,
  resolveEffectiveStatus,
  withEffectiveStatus,
} from "@/lib/data/freshness";

export {
  getCountryProvenance,
  METHODOLOGY_BLURBS,
  toProvenanceFields,
  type CountryProvenanceItem,
  type MethodologyTopic,
  type ProvenanceFields,
} from "@/lib/data/provenance";

export {
  PUBLIC_DOMAIN_SOURCE,
  PUBLIC_METHODOLOGY_BLURBS,
  PUBLIC_STATUS_MEANINGS,
  publicFreshnessHint,
} from "@/lib/data/public-methodology";

export { REGULATORY_RECORDS } from "@/lib/data/static-regulatory";

export {
  getDefaultPriceRecord,
  getDefaultRateRecord,
  getDefaultYieldRecord,
  MARKET_DEFAULT_COUNTRIES,
} from "@/lib/data/static-market";

export {
  bankRateRowToRecords,
  marketAggregateToRecords,
} from "@/lib/data/live-rates";

export {
  KB_INSIDER_RATES,
  ORIENTATIONAL_WITHOUT_SURCHARGE,
} from "@/lib/scrape/rate-policy";
