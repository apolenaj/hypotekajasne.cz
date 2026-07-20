/**
 * Provenance metadata pro domény — texty metodiky / omezení.
 */

import type { CountryId } from "@/lib/calculators";
import type { DataRecord, DataStatus } from "@/lib/data/types";
import { makeDataRecord } from "@/lib/data/records";

export type ProvenanceFields = Pick<
  DataRecord,
  | "id"
  | "source"
  | "sourceUrl"
  | "sourceType"
  | "status"
  | "confidence"
  | "lastFetchedAt"
  | "lastVerifiedAt"
  | "validFrom"
  | "notes"
  | "unit"
  | "country"
  | "value"
>;

export type MethodologyTopic =
  | "rates"
  | "rpsn"
  | "ltv"
  | "yields"
  | "prices"
  | "historical"
  | "predictions"
  | "legal"
  | "scoring"
  | "general";

export const METHODOLOGY_BLURBS: Record<MethodologyTopic, string> = {
  rates:
    "CZ sazby stahujeme scraperem z oficiálních webů bank / agregátorů do Supabase (bank_rates, current_rates). Cron běží pravidelně. Chybějící sazba bez pojištění se u většiny bank doplňuje orientačně (+0,3 p.b.) a musí být označená jako MODEL — nikdy jako LIVE.",
  rpsn:
    "RPSN bereme ze stejného zdroje jako sazbu, pokud je ve zdroji uvedené. Pokud chybí, zobrazíme „Na vyžádání“ — RPSN si nevymýšlíme.",
  ltv:
    "Limity LTV / DTI vycházejí z makroobezřetnostních doporučení ČNB (VERIFIED). UI prahy DSTI (~40–45 %) jsou interní model bankovní praxe, ne plošný limit ČNB.",
  yields:
    "Hrubé výnosy na homepage a v kalkulačkách jsou MODELLED defaulty (countryConfigs / market-metrics). Nejsou live kotace z nabídky. Skutečný čistý výnos závisí na daních, správě a obsazenosti.",
  prices:
    "Referenční ceny a €/m² jsou orientační MODELLED hodnoty pro UX a srovnání. Nejde o aktuální tržní nabídku konkrétní nemovitosti.",
  historical:
    "Historické řady ČR jsou editorial snapshoty s interpolací. Zahraniční historie je často škálovaná z ČR — vždy MODELLED, ne oficiální statistika.",
  predictions:
    "Scénáře růstu (konzervativní / střední / dynamický) jsou modelové projekce, ne predikce budoucnosti. Nejde o investiční doporučení.",
  legal:
    "Právní a daňové informace zemí jsou editorial (VERIFIED po kontrole). Nejsou individuální právní radou — před koupí ověřte lokálního právníka.",
  scoring:
    "Market matching (Osobní investiční průvodce) počítá organické Overall Match 0–100 jako vážený součet fitů napříč 10 dimenzemi: required capital, financing availability, target yield, volatility/risk, ownership security, liquidity, currency risk, regulation, investment horizon, intended use. Fit = 100 − |atribut trhu − ideál z formuláře|. Váhy jsou veřejné na /metodika. Placené partnerství organické skóre nemění — sponzoring musí být explicitně označen mimo ranking.",
  general:
    "HypotékaJasně je datová platforma: každé důležité číslo má status (LIVE / VERIFIED / MODEL / PARTNER QUOTE / STALE), zdroj a datum. MODEL nikdy nevydáváme za LIVE.",
};

export type CountryProvenanceItem = {
  label: string;
  domain: MethodologyTopic;
  status: DataStatus;
  source: string;
  lastVerifiedAt: string | null;
  notes: string;
};

/** Sekce „Zdroje, metodika a datum kontroly“ na country page. */
export function getCountryProvenance(
  countryId: CountryId
): CountryProvenanceItem[] {
  const isCz = countryId === "cz";
  return [
    {
      label: "Hypoteční sazby",
      domain: "rates",
      status: isCz ? "LIVE" : "MODELLED",
      source: isCz
        ? "Supabase bank_rates / current_rates (scraper 6 bank)"
        : "Interní modelové defaulty (countryConfigs) — bez live bankovního lístku",
      lastVerifiedAt: isCz ? null : "2026-04-01",
      notes: isCz
        ? "Čerstvost: threshold 48 h od lastFetchedAt → STALE."
        : "Pro cizí trhy zobrazujeme MODEL, ne LIVE nabídku banky.",
    },
    {
      label: "RPSN",
      domain: "rpsn",
      status: isCz ? "LIVE" : "STALE",
      source: isCz
        ? "Scraper / oficiální příklad banky (nullable)"
        : "Není k dispozici — Na vyžádání",
      lastVerifiedAt: null,
      notes: "Null RPSN se nikdy nedoplňuje fiktivním offsetem.",
    },
    {
      label: "LTV / DTI limity",
      domain: "ltv",
      status: isCz ? "VERIFIED" : "MODELLED",
      source: isCz
        ? "ČNB makroobezřetnostní doporučení"
        : "Obecný popis trhu (editorial) — ověřte lokální limity",
      lastVerifiedAt: "2026-04-01",
      notes: isCz
        ? "Platnost textů od 1. 4. 2026."
        : "Zahraniční LTV se liší podle banky a rezidence.",
    },
    {
      label: "Tržní ceny / výnosy",
      domain: "yields",
      status: "MODELLED",
      source: "countryConfigs + market-metrics (orientační)",
      lastVerifiedAt: "2026-04-01",
      notes: "Orientační pásma pro srovnání, ne nabídka nemovitosti.",
    },
    {
      label: "Historie a predikce",
      domain: "historical",
      status: "MODELLED",
      source: "historical-data.ts / prediction-configs.ts",
      lastVerifiedAt: "2026-04-01",
      notes: "Ilustrativní model — ne oficiální prognóza.",
    },
    {
      label: "Právní / daňový přehled",
      domain: "legal",
      status: "VERIFIED",
      source: "Editorial country-info / country-detail",
      lastVerifiedAt: "2026-04-01",
      notes: "Není individuální právní rada.",
    },
  ];
}

/** Helper: minimální ProvenanceFields z částečného záznamu. */
export function toProvenanceFields(
  partial: Partial<DataRecord> &
    Pick<DataRecord, "id" | "source" | "status">
): ProvenanceFields {
  return makeDataRecord({
    id: partial.id,
    value: partial.value ?? null,
    unit: partial.unit ?? "other",
    country: partial.country ?? null,
    source: partial.source,
    sourceUrl: partial.sourceUrl ?? null,
    sourceType: partial.sourceType ?? "unknown",
    status: partial.status,
    confidence: partial.confidence ?? 0.5,
    notes: partial.notes ?? null,
    validFrom: partial.validFrom ?? null,
    lastFetchedAt: partial.lastFetchedAt ?? null,
    lastVerifiedAt: partial.lastVerifiedAt ?? null,
  });
}
