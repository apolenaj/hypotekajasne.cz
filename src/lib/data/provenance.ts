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
  | "provenance"
  | "internalStorageRef"
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
    "Každé důležité číslo má status (aktuální data / ověřeno / model / odhad / neověřeno), veřejný zdroj a datum. Interní soubor není důkazem. Model nikdy nevydáváme za aktuální data.",
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
      status: isCz ? "LIVE" : "MODEL",
      source: isCz
        ? "Oficiální weby českých bank"
        : "Modelové výchozí hodnoty — bez živého bankovního lístku",
      lastVerifiedAt: isCz ? null : "2026-04-01",
      notes: isCz
        ? "Při delší neaktualizaci označíme jako „Čeká na aktualizaci“."
        : "Pro cizí trhy zobrazujeme modelový výpočet, ne živou nabídku banky.",
    },
    {
      label: "RPSN",
      domain: "rpsn",
      status: isCz ? "LIVE" : "STALE",
      source: isCz
        ? "Oficiální podklady banky (pokud uvádí RPSN)"
        : "Není k dispozici — Na vyžádání",
      lastVerifiedAt: null,
      notes: "Chybějící RPSN nikdy nedoplňujeme fiktivním číslem.",
    },
    {
      label: "LTV / DTI limity",
      domain: "ltv",
      status: isCz ? "VERIFIED" : "MODEL",
      source: isCz
        ? "ČNB — makroobezřetnostní doporučení"
        : "Obecný popis trhu (editorial) — ověřte lokální limity",
      lastVerifiedAt: "2026-04-01",
      notes: isCz
        ? "Platnost textů od 1. 4. 2026."
        : "Zahraniční LTV se liší podle banky a rezidence.",
    },
    {
      label: "Tržní ceny / výnosy",
      domain: "yields",
      status: "MODEL",
      source: "Orientační modelová pásma pro srovnání",
      lastVerifiedAt: "2026-04-01",
      notes: "Nejde o nabídku konkrétní nemovitosti.",
    },
    {
      label: "Historie a predikce",
      domain: "historical",
      status: "MODEL",
      source: "Ilustrativní model / editorial",
      lastVerifiedAt: "2026-04-01",
      notes: "Nejde o oficiální prognózu.",
    },
    {
      label: "Právní / daňový přehled",
      domain: "legal",
      status: isCz ? "ESTIMATE" : "UNVERIFIED",
      source: isCz
        ? "Editorial přehled — ověřte ČÚZK / MF / Finanční správu"
        : "Orientační přehled bez plné externí provenance",
      lastVerifiedAt: "2026-04-01",
      notes: isCz
        ? "Bez individuální právní rady. Ověřené limity ČNB viz LTV/DTI."
        : "Chybí dostatečná externí provenance → Neověřeno / Odhad.",
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
    provenance: partial.provenance ?? null,
    internalStorageRef: partial.internalStorageRef ?? null,
  });
}
